/**
 * Adaptive Teach-Back tutor: shared types, the formative-assessment prompt,
 * a strict validator for the model's structured output, and a handwritten
 * fallback analysis so the flow keeps working when no Llama key is configured.
 *
 * Safe to import from client code (no secrets, no network calls).
 */

import { primaryConcept, type ConceptTag } from "@/lib/learning/concepts";

/**
 * Lessons whose teach-back target differs from their first tagged concept
 * (e.g. the opening lesson is tagged qubits+superposition, but the idea worth
 * explaining back is superposition).
 */
const TEACHBACK_CONCEPT_OVERRIDE: Record<string, ConceptTag> = {
  "qubits-superposition": "superposition",
  hadamard: "superposition",
};

export function teachBackConcept(lessonId: string): ConceptTag | null {
  return TEACHBACK_CONCEPT_OVERRIDE[lessonId] ?? primaryConcept(lessonId);
}

export type TeachingStrategy =
  | "affirm-and-extend"
  | "correct-misconception"
  | "fill-gap"
  | "contrast-cases"
  | "worked-example"
  | "analogy-repair";

export const TEACHING_STRATEGIES: TeachingStrategy[] = [
  "affirm-and-extend",
  "correct-misconception",
  "fill-gap",
  "contrast-cases",
  "worked-example",
  "analogy-repair",
];

export interface TeachBackAnalysis {
  concept: string;
  /** 0–100 estimate of conceptual mastery shown in the explanation. */
  masteryScore: number;
  correctIdeas: string[];
  misconceptions: string[];
  missingIdeas: string[];
  teachingStrategy: TeachingStrategy;
  tutorResponse: string;
  followUpQuestion: string;
}

export interface TeachBackContext {
  lessonId: string;
  lessonTitle: string;
  conceptTag: ConceptTag;
  conceptLabel: string;
  /** Short list of the ideas the lesson actually teaches (grounds the rubric). */
  keyIdeas: string[];
  transcript: string;
  /** Learner's previous mastery for this concept, if any. */
  priorMastery?: number | null;
}

/** What each concept's lesson expects a learner to be able to explain. */
export const CONCEPT_KEY_IDEAS: Record<ConceptTag, string[]> = {
  qubits: [
    "A classical bit is definitely 0 or 1; a qubit's state is described by two amplitudes.",
    "Measuring a qubit always yields a single classical outcome, 0 or 1.",
    "Repeated preparation and measurement reveals a probability distribution, not a hidden value.",
  ],
  superposition: [
    "A superposition is a definite quantum state described by probability amplitudes for |0⟩ and |1⟩, not a qubit that is literally both values at once.",
    "The probability of each outcome is the square of its amplitude (Born rule), and the probabilities sum to 1.",
    "Measurement returns one outcome with those probabilities and leaves the qubit in the measured state.",
    "Amplitudes can be negative (carry phase), which is why superposition differs from a classical coin flip.",
  ],
  measurement: [
    "Measurement produces a single classical outcome, with probability given by the squared amplitude.",
    "After measurement the state collapses: repeating the same measurement gives the same result.",
    "The distribution is only visible by preparing fresh qubits many times; one measurement cannot reveal the amplitudes.",
  ],
  "bloch-sphere": [
    "Any single-qubit pure state is a point on the sphere; poles are |0⟩ and |1⟩.",
    "Latitude sets the measurement probabilities; longitude is relative phase.",
    "Gates are rotations of the sphere.",
  ],
  phase: [
    "Relative phase is an angle between amplitudes that does not change measurement probabilities in the computational basis.",
    "Phase only becomes visible through interference (e.g. after a Hadamard).",
  ],
  gates: [
    "Gates are reversible operations that transform amplitudes, not readouts of a hidden value.",
    "X swaps the |0⟩ and |1⟩ amplitudes; applying X twice returns the original state.",
    "Gates act on the state without measuring it, so superpositions are preserved.",
  ],
  interference: [
    "Amplitudes add before probabilities are taken, so paths can reinforce (constructive) or cancel (destructive).",
    "Probabilities are squared amplitudes; a negative amplitude has the same probability but interferes differently.",
    "Interference is how quantum algorithms boost the right answers and suppress wrong ones.",
  ],
  entanglement: [
    "Entangled qubits share one joint state; neither qubit has its own definite state.",
    "Measurement outcomes are correlated (e.g. always equal in a Bell state) even though each side looks random.",
    "Entanglement does not send information faster than light; you need to compare results to see the correlation.",
  ],
  algorithms: [
    "Quantum algorithms use superposition to explore possibilities and interference to amplify correct answers.",
    "Speedups are problem-specific (search, period finding), not a blanket 'try everything at once'.",
  ],
  hardware: [
    "Real qubits are fragile: decoherence and noise destroy superposition and entanglement.",
    "Error correction encodes one logical qubit across many physical qubits.",
  ],
};

