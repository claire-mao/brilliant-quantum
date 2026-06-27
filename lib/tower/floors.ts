/**
 * Static structure of the Wizard Tower: 60 floors, each with a small set of
 * rooms, grouped into six climates. This module owns the *shape* of a floor
 * (which rooms, which challenge type, boss or not) and the unit-based unlock
 * rules. The concrete, personalized challenge content for each room is resolved
 * separately in `challenges.ts` using the learner model.
 *
 * Pure data — safe on server or client.
 */

import type { UserProfile } from "@/lib/types";
import { getUnits, isUnitComplete } from "@/content/lessons";
import { CLIMATES, climateIndexForFloor, type Climate } from "./climates";
import { bossForFloor, isBossFloor, type BossDef } from "./monsters";

export const TOTAL_FLOORS = 60;
export const FLOORS_PER_CLIMATE = 10;

export type RoomType =
  | "memory-chamber"
  | "circuit-forge"
  | "misconception-trap"
  | "reflection-shrine"
  | "boss-gate"
  | "staircase";

export const ROOM_LABEL: Record<RoomType, string> = {
  "memory-chamber": "Memory Chamber",
  "circuit-forge": "Circuit Forge",
  "misconception-trap": "Misconception Trap",
  "reflection-shrine": "Reflection Shrine",
  "boss-gate": "Boss Gate",
  staircase: "Staircase",
};

/** The thirteen learning-science challenge types a room can pose. */
export type ChallengeKind =
  | "recall"
  | "predict"
  | "misconception"
  | "find-mistake"
  | "compare-circuits"
  | "order-gates"
  | "build-circuit"
  | "bloch-prediction"
  | "histogram-prediction"
  | "entanglement-correlation"
  | "algorithm-walkthrough"
  | "decoherence-scenario"
  | "teach-wizard";

export const KIND_LABEL: Record<ChallengeKind, string> = {
  recall: "Recall",
  predict: "Predict the outcome",
  misconception: "Identify the misconception",
  "find-mistake": "Find the mistake",
  "compare-circuits": "Compare two circuits",
  "order-gates": "Order the gates",
  "build-circuit": "Build the circuit",
  "bloch-prediction": "Bloch sphere prediction",
  "histogram-prediction": "Histogram prediction",
  "entanglement-correlation": "Entanglement correlation",
  "algorithm-walkthrough": "Algorithm walkthrough",
  "decoherence-scenario": "Decoherence scenario",
  "teach-wizard": "Teach the wizard",
};

/** Which kinds each climate uses, split by the room's role. */
interface KindPools {
  retrieval: ChallengeKind[];
  interaction: ChallengeKind[];
  misconception: ChallengeKind[];
}

const CLIMATE_KINDS: KindPools[] = [
  // Apprentice Forest (Unit 1)
  {
    retrieval: ["recall", "predict", "bloch-prediction", "histogram-prediction"],
    interaction: ["predict", "bloch-prediction", "histogram-prediction"],
    misconception: ["misconception", "find-mistake", "teach-wizard"],
  },
  // Rune Ruins (gates)
  {
    retrieval: ["recall", "predict"],
    interaction: ["order-gates", "build-circuit", "compare-circuits", "predict"],
    misconception: ["misconception", "find-mistake"],
  },
  // Crystal Caverns (interference)
  {
    retrieval: ["recall", "predict", "histogram-prediction"],
    interaction: ["compare-circuits", "histogram-prediction", "predict"],
    misconception: ["misconception", "find-mistake"],
  },
  // Entanglement Library (entanglement)
  {
    retrieval: ["recall", "predict"],
    interaction: ["entanglement-correlation", "compare-circuits", "predict"],
    misconception: ["misconception", "find-mistake"],
  },
  // Algorithm Citadel (algorithms)
  {
    retrieval: ["recall", "predict"],
    interaction: ["algorithm-walkthrough", "compare-circuits", "predict"],
    misconception: ["misconception", "find-mistake"],
  },
  // Quantum Core (hardware + synthesis)
  {
    retrieval: ["recall", "predict"],
    interaction: ["decoherence-scenario", "algorithm-walkthrough", "predict"],
    misconception: ["misconception", "find-mistake", "teach-wizard"],
  },
];

export type RoomRole = "retrieval" | "interaction" | "misconception" | "warmup" | "boss" | "stair";

export interface RoomSlot {
  id: string;
  roomType: RoomType;
  role: RoomRole;
  /** Battle rooms carry a challenge kind; the staircase does not. */
  kind?: ChallengeKind;
}

