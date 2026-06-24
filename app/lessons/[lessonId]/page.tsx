"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import RouteGuard from "@/components/RouteGuard";
import NavBar from "@/components/NavBar";
import Badge from "@/components/Badge";
import LessonStepRenderer from "@/components/LessonStepRenderer";
import { useAuth } from "@/lib/auth-context";
import {
  getLesson,
  getNextLesson,
  isLessonUnlocked,
  QUANTUM_BEGINNER_BADGE,
} from "@/content/lessons";
import { saveLessonStep, completeLesson } from "@/lib/progress";
import type { Lesson, LessonStep } from "@/lib/types";

export default function LessonPage() {
  return (
    <RouteGuard>
      <NavBar />
      <LessonPlayer />
    </RouteGuard>
  );
}

/** Steps the learner can move past without a graded answer. */
function defaultCanAdvance(step: LessonStep | undefined): boolean {
  if (!step) return false;
  return (
    step.type === "explanation" ||
    step.type === "informative" ||
    step.type === "playground" ||
    step.type === "reflection" ||
    (step.type === "wave-explorer" && !step.interactive)
  );
}

function resumeIndex(lesson: Lesson, savedStep: number | undefined): number {
  if (!savedStep || savedStep <= 0) return 0;
  return Math.min(savedStep, lesson.steps.length - 1);
}

