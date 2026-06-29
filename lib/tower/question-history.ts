/**
 * Tracks recently used Tower questions in localStorage so the arena avoids
 * repeating the same item within a room, floor, or recent tower-wide history
 * when alternatives exist. Pure client persistence; never touches the learning model.
 */

import type { PracticeQuestion } from "@/lib/ai/validators";
import type { ConceptTag } from "@/lib/learning/concepts";
import type { ChallengeKind, LocalChallenge } from "@/lib/tower/challenges";

export const TOWER_QUESTION_HISTORY_KEY = "bq-tower-question-history-v1";

/** How many cross-floor entries to remember when filtering. */
const RECENT_WINDOW = 40;

interface QuestionHistory {
  version: 1;
  /** Question ids used on each floor (current climb). */
  byFloor: Record<number, string[]>;
  /** Normalized prompts used on each floor. */
  promptsByFloor: Record<number, string[]>;
  /** Question ids used in each room (floor-chamber). */
  byRoom: Record<string, string[]>;
  /** Normalized prompts used in each room. */
  promptsByRoom: Record<string, string[]>;
  /** Newest-first ids across recent floors. */
  recent: string[];
  /** Newest-first normalized prompts across recent floors. */
  recentPrompts: string[];
}

function emptyHistory(): QuestionHistory {
  return {
    version: 1,
    byFloor: {},
    promptsByFloor: {},
    byRoom: {},
    promptsByRoom: {},
    recent: [],
    recentPrompts: [],
  };
}

function readHistory(): QuestionHistory {
  if (typeof window === "undefined") return emptyHistory();
  try {
    const raw = window.localStorage.getItem(TOWER_QUESTION_HISTORY_KEY);
    if (!raw) return emptyHistory();
    const parsed = JSON.parse(raw) as QuestionHistory;
    if (!parsed || parsed.version !== 1) return emptyHistory();
    return {
      version: 1,
      byFloor: parsed.byFloor ?? {},
      promptsByFloor: parsed.promptsByFloor ?? {},
      byRoom: parsed.byRoom ?? {},
      promptsByRoom: parsed.promptsByRoom ?? {},
      recent: Array.isArray(parsed.recent) ? parsed.recent : [],
      recentPrompts: Array.isArray(parsed.recentPrompts) ? parsed.recentPrompts : [],
    };
  } catch {
    return emptyHistory();
  }
}

function writeHistory(history: QuestionHistory): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(TOWER_QUESTION_HISTORY_KEY, JSON.stringify(history));
  } catch {
    // quota / privacy mode; tower still works without dedup
  }
}

function roomKey(floor: number, chamber: number): string {
  return `${floor}-${chamber}`;
}

/** Collapse whitespace and case for prompt comparison. */
export function normalizePrompt(prompt: string): string {
  return prompt.trim().replace(/\s+/g, " ").toLowerCase();
}

/** Alias used by Tower generation call sites. */
export const normalizeQuestionText = normalizePrompt;

/** Stable id for an MCQ (AI or retrieval bank). */
export function questionIdForMcq(question: PracticeQuestion): string {
  return question.questionId ?? `mcq:${question.conceptTag}:${question.prompt.trim()}`;
}

/** Stable id for a hand-written local challenge. */
export function questionIdForLocal(challenge: LocalChallenge, tag: ConceptTag, kind: ChallengeKind): string {
  return `local:${tag}:${kind}:${challenge.prompt.trim()}`;
}

/** Ids already used on this floor. */
export function idsUsedOnFloor(floor: number): Set<string> {
  const history = readHistory();
  return new Set(history.byFloor[floor] ?? []);
}

/** Prompts already used on this floor. */
export function promptsUsedOnFloor(floor: number): Set<string> {
  const history = readHistory();
  return new Set(history.promptsByFloor[floor] ?? []);
}

/** Ids already used in this room. */
export function idsUsedInRoom(floor: number, chamber: number): Set<string> {
  const history = readHistory();
  return new Set(history.byRoom[roomKey(floor, chamber)] ?? []);
}

/** Prompts already used in this room. */
export function promptsUsedInRoom(floor: number, chamber: number): Set<string> {
  const history = readHistory();
  return new Set(history.promptsByRoom[roomKey(floor, chamber)] ?? []);
}

