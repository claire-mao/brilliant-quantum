/**
 * Prompt builders for the Wizard. The wizard is grounded in learning science: it
 * guides retrieval rather than dumping explanations, it walks the learner step by
 * step, and it never reveals the answer until support is exhausted. All prompts
 * use an original, generic fantasy theme and avoid any real-world or copyrighted
 * franchise.
 */

export const GUIDE_SYSTEM =
  "You are the Wizard of Brilliant Quantum. " +
  "You are warm, curious, encouraging, and slightly mysterious. You are not the teacher; the hand-built lesson is the teacher. " +
  "You are a wizard who helps the learner retrieve, connect, and refine what they already know. " +
  "Your objective is not to answer questions; your objective is to improve long-term memory.\n" +
  "Always follow learning science: learning is durable change in long-term memory; working memory is limited, so keep guidance short and focused; " +
  "prior knowledge determines what can be learned next; retrieval strengthens memory more than rereading; novices need explicit guidance and worked examples; " +
  "feedback must be timely, specific, and actionable; motivation grows from competence.\n" +
  "Guide step by step. Reveal one small step at a time, and after each hint keep guiding the learner toward the next step instead of stopping. " +
  "When helping: 1) identify the likely misconception, 2) recall the prerequisite concept, 3) ask one guiding question, 4) give one small hint, 5) let the learner think, 6) only explain after several attempts. " +
  "Never dump explanations. Never reveal the answer directly. Never replace the lesson. Celebrate effort, persistence, and curiosity, not intelligence. " +
  "Use warm, generic wizard language (apprentice, spark, rune, spellbook, tower). Never reference real or copyrighted franchises, characters, places, or named spells. " +
  "Keep an academic, accurate tone beneath the playful theme. Plain text only. Keep replies short, with no long paragraphs.";

export type HintLevel = 1 | 2 | 3 | 4;

export type PageKind = "dashboard" | "lesson" | "tower" | "profile";

export interface HintContext {
  lessonTitle?: string;
  prompt: string;
  selectedWrong?: string;
  correctAnswer?: string;
  feedback?: string;
  conceptTag?: string;
  /** Human-readable concept name (e.g. "Superposition"). */
  conceptLabel?: string;
  level?: HintLevel;
  /** Where the learner is in the app — keeps AI guidance page-relevant. */
  pageKind?: PageKind;
  /** Tower companion voice: Bob is plain and question-specific, not wizard-fluffy. */
  companion?: "wizard" | "bob";
  wrongAttemptCount?: number;
  reviewReason?: string;
  misconception?: string;
  /** Choice labels joined for context (never reveal which is correct before stage 4). */
  choices?: string;
}

const LEVEL_DIRECTIVE: Record<HintLevel, string> = {
  1:
    "Give ONLY a retrieval cue tied to THIS question: ask what rule, setup, or prior step the prompt assumes. " +
    "One short question referencing a concrete detail from the prompt. No explanation, no answer.",
  2:
    "Give an attention cue: point to the specific detail in THIS question that matters most " +
    "(a gate, measurement, state, or comparison in the prompt). One or two sentences. Do not reveal the answer.",
  3:
    "Give a concept cue: name the underlying quantum idea this question tests and why the wrong pick fails. " +
    "Reference the prompt or the learner's wrong choice. Still do not state the final answer.",
  4:
    "The learner has tried several times. Give 2 to 3 sentences walking the reasoning for THIS question, " +
    "framed so the learner completes the final step themselves. You may state the key idea but avoid simply announcing the option.",
};

const BOB_SYSTEM =
  "You are Bob, Alice's scholar ally in the Quantum Tower. " +
  "You give concise, accurate hints that help the learner retrieve the right idea. " +
  "You are warm and direct, not mystical. No wizard fluff (no spellbook, apprentice, wand, or runes). " +
  "Every hint must reference something specific in the current question prompt or the learner's wrong choice. " +
  "Never reveal the correct option before the final hint stage. Plain text only; one sentence for stages 1–3, up to three for stage 4.";

