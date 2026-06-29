/**
 * Hand-written retrieval-practice bank for Tower MCQ fallbacks.
 * Each concept has ≥3 deterministic items with stable ids; all pass verifyTowerQuestion.
 */

import type { PracticeQuestion } from "@/lib/ai/validators";
import { pickVerifiedQuestion, verifyTowerQuestion } from "@/lib/tower/verify";
import { CONCEPTS, type ConceptTag } from "./concepts";

export const RETRIEVAL_BANK: Record<ConceptTag, PracticeQuestion[]> = {
  qubits: [
    {
      questionId: "fallback-qubits-1",
      prompt: "What makes a qubit different from a classical bit?",
      choices: [
        { id: "a", label: "It is always either 0 or 1, never both" },
        { id: "b", label: "It can be 0, 1, or a superposition of both until measured" },
        { id: "c", label: "It stores two classical bits at once" },
        { id: "d", label: "It is just a slower bit" },
      ],
      correctChoiceId: "b",
      explanation:
        "The correct answer is that a qubit can represent both 0 and 1 simultaneously until measured. This corrects the misconception that qubits read all values at once, as superposition is a fixed state until observation occurs.",
      conceptTag: "qubits",
      difficulty: "easy",
    },
    {
      questionId: "fallback-qubits-2",
      prompt: "Before measurement, a qubit's state is best described as:",
      choices: [
        { id: "a", label: "A hidden classical bit we don't know yet" },
        { id: "b", label: "Amplitudes for |0⟩ and |1⟩ that can interfere" },
        { id: "c", label: "A decimal number between 0 and 1 we could read out" },
        { id: "d", label: "Two independent classical bits" },
      ],
      correctChoiceId: "b",
      explanation: "Quantum state is amplitudes, not a hidden classical value; interference experiments rule out mere ignorance.",
      conceptTag: "qubits",
      difficulty: "easy",
    },
    {
      questionId: "fallback-qubits-3",
      prompt: "Measuring a qubit once yields:",
      choices: [
        { id: "a", label: "The exact amplitudes α and β" },
        { id: "b", label: "One classical outcome, 0 or 1" },
        { id: "c", label: "A value between 0 and 1" },
        { id: "d", label: "Both 0 and 1 simultaneously" },
      ],
      correctChoiceId: "b",
      explanation: "Measurement collapses the state to a single definite classical outcome.",
      conceptTag: "qubits",
      difficulty: "easy",
    },
  ],
  superposition: [
    {
      questionId: "fallback-superposition-1",
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
    {
      questionId: "fallback-superposition-2",
      prompt: "Superposition is destroyed when you:",
      choices: [
        { id: "a", label: "Apply a reversible gate like H" },
        { id: "b", label: "Measure in the computational basis" },
        { id: "c", label: "Wait without touching the qubit" },
        { id: "d", label: "Rotate on the Bloch sphere" },
      ],
      correctChoiceId: "b",
      explanation: "Measurement projects onto a basis state, ending the superposition.",
      conceptTag: "superposition",
      difficulty: "easy",
    },
    {
      questionId: "fallback-superposition-3",
      prompt: "Which claim about superposition is false?",
      choices: [
        { id: "a", label: "It means the qubit is secretly already 0 or 1" },
        { id: "b", label: "Equal superposition gives ~50/50 statistics" },
        { id: "c", label: "Gates can create superposition from |0⟩" },
        { id: "d", label: "Interference can reveal phase differences" },
      ],
      correctChoiceId: "a",
      explanation: "Superposition is not classical ignorance; interference experiments show the amplitudes genuinely coexist.",
      conceptTag: "superposition",
      difficulty: "medium",
    },
  ],
  measurement: [
    {
      questionId: "fallback-measurement-1",
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
    {
      questionId: "fallback-measurement-2",
      prompt: "A single measurement of one qubit reveals:",
      choices: [
        { id: "a", label: "The full amplitudes α and β" },
        { id: "b", label: "One classical bit" },
        { id: "c", label: "The relative phase exactly" },
        { id: "d", label: "Every parallel branch at once" },
      ],
      correctChoiceId: "b",
      explanation: "One shot yields one outcome; estimating amplitudes needs many identically prepared qubits.",
      conceptTag: "measurement",
      difficulty: "easy",
    },
    {
      questionId: "fallback-measurement-3",
      prompt: "Measurement is special because it:",
      choices: [
        { id: "a", label: "Is reversible like most gates" },
        { id: "b", label: "Introduces randomness and generally cannot be undone" },
        { id: "c", label: "Never changes the quantum state" },
        { id: "d", label: "Copies an unknown qubit perfectly" },
      ],
      correctChoiceId: "b",
      explanation: "Unlike unitary gates, measurement collapses the state and is irreversible.",
      conceptTag: "measurement",
      difficulty: "medium",
    },
  ],
  "bloch-sphere": [
    {
      questionId: "fallback-bloch-sphere-1",
      prompt: "On the Bloch sphere, the north and south poles represent:",
      choices: [
        { id: "a", label: "The states |0⟩ and |1⟩" },
        { id: "b", label: "Two entangled qubits" },
        { id: "c", label: "Measurement errors" },
        { id: "d", label: "The amplitudes' phases only" },
      ],
      correctChoiceId: "a",
      explanation: "The poles are the computational basis states |0⟩ and |1⟩; superpositions live on the surface between them.",
      conceptTag: "bloch-sphere",
      difficulty: "medium",
    },
    {
      questionId: "fallback-bloch-sphere-2",
      prompt: "A point on the Bloch sphere (not at a pole) represents:",
      choices: [
        { id: "a", label: "A pure single-qubit superposition" },
        { id: "b", label: "A two-qubit entangled state" },
        { id: "c", label: "A classical probability" },
        { id: "d", label: "An invalid qubit" },
      ],
      correctChoiceId: "a",
      explanation: "Every pure single-qubit state maps to a point on the sphere; interior points are mixed states.",
      conceptTag: "bloch-sphere",
      difficulty: "medium",
    },
    {
      questionId: "fallback-bloch-sphere-3",
      prompt: "Rotating on the Bloch sphere corresponds to:",
      choices: [
        { id: "a", label: "Applying unitary gates to the qubit" },
        { id: "b", label: "Measuring the qubit" },
        { id: "c", label: "Decoherence only" },
        { id: "d", label: "Copying the qubit" },
      ],
      correctChoiceId: "a",
      explanation: "Unitary gates rotate the Bloch vector; measurement projects it to a pole.",
      conceptTag: "bloch-sphere",
      difficulty: "medium",
    },
  ],
  phase: [
    {
      questionId: "fallback-phase-1",
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
    {
      questionId: "fallback-phase-2",
      prompt: "Applying Z to |1⟩ mainly:",
      choices: [
        { id: "a", label: "Flips |1⟩ to |0⟩" },
        { id: "b", label: "Adds a π phase (sign flip) to |1⟩" },
        { id: "c", label: "Creates an equal superposition" },
        { id: "d", label: "Measures the qubit" },
      ],
      correctChoiceId: "b",
      explanation: "Z leaves |0⟩ alone and sends |1⟩ to −|1⟩, a relative phase flip.",
      conceptTag: "phase",
      difficulty: "medium",
    },
    {
      questionId: "fallback-phase-3",
      prompt: "A global phase on the whole state:",
      choices: [
        { id: "a", label: "Changes measurement probabilities" },
        { id: "b", label: "Has no observable effect by itself" },
        { id: "c", label: "Always cancels interference" },
        { id: "d", label: "Destroys entanglement instantly" },
      ],
      correctChoiceId: "b",
      explanation: "Global phase is unobservable; only relative phase between components matters.",
      conceptTag: "phase",
      difficulty: "medium",
    },
  ],
  gates: [
    {
      questionId: "fallback-gates-1",
      prompt: "Applying the Hadamard gate twice in a row to a qubit does what?",
      choices: [
        { id: "a", label: "Measures it" },
        { id: "b", label: "Returns it to its original state (identity)" },
        { id: "c", label: "Flips it like an X gate" },
        { id: "d", label: "Destroys the state" },
      ],
      correctChoiceId: "b",
      explanation: "H is its own inverse, so H·H = I returns the qubit to where it started. Gates are reversible.",
      conceptTag: "gates",
      difficulty: "medium",
    },
    {
      questionId: "fallback-gates-2",
      prompt: "Applying X gate to |0⟩ gives:",
      choices: [
        { id: "a", label: "|0⟩ unchanged" },
        { id: "b", label: "The definite state |1⟩" },
        { id: "c", label: "An equal superposition" },
        { id: "d", label: "An invalid state" },
      ],
      correctChoiceId: "b",
      explanation: "X is a bit flip: X|0⟩ = |1⟩.",
      conceptTag: "gates",
      difficulty: "easy",
    },
    {
      questionId: "fallback-gates-3",
      prompt: "Quantum gates are primarily:",
      choices: [
        { id: "a", label: "Reversible unitary transformations" },
        { id: "b", label: "Random number generators" },
        { id: "c", label: "Measurements in disguise" },
        { id: "d", label: "Irreversible copy operations" },
      ],
      correctChoiceId: "a",
      explanation: "Unitary gates evolve amplitudes reversibly until measurement.",
      conceptTag: "gates",
      difficulty: "easy",
    },
  ],
  interference: [
    {
      questionId: "fallback-interference-1",
      prompt: "Two paths to the same outcome have equal but opposite amplitudes. The outcome's probability is:",
      choices: [
        { id: "a", label: "Doubled" },
        { id: "b", label: "Zero; they cancel" },
        { id: "c", label: "Unchanged" },
        { id: "d", label: "Always one half" },
      ],
      correctChoiceId: "b",
      explanation: "Amplitudes add before squaring; equal-and-opposite amplitudes cancel, giving zero probability (destructive interference).",
      conceptTag: "interference",
      difficulty: "medium",
    },
    {
      questionId: "fallback-interference-2",
      prompt: "Probabilities combine incorrectly if you:",
      choices: [
        { id: "a", label: "Add amplitudes (with phase) before squaring" },
        { id: "b", label: "Add outcome probabilities directly when paths interfere" },
        { id: "c", label: "Use many measurement shots" },
        { id: "d", label: "Apply a Hadamard before measuring" },
      ],
      correctChoiceId: "b",
      explanation: "Interference requires adding amplitudes first; adding probabilities skips phase information.",
      conceptTag: "interference",
      difficulty: "medium",
    },
    {
      questionId: "fallback-interference-3",
      prompt: "Constructive interference makes an outcome:",
      choices: [
        { id: "a", label: "Less likely than either path alone" },
        { id: "b", label: "More likely when amplitudes align in phase" },
        { id: "c", label: "Impossible to measure" },
        { id: "d", label: "Always probability 1" },
      ],
      correctChoiceId: "b",
      explanation: "Aligned amplitudes reinforce before squaring, boosting the outcome probability.",
      conceptTag: "interference",
      difficulty: "medium",
    },
  ],
  entanglement: [
    {
      questionId: "fallback-entanglement-1",
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
    {
      questionId: "fallback-entanglement-2",
      prompt: "A Bell pair is created from |00⟩ by applying:",
      choices: [
        { id: "a", label: "H on the first qubit, then CNOT" },
        { id: "b", label: "X on both qubits only" },
        { id: "c", label: "Measure both qubits" },
        { id: "d", label: "Z on the second qubit only" },
      ],
      correctChoiceId: "a",
      explanation: "H then CNOT builds (|00⟩+|11⟩)/√2, the standard Bell state.",
      conceptTag: "entanglement",
      difficulty: "medium",
    },
    {
      questionId: "fallback-entanglement-3",
      prompt: "Entanglement means:",
      choices: [
        { id: "a", label: "Two qubits share correlations no separate description captures" },
        { id: "b", label: "You can send messages faster than light" },
        { id: "c", label: "Each qubit has a definite hidden value" },
        { id: "d", label: "Measurement copies the state perfectly" },
      ],
      correctChoiceId: "a",
      explanation: "Entangled joint states cannot be factored into individual qubit stories.",
      conceptTag: "entanglement",
      difficulty: "hard",
    },
  ],
  algorithms: [
    {
      questionId: "fallback-algorithms-1",
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
    {
      questionId: "fallback-algorithms-2",
      prompt: "Grover search on N items gives roughly:",
      choices: [
        { id: "a", label: "Exponential speedup" },
        { id: "b", label: "Quadratic speedup (~√N queries)" },
        { id: "c", label: "No speedup over classical" },
        { id: "d", label: "Instant exact answer" },
      ],
      correctChoiceId: "b",
      explanation: "Grover provides about √N speedup, not exponential.",
      conceptTag: "algorithms",
      difficulty: "hard",
    },
    {
      questionId: "fallback-algorithms-3",
      prompt: "Before the final measurement, a quantum algorithm typically:",
      choices: [
        { id: "a", label: "Amplifies the correct outcome via interference" },
        { id: "b", label: "Prints every branch's answer" },
        { id: "c", label: "Copies all candidates classically" },
        { id: "d", label: "Avoids using gates" },
      ],
      correctChoiceId: "a",
      explanation: "Oracle + diffusion (or similar) choreographs interference toward the target state.",
      conceptTag: "algorithms",
      difficulty: "hard",
    },
  ],
  hardware: [
    {
      questionId: "fallback-hardware-1",
      prompt: "Decoherence in a real quantum computer refers to:",
      choices: [
        { id: "a", label: "Qubits running out of battery" },
        { id: "b", label: "Fragile quantum information leaking into the environment over time" },
        { id: "c", label: "Gates being applied too slowly" },
        { id: "d", label: "Copying a qubit too many times" },
      ],
      correctChoiceId: "b",
      explanation: "Interaction with the environment scrambles the delicate phases, so quantum information decays. That is the core engineering challenge.",
      conceptTag: "hardware",
      difficulty: "medium",
    },
    {
      questionId: "fallback-hardware-2",
      prompt: "Quantum error correction spreads one logical qubit across:",
      choices: [
        { id: "a", label: "Many physical qubits with redundancy" },
        { id: "b", label: "A single very stable atom" },
        { id: "c", label: "Classical RAM" },
        { id: "d", label: "Nothing; it is impossible" },
      ],
      correctChoiceId: "a",
      explanation: "Logical qubits encode into many physical qubits so errors can be detected and corrected.",
      conceptTag: "hardware",
      difficulty: "hard",
    },
    {
      questionId: "fallback-hardware-3",
      prompt: "Real qubits today are challenging because they:",
      choices: [
        { id: "a", label: "Stay coherent forever without isolation" },
        { id: "b", label: "Decohere quickly and need error mitigation or correction" },
        { id: "c", label: "Cannot implement any gates" },
        { id: "d", label: "Always measure as 0" },
      ],
      correctChoiceId: "b",
      explanation: "Noise and decoherence limit circuit depth; engineering fights constant environmental leakage.",
      conceptTag: "hardware",
      difficulty: "medium",
    },
  ],
};

/** Verify every handwritten fallback (for scripts and dev checks). */
export function assertRetrievalBankIntegrity(): string[] {
  const errors: string[] = [];
  for (const tag of CONCEPTS) {
    const bank = RETRIEVAL_BANK[tag];
    if (!bank || bank.length < 3) {
      errors.push(`${tag}: expected ≥3 fallback questions, got ${bank?.length ?? 0}`);
      continue;
    }
    for (const question of bank) {
      if (!verifyTowerQuestion(question, { expectedConceptTag: tag, source: "fallback" })) {
        errors.push(`${tag}: failed verification for ${question.questionId ?? question.prompt.slice(0, 40)}`);
      }
    }
  }
  return errors;
}

export function getRetrievalForConcept(
  tag: ConceptTag,
  seed = 0,
  excludeIds: ReadonlySet<string> = new Set(),
  recentPrompts: readonly string[] = []
): PracticeQuestion | null {
  const bank = RETRIEVAL_BANK[tag];
  if (!bank || bank.length === 0) return null;

  const filtered = bank.filter((q) => {
    const legacyId = `mcq:${q.conceptTag}:${q.prompt.trim()}`;
    const stableId = q.questionId ?? legacyId;
    return !excludeIds.has(stableId) && !excludeIds.has(legacyId);
  });
  const pool = filtered.length > 0 ? filtered : bank;

  for (let i = 0; i < pool.length; i++) {
    const idx = ((seed + i) % pool.length + pool.length) % pool.length;
    const candidate = pool[idx];
    const verified = verifyTowerQuestion(candidate, {
      expectedConceptTag: tag,
      source: "fallback",
      recentPrompts,
    });
    if (verified) return verified.question;
  }

  return pickVerifiedQuestion(pool, { expectedConceptTag: tag, source: "fallback", recentPrompts })?.question ?? null;
}

/** All retrieval questions for a concept (for dedup-aware selection). */
export function allRetrievalForConcept(tag: ConceptTag): PracticeQuestion[] {
  return RETRIEVAL_BANK[tag] ?? [];
}
