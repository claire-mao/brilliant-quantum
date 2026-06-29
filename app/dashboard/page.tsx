"use client";

import { useState } from "react";
import Link from "next/link";
import RouteGuard from "@/components/RouteGuard";
import NavBar from "@/components/NavBar";
import QuantumWizardBackground from "@/components/dashboard/QuantumWizardBackground";
import DashboardProgressPanel from "@/components/dashboard/DashboardProgressPanel";
import TowerCard from "@/components/dashboard/TowerCard";
import UnitSigil, { sigilForUnitId } from "@/components/dashboard/UnitSigil";
import { useAuth } from "@/lib/auth-context";
import {
  quantumBasicsCourse,
  isLessonUnlocked,
  getUnits,
  getLessonsForUnit,
  getUnitStatus,
  getUnitLessonProgress,
  type UnitStatus,
} from "@/content/lessons";
import type { Lesson, Unit, UserProfile } from "@/lib/types";

export default function DashboardPage() {
  return (
    <RouteGuard>
      <div className="relative isolate flex flex-1 flex-col bg-[radial-gradient(120%_120%_at_50%_-10%,#1e1245_0%,#0d0a24_45%,#070611_100%)] text-slate-100">
        <QuantumWizardBackground />
        <NavBar variant="dark" />
        <DashboardContent />
      </div>
    </RouteGuard>
  );
}

function DashboardContent() {
  const { profile } = useAuth();

  return (
    <main className="relative z-10 mx-auto w-full max-w-[1100px] flex-1 px-4 py-8 sm:px-6 lg:px-8">
      <Hero
        title="Quantum Computation"
        description="An interactive, experiment-first introduction to quantum computation."
        streak={profile?.streak ?? 0}
      />

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(255px,330px)]">
        <div className="order-1 flex min-w-0 flex-col gap-6">
          <Recommendation profile={profile} />
          <section>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-widest text-violet-200/80">
              Your study path
            </h2>
            <div className="flex flex-col gap-3">
              {getUnits().map((unit) => (
                <UnitSection key={unit.id} unit={unit} profile={profile} />
              ))}
            </div>
          </section>
        </div>

        <aside className="order-2 min-w-0">
          <DashboardProgressPanel profile={profile} />
          <TowerCard />
        </aside>
      </div>
    </main>
  );
}

function Hero({ title, description, streak }: { title: string; description: string; streak: number }) {
  return (
    <section className="hero-card relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 px-6 py-8 backdrop-blur-md sm:px-8 sm:py-10">
      <div className="relative z-10">
        <h1 className="font-serif text-3xl font-bold tracking-tight text-white sm:text-4xl">
          {title}
        </h1>
        <p className="mt-3 text-base leading-7 text-slate-300">{description}</p>

        {streak > 0 && (
          <p className="mt-5 inline-flex items-center gap-2 rounded-full border border-amber-400/50 bg-amber-400/10 px-3.5 py-1.5 text-sm font-semibold text-amber-200 shadow-[0_0_18px_rgba(251,191,36,0.25)]">
            <FlameGlyph />
            {streak}-day streak
          </p>
        )}
      </div>

      {/* decorative orbital diagram */}
      <OrbitalDiagram />
    </section>
  );
}

