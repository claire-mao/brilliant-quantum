"use client";

import Link from "next/link";
import RouteGuard from "@/components/RouteGuard";
import NavBar from "@/components/NavBar";
import Badge from "@/components/Badge";
import { useAuth } from "@/lib/auth-context";
import { quantumBasicsCourse, isLessonUnlocked } from "@/content/lessons";
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

  const earnedBadges = course.lessons
    .map((l) => l.badge)
    .filter(
      (b): b is NonNullable<typeof b> => !!b && !!profile?.badges?.includes(b.id)
    );

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-8">
      <h1 className="text-2xl font-bold tracking-tight text-slate-900">{course.title}</h1>
      <p className="mt-1 text-slate-500">{course.description}</p>

      {(profile?.streak ?? 0) > 0 && (
        <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-3 py-1 text-sm font-medium text-orange-700">
          <span aria-hidden="true">🔥</span> {profile?.streak}-day streak
        </p>
      )}

      {earnedBadges.length > 0 && (
        <div className="mt-5 flex flex-col gap-2">
          {earnedBadges.map((b) => (
            <Badge key={b.id} title={b.title} subtitle={b.subtitle} />
          ))}
        </div>
      )}

      <ul className="mt-6 flex flex-col gap-3">
        {course.lessons.map((lesson) => (
          <li key={lesson.id}>
            <LessonCard lesson={lesson} profile={profile} />
          </li>
        ))}
      </ul>

      <Recommendation profile={profile} />
    </main>
  );
}

function Recommendation({ profile }: { profile: UserProfile | null }) {
  const lessons = quantumBasicsCourse.lessons;
  // Lessons are ordered and unlock sequentially, so the first lesson that has
  // content and isn't completed is always the right next step to recommend.
  const nextLesson = lessons.find(
    (l) => l.steps.length > 0 && !profile?.progress?.[l.id]?.completed
  );

  if (!nextLesson) {
    return (
      <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
        <p className="text-sm font-medium text-slate-700">Next unit coming soon</p>
        <p className="text-sm text-slate-500">
          You&apos;ve completed every lesson available. More quantum adventures are on the way.
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
      <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 opacity-80">
        <div>
          <p className="font-semibold text-slate-600">{lesson.title}</p>
          <p className="text-sm text-slate-400">Finish the previous lesson to unlock.</p>
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
