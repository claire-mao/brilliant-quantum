/**
 * Lightweight, local activity tracking used to derive consistency achievements
 * (Early Bird / Night Owl / Weekend Wizard), a longest-streak estimate, and an
 * estimated learning-hours figure. Purely additive: stored in localStorage, no
 * Firestore schema change, and it never affects lesson flow or learning logic.
 */

const KEY = "bq-activity-v1";
const THROTTLE_MS = 10 * 60 * 1000;
const MAX_PINGS = 240;

interface ActivityState {
  pings: number[];
  longestStreak: number;
}

function read(): ActivityState {
  if (typeof window === "undefined") return { pings: [], longestStreak: 0 };
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { pings: [], longestStreak: 0 };
    const parsed = JSON.parse(raw) as Partial<ActivityState>;
    return {
      pings: Array.isArray(parsed.pings) ? parsed.pings.filter((n) => typeof n === "number") : [],
      longestStreak: typeof parsed.longestStreak === "number" ? parsed.longestStreak : 0,
    };
  } catch {
    return { pings: [], longestStreak: 0 };
  }
}

function write(state: ActivityState): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

/** Record that the learner was active now (throttled to avoid noise). */
export function recordActivity(): void {
  const state = read();
  const now = Date.now();
  const last = state.pings[state.pings.length - 1] ?? 0;
  if (now - last < THROTTLE_MS) return;
  state.pings.push(now);
  if (state.pings.length > MAX_PINGS) state.pings = state.pings.slice(-MAX_PINGS);
  write(state);
}

export function getActivityTimes(): number[] {
  return read().pings;
}

/** Keep a running maximum of the current streak as a "longest streak" estimate. */
export function recordStreakObservation(currentStreak: number): number {
  const state = read();
  if (currentStreak > state.longestStreak) {
    state.longestStreak = currentStreak;
    write(state);
  }
  return state.longestStreak;
}

export function getLongestStreak(currentStreak = 0): number {
  return Math.max(read().longestStreak, currentStreak);
}

export interface TimeFacts {
  earlyBird: boolean;
  nightOwl: boolean;
  weekend: boolean;
}

/** Derive consistency facts from activity pings plus any extra timestamps. */
export function deriveTimeFacts(extraTimes: number[] = []): TimeFacts {
  const times = [...getActivityTimes(), ...extraTimes];
  let earlyBird = false;
  let nightOwl = false;
  let weekend = false;
  for (const t of times) {
    const d = new Date(t);
    const hour = d.getHours();
    const day = d.getDay();
    if (hour >= 5 && hour < 9) earlyBird = true;
    if (hour >= 22 || hour < 5) nightOwl = true;
    if (day === 0 || day === 6) weekend = true;
  }
  return { earlyBird, nightOwl, weekend };
}

/** Rough estimate: ~10 min per completed lesson plus ~1 min per retrieval. */
export function estimateLearningHours(completedLessons: number, retrievals: number): number {
  const minutes = completedLessons * 10 + retrievals * 1;
  return Math.round((minutes / 60) * 10) / 10;
}
