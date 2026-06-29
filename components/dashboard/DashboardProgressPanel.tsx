"use client";

import AchievementBadge from "@/components/AchievementBadge";
import {
  getCompletedLessonCount,
  getTotalLessonCount,
  getCompletedUnitCount,
  getTotalUnitCount,
} from "@/content/lessons";
import { getRecentUnitRelics } from "@/lib/achievements/catalog";
import type { UserProfile } from "@/lib/types";
import MagicalStatCard from "./MagicalStatCard";
import MemoryGrimoire from "./MemoryGrimoire";

/**
 * Right-side progress panel for the dashboard: course progress ring, key stats,
 * and recently earned relics. Reads existing pure progress helpers only.
 */
export default function DashboardProgressPanel({ profile }: { profile: UserProfile | null }) {
  const completedLessons = getCompletedLessonCount(profile);
  const totalLessons = getTotalLessonCount();
  const completedUnits = getCompletedUnitCount(profile);
  const totalUnits = getTotalUnitCount();
  const streak = profile?.streak ?? 0;
  const pct = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  const relics = getRecentUnitRelics(profile, 3);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md shadow-[0_0_40px_rgba(76,29,149,0.25)]">
      <h2 className="text-sm font-semibold uppercase tracking-widest text-violet-200">Your grimoire</h2>

      <div className="mt-4 flex items-center gap-4">
        <ProgressRing pct={pct} />
        <div>
          <p className="text-3xl font-bold tabular-nums text-white">{pct}%</p>
          <p className="text-xs text-slate-400">course complete</p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-2 min-[420px]:grid-cols-3">
        <MagicalStatCard label="Lessons" value={`${completedLessons}/${totalLessons}`} />
        <MagicalStatCard label="Units" value={`${completedUnits}/${totalUnits}`} />
        <MagicalStatCard label="Streak" value={`${streak}`} hint={streak === 1 ? "day" : "days"} />
      </div>

      <div className="mt-5">
        <h3 className="grimoire-heading text-xs font-semibold uppercase tracking-wide text-amber-200/80">
          Relics
        </h3>
        {relics.length > 0 ? (
          <ul className="mt-2 flex flex-col gap-1.5">
            {relics.map((r) => (
              <li
                key={r.id}
                className="flex items-center gap-3 rounded-lg border border-amber-300/25 bg-amber-400/5 px-3 py-2"
              >
                <AchievementBadge
                  unlocked
                  type="unit"
                  icon={r.icon}
                  className="h-9 w-9 shrink-0 drop-shadow-[0_0_8px_rgba(251,191,36,0.45)]"
                />
                <span className="text-sm font-medium text-amber-100">{r.title}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-xs leading-5 text-slate-500">
            Complete a full unit to earn your first relic.
          </p>
        )}
      </div>

      <MemoryGrimoire profile={profile} />
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
