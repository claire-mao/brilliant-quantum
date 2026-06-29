/**
 * Validation for AI-generated practice questions. The model is asked for strict
 * JSON, but we never trust it: parse defensively and return null on anything
 * malformed so callers can show a safe fallback instead of crashing.
 */

export type Difficulty = "easy" | "medium" | "hard";

export interface PracticeChoice {
  id: string;
  label: string;
}

export interface PracticeQuestion {
  /** Stable id for dedup and verification (handwritten fallbacks). */
  questionId?: string;
  prompt: string;
  choices: PracticeChoice[];
  correctChoiceId: string;
  explanation: string;
  conceptTag: string;
  difficulty: Difficulty;
  /** Optional learning-science metadata (grounds the item in prior knowledge). */
  prerequisite?: string;
  misconception?: string;
  /** Progressive hints for wrong attempts (retrieval → concept). */
  progressiveHints?: [string, string, string];
}

function asNonEmptyString(value: unknown): string | null {
  return typeof value === "string" && value.trim() !== "" ? value.trim() : null;
}

/** Parse and validate a practice question from raw model output. */
export function parsePractice(raw: string): PracticeQuestion | null {
  let parsed: unknown = null;
  try {
    parsed = JSON.parse(raw);
  } catch {
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) return null;
    try {
      parsed = JSON.parse(match[0]);
    } catch {
      return null;
    }
  }

  if (!parsed || typeof parsed !== "object") return null;
  const obj = parsed as Record<string, unknown>;

  const prompt = asNonEmptyString(obj.prompt);
  const explanation = asNonEmptyString(obj.explanation);
  if (!prompt || !explanation) return null;

  if (!Array.isArray(obj.choices)) return null;
  const choices: PracticeChoice[] = [];
  for (const entry of obj.choices) {
    if (!entry || typeof entry !== "object") return null;
    const choice = entry as Record<string, unknown>;
    const id = asNonEmptyString(choice.id);
    const label = asNonEmptyString(choice.label);
    if (!id || !label) return null;
    choices.push({ id, label });
  }
  if (choices.length < 2 || choices.length > 5) return null;

  const ids = new Set(choices.map((c) => c.id));
  if (ids.size !== choices.length) return null;

  const correctChoiceId = asNonEmptyString(obj.correctChoiceId);
  if (!correctChoiceId || !ids.has(correctChoiceId)) return null;

  const conceptTag = asNonEmptyString(obj.conceptTag) ?? "quantum-computing";
  const difficultyRaw = asNonEmptyString(obj.difficulty) ?? "medium";
  const difficulty: Difficulty =
    difficultyRaw === "easy" || difficultyRaw === "hard" ? difficultyRaw : "medium";

  // Optional learning-science metadata: passed through when present, ignored otherwise.
  const prerequisite = asNonEmptyString(obj.prerequisite) ?? undefined;
  const misconception = asNonEmptyString(obj.misconception) ?? undefined;

  return { prompt, choices, correctChoiceId, explanation, conceptTag, difficulty, prerequisite, misconception };
}