function LessonPlayer() {
  const params = useParams<{ lessonId: string }>();
  const lessonId = params.lessonId;
  const { user, profile, refreshProfile } = useAuth();

  const lesson = useMemo(() => getLesson(lessonId), [lessonId]);

  const savedProgress = profile?.progress?.[lessonId];

  // Initialize from saved progress once (profile is available by the time
  // RouteGuard renders this), avoiding setState-in-effect.
  const [mode, setMode] = useState<"lesson" | "complete">(() =>
    savedProgress?.completed ? "complete" : "lesson"
  );
  const [stepIndex, setStepIndex] = useState(() =>
    lesson ? resumeIndex(lesson, savedProgress?.currentStep) : 0
  );
  const [canAdvance, setCanAdvance] = useState(() =>
    lesson ? defaultCanAdvance(lesson.steps[resumeIndex(lesson, savedProgress?.currentStep)]) : false
  );
  const [saving, setSaving] = useState(false);
  // Total tries across all graded steps in the current run.
  const gradedAttempts = useRef(0);

  const handleCanAdvanceChange = useCallback((value: boolean) => {
    setCanAdvance(value);
  }, []);
  const handleGradedAttempt = useCallback(() => {
    gradedAttempts.current += 1;
  }, []);

  if (!lesson || lesson.steps.length === 0 || !isLessonUnlocked(lessonId, profile)) {
    return (
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
        <p className="text-slate-600">This lesson isn&apos;t available yet.</p>
        <p className="mt-1 text-sm text-slate-400">
          Finish the previous lesson to unlock it.
        </p>
        <Link
          href="/dashboard"
          className="mt-4 inline-block font-medium text-indigo-600 hover:underline"
        >
          Back to dashboard
        </Link>
      </main>
    );
  }

  const steps = lesson.steps;
  const totalSteps = steps.length;
  const lessonBadgeId = lesson.badge?.id ?? QUANTUM_BEGINNER_BADGE;

  function startRun() {
    gradedAttempts.current = 0;
    setStepIndex(0);
    setCanAdvance(defaultCanAdvance(steps[0]));
    setMode("lesson");
    if (user) void saveLessonStep(user.uid, lessonId, 0);
  }

  if (mode === "complete") {
    return <CompletionView lesson={lesson} onRestart={startRun} />;
  }

  const step = steps[stepIndex];
  const isLast = stepIndex === totalSteps - 1;

  async function handleNext() {
    if (!user || saving || !canAdvance) return;
    setSaving(true);
    try {
      if (isLast) {
        await completeLesson(
          user.uid,
          lessonId,
          totalSteps,
          lessonBadgeId,
          gradedAttempts.current
        );
        await refreshProfile();
        setMode("complete");
      } else {
        const next = stepIndex + 1;
        setStepIndex(next);
        setCanAdvance(defaultCanAdvance(steps[next]));
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
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={startRun}
            className="text-slate-400 hover:text-slate-700 hover:underline"
          >
            Restart
          </button>
          <span className="tabular-nums">
            Step {stepIndex + 1} of {totalSteps}
          </span>
        </div>
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
          onCanAdvanceChange={handleCanAdvanceChange}
          onGradedAttempt={handleGradedAttempt}
        />
      </div>

      <div className="mt-10">
        <button
          type="button"
          onClick={handleNext}
          disabled={!canAdvance || saving}
          className="w-full rounded-lg bg-indigo-600 px-4 py-3 text-base font-semibold text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        >
          {saving ? "Saving..." : isLast ? "Finish lesson" : "Next"}
        </button>
        {!canAdvance && (
          <p className="mt-2 text-sm text-slate-400">{advanceHint(step)}</p>
        )}
      </div>
    </main>
  );
}

function advanceHint(step: LessonStep): string {
  switch (step.type) {
    case "bit-explorer":
    case "prediction":
    case "collapse-check":
      return "Choose the correct answer to continue.";
    case "simulation":
      return "Run a measurement to continue.";
    case "single-measurement":
      return "Measure the qubit to continue.";
    case "fresh-batch":
      return "Run the measurements to continue.";
    case "gate-playground":
      return "Apply a gate to continue.";
    case "gate-sequence":
      return "Build the 50/50 qubit to continue.";
    case "circuit-prediction":
      return "Choose the correct answer to continue.";
    case "circuit-builder":
      return "Build the circuit to continue.";
    case "circuit-playback":
      return "Play the circuit to continue.";
    case "wave-explorer":
      return "Drag the sliders to continue.";
    case "path-amplitudes":
      return step.mode === "experiment"
        ? "Experiment with the paths to continue."
        : "Build the target to continue.";
    case "interference-sim":
      return "Run both experiments to continue.";
    case "challenge":
      return "Submit the correct probability to continue.";
    default:
      return "";
  }
}

function CompletionView({
  lesson,
  onRestart,
}: {
  lesson: Lesson;
  onRestart: () => void;
}) {
  const { profile } = useAuth();
  const nextLesson = getNextLesson(lesson.id);
  const progress = profile?.progress?.[lesson.id];
  const attempts = progress?.attempts ?? 1;
  const best = progress?.bestChallengeAttempts;
  const nextUnlocked =
    !!nextLesson &&
    nextLesson.steps.length > 0 &&
    isLessonUnlocked(nextLesson.id, profile);

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-12 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-3xl">
        <span aria-hidden="true">🎉</span>
      </div>
      <h1 className="mt-4 text-2xl font-bold text-slate-900">Lesson complete!</h1>
      <p className="mt-2 text-slate-600">You finished {lesson.title}.</p>

      {lesson.badge && (
        <div className="mt-6 flex justify-center">
          <Badge title={lesson.badge.title} subtitle={lesson.badge.subtitle} />
        </div>
      )}

      <div className="mt-6 flex justify-center gap-3 text-sm">
        <span className="rounded-lg bg-slate-100 px-3 py-2 text-slate-700">
          Times completed: <span className="font-semibold tabular-nums">{attempts}</span>
        </span>
        {typeof best === "number" && (
          <span className="rounded-lg bg-slate-100 px-3 py-2 text-slate-700">
            Best run: <span className="font-semibold tabular-nums">{best}</span>{" "}
            {best === 1 ? "try" : "tries"}
          </span>
        )}
      </div>

      {nextLesson && (
        <div className="mt-6 rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-left">
          <p className="text-sm font-medium text-indigo-900">Up next: {nextLesson.title}</p>
          <p className="text-sm text-indigo-700">
            {nextUnlocked ? nextLesson.description : `${nextLesson.description} (coming soon)`}
          </p>
        </div>
      )}

      <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
        {nextUnlocked && nextLesson && (
          <Link
            href={`/lessons/${nextLesson.id}`}
            className="w-full rounded-lg bg-indigo-600 px-5 py-2.5 text-base font-semibold text-white transition-colors hover:bg-indigo-700 sm:w-auto"
          >
            Start {nextLesson.title}
          </Link>
        )}
        <button
          type="button"
          onClick={onRestart}
          className={`w-full rounded-lg px-5 py-2.5 text-base font-semibold transition-colors sm:w-auto ${
            nextUnlocked
              ? "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
              : "bg-indigo-600 text-white hover:bg-indigo-700"
          }`}
        >
          Restart lesson
        </button>
        <Link
          href="/dashboard"
          className="w-full rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-base font-semibold text-slate-700 transition-colors hover:bg-slate-50 sm:w-auto"
        >
          Back to course
        </Link>
      </div>
    </main>
  );
}
