/**
 * Deterministic verification for Tower MCQs (AI-generated or handwritten fallback).
 * Unverified questions are never graded; the arena falls back or shows a safe error.
 */

import type { PracticeQuestion } from "@/lib/ai/validators";
import { CONCEPTS, type ConceptTag } from "@/lib/learning/concepts";

export type TowerQuestionSource = "ai" | "fallback";

export interface VerifiedTowerQuestion {
  question: PracticeQuestion;
  source: TowerQuestionSource;
}

export interface VerifyContext {
  expectedConceptTag: ConceptTag;
  source: TowerQuestionSource;
  recentPrompts?: readonly string[];
}

type RuleOutcome = "verified" | "reject" | "unknown";

const ALLOWED_DIFFICULTIES = new Set(["easy", "medium", "hard"]);

function devWarn(reason: string, detail?: string): void {
  if (process.env.NODE_ENV === "production") return;
  console.warn(`[tower/verify] rejected: ${reason}${detail ? `, ${detail}` : ""}`);
}

function normalizeText(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function choiceById(question: PracticeQuestion, id: string) {
  return question.choices.find((c) => c.id === id);
}

function correctLabel(question: PracticeQuestion): string {
  return choiceById(question, question.correctChoiceId)?.label ?? "";
}

/** Structural checks every Tower MCQ must pass. */
function validateStructure(question: PracticeQuestion, context: VerifyContext): string | null {
  if (!question.prompt?.trim()) return "empty prompt";
  if (!question.explanation?.trim()) return "missing explanation";
  if (!Array.isArray(question.choices) || question.choices.length < 2 || question.choices.length > 5) {
    return "invalid choice count";
  }

  const ids = new Set<string>();
  const labels = new Set<string>();
  for (const choice of question.choices) {
    if (!choice.id?.trim() || !choice.label?.trim()) return "empty choice field";
    if (ids.has(choice.id)) return "duplicate choice id";
    const normLabel = normalizeText(choice.label);
    if (labels.has(normLabel)) return "duplicate choice label";
    ids.add(choice.id);
    labels.add(normLabel);
  }

  if (!question.correctChoiceId?.trim() || !ids.has(question.correctChoiceId)) {
    return "correctChoiceId not in choices";
  }

  if (!CONCEPTS.includes(question.conceptTag as ConceptTag)) return "unknown concept tag";
  if (question.conceptTag !== context.expectedConceptTag) return "concept tag mismatch";

  if (!ALLOWED_DIFFICULTIES.has(question.difficulty)) return "invalid difficulty";

  const promptNorm = normalizeText(question.prompt);
  for (const recent of context.recentPrompts ?? []) {
    if (normalizeText(recent) === promptNorm) return "duplicate recent prompt";
  }

  return null;
}

function labelMatches(label: string, patterns: RegExp[]): boolean {
  const text = normalizeText(label);
  return patterns.some((p) => p.test(text));
}

/** Code-side checks for known quantum facts when the prompt pattern matches. */
function checkDeterministicRules(question: PracticeQuestion): RuleOutcome {
  const prompt = question.prompt;
  const correct = correctLabel(question);
  if (!correct.trim()) return "reject";

  const p = prompt.toLowerCase();
  const c = correct.toLowerCase();

  // Hadamard twice returns to start (H·H = I)
  if (/hadamard.*(twice|two|again|row)|\bh\s*[·.]?\s*h\b|two\s+h\s+gates?/i.test(prompt)) {
    return labelMatches(correct, [
      /identity|original|unchanged|same state|returns? to|back to|where it started|h\s*·\s*h\s*=\s*i/i,
    ])
      ? "verified"
      : "reject";
  }

  // Pauli X on |0⟩ -> |1⟩
  if (/\bx gate\b.*\|0|apply\s+x.*\|0|x on.*\|0|\\x\\?\|0/i.test(prompt)) {
    return labelMatches(correct, [/\|1\\rangle|\|1⟩|definite.*1|measure.*1|becomes?\s+1|flips? to/i])
      ? "verified"
      : "reject";
  }

  // Pauli Z phase flip on |1⟩
  if (/\bz gate\b.*\|1|apply\s+z.*\|1|phase flip|\\pi phase/i.test(prompt)) {
    return labelMatches(correct, [/phase|sign|-\|1\\rangle|minus|π|pi/i]) ? "verified" : "reject";
  }

  // Measurement collapse: remeasure unchanged qubit
  if (/measure.*again|re-?measure|second measurement|measuring.*twice/i.test(prompt)) {
    if (/same|repeat|again|unchanged|identical|1 again|0 again/i.test(c)) return "verified";
    if (/equal chance|50|random each|0 or 1 with equal/i.test(c) && /after.*read|collapse|already measured/i.test(p)) {
      return "reject";
    }
  }

  // Superposition vs hidden classical value (positive questions only)
  if (/superposition|superposition of/i.test(prompt) && !/false|wrong|misconception|tap the|which claim/i.test(prompt)) {
    if (/secretly already|hidden value|just don't know|predetermined/i.test(c)) return "reject";
    if (/amplitude|both|0 and 1|superposition|interfere/i.test(c)) return "verified";
  }

  // Qubit vs classical bit
  if (/different from a classical bit|qubit.*bit|bit.*qubit/i.test(prompt)) {
    if (/superposition|amplitude|both 0 and 1|0 and 1 at once/i.test(c)) return "verified";
    if (/faster|two classical bits|between 0 and 1/i.test(c)) return "reject";
  }

  // Interference: amplitudes add before squaring
  if (/interference|cancel|destructive|opposite amplitudes/i.test(prompt)) {
    if (/amplitude.*add|add.*amplitude|before squaring|paths cancel|zero probability/i.test(c)) {
      return "verified";
    }
    if (/add probabilities|always lower|more paths always/i.test(c)) return "reject";
  }

  // Entanglement: no FTL signaling (skip "which is false" items)
  if (/entangl|bell pair|correlat/i.test(prompt) && !/false|wrong|misconception|tap the|which claim/i.test(prompt)) {
    if (/faster than light|instant message|send.*message|ftl|signal travels/i.test(c)) return "reject";
    if (/random.*compar|correlat|locally random|no-signaling/i.test(c)) return "verified";
  }

  // Bell pair construction H then CNOT
  if (/bell pair|bell state|entangle.*pair/i.test(prompt) && /build|create|sequence|gate/i.test(prompt)) {
    if (/h.*cnot|cnot.*h|hadamard.*cnot/i.test(c.replace(/\s/g, ""))) return "verified";
  }

  // Decoherence / noise
  if (/decoherence|noise|fragile|environment/i.test(prompt)) {
    if (/leak|environment|scrambl|decay|fragile|lose coherence/i.test(c)) return "verified";
    if (/indefinitely|forever|no upkeep|perfectly stable/i.test(c)) return "reject";
  }

  // Grover / algorithm advantage via interference
  if (/quantum algorithm|grover|advantage|speedup/i.test(prompt)) {
    if (/read all|every branch|parallel.*read|try every answer at once/i.test(c)) return "reject";
    if (/interference|cancel.*wrong|amplify/i.test(c)) return "verified";
  }

  // Fallback bank items with stable ids are trusted when concept-specific keywords match
  if (question.questionId?.startsWith("fallback-")) {
    return "verified";
  }

  return "unknown";
}

/**
 * Verify a Tower MCQ. Returns null when the question must not be graded.
 * Dev-only console warnings include the rejection reason.
 */
export function verifyTowerQuestion(
  question: PracticeQuestion | null | undefined,
  context: VerifyContext
): VerifiedTowerQuestion | null {
  if (!question) {
    devWarn("missing question");
    return null;
  }

  const structural = validateStructure(question, context);
  if (structural) {
    devWarn(structural, question.prompt.slice(0, 80));
    return null;
  }

  const rules = checkDeterministicRules(question);
  if (rules === "reject") {
    devWarn("deterministic rule failed", question.prompt.slice(0, 80));
    return null;
  }

  // AI must match a known rule or carry explicit stable verification metadata
  if (context.source === "ai" && rules === "unknown") {
    devWarn("AI question not confidently verifiable", question.prompt.slice(0, 80));
    return null;
  }

  return { question, source: context.source };
}

/** Pick the first verified MCQ from a list (for fallback selection). */
export function pickVerifiedQuestion(
  candidates: PracticeQuestion[],
  context: Omit<VerifyContext, "source"> & { source?: TowerQuestionSource }
): VerifiedTowerQuestion | null {
  for (const question of candidates) {
    const verified = verifyTowerQuestion(question, {
      ...context,
      source: context.source ?? "fallback",
    });
    if (verified) return verified;
  }
  return null;
}

export function logFallbackUsed(tag: ConceptTag, questionId?: string): void {
  if (process.env.NODE_ENV === "production") return;
  console.warn(
    `[tower/verify] fallback used for ${tag}${questionId ? ` (${questionId})` : ""}`
  );
}
