/**
 * Tower progression: seven floors (six unit reviews + Eve boss), three chambers
 * per review floor, single boss encounter on floor 7. Persists cursor + cleared rooms
 * in localStorage so /tower resumes where the learner left off.
 *
 * Migration: reads legacy `bq.tower.v1` once, maps into v2, then saves under
 * `bq-tower-progress-v2`. Corrupt or unknown shapes fall back to floor 1 safely.
 */

import {
  TOTAL_FLOORS,
  BOSS_FLOOR,
  isBossFloor,
  slotsOnFloor,
} from "@/lib/tower/floor-plan";

export {
  TOTAL_FLOORS,
  BOSS_FLOOR,
  CHAMBERS_PER_FLOOR,
  isBossFloor,
  slotsOnFloor,
} from "@/lib/tower/floor-plan";

/** Current persisted progress (v2). */
export const TOWER_STORAGE_KEY = "bq-tower-progress-v2";

/** Legacy key; read once for migration, never written again. */
const LEGACY_STORAGE_KEY = "bq.tower.v1";

export type ChamberType = "memory" | "circuit" | "misconception" | "reflection" | "boss-gate";

export const CHAMBER_META: Record<ChamberType, { name: string; tagline: string }> = {
  memory: { name: "Recall", tagline: "Answer a multiple-choice question." },
  circuit: { name: "Circuit", tagline: "Order steps or place gates." },
  misconception: { name: "Misconception", tagline: "Find the false statement." },
  reflection: { name: "Explain", tagline: "Pick the best explanation." },
  "boss-gate": { name: "Boss", tagline: "Mixed questions against Eve." },
};

const BASE_TYPES: ChamberType[] = ["memory", "circuit", "misconception", "reflection"];

export interface ChamberInfo {
  floor: number;
  chamber: number;
  chamberNumber: number;
  globalIndex: number;
  type: ChamberType;
  isBoss: boolean;
  isBossFloor: boolean;
  /** Total slots on this floor (chambers or the single boss encounter). */
  slotsOnFloor: number;
}

/** Linear index from (floor, chamber), accounting for boss slot count. */
export function globalIndexFor(floor: number, chamber: number, bossSeed = 0): number {
  let idx = 0;
  for (let f = 1; f < floor; f++) {
    idx += slotsOnFloor(f, f === BOSS_FLOOR ? bossSeed : 0);
  }
  return idx + chamber;
}

export function floorChamberFromGlobalIndex(globalIndex: number, bossSeed = 0): { floor: number; chamber: number } {
  let remaining = Math.max(0, Math.floor(globalIndex));
  for (let f = 1; f <= TOTAL_FLOORS; f++) {
    const count = slotsOnFloor(f, f === BOSS_FLOOR ? bossSeed : 0);
    if (remaining < count) return { floor: f, chamber: remaining };
    remaining -= count;
  }
  const last = slotsOnFloor(BOSS_FLOOR, bossSeed);
  return { floor: BOSS_FLOOR, chamber: Math.max(0, last - 1) };
}

export function chamberTypeFor(floor: number, chamber: number): ChamberType {
  if (isBossFloor(floor)) return "boss-gate";
  const rot = (floor - 1 + chamber) % BASE_TYPES.length;
  return BASE_TYPES[rot];
}

export function chamberInfoForPosition(floor: number, chamber: number, bossSeed = 0): ChamberInfo {
  const type = chamberTypeFor(floor, chamber);
  const slots = slotsOnFloor(floor, bossSeed);
  return {
    floor,
    chamber,
    chamberNumber: chamber + 1,
    globalIndex: globalIndexFor(floor, chamber, bossSeed),
    type,
    isBoss: isBossFloor(floor),
    isBossFloor: isBossFloor(floor),
    slotsOnFloor: slots,
  };
}

/** @deprecated Use chamberInfoForPosition; kept for incremental refactors. */
export function chamberInfoForIndex(globalIndex: number, bossSeed = 0): ChamberInfo {
  const { floor, chamber } = floorChamberFromGlobalIndex(globalIndex, bossSeed);
  return chamberInfoForPosition(floor, chamber, bossSeed);
}

export interface TowerProgress {
  version: 2;
  floor: number;
  chamber: number;
  highestFloor: number;
  clearedByFloor: Record<number, number[]>;
  chamberByFloor: Record<number, number>;
  /** Stable seed for boss-floor question variety. */
  bossSeed: number;
  /** Floor 7 fully cleared (Eve defeated). */
  bossDefeated?: boolean;
}

export function defaultProgress(): TowerProgress {
  return {
    version: 2,
    floor: 1,
    chamber: 0,
    highestFloor: 1,
    clearedByFloor: {},
    chamberByFloor: {},
    bossSeed: 1,
    bossDefeated: false,
  };
}

function clampFloor(f: number): number {
  return Math.min(TOTAL_FLOORS, Math.max(1, Math.floor(f)));
}

