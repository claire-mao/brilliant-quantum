/**
 * Local, deterministic wizard flavor text. These are short UI lines — never AI.
 *
 * AI is reserved for the things that genuinely benefit from it (personalized
 * hints, generated practice, fun facts, deeper guidance). Simple companion
 * flavor is kept local on purpose: it is instant, free, consistent, and works
 * with AI turned off. Each call returns one line chosen at random (biased by
 * learner state for the dashboard) so the wizard never repeats one canned
 * default. Tone: warm, brief, wizard-like, learning-science informed, never
 * condescending.
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
    "Back at the tower. Where shall we point the wand?",
    "The spellbook is open and waiting.",
    "Good to see you. Ready to tinker?",
    "Let's make a little magic today.",
    "The wand's warmed up whenever you are.",
  ],
  generic: [
    "You're building quantum intuition one experiment at a time.",
    "One prediction before reading. That is how intuition grows.",
    "Ready to test one idea before moving on?",
    "Curiosity is the only prerequisite here.",
  ],
  review: [
    "A quick review makes old magic stronger.",
    "The Tower remembers what needs practice.",
    "A small recall now saves confusion later.",
    "Your old spells are part of today's lesson.",
  ],
  next: [
    "Your next spell is waiting.",
    "The next challenge is easier when yesterday's magic is fresh.",
    "Ready to test one idea before moving on?",
  ],
  resume: [
    "Pick up where you left off — the spell is half-cast.",
    "Your next spell is waiting.",
  ],
  streak: [
    "Showing up daily is the real magic. Keep the streak alive.",
    "Consistency compounds — your streak is doing quiet work.",
  ],
  reflect: [
    "Nicely cast. A moment of reflection seals the spell.",
    "Recall what surprised you just now — that's where it sticks.",
  ],
  start: [
    "Every wizard starts with a single spark. Shall we begin?",
    "One prediction before reading. That is how intuition grows.",
    "Your first spell is a click away.",
  ],
} as const;

/** Simple per-context pools (no learner-state weighting needed). */
const POOLS: Record<Exclude<WizardContext, "dashboard">, readonly string[]> = {
  lesson: [
    "Predict first, then peek. I can nudge if you're stuck.",
    "Name your guess before you check it.",
    "Try the experiment — I'm here if you want a hint.",
    "One idea at a time. Want a hand?",
  ],
  tower: [
    "Choose your next challenge.",
    "The Tower remembers what needs practice.",
    "Quick recall sharpens the blade — pick a foe.",
    "Practice is how spells become reflexes.",
  ],
  correct: [
    "Clean cast! Notice what made it click.",
    "Right — tuck the reason away for later.",
    "That's the one. Now you own it.",
  ],
  wrong: [
    "Close. Let's retrieve what you already saw.",
    "Not quite — what changed right before the result?",
    "A miss is just data. Want to think it through?",
  ],
  hint: [
    "A thread to pull, not the whole spell.",
    "Here's a nudge toward the idea.",
    "Small clue, big door. Give it a try.",
  ],
  completion: [
    "Lesson sealed. Well cast!",
    "Another spell mastered — rest, then return.",
    "That one's yours now. The Tower will help keep it.",
  ],
  idle: [
    "Still here when you need me.",
    "Take your time — the runes aren't going anywhere.",
    "Poke the experiment; that's where intuition hides.",
    "Curious about something? I can help you think it through.",
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