export const TEACHBACK_SYSTEM = [
  "You are the formative-assessment tutor inside Brilliant Quantum, an interactive quantum computing course.",
  "A learner has just tried to explain a concept from a lesson in their own words (\"teach it back\").",
  "You do NOT answer the learner or lecture. You diagnose their understanding and adapt to it.",
  "",
  "Do all of the following, grounded ONLY in what the learner actually said and the lesson's key ideas:",
  "1. correctIdeas: the specific ideas the learner got right (quote or closely paraphrase their words). Empty if none.",
  "2. misconceptions: specific, concrete misconceptions in what they said (e.g. treating superposition as literally 'both 0 and 1 at once' like a classical mixture). Do not invent errors they did not make.",
  "3. missingIdeas: key ideas from the lesson they did not mention (e.g. probability amplitudes, Born rule, phase).",
  "4. masteryScore: 0-100 honest estimate. Rough guide: 0-25 mostly confused or empty; 26-50 partial with a core misconception; 51-75 solid core idea with gaps; 76-100 precise, mentions amplitudes/probabilities correctly.",
  "5. teachingStrategy: exactly one of affirm-and-extend, correct-misconception, fill-gap, contrast-cases, worked-example, analogy-repair. Pick correct-misconception or analogy-repair when a misconception exists; fill-gap when ideas are missing but nothing is wrong; affirm-and-extend only for high mastery.",
  "6. tutorResponse: 3-5 sentences, second person, addressed to this learner. Start from what they said, then repair the single most important misconception (or fill the biggest gap) with a precise explanation. For superposition, explain probability amplitudes and that probabilities are squared amplitudes. Never generic, never overpraise, no exclamation marks, no lists.",
  "7. followUpQuestion: exactly ONE concrete challenge question that targets the misconception or gap and can be answered in a sentence or two. Not a yes/no question.",
  "",
  "Return ONLY a JSON object with keys: concept, masteryScore, correctIdeas, misconceptions, missingIdeas, teachingStrategy, tutorResponse, followUpQuestion. No markdown, no extra keys.",
].join("\n");

export function teachBackPrompt(ctx: TeachBackContext): { system: string; user: string } {
  const lines = [
    `Lesson: ${ctx.lessonTitle}`,
    `Concept being taught back: ${ctx.conceptLabel} (tag: ${ctx.conceptTag})`,
    "Key ideas the lesson expects the learner to explain:",
    ...ctx.keyIdeas.map((idea, i) => `  ${i + 1}. ${idea}`),
    ctx.priorMastery != null ? `Learner's previous mastery estimate for this concept: ${ctx.priorMastery}/100` : "",
    "",
    "Learner's spoken explanation (transcribed, may contain speech-to-text errors):",
    `"""${ctx.transcript.trim()}"""`,
    "",
    `Set "concept" to exactly "${ctx.conceptLabel}". Analyze now and return the JSON object.`,
  ].filter((l) => l !== "");
  return { system: TEACHBACK_SYSTEM, user: lines.join("\n") };
}

