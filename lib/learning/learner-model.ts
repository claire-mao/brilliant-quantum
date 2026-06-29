/**
 * The learner model: a lightweight, derived view of what the learner knows,
 * struggles with, and is due to review. It combines durable progress (Firestore
 * via UserProfile) with local learning signals (retrieval, hints, misconceptions
 * in localStorage). No schema changes — everything here is derived.
 *
 * Client-only (reads localStorage). Call from client components after mount.
 */

import type { UserProfile } from "@/lib/types";
import type { PracticeQuestion } from "@/lib/ai/validators";
import { getLesson, getUnits } from "@/content/lessons";
import {
  CONCEPTS,
  CONCEPT_LABEL,
  CONCEPT_ORDER,
  CONCEPT_PREREQ,
  CONCEPT_RECALL,
  conceptsForLesson,
  lessonsForConcept,
  primaryConcept,
  type ConceptTag,
} from "./concepts";
import {
  getConceptSignal,
  getConceptSignals,
  isConceptDue,
  isConceptStruggling,
  reviewSessionCount,
  type ConceptSignal,
} from "./signals";
import { getRetrievalForConcept } from "./retrieval";

export type MasteryStatus = "new" | "introduced" | "practiced" | "strengthening" | "mastered";

export const MASTERY_LABEL: Record<MasteryStatus, string> = {
  new: "Not started",
  introduced: "Introduced",
  practiced: "Practiced",
  strengthening: "Strengthening",
  mastered: "Mastered",
};

export interface ConceptProfile {
  tag: ConceptTag;
  label: string;
  status: MasteryStatus;
  completedLessons: number;
  totalLessons: number;
  struggling: boolean;
  due: boolean;
}

function lessonStats(tag: ConceptTag, profile: UserProfile | null) {
  const lessons = lessonsForConcept(tag);
  let completed = 0;
  let started = 0;
  for (const id of lessons) {
    const p = profile?.progress?.[id];
    if (p?.completed) completed += 1;
    if (p?.completed || (p?.currentStep ?? 0) > 0) started += 1;
  }
  return { total: lessons.length, completed, started };
}

function deriveStatus(
  tag: ConceptTag,
  profile: UserProfile | null,
  sig: ConceptSignal | undefined
): MasteryStatus {
  const { total, completed, started } = lessonStats(tag, profile);
  const correct = sig?.correct ?? 0;
  const struggling = isConceptStruggling(sig);

  if (completed === 0 && started === 0 && !sig) return "new";
  if (completed === 0) return "introduced";

  // Mastery requires finishing every lesson for the concept AND a successful
  // retrieval, with no recent struggle and nothing currently due for review.
  if (completed >= total) {
    if (correct > 0 && !struggling && !isConceptDue(tag)) return "mastered";
    return "strengthening";
  }
  return correct > 0 && !struggling ? "strengthening" : "practiced";
}

/** Mastery snapshot for every concept (drives mastery language in the UI). */
export function getLearnerConceptProfile(profile: UserProfile | null): ConceptProfile[] {
  const signals = getConceptSignals();
  return CONCEPTS.map((tag) => {
    const sig = signals[tag];
    const { total, completed } = lessonStats(tag, profile);
    return {
      tag,
      label: CONCEPT_LABEL[tag],
      status: deriveStatus(tag, profile, sig),
      completedLessons: completed,
      totalLessons: total,
      struggling: isConceptStruggling(sig),
      due: isConceptDue(tag),
    };
  });
}

export interface MisconceptionSignal {
  tag: ConceptTag;
  label: string;
  notes: { text: string; count: number }[];
}

/** Repeated wrong-answer patterns, grouped by concept. */
export function getMisconceptionSignals(): MisconceptionSignal[] {
  const signals = getConceptSignals();
  const out: MisconceptionSignal[] = [];
  for (const tag of CONCEPTS) {
    const sig = signals[tag];
    if (sig && sig.misconceptions.length > 0) {
      out.push({ tag, label: CONCEPT_LABEL[tag], notes: sig.misconceptions });
    }
  }
  return out;
}

export type ReviewReason = "struggled" | "due" | "stale";

export interface ReviewItem {
  tag: ConceptTag;
  label: string;
  reason: ReviewReason;
}

const STALE_MS = 3 * 86_400_000;

/**
 * Concepts the learner should revisit, highest priority first:
 * struggled concepts, then concepts due for spaced review, then stale ones.
 */
