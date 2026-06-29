/**
 * Retrieval-first progressive feedback for graded questions (lessons, Tower, practice).
 * Wrong attempts escalate cues before revealing the correct answer or full explanation.
 */

import {
  CONCEPT_WRONG_HINTS,
  CONCEPT_WRONG_HINTS_TOWER,
  type ConceptTag,
} from "@/lib/learning/concepts";

/** Wrong attempts before auto-revealing the full explanation (attempts 1–3 are cues only). */
export const REVEAL_THRESHOLD = 4;

export type FeedbackLevel = "retrieval" | "attention" | "concept" | "full";

export interface QuestionContext {
  conceptTag?: ConceptTag | null;
  /** Full explanation shown only after reveal (option feedback, teaching, etc.). */
  fullExplanation?: string;
  /** Label of the correct choice, for reveal copy. */
  correctAnswerLabel?: string;
}

export interface ProgressiveFeedback {
  message: string;
  level: FeedbackLevel;
}

const GENERIC_WRONG_HINTS: [string, string, string] = [
  "That doesn't match what the question is testing. Reread the prompt and recall the key rule from the last explanation.",
  "Still off. Match your choice to what the question asks—a definition, prediction, or consequence.",
  "Name the core concept, recall its defining rule, and eliminate options that break it.",
];

const TOWER_GENERIC_WRONG_HINTS: [string, string, string] = [
  "Not yet. Reread the question and recall the rule from the last chamber.",
  "Still off. Name what the question is testing, then match each option to it.",
  "Recall the key rule for this concept and reject any answer that breaks it.",
];

const FEEDBACK_LEVELS: FeedbackLevel[] = ["retrieval", "attention", "concept"];

function stripCorrectPrefix(text: string): string {
  return text
    .replace(/^Correct[.!]?\s*/i, "")
    .replace(/^That'?s (?:it|correct|right)[.!]?\s*/i, "")
    .replace(/^Right[.!]?\s*/i, "")
    .trim();
}

function splitIntoSentences(text: string): string[] {
  const trimmed = stripCorrectPrefix(text);
  if (!trimmed) return [];
  return trimmed
    .split(/(?<=[.!?])\s+(?=[A-Z"(\\[]|[0-9])/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}

function sentenceRevealsAnswer(sentence: string, correctAnswerLabel?: string): boolean {
  if (/^the answer is\b/i.test(sentence)) return true;
  if (/^correct choice\b/i.test(sentence)) return true;
  if (/\bthe target was\b/i.test(sentence)) return true;
  if (correctAnswerLabel?.trim()) {
    const label = correctAnswerLabel.trim();
    if (label.length >= 3 && sentence.includes(label)) return true;
  }
  return false;
}

/** Pull guiding sentences from fullExplanation without revealing the correct choice. */
function deriveGuidanceFromExplanation(
  fullExplanation: string | undefined,
  correctAnswerLabel: string | undefined,
  depth: 1 | 2
): string | undefined {
  const sentences = splitIntoSentences(fullExplanation ?? "").filter(
    (sentence) => !sentenceRevealsAnswer(sentence, correctAnswerLabel)
  );
  if (sentences.length === 0) return undefined;
  const count = depth === 1 ? 1 : Math.min(2, sentences.length);
  return sentences.slice(0, count).join(" ");
}

function combineGuidance(primary: string, secondary: string | undefined): string {
  if (!secondary?.trim()) return primary;
  const trimmedSecondary = secondary.trim();
  const prefix = trimmedSecondary.slice(0, Math.min(48, trimmedSecondary.length));
  if (primary.includes(prefix) || trimmedSecondary.includes(primary.slice(0, 48))) {
    return primary;
  }
  return `${primary} ${trimmedSecondary}`;
}

function conceptHintForAttempt(
  conceptTag: ConceptTag | null | undefined,
  attempt: 1 | 2 | 3,
  variant: "lesson" | "tower"
): string | undefined {
  if (conceptTag == null) return undefined;
  const hints = variant === "tower" ? CONCEPT_WRONG_HINTS_TOWER : CONCEPT_WRONG_HINTS;
  return hints[conceptTag][attempt - 1];
}

function genericHintForAttempt(attempt: 1 | 2 | 3, variant: "lesson" | "tower"): string {
  const hints = variant === "tower" ? TOWER_GENERIC_WRONG_HINTS : GENERIC_WRONG_HINTS;
  return hints[attempt - 1];
}

/** Escalating wrong-attempt cue for the given attempt number (1-based). */
export function getProgressiveFeedback(
  attemptNumber: number,
  questionContext: QuestionContext = {},
  variant: "lesson" | "tower" = "lesson"
): ProgressiveFeedback {
  const attempt = Math.max(1, Math.floor(attemptNumber)) as 1 | 2 | 3 | 4 | number;

  if (attempt >= REVEAL_THRESHOLD) {
    return {
      level: "full",
      message: questionContext.fullExplanation?.trim() || "Review the explanation below.",
    };
  }

  const cueAttempt = attempt as 1 | 2 | 3;
  const level = FEEDBACK_LEVELS[cueAttempt - 1];
  const conceptHint = conceptHintForAttempt(questionContext.conceptTag, cueAttempt, variant);
  const derivedHint =
    cueAttempt >= 2
      ? deriveGuidanceFromExplanation(
          questionContext.fullExplanation,
          questionContext.correctAnswerLabel,
          cueAttempt === 2 ? 1 : 2
        )
      : undefined;

  let message: string;
  if (conceptHint && derivedHint) {
    message = combineGuidance(conceptHint, derivedHint);
  } else if (conceptHint) {
    message = conceptHint;
  } else if (derivedHint) {
    message = derivedHint;
  } else {
    message = genericHintForAttempt(cueAttempt, variant);
  }

  return { level, message };
}

/** Whether the learner may see the correct answer and full explanation. */
export function shouldRevealAnswer(
  attemptNumber: number,
  userRequestedExplanation: boolean,
  isCorrect: boolean,
  opts: { reviewMode?: boolean } = {}
): boolean {
  if (isCorrect) return true;
  const attempts = Math.max(1, Math.floor(attemptNumber));
  if (attempts >= REVEAL_THRESHOLD) return true;
  if (opts.reviewMode) return false;
  if (userRequestedExplanation) return true;
  return false;
}

/** Show the "Show explanation" affordance after the first wrong try. */
export function canOfferExplanation(attemptNumber: number): boolean {
  return Math.max(0, Math.floor(attemptNumber)) >= 1;
}

/** Headline for a correct graded response (cycles lightly by attempt). */
export function getCorrectHeadline(seed = 0, variant: "lesson" | "tower" = "lesson"): string {
  const headlines =
    variant === "tower"
      ? (["Correct.", "Right.", "Correct. See why below."] as const)
      : (["Correct.", "That's it.", "Right. See why below."] as const);
  return headlines[((seed % headlines.length) + headlines.length) % headlines.length];
}

/** Build reveal copy when the answer may be shown after failed attempts. */
export function formatRevealBlock(
  fullExplanation: string | undefined,
  correctAnswerLabel: string | undefined
): string {
  const parts: string[] = [];
  if (correctAnswerLabel?.trim()) {
    parts.push(`The answer is ${correctAnswerLabel.trim()}.`);
  }
  if (fullExplanation?.trim()) {
    parts.push(fullExplanation.trim());
  }
  return parts.join(" ");
}