function Recommendation({ profile }: { profile: UserProfile | null }) {
  const lessons = quantumBasicsCourse.lessons;
  const nextLesson = lessons.find(
    (l) => l.steps.length > 0 && !profile?.progress?.[l.id]?.completed
  );

  if (!nextLesson) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 backdrop-blur-sm">
        <p className="text-sm font-semibold text-white">The grimoire is complete</p>
        <p className="mt-1 text-sm text-slate-400">
          You&apos;ve finished every lesson currently available. New units are being inscribed.
        </p>
      </div>
    );
  }

  const isFirst = lessons[0]?.id === nextLesson.id;
  const started = (profile?.progress?.[nextLesson.id]?.currentStep ?? 0) > 0;

  return (
    <div className="spellbook-card relative overflow-hidden rounded-2xl border border-amber-300/30 bg-gradient-to-br from-violet-600/15 via-white/5 to-amber-500/10 p-5 backdrop-blur-md">
      <div className="flex items-start gap-4">
        <SpellbookIcon />
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-amber-200/90">
            {isFirst ? "Begin here" : "Up next"}
          </p>
          <h3 className="mt-1 font-serif text-xl font-bold text-white">{nextLesson.title}</h3>
          <p className="mt-1 text-sm leading-6 text-slate-300">{nextLesson.description}</p>
          <Link
            href={`/lessons/${nextLesson.id}`}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-violet-500 to-indigo-500 px-4 py-2 text-sm font-semibold text-white shadow-[0_0_20px_rgba(139,92,246,0.4)] transition-transform hover:scale-[1.02]"
          >
            {started ? "Continue lesson" : "Start lesson"}
            <ArrowGlyph />
          </Link>
        </div>
      </div>
    </div>
  );
}

