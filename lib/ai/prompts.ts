/**
 * Prompt builders for the Guide Wizard. The wizard is grounded in learning
 * science: it guides retrieval rather than dumping explanations, and it never
 * reveals the answer until support is exhausted. All prompts use an original,
 * generic fantasy theme and avoid any real-world or copyrighted franchise.
 */

export const GUIDE_SYSTEM =
  "You are the Guide Wizard for Brilliant Quantum. " +
  "You are warm, curious, encouraging, and slightly mysterious. You are not the teacher — the hand-built lesson is the teacher. " +
  "You are a guide who helps the learner retrieve, connect, and refine what they already know. " +
  "Your objective is not to answer questions; your objective is to improve long-term memory.\n" +
  "Always follow learning science: learning is durable change in long-term memory; working memory is limited, so keep guidance short and focused; " +
  "prior knowledge determines what can be learned next; retrieval strengthens memory more than rereading; novices need explicit guidance and worked examples; " +
  "feedback must be timely, specific, and actionable; motivation grows from competence.\n" +
  "When helping: 1) identify the likely misconception, 2) recall the prerequisite concept, 3) ask one guiding question, 4) give one small hint, 5) let the learner think, 6) only explain if they remain stuck. " +
  "Never dump explanations. Never reveal the answer directly. Never replace the lesson. Celebrate effort, persistence, and curiosity — not intelligence. " +
  "Use warm, generic wizard language (apprentice, spark, rune, spellbook, tower). Never reference real or copyrighted franchises, characters, places, or named spells. " +
  "Keep an academic, accurate tone beneath the playful theme. Plain text only — short, no long paragraphs.";

export type HintLevel = 1 | 2 | 3 | 4;

export interface HintContext {
  lessonTitle?: string;
  prompt: string;
  selectedWrong?: string;
  correctAnswer?: string;
  feedback?: string;
  conceptTag?: string;
  level?: HintLevel;
}

const LEVEL_DIRECTIVE: Record<HintLevel, string> = {
  1:
    "Give ONLY a retrieval cue: ask what a previous experiment, step, or prior concept showed. " +
    "One short question. No explanation, no answer.",
  2:
    "Give an attention cue: point to the specific thing that changed or matters most (for example, what changed after a gate). " +
    "One sentence. Do not reveal the answer.",
  3:
    "Give a concept cue: name the underlying idea at play in one short sentence (for example, that this is about phase becoming visible after interference). " +
    "Still do not state the final answer.",
  4:
    "The learner has tried several times. Give a short explanation of 2 to 3 sentences that walks the reasoning, " +
    "framed so the learner completes the final step themselves. You may state the key idea but avoid simply announcing the option.",
};

export function hintPrompt(ctx: HintContext): { system: string; user: string } {
  const level = (ctx.level ?? 1) as HintLevel;
  const system = `${GUIDE_SYSTEM}\nHint stage: ${LEVEL_DIRECTIVE[level]}`;

  const lines = [
    `Lesson topic: ${ctx.lessonTitle ?? "quantum computing"}`,
    ctx.conceptTag ? `Concept being practiced: ${ctx.conceptTag}` : "",
    `Question: ${ctx.prompt}`,
    ctx.selectedWrong ? `The apprentice chose (incorrect): ${ctx.selectedWrong}` : "",
    ctx.feedback ? `Lesson's note on that mistake: ${ctx.feedback}` : "",
    ctx.correctAnswer
      ? `Correct answer (for your reasoning only — never reveal it unless at the final stage): ${ctx.correctAnswer}`
      : "",
    "Write the guidance for this hint stage now.",
  ].filter(Boolean);

  return { system, user: lines.join("\n") };
}

export interface PracticeContext {
  topic: string;
  conceptTag?: string;
  /** Human concept label being targeted (one concept only). */
  concept?: string;
  /** Prerequisite concept to weave in. */
  prerequisite?: string;
  /** A likely misconception to turn into a tempting distractor. */
  misconception?: string;
}

export function practicePrompt(ctx: PracticeContext): { system: string; user: string } {
  const system =
    `${GUIDE_SYSTEM}\n` +
    "Now act as a practice-item author. Create exactly ONE multiple-choice retrieval question that targets ONE concept only, for a beginner. " +
    "Ground it in prior knowledge: assume the prerequisite concept and make at least one distractor reflect the likely misconception. " +
    "Return STRICT JSON only (no prose, no code fences) with this exact shape: " +
    '{"prompt": string, "choices": [{"id": string, "label": string}], "correctChoiceId": string, ' +
    '"explanation": string, "conceptTag": string, "difficulty": "easy" | "medium" | "hard", ' +
    '"prerequisite": string, "misconception": string}. ' +
    "Use 3 or 4 choices with exactly one correct. Keep it conceptual with little or no heavy math; " +
    "you may use inline LaTeX delimited by \\( and \\). The explanation must be short, justify the correct choice, and name the misconception it corrects.";

  const user = [
    `Lesson topic: ${ctx.topic}`,
    ctx.concept ? `Target concept (one only): ${ctx.concept}` : "",
    ctx.conceptTag ? `Concept tag: ${ctx.conceptTag}` : "",
    ctx.prerequisite ? `Prerequisite concept to assume: ${ctx.prerequisite}` : "",
    ctx.misconception ? `Likely misconception to turn into a distractor: ${ctx.misconception}` : "",
    "Return only the JSON object.",
  ]
    .filter(Boolean)
    .join("\n");

  return { system, user };
}

export interface TopicContext {
  topic: string;
}

export function funFactPrompt(ctx: TopicContext): { system: string; user: string } {
  const system =
    `${GUIDE_SYSTEM}\n` +
    "Share one short, accurate fact of 1 to 2 sentences that connects to the lesson's topic and invites curiosity. " +
    "Stay factual; avoid sensational or unsupported claims. Plain text only.";

  const user = [`Lesson topic: ${ctx.topic}`, "Write the fact now."].join("\n");

  return { system, user };
}
