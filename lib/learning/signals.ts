/**
 * Client-side learning signals (localStorage). These capture what the learner
 * has shown they know — correct/incorrect retrievals, hint usage, repeated
 * misconceptions — plus a lightweight spaced-review schedule per concept.
 *
 * No Firestore schema change: this is derived, local, non-sensitive data that
 * augments the existing progress record. Everything degrades gracefully when
 * storage is unavailable, and the course works with this turned off.
 */

import type { ConceptTag } from "./concepts";

const KEY = "bq-learning-signals-v1";
const DAY = 86_400_000;
const MAX_INTERVAL_DAYS = 21;

export interface MisconceptionNote {
  text: string;
  count: number;
}

export interface ConceptSignal {
  seen: number;
  correct: number;
  wrong: number;
  hints: number;
  lastResult: "correct" | "wrong" | null;
  lastSeenAt: number;
  /** Spaced-review schedule (epoch ms) and current interval in days. */
  dueAt: number;
  intervalDays: number;
  misconceptions: MisconceptionNote[];
}

type SignalState = Record<string, ConceptSignal>;

function emptySignal(): ConceptSignal {
  return {
    seen: 0,
    correct: 0,
    wrong: 0,
    hints: 0,
    lastResult: null,
    lastSeenAt: 0,
    dueAt: 0,
    intervalDays: 0,
    misconceptions: [],
  };
}

function read(): SignalState {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? (parsed as SignalState) : {};
  } catch {
    return {};
  }
}

function write(state: SignalState): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // ignore quota / availability errors
  }
}

export function getConceptSignals(): SignalState {
  return read();
}

export function getConceptSignal(tag: ConceptTag): ConceptSignal | undefined {
  return read()[tag];
}

/** Schedule rule: wrong -> soon (1 day); correct -> later (interval doubles). */
function reschedule(sig: ConceptSignal, correct: boolean, now: number): void {
  if (correct) {
    sig.intervalDays = sig.intervalDays > 0 ? Math.min(sig.intervalDays * 2, MAX_INTERVAL_DAYS) : 2;
  } else {
    sig.intervalDays = 1;
  }
  sig.dueAt = now + sig.intervalDays * DAY;
}

/** Record one graded retrieval/answer for a concept and update its review timing. */
export function recordConceptResult(
  tag: ConceptTag,
  correct: boolean,
  opts: { hints?: number; misconception?: string } = {}
): void {
  const state = read();
  const sig = state[tag] ?? emptySignal();
  const now = Date.now();

  sig.seen += 1;
  sig.lastSeenAt = now;
  sig.lastResult = correct ? "correct" : "wrong";
  if (correct) sig.correct += 1;
  else sig.wrong += 1;
  if (opts.hints) sig.hints += opts.hints;

  if (!correct && opts.misconception) {
    const text = opts.misconception.trim().slice(0, 160);
    if (text) {
      const existing = sig.misconceptions.find((m) => m.text === text);
      if (existing) existing.count += 1;
      else sig.misconceptions.push({ text, count: 1 });
      sig.misconceptions = sig.misconceptions.slice(-6);
    }
  }

  reschedule(sig, correct, now);
  state[tag] = sig;
  write(state);
}

/**
 * Mark concepts as practiced after completing a lesson (seeds the review
 * schedule without claiming mastery — completion alone is not mastery).
 */
export function recordLessonPracticed(tags: ConceptTag[]): void {
  if (tags.length === 0) return;
  const state = read();
  const now = Date.now();
  for (const tag of tags) {
    const sig = state[tag] ?? emptySignal();
    sig.seen += 1;
    sig.lastSeenAt = now;
    if (sig.dueAt === 0) {
      sig.intervalDays = 2;
      sig.dueAt = now + sig.intervalDays * DAY;
    }
    state[tag] = sig;
  }
  write(state);
}

export function isConceptDue(tag: ConceptTag, now = Date.now()): boolean {
  const sig = read()[tag];
  return !!sig && sig.dueAt > 0 && sig.dueAt <= now;
}

/** A concept is "struggling" if recent retrieval failed or misses dominate. */
export function isConceptStruggling(sig: ConceptSignal | undefined): boolean {
  if (!sig) return false;
  return sig.wrong > 0 && (sig.lastResult === "wrong" || sig.wrong >= Math.max(1, sig.correct));
}

/** Clear all signals (used by tests / manual reset; not wired to UI by default). */
export function resetLearningSignals(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}
