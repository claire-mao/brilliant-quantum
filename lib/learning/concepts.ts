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