/** Ids to exclude when picking the next question (room + floor + recent cross-floor). */
export function excludeIdsForSelection(floor: number, chamber?: number): Set<string> {
  const combined = new Set(idsUsedOnFloor(floor));
  if (chamber != null) {
    for (const id of idsUsedInRoom(floor, chamber)) combined.add(id);
  }
  for (const id of recentQuestionIds()) combined.add(id);
  return combined;
}

/** Recent ids across floors (newest first). */
export function recentQuestionIds(): string[] {
  return readHistory().recent.slice(0, RECENT_WINDOW);
}

/** Recent normalized prompts across floors (newest first). */
export function recentPromptTexts(): string[] {
  return readHistory().recentPrompts.slice(0, RECENT_WINDOW);
}

/** Prompt strings for AI retry context (client-side dedup only). */
export function recentQuestionPrompts(): string[] {
  const fromStore = recentPromptTexts();
  if (fromStore.length > 0) return fromStore;
  return recentQuestionIds()
    .filter((id) => id.startsWith("mcq:"))
    .map((id) => id.replace(/^mcq:[^:]+:/, ""));
}

export function isQuestionBlocked(id: string, floor: number, chamber?: number): boolean {
  if (idsUsedOnFloor(floor).has(id)) return true;
  if (chamber != null && idsUsedInRoom(floor, chamber).has(id)) return true;
  return recentQuestionIds().includes(id);
}

export function isPromptBlocked(prompt: string, floor: number, chamber?: number): boolean {
  const normalized = normalizePrompt(prompt);
  if (!normalized) return false;
  if (promptsUsedOnFloor(floor).has(normalized)) return true;
  if (chamber != null && promptsUsedInRoom(floor, chamber).has(normalized)) return true;
  return recentPromptTexts().includes(normalized);
}

/** Record a question as used on the given floor (and optional room). */
export function recordQuestionUsed(
  floor: number,
  id: string,
  prompt?: string,
  chamber?: number
): void {
  const history = readHistory();
  const floorIds = history.byFloor[floor] ?? [];
  const nextFloorIds = floorIds.includes(id) ? floorIds : [...floorIds, id];
  const recent = [id, ...history.recent.filter((r) => r !== id)].slice(0, RECENT_WINDOW);

  const normalized = prompt ? normalizePrompt(prompt) : "";
  let promptsByFloor = history.promptsByFloor;
  let promptsByRoom = history.promptsByRoom;
  let byRoom = history.byRoom;
  let recentPrompts = history.recentPrompts;

  if (normalized) {
    const floorPrompts = history.promptsByFloor[floor] ?? [];
    const nextFloorPrompts = floorPrompts.includes(normalized) ? floorPrompts : [...floorPrompts, normalized];
    recentPrompts = [normalized, ...history.recentPrompts.filter((r) => r !== normalized)].slice(
      0,
      RECENT_WINDOW
    );
    promptsByFloor = { ...history.promptsByFloor, [floor]: nextFloorPrompts };

    if (chamber != null) {
      const key = roomKey(floor, chamber);
      const roomPrompts = history.promptsByRoom[key] ?? [];
      const nextRoomPrompts = roomPrompts.includes(normalized) ? roomPrompts : [...roomPrompts, normalized];
      promptsByRoom = { ...history.promptsByRoom, [key]: nextRoomPrompts };
    }
  }

  if (chamber != null) {
    const key = roomKey(floor, chamber);
    const roomIds = history.byRoom[key] ?? [];
    const nextRoomIds = roomIds.includes(id) ? roomIds : [...roomIds, id];
    byRoom = { ...history.byRoom, [key]: nextRoomIds };
  }

  writeHistory({
    version: 1,
    byFloor: { ...history.byFloor, [floor]: nextFloorIds },
    promptsByFloor,
    byRoom,
    promptsByRoom,
    recent,
    recentPrompts,
  });
}

/** Clear floor-specific history when resetting tower progress. */
export function clearQuestionHistory(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(TOWER_QUESTION_HISTORY_KEY);
  } catch {
    // ignore
  }
}
