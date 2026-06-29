import type { ConceptTag } from "@/lib/learning/concepts";

/**
 * Dungeon climates for the Tower. Each climate is a distinct visual biome the
 * battle scene is themed with. Concepts map onto climates so the realm a learner
 * fights in reflects what they are practicing. This is pure visual data: it never
 * touches battle, progression, or learning-model logic.
 */
export type ClimateId =
  | "forest"
  | "rune-ruins"
  | "crystal-caverns"
  | "entanglement-library"
  | "algorithm-citadel"
  | "quantum-core";

export interface Climate {
  id: ClimateId;
  /** Display name shown as the chamber's realm. */
  name: string;
  /** One-line flavor for the room banner. */
  blurb: string;
  /** Wall gradient (top -> bottom). */
  wallTop: string;
  wallBottom: string;
  /** Pixel stone block tints. */
  stone: string;
  stoneDark: string;
  /** Floor tile tints. */
  floor: string;
  floorDark: string;
  /** Rune / magical glow accent. */
  accent: string;
  /** Torch / candle flame core. */
  torch: string;
  /** Mist layer color (rgba string). */
  mist: string;
  /** Floating dust / particle color. */
  particle: string;
}

export const CLIMATES: Record<ClimateId, Climate> = {
  forest: {
    id: "forest",
    name: "Qubit Grounds",
    blurb: "Basics of qubits and superposition.",
    wallTop: "#15281c",
    wallBottom: "#0a130d",
    stone: "#2f5138",
    stoneDark: "#1b3122",
    floor: "#22392a",
    floorDark: "#122014",
    accent: "#6ee7b7",
    torch: "#a3e635",
    mist: "rgba(134,239,172,0.12)",
    particle: "#bbf7d0",
  },
  "rune-ruins": {
    id: "rune-ruins",
    name: "Measurement Ruins",
    blurb: "Measurement and state readout.",
    wallTop: "#241a2e",
    wallBottom: "#0f0a16",
    stone: "#4a3a5e",
    stoneDark: "#2b2138",
    floor: "#2a2233",
    floorDark: "#160f1f",
    accent: "#c4b5fd",
    torch: "#fbbf24",
    mist: "rgba(196,181,253,0.12)",
    particle: "#fcd34d",
  },
  "crystal-caverns": {
    id: "crystal-caverns",
    name: "Phase Caverns",
    blurb: "Phase and interference effects.",
    wallTop: "#0e2236",
    wallBottom: "#06101d",
    stone: "#1e3a5f",
    stoneDark: "#11253d",
    floor: "#123047",
    floorDark: "#0a1b2c",
    accent: "#67e8f9",
    torch: "#7dd3fc",
    mist: "rgba(103,232,249,0.14)",
    particle: "#a5f3fc",
  },
  "entanglement-library": {
    id: "entanglement-library",
    name: "Entanglement Stacks",
    blurb: "Entangled states and correlations.",
    wallTop: "#241d12",
    wallBottom: "#120c06",
    stone: "#4a3b28",
    stoneDark: "#2b2216",
    floor: "#2a2114",
    floorDark: "#160f09",
    accent: "#5eead4",
    torch: "#fcd34d",
    mist: "rgba(94,234,212,0.12)",
    particle: "#99f6e4",
  },
  "algorithm-citadel": {
    id: "algorithm-citadel",
    name: "Algorithm Hall",
    blurb: "Gates, circuits, and algorithms.",
    wallTop: "#1a1d2e",
    wallBottom: "#0a0c16",
    stone: "#2e3350",
    stoneDark: "#1a1e30",
    floor: "#232743",
    floorDark: "#111429",
    accent: "#818cf8",
    torch: "#fbbf24",
    mist: "rgba(129,140,248,0.12)",
    particle: "#fcd34d",
  },
  "quantum-core": {
    id: "quantum-core",
    name: "Hardware Core",
    blurb: "Real devices, noise, and error correction.",
    wallTop: "#0c1430",
    wallBottom: "#05070f",
    stone: "#1c2750",
    stoneDark: "#101733",
    floor: "#141d3e",
    floorDark: "#090f22",
    accent: "#93c5fd",
    torch: "#bfdbfe",
    mist: "rgba(147,197,253,0.16)",
    particle: "#dbeafe",
  },
};

/** Which climate each concept is fought in. */
const CONCEPT_CLIMATE: Record<ConceptTag, ClimateId> = {
  qubits: "forest",
  superposition: "forest",
  measurement: "rune-ruins",
  "bloch-sphere": "rune-ruins",
  phase: "crystal-caverns",
  interference: "crystal-caverns",
  entanglement: "entanglement-library",
  gates: "algorithm-citadel",
  algorithms: "algorithm-citadel",
  hardware: "quantum-core",
};

export function climateForConcept(tag: ConceptTag): Climate {
  return CLIMATES[CONCEPT_CLIMATE[tag] ?? "forest"];
}

/** Climate for a Tower floor (1–7), independent of the active concept. */
export function climateForFloor(floor: number): Climate {
  const ids: ClimateId[] = [
    "forest",
    "algorithm-citadel",
    "crystal-caverns",
    "entanglement-library",
    "algorithm-citadel",
    "quantum-core",
    "rune-ruins",
  ];
  const idx = Math.min(6, Math.max(0, floor - 1));
  return CLIMATES[ids[idx] ?? "forest"];
}

/** Spell projectile color per concept (the magic Alice casts at the enemy). */
const CONCEPT_PROJECTILE: Record<ConceptTag, string> = {
  qubits: "#a78bfa",
  superposition: "#a78bfa",
  measurement: "#c4b5fd",
  "bloch-sphere": "#a78bfa",
  phase: "#22d3ee",
  interference: "#22d3ee",
  entanglement: "#2dd4bf",
  gates: "#fbbf24",
  algorithms: "#60a5fa",
  hardware: "#fb923c",
};

export function projectileColorForConcept(tag: ConceptTag): string {
  return CONCEPT_PROJECTILE[tag] ?? "#a78bfa";
}
