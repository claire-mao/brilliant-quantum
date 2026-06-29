/**
 * Learning-science insights derived entirely from existing signals — durable
 * progress (UserProfile) + local learning signals (retrieval/hints/misconceptions
 * + the spaced-review schedule) + activity pings. Nothing here is invented: every
 * memory strength, review need, focus, observation, metric, timeline event, and
 * journal note is a reading of data the learner actually produced.
 *
 * Client-only (reads localStorage). Call from client components after mount.
 */

import type { UserProfile } from "@/lib/types";
import { getLesson } from "@/content/lessons";
import {
  CONCEPTS,
  CONCEPT_LABEL,
  CONCEPT_ORDER,
  CONCEPT_PREREQ,
  lessonsForConcept,
  type ConceptTag,
} from "./concepts";
import { getConceptSignals, type ConceptSignal } from "./signals";
import { getNeedsReview } from "./learner-model";
import { getActivityTimes } from "@/lib/profile/activity";

const DAY = 86_400_000;

/* ---------- memory strength ---------- */

export type MemoryStrength = "strong" | "stable" | "growing" | "fading" | "forgotten" | "dormant";

export const MEMORY_LABEL: Record<MemoryStrength, string> = {
  strong: "Strong",
  stable: "Stable",
  growing: "Growing",
  fading: "Fading",
  forgotten: "Forgotten",
  dormant: "Dormant",
};

const MEMORY_SCORE: Record<MemoryStrength, number> = {
  strong: 100,
  stable: 78,
  growing: 48,
  fading: 28,
  forgotten: 8,
  dormant: 0,
};

interface LessonStats {
  total: number;
  completed: number;
  started: number;
}

function lessonStats(tag: ConceptTag, profile: UserProfile | null): LessonStats {
  const ids = lessonsForConcept(tag);
  let completed = 0;
  let started = 0;
  for (const id of ids) {
    const p = profile?.progress?.[id];
    if (p?.completed) completed += 1;
    if (p?.completed || (p?.currentStep ?? 0) > 0) started += 1;
  }
  return { total: ids.length, completed, started };
}

function successRate(sig?: ConceptSignal): number | null {
  if (!sig) return null;
  const t = sig.correct + sig.wrong;
  return t > 0 ? sig.correct / t : null;
}

function isIntroduced(stats: LessonStats, sig?: ConceptSignal): boolean {
  return stats.completed > 0 || stats.started > 0 || (sig?.seen ?? 0) > 0;
}

/**
 * Memory strength blends completion, retrieval success, the spacing schedule,
 * recent mistakes, and review history — completion alone never reaches Strong.
 */
function strengthFor(stats: LessonStats, sig: ConceptSignal | undefined, now: number): MemoryStrength {
  if (!isIntroduced(stats, sig)) return "dormant";
  const attempts = sig ? sig.correct + sig.wrong : 0;
  const sr = successRate(sig);
  const overdueDays = sig && sig.dueAt > 0 ? (now - sig.dueAt) / DAY : -Infinity;
  const dueSoon = !!sig && sig.dueAt > 0 && sig.dueAt <= now + DAY;
  const completedAll = stats.total > 0 && stats.completed >= stats.total;

  if (overdueDays >= 7 || (attempts >= 2 && (sr ?? 1) < 0.34)) return "forgotten";
  if (dueSoon || sig?.lastResult === "wrong") return "fading";
  if (completedAll && (sig?.correct ?? 0) >= 2 && (sig?.intervalDays ?? 0) >= 8 && (sr ?? 0) >= 0.7) {
    return "strong";
  }
  if ((sig?.correct ?? 0) >= 1 && (sr ?? 1) >= 0.5 && (sig?.intervalDays ?? 0) >= 2) return "stable";
  return "growing";
}

export interface ConceptMemory {
  tag: ConceptTag;
  label: string;
  strength: MemoryStrength;
  score: number;
  introduced: boolean;
  correct: number;
  wrong: number;
}

