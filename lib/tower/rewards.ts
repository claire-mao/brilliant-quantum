/**
 * Tower rewards — learning-centered badges (no cosmetics). Each badge is
 * derived purely from tower progress (a `TowerSummary`), so the existing
 * achievement system and badge-unlock ceremony can surface them without any
 * server state. Ids are the single source of truth shared with the catalog.
 */

import type { AchievementBadgeType, AchievementIcon } from "@/components/AchievementBadge";
import type { TowerSummary } from "./progress";

export interface TowerBadgeResult {
  unlocked: boolean;
  ratio: number;
  progressLabel: string;
}

export interface TowerBadgeDef {
  id: string;
  title: string;
  description: string;
  icon: AchievementIcon;
  type: AchievementBadgeType;
  earnHint: string;
  evaluate: (s: TowerSummary) => TowerBadgeResult;
}

function tier(current: number, target: number, noun: string): TowerBadgeResult {
  const clamped = Math.min(current, target);
  return {
    unlocked: current >= target,
    ratio: target > 0 ? clamped / target : 0,
    progressLabel: `${clamped} / ${target} ${noun}`,
  };
}

function flag(unlocked: boolean): TowerBadgeResult {
  return { unlocked, ratio: unlocked ? 1 : 0, progressLabel: unlocked ? "Unlocked" : "Locked" };
}

export const TOWER_BADGES: TowerBadgeDef[] = [
  {
    id: "tower-first-floor",
    title: "First Floor Cleared",
    description: "Clear your first floor of the Wizard Tower.",
    icon: "tower",
    type: "challenge",
    earnHint: "Clear Floor 1 of the tower.",
    evaluate: (s) => flag(s.highestClearedFloor >= 1),
  },
  {
    id: "tower-room-explorer",
    title: "Room Explorer",
    description: "Clear eight rooms across the tower.",
    icon: "compass",
    type: "challenge",
    earnHint: "Clear 8 tower rooms.",
    evaluate: (s) => tier(s.clearedRooms, 8, "rooms"),
  },
  {
    id: "tower-memory-duelist",
    title: "Memory Duelist",
    description: "Win twelve battles through retrieval.",
    icon: "wand",
    type: "challenge",
    earnHint: "Win 12 tower battles.",
    evaluate: (s) => tier(s.battleWins, 12, "wins"),
  },
  {
    id: "tower-gatebreaker",
    title: "Gatebreaker",
    description: "Defeat the Gate Golem atop the Rune Ruins.",
    icon: "gate",
    type: "challenge",
    earnHint: "Defeat the Floor 20 boss.",
    evaluate: (s) => flag(s.bossesDefeated.includes(20)),
  },
  {
    id: "tower-phase-hunter",
    title: "Phase Hunter",
    description: "Win two battles grounded in relative phase.",
    icon: "moonstar",
    type: "challenge",
    earnHint: "Win 2 phase battles.",
    evaluate: (s) => tier(s.conceptClears.phase ?? 0, 2, "phase wins"),
  },
  {
    id: "tower-interference-climber",
    title: "Interference Climber",
    description: "Defeat the Interference Hydra in the Crystal Caverns.",
    icon: "wave",
    type: "challenge",
    earnHint: "Defeat the Floor 30 boss.",
    evaluate: (s) => flag(s.bossesDefeated.includes(30)),
  },
  {
    id: "tower-entanglement-challenger",
    title: "Entanglement Challenger",
    description: "Defeat the Entanglement Twins in the Library.",
    icon: "nodes",
    type: "challenge",
    earnHint: "Defeat the Floor 40 boss.",
    evaluate: (s) => flag(s.bossesDefeated.includes(40)),
  },
  {
    id: "tower-boss-breaker",
    title: "Boss Breaker",
    description: "Defeat your first tower boss.",
    icon: "shield",
    type: "challenge",
    earnHint: "Defeat any tower boss.",
    evaluate: (s) => flag(s.bossesDefeated.length >= 1),
  },
  {
    id: "tower-ten-floors",
    title: "Ten Floors Cleared",
    description: "Climb through ten floors of the tower.",
    icon: "mountain",
    type: "challenge",
    earnHint: "Clear 10 floors.",
    evaluate: (s) => tier(s.highestClearedFloor, 10, "floors"),
  },
  {
    id: "tower-thirty-floors",
    title: "Thirty Floors Cleared",
    description: "Climb halfway up the tower.",
    icon: "staff",
    type: "challenge",
    earnHint: "Clear 30 floors.",
    evaluate: (s) => tier(s.highestClearedFloor, 30, "floors"),
  },
  {
    id: "tower-ascendant",
    title: "Tower Ascendant",
    description: "Reach the upper reaches — fifty floors cleared.",
    icon: "star",
    type: "challenge",
    earnHint: "Clear 50 floors.",
    evaluate: (s) => tier(s.highestClearedFloor, 50, "floors"),
  },
  {
    id: "tower-observer",
    title: "The Observer Defeated",
    description: "Defeat the final boss atop the Quantum Core.",
    icon: "rune",
    type: "course",
    earnHint: "Defeat the Floor 60 boss.",
    evaluate: (s) => flag(s.bossesDefeated.includes(60)),
  },
  {
    id: "tower-relic",
    title: "Quantum Relic Awakened",
    description: "Clear the tower and awaken the Quantum Relic.",
    icon: "crystal",
    type: "course",
    earnHint: "Clear all 60 floors.",
    evaluate: (s) => flag(s.towerCleared),
  },
];

export const TOWER_BADGE_IDS: string[] = TOWER_BADGES.map((b) => b.id);

/** Ids of all currently unlocked tower badges for a summary. */
export function unlockedTowerBadgeIds(summary: TowerSummary): string[] {
  return TOWER_BADGES.filter((b) => b.evaluate(summary).unlocked).map((b) => b.id);
}
