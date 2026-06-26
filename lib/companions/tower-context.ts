import type { HintRequest } from "@/components/WizardHint";

const LESSON_KEY = "bq-tower-lesson";
const HINT_KEY = "bq-tower-hint";

export interface TowerLessonContext {
  lessonId: string;
  lessonTitle: string;
  savedAt: number;
}

export interface TowerHintContext extends HintRequest {
  lessonId?: string;
  savedAt: number;
}

function readJson<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function writeJson(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage full or unavailable — tower still works without context.
  }
}

/** Remember the most recently opened lesson for the tower hub. */
export function saveTowerLessonContext(lessonId: string, lessonTitle: string): void {
  writeJson(LESSON_KEY, { lessonId, lessonTitle, savedAt: Date.now() } satisfies TowerLessonContext);
}

/** Store wrong-answer context so the Hint Chamber can offer a useful nudge. */
export function saveTowerHintContext(context: HintRequest & { lessonId?: string }): void {
  writeJson(HINT_KEY, { ...context, savedAt: Date.now() } satisfies TowerHintContext);
}

export function getTowerLessonContext(): TowerLessonContext | null {
  return readJson<TowerLessonContext>(LESSON_KEY);
}

export function getTowerHintContext(): TowerHintContext | null {
  return readJson<TowerHintContext>(HINT_KEY);
}

/** Topic string for practice / lore when no explicit topic is passed. */
export function getTowerTopic(): string | null {
  const lesson = getTowerLessonContext();
  return lesson?.lessonTitle ?? null;
}
