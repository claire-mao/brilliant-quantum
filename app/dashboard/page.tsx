"use client";

import { useState } from "react";
import Link from "next/link";
import RouteGuard from "@/components/RouteGuard";
import NavBar from "@/components/NavBar";
import QuantumWizardBackground from "@/components/dashboard/QuantumWizardBackground";
import DashboardProgressPanel from "@/components/dashboard/DashboardProgressPanel";
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
  const course = quantumBasicsCourse;

  return (
    <main className="relative z-10 mx-auto w-full max-w-[1100px] flex-1 px-4 py-8 sm:px-6 lg:px-8">
      <Hero title={course.title} description={course.description} streak={profile?.streak ?? 0} />

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="order-2 flex flex-col gap-6 lg:order-1">
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

        <aside className="order-1 lg:order-2">
          <div className="lg:sticky lg:top-6">
            <DashboardProgressPanel profile={profile} />
          </div>
        </aside>
      </div>
    </main>
  );
}

function Hero({ title, description, streak }: { title: string; description: string; streak: number }) {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 px-6 py-8 backdrop-blur-md sm:px-8 sm:py-10">
      <div className="relative z-10 max-w-2xl">
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-violet-300/30 bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-100">
            <SparkRune />
            Quantum Wizard Academy
          </span>
          <Link
            href="/achievements"
            className="inline-flex items-center gap-1.5 rounded-full border border-amber-300/40 bg-amber-400/10 px-3 py-1 text-xs font-semibold text-amber-200 transition-colors hover:bg-amber-400/20"
          >
            <RelicGlyph />
            Achievements
          </Link>
        </div>

        <h1 className="mt-5 font-serif text-3xl font-bold tracking-tight text-white sm:text-4xl">
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

function SparkRune() {
  return (
    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 text-violet-300" fill="currentColor" aria-hidden="true">
      <path d="M8 1 L9.2 6 L14 8 L9.2 10 L8 15 L6.8 10 L2 8 L6.8 6 Z" />
    </svg>
  );
}

function RelicGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor" aria-hidden="true">
      <path d="M12 3 L15 8 L21 9 L17 13 L18 19 L12 16 L6 19 L7 13 L3 9 L9 8 Z" />
    </svg>
  );
}

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

function OrbitalDiagram() {
  return (
    <svg
      viewBox="0 0 200 200"
      className="orbit-rotate pointer-events-none absolute -right-10 top-1/2 -mt-28 hidden h-56 w-56 text-violet-300/30 lg:block"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      aria-hidden="true"
    >
      <ellipse cx="100" cy="100" rx="80" ry="30" />
      <ellipse cx="100" cy="100" rx="80" ry="30" transform="rotate(60 100 100)" />
      <ellipse cx="100" cy="100" rx="80" ry="30" transform="rotate(120 100 100)" />
      <circle cx="100" cy="100" r="6" fill="#fbbf24" stroke="none" className="opacity-80" />
      <circle cx="180" cy="100" r="3" fill="#a78bfa" stroke="none" />
      <circle cx="60" cy="152" r="3" fill="#818cf8" stroke="none" />
    </svg>
  );
}
