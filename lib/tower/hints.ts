/**
 * Tower hint helpers for Bob ("Ask Bob"). Builds AI request payloads and
 * substantive fallbacks tied to the active question and concept.
 */

import type { PracticeQuestion } from "@/lib/ai/validators";
import { CONCEPT_LABEL, type ConceptTag } from "@/lib/learning/concepts";
import {
  getProgressiveFeedback,
  type QuestionContext,
} from "@/lib/learning/progressive-feedback";
import type { LocalChallenge } from "@/lib/tower/arena-challenges";

export type TowerActiveChallenge =
  | { kind: "mcq"; question: PracticeQuestion; usedAI: boolean }
  | { kind: "local"; challenge: LocalChallenge };

export interface TowerHintRequestInput {
  conceptTag: ConceptTag;
  level: number;
  wrongCount: number;
  active: TowerActiveChallenge;
  selectedWrong?: string | null;
  reviewReason?: string;
  misconception?: string;
}

const HINT_FLUFF =
  /spellbook|apprentice|shall we|recall your|conjure|mystic|enchant|wand|grimoire|potion|sage advice|young wizard|brave apprentice/i;

const GENERIC_HINT =
  /^(focus on|what .* rule|reread the|try again|think about|name the core|still off|not yet)/i;

function clampLevel(level: number): 1 | 2 | 3 | 4 {
  return Math.max(1, Math.min(4, Math.floor(level))) as 1 | 2 | 3 | 4;
}

function questionContextFromActive(active: TowerActiveChallenge, conceptTag: ConceptTag): QuestionContext {
  if (active.kind === "mcq") {
    const q = active.question;
    return {
      conceptTag,
      fullExplanation: q.explanation,
      correctAnswerLabel: q.choices.find((c) => c.id === q.correctChoiceId)?.label,
    };
  }
  const ch = active.challenge;
  const options = "options" in ch ? ch.options : undefined;
  const correctId = "correctId" in ch ? ch.correctId : undefined;
  return {
    conceptTag,
    fullExplanation: ch.explanation,
    correctAnswerLabel: options?.find((o) => o.id === correctId)?.label,
  };
}

function wrongChoiceNudge(selectedWrong: string | null | undefined, level: number): string | undefined {
  if (!selectedWrong?.trim() || level >= 4) return undefined;
  const trimmed = selectedWrong.trim();
  if (trimmed.length > 120) {
    return `Your last pick ("${trimmed.slice(0, 117)}…") misses what this question is testing.`;
  }
  return `Your last pick ("${trimmed}") misses what this question is testing.`;
}

function localKindHint(kind: LocalChallenge["kind"], conceptLabel: string, level: number): string {
  switch (kind) {
    case "order":
      return level <= 2
        ? `Which ${conceptLabel} step must happen before the outcome in this setup?`
        : "Order the steps by cause and effect. What must happen before measurement?";
    case "slots":
      return level <= 2
        ? `How many gates does this ${conceptLabel} circuit need, and in what order?`
        : "Place the first gate that sets up the state, then add gates in application order.";
    case "mistake":
      return level <= 2
        ? `Which claim breaks a ${conceptLabel} rule in this scenario?`
        : "Find the claim that contradicts measurement, reversibility, or interference.";
    case "explain":
      return level <= 2
        ? `Which explanation names the ${conceptLabel} mechanism at work here?`
        : "Reject answers that swap cause and effect or confuse gates with measurement.";
    case "prediction":
      return `What do you predict will happen in this ${conceptLabel} setup before you measure?`;
    case "bloch":
      return "Which Bloch-sphere point matches the state described in the prompt?";
    case "match":
      return "Match each gate or setup to the outcome it produces in this scenario.";
    case "estimate":
      return "Use the given state to estimate the measurement probability. Square amplitudes, do not guess.";
    case "interference":
      return "Do the paths combine constructively or destructively before you square amplitudes?";
    case "fill":
      return "Which gate belongs in the missing slot to produce the described effect?";
    default:
      return `What ${conceptLabel} rule does this setup assume?`;
  }
}

/** Handwritten fallback when AI is off or returns unusable text. */
export function towerHintFallback(input: TowerHintRequestInput): string {
  const level = clampLevel(input.level);
  const conceptLabel = CONCEPT_LABEL[input.conceptTag];
  const ctx = questionContextFromActive(input.active, input.conceptTag);
  const progressive = getProgressiveFeedback(input.wrongCount, ctx, "tower");
  const nudge = wrongChoiceNudge(input.selectedWrong, level);

  if (input.active.kind === "local") {
    const kindHint = localKindHint(input.active.challenge.kind, conceptLabel, level);
    if (level >= 4 && ctx.fullExplanation?.trim()) {
      return nudge ? `${nudge} ${ctx.fullExplanation.trim()}` : ctx.fullExplanation.trim();
    }
    const base = level <= 3 ? progressive.message : kindHint;
    return nudge ? `${nudge} ${base}` : base;
  }

  const q = input.active.question;
  const progressiveFromQuestion =
    q.progressiveHints && level <= 3 ? q.progressiveHints[level - 1] : undefined;
  let base = progressiveFromQuestion ?? progressive.message;

  if (level >= 4 && q.explanation?.trim()) {
    base = q.explanation.trim();
  }

  if (input.misconception?.trim() && level >= 2 && level <= 3) {
    base = `${base} Watch for: ${input.misconception.trim()}`;
  }

  return nudge ? `${nudge} ${base}` : base;
}

/** Body for POST /api/ai/hint from the Tower arena. */
export function buildTowerHintPayload(input: TowerHintRequestInput): Record<string, unknown> {
  const level = clampLevel(input.level);
  const conceptLabel = CONCEPT_LABEL[input.conceptTag];

  const base: Record<string, unknown> = {
    lessonTitle: conceptLabel,
    conceptTag: input.conceptTag,
    conceptLabel,
    level,
    wrongAttemptCount: input.wrongCount,
    pageKind: "tower",
    companion: "bob",
  };

  if (input.reviewReason?.trim()) {
    base.reviewReason = input.reviewReason.trim();
  }
  if (input.misconception?.trim()) {
    base.misconception = input.misconception.trim();
  }
  if (input.selectedWrong?.trim()) {
    base.selectedWrong = input.selectedWrong.trim();
  }

  if (input.active.kind === "mcq") {
    const q = input.active.question;
    base.prompt = q.prompt;
    base.correctAnswer = q.choices.find((c) => c.id === q.correctChoiceId)?.label;
    if (level >= 3) {
      base.feedback = q.explanation;
    }
    if (q.misconception && !base.misconception) {
      base.misconception = q.misconception;
    }
    base.choices = q.choices.map((c) => c.label).join(" | ");
  } else {
    const ch = input.active.challenge;
    base.prompt = ch.prompt;
    if ("options" in ch && ch.options?.length) {
      base.choices = ch.options.map((o) => o.label).join(" | ");
      base.correctAnswer = ch.options.find((o) => o.id === ch.correctId)?.label;
    }
    if (level >= 3) {
      base.feedback = ch.explanation;
    }
    if ("misconception" in ch && ch.misconception && !base.misconception) {
      base.misconception = ch.misconception;
    }
  }

  return base;
}

/** Reject fluffy or overly generic AI hints; fall back to handwritten content. */
export function sanitizeTowerHint(raw: string, input: TowerHintRequestInput): string {
  const trimmed = raw.trim();
  if (!trimmed || trimmed.length < 20 || HINT_FLUFF.test(trimmed) || GENERIC_HINT.test(trimmed)) {
    return towerHintFallback(input);
  }
  return trimmed;
}
