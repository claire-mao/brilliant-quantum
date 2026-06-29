"use client";

import { useState } from "react";
import type { PredictionOption } from "@/lib/types";
import type { ConceptTag } from "@/lib/learning/concepts";
import { recordConceptResult } from "@/lib/learning/signals";
import { getCorrectHeadline } from "@/lib/learning/progressive-feedback";
import MathText from "./MathText";
import ProgressiveFeedbackPanel from "./ProgressiveFeedbackPanel";

/**
 * Worked example: shows expert reasoning step by step, then hides the final
 * step and asks the learner to complete it with retrieval-first wrong feedback.
 */
export default function WorkedExample({
  intro,
  steps,
  finalPrompt,
  options,
  teaching,
  conceptTag,
  onCanAdvanceChange,
  onAttempt,
}: {
  intro: string;
  steps: string[];
  finalPrompt: string;
  options: PredictionOption[];
  teaching?: string;
  conceptTag?: ConceptTag | null;
  onCanAdvanceChange: (canAdvance: boolean) => void;
  onAttempt: () => void;
}) {
  const [picked, setPicked] = useState<string | null>(null);
  const [solved, setSolved] = useState(false);
  const [wrongCount, setWrongCount] = useState(0);
  const [showExplanationRequested, setShowExplanationRequested] = useState(false);
  const selected = options.find((o) => o.id === picked) ?? null;
  const correctOption = options.find((o) => o.correct) ?? null;

  function choose(id: string) {
    if (solved) return;
    const option = options.find((o) => o.id === id);
    if (!option) return;
    setPicked(id);
    setShowExplanationRequested(false);
    onAttempt();
    if (option.correct) {
      setSolved(true);
      onCanAdvanceChange(true);
      if (conceptTag) recordConceptResult(conceptTag, true);
    } else {
      onCanAdvanceChange(false);
      setWrongCount((c) => c + 1);
      if (conceptTag) recordConceptResult(conceptTag, false, { misconception: option.feedback });
    }
  }

  const wrong = !!selected && !selected.correct && !solved;
  const fullExplanation = correctOption?.feedback || teaching;

  return (
    <div className="mt-3">
      <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">Worked example</p>
        <p className="mt-2 max-w-prose text-base leading-7 text-slate-800">
          <MathText>{intro}</MathText>
        </p>

        <ol className="mt-4 flex flex-col gap-2">
          {steps.map((s, i) => (
            <li key={i} className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
                {i + 1}
              </span>
              <span className="text-sm leading-6 text-slate-700">
                <MathText>{s}</MathText>
              </span>
            </li>
          ))}
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-dashed border-indigo-400 text-xs font-bold text-indigo-600">
              {steps.length + 1}
            </span>
            <span className="text-sm font-medium leading-6 text-indigo-900">Your turn to finish.</span>
          </li>
        </ol>
      </div>

      <p className="mt-5 max-w-prose text-base leading-7 text-slate-700">
        <MathText>{finalPrompt}</MathText>
      </p>

      <div className="mt-3 flex flex-col gap-3">
        {options.map((option) => {
          const isSelected = option.id === picked;
          let tone = "border-slate-200 bg-white hover:border-indigo-300";
          if (isSelected) {
            tone = option.correct ? "border-emerald-400 bg-emerald-50" : "border-amber-400 bg-amber-50";
          }
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => choose(option.id)}
              disabled={solved}
              aria-pressed={isSelected}
              className={`rounded-xl border px-4 py-3 text-left text-base font-medium text-slate-800 transition-colors disabled:cursor-default ${tone}`}
            >
              <MathText>{option.label}</MathText>
            </button>
          );
        })}
      </div>

      {selected && selected.correct && (
        <ProgressiveFeedbackPanel
          isCorrect
          wrongCount={wrongCount}
          showExplanationRequested={showExplanationRequested}
          onRequestExplanation={() => setShowExplanationRequested(true)}
          questionContext={{ conceptTag, fullExplanation, correctAnswerLabel: correctOption?.label }}
          correctHeadline={getCorrectHeadline(wrongCount)}
          correctExplanation={selected.feedback}
        />
      )}
      {wrong && (
        <ProgressiveFeedbackPanel
          isCorrect={false}
          wrongCount={wrongCount}
          showExplanationRequested={showExplanationRequested}
          onRequestExplanation={() => setShowExplanationRequested(true)}
          questionContext={{ conceptTag, fullExplanation, correctAnswerLabel: correctOption?.label }}
        />
      )}
      {solved && teaching && (
        <p className="mt-3 max-w-prose text-sm leading-6 text-slate-600">
          <MathText>{teaching}</MathText>
        </p>
      )}
    </div>
  );
}
