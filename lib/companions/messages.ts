/**
 * Local (non-AI) wizard copy plus the pickers that choose it.
 *
 * One calm voice for the whole app: dashboard, lesson page, Tower, the floating
 * wizard's quips, and the proactive help flow all read their lines from here, so
 * nothing reintroduces a stale greeting and the tone stays consistent. None of
 * this calls AI. AI is reserved for hints, practice, and fun facts elsewhere.
 *
 * React Compiler note (react-hooks/purity): `pickRandom` (and every picker that
 * uses it) calls `Math.random()`, so they are module-level functions. Call them
 * from event handlers (a click / summon), never in component render scope.
 */

import type { UserProfile } from "@/lib/types";
import { quantumBasicsCourse } from "@/content/lessons";
import { getRecommendedReview } from "@/lib/learning/learner-model";
import { pageKindFromPath, type PageKind } from "@/lib/companions/page-context";

/** Scaffolding levels shared by the proactive help flow (retrieval -> reasoning). */
export type HintLevel = 1 | 2 | 3 | 4;

/* ------------------------------ Dashboard pools --------------------------- */

/** Calm home greeting. Stays in rotation as the dashboard's neutral fallback. */
export const DASHBOARD_GREETINGS = [
  "Good to see you.",
  "Welcome back.",
  "Ready when you are.",
  "Let's begin gently.",
] as const;

/** Generic, study-anytime prompts. Keep lines short for the speech bubble (~8 words). */
export const GENERIC_MESSAGES = [
  "Guess first, then test.",
  "Try one idea. See what shifts.",
  "Small steps build intuition.",
  "Start with what you know.",
  "One prediction is enough.",
] as const;

/** A concept is due, stale, or was struggled with. */
export const REVIEW_DUE_MESSAGES = [
  "A quick review helps.",
  "Time to recall an old idea.",
  "Refresh one idea first.",
  "The Tower has good practice.",
] as const;

/** The next lesson is unlocked and not yet started. */
export const NEXT_LESSON_AVAILABLE_MESSAGES = [
  "Your next lesson is ready.",
  "There's a new idea waiting.",
  "You can start the next lesson.",
  "One more step forward.",
] as const;

/** The next lesson has a saved resume point. */
export const NEXT_LESSON_IN_PROGRESS_MESSAGES = [
  "Pick up where you paused.",
  "This lesson is still open.",
  "Ready to continue?",
  "Return to the next step.",
] as const;

/** A multi-day streak worth a quiet acknowledgement. */
export const STREAK_ACTIVE_MESSAGES = [
  "You came back. That matters.",
  "Consistency is doing quiet work.",
  "Another day, another small gain.",
] as const;

/** Everything built is finished; let it settle. */
export const RECENTLY_COMPLETED_MESSAGES = [
  "Nice work. Let it settle.",
  "Recall what changed.",
  "That idea is sticking.",
] as const;

/** Brand-new learner with nothing started (excludes the lesson-waiting nudge; see below). */
export const NO_PROGRESS_MESSAGES = [
  "Start with one prediction.",
  "One small step is enough.",
] as const;

/** Shown at most once in the dashboard rotation for zero-progress learners only. */
export const LESSON_WAITING_NUDGE = "Your lesson is waiting.";

/* --------------------------- Lesson page / Tower -------------------------- */

/** Shown when the wizard is summoned on a lesson page. */
export const LESSON_PAGE_MESSAGES = [
  "Predict first. Ask for a hint.",
  "Try the experiment first.",
  "Guess, then test it.",
  "One idea at a time.",
] as const;

/** Shown when the wizard is summoned on the Tower. */
export const TOWER_MESSAGES = [
  "Choose a room.",
  "Pick a challenge.",
  "Recall what you know.",
  "Practice makes ideas easier.",
] as const;

/** Shown when the wizard is summoned on the profile page. */
export const PROFILE_MESSAGES = [
  "Your grimoire is taking shape.",
  "Relics mark your path.",
  "Consistency shows up here.",
  "Return when you are ready.",
] as const;

/** Quips when the learner taps the idle floating wizard on the dashboard. */
export const DASHBOARD_IDLE_CLICK_MESSAGES = [
  "I'm here.",
  "Take your time.",
  "Pick up where you left off.",
  "One step at a time.",
] as const;

/** Quips when the learner taps the idle floating wizard on the profile page. */
export const PROFILE_IDLE_CLICK_MESSAGES = [
  "A fine profile.",
  "Your streak tells a story.",
  "Customize when you like.",
  "Look how far you've come.",
] as const;