export function getRecommendedReview(profile: UserProfile | null): ReviewItem[] {
  const signals = getConceptSignals();
  const now = Date.now();
  const items: { item: ReviewItem; weight: number; tie: number }[] = [];

  for (const tag of CONCEPTS) {
    const sig = signals[tag];
    const { completed, started } = lessonStats(tag, profile);
    const introduced = completed > 0 || started > 0 || (sig?.seen ?? 0) > 0;
    if (!introduced) continue;

    if (isConceptStruggling(sig)) {
      items.push({ item: { tag, label: CONCEPT_LABEL[tag], reason: "struggled" }, weight: 0, tie: -(sig?.wrong ?? 0) });
    } else if (sig && sig.dueAt > 0 && sig.dueAt <= now) {
      items.push({ item: { tag, label: CONCEPT_LABEL[tag], reason: "due" }, weight: 1, tie: sig.dueAt });
    } else if (!sig || now - sig.lastSeenAt > STALE_MS) {
      items.push({ item: { tag, label: CONCEPT_LABEL[tag], reason: "stale" }, weight: 2, tie: sig?.lastSeenAt ?? 0 });
    }
  }

  items.sort((a, b) => (a.weight !== b.weight ? a.weight - b.weight : a.tie - b.tie));
  return items.map((i) => i.item);
}

export interface RetrievalPromptResult {
  tag: ConceptTag;
  reason: ReviewReason | "older";
  question: PracticeQuestion;
}

/**
 * Pick the next retrieval question — prioritising review needs, then falling
 * back to an older completed concept. Returns null only if nothing applies.
 */
export function getNextRetrievalPrompt(
  profile: UserProfile | null,
  opts: { exclude?: ConceptTag; seed?: number } = {}
): RetrievalPromptResult | null {
  const review = getRecommendedReview(profile).filter((r) => r.tag !== opts.exclude);
  const seed = opts.seed ?? 0;

  for (const r of review) {
    const q = getRetrievalForConcept(r.tag, seed);
    if (q) return { tag: r.tag, reason: r.reason, question: q };
  }

  // Fallback: any older concept the learner has touched.
  const touched = CONCEPT_ORDER.filter((tag) => {
    if (tag === opts.exclude) return false;
    const { completed, started } = lessonStats(tag, profile);
    return completed > 0 || started > 0 || !!getConceptSignal(tag);
  });
  const tag = touched[seed % Math.max(1, touched.length)];
  if (!tag) return null;
  const q = getRetrievalForConcept(tag, seed);
  return q ? { tag, reason: "older", question: q } : null;
}

/** Prerequisite reminder for a lesson (prior knowledge activation). */
export function getPrerequisiteReminder(
  lessonId: string
): { tag: ConceptTag; label: string; text: string } | null {
  const primary = primaryConcept(lessonId);
  if (!primary) return null;
  const prereq = CONCEPT_PREREQ[primary];
  if (!prereq) return null;
  return { tag: prereq, label: CONCEPT_LABEL[prereq], text: CONCEPT_RECALL[prereq] };
}

/** Concept + likely misconception text to ground AI practice generation. */
export function getConceptNeed(
  profile: UserProfile | null
): { tag: ConceptTag; label: string; prerequisite: string; misconception?: string } | null {
  const review = getRecommendedReview(profile);
  const tag = review[0]?.tag ?? null;
  if (!tag) return null;
  const sig = getConceptSignal(tag);
  const prereqTag = CONCEPT_PREREQ[tag];
  return {
    tag,
    label: CONCEPT_LABEL[tag],
    prerequisite: prereqTag ? CONCEPT_LABEL[prereqTag] : "the basics",
    misconception: sig?.misconceptions[sig.misconceptions.length - 1]?.text,
  };
}

export { conceptsForLesson };

const DAY = 86_400_000;

function successRate(sig?: ConceptSignal): number | null {
  if (!sig) return null;
  const t = sig.correct + sig.wrong;
  return t > 0 ? sig.correct / t : null;
}

function dueLabel(dueAt: number, now: number): string {
  if (!dueAt) return "Soon";
  if (dueAt <= now) {
    const overdue = Math.floor((now - dueAt) / DAY);
    return overdue >= 1 ? "Overdue" : "Today";
  }
  const days = Math.ceil((dueAt - now) / DAY);
  return days <= 1 ? "Tomorrow" : `In ${days} days`;
}

function unitAndLessonForConcept(tag: ConceptTag): { unitTitle: string; lessonTitle: string } {
  const lessonIds = lessonsForConcept(tag);
  if (!lessonIds.length) return { unitTitle: "", lessonTitle: "" };
  const primaryId = lessonIds[0];
  const lessonTitle = getLesson(primaryId)?.title ?? primaryId;
  let unitTitle = "";
  for (const unit of getUnits()) {
    if (unit.lessonIds.includes(primaryId)) {
      unitTitle = unit.title;
      break;
    }
  }
  return { unitTitle, lessonTitle };
}

