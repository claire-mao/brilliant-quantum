/**
 * Battle challenges for the Wizard Tower — the learning-science core. A battle
 * is targeted retrieval practice, not random trivia, so this module:
 *
 *  1. Holds an accurate, hand-written bank of challenges keyed by concept,
 *     challenge type, and difficulty (works fully with AI off).
 *  2. Builds each floor's room plan from the learner model: it prioritises
 *     struggled and due concepts, interleaves older mastered ones, and mixes in
 *     the current unit — constrained to concepts the floor's climate has taught.
 *
 * Everything is grounded in `lib/learning/` so the tower strengthens the same
 * per-concept signals the rest of the app uses.
 */

import type { Difficulty, PracticeQuestion } from "@/lib/ai/validators";
import {
  CONCEPT_LABEL,
  CONCEPT_PREREQ,
  CONCEPT_RECALL,
  type ConceptTag,
} from "@/lib/learning/concepts";
import {
  getLearnerConceptProfile,
  getRecommendedReview,
  type ReviewReason,
} from "@/lib/learning/learner-model";
import { getConceptSignal } from "@/lib/learning/signals";
import { getRetrievalForConcept } from "@/lib/learning/retrieval";
import type { UserProfile } from "@/lib/types";
import { climateForFloor } from "./climates";
import { getFloorLayout, type ChallengeKind, type RoomSlot } from "./floors";
import { bossForFloor } from "./monsters";

/* ------------------------------- Visuals -------------------------------- */

export type ChallengeVisual =
  | { kind: "circuit"; start: string; gates: string[]; measure?: boolean; caption?: string }
  | { kind: "two-circuits"; start: string; a: string[]; b: string[]; aLabel?: string; bLabel?: string; caption?: string }
  | { kind: "histogram"; bars: { label: string; value: number; highlight?: boolean }[]; caption?: string }
  | { kind: "bloch"; vector: "0" | "1" | "+" | "-" | "+i" | "-i"; caption?: string }
  | { kind: "pair"; relation: "same" | "opposite" | "independent"; caption?: string };

/* ------------------------------ Challenge ------------------------------- */

export interface BattleChallenge {
  id: string;
  concept: ConceptTag;
  kind: ChallengeKind;
  difficulty: Difficulty;
  prompt: string;
  choices: { id: string; label: string }[];
  correctChoiceId: string;
  explanation: string;
  misconception?: string;
  /** Four progressive hints (retrieval → attention → concept → short walk). */
  hintLadder?: [string, string, string, string];
  visual?: ChallengeVisual;
}

/**
 * The hand-written battle bank. Accurate, conceptual, light on heavy math, and
 * free of any copyrighted references. Selection falls back gracefully, so gaps
 * for a given (concept, kind, difficulty) never break a battle.
 */