/** Quips when the learner taps the idle floating wizard on a lesson page. */
export const LESSON_IDLE_CLICK_MESSAGES = [
  "I'm here.",
  "Take your time.",
  "Try the experiment first.",
  "Let's think it through.",
] as const;

/** Quips when the learner taps the idle floating wizard (generic fallback). */
export const IDLE_CLICK_MESSAGES = LESSON_IDLE_CLICK_MESSAGES;

/* ------------------------------ Proactive help --------------------------- */

/**
 * Escalating offers after a wrong answer, one per scaffolding level
 * (retrieval -> attention -> concept -> reasoning). Level 1 is the opening offer.
 */
export const WRONG_ESCALATION: Record<HintLevel, string> = {
  1: "Not quite. What do you remember?",
  2: "Want me to point to the change?",
  3: "Want the key idea?",
  4: "Want the reasoning step by step?",
};

/** Handwritten hint content used when the AI hint call is unavailable, by level. */
export const AI_OFF_HINT_FALLBACKS: Record<HintLevel, string> = {
  1: "Recall the experiment. What changed?",
  2: "Look at the step before the result.",
  3: "Name the main idea first.",
  4: "Read the explanation, then retry.",
};

/* -------------------------------- Farewells ------------------------------ */

/** Short send-offs when a bubble button navigates somewhere. */
export const FAREWELLS = {
  practice: "To practice.",
  continue: "Onward.",
  tower: "To the Tower.",
  dashboard: "Onward.",
} as const;

/* ------------------------ Summon-button AI fallbacks --------------------- */

/** Used only when an AI fetch from the summon button fails or has no context. */
export const SUMMON_FALLBACKS = {
  hint: "What changed in the experiment?",
  funFact:
    "In 1994 Peter Shor published an algorithm showing that a quantum computer could factor large integers efficiently, a result that helped drive decades of hardware research.",
  noContext: "Open a lesson first.",
  dashboardHint: "What was the main idea?",
  profileHint: "What did you practice last?",
} as const;

/* --------------- Defined-but-unused pools (kept for future use) ---------- */

export const CORRECT_MESSAGES = [
  "Good. Notice why it worked.",
  "Right. Keep the reason in mind.",
  "That one is yours.",
] as const;

export const HINT_MESSAGES = [
  "Here is a small hint.",
  "A clue, not the answer.",
  "Try this thread.",
] as const;

export const COMPLETION_MESSAGES = [
  "Lesson complete. Nicely done.",
  "That idea is yours now.",
  "Rest a moment. Review keeps it fresh.",
] as const;

export const WRONG_HELPER_MESSAGES = [
  "Close. Recall what changed.",
  "Not yet. Look one step earlier.",
  "A miss gives useful information.",
] as const;

/* --------------------------------- Pickers ------------------------------- */

/**
 * Pure, module-level random picker. Defined here (not inside a component) so the
 * React Compiler's purity lint never sees `Math.random()` in render scope.
 * Invoke it from event handlers only.
 */
export function pickRandom<T>(pool: readonly T[]): T {
  return pool[Math.floor(Math.random() * pool.length)];
}

/**
 * The contextual pool that best matches the learner's current LOCAL state
 * (Firestore-backed progress/streak plus local spaced-review signals, never AI).
 * Highest priority first; returns null when nothing specific applies.
 *
 *   no progress -> review due -> lesson in progress -> lesson available ->
 *   streak active -> recently completed.
 */
function dashboardContextPool(profile: UserProfile | null): readonly string[] | null {
  const progress = profile?.progress ?? {};
  const lessonProgress = Object.values(progress);
  const anyStarted = lessonProgress.some(
    (p) => p?.completed || (p?.currentStep ?? 0) > 0
  );

  // Brand-new learner: nothing started yet.
  if (!anyStarted) return NO_PROGRESS_MESSAGES;

  // A concept is due / stale / struggled (local spaced-review signals).
  if (getRecommendedReview(profile).length > 0) return REVIEW_DUE_MESSAGES;

  // The next built, not-yet-completed lesson (mirrors the dashboard card).
  const nextLesson = quantumBasicsCourse.lessons.find(
    (l) => l.steps.length > 0 && !progress[l.id]?.completed
  );
  if (nextLesson) {
    const resumable = (progress[nextLesson.id]?.currentStep ?? 0) > 0;
    return resumable ? NEXT_LESSON_IN_PROGRESS_MESSAGES : NEXT_LESSON_AVAILABLE_MESSAGES;
  }

  // From here every built lesson is complete.
  if ((profile?.streak ?? 0) >= 2) return STREAK_ACTIVE_MESSAGES;
  if (lessonProgress.some((p) => p?.completed)) return RECENTLY_COMPLETED_MESSAGES;

  return null;
}

