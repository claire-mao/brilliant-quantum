import type { PracticeQuestion } from "@/lib/ai/validators";
import type { ConceptTag } from "@/lib/learning/concepts";

export type MonsterType =
  | "concept-wraith"
  | "phase-phantom"
  | "gate-golem"
  | "noise-gremlin"
  | "oracle-mimic";

export interface Monster {
  type: MonsterType;
  name: string;
  tagline: string;
  /** Correct answers needed to defeat it. */
  maxHp: number;
}

/** Original fantasy/science creatures — no copyrighted references. */
export const MONSTERS: Monster[] = [
  { type: "concept-wraith", name: "Concept Wraith", tagline: "Feeds on half-formed ideas.", maxHp: 3 },
  { type: "phase-phantom", name: "Phase Phantom", tagline: "Hides inside relative phase.", maxHp: 3 },
  { type: "gate-golem", name: "Gate Golem", tagline: "Forged from stubborn logic gates.", maxHp: 4 },
  { type: "noise-gremlin", name: "Noise Gremlin", tagline: "Trails decoherence mist.", maxHp: 3 },
  { type: "oracle-mimic", name: "Oracle Mimic", tagline: "Answers only to sharp reasoning.", maxHp: 4 },
];

export function monsterForIndex(index: number): Monster {
  return MONSTERS[index % MONSTERS.length];
}

/** Each fragile concept manifests as a themed monster (retrieval, not trivia). */
const CONCEPT_MONSTER: Record<ConceptTag, MonsterType> = {
  phase: "phase-phantom",
  hardware: "noise-gremlin",
  gates: "gate-golem",
  algorithms: "oracle-mimic",
  qubits: "concept-wraith",
  measurement: "concept-wraith",
  superposition: "concept-wraith",
  "bloch-sphere": "concept-wraith",
  interference: "concept-wraith",
  entanglement: "concept-wraith",
};

export function monsterForConcept(tag: ConceptTag): Monster {
  const type = CONCEPT_MONSTER[tag] ?? "concept-wraith";
  return MONSTERS.find((m) => m.type === type) ?? MONSTERS[0];
}

/**
 * Hand-written fallback questions so the arena always works with AI disabled.
 * All are accurate, generic quantum-information concepts.
 */
export const FALLBACK_QUESTIONS: PracticeQuestion[] = [
  {
    prompt: "A qubit is prepared in an equal superposition of |0\\rangle and |1\\rangle. A single measurement in the computational basis yields:",
    choices: [
      { id: "a", label: "Always 0" },
      { id: "b", label: "Always 1" },
      { id: "c", label: "0 or 1, each with probability 1/2" },
      { id: "d", label: "A value between 0 and 1" },
    ],
    correctChoiceId: "c",
    explanation:
      "Measurement returns a definite basis state. With equal amplitudes, 0 and 1 each occur with probability 1/2 — you never observe an intermediate value.",
    conceptTag: "superposition",
    difficulty: "easy",
  },
  {
    prompt: "Multiplying a qubit's whole state by a global phase e^{i\\theta} changes:",
    choices: [
      { id: "a", label: "The measurement probabilities" },
      { id: "b", label: "Nothing physically observable" },
      { id: "c", label: "Which basis states exist" },
      { id: "d", label: "The qubit into a classical bit" },
    ],
    correctChoiceId: "b",
    explanation:
      "A global phase has no observable effect: probabilities depend on |amplitude|^2, which is unchanged. Only relative phase between components matters.",
    conceptTag: "global-phase",
    difficulty: "medium",
  },
  {
    prompt: "Two paths to the same outcome carry amplitudes that are equal in size but opposite in sign. The probability of that outcome is:",
    choices: [
      { id: "a", label: "Doubled" },
      { id: "b", label: "Unchanged" },
      { id: "c", label: "Zero — destructive interference" },
      { id: "d", label: "Always 1" },
    ],
    correctChoiceId: "c",
    explanation:
      "Amplitudes add before squaring. Equal and opposite amplitudes cancel, so the combined amplitude — and the probability — is zero.",
    conceptTag: "interference",
    difficulty: "medium",
  },
  {
    prompt: "Applying the Hadamard gate twice in a row to a qubit is equivalent to:",
    choices: [
      { id: "a", label: "Measuring it" },
      { id: "b", label: "Doing nothing (the identity)" },
      { id: "c", label: "Flipping it with an X gate" },
      { id: "d", label: "Destroying the state" },
    ],
    correctChoiceId: "b",
    explanation: "The Hadamard gate is its own inverse: H·H = I. Applying it twice returns the qubit to its original state.",
    conceptTag: "gates",
    difficulty: "medium",
  },
  {
    prompt: "Alice and Bob share an entangled pair. Alice measures her qubit. Bob's distant qubit:",
    choices: [
      { id: "a", label: "Instantly receives a message from Alice" },
      { id: "b", label: "Shows correlated statistics, but Bob sees nothing change locally" },
      { id: "c", label: "Becomes a classical bit Alice controls" },
      { id: "d", label: "Is completely unaffected in every way" },
    ],
    correctChoiceId: "b",
    explanation:
      "Correlations appear only when results are later compared. Locally Bob's outcomes look random, so no information travels faster than light — the no-signaling principle.",
    conceptTag: "entanglement",
    difficulty: "hard",
  },
  {
    prompt: "The no-cloning theorem states that you cannot:",
    choices: [
      { id: "a", label: "Measure an unknown qubit" },
      { id: "b", label: "Copy an arbitrary unknown quantum state exactly" },
      { id: "c", label: "Send a qubit through a channel" },
      { id: "d", label: "Entangle two qubits" },
    ],
    correctChoiceId: "b",
    explanation:
      "No operation can make an exact copy of an arbitrary unknown state. You can prepare known states or move states, but perfect copying of an unknown state is impossible.",
    conceptTag: "no-cloning",
    difficulty: "medium",
  },
];

export function fallbackQuestion(seed: number): PracticeQuestion {
  return FALLBACK_QUESTIONS[((seed % FALLBACK_QUESTIONS.length) + FALLBACK_QUESTIONS.length) % FALLBACK_QUESTIONS.length];
}
