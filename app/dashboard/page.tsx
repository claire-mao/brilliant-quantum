"use client";

import { useState } from "react";
import Link from "next/link";
import RouteGuard from "@/components/RouteGuard";
import NavBar from "@/components/NavBar";
import { useAuth } from "@/lib/auth-context";
import {
  quantumBasicsCourse,
  isLessonUnlocked,
  getUnits,
  getLessonsForUnit,
  getUnitStatus,
  type UnitStatus,
} from "@/content/lessons";
import type { Lesson, Unit, UserProfile } from "@/lib/types";

export default function DashboardPage() {
  return (
    <RouteGuard>
      <NavBar />
      <DashboardContent />
    </RouteGuard>
  );
}

function DashboardContent() {
  const { profile } = useAuth();
  const course = quantumBasicsCourse;

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-8">
      <div className="flex items-start justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">{course.title}</h1>
        <Link
          href="/achievements"
          className="mt-1 shrink-0 text-sm font-medium text-indigo-600 hover:underline"
        >
          Achievements
        </Link>
      </div>
      <p className="mt-1 text-slate-500">{course.description}</p>

      {(profile?.streak ?? 0) > 0 && (
        <p className="mt-3 inline-flex items-center rounded-full bg-orange-50 px-3 py-1 text-sm font-medium text-orange-700">
          {profile?.streak}-day streak
        </p>
      )}

      <Recommendation profile={profile} />

      <div className="mt-8 flex flex-col gap-6">
        {getUnits().map((unit, i) => (
          <UnitSection key={unit.id} unit={unit} index={i} profile={profile} />
        ))}
      </div>
    </main>
  );
}

function Recommendation({ profile }: { profile: UserProfile | null }) {
  const lessons = quantumBasicsCourse.lessons;
  const nextLesson = lessons.find(
    (l) => l.steps.length > 0 && !profile?.progress?.[l.id]?.completed
  );

  if (!nextLesson) {
    return (
      <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
        <p className="text-sm font-medium text-slate-700">More lessons coming soon</p>
        <p className="text-sm text-slate-500">
          You&apos;ve completed every lesson currently available. New units are in development.
        </p>
      </div>
    );
  }

  const isFirst = lessons[0]?.id === nextLesson.id;
  const started = (profile?.progress?.[nextLesson.id]?.currentStep ?? 0) > 0;

  return (
    <RecommendationCard
      title={`${isFirst ? "Start here" : "Up next"}: ${nextLesson.title}`}
      body={nextLesson.description}
      href={`/lessons/${nextLesson.id}`}
      cta={started ? "Continue" : "Start lesson"}
    />
  );
}

function RecommendationCard({
  title,
  body,
  href,
  cta,
}: {
  title: string;
  body: string;
  href: string;
  cta: string;
}) {
  return (
    <div className="mt-6 flex flex-col gap-3 rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-medium text-indigo-900">{title}</p>
        <p className="text-sm text-indigo-700">{body}</p>
      </div>
      <Link
        href={href}
        className="shrink-0 rounded-lg bg-indigo-600 px-4 py-2 text-center text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
      >
        {cta}
      </Link>
    </div>
  );
}

const UNIT_ACCENTS = [
  "bg-emerald-500",
  "bg-violet-500",
  "bg-sky-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-slate-400",
];

function UnitSection({
  unit,
  index,
  profile,
}: {
  unit: Unit;
  index: number;
  profile: UserProfile | null;
}) {
  const status = getUnitStatus(unit, profile);
  const lessons = getLessonsForUnit(unit);
  const accent = UNIT_ACCENTS[index % UNIT_ACCENTS.length];
  // Active unit (the next actionable one) opens by default; completed, locked,
  // and coming-soon units start collapsed for a cleaner overview.
  const [open, setOpen] = useState(status === "active");

  return (
    <section>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-start justify-between gap-3 rounded-lg py-1 text-left"
      >
        <span className="flex items-start gap-3">
          <span
            className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${accent}`}
            aria-hidden="true"
          />
          <span className="block">
            <span className="block text-lg font-semibold text-slate-900">{unit.title}</span>
            <span className="block text-sm text-slate-500">{unit.description}</span>
          </span>
        </span>
        <span className="flex shrink-0 items-center gap-2">
          <UnitStatusPill status={status} />
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

      {open &&
        (lessons.length === 0 ? (
          <p className="ml-5 mt-3 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-400">
            Lessons in development.
          </p>
        ) : (
          <ul className="ml-5 mt-3 flex flex-col gap-2 border-l border-slate-100 pl-4">
            {lessons.map((lesson) => (
              <li key={lesson.id}>
                <LessonCard lesson={lesson} profile={profile} />
              </li>
            ))}
          </ul>
        ))}
    </section>
  );
}

function UnitStatusPill({ status }: { status: UnitStatus }) {
  const map: Record<UnitStatus, { label: string; cls: string }> = {
    completed: { label: "Completed", cls: "bg-emerald-100 text-emerald-700" },
    active: { label: "In progress", cls: "bg-indigo-100 text-indigo-700" },
    locked: { label: "Locked", cls: "bg-slate-200 text-slate-500" },
    "coming-soon": { label: "Coming soon", cls: "bg-slate-100 text-slate-400" },
  };
  const { label, cls } = map[status];
  return <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${cls}`}>{label}</span>;
}

function LessonCard({
  lesson,
  profile,
}: {
  lesson: Lesson;
  profile: UserProfile | null;
}) {
  const progress = profile?.progress?.[lesson.id];
  const completed = !!progress?.completed;
  const inProgress = !completed && (progress?.currentStep ?? 0) > 0;
  const unlocked = isLessonUnlocked(lesson.id, profile);

  if (!unlocked) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 opacity-80">
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-slate-600">{lesson.title}</p>
          <p className="truncate text-sm text-slate-400">Finish the previous lesson to unlock.</p>
        </div>
        <span className="shrink-0 rounded-full bg-slate-200 px-3 py-1 text-xs font-medium text-slate-500">
          Locked
        </span>
      </div>
    );
  }

  return (
    <Link
      href={`/lessons/${lesson.id}`}
      className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-4 transition-colors hover:border-indigo-300 hover:bg-indigo-50/40"
    >
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-slate-900">{lesson.title}</p>
        <p className="truncate text-sm text-slate-500">{lesson.description}</p>
      </div>
      <span
        className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${
          completed
            ? "bg-emerald-100 text-emerald-700"
            : inProgress
              ? "bg-amber-100 text-amber-700"
              : "bg-indigo-100 text-indigo-700"
        }`}
      >
        {completed ? "Completed" : inProgress ? "Continue" : "Start"}
      </span>
    </Link>
  );
}