/**
 * Pick one dashboard line per click. Builds a combined candidate set so the
 * wizard feels varied: DASHBOARD_GREETINGS and GENERIC are always in the mix,
 * and the contextual pool (if any) is added once. The lesson-waiting nudge is
 * included at most once and only for brand-new learners. LOCAL only (no AI).
 */
/**
 * Pick one profile line per summon or wizard tap. Merges summon + idle pools and
 * adds streak / completion context from the learner's profile when it applies.
 */
export function pickProfileMessage(profile: UserProfile | null): string {
  const candidates: string[] = [...PROFILE_MESSAGES, ...PROFILE_IDLE_CLICK_MESSAGES];
  const progress = profile?.progress ?? {};
  if ((profile?.streak ?? 0) >= 2) candidates.push(...STREAK_ACTIVE_MESSAGES);
  if (Object.values(progress).some((p) => p?.completed)) {
    candidates.push(...RECENTLY_COMPLETED_MESSAGES);
  }
  return pickRandom(candidates);
}

export function pickDashboardMessage(profile: UserProfile | null): string {
  const progress = profile?.progress ?? {};
  const anyStarted = Object.values(progress).some(
    (p) => p?.completed || (p?.currentStep ?? 0) > 0
  );
  const contextual = dashboardContextPool(profile);
  const candidates: string[] = [...DASHBOARD_GREETINGS, ...GENERIC_MESSAGES];
  if (contextual) candidates.push(...contextual);
  // Zero-progress only: one slot in the pool, never doubled or auto-restored.
  if (!anyStarted) candidates.push(LESSON_WAITING_NUDGE);
  return pickRandom(candidates);
}

/** Above this length, wizard copy is split into sequential bubble pages. */
export const MESSAGE_PART_THRESHOLD = 120;

/** Hard cap for a single bubble page before word-wrapping to another page. */
export const MESSAGE_PART_MAX = 200;

const SENTENCE_RE = /[^.!?]+[.!?]+(?:\s+|$)|[^.!?]+$/g;

function wrapLongPart(text: string, maxLen: number): string[] {
  if (text.length <= maxLen) return [text];
  const words = text.split(/\s+/).filter(Boolean);
  const chunks: string[] = [];
  let current = "";
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length <= maxLen) {
      current = candidate;
    } else {
      if (current) chunks.push(current);
      current = word.length > maxLen ? word.slice(0, maxLen) : word;
    }
  }
  if (current) chunks.push(current);
  return chunks.length > 0 ? chunks : [text];
}

/**
 * Break long wizard copy into readable bubble pages on sentence boundaries.
 * Short lines stay a single page; very long sentences fall back to word chunks.
 */
export function splitMessageParts(
  message: string,
  threshold = MESSAGE_PART_THRESHOLD
): string[] {
  const trimmed = message.trim();
  if (!trimmed) return [""];
  if (trimmed.length <= threshold) return [trimmed];

  const sentences = trimmed.match(SENTENCE_RE)?.map((s) => s.trim()).filter(Boolean) ?? [trimmed];
  const parts: string[] = [];
  let current = "";

  for (const sentence of sentences) {
    const candidate = current ? `${current} ${sentence}` : sentence;
    if (candidate.length <= threshold || !current) {
      current = candidate;
    } else {
      parts.push(current);
      current = sentence;
    }
  }
  if (current) parts.push(current);

  return parts.flatMap((part) => wrapLongPart(part, MESSAGE_PART_MAX));
}

/** Pick a contextual quip when the learner taps the floating wizard. */
export function pickIdleClickMessage(pathname: string): string {
  const kind: PageKind = pageKindFromPath(pathname);
  switch (kind) {
    case "dashboard":
      return pickRandom(DASHBOARD_IDLE_CLICK_MESSAGES);
    case "profile":
      return pickRandom(PROFILE_IDLE_CLICK_MESSAGES);
    case "lesson":
      return pickRandom(LESSON_IDLE_CLICK_MESSAGES);
    default:
      return pickRandom(IDLE_CLICK_MESSAGES);
  }
}