const STRENGTH_RANK: Record<MemoryStrength, number> = {
  forgotten: 0,
  fading: 1,
  growing: 2,
  stable: 3,
  strong: 4,
  dormant: 5,
};

/** Memory strength snapshot for every concept (drives the Memory Grimoire). */
export function getMemoryGrimoire(profile: UserProfile | null): ConceptMemory[] {
  const signals = getConceptSignals();
  const now = Date.now();
  return CONCEPTS.map((tag) => {
    const sig = signals[tag];
    const stats = lessonStats(tag, profile);
    const strength = strengthFor(stats, sig, now);
    return {
      tag,
      label: CONCEPT_LABEL[tag],
      strength,
      score: MEMORY_SCORE[strength],
      introduced: strength !== "dormant",
      correct: sig?.correct ?? 0,
      wrong: sig?.wrong ?? 0,
    };
  }).sort((a, b) => STRENGTH_RANK[a.strength] - STRENGTH_RANK[b.strength] || a.label.localeCompare(b.label));
}

/* ---------- needs review ---------- */

export type { NeedsReviewItem, NeedsReviewReasonKind } from "./learner-model";
export { getNeedsReview } from "./learner-model";

/* ---------- current focus ---------- */

export interface CurrentFocus {
  understanding: string | null;
  strengthening: string | null;
  next: string | null;
}

export function getCurrentFocus(profile: UserProfile | null): CurrentFocus {
  const grimoire = getMemoryGrimoire(profile);
  const byScore = [...grimoire].sort((a, b) => b.score - a.score);

  const understanding =
    byScore.find((c) => c.strength === "strong")?.label ??
    byScore.find((c) => c.strength === "stable")?.label ??
    null;

  const strengthening =
    grimoire.find((c) => c.strength === "growing")?.label ??
    grimoire.find((c) => c.strength === "stable" && c.label !== understanding)?.label ??
    null;

  // Next: the first concept in teaching order not yet introduced whose
  // prerequisite has at least been introduced.
  const introducedSet = new Set(grimoire.filter((c) => c.introduced).map((c) => c.tag));
  let next: string | null = null;
  for (const tag of CONCEPT_ORDER) {
    if (introducedSet.has(tag)) continue;
    const prereq = CONCEPT_PREREQ[tag];
    if (prereq === null || introducedSet.has(prereq)) {
      next = CONCEPT_LABEL[tag];
      break;
    }
  }

  return { understanding, strengthening, next };
}

/* ---------- wizard observations (evidence-based) ---------- */

export function getWizardObservations(profile: UserProfile | null): string[] {
  const signals = getConceptSignals();
  const now = Date.now();
  const out: string[] = [];

  const strong = CONCEPTS.map((t) => ({ t, sig: signals[t] }))
    .filter((c) => c.sig && c.sig.correct >= 2 && (successRate(c.sig) ?? 0) >= 0.7)
    .sort((a, b) => (b.sig!.correct - a.sig!.correct));
  if (strong[0]) out.push(`The learner confidently understands ${CONCEPT_LABEL[strong[0].t]}.`);

  const improved = CONCEPTS.map((t) => ({ t, sig: signals[t] })).find(
    (c) => c.sig && c.sig.correct >= 2 && c.sig.wrong >= 1 && c.sig.lastResult === "correct"
  );
  if (improved) out.push(`Retrieval of ${CONCEPT_LABEL[improved.t]} has improved with practice.`);

  const confused = CONCEPTS.map((t) => ({ t, sig: signals[t] }))
    .filter((c) => c.sig && c.sig.lastResult === "wrong" && c.sig.misconceptions.length > 0)
    .sort((a, b) => (b.sig!.misconceptions.length - a.sig!.misconceptions.length))[0];
  if (confused) out.push(`A misconception around ${CONCEPT_LABEL[confused.t]} keeps resurfacing.`);

  // completed but never retrieved → needs a successful recall to stabilise
  const needsRecall = CONCEPTS.find((t) => {
    const stats = lessonStats(t, profile);
    const sig = signals[t];
    return stats.total > 0 && stats.completed >= stats.total && (sig?.correct ?? 0) === 0;
  });
  if (needsRecall && out.length < 4) {
    out.push(`Needs another successful retrieval before ${CONCEPT_LABEL[needsRecall]} is stable.`);
  }

  // ready to begin: next dormant concept with an introduced prerequisite
  const focus = getCurrentFocus(profile);
  if (focus.next && out.length < 4) out.push(`Ready to begin ${focus.next}.`);

  const overdue = CONCEPTS.map((t) => ({ t, sig: signals[t] })).find(
    (c) => c.sig && c.sig.dueAt > 0 && c.sig.dueAt <= now
  );
  if (overdue && out.length < 4) out.push(`${CONCEPT_LABEL[overdue.t]} is fading and due for review.`);

  return out.slice(0, 4);
}