export interface FloorLayout {
  floor: number;
  climate: Climate;
  climateIndex: number;
  isBoss: boolean;
  boss: BossDef | null;
  /** True on the final floor (the tower break). */
  isFinal: boolean;
  /** Battle rooms that must be cleared before the staircase rises. */
  battleRooms: RoomSlot[];
  /** The staircase / tower-break slot. */
  staircase: RoomSlot;
}

function pick<T>(arr: T[], seed: number): T {
  return arr[((seed % arr.length) + arr.length) % arr.length];
}

/** A second, distinct pick from the same pool (so two rooms differ when possible). */
function pickDistinct<T>(arr: T[], seed: number, avoid: T): T {
  if (arr.length <= 1) return arr[0];
  let v = pick(arr, seed);
  if (v === avoid) v = pick(arr, seed + 1);
  return v;
}

/**
 * Resolve the static room layout for a floor. Normal floors have three battle
 * rooms (retrieval → interaction → misconception) plus a staircase. Boss floors
 * have two warm-up rooms, the boss gate, then the staircase (the final floor's
 * staircase is the tower break).
 */
export function getFloorLayout(floor: number): FloorLayout {
  const climateIndex = climateIndexForFloor(floor);
  const climate = CLIMATES[climateIndex];
  const boss = bossForFloor(floor);
  const isBoss = isBossFloor(floor);
  const isFinal = floor === TOTAL_FLOORS;
  const kinds = CLIMATE_KINDS[climateIndex];

  const battleRooms: RoomSlot[] = [];

  if (isBoss && boss) {
    battleRooms.push({
      id: `f${floor}-warmup-1`,
      roomType: "memory-chamber",
      role: "warmup",
      kind: pick(kinds.retrieval, floor),
    });
    battleRooms.push({
      id: `f${floor}-warmup-2`,
      roomType: "misconception-trap",
      role: "warmup",
      kind: pick(kinds.misconception, floor + 1),
    });
    battleRooms.push({
      id: `f${floor}-boss`,
      roomType: "boss-gate",
      role: "boss",
      kind: "predict",
    });
  } else {
    const retrieval = pick(kinds.retrieval, floor);
    const interaction = pickDistinct(kinds.interaction, floor + 1, retrieval);
    const misconception = pick(kinds.misconception, floor + 2);
    battleRooms.push({ id: `f${floor}-r1`, roomType: "memory-chamber", role: "retrieval", kind: retrieval });
    battleRooms.push({ id: `f${floor}-r2`, roomType: "circuit-forge", role: "interaction", kind: interaction });
    battleRooms.push({
      id: `f${floor}-r3`,
      roomType: floor % 2 === 0 ? "reflection-shrine" : "misconception-trap",
      role: "misconception",
      kind: misconception,
    });
  }

  const staircase: RoomSlot = {
    id: `f${floor}-stair`,
    roomType: "staircase",
    role: "stair",
  };

  return { floor, climate, climateIndex, isBoss, boss, isFinal, battleRooms, staircase };
}

/* ----------------------------- Unlock rules ------------------------------ */

/**
 * Highest floor the learner's *unit completion* permits. Floors 1–10 are always
 * available (Unit 1 is available from the start); each further band of ten
 * unlocks when its matching unit is completed:
 *   11–20 ← Unit 2, 21–30 ← Unit 3, …, 51–60 ← Unit 6.
 */
export function unitUnlockedFloorCap(profile: UserProfile | null): number {
  const units = getUnits();
  let cap = FLOORS_PER_CLIMATE; // band 0 (floors 1–10) is the entrance
  for (let i = 1; i < CLIMATES.length; i += 1) {
    const unit = units[i];
    if (unit && isUnitComplete(unit, profile)) cap = (i + 1) * FLOORS_PER_CLIMATE;
    else break;
  }
  return cap;
}

/** Whether the learner has begun Unit 1 (used only for a gentle nudge, never to block). */
export function hasStartedUnitOne(profile: UserProfile | null): boolean {
  const unit = getUnits()[0];
  if (!unit) return false;
  return unit.lessonIds.some((id) => {
    const p = profile?.progress?.[id];
    return !!p?.completed || (p?.currentStep ?? 0) > 0;
  });
}

/** The course unit (chapter) whose completion unlocks the band above `floor`. */
export function nextUnitToUnlock(floor: number): { index: number; title: string } | null {
  const climateIndex = climateIndexForFloor(floor);
  const nextIndex = climateIndex + 1;
  if (nextIndex >= CLIMATES.length) return null;
  const unit = getUnits()[nextIndex];
  if (!unit) return null;
  return { index: nextIndex, title: unit.title };
}