function isV2Progress(value: unknown): value is TowerProgress {
  if (!value || typeof value !== "object") return false;
  const p = value as Record<string, unknown>;
  return p.version === 2 && typeof p.floor === "number";
}

function isLegacyProgress(value: unknown): value is {
  floor: number;
  chamber: number;
  highestFloor: number;
  clearedByFloor?: Record<number, number[]>;
  chamberByFloor?: Record<number, number>;
} {
  if (!value || typeof value !== "object") return false;
  const p = value as Record<string, unknown>;
  return typeof p.floor === "number" && typeof p.chamber === "number";
}

/** Map legacy v1 save into v2 (clamp to seven floors; drop invalid chambers). */
function migrateLegacy(raw: unknown): TowerProgress | null {
  if (!isLegacyProgress(raw)) return null;
  const floor = clampFloor(raw.floor);
  const maxChamber = slotsOnFloor(floor) - 1;
  const chamber = Math.min(maxChamber, Math.max(0, Math.floor(raw.chamber)));
  const clearedByFloor: Record<number, number[]> = {};
  if (raw.clearedByFloor) {
    for (const [k, v] of Object.entries(raw.clearedByFloor)) {
      const f = clampFloor(Number(k));
      if (!Array.isArray(v)) continue;
      const max = slotsOnFloor(f) - 1;
      clearedByFloor[f] = v.filter((c) => typeof c === "number" && c >= 0 && c <= max);
    }
  }
  return {
    version: 2,
    floor,
    chamber,
    highestFloor: clampFloor(Math.max(floor, raw.highestFloor ?? floor)),
    clearedByFloor,
    chamberByFloor: raw.chamberByFloor ?? {},
    bossSeed: 1,
    bossDefeated: false,
  };
}

function normalizeProgress(parsed: TowerProgress): TowerProgress {
  const floor = clampFloor(parsed.floor);
  const maxChamber = slotsOnFloor(floor, parsed.bossSeed) - 1;
  const chamber = Math.min(maxChamber, Math.max(0, Math.floor(parsed.chamber)));
  return {
    version: 2,
    floor,
    chamber,
    highestFloor: clampFloor(Math.max(floor, parsed.highestFloor)),
    clearedByFloor: parsed.clearedByFloor ?? {},
    chamberByFloor: parsed.chamberByFloor ?? {},
    bossSeed: Math.max(1, Math.floor(parsed.bossSeed || 1)),
    bossDefeated: !!parsed.bossDefeated,
  };
}

export function loadProgress(): TowerProgress | null {
  if (typeof window === "undefined") return null;
  try {
    const rawV2 = window.localStorage.getItem(TOWER_STORAGE_KEY);
    if (rawV2) {
      const parsed: unknown = JSON.parse(rawV2);
      if (isV2Progress(parsed)) return normalizeProgress(parsed);
    }

    const rawLegacy = window.localStorage.getItem(LEGACY_STORAGE_KEY);
    if (rawLegacy) {
      const migrated = migrateLegacy(JSON.parse(rawLegacy) as unknown);
      if (migrated) {
        saveProgress(migrated);
        return migrated;
      }
    }
    return null;
  } catch {
    return null;
  }
}

export function saveProgress(progress: TowerProgress): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(TOWER_STORAGE_KEY, JSON.stringify(normalizeProgress(progress)));
  } catch {
    // ignore quota errors
  }
}

export function resetProgress(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(TOWER_STORAGE_KEY);
    window.localStorage.removeItem(LEGACY_STORAGE_KEY);
  } catch {
    // ignore
  }
}

export function isChamberCleared(progress: TowerProgress, floor: number, chamber: number): boolean {
  return (progress.clearedByFloor[floor] ?? []).includes(chamber);
}

export function isFloorCleared(progress: TowerProgress, floor: number): boolean {
  const needed = slotsOnFloor(floor, progress.bossSeed);
  const cleared = progress.clearedByFloor[floor] ?? [];
  for (let c = 0; c < needed; c++) {
    if (!cleared.includes(c)) return false;
  }
  return needed > 0;
}

export function markChamberCleared(
  progress: TowerProgress,
  floor: number,
  chamber: number
): TowerProgress {
  const existing = progress.clearedByFloor[floor] ?? [];
  const cleared = existing.includes(chamber) ? existing : [...existing, chamber].sort((a, b) => a - b);
  const next: TowerProgress = {
    ...progress,
    highestFloor: Math.max(progress.highestFloor, floor),
    clearedByFloor: { ...progress.clearedByFloor, [floor]: cleared },
  };
  if (isBossFloor(floor) && isFloorCleared(next, floor)) {
    next.bossDefeated = true;
  }
  return next;
}

export function withPosition(progress: TowerProgress, floor: number, chamber: number): TowerProgress {
  return {
    ...progress,
    floor: clampFloor(floor),
    chamber,
    highestFloor: Math.max(progress.highestFloor, clampFloor(floor)),
    chamberByFloor: { ...progress.chamberByFloor, [floor]: chamber },
  };
}
