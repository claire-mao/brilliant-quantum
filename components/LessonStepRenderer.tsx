"use client";

import { useState } from "react";
import type { LessonStep } from "@/lib/types";
import QubitSlider from "./QubitSlider";
import ProbabilityVisual from "./ProbabilityVisual";

/**
 * Renders a single lesson step. Challenges report whether they've been solved
 * (via onSolvedChange) so the parent can enable the Next button. Explanations
 * are always considered solved and are handled by the parent.
 *
 * The parent should pass a `key` of the step id so state resets between steps.
 */
export default function LessonStepRenderer({
  step,
  onSolvedChange,
}: {
  step: LessonStep;
  onSolvedChange: (solved: boolean) => void;
}) {
  if (step.type === "explanation") {
    return <ExplanationView step={step} />;
  }
  return <ChallengeView step={step} onSolvedChange={onSolvedChange} />;
}

function ExplanationView({
  step,
}: {
  step: Extract<LessonStep, { type: "explanation" }>;
}) {
  return (
    <div>
      <h2 className="text-xl font-semibold text-slate-900">{step.title}</h2>
      <p className="mt-3 text-base leading-7 text-slate-700">{step.body}</p>
    </div>
  );
}

function ChallengeView({
  step,
  onSolvedChange,
}: {
  step: Extract<LessonStep, { type: "challenge" }>;
  onSolvedChange: (solved: boolean) => void;
}) {
  const [value, setValue] = useState(50);
  const [result, setResult] = useState<"correct" | "incorrect" | null>(null);

  function check() {
    const passed = Math.abs(value - step.targetProbability) <= step.tolerance;
    setResult(passed ? "correct" : "incorrect");
    onSolvedChange(passed);
  }

  return (
    <div>
      <h2 className="text-xl font-semibold text-slate-900">{step.title}</h2>
      <p className="mt-3 text-base leading-7 text-slate-700">{step.prompt}</p>

      <div className="mt-6">
        <ProbabilityVisual pOne={value} />
      </div>

      <div className="mt-6">
        <QubitSlider value={value} onChange={setValue} />
      </div>

      <button
        type="button"
        onClick={check}
        className="mt-6 rounded-lg bg-indigo-600 px-4 py-2.5 text-base font-semibold text-white transition-colors hover:bg-indigo-700"
      >
        Check answer
      </button>

      {result && (
        <p
          className={`mt-4 rounded-lg px-4 py-3 text-sm leading-6 ${
            result === "correct"
              ? "bg-emerald-50 text-emerald-800"
              : "bg-amber-50 text-amber-800"
          }`}
        >
          {result === "correct" ? step.correctFeedback : step.incorrectFeedback}
        </p>
      )}
    </div>
  );
}
