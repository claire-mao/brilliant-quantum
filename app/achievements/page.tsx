"use client";

import Link from "next/link";
import RouteGuard from "@/components/RouteGuard";
import NavBar from "@/components/NavBar";
import AchievementCard from "@/components/AchievementCard";
import type { AchievementIcon } from "@/components/AchievementBadge";
import { useAuth } from "@/lib/auth-context";
import {
  getUnits,
  getCompletedLessonCount,
  getTotalLessonCount,
  getCompletedUnitCount,
  getTotalUnitCount,
  getUnitLessonProgress,
  isUnitComplete,
  isCourseComplete,
  getAchievementProgress,
} from "@/content/lessons";

export default function AchievementsPage() {
  return (
    <RouteGuard>
      <NavBar />
      <AchievementsContent />
    </RouteGuard>
  );
}

const STREAK_TIERS: {
  id: string;
  label: string;
  description: string;
  target: number;
  icon: AchievementIcon;
}[] = [
  { id: "first", label: "Apprentice Spark", description: "Begin your quantum training.", target: 1, icon: "spark" },
  { id: "streak3", label: "Three-Day Spell", description: "Practice three days in a row.", target: 3, icon: "flame" },
  { id: "streak7", label: "Weeklong Ward", description: "Hold a streak for a full week.", target: 7, icon: "moonstar" },
  { id: "streak14", label: "Fortnight Focus", description: "Two weeks of steady study.", target: 14, icon: "mountain" },
  { id: "streak30", label: "Archmage Discipline", description: "A month of daily practice.", target: 30, icon: "sun" },
];

/** Wizard-themed name, description, and icon for each unit's completion badge. */
const UNIT_ACHIEVEMENTS: Record<string, { title: string; description: string; icon: AchievementIcon }> = {
  "chapter-information": {
    title: "Qubit Initiate",
    description: "Complete the foundations of quantum states.",
    icon: "atom",
  },
  "chapter-transforming": {
    title: "Gatecaster",
    description: "Master gates as transformations.",
    icon: "circuit",
  },
  "chapter-why-quantum": {
    title: "Interference Weaver",
    description: "Shape amplitudes through interference.",
    icon: "wave",
  },
  "chapter-multiple-qubits": {
    title: "Entanglement Adept",
    description: "Bind qubits into joint quantum states.",
    icon: "nodes",
  },
  "chapter-algorithms": {
    title: "Algorithm Sorcerer",
    description: "Turn interference into algorithms.",
    icon: "maze",
  },
  "chapter-hardware": {
    title: "Hardware Alchemist",
    description: "Build quantum computers from real matter.",
    icon: "chip",
  },
};

function AchievementsContent() {
  const { profile } = useAuth();

  const completedLessons = getCompletedLessonCount(profile);
  const totalLessons = getTotalLessonCount();
  const completedUnits = getCompletedUnitCount(profile);
  const totalUnits = getTotalUnitCount();
  const streak = profile?.streak ?? 0;
  const courseDone = isCourseComplete(profile);

  // "First Study Day" also counts any completed lesson, not just an active streak.
  const startedLearning = streak >= 1 || completedLessons >= 1;

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-8">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Achievements</h1>
        <Link href="/dashboard" className="shrink-0 text-sm font-medium text-indigo-600 hover:underline">
          Back to course
        </Link>
      </div>
      <p className="mt-1 text-slate-500">Your progress across the whole course.</p>

      {/* A. Progress Summary */}
      <section className="mt-6">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <StatCard label="Lessons completed" value={`${completedLessons} / ${totalLessons}`} />
          <StatCard label="Units completed" value={`${completedUnits} / ${totalUnits}`} />
          <StatCard label="Current streak" value={`${streak} ${streak === 1 ? "day" : "days"}`} />
        </div>
      </section>

      {/* B. Streak Achievements */}
      <Section title="Streak achievements">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {STREAK_TIERS.map((tier) => {
            const current = tier.target === 1 ? (startedLearning ? 1 : 0) : streak;
            const p = getAchievementProgress(current, tier.target);
            return (
              <AchievementCard
                key={tier.id}
                title={tier.label}
                description={tier.description}
                unlocked={p.unlocked}
                type="streak"
                icon={tier.icon}
                ratio={p.ratio}
                progressLabel={
                  tier.target === 1
                    ? p.unlocked
                      ? "Started"
                      : "Not started yet"
                    : `${Math.min(streak, tier.target)} / ${tier.target} day streak`
                }
              />
            );
          })}
        </div>
      </Section>

      {/* C. Unit Completion Achievements */}
      <Section title="Unit completion">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {getUnits().map((unit) => {
            const { completed, total } = getUnitLessonProgress(unit, profile);
            const unlocked = isUnitComplete(unit, profile);
            const meta =
              UNIT_ACHIEVEMENTS[unit.id] ??
              ({ title: unit.title, description: unit.description, icon: "atom" } as const);
            return (
              <AchievementCard
                key={unit.id}
                title={meta.title}
                description={meta.description}
                unlocked={unlocked}
                type="unit"
                icon={meta.icon}
                ratio={total > 0 ? completed / total : 0}
                progressLabel={
                  total > 0 ? `${completed} / ${total} lessons complete` : "Lessons in development"
                }
              />
            );
          })}
        </div>
      </Section>

      {/* D. Course Completion Achievement */}
      <Section title="Course completion">
        <AchievementCard
          title="Quantum Archmage"
          description="Finish the full quantum computing course."
          unlocked={courseDone}
          type="course"
          icon="staff"
          ratio={totalUnits > 0 ? completedUnits / totalUnits : 0}
          progressLabel={`${completedUnits} / ${totalUnits} units complete`}
        />
      </Section>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
      <p className="text-2xl font-bold tabular-nums text-slate-900">{value}</p>
      <p className="mt-0.5 text-sm text-slate-500">{label}</p>
    </div>
  );
}