function asString(value: unknown): string | null {
  return typeof value === "string" && value.trim() !== "" ? value.trim() : null;
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((v): v is string => typeof v === "string" && v.trim() !== "").map((v) => v.trim());
}

function clampScore(value: unknown): number | null {
  const n = typeof value === "string" ? Number(value) : value;
  if (typeof n !== "number" || !Number.isFinite(n)) return null;
  return Math.max(0, Math.min(100, Math.round(n)));
}

/** Parse and validate the tutor's structured output. Returns null on anything malformed. */
export function parseTeachBack(raw: string, fallbackConcept?: string): TeachBackAnalysis | null {
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

  const concept = asString(obj.concept) ?? fallbackConcept ?? null;
  const masteryScore = clampScore(obj.masteryScore);
  const tutorResponse = asString(obj.tutorResponse);
  const followUpQuestion = asString(obj.followUpQuestion);
  if (!concept || masteryScore === null || !tutorResponse || !followUpQuestion) return null;

  const strategyRaw = asString(obj.teachingStrategy)?.toLowerCase().replace(/[\s_]+/g, "-");
  const teachingStrategy = TEACHING_STRATEGIES.find((s) => s === strategyRaw) ?? inferStrategy(obj, masteryScore);

  return {
    concept,
    masteryScore,
    correctIdeas: asStringArray(obj.correctIdeas),
    misconceptions: asStringArray(obj.misconceptions),
    missingIdeas: asStringArray(obj.missingIdeas),
    teachingStrategy,
    tutorResponse,
    followUpQuestion,
  };
}

function inferStrategy(obj: Record<string, unknown>, mastery: number): TeachingStrategy {
  if (asStringArray(obj.misconceptions).length > 0) return "correct-misconception";
  if (asStringArray(obj.missingIdeas).length > 0) return "fill-gap";
  return mastery >= 75 ? "affirm-and-extend" : "worked-example";
}

/* ------------------------------------------------------------------------ */
/* Handwritten fallback (AI unavailable / demo mode)                         */
/* ------------------------------------------------------------------------ */

interface Rule {
  /** Any of these patterns present marks the idea as mentioned. */
  patterns: RegExp[];
  idea: string;
}

interface MisconceptionRule {
  patterns: RegExp[];
  /** Absence of these rescues the statement (learner qualified it). */
  unless?: RegExp[];
  note: string;
  repair: string;
}

interface ConceptRubric {
  ideas: Rule[];
  misconceptions: MisconceptionRule[];
  followUps: string[];
  gapRepair: string;
}

const GENERIC_RUBRIC: ConceptRubric = {
  ideas: [
    { patterns: [/probabilit/i, /chance/i, /likel/i], idea: "Outcomes are governed by probabilities." },
    { patterns: [/measur/i, /observ/i, /look/i, /read ?out/i], idea: "Measurement produces a single classical outcome." },
    { patterns: [/amplitude/i], idea: "The state is described by amplitudes." },
  ],
  misconceptions: [],
  followUps: ["Describe one experiment from the lesson and predict its outcome distribution in your own words."],
  gapRepair:
    "The lesson's central idea is that a quantum state is a list of amplitudes, and measurement turns those amplitudes into probabilities by squaring them.",
};

