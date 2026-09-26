/**
 * Prompt + response contract for the context-aware Guide Wizard
 * (POST /api/wizard). Provider-agnostic: the route feeds the prompt to Claude
 * and hands the raw text back to `parseWizardReply`.
 */

export type WizardAction = "hint" | "practice" | "fun_fact";
export type WizardHintLevel = 1 | 2 | 3;

export interface WizardRequest {
  action: WizardAction;
  lessonId?: string;
  lessonTitle?: string;
  step?: string;
  concept?: string;
  question?: string;
  choices?: string[];
  studentAnswer?: string | null;
  /** Resolved server-side from lesson content; never sent by the client. */
  correctAnswer?: string;
  /** Feedback shown for the learner's last wrong choice (names the misconception). */
  attemptFeedback?: string;
  incorrectAttempts?: number;
  hintLevel?: WizardHintLevel;
  /** Previously shown practice questions to steer away from. */
  avoid?: string[];
  /** Recently shown fun facts (client keeps the last few). */
  avoidFacts?: string[];
  /** Explanatory text of the current step, when there is no question. */
  stepSummary?: string;
}

export interface WizardReply {
  /** Bubble text: the hint, the practice question, or the fact. */
  text: string;
  /** Practice only: short expected answer for the reveal button. */
  answer?: string;
}

export const WIZARD_ACTIONS: WizardAction[] = ["hint", "practice", "fun_fact"];

export function toHintLevel(value: unknown): WizardHintLevel {
  const n = typeof value === "number" ? value : Number(value);
  if (n >= 3) return 3;
  if (n === 2) return 2;
  return 1;
}

const PERSONA =
  "You are the Guide Wizard, a terse, warm mentor inside Brilliant Quantum, an interactive quantum computing course. " +
  "You speak in a small speech bubble, so keep replies short (max 2 sentences, under 220 characters unless told otherwise), plain text, no markdown, no emoji, no greetings. " +
  "Be accurate about quantum physics: describe superposition as amplitudes for both outcomes, not 'both values at once', and never claim quantum computers 'try every solution simultaneously'. Never invent experiment details or learner actions that are not in the context.";

const HINT_LEVEL_GUIDE: Record<WizardHintLevel, string> = {
  1: "Hint level 1 = conceptual nudge: point at the idea the question is really testing, phrased around THIS question. Do not mention any answer choice.",
  2: "Hint level 2 = specific reasoning direction: tell the learner what to compare or check in this exact question so they can narrow the choices. You may rule out a wrong idea, but do not name the correct choice.",
  3: "Hint level 3 = strong guidance: walk them to the brink of the answer with the key reasoning step, so the correct choice becomes obvious, but still do not state the answer or quote the correct choice. Phrase the final step as a question the learner answers themselves (e.g. 'so can it hold both at once?') rather than as a fact; if the question is yes/no or the fact would settle it outright, never state that fact.",
};

function contextBlock(req: WizardRequest): string {
  const lines: string[] = [];
  if (req.lessonTitle) lines.push(`Lesson: ${req.lessonTitle}${req.lessonId ? ` (${req.lessonId})` : ""}`);
  if (req.step) lines.push(`Current step: ${req.step}`);
  if (req.concept) lines.push(`Concept: ${req.concept}`);
  if (req.stepSummary) lines.push(`Step text: ${req.stepSummary}`);
  if (req.question) lines.push(`Question on screen: ${req.question}`);
  if (req.choices?.length) lines.push(`Answer choices: ${req.choices.map((c, i) => `(${i + 1}) ${c}`).join(" ")}`);
  if (req.correctAnswer) lines.push(`Correct answer (NEVER reveal or quote it): ${req.correctAnswer}`);
  if (req.studentAnswer) lines.push(`Learner's current/selected answer: ${req.studentAnswer}`);
  if (req.incorrectAttempts) lines.push(`Incorrect attempts so far: ${req.incorrectAttempts}`);
  if (req.attemptFeedback) lines.push(`Feedback already shown for their wrong pick: ${req.attemptFeedback}`);
  return lines.join("\n");
}