/* ---------- weighted course mastery ---------- */

export interface CourseMastery {
  percent: number;
  completion: number;
  retrieval: number;
  memory: number;
  review: number;
}

/**
 * Mastery = 40% lesson completion + 30% retrieval success + 20% memory
 * strength + 10% review upkeep. Represents learned knowledge, not pages visited.
 */
export function getCourseMastery(
  profile: UserProfile | null,
  completedLessons: number,
  totalLessons: number
): CourseMastery {
  const signals = getConceptSignals();
  const now = Date.now();

  const completion = totalLessons > 0 ? completedLessons / totalLessons : 0;

  let correct = 0;
  let attempts = 0;
  const introduced: ConceptMemory[] = getMemoryGrimoire(profile).filter((c) => c.introduced);
  for (const tag of CONCEPTS) {
    const sig = signals[tag];
    if (sig) {
      correct += sig.correct;
      attempts += sig.correct + sig.wrong;
    }
  }
  const retrieval = attempts > 0 ? correct / attempts : 0;

  const memory = introduced.length > 0 ? introduced.reduce((s, c) => s + c.score, 0) / introduced.length / 100 : 0;

  let onSchedule = 0;
  for (const c of introduced) {
    const sig = signals[c.tag];
    if (!sig || sig.dueAt === 0 || sig.dueAt > now) onSchedule += 1;
  }
  const review = introduced.length > 0 ? onSchedule / introduced.length : 0;

  const score = 0.4 * completion + 0.3 * retrieval + 0.2 * memory + 0.1 * review;
  return {
    percent: Math.round(score * 100),
    completion: Math.round(completion * 100),
    retrieval: Math.round(retrieval * 100),
    memory: Math.round(memory * 100),
    review: Math.round(review * 100),
  };
}

/* ---------- profile learning-profile stats ---------- */

export interface LearningProfileStats {
  avgMemoryScore: number;
  avgMemoryLabel: MemoryStrength;
  retrievalSuccessRate: number | null;
  reviewStreak: number;
  mastered: number;
  strengthening: number;
  dueForReview: number;
  mostImproved: string | null;
  mostDifficult: string | null;
  recentMisconception: string | null;
  studyConsistency: string;
  avgLessonAccuracy: number | null;
  retrievalMinutes: number;
}

function nearestMemoryLabel(score: number): MemoryStrength {
  const order: MemoryStrength[] = ["forgotten", "fading", "growing", "stable", "strong"];
  let best: MemoryStrength = "growing";
  let bestDiff = Infinity;
  for (const s of order) {
    const diff = Math.abs(MEMORY_SCORE[s] - score);
    if (diff < bestDiff) {
      bestDiff = diff;
      best = s;
    }
  }
  return best;
}

