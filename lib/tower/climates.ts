/**
 * Dungeon climates for the Wizard Tower. Six climates of ten floors each, one
 * per course unit, so a floor's challenges always match what the learner has
 * been taught (and reviewed). Pure data — safe to import on server or client.
 *
 * Concept pools are cumulative: a climate draws on its unit's new concepts
 * ("home") plus everything taught earlier, which is what lets the tower
 * interleave older material for spaced review without ever asking about a
 * concept the learner has not met yet.
 */

import type { ConceptTag } from "@/lib/learning/concepts";

export interface ClimatePalette {
  /** Background gradient stops (top → bottom). */
  bgFrom: string;
  bgVia: string;
  bgTo: string;
  /** Pixel wall + floor blocks. */
  wall: string;
  wallDark: string;
  floor: string;
  floorDark: string;
  /** Accent used for runes, torches, and small animated details. */
  accent: string;
  accentSoft: string;
  /** Ambient glow / mist color. */
  glow: string;
  /** Text tone that reads on the background. */
  ink: string;
  inkSoft: string;
}

export type ClimateDetail = "leaves" | "embers" | "crystals" | "books" | "circuits" | "qparticles";

export interface Climate {
  id: string;
  /** Band index 0–5. */
  index: number;
  /** Climate name shown as the floor's region. */
  name: string;
  /** Short flavor subtitle. */
  subtitle: string;
  /** First and last floor (inclusive) of this climate. */
  floors: [number, number];
  /** Course unit whose completion unlocks this band (chapter id). */
  unitId: string;
  /** New concepts introduced by this unit (the band's "home" concepts). */
  homeConcepts: ConceptTag[];
  /** All concepts available for challenges here (cumulative for review). */
  poolConcepts: ConceptTag[];
  palette: ClimatePalette;
  detail: ClimateDetail;
}

const U1: ConceptTag[] = ["qubits", "superposition", "measurement", "bloch-sphere", "phase"];
const U2: ConceptTag[] = ["gates"];
const U3: ConceptTag[] = ["interference"];
const U4: ConceptTag[] = ["entanglement"];
const U5: ConceptTag[] = ["algorithms"];
const U6: ConceptTag[] = ["hardware"];