export const BATTLE_BANK: BattleChallenge[] = [
  /* --------------------------------- qubits -------------------------------- */
  {
    id: "qubits-recall-1",
    concept: "qubits",
    kind: "recall",
    difficulty: "easy",
    prompt: "What makes a qubit different from a classical bit?",
    choices: [
      { id: "a", label: "It is always either 0 or 1, never both" },
      { id: "b", label: "It can be 0, 1, or a superposition of both until measured" },
      { id: "c", label: "It stores two classical bits at once" },
      { id: "d", label: "It is just a slower bit" },
    ],
    correctChoiceId: "b",
    explanation:
      "A qubit holds amplitudes for 0 and 1 at the same time; only measurement forces a single definite outcome.",
    misconception: "A qubit secretly stores two classical bits.",
    hintLadder: [
      "Recall the very first experiment: what could the qubit be before you measured it?",
      "Think about what is true only up until the moment of measurement.",
      "The key idea is superposition — amplitudes for both 0 and 1 coexist.",
      "Unlike a bit, a qubit is not forced to one value until measured; before that it carries both.",
    ],
  },
  {
    id: "qubits-predict-1",
    concept: "qubits",
    kind: "predict",
    difficulty: "easy",
    prompt: "A qubit is freshly prepared in the state \\( |0\\rangle \\). You measure it once in the computational basis. The result is:",
    choices: [
      { id: "a", label: "0 with certainty" },
      { id: "b", label: "1 with certainty" },
      { id: "c", label: "0 or 1, each with probability 1/2" },
      { id: "d", label: "A value between 0 and 1" },
    ],
    correctChoiceId: "a",
    explanation: "\\( |0\\rangle \\) is a definite basis state, so measuring it returns 0 every time.",
    visual: { kind: "bloch", vector: "0", caption: "State points to the north pole" },
  },
  {
    id: "qubits-misc-1",
    concept: "qubits",
    kind: "misconception",
    difficulty: "medium",
    prompt: "Which statement about a qubit in superposition is the misconception to reject?",
    choices: [
      { id: "a", label: "It carries amplitudes for 0 and 1 simultaneously" },
      { id: "b", label: "It is secretly already 0 or 1, we just don't know which" },
      { id: "c", label: "Measurement yields a single definite outcome" },
      { id: "d", label: "Its amplitudes determine measurement probabilities" },
    ],
    correctChoiceId: "b",
    explanation:
      "Superposition is not hidden ignorance of a pre-existing value. The qubit genuinely has no definite 0/1 value until measured — interference experiments prove a hidden value can't explain the results.",
    misconception: "Superposition is just not knowing a value that already exists.",
  },

  /* ------------------------------ superposition ---------------------------- */
  {
    id: "superposition-hist-1",
    concept: "superposition",
    kind: "histogram-prediction",
    difficulty: "easy",
    prompt: "You prepare \\( |+\\rangle \\) (equal superposition) and measure 100 fresh copies in the 0/1 basis. The counts look most like:",
    choices: [
      { id: "a", label: "About 50 zeros and 50 ones" },
      { id: "b", label: "About 100 zeros" },
      { id: "c", label: "About 100 ones" },
      { id: "d", label: "A smooth value near 0.5 each time" },
    ],
    correctChoiceId: "a",
    explanation: "Equal amplitudes give equal probabilities, so across many shots you see roughly half 0 and half 1 — never a fractional reading.",
    visual: {
      kind: "histogram",
      bars: [
        { label: "0", value: 50, highlight: true },
        { label: "1", value: 50, highlight: true },
      ],
      caption: "Equal superposition, 0/1 basis",
    },
  },
  {
    id: "superposition-misc-1",
    concept: "superposition",
    kind: "misconception",
    difficulty: "medium",
    prompt: "An apprentice says: \"A superposed qubit is rapidly flipping between 0 and 1.\" Why is this wrong?",
    choices: [
      { id: "a", label: "It flips slowly, not rapidly" },
      { id: "b", label: "It holds both amplitudes at once; it is not switching in time" },
      { id: "c", label: "It is actually always 0" },
      { id: "d", label: "Flipping would need a measurement each time" },
    ],
    correctChoiceId: "b",
    explanation:
      "Superposition is a single state carrying both amplitudes simultaneously, not a fast time-sequence of 0s and 1s. The 'flipping' picture predicts the wrong interference behavior.",
    misconception: "A superposition is a fast toggling between 0 and 1.",
  },
  {
    id: "superposition-recall-1",
    concept: "superposition",
    kind: "recall",
    difficulty: "easy",
    prompt: "A qubit in an equal superposition is measured many times (fresh each time). The results are:",
    choices: [
      { id: "a", label: "Always the same value" },
      { id: "b", label: "Roughly half 0 and half 1" },
      { id: "c", label: "Always a value between 0 and 1" },
      { id: "d", label: "Impossible to predict statistically" },
    ],
    correctChoiceId: "b",
    explanation: "Equal amplitudes give equal probabilities — about 50% 0 and 50% 1 across many shots.",
  },

  /* ------------------------------ measurement ------------------------------ */
  {
    id: "measurement-recall-1",
    concept: "measurement",
    kind: "recall",
    difficulty: "easy",
    prompt: "You measure a qubit and read 1. Without changing it, you measure again. You get:",
    choices: [
      { id: "a", label: "0 or 1 with equal chance" },
      { id: "b", label: "1 again" },
      { id: "c", label: "A random value each time" },
      { id: "d", label: "An error" },
    ],
    correctChoiceId: "b",
    explanation: "Measurement collapses the state; the qubit is now in |1\\rangle, so repeated measurement keeps returning 1.",
  },
  {
    id: "measurement-mistake-1",
    concept: "measurement",
    kind: "find-mistake",
    difficulty: "medium",
    prompt: "Spot the mistake: \"Measuring a superposed qubit simply reveals the value it secretly had all along.\"",
    choices: [
      { id: "a", label: "No mistake — measurement reads a hidden value" },
      { id: "b", label: "The mistake: there was no definite value before measurement; collapse creates the outcome" },
      { id: "c", label: "The mistake: measurement never changes the qubit" },
      { id: "d", label: "The mistake: superposed qubits cannot be measured" },
    ],
    correctChoiceId: "b",
    explanation:
      "Before measurement the qubit has no definite 0/1 value. Measurement collapses the superposition and produces the outcome probabilistically — it does not read a pre-set value.",
    misconception: "Measurement just reveals a value that already existed.",
  },
  {
    id: "measurement-predict-1",
    concept: "measurement",
    kind: "predict",
    difficulty: "medium",
    prompt: "A qubit is in state \\( |+\\rangle \\). You measure it in the 0/1 basis and get 0. Immediately you measure again in the same basis. You get:",
    choices: [
      { id: "a", label: "0 (it collapsed to \\( |0\\rangle \\))" },
      { id: "b", label: "1" },
      { id: "c", label: "0 or 1, each 1/2" },
      { id: "d", label: "\\( |+\\rangle \\) again" },
    ],
    correctChoiceId: "a",
    explanation: "The first measurement collapsed \\( |+\\rangle \\) to \\( |0\\rangle \\). The repeated measurement now returns 0 with certainty.",
  },

  /* ------------------------------ bloch-sphere ----------------------------- */
  {
    id: "bloch-recall-1",
    concept: "bloch-sphere",
    kind: "recall",
    difficulty: "easy",
    prompt: "On the Bloch sphere, the north and south poles represent:",
    choices: [
      { id: "a", label: "The states \\( |0\\rangle \\) and \\( |1\\rangle \\)" },
      { id: "b", label: "Two entangled qubits" },
      { id: "c", label: "Measurement errors" },
      { id: "d", label: "The amplitudes' phases" },
    ],
    correctChoiceId: "a",
    explanation: "The poles are the basis states \\( |0\\rangle \\) and \\( |1\\rangle \\); superpositions live on the surface between them.",
    visual: { kind: "bloch", vector: "0", caption: "North pole = \\( |0\\rangle \\)" },
  },
  {
    id: "bloch-predict-1",
    concept: "bloch-sphere",
    kind: "bloch-prediction",
    difficulty: "medium",
    prompt: "A state sits on the Bloch sphere's equator (for example \\( |+\\rangle \\), pointing along +X). Measured in the 0/1 (Z) basis, it gives:",
    choices: [
      { id: "a", label: "0 with certainty" },
      { id: "b", label: "1 with certainty" },
      { id: "c", label: "0 or 1, each with probability 1/2" },
      { id: "d", label: "Nothing — equator states can't be measured" },
    ],
    correctChoiceId: "c",
    explanation: "Equator states are equal superpositions in the Z basis, so Z-measurement gives 0 or 1 with equal 1/2 probability.",
    visual: { kind: "bloch", vector: "+", caption: "Equator state along +X" },
    hintLadder: [
      "Where on the sphere are the definite 0 and 1 outcomes? Where is this state relative to them?",
      "An equator point is exactly between the poles — equally far from \\( |0\\rangle \\) and \\( |1\\rangle \\).",
      "Z-basis probabilities depend on the polar angle; on the equator that angle is 90 degrees.",
      "Equidistant from both poles means equal probabilities: 1/2 and 1/2.",
    ],
  },

  /* --------------------------------- phase --------------------------------- */
  {
    id: "phase-recall-1",
    concept: "phase",
    kind: "recall",
    difficulty: "medium",
    prompt: "A relative phase between |0\\rangle and |1\\rangle becomes observable only when you:",
    choices: [
      { id: "a", label: "Measure immediately in the 0/1 basis" },
      { id: "b", label: "Let the amplitudes interfere (e.g. apply H first)" },
      { id: "c", label: "Multiply the whole state by a phase" },
      { id: "d", label: "Wait long enough" },
    ],
    correctChoiceId: "b",
    explanation: "Relative phase is invisible to a direct 0/1 measurement; interference (such as a Hadamard) converts it into measurable differences.",
  },
  {
    id: "phase-predict-1",
    concept: "phase",
    kind: "predict",
    difficulty: "medium",
    prompt: "You compare \\( |+\\rangle \\) and \\( |-\\rangle \\) by measuring each directly in the 0/1 basis. The outcome statistics are:",
    choices: [
      { id: "a", label: "Identical — both give 50/50" },
      { id: "b", label: "Opposite — one gives 0, the other gives 1" },
      { id: "c", label: "\\( |+\\rangle \\) gives 0, \\( |-\\rangle \\) gives nothing" },
      { id: "d", label: "Random and different every run" },
    ],
    correctChoiceId: "a",
    explanation:
      "\\( |+\\rangle \\) and \\( |-\\rangle \\) differ only by a relative phase, which a 0/1 measurement cannot see — both give 50/50. Apply H first and they separate completely.",
    misconception: "Relative phase changes the direct 0/1 probabilities.",
  },
  {
    id: "phase-misc-1",
    concept: "phase",
    kind: "misconception",
    difficulty: "hard",
    prompt: "Which statement about phase is the misconception?",
    choices: [
      { id: "a", label: "A global phase \\( e^{i\\theta} \\) on the whole state is unobservable" },
      { id: "b", label: "Relative phase affects interference outcomes" },
      { id: "c", label: "A global phase changes measurement probabilities" },
      { id: "d", label: "Phase matters only once amplitudes recombine" },
    ],
    correctChoiceId: "c",
    explanation:
      "A global phase multiplies the entire state and never changes any probability (which depends on \\( |\\text{amplitude}|^2 \\)). Only relative phase between components is physical.",
    misconception: "Global phase has observable effects.",
  },

  /* --------------------------------- gates --------------------------------- */
  {
    id: "gates-build-1",
    concept: "gates",
    kind: "build-circuit",
    difficulty: "easy",
    prompt: "Starting from \\( |0\\rangle \\), which single gate produces a 50/50 superposition?",
    choices: [
      { id: "a", label: "X (bit flip)" },
      { id: "b", label: "H (Hadamard)" },
      { id: "c", label: "Z (phase flip)" },
      { id: "d", label: "Measure" },
    ],
    correctChoiceId: "b",
    explanation: "H maps \\( |0\\rangle \\) to \\( |+\\rangle \\), an equal superposition that measures 0 or 1 with probability 1/2 each.",
    visual: { kind: "circuit", start: "\\( |0\\rangle \\)", gates: ["H"], measure: true },
  },
  {
    id: "gates-predict-1",
    concept: "gates",
    kind: "predict",
    difficulty: "easy",
    prompt: "Apply the X gate to \\( |0\\rangle \\). The result is:",
    choices: [
      { id: "a", label: "\\( |0\\rangle \\)" },
      { id: "b", label: "\\( |1\\rangle \\)" },
      { id: "c", label: "\\( |+\\rangle \\)" },
      { id: "d", label: "A 50/50 superposition" },
    ],
    correctChoiceId: "b",
    explanation: "X is the bit flip: it swaps \\( |0\\rangle \\) and \\( |1\\rangle \\), so \\( |0\\rangle \\) becomes \\( |1\\rangle \\).",
    visual: { kind: "circuit", start: "\\( |0\\rangle \\)", gates: ["X"], measure: false },
  },
  {
    id: "gates-recall-1",
    concept: "gates",
    kind: "recall",
    difficulty: "medium",
    prompt: "Applying the Hadamard gate twice in a row to a qubit does what?",
    choices: [
      { id: "a", label: "Measures it" },
      { id: "b", label: "Returns it to its original state (identity)" },
      { id: "c", label: "Flips it like an X gate" },
      { id: "d", label: "Destroys the state" },
    ],
    correctChoiceId: "b",
    explanation: "H is its own inverse, so \\( H\\cdot H = I \\) returns the qubit to where it started — gates are reversible.",
    visual: { kind: "circuit", start: "\\( |0\\rangle \\)", gates: ["H", "H"], measure: false },
  },
  {
    id: "gates-compare-1",
    concept: "gates",
    kind: "compare-circuits",
    difficulty: "medium",
    prompt: "Both circuits start from \\( |0\\rangle \\). Circuit A applies H then H. Circuit B applies nothing. Their final states are:",
    choices: [
      { id: "a", label: "The same — both are \\( |0\\rangle \\)" },
      { id: "b", label: "Different — A is a superposition" },
      { id: "c", label: "A is \\( |1\\rangle \\), B is \\( |0\\rangle \\)" },
      { id: "d", label: "Both are \\( |+\\rangle \\)" },
    ],
    correctChoiceId: "a",
    explanation: "\\( H\\cdot H = I \\), so circuit A returns \\( |0\\rangle \\) to \\( |0\\rangle \\) — identical to doing nothing.",
    visual: { kind: "two-circuits", start: "\\( |0\\rangle \\)", a: ["H", "H"], b: ["I"], aLabel: "A", bLabel: "B" },
  },
  {
    id: "gates-order-1",
    concept: "gates",
    kind: "order-gates",
    difficulty: "medium",
    prompt: "You want to take \\( |0\\rangle \\) to \\( |1\\rangle \\) and then into an equal superposition. Which gate order does it?",
    choices: [
      { id: "a", label: "X, then H" },
      { id: "b", label: "H, then X" },
      { id: "c", label: "Z, then X" },
      { id: "d", label: "H, then H" },
    ],
    correctChoiceId: "a",
    explanation: "X first sends \\( |0\\rangle \\to |1\\rangle \\), then H sends \\( |1\\rangle \\to |-\\rangle \\), an equal superposition (50/50 in the 0/1 basis).",
    visual: { kind: "circuit", start: "\\( |0\\rangle \\)", gates: ["X", "H"], measure: true },
  },
  {
    id: "gates-misc-1",
    concept: "gates",
    kind: "misconception",
    difficulty: "medium",
    prompt: "Which claim about gates is the misconception?",
    choices: [
      { id: "a", label: "Gates are reversible operations" },
      { id: "b", label: "Measurement is just another reversible gate" },
      { id: "c", label: "X swaps |0\\rangle and |1\\rangle" },
      { id: "d", label: "H creates superposition from a basis state" },
    ],
    correctChoiceId: "b",
    explanation: "Gates are reversible (unitary). Measurement is irreversible — it collapses the state and discards information, so it is not a gate.",
    misconception: "Measurement is a reversible gate.",
  },

  /* ------------------------------ interference ----------------------------- */
  {
    id: "interference-recall-1",
    concept: "interference",
    kind: "recall",
    difficulty: "medium",
    prompt: "Two paths to the same outcome carry equal but opposite amplitudes. The outcome's probability is:",
    choices: [
      { id: "a", label: "Doubled" },
      { id: "b", label: "Zero — they cancel" },
      { id: "c", label: "Unchanged" },
      { id: "d", label: "Always one half" },
    ],
    correctChoiceId: "b",
    explanation: "Amplitudes add before squaring; equal-and-opposite amplitudes cancel, giving zero probability — destructive interference.",
  },
  {
    id: "interference-misc-1",
    concept: "interference",
    kind: "misconception",
    difficulty: "hard",
    prompt: "Why is \"interference just adds the probabilities of each path\" wrong?",
    choices: [
      { id: "a", label: "Probabilities can be negative" },
      { id: "b", label: "You add amplitudes (which can cancel), then square to get probability" },
      { id: "c", label: "Paths never share an outcome" },
      { id: "d", label: "Probabilities are added, then halved" },
    ],
    correctChoiceId: "b",
    explanation:
      "Amplitudes — not probabilities — combine. Because amplitudes can be negative (or complex) they can cancel; only after summing do you square to get the probability.",
    misconception: "Interference adds probabilities rather than amplitudes.",
  },
  {
    id: "interference-compare-1",
    concept: "interference",
    kind: "compare-circuits",
    difficulty: "hard",
    prompt: "Two paths reach an outcome. In case A the amplitudes are \\( +1/\\sqrt2 \\) and \\( +1/\\sqrt2 \\); in case B they are \\( +1/\\sqrt2 \\) and \\( -1/\\sqrt2 \\). The outcome probabilities are:",
    choices: [
      { id: "a", label: "A: reinforced (large), B: 0 (cancelled)" },
      { id: "b", label: "Both 1/2" },
      { id: "c", label: "A: 0, B: 1" },
      { id: "d", label: "Both 1" },
    ],
    correctChoiceId: "a",
    explanation:
      "A: equal-sign amplitudes add and reinforce (constructive interference). B: equal-and-opposite amplitudes cancel to 0 (destructive interference).",
    visual: {
      kind: "histogram",
      bars: [
        { label: "A", value: 100, highlight: true },
        { label: "B", value: 2 },
      ],
      caption: "Constructive vs destructive",
    },
  },

  /* ------------------------------ entanglement ----------------------------- */
  {
    id: "entanglement-corr-1",
    concept: "entanglement",
    kind: "entanglement-correlation",
    difficulty: "medium",
    prompt: "Alice and Bob share the Bell state \\( (|00\\rangle + |11\\rangle)/\\sqrt2 \\). Alice measures her qubit and gets 0. Bob's qubit, when measured in the same basis, gives:",
    choices: [
      { id: "a", label: "0 with certainty" },
      { id: "b", label: "1 with certainty" },
      { id: "c", label: "0 or 1, each 1/2" },
      { id: "d", label: "It depends how far apart they are" },
    ],
    correctChoiceId: "a",
    explanation:
      "This Bell state only has \\( |00\\rangle \\) and \\( |11\\rangle \\) terms, so the outcomes are perfectly correlated: Alice's 0 means Bob also gets 0.",
    visual: { kind: "pair", relation: "same", caption: "\\( (|00\\rangle + |11\\rangle)/\\sqrt2 \\)" },
  },
  {
    id: "entanglement-misc-1",
    concept: "entanglement",
    kind: "misconception",
    difficulty: "hard",
    prompt: "Why doesn't measuring an entangled qubit let Alice send Bob an instant message?",
    choices: [
      { id: "a", label: "The signal is just too weak to detect" },
      { id: "b", label: "Bob's local outcomes look random; correlation shows up only when results are compared" },
      { id: "c", label: "Entanglement breaks before the message arrives" },
      { id: "d", label: "Light is faster than the correlation" },
    ],
    correctChoiceId: "b",
    explanation:
      "Bob sees random 0s and 1s no matter what Alice does. The correlation appears only after they compare results over a normal channel — so no information travels faster than light (no-signaling).",
    misconception: "Entanglement transmits information instantly.",
  },
  {
    id: "entanglement-compare-1",
    concept: "entanglement",
    kind: "compare-circuits",
    difficulty: "hard",
    prompt: "Which two-qubit state is entangled (cannot be written as one qubit's state combined with another's)?",
    choices: [
      { id: "a", label: "\\( (|00\\rangle + |11\\rangle)/\\sqrt2 \\)" },
      { id: "b", label: "\\( |0\\rangle \\otimes |+\\rangle \\)" },
      { id: "c", label: "\\( |1\\rangle \\otimes |1\\rangle \\)" },
      { id: "d", label: "\\( |+\\rangle \\otimes |+\\rangle \\)" },
    ],
    correctChoiceId: "a",
    explanation:
      "The Bell state can't be factored into separate single-qubit states — that non-separability is exactly what entanglement means. The others are product states.",
  },

  /* ------------------------------- algorithms ------------------------------ */
  {
    id: "algorithms-recall-1",
    concept: "algorithms",
    kind: "recall",
    difficulty: "hard",
    prompt: "What gives a quantum algorithm its advantage on the right problem?",
    choices: [
      { id: "a", label: "Trying every answer in parallel and reading them all" },
      { id: "b", label: "Using interference so wrong answers cancel and the right one stands out" },
      { id: "c", label: "Running faster classical logic" },
      { id: "d", label: "Storing more memory" },
    ],
    correctChoiceId: "b",
    explanation:
      "You can't read every branch — measurement gives one outcome. Algorithms arrange interference so amplitude concentrates on the correct answer before you measure.",
  },
  {
    id: "algorithms-misc-1",
    concept: "algorithms",
    kind: "misconception",
    difficulty: "hard",
    prompt: "Which is the misconception about quantum algorithms?",
    choices: [
      { id: "a", label: "They explore many computational paths in superposition" },
      { id: "b", label: "They try all answers at once and simply read out the best one" },
      { id: "c", label: "They use interference to amplify correct answers" },
      { id: "d", label: "Measurement collapses the result to one outcome" },
    ],
    correctChoiceId: "b",
    explanation:
      "Superposition explores many paths, but measurement returns only one. The work is engineering interference so the right answer is the likely measurement — not reading all answers.",
    misconception: "Quantum computers read out all parallel answers at once.",
  },
  {
    id: "algorithms-walk-1",
    concept: "algorithms",
    kind: "algorithm-walkthrough",
    difficulty: "hard",
    prompt: "In Grover-style search, one iteration does what to the marked answer's amplitude?",
    choices: [
      { id: "a", label: "Increases it (amplitude amplification)" },
      { id: "b", label: "Sets it to zero" },
      { id: "c", label: "Leaves all amplitudes equal" },
      { id: "d", label: "Copies it to every other state" },
    ],
    correctChoiceId: "a",
    explanation:
      "Each Grover iteration nudges amplitude toward the marked item (and away from the rest), so after about \\( \\sqrt{N} \\) iterations measuring is very likely to give the answer.",
  },

  /* -------------------------------- hardware ------------------------------- */
  {
    id: "hardware-recall-1",
    concept: "hardware",
    kind: "recall",
    difficulty: "medium",
    prompt: "Decoherence in a real quantum computer refers to:",
    choices: [
      { id: "a", label: "Qubits running out of battery" },
      { id: "b", label: "Fragile quantum information leaking into the environment over time" },
      { id: "c", label: "Gates being applied too slowly" },
      { id: "d", label: "Copying a qubit too many times" },
    ],
    correctChoiceId: "b",
    explanation: "Interaction with the environment scrambles the delicate phases, so quantum information decays — the central engineering challenge.",
  },
  {
    id: "hardware-decoh-1",
    concept: "hardware",
    kind: "decoherence-scenario",
    difficulty: "hard",
    prompt: "A qubit holds a fragile superposition, but the circuit idles far longer than the qubit's coherence time before the next gate. The most likely effect is:",
    choices: [
      { id: "a", label: "Nothing — qubits keep their state indefinitely" },
      { id: "b", label: "The superposition decoheres, corrupting the result" },
      { id: "c", label: "The qubit speeds up later gates" },
      { id: "d", label: "The qubit is automatically corrected" },
    ],
    correctChoiceId: "b",
    explanation:
      "Beyond the coherence time, environmental coupling destroys the phase relationships. Real machines must finish (or error-correct) before decoherence ruins the computation.",
    misconception: "Idle time doesn't matter for qubits.",
  },
  {
    id: "hardware-misc-1",
    concept: "hardware",
    kind: "misconception",
    difficulty: "hard",
    prompt: "Which claim about quantum hardware is the misconception?",
    choices: [
      { id: "a", label: "Error correction spreads one logical qubit across many physical qubits" },
      { id: "b", label: "Adding more noisy qubits always increases useful computing power" },
      { id: "c", label: "Qubits must stay coherent long enough to finish the circuit" },
      { id: "d", label: "Noise is the main obstacle to scaling" },
    ],
    correctChoiceId: "b",
    explanation:
      "More qubits help only if they are reliable. Without low enough error rates and error correction, adding noisy qubits adds more noise, not more usable power.",
    misconception: "More qubits always means more power, regardless of noise.",
  },
];