export function wizardPrompt(req: WizardRequest): { system: string; user: string } {
  const ctx = contextBlock(req);
  const avoidList = req.action === "fun_fact" ? [...(req.avoidFacts ?? []), ...(req.avoid ?? [])] : req.avoid ?? [];
  const avoid = avoidList.length
    ? `\nAlready shown this session (do NOT repeat or closely paraphrase any of these):\n${avoidList.map((a) => `- ${a}`).join("\n")}`
    : "";

  if (req.action === "hint") {
    const level = req.hintLevel ?? 1;
    const hasQuestion = Boolean(req.question);
    const task = hasQuestion
      ? `Give hint level ${level} for the question on screen. ${HINT_LEVEL_GUIDE[level]} ` +
        `Reference the specifics of this question (its setup, wording, or what changed) so it could not apply to a different question. ` +
        (req.studentAnswer && req.incorrectAttempts
          ? "The learner already picked a wrong answer: address why that line of thinking misses, without saying which choice is right. "
          : "")
      : `There is no question on this step. Give one concrete learning nudge about the step text: what to notice or predict before moving on. Do not ask a generic question.`;
    return {
      system: `${PERSONA}\n\nReturn ONLY a JSON object: {"text": string}. No markdown, no code fences.`,
      user: `${ctx}\n\nTask: ${task}`,
    };
  }

  if (req.action === "practice") {
    return {
      system:
        `${PERSONA}\n\nReturn ONLY a JSON object: {"text": string, "answer": string}. ` +
        `"text" is one short practice question (max 200 characters) answerable in the learner's head, no long calculation. ` +
        `"answer" is the expected answer in one short sentence (max 120 characters). No markdown, no code fences.`,
      user:
        `${ctx}${avoid}\n\nTask: Write ONE new conceptual practice question tied to this exact step and concept. ` +
        `It must test the same idea from a DIFFERENT angle or scenario than the question already on screen: do not paraphrase it, reuse its setup, or ask about the same outcome. Also avoid anything in the avoid list. Prefer predict-the-outcome or which-is-true style. ` +
        `Do not include the answer in the question text.`,
    };
  }

  return {
    system: `${PERSONA}\n\nReturn ONLY a JSON object: {"text": string}. No markdown, no code fences.`,
    user:
      `${ctx}${avoid}\n\nTask: Share ONE short, accurate, interesting fun fact (max 220 characters) directly connected to the current lesson step or concept: ` +
      `history, a real experiment, a surprising consequence, or a real quantum technology that uses this idea. ` +
      `It must be different in substance from every fact in the already-shown list: do not repeat, reword, or closely paraphrase any of them, and pick a different angle (e.g. history vs. technology vs. experiment). ` +
      `Do not restate the step text or ask a question.`,
  };
}

function stripFences(raw: string): string {
  return raw.replace(/^\s*```(?:json)?\s*/i, "").replace(/\s*```\s*$/, "").trim();
}

function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/[|⟩⟨]/g, "")
    .replace(/[^a-z0-9%]+/g, " ")
    .trim();
}

/**
 * True when a hint quotes the correct choice (whole label, or all of its
 * meaningful words in order) so the route can retry or fall back instead of
 * handing the answer over.
 */
export function hintRevealsAnswer(text: string, correctAnswer: string | undefined): boolean {
  if (!correctAnswer) return false;
  const hint = normalize(text);
  const answer = normalize(correctAnswer);
  if (!answer) return false;
  if (answer.length >= 3 && hint.includes(answer)) return true;
  const words = answer.split(" ").filter((w) => w.length > 2 && !STOP_WORDS.has(w));
  if (words.length < 2) return false;
  const pattern = new RegExp(words.map((w) => w.replace(/[.*+?^${}()[\]\\]/g, "\\$&")).join("\\s+(?:\\w+\\s+){0,2}"));
  return pattern.test(hint);
}

const STOP_WORDS = new Set(["the", "and", "that", "this", "with", "for", "its", "are", "was", "will", "can", "not"]);

export function parseWizardReply(raw: string, action: WizardAction): WizardReply | null {
  const cleaned = stripFences(raw);
  let obj: unknown = null;
  try {
    obj = JSON.parse(cleaned);
  } catch {
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start >= 0 && end > start) {
      try {
        obj = JSON.parse(cleaned.slice(start, end + 1));
      } catch {
        obj = null;
      }
    }
  }
  // Tolerate a bare sentence for text-only actions.
  if (!obj || typeof obj !== "object") {
    if (action !== "practice" && cleaned && !cleaned.startsWith("{")) return { text: cleaned };
    return null;
  }
  const rec = obj as Record<string, unknown>;
  const text = typeof rec.text === "string" ? rec.text.trim() : "";
  if (!text) return null;
  if (action === "practice") {
    const answer = typeof rec.answer === "string" ? rec.answer.trim() : "";
    if (!answer) return null;
    return { text, answer };
  }
  return { text };
}