export function getLearningProfileStats(profile: UserProfile | null): LearningProfileStats {
  const signals = getConceptSignals();
  const grimoire = getMemoryGrimoire(profile);
  const introduced = grimoire.filter((c) => c.introduced);

  const avgMemoryScore =
    introduced.length > 0 ? Math.round(introduced.reduce((s, c) => s + c.score, 0) / introduced.length) : 0;

  let correct = 0;
  let attempts = 0;
  const perConceptRates: number[] = [];
  for (const tag of CONCEPTS) {
    const sig = signals[tag];
    if (!sig) continue;
    correct += sig.correct;
    attempts += sig.correct + sig.wrong;
    const sr = successRate(sig);
    if (sr !== null) perConceptRates.push(sr);
  }
  const retrievalSuccessRate = attempts > 0 ? Math.round((correct / attempts) * 100) : null;
  const avgLessonAccuracy =
    perConceptRates.length > 0
      ? Math.round((perConceptRates.reduce((s, r) => s + r, 0) / perConceptRates.length) * 100)
      : null;

  const mastered = grimoire.filter((c) => c.strength === "strong").length;
  const strengthening = grimoire.filter((c) => c.strength === "stable" || c.strength === "growing").length;
  const dueForReview = getNeedsReview(profile).length;

  const improvedCandidates = CONCEPTS.map((t) => ({ t, sig: signals[t] }))
    .filter((c) => c.sig && c.sig.correct >= 2 && c.sig.correct > c.sig.wrong)
    .sort((a, b) => b.sig!.correct - a.sig!.correct);
  const mostImproved = improvedCandidates[0] ? CONCEPT_LABEL[improvedCandidates[0].t] : null;

  const difficultCandidates = CONCEPTS.map((t) => ({ t, sig: signals[t] }))
    .filter((c) => c.sig && c.sig.wrong > 0)
    .sort((a, b) => b.sig!.wrong - a.sig!.wrong || (successRate(a.sig) ?? 1) - (successRate(b.sig) ?? 1));
  const mostDifficult = difficultCandidates[0] ? CONCEPT_LABEL[difficultCandidates[0].t] : null;

  const recentMissConcept = CONCEPTS.map((t) => ({ t, sig: signals[t] }))
    .filter((c) => c.sig && c.sig.lastResult === "wrong" && c.sig.misconceptions.length > 0)
    .sort((a, b) => b.sig!.lastSeenAt - a.sig!.lastSeenAt)[0];
  const recentMisconception = recentMissConcept
    ? recentMissConcept.sig!.misconceptions[recentMissConcept.sig!.misconceptions.length - 1].text
    : null;

  // study consistency: distinct active days in the last 7
  const times = getActivityTimes();
  const now = Date.now();
  const days = new Set<string>();
  for (const t of times) {
    if (now - t <= 7 * DAY) days.add(new Date(t).toDateString());
  }
  const studyConsistency = times.length > 0 ? `${Math.min(7, days.size)}/7 days` : "—";

  const totalSeen = Object.values(signals).reduce((s, sig) => s + (sig.seen ?? 0), 0);
  const retrievalMinutes = totalSeen; // ~1 min per retrieval/practice touch

  return {
    avgMemoryScore,
    avgMemoryLabel: nearestMemoryLabel(avgMemoryScore),
    retrievalSuccessRate,
    reviewStreak: profile?.streak ?? 0,
    mastered,
    strengthening,
    dueForReview,
    mostImproved,
    mostDifficult,
    recentMisconception,
    studyConsistency,
    avgLessonAccuracy,
    retrievalMinutes,
  };
}

/* ---------- learning timeline ---------- */

export interface TimelineEvent {
  id: string;
  text: string;
  when: string;
  kind: "lesson" | "retrieval" | "mastery" | "review";
}

function tsMillis(ts: unknown): number {
  if (!ts) return 0;
  if (typeof ts === "number") return ts;
  const obj = ts as { toMillis?: () => number; seconds?: number };
  if (typeof obj.toMillis === "function") return obj.toMillis();
  if (typeof obj.seconds === "number") return obj.seconds * 1000;
  return 0;
}

function relativeWhen(t: number, now: number): string {
  if (t <= 0) return "";
  const diff = now - t;
  if (diff < 0) return "Soon";
  const d = Math.floor(diff / DAY);
  if (d <= 0) return "Today";
  if (d === 1) return "Yesterday";
  return `${d} days ago`;
}