function UnitSection({ unit, profile }: { unit: Unit; profile: UserProfile | null }) {
  const status = getUnitStatus(unit, profile);
  const lessons = getLessonsForUnit(unit);
  const { completed, total } = getUnitLessonProgress(unit, profile);
  const [open, setOpen] = useState(status === "active");

  return (
    <section className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left transition-colors hover:bg-white/5"
      >
        <span className="flex min-w-0 items-center gap-3.5">
          <UnitSigil kind={sigilForUnitId(unit.id)} status={status} />
          <span className="min-w-0">
            <span className="block font-serif text-base font-semibold text-white">{unit.title}</span>
            <span className="block truncate text-sm text-slate-400">{unit.description}</span>
          </span>
        </span>
        <span className="flex shrink-0 items-center gap-2.5">
          <UnitStatusPill status={status} completed={completed} total={total} />
          <svg
            viewBox="0 0 20 20"
            className={`h-4 w-4 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path d="M5 7.5 L10 12.5 L15 7.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </button>

      {open && (
        <div className="px-4 pb-4">
          {lessons.length === 0 ? (
            <p className="rounded-xl border border-dashed border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-500">
              Lessons in development.
            </p>
          ) : (
            <ul className="flex flex-col gap-2 border-l border-white/10 pl-4">
              {lessons.map((lesson) => (
                <li key={lesson.id}>
                  <LessonCard lesson={lesson} profile={profile} />
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  );
}

function UnitStatusPill({
  status,
  completed,
  total,
}: {
  status: UnitStatus;
  completed: number;
  total: number;
}) {
  const map: Record<UnitStatus, { label: string; cls: string }> = {
    completed: { label: "Completed", cls: "border-emerald-400/40 bg-emerald-400/10 text-emerald-300" },
    active: {
      label: total > 0 ? `${completed}/${total}` : "In progress",
      cls: "border-violet-400/40 bg-violet-400/10 text-violet-200",
    },
    locked: { label: "Locked", cls: "border-white/10 bg-white/5 text-slate-500" },
    "coming-soon": { label: "Coming soon", cls: "border-white/10 bg-white/5 text-slate-500" },
  };
  const { label, cls } = map[status];
  return (
    <span className={`hidden shrink-0 rounded-full border px-2.5 py-1 text-xs font-medium sm:inline ${cls}`}>
      {label}
    </span>
  );
}

function LessonCard({ lesson, profile }: { lesson: Lesson; profile: UserProfile | null }) {
  const progress = profile?.progress?.[lesson.id];
  const completed = !!progress?.completed;
  const inProgress = !completed && (progress?.currentStep ?? 0) > 0;
  const unlocked = isLessonUnlocked(lesson.id, profile);

  if (!unlocked) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3.5 opacity-70">
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-slate-300">{lesson.title}</p>
          <p className="truncate text-sm text-slate-500">Finish the previous lesson to unlock.</p>
        </div>
        <span className="shrink-0 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-500">
          Locked
        </span>
      </div>
    );
  }

  return (
    <Link
      href={`/lessons/${lesson.id}`}
      className="group flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3.5 transition-colors hover:border-violet-400/40 hover:bg-violet-500/10"
    >
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-white">{lesson.title}</p>
        <p className="truncate text-sm text-slate-400">{lesson.description}</p>
      </div>
      <span
        className={`shrink-0 rounded-full border px-3 py-1 text-xs font-medium ${
          completed
            ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-300"
            : inProgress
              ? "border-amber-400/40 bg-amber-400/10 text-amber-200"
              : "border-violet-400/40 bg-violet-400/10 text-violet-200"
        }`}
      >
        {completed ? "Completed" : inProgress ? "Continue" : "Start"}
      </span>
    </Link>
  );
}

/* --- decorative glyphs (aria-hidden) --- */

function FlameGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor" aria-hidden="true">
      <path d="M12 2 C16 7 14 11 12 14 C10.5 12 11 10 11 10 C8.5 12 8.5 16 12 19 C16 17 18 13 16 8 C15 11 13 9 12 2 Z" />
    </svg>
  );
}

function ArrowGlyph() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path d="M4 10 H15 M11 6 L15 10 L11 14" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SpellbookIcon() {
  return (
    <span
      className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-amber-300/40 bg-amber-400/10 text-amber-200 shadow-[0_0_18px_rgba(251,191,36,0.25)]"
      aria-hidden="true"
    >
      <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <path d="M5 4 h9 a2 2 0 0 1 2 2 v13 a2 2 0 0 0-2-2 H5 Z" strokeLinejoin="round" />
        <path d="M19 4 h-3 a2 2 0 0 0-2 2 v13 a2 2 0 0 1 2-2 h3 Z" strokeLinejoin="round" />
        <path d="M9 9 l1.5 1.5 L13 8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

/**
 * Atom with three differently colored electrons, each traveling its own orbit.
 * Every electron is a round stroke-dash dot riding a normalized path
 * (pathLength 100); the nucleus stays still. Hovering the hero card speeds the
 * electrons up dramatically. All CSS-driven; frozen under reduced motion.
 */
const ORBIT_PATH = "M20 100 A80 30 0 1 0 180 100 A80 30 0 1 0 20 100 Z";
const ELECTRONS = [
  { rot: 0, color: "#60a5fa", glow: "96,165,250", delay: 0 },
  { rot: 60, color: "#f472b6", glow: "244,114,182", delay: -1.7 },
  { rot: 120, color: "#34d399", glow: "52,211,153", delay: -3.3 },
];

function OrbitalDiagram() {
  return (
    <svg
      viewBox="0 0 200 200"
      className="pointer-events-none absolute -right-10 top-1/2 -mt-28 hidden h-56 w-56 lg:block"
      fill="none"
      aria-hidden="true"
    >
      {/* base orbits (purple) */}
      <g stroke="#a78bfa" strokeOpacity="0.3" strokeWidth="1">
        <path d={ORBIT_PATH} />
        <path d={ORBIT_PATH} transform="rotate(60 100 100)" />
        <path d={ORBIT_PATH} transform="rotate(120 100 100)" />
      </g>

      {/* nucleus (stationary) */}
      <circle cx="100" cy="100" r="9" fill="#fbbf24" />
      <circle cx="100" cy="100" r="9" fill="none" stroke="#fde68a" strokeOpacity="0.5" strokeWidth="1" />

      {/* three colored electrons, each on its own orbit */}
      {ELECTRONS.map((e, i) => (
        <g key={i} transform={`rotate(${e.rot} 100 100)`}>
          <path
            d={ORBIT_PATH}
            pathLength={100}
            className="orbit-dot"
            style={{
              stroke: e.color,
              filter: `drop-shadow(0 0 5px rgba(${e.glow}, 0.95))`,
              animationDelay: `${e.delay}s`,
            }}
          />
        </g>
      ))}
    </svg>
  );
}
