/**
 * Concept taxonomy for the Learning Science Engine. Concepts are the unit of
 * mastery and review — they sit above individual lessons so the app can reason
 * about prior knowledge, prerequisites, and what is due for retrieval practice.
 *
 * Pure data only (no browser APIs), so this is safe to import on server or
 * client.
 */

export type ConceptTag =
  | "qubits"
  | "measurement"
  | "superposition"
  | "bloch-sphere"
  | "phase"
  | "gates"
  | "interference"
  | "entanglement"
  | "algorithms"
  | "hardware";

export const CONCEPTS: ConceptTag[] = [
  "qubits",
  "measurement",
  "superposition",
  "bloch-sphere",
  "phase",
  "gates",
  "interference",
  "entanglement",
  "algorithms",
  "hardware",
];

export const CONCEPT_LABEL: Record<ConceptTag, string> = {
  qubits: "Qubits",
  measurement: "Measurement",
  superposition: "Superposition",
  "bloch-sphere": "Bloch sphere",
  phase: "Phase",
  gates: "Gates",
  interference: "Interference",
  entanglement: "Entanglement",
  algorithms: "Algorithms",
  hardware: "Hardware",
};

/** Rough teaching order, used to surface "older" concepts for spaced review. */
export const CONCEPT_ORDER: ConceptTag[] = [
  "qubits",
  "superposition",
  "measurement",
  "bloch-sphere",
  "phase",
  "gates",
  "interference",
  "entanglement",
  "algorithms",
  "hardware",
];

/** The single strongest prerequisite for each concept (prior knowledge). */
export const CONCEPT_PREREQ: Record<ConceptTag, ConceptTag | null> = {
  qubits: null,
  superposition: "qubits",
  measurement: "superposition",
  "bloch-sphere": "superposition",
  phase: "bloch-sphere",
  gates: "superposition",
  interference: "phase",
  entanglement: "gates",
  algorithms: "interference",
  hardware: "algorithms",
};

/** One-line retrieval reminder for each concept (what to recall, not reread). */
export const CONCEPT_RECALL: Record<ConceptTag, string> = {
  qubits: "a qubit can be |0⟩, |1⟩, or a superposition of both.",
  superposition: "superposition means a qubit holds amplitudes for 0 and 1 at once.",
  measurement: "measuring collapses a qubit to a single definite outcome.",
  "bloch-sphere": "every single-qubit state sits somewhere on the Bloch sphere.",
  phase: "relative phase stays hidden until interference reveals it.",
  gates: "gates are reversible operations that transform a state.",
  interference: "amplitudes add before squaring, so they can reinforce or cancel.",
  entanglement: "entangled qubits share correlations no separate description captures.",
  algorithms: "a quantum algorithm choreographs interference toward the answer.",
  hardware: "real qubits are fragile physical systems that lose coherence.",
};

/** Substantive wrong-answer guidance per concept (attempts 1–3, lesson tone). */
export const CONCEPT_WRONG_HINTS: Record<ConceptTag, [string, string, string]> = {
  qubits: [
    "A classical bit is 0 or 1; a qubit has amplitudes for both. Which option reflects that richer state?",
    "A qubit can combine |0⟩ and |1⟩, not just label one or the other.",
    "Before measurement, a qubit can be |0⟩, |1⟩, or a superposition of both. Eliminate choices that treat it as a definite classical value.",
  ],
  superposition: [
    "That treats the qubit like it's already 0 or 1. Superposition means amplitudes for both at once.",
    "Superposition isn't hidden classical randomness—it's a real quantum state with both amplitudes.",
    "Superposition means amplitudes for 0 and 1 at the same time. Reject options that assume a hidden definite value.",
  ],
  measurement: [
    "Before measurement: quantum rules. After: one definite outcome. Which part is about collapse?",
    "Measurement picks an outcome—it doesn't transform the state like a gate does.",
    "Measurement collapses to one outcome. Don't confuse it with a reversible gate.",
  ],
  "bloch-sphere": [
    "Every single-qubit state maps to a point on the Bloch sphere. Which option uses that?",
    "|0⟩ and |1⟩ are opposite poles on the Bloch sphere. Use that geometry.",
    "Every single-qubit state has a position on the Bloch sphere. Match your answer to it.",
  ],
  phase: [
    "Global phase is unobservable; relative phase affects interference. Which kind matters here?",
    "Same state can differ by phase—relative phase only shows up when amplitudes combine.",
    "Relative phase matters for interference; global phase does not. Don't mix them up.",
  ],
  gates: [
    "Gates transform amplitudes reversibly—they don't extract classical outcomes.",
    "What does the gate do to the state: flip, rotate, or mix amplitudes?",
    "Gates are reversible transforms. Eliminate choices that sound like measurement or randomness.",
  ],
  interference: [
    "Add amplitudes first, then square—don't add probabilities directly.",
    "Amplitudes can reinforce or cancel before squaring. Which option reflects that?",
    "Amplitudes add before squaring, enabling cancelation. Don't skip to classical probability.",
  ],
  entanglement: [
    "Entangled qubits can't be described separately—they're correlated as a pair.",
    "Measuring one constrains the other, but no signal travels faster than light.",
    "Entangled qubits share correlations no separate description captures. Not independent hidden coins.",
  ],
  algorithms: [
    "Quantum algorithms use interference to amplify right paths—not brute-force parallel trials.",
    "Speedup comes from canceling wrong paths and boosting right ones.",
    "Algorithms choreograph interference toward the answer, not magical parallelism.",
  ],
  hardware: [
    "Real qubits are fragile—noise and decoherence limit how long quantum effects last.",
    "Quantum computers need isolated systems held long enough to run gates.",
    "Real qubits lose coherence quickly. Don't ignore noise and error.",
  ],
};