/* --------------------------- Selection helpers --------------------------- */

function mod(n: number, m: number): number {
  return ((n % m) + m) % m;
}

/** Wrap a hand-written retrieval question as a recall battle challenge. */
function fromRetrieval(concept: ConceptTag, seed: number): BattleChallenge | null {
  const q = getRetrievalForConcept(concept, seed);
  if (!q) return null;
  return {
    id: `retrieval-${concept}-${seed}`,
    concept,
    kind: "recall",
    difficulty: q.difficulty,
    prompt: q.prompt,
    choices: q.choices,
    correctChoiceId: q.correctChoiceId,
    explanation: q.explanation,
    misconception: q.misconception,
  };
}

export interface SelectArgs {
  concept: ConceptTag;
  kind: ChallengeKind;
  difficulty: Difficulty;
  seed: number;
  excludeIds?: string[];
}

/**
 * Pick the best-fitting battle challenge for a room: exact (kind+difficulty)
 * first, then progressively looser matches, then the retrieval bank, never
 * failing. `seed` rotates among equally good matches; `excludeIds` avoids
 * repeating items already used on the floor when possible.
 */
export function selectChallenge(args: SelectArgs): BattleChallenge {
  const { concept, kind, difficulty, seed } = args;
  const exclude = new Set(args.excludeIds ?? []);
  const byConcept = BATTLE_BANK.filter((c) => c.concept === concept);

  const tiers: BattleChallenge[][] = [
    byConcept.filter((c) => c.kind === kind && c.difficulty === difficulty),
    byConcept.filter((c) => c.kind === kind),
    byConcept.filter((c) => c.difficulty === difficulty),
    byConcept,
  ];

  for (const tier of tiers) {
    const fresh = tier.filter((c) => !exclude.has(c.id));
    const pool = fresh.length > 0 ? fresh : tier;
    if (pool.length > 0) return pool[mod(seed, pool.length)];
  }

  const retrieval = fromRetrieval(concept, seed);
  if (retrieval) return retrieval;

  // Absolute last resort: any item in the bank.
  return BATTLE_BANK[mod(seed, BATTLE_BANK.length)];
}

