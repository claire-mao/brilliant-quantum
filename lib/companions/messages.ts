/**
 * Local, deterministic wizard flavor text. These are short UI lines, never AI.
 *
 * AI is reserved for the things that genuinely benefit from it (personalized
 * hints, generated practice, fun facts, deeper guidance). Simple companion
 * flavor is kept local on purpose: it is instant, free, consistent, and works
 * with AI turned off. Each call returns one line chosen at random (biased by
 * learner state for the dashboard) so the wizard never repeats one canned
 * default. Tone: calm, kind, concise, with light warmth, never condescending.
 */

import { getRecommendedReview } from "@/lib/learning/learner-model";
import { quantumBasicsCourse } from "@/content/lessons";
import type { UserProfile } from "@/lib/types";

export type WizardContext =
  | "dashboard"
  | "lesson"
  | "tower"
  | "correct"
  | "wrong"
  | "hint"
  | "completion"
  | "idle";

export interface LearnerState {
  hasNext: boolean;
  nextStarted: boolean;
  reviewDue: boolean;
  streak: number;
  recentlyCompleted: boolean;
  noProgress: boolean;
}

const JUST_COMPLETED_MS = 20 * 60 * 1000;

/** Derive the lightweight learner state used to bias dashboard copy. Read-only. */
export function getLearnerState(profile: UserProfile | null): LearnerState {
  const lessons = quantumBasicsCourse.lessons.filter((l) => l.steps.length > 0);
  const next = lessons.find((l) => !profile?.progress?.[l.id]?.completed) ?? null;
  const nextStarted = next ? (profile?.progress?.[next.id]?.currentStep ?? 0) > 0 : false;

  const review = getRecommendedReview(profile);
  const reviewDue = review.some((r) => r.reason === "struggled" || r.reason === "due");

  let latestCompletion = 0;
  let anyStarted = false;
  let anyCompleted = false;
  for (const p of Object.values(profile?.progress ?? {})) {
    if (p?.completed) anyCompleted = true;
    if (p?.completed || (p?.currentStep ?? 0) > 0) anyStarted = true;
    const ts = p?.completedAt as { toMillis?: () => number } | null | undefined;
    if (ts && typeof ts.toMillis === "function") {
      const ms = ts.toMillis();
      if (ms > latestCompletion) latestCompletion = ms;
    }
  }

  return {
    hasNext: !!next,
    nextStarted,
    reviewDue,
    streak: profile?.streak ?? 0,
    recentlyCompleted: latestCompletion > 0 && Date.now() - latestCompletion < JUST_COMPLETED_MS,
    noProgress: !anyStarted && !anyCompleted,
  };
}

/** Dashboard sub-pools, combined contextually so the bubble stays varied. */
const DASHBOARD = {
  greet: [
    "Good to see you.",
    "Welcome back.",
    "Ready when you are.",
    "Let's begin gently.",
    "The page is open.",
  ],
  generic: [
    "Make a guess, then test it.",
    "Try one idea and watch what changes.",
    "Small steps build real intuition.",
    "Start with what you already know.",
    "One clear prediction is enough.",
  ],
  review: [
    "A quick review would help.",
    "Something old is ready to recall.",
    "Let's refresh one idea first.",
    "The Tower has something worth practicing.",
  ],
  next: [
    "Your next lesson is ready.",
    "There's a new idea waiting.",
    "You can start the next lesson.",
    "One more step forward.",
  ],
  resume: [
    "You can pick up where you paused.",
    "This lesson is still open.",
    "Ready to continue?",
    "Let's return to the next step.",
  ],
  streak: [
    "You came back. That matters.",
    "Consistency is doing quiet work.",
    "Another day, another small gain.",
  ],
  reflect: [
    "Nice work. Let it settle for a moment.",
    "Before moving on, recall what changed.",
    "That idea is starting to stick.",
  ],
  start: [
    "Start with one prediction.",
    "Your first lesson is waiting.",
    "One small step is enough.",
  ],
} as const;

/** Simple per-context pools (no learner-state weighting needed). */
const POOLS: Record<Exclude<WizardContext, "dashboard">, readonly string[]> = {
  lesson: [
    "Predict first. I can nudge if needed.",
    "Try the experiment before reading ahead.",
    "Name your guess, then test it.",
    "One idea at a time.",
  ],
  tower: [
    "Choose a room.",
    "Pick a challenge.",
    "Recall what you know.",
    "Practice makes the idea easier to find.",
  ],
  correct: [
    "Good. Notice why it worked.",
    "Right. Keep the reason in mind.",
    "That one is yours.",
  ],
  wrong: [
    "Close. Recall what changed.",
    "Not yet. Look one step earlier.",
    "A miss gives useful information.",
  ],
  hint: [
    "Here is a small nudge.",
    "A clue, not the answer.",
    "Try this thread.",
  ],
  completion: [
    "Lesson complete. Nicely done.",
    "That idea is yours now.",
    "Rest a moment. Review will keep it fresh.",
  ],
  idle: [
    "I'm here.",
    "Take your time.",
    "Try the experiment first.",
    "Let's think it through.",
  ],
} as const;

function pick(pool: readonly string[]): string {
  return pool[Math.floor(Math.random() * pool.length)] ?? pool[0] ?? "";
}

/** Assemble the dashboard pool: always-on greeting/generic plus state lines. */
function dashboardPool(state?: LearnerState): string[] {
  const pool: string[] = [...DASHBOARD.greet, ...DASHBOARD.generic];
  if (!state) return pool;
  if (state.noProgress) pool.push(...DASHBOARD.start);
  if (state.reviewDue) pool.push(...DASHBOARD.review);
  if (state.recentlyCompleted) pool.push(...DASHBOARD.reflect);
  if (state.streak >= 2) pool.push(...DASHBOARD.streak);
  if (state.hasNext) pool.push(...(state.nextStarted ? DASHBOARD.resume : DASHBOARD.next));
  return pool;
}

/**
 * One short, local wizard line for the given context. Pass `learnerState`
 * (from `getLearnerState`) for the dashboard so the line reflects what's most
 * useful right now; other contexts ignore it.
 */
export function getWizardMessage(context: WizardContext, learnerState?: LearnerState): string {
  if (context === "dashboard") return pick(dashboardPool(learnerState));
  return pick(POOLS[context]);
}
