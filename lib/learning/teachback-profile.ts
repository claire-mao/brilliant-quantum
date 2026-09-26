/**
 * Learner profile for the Teach-Back tutor: a mastery score (0–100) per
 * concept, updated after every completed Teach-Back session. Stored in
 * localStorage (same `bq-` namespace as learning signals) so it works with
 * no extra infrastructure. Client-only.
 */

import { CONCEPT_LABEL, CONCEPT_ORDER, type ConceptTag } from "@/lib/learning/concepts";

const KEY = "bq-teachback-profile-v1";
const MAX_HISTORY = 20;

export interface TeachBackSessionRecord {
  at: number;
  lessonId: string;
  masteryScore: number;
  misconceptions: string[];
  teachingStrategy: string;
}

export interface ConceptMastery {
  /** Blended mastery estimate, 0–100. */
  score: number;
  /** Most recent raw score from the tutor. */
  lastScore: number;
  sessions: number;
  updatedAt: number;
  history: TeachBackSessionRecord[];
}

export type TeachBackProfile = Partial<Record<ConceptTag, ConceptMastery>>;

const listeners = new Set<() => void>();

function canStore(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function loadTeachBackProfile(): TeachBackProfile {
  if (!canStore()) return {};
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    return parsed && typeof parsed === "object" ? (parsed as TeachBackProfile) : {};
  } catch {
    return {};
  }
}

function save(profile: TeachBackProfile): void {
  if (!canStore()) return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(profile));
  } catch {
    // Storage full or disabled: keep the in-memory update only.
  }
  listeners.forEach((fn) => fn());
}

export function subscribeTeachBackProfile(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function getConceptMastery(tag: ConceptTag): number | null {
  return loadTeachBackProfile()[tag]?.score ?? null;
}

/**
 * Blend a new session score into the running estimate. The first session
 * sets the score; later sessions move 60% of the way toward the new result so
 * a single strong or weak explanation adjusts but does not wipe out history.
 */
export function blendMastery(previous: number | null, next: number): number {
  if (previous === null) return Math.round(next);
  return Math.round(previous + (next - previous) * 0.6);
}

export function recordTeachBackSession(
  tag: ConceptTag,
  session: Omit<TeachBackSessionRecord, "at">
): ConceptMastery {
  const profile = loadTeachBackProfile();
  const prev = profile[tag];
  const record: TeachBackSessionRecord = { ...session, at: Date.now() };
  const entry: ConceptMastery = {
    score: blendMastery(prev?.score ?? null, session.masteryScore),
    lastScore: session.masteryScore,
    sessions: (prev?.sessions ?? 0) + 1,
    updatedAt: record.at,
    history: [...(prev?.history ?? []), record].slice(-MAX_HISTORY),
  };
  profile[tag] = entry;
  save(profile);
  return entry;
}

export interface MasteryRow {
  tag: ConceptTag;
  label: string;
  score: number;
  sessions: number;
}

/** Concepts with at least one Teach-Back session, in teaching order. */
export function masteryRows(profile: TeachBackProfile = loadTeachBackProfile()): MasteryRow[] {
  return CONCEPT_ORDER.filter((tag) => profile[tag])
    .map((tag) => ({
      tag,
      label: CONCEPT_LABEL[tag],
      score: profile[tag]!.score,
      sessions: profile[tag]!.sessions,
    }));
}

export function masteryTone(score: number): { label: string; className: string; bar: string } {
  if (score >= 75) return { label: "Strong", className: "text-emerald-700 bg-emerald-50 border-emerald-200", bar: "from-emerald-400 to-emerald-500" };
  if (score >= 50) return { label: "Developing", className: "text-indigo-700 bg-indigo-50 border-indigo-200", bar: "from-indigo-400 to-violet-500" };
  if (score >= 25) return { label: "Emerging", className: "text-amber-700 bg-amber-50 border-amber-200", bar: "from-amber-400 to-orange-400" };
  return { label: "Just starting", className: "text-rose-700 bg-rose-50 border-rose-200", bar: "from-rose-400 to-rose-500" };
}