/** Convert a battle challenge to the PracticeQuestion shape (for shared UI/AI paths). */
export function toPracticeQuestion(c: BattleChallenge): PracticeQuestion {
  return {
    prompt: c.prompt,
    choices: c.choices,
    correctChoiceId: c.correctChoiceId,
    explanation: c.explanation,
    conceptTag: c.concept,
    difficulty: c.difficulty,
    misconception: c.misconception,
    prerequisite: CONCEPT_PREREQ[c.concept] ? CONCEPT_LABEL[CONCEPT_PREREQ[c.concept]!] : undefined,
  };
}

/* ----------------------------- Difficulty -------------------------------- */

const DIFF_ORDER: Difficulty[] = ["easy", "medium", "hard"];

function shift(d: Difficulty, by: number): Difficulty {
  const i = DIFF_ORDER.indexOf(d);
  return DIFF_ORDER[Math.max(0, Math.min(DIFF_ORDER.length - 1, i + by))];
}

/** Base difficulty for a floor — the climb curve from recall to synthesis. */
export function difficultyForFloor(floor: number): Difficulty {
  if (floor <= 10) return "easy";
  if (floor <= 30) return "medium";
  return "hard";
}

/* --------------------------- Floor plan builder -------------------------- */

export type AssignmentReason = ReviewReason | "current" | "interleave";

