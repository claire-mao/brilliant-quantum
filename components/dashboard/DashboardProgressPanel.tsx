import Link from "next/link";
import AchievementBadge, { type AchievementIcon } from "@/components/AchievementBadge";
import {
  getUnits,
  isUnitComplete,
  getCompletedLessonCount,
  getTotalLessonCount,
  getCompletedUnitCount,
  getTotalUnitCount,
} from "@/content/lessons";
import type { UserProfile } from "@/lib/types";
import MagicalStatCard from "./MagicalStatCard";
import ConceptMasteryPanel from "./ConceptMasteryPanel";

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

  const relics = getUnits()
    .filter((u) => isUnitComplete(u, profile) && UNIT_RELICS[u.id])
    .map((u) => ({ id: u.id, ...UNIT_RELICS[u.id] }))
    .slice(-3);

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

      <div className="mt-5">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">Relics</h3>
          <Link href="/achievements" className="text-xs font-medium text-violet-300 hover:text-violet-200">
            View all
          </Link>
        </div>
        {relics.length > 0 ? (
          <ul className="mt-3 flex flex-wrap gap-3">
            {relics.map((r) => (
              <li key={r.id} className="flex flex-col items-center gap-1 text-center" title={r.title}>
                <AchievementBadge unlocked type="unit" icon={r.icon} className="h-11 w-11 drop-shadow-[0_0_8px_rgba(167,139,250,0.5)]" />
                <span className="max-w-[4.5rem] text-[10px] leading-tight text-slate-400">{r.title}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-xs leading-5 text-slate-500">
            Complete a full unit to earn your first relic.
          </p>
        )}
      </div>

      <ConceptMasteryPanel profile={profile} />
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
