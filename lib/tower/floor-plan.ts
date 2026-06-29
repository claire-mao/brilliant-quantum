/**
 * Seven-floor Tower plan: one review floor per course unit plus a final Eve boss.
 * Each floor interleaves concepts (60% current unit, 30% prior units, 10% weak/due).
 * Pure data + selection helpers; no browser APIs.
 */

import {
  getUnits,
  isUnitComplete,
  isCourseComplete,
} from "@/content/lessons";
import type { UserProfile } from "@/lib/types";
import {
  conceptsForLesson,
  CONCEPT_ORDER,
  type ConceptTag,
} from "@/lib/learning/concepts";
import { getRecommendedReview, getNeedsReview, getMisconceptionSignals } from "@/lib/learning/learner-model";
import type { ClimateId } from "@/lib/tower/climates";

/** Minimal shape for unlock checks (avoids circular import with progression). */
export interface FloorUnlockProgress {
  clearedByFloor: Record<number, number[]>;
  bossSeed: number;
  highestFloor: number;
}

export const TOTAL_FLOORS = 7;
export const BOSS_FLOOR = 7;
export const REVIEW_FLOORS = 6;
export const CHAMBERS_PER_FLOOR = 3;
export const BOSS_CHAMBERS = 1;

/** Display titles for the Tower Map (one per floor). */
export const FLOOR_TITLES: Record<number, string> = {
  1: "Information",
  2: "Transforming Information",
  3: "Why Quantum Works",
  4: "Multiple Qubits",
  5: "Quantum Algorithms",
  6: "Real Quantum Computers",
  7: "The Observer",
};

/** Short flavor line shown in the arena header. */
export const FLOOR_TAGLINES: Record<number, string> = {
  1: "Unit 1 review: qubits, measurement, and states.",
  2: "Unit 2 review: gates and circuits.",
  3: "Unit 3 review: interference and amplitudes.",
  4: "Unit 4 review: entanglement and correlations.",
  5: "Unit 5 review: quantum algorithms.",
  6: "Unit 6 review: hardware, noise, and error correction.",
  7: "Mixed retrieval from every unit.",
};

const FLOOR_CLIMATE: Record<number, ClimateId> = {
  1: "forest",
  2: "algorithm-citadel",
  3: "crystal-caverns",
  4: "entanglement-library",
  5: "algorithm-citadel",
  6: "quantum-core",
  7: "rune-ruins",
};

export function isBossFloor(floor: number): boolean {
  return floor === BOSS_FLOOR;
}

export function climateIdForFloor(floor: number): ClimateId {
  return FLOOR_CLIMATE[Math.min(TOTAL_FLOORS, Math.max(1, floor))] ?? "forest";
}

export function floorTitle(floor: number): string {
  return FLOOR_TITLES[floor] ?? `Floor ${floor}`;
}

/** Unit index (0-based) for review floors 1–6; boss floor returns null. */
export function unitIndexForFloor(floor: number): number | null {
  if (floor < 1 || floor > REVIEW_FLOORS) return null;
  return floor - 1;
}

/** All concept tags taught in a course unit (deduped, stable order). */
export function conceptsForUnitIndex(unitIndex: number): ConceptTag[] {
  const units = getUnits();
  const unit = units[unitIndex];
  if (!unit) return [];
  const seen = new Set<ConceptTag>();
  const out: ConceptTag[] = [];
  for (const lessonId of unit.lessonIds) {
    for (const tag of conceptsForLesson(lessonId)) {
      if (!seen.has(tag)) {
        seen.add(tag);
        out.push(tag);
      }
    }
  }
  return out.length ? out : ["qubits"];
}

/** Prior-unit concepts for interleaving on the given review floor. */
export function priorConceptsForFloor(floor: number): ConceptTag[] {
  const idx = unitIndexForFloor(floor);
  if (idx === null || idx <= 0) return [];
  const seen = new Set<ConceptTag>();
  const out: ConceptTag[] = [];
  for (let u = 0; u < idx; u++) {
    for (const tag of conceptsForUnitIndex(u)) {
      if (!seen.has(tag)) {
        seen.add(tag);
        out.push(tag);
      }
    }
  }
  return out;
}

/** Deterministic pick from a non-empty pool using a numeric seed. */
function pickFrom(pool: ConceptTag[], seed: number): ConceptTag {
  return pool[((seed % pool.length) + pool.length) % pool.length];
}

/** Seeded roll in [0, 100). */
function roll(seed: number): number {
  return ((seed * 2654435761) >>> 0) % 100;
}

export interface PickConceptOptions {
  /** Grimoire deep link: force this concept for the first question. */
  targetConcept?: ConceptTag;
  /** Rotates through Needs Review concepts across questions. */
  reviewCursor?: number;
}

