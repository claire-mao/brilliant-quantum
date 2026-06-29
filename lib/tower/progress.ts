/**
 * Tower progress persistence. All tower state lives in localStorage so the
 * game survives refresh without any Firestore schema change. Everything
 * degrades safely when storage is unavailable, and reads return sensible
 * defaults on the server (so SSR never throws).
 */

import type { UserProfile } from "@/lib/types";
import type { ConceptTag } from "@/lib/learning/concepts";
import { TOTAL_FLOORS, unitUnlockedFloorCap } from "./floors";

const KEY = "bq-tower-progress-v1";
const MAX_RECENT = 30;

export interface TowerBattleRecord {
  floor: number;
  concept: ConceptTag;
  correct: boolean;
  at: number;
}

export interface TowerProgress {
  version: 1;
  /** Highest fully cleared floor (0 = none cleared yet). */
  highestClearedFloor: number;
  /** Where the learner currently stands. */
  currentFloor: number;
  /** Floor → cleared room ids. */
  clearedRooms: Record<number, string[]>;
  /** Floors whose boss has been defeated. */
  bossesDefeated: number[];
  /** Per-concept count of battles won (strengthens badges + stats). */
  conceptClears: Partial<Record<ConceptTag, number>>;
  battleWins: number;
  battleLosses: number;
  recentBattles: TowerBattleRecord[];
  /** True once Floor 60 is cleared (the tower break). */
  towerCleared: boolean;
}

export function emptyProgress(): TowerProgress {
  return {
    version: 1,
    highestClearedFloor: 0,
    currentFloor: 1,
    clearedRooms: {},
    bossesDefeated: [],
    conceptClears: {},
    battleWins: 0,
    battleLosses: 0,
    recentBattles: [],
    towerCleared: false,
  };
}

function read(): TowerProgress {
  if (typeof window === "undefined") return emptyProgress();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return emptyProgress();
    const parsed = JSON.parse(raw) as Partial<TowerProgress> | null;
    if (!parsed || typeof parsed !== "object") return emptyProgress();
    return { ...emptyProgress(), ...parsed };
  } catch {
    return emptyProgress();
  }
}

function write(state: TowerProgress): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // ignore quota / availability errors — the tower still plays in-session.
  }
}

export function getTowerProgress(): TowerProgress {
  return read();
}

export function saveTowerProgress(p: TowerProgress): void {
  write(p);
}

/* ------------------------------ Mutations -------------------------------- */

export function setCurrentFloor(floor: number): TowerProgress {
  const p = read();
  p.currentFloor = Math.max(1, Math.min(TOTAL_FLOORS, floor));
  write(p);
  return p;
}

export function isRoomCleared(p: TowerProgress, floor: number, roomId: string): boolean {
  return (p.clearedRooms[floor] ?? []).includes(roomId);
}

export function markRoomCleared(floor: number, roomId: string): TowerProgress {
  const p = read();
  const list = p.clearedRooms[floor] ?? [];
  if (!list.includes(roomId)) {
    p.clearedRooms[floor] = [...list, roomId];
    write(p);
  }
  return p;
}

export function markBossDefeated(floor: number): TowerProgress {
  const p = read();
  if (!p.bossesDefeated.includes(floor)) {
    p.bossesDefeated = [...p.bossesDefeated, floor].sort((a, b) => a - b);
    write(p);
  }
  return p;
}

export function markFloorCleared(floor: number): TowerProgress {
  const p = read();
  p.highestClearedFloor = Math.max(p.highestClearedFloor, floor);
  if (floor >= TOTAL_FLOORS) p.towerCleared = true;
  write(p);
  return p;
}

/** Record one battle answer: strengthens stats, concept clears, and history. */
export function recordTowerBattle(floor: number, concept: ConceptTag, correct: boolean): TowerProgress {
  const p = read();
  if (correct) {
    p.battleWins += 1;
    p.conceptClears[concept] = (p.conceptClears[concept] ?? 0) + 1;
  } else {
    p.battleLosses += 1;
  }
  p.recentBattles = [{ floor, concept, correct, at: Date.now() }, ...p.recentBattles].slice(0, MAX_RECENT);
  write(p);
  return p;
}

export function resetTowerProgress(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}

/* ----------------------------- Derived view ------------------------------ */

export function totalClearedRooms(p: TowerProgress): number {
  return Object.values(p.clearedRooms).reduce((sum, list) => sum + list.length, 0);
}

export function isFloorCleared(p: TowerProgress, floor: number): boolean {
  return p.highestClearedFloor >= floor;
}

/**
 * The highest floor the learner may currently visit: capped by unit completion
 * and limited to one floor beyond their highest cleared floor (you climb in
 * order). Always at least floor 1.
 */
export function getHighestUnlockedFloor(profile: UserProfile | null, p: TowerProgress): number {
  const cap = unitUnlockedFloorCap(profile);
  const reach = p.highestClearedFloor + 1;
  return Math.max(1, Math.min(cap, reach, TOTAL_FLOORS));
}

export function isFloorAccessible(profile: UserProfile | null, p: TowerProgress, floor: number): boolean {
  if (floor < 1 || floor > TOTAL_FLOORS) return false;
  return floor <= getHighestUnlockedFloor(profile, p);
}

/** Compact summary for the achievements engine (SSR-safe). */
export interface TowerSummary {
  highestClearedFloor: number;
  clearedRooms: number;
  battleWins: number;
  bossesDefeated: number[];
  conceptClears: Partial<Record<ConceptTag, number>>;
  towerCleared: boolean;
}

export function getTowerSummary(): TowerSummary {
  const p = read();
  return {
    highestClearedFloor: p.highestClearedFloor,
    clearedRooms: totalClearedRooms(p),
    battleWins: p.battleWins,
    bossesDefeated: p.bossesDefeated,
    conceptClears: p.conceptClears,
    towerCleared: p.towerCleared,
  };
}
