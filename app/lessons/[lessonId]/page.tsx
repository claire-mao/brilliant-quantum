"use client";

import { useMemo, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import RouteGuard from "@/components/RouteGuard";
import NavBar from "@/components/NavBar";
import Badge from "@/components/Badge";
import LessonStepRenderer from "@/components/LessonStepRenderer";
import { useAuth } from "@/lib/auth-context";
import { getLesson, getNextLesson, QUANTUM_BEGINNER_BADGE } from "@/content/lessons";
import { saveLessonStep, completeLesson } from "@/lib/progress";

export default function LessonPage() {
  return (
    <RouteGuard>
      <NavBar />
      <LessonPlayer />
    </RouteGuard>
  );
}

function resumeIndex(
  lesson: ReturnType<typeof getLesson>,
  savedStep: number | undefined
): number {
  if (!lesson || !savedStep || savedStep <= 0) return 0;
  return Math.min(savedStep, lesson.steps.length - 1);
}

function LessonPlayer() {
  const params = useParams<{ lessonId: string }>();
  const lessonId = params.lessonId;
  const { user, profile, refreshProfile } = useAuth();

  const lesson = useMemo(() => getLesson(lessonId), [lessonId]);

  // Initialize from saved progress once (profile is available by the time
  // RouteGuard renders this component), avoiding setState-in-effect.
  const [stepIndex, setStepIndex] = useState(() =>
    resumeIndex(lesson, profile?.progress?.[lessonId]?.currentStep)
  );
  const [finished, setFinished] = useState(
    () => !!profile?.progress?.[lessonId]?.completed
  );
  const [solved, setSolved] = useState(() => {
    if (!lesson || lesson.steps.length === 0) return false;
    const idx = resumeIndex(lesson, profile?.progress?.[lessonId]?.currentStep);
    return lesson.steps[idx]?.type === "explanation";
  });
  const [saving, setSaving] = useState(false);

  const handleSolvedChange = useCallback((value: boolean) => {
    setSolved(value);
  }, []);

  if (!lesson || lesson.locked || lesson.steps.length === 0) {
    return (
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
        <p className="text-slate-600">This lesson isn&apos;t available yet.</p>
        <Link href="/dashboard" className="mt-4 inline-block font-medium text-indigo-600 hover:underline">
          Back to dashboard
        </Link>
      </main>
    );
  }

  if (finished) {
    return <CompletionView lessonId={lessonId} />;
  }

  const steps = lesson.steps;
  const totalSteps = steps.length;
  const step = steps[stepIndex];
  const isLast = stepIndex === totalSteps - 1;

  async function handleNext() {
    if (!user || saving) return;
    setSaving(true);
    try {
      if (isLast) {
        await completeLesson(user.uid, lessonId, totalSteps, QUANTUM_BEGINNER_BADGE);
        await refreshProfile();
        setFinished(true);
      } else {
        const next = stepIndex + 1;
        setStepIndex(next);
        setSolved(steps[next].type === "explanation");
        await saveLessonStep(user.uid, lessonId, next);
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-8">
      <div className="flex items-center justify-between text-sm text-slate-500">
        <Link href="/dashboard" className="hover:underline">
          ← {lesson.title}
        </Link>
        <span className="tabular-nums">
          Step {stepIndex + 1} of {totalSteps}
        </span>
      </div>

      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-indigo-600 transition-[width] duration-200"
          style={{ width: `${((stepIndex + 1) / totalSteps) * 100}%` }}
        />
      </div>

      <div className="mt-8">
        <LessonStepRenderer
          key={step.id}
          step={step}
          onSolvedChange={handleSolvedChange}
        />
      </div>

      <div className="mt-10">
        <button
          type="button"
          onClick={handleNext}
          disabled={!solved || saving}
          className="w-full rounded-lg bg-indigo-600 px-4 py-3 text-base font-semibold text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        >
          {saving ? "Saving..." : isLast ? "Finish lesson" : "Next"}
        </button>
        {step.type === "challenge" && !solved && (
          <p className="mt-2 text-sm text-slate-400">
            Solve the challenge above to continue.
          </p>
        )}
      </div>
    </main>
  );
}

function CompletionView({ lessonId }: { lessonId: string }) {
  const nextLesson = getNextLesson(lessonId);
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-12 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-3xl">
        <span aria-hidden="true">🎉</span>
      </div>
      <h1 className="mt-4 text-2xl font-bold text-slate-900">Lesson complete!</h1>
      <p className="mt-2 text-slate-600">
        You just learned how a qubit uses superposition. That&apos;s a real quantum
        computing idea.
      </p>

      <div className="mt-6 flex justify-center">
        <Badge />
      </div>

      {nextLesson && (
        <div className="mt-6 rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-left">
          <p className="text-sm font-medium text-indigo-900">Up next: {nextLesson.title}</p>
          <p className="text-sm text-indigo-700">{nextLesson.description} (coming soon)</p>
        </div>
      )}

      <Link
        href="/dashboard"
        className="mt-8 inline-block rounded-lg bg-indigo-600 px-5 py-2.5 text-base font-semibold text-white transition-colors hover:bg-indigo-700"
      >
        Back to course
      </Link>
    </main>
  );
}