export const CLIMATES: Climate[] = [
  {
    id: "apprentice-forest",
    index: 0,
    name: "Apprentice Forest",
    subtitle: "Where every spark of a qubit first wakes.",
    floors: [1, 10],
    unitId: "chapter-information",
    homeConcepts: U1,
    poolConcepts: [...U1],
    detail: "leaves",
    palette: {
      bgFrom: "#0b2a1f",
      bgVia: "#0f3d2a",
      bgTo: "#08231a",
      wall: "#1f6b4a",
      wallDark: "#124030",
      floor: "#1a5238",
      floorDark: "#0c2f20",
      accent: "#6ee7b7",
      accentSoft: "#a7f3d0",
      glow: "rgba(110,231,183,0.35)",
      ink: "#ecfdf5",
      inkSoft: "#a7f3d0",
    },
  },
  {
    id: "rune-ruins",
    index: 1,
    name: "Rune Ruins",
    subtitle: "Broken halls where gates were first carved.",
    floors: [11, 20],
    unitId: "chapter-transforming",
    homeConcepts: U2,
    poolConcepts: [...U1, ...U2],
    detail: "circuits",
    palette: {
      bgFrom: "#241405",
      bgVia: "#3a2410",
      bgTo: "#1a0f04",
      wall: "#8a5a2b",
      wallDark: "#553415",
      floor: "#6b4420",
      floorDark: "#3a2410",
      accent: "#fbbf24",
      accentSoft: "#fde68a",
      glow: "rgba(251,191,36,0.32)",
      ink: "#fffbeb",
      inkSoft: "#fde68a",
    },
  },
  {
    id: "crystal-caverns",
    index: 2,
    name: "Crystal Caverns",
    subtitle: "Amplitudes ring and cancel in the dark.",
    floors: [21, 30],
    unitId: "chapter-why-quantum",
    homeConcepts: U3,
    poolConcepts: [...U1, ...U2, ...U3],
    detail: "crystals",
    palette: {
      bgFrom: "#0b1f3a",
      bgVia: "#0e2c52",
      bgTo: "#081428",
      wall: "#2563a8",
      wallDark: "#143a66",
      floor: "#1c4f86",
      floorDark: "#0e2c52",
      accent: "#38bdf8",
      accentSoft: "#7dd3fc",
      glow: "rgba(56,189,248,0.34)",
      ink: "#eff6ff",
      inkSoft: "#bae6fd",
    },
  },
  {
    id: "entanglement-library",
    index: 3,
    name: "Entanglement Library",
    subtitle: "Shelves of paired, correlated tomes.",
    floors: [31, 40],
    unitId: "chapter-multiple-qubits",
    homeConcepts: U4,
    poolConcepts: [...U1, ...U2, ...U3, ...U4],
    detail: "books",
    palette: {
      bgFrom: "#23103f",
      bgVia: "#341a57",
      bgTo: "#180a2e",
      wall: "#6d3fb0",
      wallDark: "#3f2370",
      floor: "#542f8c",
      floorDark: "#311a57",
      accent: "#c084fc",
      accentSoft: "#e9d5ff",
      glow: "rgba(192,132,252,0.34)",
      ink: "#faf5ff",
      inkSoft: "#e9d5ff",
    },
  },
  {
    id: "algorithm-citadel",
    index: 4,
    name: "Algorithm Citadel",
    subtitle: "Interference marshalled into a march.",
    floors: [41, 50],
    unitId: "chapter-algorithms",
    homeConcepts: U5,
    poolConcepts: [...U1, ...U2, ...U3, ...U4, ...U5],
    detail: "qparticles",
    palette: {
      bgFrom: "#062b2a",
      bgVia: "#0a3d3a",
      bgTo: "#04201f",
      wall: "#14857c",
      wallDark: "#0a4f49",
      floor: "#0f6b63",
      floorDark: "#073d39",
      accent: "#2dd4bf",
      accentSoft: "#99f6e4",
      glow: "rgba(45,212,191,0.34)",
      ink: "#f0fdfa",
      inkSoft: "#99f6e4",
    },
  },
  {
    id: "quantum-core",
    index: 5,
    name: "Quantum Core",
    subtitle: "Fragile hardware humming at the world's edge.",
    floors: [51, 60],
    unitId: "chapter-hardware",
    homeConcepts: U6,
    poolConcepts: [...U1, ...U2, ...U3, ...U4, ...U5, ...U6],
    detail: "qparticles",
    palette: {
      bgFrom: "#1a0626",
      bgVia: "#2b0b3f",
      bgTo: "#0b0414",
      wall: "#9333ea",
      wallDark: "#5b1d92",
      floor: "#7322bf",
      floorDark: "#43146e",
      accent: "#f0abfc",
      accentSoft: "#f5d0fe",
      glow: "rgba(240,171,252,0.4)",
      ink: "#fdf4ff",
      inkSoft: "#f5d0fe",
    },
  },
];

/** Climate (band) index for a floor number (1–60). */
export function climateIndexForFloor(floor: number): number {
  return Math.min(CLIMATES.length - 1, Math.max(0, Math.floor((floor - 1) / 10)));
}

export function climateForFloor(floor: number): Climate {
  return CLIMATES[climateIndexForFloor(floor)];
}

/** Background gradient CSS for a climate (used inline; palettes are dynamic). */
export function climateBackground(palette: ClimatePalette): string {
  return `radial-gradient(120% 80% at 50% -10%, ${palette.glow}, transparent 60%), linear-gradient(180deg, ${palette.bgFrom} 0%, ${palette.bgVia} 55%, ${palette.bgTo} 100%)`;
}

/** Pixel backdrop tokens for TowerArena / DungeonScene (mapped from palette). */
export interface ClimateSceneTokens {
  wallTop: string;
  wallBottom: string;
  stone: string;
  stoneDark: string;
  floor: string;
  floorDark: string;
  accent: string;
  torch: string;
  mist: string;
  particle: string;
}

export function climateSceneTokens(climate: Climate): ClimateSceneTokens {
  const p = climate.palette;
  return {
    wallTop: p.bgFrom,
    wallBottom: p.bgTo,
    stone: p.wall,
    stoneDark: p.wallDark,
    floor: p.floor,
    floorDark: p.floorDark,
    accent: p.accent,
    torch: p.accentSoft,
    mist: p.glow,
    particle: p.accentSoft,
  };
}

/** Spell projectile color per concept (TowerArena battle FX). */
const CONCEPT_PROJECTILE: Partial<Record<ConceptTag, string>> = {
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
