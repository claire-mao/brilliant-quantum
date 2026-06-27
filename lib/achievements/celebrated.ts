/**
 * Tracks which achievement unlock ceremonies have already played, so the same
 * unlock never replays. Stored locally (ordered, append-only); the last id is
 * the most recently earned achievement.
 */

const KEY = "bq-celebrated-v1";

/** Returns the ordered celebrated ids, or null if never initialized. */
export function getCelebrated(): string[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw === null) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed.filter((x) => typeof x === "string") as string[]) : [];
  } catch {
    return [];
  }
}

export function setCelebrated(ids: string[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY, JSON.stringify(ids));
  } catch {
    // ignore
  }
}

/** The most recently earned (celebrated) achievement id, if any. */
export function getMostRecentCelebrated(): string | null {
  const ids = getCelebrated();
  if (!ids || ids.length === 0) return null;
  return ids[ids.length - 1];
}
