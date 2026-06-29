/**
 * Categorized achievement catalog. Every achievement is evaluated purely from
 * existing data: Firestore progress (completion, attempts, bestChallengeAttempts,
 * streak) plus local learning signals and activity. No new server state.
 *
 * Names and descriptions reinforce effort, persistence, retrieval, mastery, and
 * curiosity — never innate intelligence.
 */

import type { AchievementBadgeType, AchievementIcon } from "@/components/AchievementBadge";
import type { Lesson, LessonStep, UserProfile } from "@/lib/types";
import {
  quantumBasicsCourse,
  getUnits,
  getLessonsForUnit,
  getUnitLessonProgress,
  isUnitComplete,
  getCompletedLessonCount,
  getTotalLessonCount,
  getCompletedUnitCount,
  getTotalUnitCount,
  isCourseComplete,
} from "@/content/lessons";
import type { Unit } from "@/lib/types";
import { CONCEPTS } from "@/lib/learning/concepts";
import { getConceptSignals } from "@/lib/learning/signals";
import { deriveTimeFacts, getLongestStreak, type TimeFacts } from "@/lib/profile/activity";

export type AchievementCategory = "learning" | "consistency" | "challenge" | "secrets";

/** Title + hint shown for a still-locked secret achievement. */
export const SECRET_TITLE = "???";
export const SECRET_HINT = "??? is waiting for you to grow.";

export interface AchievementDef {
  id: string;
  category: AchievementCategory;
  title: string;
  description: string;
  icon: AchievementIcon;
  type: AchievementBadgeType;
  secret?: boolean;
  /** Short hint shown on hover/focus: how to earn it (or how it was earned). */
  earnHint: string;
  evaluate: (ctx: AchievementContext) => { unlocked: boolean; ratio: number; progressLabel: string };
}

export interface AchievementContext {
  completedLessons: number;
  totalLessons: number;
  completedUnits: number;
  totalUnits: number;
  streak: number;
  longestStreak: number;
  courseDone: boolean;
  unitComplete: Record<string, boolean>;
  unitProgress: Record<string, { completed: number; total: number }>;
  perfectLesson: boolean;
  firstTry: boolean;
  neverGiveUp: boolean;
  explorerConcepts: number;
  time: TimeFacts;
}

/** Unit-completion achievement metadata (shared with the achievements page). */
export const UNIT_META: Record<string, { title: string; description: string; icon: AchievementIcon }> = {
  "chapter-information": { title: "Qubit Initiate", description: "Complete the foundations of quantum states.", icon: "atom" },
  "chapter-transforming": { title: "Gatecaster", description: "Practice gates as transformations until they click.", icon: "gate" },
  "chapter-why-quantum": { title: "Interference Weaver", description: "Shape amplitudes through interference.", icon: "wave" },
  "chapter-multiple-qubits": { title: "Entanglement Adept", description: "Bind qubits into joint quantum states.", icon: "nodes" },
  "chapter-algorithms": { title: "Algorithm Sorcerer", description: "Turn interference into algorithms.", icon: "maze" },
  "chapter-hardware": { title: "Hardware Alchemist", description: "Understand how real quantum computers are built.", icon: "chip" },
};

const GRADED_TYPES = new Set<LessonStep["type"]>([
  "bit-explorer",
  "prediction",
  "collapse-check",
  "gate-sequence",
  "circuit-prediction",
  "circuit-builder",
  "bell-builder",
  "problem-classifier",
  "app-classifier",
  "worked-example",
  "challenge",
]);

/** Count graded steps (those that register a graded attempt) — mirrors the renderer. */
function gradedStepCount(lesson: Lesson): number {
  let n = 0;
  for (const step of lesson.steps) {
    if (GRADED_TYPES.has(step.type)) n += 1;
    else if (step.type === "path-amplitudes" && step.mode !== "experiment") n += 1;
    else if (step.type === "gate-lab" && step.target) n += 1;
    else if (step.type === "circuit-runner" && step.goalIndex !== undefined) n += 1;
  }
  return n;
}

export function buildAchievementContext(profile: UserProfile | null): AchievementContext {
  const signals = getConceptSignals();
  const streak = profile?.streak ?? 0;

  const unitComplete: Record<string, boolean> = {};
  const unitProgress: Record<string, { completed: number; total: number }> = {};
  for (const unit of getUnits()) {
    unitComplete[unit.id] = isUnitComplete(unit, profile);
    unitProgress[unit.id] = getUnitLessonProgress(unit, profile);
  }

  let perfectLesson = false;
  let firstTry = false;
  let neverGiveUp = false;
  for (const lesson of quantumBasicsCourse.lessons) {
    const p = profile?.progress?.[lesson.id];
    if (!p?.completed) continue;
    const graded = gradedStepCount(lesson);
    const best = p.bestChallengeAttempts;
    if (graded > 0 && best !== null && best !== undefined) {
      if (best === graded) {
        perfectLesson = true;
        if ((p.attempts ?? 0) === 1) firstTry = true;
      }
      if (best > graded) neverGiveUp = true;
    }
    if ((p.attempts ?? 0) >= 2) neverGiveUp = true;
  }

  const explorerConcepts = CONCEPTS.filter((tag) => (signals[tag]?.seen ?? 0) > 0).length;
  const extraTimes = Object.values(signals)
    .map((s) => s.lastSeenAt)
    .filter((t) => typeof t === "number" && t > 0);

  return {
    completedLessons: getCompletedLessonCount(profile),
    totalLessons: getTotalLessonCount(),
    completedUnits: getCompletedUnitCount(profile),
    totalUnits: getTotalUnitCount(),
    streak,
    longestStreak: getLongestStreak(streak),
    courseDone: isCourseComplete(profile),
    unitComplete,
    unitProgress,
    perfectLesson,
    firstTry,
    neverGiveUp,
    explorerConcepts,
    time: deriveTimeFacts(extraTimes),
  };
}