const BOB_LEVEL_DIRECTIVE: Record<HintLevel, string> = {
  1:
    "Stage 1 (retrieval): Ask one guiding question about a concrete detail in the prompt " +
    "(setup, state, gate, or comparison). One sentence. Do not explain yet.",
  2:
    "Stage 2 (attention): Name the key detail in the prompt the learner should focus on. " +
    "If they picked wrong, say what that choice assumes and why it does not fit this setup. One sentence. No answer yet.",
  3:
    "Stage 3 (concept): State the core quantum rule this question tests and how it applies here. " +
    "One sentence. Contrast with the wrong choice if helpful. Do not name the correct option.",
  4:
    "Stage 4 (reasoning): Walk through the logic for this specific question in 2 to 3 sentences. " +
    "The learner should be able to pick the right option after reading, but do not quote the correct label.",
};

export function hintPrompt(ctx: HintContext): { system: string; user: string } {
  const level = (ctx.level ?? 1) as HintLevel;
  const isBob = ctx.companion === "bob" || ctx.pageKind === "tower";
  const system = isBob
    ? `${BOB_SYSTEM}\n${BOB_LEVEL_DIRECTIVE[level]}`
    : `${GUIDE_SYSTEM}\nHint stage: ${LEVEL_DIRECTIVE[level]}`;

  const conceptLine = ctx.conceptLabel
    ? `Concept being practiced: ${ctx.conceptLabel}${ctx.conceptTag ? ` (${ctx.conceptTag})` : ""}`
    : ctx.conceptTag
      ? `Concept being practiced: ${ctx.conceptTag}`
      : "";

  const lines = [
    ctx.pageKind ? `Current page: ${ctx.pageKind}` : "",
    isBob ? "Companion: Bob (Tower hints)" : "",
    `Lesson topic: ${ctx.lessonTitle ?? "quantum computing"}`,
    conceptLine,
    ctx.wrongAttemptCount != null && ctx.wrongAttemptCount > 0
      ? `Wrong attempts so far on this question: ${ctx.wrongAttemptCount}`
      : "",
    ctx.reviewReason ? `Why this is a review question: ${ctx.reviewReason}` : "",
    `Question: ${ctx.prompt}`,
    ctx.choices ? `Answer choices (do not reveal which is correct before stage 4): ${ctx.choices}` : "",
    ctx.selectedWrong ? `Learner's last wrong choice: ${ctx.selectedWrong}` : "",
    ctx.misconception ? `Likely misconception behind wrong picks: ${ctx.misconception}` : "",
    ctx.feedback ? `Explanation note (for your reasoning — do not copy verbatim before stage 4): ${ctx.feedback}` : "",
    ctx.correctAnswer
      ? `Correct answer (for your reasoning only — never reveal before stage 4): ${ctx.correctAnswer}`
      : "",
    isBob
      ? "Write Bob's hint for this stage now. Be specific to this question."
      : "Write the guidance for this hint stage now.",
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

export interface TowerPracticeContext extends PracticeContext {
  floor?: number;
  roomType?: string;
  difficulty?: "easy" | "medium" | "hard";
  /** Recent misconception texts from the learner model. */
  learnerMisconceptions?: string[];
  /** Concept labels the learner has mastered. */
  masteredConcepts?: string[];
  /** Concept labels due for review. */
  dueConcepts?: string[];
  /** Recent question prompts to avoid repeating. */
  recentPrompts?: string[];
  /** Preferred interaction kind for this room. */
  interactionKind?: string;
  /** Why this concept is targeted for review (Grimoire / learner model). */
  reviewReason?: string;
  /** Course unit title for grounding. */
  unitTitle?: string;
  /** Primary lesson title for the concept. */
  lessonTitle?: string;
  /** Recent wrong-answer pattern to address in distractors. */
  recentWrongPattern?: string;
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

/** Tower-specific practice generation with floor, room, and learner context. */
export function towerPracticePrompt(ctx: TowerPracticeContext): { system: string; user: string } {
  const system =
    `${GUIDE_SYSTEM}\n` +
    "Now act as a Tower battle question author. " +
    "Create exactly ONE multiple-choice retrieval question targeting ONE concept. " +
    "Prompt: 1 to 2 short sentences, direct, plain language, no em dashes, no fantasy framing in the question text. " +
    "Vary wording, scenarios, and distractors from recent prompts. Never recycle the same setup. " +
    "Ground distractors in likely misconceptions when provided. " +
    "Return STRICT JSON only (no prose, no code fences) with this exact shape: " +
    '{"prompt": string, "choices": [{"id": string, "label": string}], "correctChoiceId": string, ' +
    '"explanation": string, "conceptTag": string, "difficulty": "easy" | "medium" | "hard", ' +
    '"prerequisite": string, "misconception": string}. ' +
    "Use 3 or 4 choices with exactly one correct. Conceptual, minimal math; inline LaTeX with \\( \\) is fine. " +
    "Explanation: 1 to 3 sentences, plain language first, then name the misconception it corrects. " +
    "Physics must stay accurate. Question text stays factual, not storybook.";

  const user = [
    ctx.floor != null ? `Tower floor: ${ctx.floor}` : "",
    ctx.roomType ? `Room type: ${ctx.roomType}` : "",
    ctx.interactionKind ? `Preferred interaction style: ${ctx.interactionKind}` : "",
    ctx.difficulty ? `Target difficulty: ${ctx.difficulty}` : "",
    `Target concept: ${ctx.concept ?? ctx.topic}`,
    ctx.conceptTag ? `Concept tag: ${ctx.conceptTag}` : "",
    ctx.prerequisite ? `Prerequisite to assume: ${ctx.prerequisite}` : "",
    ctx.misconception ? `Likely misconception for a distractor: ${ctx.misconception}` : "",
    ctx.learnerMisconceptions?.length
      ? `Other recent misconceptions: ${ctx.learnerMisconceptions.slice(0, 4).join("; ")}`
      : "",
    ctx.masteredConcepts?.length ? `Mastered concepts: ${ctx.masteredConcepts.slice(0, 6).join(", ")}` : "",
    ctx.dueConcepts?.length ? `Due for review: ${ctx.dueConcepts.slice(0, 6).join(", ")}` : "",
    ctx.reviewReason ? `Review reason (target this): ${ctx.reviewReason}` : "",
    ctx.unitTitle ? `Related unit: ${ctx.unitTitle}` : "",
    ctx.lessonTitle ? `Related lesson: ${ctx.lessonTitle}` : "",
    ctx.recentWrongPattern ? `Recent wrong pattern to address: ${ctx.recentWrongPattern}` : "",
    ctx.recentPrompts?.length
      ? `Do NOT repeat or closely paraphrase these recent prompts:\n${ctx.recentPrompts.slice(0, 8).map((p) => `- ${p}`).join("\n")}`
      : "",
    "Return only the JSON object.",
  ]
    .filter(Boolean)
    .join("\n");

  return { system, user };
}

export interface TopicContext {
  topic: string;
  pageKind?: PageKind;
}

export function funFactPrompt(ctx: TopicContext): { system: string; user: string } {
  const pageNote =
    ctx.pageKind === "dashboard"
      ? "The apprentice is on the course dashboard — a fact that connects to their ongoing study path is welcome. "
      : ctx.pageKind === "profile"
        ? "The apprentice is reviewing their profile — a fact about learning, persistence, or discovery in quantum science fits well. "
        : ctx.pageKind === "lesson"
          ? "The apprentice is inside a lesson — tie the fact lightly to the lesson topic when natural. "
          : "";

  const system =
    `${GUIDE_SYSTEM}\n` +
    "Now share exactly one fun fact from the history of quantum computing and quantum information: " +
    "a discovery, invention, experiment, or breakthrough by a scientist or team. " +
    "Keep it short: one or two sentences maximum. " +
    "Focus on real people, dates or eras, and what they found or built (for example Bell's inequalities, Shor's algorithm, " +
    "Feynman's quantum simulator proposal, superconducting qubits, trapped ions, or early transistor-era quantum ideas). " +
    "Do not explain generic lesson concepts like superposition or interference unless tied to a specific historical moment. " +
    pageNote +
    "Be accurate and genuinely interesting. Use a calm, matter of fact tone. " +
    "No hype, no overstated claims, no em dashes, no emojis. Plain text only.";

  const user = [
    ctx.pageKind ? `Current page: ${ctx.pageKind}` : "",
    `Lesson topic: ${ctx.topic}`,
    "Share one short, accurate discovery or invention fun fact from quantum computing history now.",
  ]
    .filter(Boolean)
    .join("\n");

  return { system, user };
}