/** Weak or due concepts for the 10% review slice (deduped, stable order). */
function weakConceptPool(profile: UserProfile | null, cursor: number): ConceptTag[] {
  const seen = new Set<ConceptTag>();
  const out: ConceptTag[] = [];
  for (const tag of [
    ...getNeedsReview(profile).map((r) => r.tag),
    ...getRecommendedReview(profile).map((r) => r.tag),
    ...getMisconceptionSignals().map((m) => m.tag),
  ]) {
    if (!seen.has(tag)) {
      seen.add(tag);
      out.push(tag);
    }
  }
  if (out.length === 0) return [];
  const idx = ((cursor % out.length) + out.length) % out.length;
  return [out[idx], ...out.filter((_, i) => i !== idx)];
}

/** All concept tags from units 1 through floor (review floors) or every unit (boss). */
export function conceptsForFloorPool(floor: number): ConceptTag[] {
  if (isBossFloor(floor)) {
    const seen = new Set<ConceptTag>();
    const out: ConceptTag[] = [];
    for (let u = 0; u < getUnits().length; u++) {
      for (const tag of conceptsForUnitIndex(u)) {
        if (!seen.has(tag)) {
          seen.add(tag);
          out.push(tag);
        }
      }
    }
    return out.length ? out : CONCEPT_ORDER.slice();
  }
  const idx = unitIndexForFloor(floor);
  if (idx === null) return ["qubits"];
  return conceptsForUnitIndex(idx);
}

/**
 * Pick the next concept for a chamber.
 * Floors 2–6: 60% current unit, 30% prior units, 10% weak/due review.
 * Floor 1: current unit only. Floor 7: all units with 10% weak/due.
 */
export function pickConceptForFloor(
  floor: number,
  chamber: number,
  profile: UserProfile | null,
  seed: number,
  opts: PickConceptOptions = {}
): ConceptTag {
  if (opts.targetConcept) return opts.targetConcept;

  const mixSeed = seed + floor * 17 + chamber * 31;
  const reviewCursor = opts.reviewCursor ?? mixSeed;
  const weak = weakConceptPool(profile, reviewCursor);

  if (isBossFloor(floor)) {
    const pool = conceptsForFloorPool(floor);
    const r = roll(mixSeed);
    if (r < 10 && weak.length) return pickFrom(weak, mixSeed + 1);
    return pickFrom(pool, mixSeed + 2);
  }

  const unitIdx = unitIndexForFloor(floor);
  if (unitIdx === null) return "qubits";

  const current = conceptsForUnitIndex(unitIdx);
  if (floor === 1) {
    return pickFrom(current.length ? current : ["qubits"], mixSeed);
  }

  const prior = priorConceptsForFloor(floor);
  const r = roll(mixSeed);
  if (r < 10 && weak.length) return pickFrom(weak, mixSeed + 1);
  if (r < 40 && prior.length) return pickFrom(prior, mixSeed + 5);
  return pickFrom(current.length ? current : ["qubits"], mixSeed + 7);
}

/** Boss floor is one encounter; review floors use CHAMBERS_PER_FLOOR. */
export function slotsOnFloor(floor: number, bossSeed = 0): number {
  void bossSeed;
  return isBossFloor(floor) ? BOSS_CHAMBERS : CHAMBERS_PER_FLOOR;
}

/**
 * Floor unlock rules:
 * - Floors 1–6: matching unit completed
 * - Floor 7: floors 1–6 all cleared OR full course complete
 */
function isReviewFloorCleared(progress: FloorUnlockProgress, floor: number): boolean {
  const needed = slotsOnFloor(floor, progress.bossSeed);
  const cleared = progress.clearedByFloor[floor] ?? [];
  for (let c = 0; c < needed; c++) {
    if (!cleared.includes(c)) return false;
  }
  return needed > 0;
}

export function isFloorUnlocked(
  floor: number,
  progress: FloorUnlockProgress,
  profile: UserProfile | null
): boolean {
  if (floor < 1 || floor > TOTAL_FLOORS) return false;
  const units = getUnits();

  if (floor <= REVIEW_FLOORS) {
    const unit = units[floor - 1];
    if (!unit) return false;
    return isUnitComplete(unit, profile);
  }

  // Floor 7
  if (isCourseComplete(profile)) return true;
  for (let f = 1; f <= REVIEW_FLOORS; f++) {
    if (!isReviewFloorCleared(progress, f)) return false;
  }
  return true;
}

/** User-facing message when a floor is still locked. */
export function floorUnlockMessage(
  floor: number,
  profile: UserProfile | null,
  progress: FloorUnlockProgress
): string {
  void profile;
  void progress;
  if (floor >= 1 && floor <= REVIEW_FLOORS) {
    return `Finish Unit ${floor} to unlock this floor.`;
  }
  if (floor === BOSS_FLOOR) {
    return "Clear floors 1–6 or finish all units to unlock this floor.";
  }
  return "This floor is locked.";
}

/** Highest floor the learner may travel to (unlocked + progress). */
export function highestUnlockedFloor(progress: FloorUnlockProgress, profile: UserProfile | null): number {
  let highest = 1;
  for (let f = 1; f <= TOTAL_FLOORS; f++) {
    if (isFloorUnlocked(f, progress, profile)) highest = f;
    else break;
  }
  return Math.max(highest, Math.min(progress.highestFloor, TOTAL_FLOORS));
}