export interface RoomAssignment {
  concept: ConceptTag;
  conceptLabel: string;
  reason: AssignmentReason;
  reasonText: string;
  difficulty: Difficulty;
  kind: ChallengeKind;
}

export interface PlannedRoom {
  slot: RoomSlot;
  assignment: RoomAssignment;
}

export interface FloorPlan {
  floor: number;
  rooms: PlannedRoom[];
  /** Ordered concepts a boss cycles through, weakest first (boss floors only). */
  bossConcepts: ConceptTag[];
}

function reasonText(concept: ConceptTag, reason: AssignmentReason): string {
  const label = CONCEPT_LABEL[concept];
  switch (reason) {
    case "struggled":
      return `${label} tripped you up before`;
    case "due":
      return `${label} is due for review`;
    case "stale":
      return `${label} hasn't been retrieved lately`;
    case "current":
      return `${label}: this realm's focus`;
    case "interleave":
      return `${label}: keeping older skill sharp`;
  }
}

/**
 * Order a climate's concept pool by learning need: struggled → due → stale
 * (from the learner model), tagged with the reason for the room UI.
 */
function reviewQueue(profile: UserProfile | null, pool: ConceptTag[]): { tag: ConceptTag; reason: ReviewReason }[] {
  const inPool = new Set(pool);
  return getRecommendedReview(profile)
    .filter((r) => inPool.has(r.tag))
    .map((r) => ({ tag: r.tag, reason: r.reason }));
}