function bool(unlocked: boolean): { unlocked: boolean; ratio: number; progressLabel: string } {
  return { unlocked, ratio: unlocked ? 1 : 0, progressLabel: unlocked ? "Unlocked" : "Locked" };
}

const STREAK_TIERS: { id: string; title: string; description: string; target: number; icon: AchievementIcon }[] = [
  { id: "streak3", title: "Three-Day Spell", description: "Practice three days in a row.", target: 3, icon: "flame" },
  { id: "streak7", title: "Weeklong Ward", description: "Hold a streak for a full week.", target: 7, icon: "moonstar" },
  { id: "streak14", title: "Fortnight Focus", description: "Two weeks of steady study.", target: 14, icon: "mountain" },
  { id: "streak30", title: "Archmage Discipline", description: "A month of daily practice.", target: 30, icon: "sun" },
];

function buildCatalog(): AchievementDef[] {
  const defs: AchievementDef[] = [];

  // --- Learning ---
  defs.push({
    id: "spark",
    category: "learning",
    title: "Apprentice Spark",
    description: "Begin your quantum training.",
    icon: "spark",
    type: "unit",
    earnHint: "Complete your first lesson.",
    evaluate: (c) => {
      const unlocked = c.completedLessons >= 1 || c.streak >= 1;
      return { unlocked, ratio: unlocked ? 1 : 0, progressLabel: unlocked ? "Started" : "Not started yet" };
    },
  });
  for (const unit of getUnits()) {
    const meta = UNIT_META[unit.id] ?? { title: unit.title, description: unit.description, icon: "atom" as const };
    defs.push({
      id: `unit-${unit.id}`,
      category: "learning",
      title: meta.title,
      description: meta.description,
      icon: meta.icon,
      type: "unit",
      earnHint: `Complete all lessons in ${unit.title.split(":")[0]}.`,
      evaluate: (c) => {
        const prog = c.unitProgress[unit.id] ?? { completed: 0, total: 0 };
        return {
          unlocked: !!c.unitComplete[unit.id],
          ratio: prog.total > 0 ? prog.completed / prog.total : 0,
          progressLabel: prog.total > 0 ? `${prog.completed} / ${prog.total} lessons` : "Lessons in development",
        };
      },
    });
  }
  defs.push({
    id: "archmage",
    category: "learning",
    title: "Quantum Archmage",
    description: "Finish the full quantum computing course.",
    icon: "crystal",
    type: "course",
    earnHint: "Complete the full course.",
    evaluate: (c) => ({
      unlocked: c.courseDone,
      ratio: c.totalUnits > 0 ? c.completedUnits / c.totalUnits : 0,
      progressLabel: `${c.completedUnits} / ${c.totalUnits} units`,
    }),
  });

  // --- Consistency ---
  defs.push({
    id: "early-bird",
    category: "consistency",
    title: "Early Bird",
    description: "Study in the early morning hours.",
    icon: "sunrise",
    type: "streak",
    earnHint: "Study in the morning.",
    evaluate: (c) => bool(c.time.earlyBird),
  });
  defs.push({
    id: "night-owl",
    category: "consistency",
    title: "Night Owl",
    description: "Study late into the night.",
    icon: "moon",
    type: "streak",
    earnHint: "Study at night.",
    evaluate: (c) => bool(c.time.nightOwl),
  });
  defs.push({
    id: "weekend-wizard",
    category: "consistency",
    title: "Weekend Wizard",
    description: "Keep learning over the weekend.",
    icon: "tower",
    type: "streak",
    earnHint: "Study on a weekend.",
    evaluate: (c) => bool(c.time.weekend),
  });
  for (const tier of STREAK_TIERS) {
    defs.push({
      id: tier.id,
      category: "consistency",
      title: tier.title,
      description: tier.description,
      icon: tier.icon,
      type: "streak",
      earnHint: `Keep a ${tier.target}-day study streak.`,
      evaluate: (c) => {
        const eff = Math.max(c.streak, c.longestStreak);
        return {
          unlocked: eff >= tier.target,
          ratio: Math.min(eff, tier.target) / tier.target,
          progressLabel: `${Math.min(eff, tier.target)} / ${tier.target} day streak`,
        };
      },
    });
  }

  // --- Challenge ---
  defs.push({
    id: "perfect-lesson",
    category: "challenge",
    title: "Perfect Lesson",
    description: "Finish a lesson with no wrong answers.",
    icon: "star",
    type: "challenge",
    earnHint: "Finish a lesson without missing a challenge.",
    evaluate: (c) => bool(c.perfectLesson),
  });
  defs.push({
    id: "first-try",
    category: "challenge",
    title: "First Try",
    description: "Complete a lesson flawlessly on your first run.",
    icon: "wand",
    type: "challenge",
    earnHint: "Complete a lesson on your first attempt.",
    evaluate: (c) => bool(c.firstTry),
  });
  defs.push({
    id: "never-give-up",
    category: "challenge",
    title: "Never Give Up",
    description: "Push through mistakes and finish anyway.",
    icon: "shield",
    type: "challenge",
    earnHint: "Recover and finish after multiple attempts.",
    evaluate: (c) => bool(c.neverGiveUp),
  });
  defs.push({
    id: "explorer",
    category: "challenge",
    title: "Explorer",
    description: "Practice retrieval across three or more concepts.",
    icon: "compass",
    type: "challenge",
    earnHint: "Practice across several concepts.",
    evaluate: (c) => ({
      unlocked: c.explorerConcepts >= 3,
      ratio: Math.min(c.explorerConcepts, 3) / 3,
      progressLabel: `${Math.min(c.explorerConcepts, 3)} / 3 concepts explored`,
    }),
  });

  // --- Secrets (hidden until unlocked) ---
  defs.push({
    id: "secret-dawn-dusk",
    category: "secrets",
    title: "Dawn and Dusk",
    description: "Study at both sunrise and late night.",
    icon: "rune",
    type: "secret",
    secret: true,
    earnHint: "Study at both sunrise and late night.",
    evaluate: (c) => bool(c.time.earlyBird && c.time.nightOwl),
  });
  defs.push({
    id: "secret-eternal-student",
    category: "secrets",
    title: "Eternal Student",
    description: "Study on a weekend while holding a three-day streak.",
    icon: "rune",
    type: "secret",
    secret: true,
    earnHint: "Study on a weekend during a three-day streak.",
    evaluate: (c) => bool(c.time.weekend && Math.max(c.streak, c.longestStreak) >= 3),
  });

  return defs;
}

