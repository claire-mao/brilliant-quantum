/**
 * Monster families for the Wizard Tower. Original fantasy/science creatures —
 * no copyrighted characters, names, or designs. Each concept manifests as a
 * themed creature so a battle is targeted retrieval, not random trivia; bosses
 * are larger creatures that combine a climate's concepts.
 *
 * Pure data (the SVG art + animation lives in components/tower/TowerMonster).
 */

import type { ConceptTag } from "@/lib/learning/concepts";
import { climateIndexForFloor } from "./climates";

export type MonsterType =
  | "concept-wraith"
  | "phase-phantom"
  | "gate-golem"
  | "noise-gremlin"
  | "oracle-mimic"
  | "interference-hydra"
  | "entanglement-twins"
  | "algorithm-titan"
  | "qubit-shade"
  | "observer";

export interface MonsterInfo {
  name: string;
  tagline: string;
}

export const MONSTER_INFO: Record<MonsterType, MonsterInfo> = {
  "concept-wraith": { name: "Concept Wraith", tagline: "Feeds on half-formed ideas." },
  "phase-phantom": { name: "Phase Phantom", tagline: "Hides inside relative phase." },
  "gate-golem": { name: "Gate Golem", tagline: "Forged from stubborn logic gates." },
  "noise-gremlin": { name: "Noise Gremlin", tagline: "Trails decoherence mist." },
  "oracle-mimic": { name: "Oracle Mimic", tagline: "Answers only to sharp reasoning." },
  "interference-hydra": { name: "Interference Hydra", tagline: "Each head is another path." },
  "entanglement-twins": { name: "Entanglement Twins", tagline: "Measure one, the other reacts." },
  "algorithm-titan": { name: "Algorithm Titan", tagline: "Marshals amplitude like an army." },
  "qubit-shade": { name: "Qubit Shade", tagline: "A state that refuses to settle." },
  observer: { name: "The Observer", tagline: "Collapses everything it looks upon." },
};

/** Each fragile concept manifests as a themed monster (retrieval, not trivia). */
const CONCEPT_MONSTER: Record<ConceptTag, MonsterType> = {
  qubits: "concept-wraith",
  superposition: "concept-wraith",
  measurement: "concept-wraith",
  "bloch-sphere": "phase-phantom",
  phase: "phase-phantom",
  gates: "gate-golem",
  interference: "interference-hydra",
  entanglement: "entanglement-twins",
  algorithms: "oracle-mimic",
  hardware: "noise-gremlin",
};

export function monsterForConcept(tag: ConceptTag): MonsterType {
  return CONCEPT_MONSTER[tag] ?? "concept-wraith";
}

export interface BossDef {
  floor: number;
  type: MonsterType;
  name: string;
  tagline: string;
  /** Concepts the boss draws on (combines the previous ten floors). */
  concepts: ConceptTag[];
  /** Climactic relic line shown on victory. */
  relicLine: string;
}

export const BOSSES: BossDef[] = [
  {
    floor: 10,
    type: "qubit-shade",
    name: "Qubit Shade",
    tagline: "A state that refuses to settle.",
    concepts: ["qubits", "superposition", "measurement", "bloch-sphere", "phase"],
    relicLine: "The Shade scatters — your grasp of the qubit is whole.",
  },
  {
    floor: 20,
    type: "gate-golem",
    name: "Gate Golem",
    tagline: "Forged from stubborn logic gates.",
    concepts: ["gates", "superposition", "phase", "measurement"],
    relicLine: "The Golem crumbles into reversible dust — gates obey you now.",
  },
  {
    floor: 30,
    type: "interference-hydra",
    name: "Interference Hydra",
    tagline: "Each head is another path.",
    concepts: ["interference", "phase", "superposition", "gates"],
    relicLine: "Every head cancels at once — destructive interference, mastered.",
  },
  {
    floor: 40,
    type: "entanglement-twins",
    name: "Entanglement Twins",
    tagline: "Measure one, the other reacts.",
    concepts: ["entanglement", "measurement", "gates", "interference"],
    relicLine: "The Twins fall together — correlation without a hidden message.",
  },
  {
    floor: 50,
    type: "algorithm-titan",
    name: "Algorithm Titan",
    tagline: "Marshals amplitude like an army.",
    concepts: ["algorithms", "interference", "entanglement", "phase"],
    relicLine: "The Titan kneels — you turned interference into computation.",
  },
  {
    floor: 60,
    type: "observer",
    name: "The Observer",
    tagline: "Collapses everything it looks upon.",
    concepts: ["hardware", "algorithms", "entanglement", "interference", "measurement"],
    relicLine: "The Observer blinks — and the tower breaks open to the sky.",
  },
];

export function isBossFloor(floor: number): boolean {
  return floor % 10 === 0 && floor >= 10 && floor <= 60;
}

export function bossForFloor(floor: number): BossDef | null {
  return BOSSES.find((b) => b.floor === floor) ?? null;
}

/** HP (correct answers needed) for a normal room monster on a given floor. */
export function monsterHp(floor: number): number {
  if (floor <= 10) return 2;
  if (floor <= 30) return 3;
  return 4;
}

/** Boss HP scales 5 → 7 across the climbs (multi-round, multi-concept). */
export function bossHp(floor: number): number {
  return Math.min(7, 5 + Math.floor(climateIndexForFloor(floor) / 2));
}
