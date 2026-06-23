"use client";

import Link from "next/link";
import RouteGuard from "@/components/RouteGuard";
import NavBar from "@/components/NavBar";
import Badge from "@/components/Badge";
import { useAuth } from "@/lib/auth-context";
import { quantumBasicsCourse, QUANTUM_BEGINNER_BADGE } from "@/content/lessons";
import type { Lesson, UserProfile } from "@/lib/types";

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

  const lesson1 = course.lessons[0];
  const lesson1Done = !!profile?.progress?.[lesson1.id]?.completed;
  const hasBadge = profile?.badges?.includes(QUANTUM_BEGINNER_BADGE);
  const nextLesson = course.lessons.find((l) => l.locked);

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-8">
      <h1 className="text-2xl font-bold tracking-tight text-slate-900">{course.title}</h1>
      <p className="mt-1 text-slate-500">{course.description}</p>

      {(profile?.streak ?? 0) > 0 && (
        <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-3 py-1 text-sm font-medium text-orange-700">
          <span aria-hidden="true">🔥</span> {profile?.streak}-day streak
        </p>
      )}

      {hasBadge && (
        <div className="mt-5">
          <Badge />
        </div>
      )}

      <ul className="mt-6 flex flex-col gap-3">
        {course.lessons.map((lesson) => (
          <li key={lesson.id}>
            <LessonCard lesson={lesson} profile={profile} />
          </li>
        ))}
      </ul>

      {lesson1Done && nextLesson && (
        <div className="mt-6 rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3">
          <p className="text-sm font-medium text-indigo-900">
            Up next: {nextLesson.title}
          </p>
          <p className="text-sm text-indigo-700">
            Great work finishing Lesson 1! {nextLesson.title} is coming soon.
          </p>
        </div>
      )}
    </main>
  );
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

  if (lesson.locked) {
    return (
      <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 opacity-80">
        <div>
          <p className="font-semibold text-slate-600">{lesson.title}</p>
          <p className="text-sm text-slate-400">{lesson.description}</p>
        </div>
        <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-medium text-slate-500">
          Locked
        </span>
      </div>
    );
  }

  return (
    <Link
      href={`/lessons/${lesson.id}`}
      className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-4 transition-colors hover:border-indigo-300 hover:bg-indigo-50/40"
    >
      <div>
        <p className="font-semibold text-slate-900">{lesson.title}</p>
        <p className="text-sm text-slate-500">{lesson.description}</p>
      </div>
      <span
        className={`rounded-full px-3 py-1 text-xs font-medium ${
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