export const ACHIEVEMENTS: AchievementDef[] = buildCatalog();

export const CATEGORY_LABEL: Record<AchievementCategory, string> = {
  learning: "Learning",
  consistency: "Consistency",
  challenge: "Challenge",
  secrets: "Secrets",
};

export interface EvaluatedAchievement {
  def: AchievementDef;
  unlocked: boolean;
  ratio: number;
  progressLabel: string;
}

export function evaluateAchievements(profile: UserProfile | null): EvaluatedAchievement[] {
  const ctx = buildAchievementContext(profile);
  return ACHIEVEMENTS.map((def) => ({ def, ...def.evaluate(ctx) }));
}

export function getUnlockedIds(profile: UserProfile | null): string[] {
  return evaluateAchievements(profile)
    .filter((a) => a.unlocked)
    .map((a) => a.def.id);
}

export interface UnitRelic {
  id: string;
  title: string;
  icon: AchievementIcon;
  /** Milliseconds when the unit was fully completed (latest lesson completion). */
  earnedAt: number;
}

function tsMillis(ts: unknown): number {
  if (!ts) return 0;
  if (typeof ts === "number") return ts;
  const obj = ts as { toMillis?: () => number; seconds?: number };
  if (typeof obj.toMillis === "function") return obj.toMillis();
  if (typeof obj.seconds === "number") return obj.seconds * 1000;
  return 0;
}

/** When every lesson in the unit is done, the relic is earned at the last lesson's first completion. */
export function getUnitEarnedAt(unit: Unit, profile: UserProfile | null): number {
  let max = 0;
  for (const lesson of getLessonsForUnit(unit)) {
    const t = tsMillis(profile?.progress?.[lesson.id]?.completedAt);
    if (t > max) max = t;
  }
  return max;
}

/** Up to `limit` unit-completion relics, newest earned first. */
export function getRecentUnitRelics(profile: UserProfile | null, limit = 3): UnitRelic[] {
  const units = getUnits();
  return units
    .map((unit, order) => ({ unit, order }))
    .filter(({ unit }) => isUnitComplete(unit, profile) && UNIT_META[unit.id])
    .map(({ unit, order }) => {
      const meta = UNIT_META[unit.id];
      return {
        id: unit.id,
        title: meta.title,
        icon: meta.icon,
        earnedAt: getUnitEarnedAt(unit, profile),
        order,
      };
    })
    .sort((a, b) => {
      if (b.earnedAt !== a.earnedAt) return b.earnedAt - a.earnedAt;
      return b.order - a.order;
    })
    .slice(0, limit)
    .map(({ id, title, icon, earnedAt }) => ({ id, title, icon, earnedAt }));
}
