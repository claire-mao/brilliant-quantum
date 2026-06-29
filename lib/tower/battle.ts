/**
 * Tower battle scaling: questions per floor, enemy HP, wizard energy, and damage.
 * Pure functions — safe on server and client.
 */

import { isBossFloor } from "@/lib/tower/floor-plan";

export const WIZARD_MAX_ENERGY = 100;
export const WRONG_ENERGY_COST = 14;
export const EXPLANATION_ENERGY_COST = 10;
export const CORRECT_ENERGY_GAIN = 6;
export const MIN_ENERGY_AFTER_WRONG = 0;

/** Question count ranges by floor (inclusive min/max). Boss floor 7 uses 10–15. */
const QUESTION_RANGE: Record<number, [number, number]> = {
  1: [2, 3],
  2: [3, 4],
  3: [4, 5],
  4: [5, 6],
  5: [6, 7],
  6: [7, 8],
  7: [10, 15],
};

function seededRoll(seed: number, max: number): number {
  return ((seed * 2654435761) >>> 0) % max;
}

/** Deterministic question count for a room encounter. */
export function questionsInBattle(floor: number, chamber: number, bossSeed = 0): number {
  const f = Math.min(7, Math.max(1, floor));
  const [min, max] = QUESTION_RANGE[f] ?? [3, 4];
  const span = max - min + 1;
  const seed = f * 997 + chamber * 131 + bossSeed * 17;
  return min + seededRoll(seed, span);
}

/** Enemy max HP scales with floor and battle length. */
export function enemyMaxHp(floor: number, questionCount: number): number {
  const base = isBossFloor(floor) ? 48 : 28;
  const perFloor = floor * 12;
  const perQuestion = questionCount * 8;
  return base + perFloor + perQuestion;
}

/** Damage dealt to the enemy on a correct answer (evenly spread across the battle). */
export function damagePerCorrect(maxHp: number, questionCount: number): number {
  if (questionCount <= 0) return maxHp;
  return Math.max(8, Math.ceil(maxHp / questionCount));
}

/** Energy lost when the learner answers wrong. Boss hits harder on higher floors. */
export function energyLostOnWrong(floor: number): number {
  return WRONG_ENERGY_COST + Math.floor(floor / 3);
}