/**
 * Build a floor's personalized room plan. The mix targets roughly
 * 70% due/weak concepts, 20% older mastered (interleaving), and 10% the
 * current unit — all drawn only from concepts this climate has taught.
 */
export function buildFloorPlan(floor: number, profile: UserProfile | null): FloorPlan {
  const layout = getFloorLayout(floor);
  const climate = climateForFloor(floor);
  const pool = climate.poolConcepts;
  const home = climate.homeConcepts;
  const baseDiff = difficultyForFloor(floor);

  const weak = reviewQueue(profile, pool);
  const conceptProfiles = getLearnerConceptProfile(profile);
  const masteredInPool = conceptProfiles
    .filter((p) => pool.includes(p.tag) && (p.status === "mastered" || p.status === "strengthening"))
    .map((p) => p.tag);
  // Older mastered = mastered concepts that are NOT this climate's home concepts.
  const interleave = masteredInPool.filter((t) => !home.includes(t));

  let weakIdx = 0;
  let homeIdx = 0;
  let interIdx = 0;

  // A 10-slot pattern approximating 70/20/10 (W=weak, I=interleave, C=current).
  const PATTERN: AssignmentReason[] = [
    "due",
    "due",
    "due",
    "current",
    "due",
    "due",
    "interleave",
    "due",
    "interleave",
    "due",
  ];

  function nextConcept(prefer: AssignmentReason, used: ConceptTag[]): { tag: ConceptTag; reason: AssignmentReason } {
    const notUsed = (t: ConceptTag) => !used.includes(t);

    const tryWeak = (): { tag: ConceptTag; reason: AssignmentReason } | null => {
      for (let i = 0; i < weak.length; i += 1) {
        const item = weak[(weakIdx + i) % weak.length];
        if (notUsed(item.tag)) {
          weakIdx = (weakIdx + i + 1) % Math.max(1, weak.length);
          return { tag: item.tag, reason: item.reason };
        }
      }
      return null;
    };
    const tryHome = (): { tag: ConceptTag; reason: AssignmentReason } | null => {
      for (let i = 0; i < home.length; i += 1) {
        const tag = home[(homeIdx + i) % home.length];
        if (notUsed(tag)) {
          homeIdx = (homeIdx + i + 1) % Math.max(1, home.length);
          return { tag, reason: "current" };
        }
      }
      return null;
    };
    const tryInter = (): { tag: ConceptTag; reason: AssignmentReason } | null => {
      for (let i = 0; i < interleave.length; i += 1) {
        const tag = interleave[(interIdx + i) % interleave.length];
        if (notUsed(tag)) {
          interIdx = (interIdx + i + 1) % Math.max(1, interleave.length);
          return { tag, reason: "interleave" };
        }
      }
      return null;
    };

    const order =
      prefer === "current"
        ? [tryHome, tryWeak, tryInter]
        : prefer === "interleave"
          ? [tryInter, tryWeak, tryHome]
          : [tryWeak, tryHome, tryInter];

    for (const fn of order) {
      const got = fn();
      if (got) return got;
    }
    // Everything used or empty buckets — fall back to any pool concept.
    const fallback = pool[(floor + used.length) % pool.length];
    return { tag: fallback, reason: "current" };
  }

  const used: ConceptTag[] = [];
  const rooms: PlannedRoom[] = [];

  layout.battleRooms.forEach((slot, i) => {
    if (slot.role === "boss") {
      // Boss assignment is handled per-round in the component via bossConcepts.
      const tag = home[0] ?? pool[0];
      rooms.push({
        slot,
        assignment: {
          concept: tag,
          conceptLabel: CONCEPT_LABEL[tag],
          reason: "current",
          reasonText: `${layout.boss?.name ?? "Boss"}: combines this realm's trials`,
          difficulty: shift(baseDiff, 0),
          kind: slot.kind ?? "predict",
        },
      });
      return;
    }

    const prefer = PATTERN[(floor + i) % PATTERN.length];
    const { tag, reason } = nextConcept(prefer, used);
    used.push(tag);

    // Desirable difficulty: ease struggled concepts a notch; press mastered ones.
    const sig = getConceptSignal(tag);
    const struggling = !!sig && sig.wrong > 0 && sig.lastResult === "wrong";
    const mastered = masteredInPool.includes(tag) && !struggling;
    const difficulty = shift(baseDiff, struggling ? -1 : mastered ? 1 : 0);

    rooms.push({
      slot,
      assignment: {
        concept: tag,
        conceptLabel: CONCEPT_LABEL[tag],
        reason,
        reasonText: reasonText(tag, reason),
        difficulty,
        kind: slot.kind ?? "recall",
      },
    });
  });

  // Boss concepts: prioritise the learner's weakest within the boss's set.
  const boss = bossForFloor(floor);
  let bossConcepts: ConceptTag[] = [];
  if (boss) {
    const weakSet = new Map(weak.map((w, i) => [w.tag, i] as const));
    bossConcepts = [...boss.concepts].sort((a, b) => {
      const wa = weakSet.has(a) ? weakSet.get(a)! : 999;
      const wb = weakSet.has(b) ? weakSet.get(b)! : 999;
      return wa - wb;
    });
  }

  return { floor, rooms, bossConcepts };
}

/** Concept recall line, used as a final guide hint fallback. */
export function conceptRecallLine(concept: ConceptTag): string {
  return CONCEPT_RECALL[concept];
}