const RUBRICS: Partial<Record<ConceptTag, ConceptRubric>> = {
  superposition: {
    ideas: [
      {
        patterns: [/measur/i, /observ/i, /look at/i, /when (we|you) look/i, /check/i],
        idea: "Measurement forces a single outcome (0 or 1).",
      },
      {
        patterns: [/random/i, /probabilit/i, /chance/i, /likely/i, /percent/i, /%/],
        idea: "Which outcome you see is probabilistic, not predetermined.",
      },
      { patterns: [/amplitude/i], idea: "The state is described by probability amplitudes." },
      { patterns: [/squar/i, /born/i], idea: "Probabilities are the squared amplitudes (Born rule)." },
      { patterns: [/phase/i, /negative/i, /sign/i, /interfer/i], idea: "Amplitudes carry a sign or phase, which enables interference." },
      { patterns: [/collapse/i, /stays/i, /same (result|answer)/i, /again/i], idea: "After measurement the qubit stays in the measured state." },
    ],
    misconceptions: [
      {
        patterns: [/both (zero|0) and (one|1)/i, /(zero|0) and (one|1) at the same time/i, /both at (the same time|once)/i, /simultaneous/i],
        unless: [/amplitude/i],
        note: "Describes superposition as the qubit literally being 0 and 1 at the same time (a classical 'both values' picture).",
        repair:
          "You have the measurement part right: when you measure, you get exactly one outcome, and which one is probabilistic. The idea to sharpen is \"both zero and one at the same time.\" A superposition is not a qubit secretly holding two classical values; it is one definite state described by two numbers called probability amplitudes, one for |0⟩ and one for |1⟩. Squaring each amplitude gives the probability of that outcome, so an amplitude of about 0.71 on each side gives a 50/50 measurement, while 0.87 and 0.5 would give roughly 75/25. Amplitudes can also be negative, which is why a superposition behaves differently from a coin that has simply not been looked at yet.",
      },
      {
        patterns: [/already (decided|determined|chosen)/i, /hidden (value|answer)/i, /we just don'?t know/i, /secretly/i],
        note: "Treats the outcome as a pre-existing hidden value that measurement merely reveals.",
        repair:
          "You correctly connect measurement to a single outcome. The part to fix is the idea that the value was already there and measurement just uncovers it. Before measurement the qubit has amplitudes for |0⟩ and |1⟩, and squaring them gives the outcome probabilities. Interference experiments in the lesson show these amplitudes can cancel, which a pre-decided hidden value could never do.",
      },
    ],
    followUps: [
      "A qubit has amplitude 0.6 for |0⟩ and 0.8 for |1⟩. What are the measurement probabilities, and why do they add up to 1?",
      "Two qubits both give 50/50 results, but one has amplitudes (0.71, 0.71) and the other (0.71, -0.71). Describe an experiment from the lesson that would tell them apart.",
    ],
    gapRepair:
      "You have the shape of the idea. To make it precise, describe the qubit with its two probability amplitudes, one for |0⟩ and one for |1⟩. Squaring each amplitude gives the probability of that outcome, so the state's amplitudes decide the statistics you see when you prepare and measure many fresh qubits.",
  },
  measurement: {
    ideas: [
      { patterns: [/(one|single) (outcome|result|answer)/i, /either (zero|0) or (one|1)/i, /(zero|0) or (one|1)/i], idea: "Measurement returns one classical outcome." },
      { patterns: [/probabilit/i, /random/i, /chance/i, /%/], idea: "The outcome is probabilistic." },
      { patterns: [/collapse/i, /stays/i, /same (result|answer|outcome)/i, /again/i, /repeat/i], idea: "After collapse, re-measuring gives the same result." },
      { patterns: [/fresh/i, /many/i, /lots of/i, /distribution/i, /histogram/i], idea: "Statistics appear only across many fresh preparations." },
      { patterns: [/squar/i, /amplitude/i], idea: "Probabilities come from squared amplitudes." },
    ],
    misconceptions: [
      {
        patterns: [/(different|new|another) (result|answer|outcome) (each|every) time/i, /keeps? changing/i, /re-?measur\w* .*random/i],
        note: "Expects repeated measurement of the same qubit to keep giving random results.",
        repair:
          "You clearly have the idea that a measurement yields one definite outcome. The piece to correct is what happens next: once a qubit has been measured, it collapses to the outcome you saw, so measuring the same qubit again returns that same value every time. The randomness only shows up when you prepare a fresh qubit in the same superposition and measure it anew, which is why the lesson has you run many fresh qubits to see the histogram.",
      },
    ],
    followUps: [
      "You measure a qubit in an equal superposition and get 1. You measure that same qubit again. What do you see, and what would you need to do to see a 0?",
    ],
    gapRepair:
      "Add the collapse step to your explanation: measurement yields one outcome with probability equal to the squared amplitude, and afterwards the qubit is in that outcome state, so only fresh preparations reveal the distribution.",
  },
  gates: {
    ideas: [
      { patterns: [/flip/i, /swap/i, /not gate/i], idea: "X flips |0⟩ and |1⟩ (swaps their amplitudes)." },
      { patterns: [/twice/i, /two (x|times)/i, /undo/i, /revers/i, /back/i], idea: "Gates are reversible; X twice restores the state." },
      { patterns: [/amplitude/i, /superposition/i], idea: "Gates act on amplitudes, so they work on superpositions too." },
      { patterns: [/without measur/i, /doesn'?t (measure|look)/i, /no collapse/i], idea: "Gates transform the state without measuring it." },
    ],
    misconceptions: [
      {
        patterns: [/gate .*(reveal|tell|show|read)/i, /(reveal|tell|show|read)s? .*(value|state)/i, /gate .*measur/i],
        note: "Treats a gate as something that reads or reveals the qubit's value.",
        repair:
          "You correctly describe X as a flip. The part to fix is the idea that a gate reveals anything. A gate is a reversible transformation of the amplitudes, so X simply swaps the amplitude on |0⟩ with the amplitude on |1⟩ without measuring; the qubit stays in superposition. Only a measurement produces a readable value, which is why applying X twice quietly returns you to exactly where you started.",
      },
    ],
    followUps: [
      "A qubit has amplitudes 0.8 on |0⟩ and 0.6 on |1⟩. Write the amplitudes after one X gate, and explain what measurement statistics change.",
    ],
    gapRepair:
      "Make your explanation about amplitudes: a gate is a reversible rule for moving amplitudes between |0⟩ and |1⟩, done without measuring, which is why superpositions survive gates and X applied twice undoes itself.",
  },
  entanglement: {
    ideas: [
      { patterns: [/correlat/i, /same (result|answer|outcome)/i, /match/i, /agree/i], idea: "Entangled measurement outcomes are correlated." },
      { patterns: [/random/i, /50/i, /probabilit/i], idea: "Each qubit alone looks random." },
      { patterns: [/joint/i, /shared|share/i, /one state/i, /together/i, /neither/i], idea: "The pair shares one joint state; neither qubit has its own state." },
      { patterns: [/faster than light/i, /no (information|signal)/i, /can'?t (send|communicate)/i], idea: "Entanglement does not transmit information faster than light." },
    ],
    misconceptions: [
      {
        patterns: [/faster than light/i, /instant\w* (message|communicat|send|signal)/i, /telepath/i, /send .*information/i],
        unless: [/no (information|signal)/i, /can'?t (send|communicate)/i, /cannot (send|communicate)/i, /doesn'?t (send|let)/i],
        note: "Suggests entanglement can send a message or information instantly.",
        repair:
          "You have the key observation that the two outcomes are correlated. The part to fix is the idea that this sends a message. Each experimenter sees only a random string of 0s and 1s; the correlation only appears when the two records are compared, which needs ordinary communication. Entanglement is a shared joint state with correlated amplitudes, not a channel.",
      },
      {
        patterns: [/decided (before|earlier|already)/i, /agreed (before|in advance)/i, /pre-?determin/i, /hidden/i],
        note: "Explains the correlation with values fixed in advance (hidden variables).",
        repair:
          "You correctly notice that the outcomes match. The idea to refine is that they were decided in advance. In the lesson's Bell state the two qubits share a single joint state with amplitudes only on |00⟩ and |11⟩; neither qubit has its own definite value until measurement, and the correlations survive measuring in other bases in a way a pre-agreed list could not reproduce.",
      },
    ],
    followUps: [
      "Alice and Bob share a Bell pair. Alice measures and gets 1. What does Bob see, and what would Bob see if Alice had never measured at all?",
    ],
    gapRepair:
      "Describe entanglement as one joint state for both qubits, with amplitudes only on the correlated outcomes, so each side alone looks random while the pair always agrees.",
  },
};

function mentioned(text: string, patterns: RegExp[]): boolean {
  return patterns.some((p) => p.test(text));
}

/**
 * Heuristic teach-back analysis used when the model is unavailable. It is
 * deliberately conservative: it only credits ideas the learner actually said
 * and only flags misconceptions matching known phrasings.
 */
export function fallbackTeachBack(ctx: TeachBackContext): TeachBackAnalysis {
  const text = ctx.transcript.trim();
  const rubric = RUBRICS[ctx.conceptTag] ?? GENERIC_RUBRIC;
  const keyIdeas = ctx.keyIdeas.length ? ctx.keyIdeas : CONCEPT_KEY_IDEAS[ctx.conceptTag];

  if (text.split(/\s+/).filter(Boolean).length < 4) {
    return {
      concept: ctx.conceptLabel,
      masteryScore: 5,
      correctIdeas: [],
      misconceptions: [],
      missingIdeas: keyIdeas,
      teachingStrategy: "worked-example",
      tutorResponse:
        "There was not enough in your explanation to assess yet. Try explaining the concept as if to a friend: what the state is before measurement, what measurement does, and how the probabilities are decided.",
      followUpQuestion: rubric.followUps[0],
    };
  }

  const correctIdeas = rubric.ideas.filter((r) => mentioned(text, r.patterns)).map((r) => r.idea);
  const hits = rubric.misconceptions.filter(
    (m) => mentioned(text, m.patterns) && !(m.unless && mentioned(text, m.unless))
  );
  const misconceptions = hits.map((m) => m.note);

  const mentionsAmplitude = /amplitude/i.test(text);
  const missingIdeas = keyIdeas.filter((idea) => {
    if (/amplitude/i.test(idea) && mentionsAmplitude) return false;
    if (/measur/i.test(idea) && correctIdeas.some((c) => /measur/i.test(c))) return false;
    if (/(phase|negative)/i.test(idea) && /(phase|negative|sign|interfer)/i.test(text)) return false;
    if (/collapse|stays|same/i.test(idea) && /(collapse|stays|same|again)/i.test(text)) return false;
    return true;
  });

  const coverage = rubric.ideas.length ? correctIdeas.length / rubric.ideas.length : 0.3;
  let mastery = 30 + Math.round(coverage * 55);
  mastery -= misconceptions.length * 12;
  if (mentionsAmplitude) mastery += 10;
  mastery = Math.max(8, Math.min(95, mastery));

  const primaryHit = hits[0];
  const teachingStrategy: TeachingStrategy = primaryHit
    ? "correct-misconception"
    : missingIdeas.length > 0
      ? "fill-gap"
      : "affirm-and-extend";

  const tutorResponse = primaryHit
    ? primaryHit.repair
    : missingIdeas.length > 0
      ? `${correctIdeas.length ? `You correctly explained that ${lowerFirst(correctIdeas[0])} ` : ""}${rubric.gapRepair}`
      : `You explained ${ctx.conceptLabel.toLowerCase()} precisely, including ${lowerFirst(correctIdeas[0] ?? "the core idea")} Now push it further by connecting the amplitudes to a concrete prediction you could test in the simulator.`;

  const followUpQuestion = primaryHit ? rubric.followUps[0] : (rubric.followUps[1] ?? rubric.followUps[0]);

  return {
    concept: ctx.conceptLabel,
    masteryScore: mastery,
    correctIdeas,
    misconceptions,
    missingIdeas,
    teachingStrategy,
    tutorResponse,
    followUpQuestion,
  };
}

function lowerFirst(s: string): string {
  return s.charAt(0).toLowerCase() + s.slice(1);
}
