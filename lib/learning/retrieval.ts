/**
 * Hand-written retrieval-practice bank, one concise recall question per concept.
 * These power between-lesson retrieval and the tower arena when AI is disabled,
 * so the learning loop never depends on the network. Accurate, conceptual, and
 * free of heavy math. Reuses the validated PracticeQuestion shape.
 */

import type { PracticeQuestion } from "@/lib/ai/validators";
import type { ConceptTag } from "./concepts";

export const RETRIEVAL_BANK: Record<ConceptTag, PracticeQuestion[]> = {
  qubits: [
    {
      prompt: "What makes a qubit different from a classical bit?",
      choices: [
        { id: "a", label: "It is always either 0 or 1, never both" },
        { id: "b", label: "It can be 0, 1, or a superposition of both until measured" },
        { id: "c", label: "It stores two classical bits at once" },
        { id: "d", label: "It is just a slower bit" },
      ],
      correctChoiceId: "b",
      explanation: "A qubit holds amplitudes for 0 and 1 simultaneously; only measurement forces a single outcome.",
      conceptTag: "qubits",
      difficulty: "easy",
    },
  ],
  superposition: [
    {
      prompt: "A qubit in an equal superposition is measured many times. The results are:",
      choices: [
        { id: "a", label: "Always the same value" },
        { id: "b", label: "Roughly half 0 and half 1" },
        { id: "c", label: "Always a value between 0 and 1" },
        { id: "d", label: "Impossible to predict statistically" },
      ],
      correctChoiceId: "b",
      explanation: "Equal amplitudes give equal probabilities, so across many shots you see about 50% 0 and 50% 1.",
      conceptTag: "superposition",
      difficulty: "easy",
    },
  ],
  measurement: [
    {
      prompt: "Right after you measure a qubit and read 1, measuring it again (without changing it) gives:",
      choices: [
        { id: "a", label: "0 or 1 with equal chance" },
        { id: "b", label: "1 again" },
        { id: "c", label: "A random value each time" },
        { id: "d", label: "An error" },
      ],
      correctChoiceId: "b",
      explanation: "Measurement collapses the state; the qubit now is 1, so repeated measurement keeps returning 1.",
      conceptTag: "measurement",
      difficulty: "easy",
    },
  ],
  "bloch-sphere": [
    {
      prompt: "On the Bloch sphere, the north and south poles represent:",
      choices: [
        { id: "a", label: "The states |0⟩ and |1⟩" },
        { id: "b", label: "Two entangled qubits" },
        { id: "c", label: "Measurement errors" },
        { id: "d", label: "The amplitudes' phases" },
      ],
      correctChoiceId: "a",
      explanation: "The poles are the computational basis states |0⟩ and |1⟩; superpositions live on the surface between them.",
      conceptTag: "bloch-sphere",
      difficulty: "medium",
    },
  ],
  phase: [
    {
      prompt: "A relative phase between |0⟩ and |1⟩ becomes observable only when you:",
      choices: [
        { id: "a", label: "Measure immediately in the 0/1 basis" },
        { id: "b", label: "Let the amplitudes interfere (e.g. apply H first)" },
        { id: "c", label: "Multiply the whole state by a phase" },
        { id: "d", label: "Wait long enough" },
      ],
      correctChoiceId: "b",
      explanation: "Relative phase is hidden in 0/1 probabilities; interference (such as a Hadamard) converts it into measurable differences.",
      conceptTag: "phase",
      difficulty: "medium",
    },
  ],
  gates: [
    {
      prompt: "Applying the Hadamard gate twice in a row to a qubit does what?",
      choices: [
        { id: "a", label: "Measures it" },
        { id: "b", label: "Returns it to its original state (identity)" },
        { id: "c", label: "Flips it like an X gate" },
        { id: "d", label: "Destroys the state" },
      ],
      correctChoiceId: "b",
      explanation: "H is its own inverse, so H·H = I returns the qubit to where it started — gates are reversible.",
      conceptTag: "gates",
      difficulty: "medium",
    },
  ],
  interference: [
    {
      prompt: "Two paths to the same outcome have equal but opposite amplitudes. The outcome's probability is:",
      choices: [
        { id: "a", label: "Doubled" },
        { id: "b", label: "Zero — they cancel" },
        { id: "c", label: "Unchanged" },
        { id: "d", label: "Always one half" },
      ],
      correctChoiceId: "b",
      explanation: "Amplitudes add before squaring; equal-and-opposite amplitudes cancel, giving zero probability (destructive interference).",
      conceptTag: "interference",
      difficulty: "medium",
    },
  ],
  entanglement: [
    {
      prompt: "Alice measures her half of an entangled pair. Bob, far away, sees:",
      choices: [
        { id: "a", label: "An instant message from Alice" },
        { id: "b", label: "Locally random results that only correlate once compared" },
        { id: "c", label: "A guaranteed opposite of Alice's bit he can read alone" },
        { id: "d", label: "Nothing ever, in any sense" },
      ],
      correctChoiceId: "b",
      explanation: "Bob's local outcomes look random; the correlation only appears when results are compared, so no signal travels faster than light.",
      conceptTag: "entanglement",
      difficulty: "hard",
    },
  ],
  algorithms: [
    {
      prompt: "What gives a quantum algorithm its advantage on the right problem?",
      choices: [
        { id: "a", label: "Trying every answer in parallel and reading them all" },
        { id: "b", label: "Using interference so wrong answers cancel and the right one stands out" },
        { id: "c", label: "Running faster classical logic" },
        { id: "d", label: "Storing more memory" },
      ],
      correctChoiceId: "b",
      explanation: "You can't read all branches; algorithms arrange interference so amplitude concentrates on the correct answer before measuring.",
      conceptTag: "algorithms",
      difficulty: "hard",
    },
  ],
  hardware: [
    {
      prompt: "Decoherence in a real quantum computer refers to:",
      choices: [
        { id: "a", label: "Qubits running out of battery" },
        { id: "b", label: "Fragile quantum information leaking into the environment over time" },
        { id: "c", label: "Gates being applied too slowly" },
        { id: "d", label: "Copying a qubit too many times" },
      ],
      correctChoiceId: "b",
      explanation: "Interaction with the environment scrambles the delicate phases, so quantum information decays — the core engineering challenge.",
      conceptTag: "hardware",
      difficulty: "medium",
    },
  ],
};

export function getRetrievalForConcept(tag: ConceptTag, seed = 0): PracticeQuestion | null {
  const bank = RETRIEVAL_BANK[tag];
  if (!bank || bank.length === 0) return null;
  return bank[((seed % bank.length) + bank.length) % bank.length];
}