export type NeedsReviewReasonKind = "due" | "struggle" | "recall";

export interface NeedsReviewItem {
  tag: ConceptTag;
  label: string;
  /** User-facing reason label. */
  reason: string;
  reasonKind: NeedsReviewReasonKind;
  due: string;
  unitTitle: string;
  lessonTitle: string;
}

const REASON_LABEL: Record<NeedsReviewReasonKind, string> = {
  due: "Due for review",
  struggle: "Recent struggle",
  recall: "Needs another recall",
};

/**
 * Actionable concepts to revisit — single source of truth for Grimoire, Tower,
 * and AI review targeting. Combines spaced review, struggle signals, hints,
 * retrieval success, and mastery status from the learner model.
 */
export function getNeedsReview(profile: UserProfile | null): NeedsReviewItem[] {
  const signals = getConceptSignals();
  const profiles = getLearnerConceptProfile(profile);
  const profileByTag = new Map(profiles.map((p) => [p.tag, p]));
  const now = Date.now();
  const rows: (NeedsReviewItem & { group: number; sortKey: number })[] = [];

  for (const tag of CONCEPTS) {
    const sig = signals[tag];
    const conceptProfile = profileByTag.get(tag);
    if (conceptProfile?.status === "mastered") continue;

    const { completed, started, total } = lessonStats(tag, profile);
    const introduced = completed > 0 || started > 0 || (sig?.seen ?? 0) > 0;
    if (!introduced) continue;

    const attempts = sig ? sig.correct + sig.wrong : 0;
    const sr = successRate(sig);
    const sessions = reviewSessionCount(tag);
    const struggling =
      sig?.lastResult === "wrong" || ((sig?.wrong ?? 0) > (sig?.correct ?? 0) && (sig?.wrong ?? 0) > 0);
    const due = isConceptDue(tag, now);
    const dueSoon = !!sig && sig.dueAt > 0 && sig.dueAt <= now + DAY;
    const recentlyWrong = sig?.lastResult === "wrong";
    const heavyHints = (sig?.hints ?? 0) >= 2 && sig?.lastResult !== "correct";
    const lowRetrieval = attempts >= 2 && (sr ?? 1) < 0.5;
    const needsFirstRecall = total > 0 && completed >= total && (sig?.correct ?? 0) === 0;
    const stale =
      !sig || (sig.lastSeenAt > 0 && now - sig.lastSeenAt > 3 * DAY && !due && sessions < 2);

    const clearedBySessions = sessions >= 2 && !struggling && !due && !recentlyWrong;
    const clearedByRetrieval =
      (sig?.correct ?? 0) >= 2 && (sr ?? 0) >= 0.7 && !struggling && !due && !dueSoon;
    if (clearedBySessions || clearedByRetrieval) continue;

    if (!struggling && !due && !dueSoon && !recentlyWrong && !heavyHints && !lowRetrieval && !needsFirstRecall && !stale) {
      continue;
    }

    let reasonKind: NeedsReviewReasonKind;
    if (struggling || recentlyWrong) reasonKind = "struggle";
    else if (due || dueSoon) reasonKind = "due";
    else reasonKind = "recall";

    const group = reasonKind === "struggle" ? 0 : reasonKind === "due" ? 1 : 2;
    const { unitTitle, lessonTitle } = unitAndLessonForConcept(tag);

    rows.push({
      tag,
      label: CONCEPT_LABEL[tag],
      reason: REASON_LABEL[reasonKind],
      reasonKind,
      due: dueLabel(sig?.dueAt ?? 0, now),
      unitTitle,
      lessonTitle,
      group,
      sortKey: sig?.dueAt ?? now,
    });
  }

  rows.sort((a, b) => a.group - b.group || a.sortKey - b.sortKey);
  return rows.map(({ tag, label, reason, reasonKind, due, unitTitle, lessonTitle }) => ({
    tag,
    label,
    reason,
    reasonKind,
    due,
    unitTitle,
    lessonTitle,
  }));
}

/** Whether a concept currently appears in Needs Review. */
export function isConceptNeedsReview(profile: UserProfile | null, tag: ConceptTag): boolean {
  return getNeedsReview(profile).some((item) => item.tag === tag);
}

/** Review item for a specific concept, if any. */
export function getNeedsReviewItem(
  profile: UserProfile | null,
  tag: ConceptTag
): NeedsReviewItem | null {
  return getNeedsReview(profile).find((item) => item.tag === tag) ?? null;
}