export function getLearningTimeline(profile: UserProfile | null, limit = 8): TimelineEvent[] {
  const signals = getConceptSignals();
  const now = Date.now();
  const events: (TimelineEvent & { t: number })[] = [];

  if (profile?.progress) {
    for (const [id, p] of Object.entries(profile.progress)) {
      if (p?.completed) {
        const t = tsMillis(p.completedAt);
        const title = getLesson(id)?.title ?? id;
        events.push({ id: `lesson-${id}`, t, when: relativeWhen(t, now), text: `Completed ${title}`, kind: "lesson" });
      }
    }
  }

  for (const tag of CONCEPTS) {
    const sig = signals[tag];
    if (!sig || !sig.lastSeenAt) continue;
    const label = CONCEPT_LABEL[tag];
    const grim = strengthFor(lessonStats(tag, profile), sig, now);
    let text: string;
    let kind: TimelineEvent["kind"];
    if (grim === "strong") {
      text = `Mastered ${label}`;
      kind = "mastery";
    } else if (sig.lastResult === "correct") {
      text = `Retrieved ${label} successfully`;
      kind = "retrieval";
    } else {
      text = `Reviewed ${label}`;
      kind = "retrieval";
    }
    events.push({ id: `concept-${tag}`, t: sig.lastSeenAt, when: relativeWhen(sig.lastSeenAt, now), text, kind });
  }

  for (const tag of CONCEPTS) {
    const sig = signals[tag];
    if (sig && sig.dueAt > 0 && sig.dueAt <= now) {
      events.push({
        id: `review-${tag}`,
        t: sig.dueAt,
        when: relativeWhen(sig.dueAt, now),
        text: `Needs review: ${CONCEPT_LABEL[tag]}`,
        kind: "review",
      });
    }
  }

  return events
    .filter((e) => e.t > 0)
    .sort((a, b) => b.t - a.t)
    .slice(0, limit)
    .map(({ id, text, when, kind }) => ({ id, text, when, kind }));
}

/* ---------- wizard journal (warm, evidence-based) ---------- */

export function getWizardJournal(profile: UserProfile | null): string[] {
  const signals = getConceptSignals();
  const now = Date.now();
  const notes: string[] = [];

  const stableC = CONCEPTS.find((t) => {
    const g = strengthFor(lessonStats(t, profile), signals[t], now);
    return g === "stable" || g === "strong";
  });
  if (stableC) notes.push(`Your understanding of ${CONCEPT_LABEL[stableC]} has become steady — that came from showing up and recalling, not luck.`);

  const retrieved = CONCEPTS.map((t) => ({ t, sig: signals[t] }))
    .filter((c) => c.sig && c.sig.correct >= 2)
    .sort((a, b) => b.sig!.correct - a.sig!.correct)[0];
  if (retrieved) {
    notes.push(`${retrieved.sig!.correct} successful retrievals strengthened your memory of ${CONCEPT_LABEL[retrieved.t]}.`);
  }

  const recovered = CONCEPTS.map((t) => ({ t, sig: signals[t] })).find(
    (c) => c.sig && c.sig.wrong >= 1 && c.sig.lastResult === "correct"
  );
  if (recovered) {
    notes.push(`You stumbled on ${CONCEPT_LABEL[recovered.t]} earlier, then came back and got it — persistence is doing its work.`);
  }

  const dueTomorrow = CONCEPTS.map((t) => ({ t, sig: signals[t] })).find(
    (c) => c.sig && c.sig.dueAt > now && c.sig.dueAt <= now + 2 * DAY
  );
  if (dueTomorrow && notes.length < 4) {
    notes.push(`Tomorrow is a good time to revisit ${CONCEPT_LABEL[dueTomorrow.t]}, while it is still fresh.`);
  }

  if (notes.length === 0) {
    notes.push("Your grimoire is fresh. Finish a lesson and try a retrieval, and I will start keeping notes on what you remember.");
  }

  return notes.slice(0, 4);
}
