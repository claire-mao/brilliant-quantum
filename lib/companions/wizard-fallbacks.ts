import { CONCEPT_RECALL, CONCEPT_WRONG_HINTS, type ConceptTag } from "@/lib/learning/concepts";
import type { WizardHintLevel } from "@/lib/ai/wizard";
import { AI_OFF_HINT_FALLBACKS, SUMMON_FALLBACKS } from "./messages";

/** Deterministic wizard copy used when the Claude wizard endpoint is unavailable. */

export function fallbackHint(conceptTag: ConceptTag | null, level: WizardHintLevel): string {
  if (conceptTag) return CONCEPT_WRONG_HINTS[conceptTag][level - 1];
  return AI_OFF_HINT_FALLBACKS[level];
}

interface PracticeItem {
  text: string;
  answer: string;
}

const GENERIC_PRACTICE: readonly PracticeItem[] = [
  {
    text: "Quick check: what is the one idea this step wants you to predict before testing it?",
    answer: "Name the idea, then run the experiment to check it.",
  },
  {
    text: "Quick check: which everyday intuition does this step say breaks down for quantum systems?",
    answer: "The one the step's experiment contradicts — state it, then say what replaces it.",
  },
  {
    text: "Quick check: if you repeated this step's experiment many times, what pattern would you expect to see?",
    answer: "The probabilities predicted by the amplitudes, not a single fixed outcome.",
  },
];

export function fallbackPractice(conceptTag: ConceptTag | null, avoid: readonly string[] = []): PracticeItem {
  const pool: PracticeItem[] = [];
  if (conceptTag) {
    const recall = CONCEPT_RECALL[conceptTag];
    const claim = recall.replace(/\.$/, "");
    const answer = recall.charAt(0).toUpperCase() + recall.slice(1);
    pool.push(
      { text: `Quick check: in your own words, why is it true that ${claim}?`, answer },
      { text: `True or false: ${claim}. Say what would go wrong if it were false.`, answer: `True — ${recall}` }
    );
  }
  pool.push(...GENERIC_PRACTICE);
  const fresh = pool.filter((p) => !avoid.includes(p.text));
  const candidates = fresh.length ? fresh : pool;
  return candidates[Math.floor(Math.random() * candidates.length)];
}

const FALLBACK_FACTS: Partial<Record<ConceptTag, readonly string[]>> & { default: readonly string[] } = {
  superposition: [
    "Single photons sent one at a time through a double slit still build an interference pattern — each photon interferes with itself.",
    "A superposition is not a coin mid-flip: its amplitudes can be negative, which is why quantum probabilities can cancel.",
  ],
  measurement: [
    "Which-path information, not a human observer, destroys interference: any record of the path is enough.",
    "Quantum random number generators sell measurement outcomes as certified randomness for cryptography.",
  ],
  interference: [
    "Interference is why amplitudes are added before squaring: two paths can cancel to zero probability.",
    "Grover's search works by making wrong-answer amplitudes cancel and the right one grow with every step.",
  ],
  entanglement: [
    "Entangled photon pairs have been shared between the ground and a satellite over 1,200 km.",
    "The 2022 Nobel Prize in Physics honored experiments closing loopholes in Bell tests of entanglement.",
  ],
  gates: [
    "Every quantum gate is reversible, so a quantum circuit can always be run backwards.",
    "The Hadamard gate applied twice returns a qubit exactly to where it started.",
  ],
  default: [
    SUMMON_FALLBACKS.funFact,
    "IBM put the first quantum computer on the public cloud in 2016, with just five qubits.",
    "Superconducting qubits run colder than outer space, near 15 thousandths of a degree above absolute zero.",
  ],
};

export function fallbackFunFact(conceptTag: ConceptTag | null, avoid: readonly string[]): string {
  const pool = [...((conceptTag && FALLBACK_FACTS[conceptTag]) ?? []), ...FALLBACK_FACTS.default];
  const fresh = pool.filter((f) => !avoid.includes(f));
  const candidates = fresh.length ? fresh : pool;
  return candidates[Math.floor(Math.random() * candidates.length)];
}