/** Substantive wrong-answer guidance per concept (attempts 1–3, Tower tone). Nudge only; no answer reveal. */
export const CONCEPT_WRONG_HINTS_TOWER: Record<ConceptTag, [string, string, string]> = {
  qubits: [
    "That treats the qubit like a plain coin. Check what can coexist before measurement.",
    "A qubit is not a hidden classical bit. Which option allows both |0⟩ and |1⟩ at once?",
    "Before measurement, a qubit can blend |0⟩ and |1⟩. Reject choices that lock it to one classical value.",
  ],
  superposition: [
    "That assumes the qubit was already 0 or 1 in hiding. Superposition means both amplitudes coexist.",
    "Superposition is not a guess about a secret value. It is a real blend of 0 and 1.",
    "Superposition holds amplitudes for 0 and 1 at once. Cut answers that treat the qubit as one outcome all along.",
  ],
  measurement: [
    "Before measurement: quantum rules. After: one outcome. Which part is about collapse?",
    "Reading a qubit is not applying a gate. It forces one outcome from the amplitudes.",
    "Measurement collapses to a single outcome. Do not confuse it with a reversible gate.",
  ],
  "bloch-sphere": [
    "Every lone qubit maps to a point on the Bloch sphere, superpositions included.",
    "On the sphere, |0⟩ and |1⟩ sit at opposite poles. States are angles and tilts.",
    "Each single-qubit state has a place on the Bloch sphere. Does your answer match it?",
  ],
  phase: [
    "Global phase is invisible; relative phase changes how paths combine. Which kind matters here?",
    "Two states can differ by phase yet look the same alone. Relative phase shows up when amplitudes meet.",
    "Relative phase hides until interference reveals it. Do not confuse it with invisible global phase.",
  ],
  gates: [
    "Gates reshape amplitudes reversibly. They do not pluck out classical secrets.",
    "What does the gate do: flip, rotate, or mix amplitudes?",
    "Gates transform states reversibly. Reject choices that sound like randomness or measurement.",
  ],
  interference: [
    "Add amplitudes first, then square. Do not add probabilities directly.",
    "Amplitudes can amplify or cancel before you square. Which option reflects that?",
    "Amplitudes add before squaring, so paths reinforce or destroy each other.",
  ],
  entanglement: [
    "Entangled qubits share a bond no separate story can capture.",
    "Measuring one may fix the other's outcome, but no message travels faster than light.",
    "Entangled qubits share correlations no split description captures. Not independent coins with hidden presets.",
  ],
  algorithms: [
    "Quantum algorithms choreograph interference to amplify right paths, not brute-force every answer.",
    "Speed comes from canceling bad paths and boosting good ones.",
    "A quantum algorithm steers interference toward the answer, not magical parallelism.",
  ],
  hardware: [
    "Real qubits are fragile. Noise and decoherence erode quantum effects quickly.",
    "Building a quantum machine means holding isolated states long enough to run gates.",
    "Real qubits lose coherence in a noisy world. Do not ignore error or noise.",
  ],
};

/**
 * Lesson id -> concept tags (primary concept first). Lesson ids are stable and
 * must never change; this map is the bridge between progress data and concepts.
 */
export const LESSON_CONCEPTS: Record<string, ConceptTag[]> = {
  "qubits-superposition": ["qubits", "superposition"],
  measurement: ["measurement"],
  "bloch-sphere": ["bloch-sphere", "qubits"],
  "relative-phase": ["phase"],
  "no-cloning": ["measurement", "qubits"],
  "quantum-gates": ["gates"],
  "pauli-z": ["gates", "phase"],
  hadamard: ["gates", "superposition"],
  "quantum-circuits": ["gates"],
  reversibility: ["gates"],
  "universal-gates": ["gates"],
  interference: ["interference", "superposition"],
  "constructive-interference": ["interference"],
  "destructive-interference": ["interference"],
  "interference-advantage": ["interference", "algorithms"],
  "classical-correlation": ["entanglement"],
  entanglement: ["entanglement"],
  "bell-states": ["entanglement"],
  "measuring-entangled": ["entanglement", "measurement"],
  "no-signaling": ["entanglement"],
  "quantum-algorithm": ["algorithms"],
  "deutsch-jozsa": ["algorithms"],
  "grover-search": ["algorithms", "interference"],
  "shors-algorithm": ["algorithms"],
  "when-quantum-wins": ["algorithms", "hardware"],
  "building-quantum-computer": ["hardware"],
  "hardware-platforms": ["hardware"],
  "noise-decoherence": ["hardware"],
  "error-correction": ["hardware"],
  "future-quantum": ["hardware"],
};

export function conceptsForLesson(lessonId: string): ConceptTag[] {
  return LESSON_CONCEPTS[lessonId] ?? [];
}

export function primaryConcept(lessonId: string): ConceptTag | null {
  return conceptsForLesson(lessonId)[0] ?? null;
}

export function lessonsForConcept(tag: ConceptTag): string[] {
  return Object.keys(LESSON_CONCEPTS).filter((id) => LESSON_CONCEPTS[id].includes(tag));
}

/** The prerequisite concept + reminder text for a lesson, if any. */
export function getPrerequisiteReminder(
  lessonId: string
): { tag: ConceptTag; label: string; text: string } | null {
  const primary = primaryConcept(lessonId);
  if (!primary) return null;
  const prereq = CONCEPT_PREREQ[primary];
  if (!prereq) return null;
  return { tag: prereq, label: CONCEPT_LABEL[prereq], text: CONCEPT_RECALL[prereq] };
}
