import Link from "next/link";
import { type AchievementIcon } from "@/components/AchievementBadge";
import {
  getUnits,
  isUnitComplete,
  getCompletedLessonCount,
  getTotalLessonCount,
  getCompletedUnitCount,
  getTotalUnitCount,
  quantumBasicsCourse,
} from "@/content/lessons";
import type { UserProfile } from "@/lib/types";
import MagicalStatCard from "./MagicalStatCard";
import GrimoireInsights, { type GrimoireRelic } from "./GrimoireInsights";

/** Unit-completion relics (kept in sync with the achievements page). */
const UNIT_RELICS: Record<string, { title: string; icon: AchievementIcon }> = {
  "chapter-information": { title: "Qubit Initiate", icon: "atom" },
  "chapter-transforming": { title: "Gatecaster", icon: "circuit" },
  "chapter-why-quantum": { title: "Interference Weaver", icon: "wave" },
  "chapter-multiple-qubits": { title: "Entanglement Adept", icon: "nodes" },
  "chapter-algorithms": { title: "Algorithm Sorcerer", icon: "maze" },
  "chapter-hardware": { title: "Hardware Alchemist", icon: "chip" },
};

/**
 * Right-side progress panel for the dashboard. Designed to answer three
 * questions at a glance: how far am I (ring + stats), what should I do next
 * (next challenge), and what should I review (insights). Heavier detail —
 * relics and the full concept list — lives behind a "Details" toggle.
 */
export default function DashboardProgressPanel({ profile }: { profile: UserProfile | null }) {
  const completedLessons = getCompletedLessonCount(profile);
  const totalLessons = getTotalLessonCount();
  const completedUnits = getCompletedUnitCount(profile);
  const totalUnits = getTotalUnitCount();
  const streak = profile?.streak ?? 0;
  const pct = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  const relics: GrimoireRelic[] = getUnits()
    .filter((u) => isUnitComplete(u, profile) && UNIT_RELICS[u.id])
    .map((u) => ({ id: u.id, ...UNIT_RELICS[u.id] }))
    .slice(-3);

  const nextLesson =
    quantumBasicsCourse.lessons.find(
      (l) => l.steps.length > 0 && !profile?.progress?.[l.id]?.completed
    ) ?? null;
  const nextStarted = nextLesson
    ? (profile?.progress?.[nextLesson.id]?.currentStep ?? 0) > 0
    : false;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md shadow-[0_0_40px_rgba(76,29,149,0.25)]">
      <h2 className="text-sm font-semibold uppercase tracking-widest text-violet-200">Your grimoire</h2>

      <div className="mt-4 flex items-center gap-4">
        <ProgressRing pct={pct} />
        <div>
          <p className="text-3xl font-bold tabular-nums text-white">{pct}%</p>
          <p className="text-xs text-slate-400">of the course mastered</p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <MagicalStatCard label="Lessons" value={`${completedLessons}/${totalLessons}`} />
        <MagicalStatCard label="Units" value={`${completedUnits}/${totalUnits}`} />
        <MagicalStatCard label="Streak" value={`${streak}`} hint={streak === 1 ? "day" : "days"} />
      </div>

      {/* What should I do next? */}
      <div className="mt-4">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">Next challenge</h3>
        {nextLesson ? (
          <Link
            href={`/lessons/${nextLesson.id}`}
            className="group mt-2 flex items-center justify-between gap-3 rounded-xl border border-violet-400/30 bg-violet-500/10 px-3.5 py-2.5 transition-colors hover:border-violet-400/60 hover:bg-violet-500/20"
          >
            <span className="min-w-0">
              <span className="block truncate text-sm font-medium text-white">{nextLesson.title}</span>
              <span className="block text-[11px] text-violet-200/80">{nextStarted ? "Continue" : "Start"}</span>
            </span>
            <svg
              viewBox="0 0 20 20"
              className="h-4 w-4 shrink-0 text-violet-200 transition-transform group-hover:translate-x-0.5"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path d="M4 10 H15 M11 6 L15 10 L11 14" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        ) : (
          <p className="mt-2 text-xs text-slate-500">All lessons complete — new units are being inscribed.</p>
        )}
      </div>

      <GrimoireInsights profile={profile} relics={relics} />
    </div>
  );
}

function ProgressRing({ pct }: { pct: number }) {
  const r = 30;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - Math.min(100, Math.max(0, pct)) / 100);
  return (
    <svg viewBox="0 0 72 72" className="h-20 w-20 -rotate-90" aria-hidden="true">
      <defs>
        <linearGradient id="grimoire-ring" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#a78bfa" />
          <stop offset="100%" stopColor="#fbbf24" />
        </linearGradient>
      </defs>
      <circle cx="36" cy="36" r={r} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="7" />
      <circle
        cx="36"
        cy="36"
        r={r}
        fill="none"
        stroke="url(#grimoire-ring)"
        strokeWidth="7"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={offset}
        className="transition-[stroke-dashoffset] duration-700"
      />
    </svg>
  );
}
