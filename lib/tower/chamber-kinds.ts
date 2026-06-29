/**
 * Maps Tower chamber types to preferred challenge kinds so each room favors
 * different interactions while boss floors mix everything.
 */

import type { ChallengeKind } from "@/lib/tower/challenges";
import type { ChamberType } from "@/lib/tower/progression";

const MEMORY_KINDS: ChallengeKind[] = ["mcq", "prediction", "match"];
const CIRCUIT_KINDS: ChallengeKind[] = ["order", "slots", "fill"];
const MISCON_KINDS: ChallengeKind[] = ["mistake"];
const REFLECT_KINDS: ChallengeKind[] = ["explain", "prediction", "interference"];
const BOSS_KINDS: ChallengeKind[] = [
  "mcq",
  "prediction",
  "slots",
  "order",
  "fill",
  "mistake",
  "explain",
  "bloch",
  "match",
  "estimate",
  "interference",
];

function poolFor(type: ChamberType): ChallengeKind[] {
  switch (type) {
    case "memory":
      return MEMORY_KINDS;
    case "circuit":
      return CIRCUIT_KINDS;
    case "misconception":
      return MISCON_KINDS;
    case "reflection":
      return REFLECT_KINDS;
    case "boss-gate":
      return BOSS_KINDS;
    default:
      return MEMORY_KINDS;
  }
}

/** Pick a challenge kind for this chamber and strike index (rotates through the pool). */
export function kindForChamber(type: ChamberType, strike: number): ChallengeKind {
  const pool = poolFor(type);
  return pool[((strike % pool.length) + pool.length) % pool.length];
}
