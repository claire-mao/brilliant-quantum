"use client";

import { useState } from "react";
import type { PredictionOption } from "@/lib/types";
import MathText from "./MathText";
import { saveTowerHintContext } from "@/lib/companions/tower-context";
import { recordConceptResult } from "@/lib/learning/signals";
import type { ConceptTag } from "@/lib/learning/concepts";
import { getCorrectHeadline } from "@/lib/learning/progressive-feedback";
import ProgressiveFeedbackPanel from "./ProgressiveFeedbackPanel";

/**
 * Predict-before-explain multiple choice with retrieval-first wrong-answer feedback.
 */
export default function PredictionChoice({
  options,
  teaching,
  onCanAdvanceChange,
  onAttempt,
  hintMeta,
  stepKey,
  conceptTag,
}: {
  options: PredictionOption[];
  teaching?: string;
  onCanAdvanceChange: (canAdvance: boolean) => void;
  onAttempt: () => void;
  hintMeta?: { lessonId?: string; lessonTitle?: string; prompt: string };
  stepKey?: string;
  conceptTag?: ConceptTag | null;
}) {
  const graded = options.some((o) => o.correct);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [solved, setSolved] = useState(false);
  const [wrongCount, setWrongCount] = useState(0);
  const [showExplanationRequested, setShowExplanationRequested] = useState(false);
  const selected = options.find((o) => o.id === selectedId) ?? null;
  const correctOption = options.find((o) => o.correct) ?? null;

  function choose(id: string) {
    if (solved) return;
    const option = options.find((o) => o.id === id);
    if (!option) return;
    setSelectedId(id);
    setShowExplanationRequested(false);

    if (!graded) {
      onCanAdvanceChange(true);
      return;
    }

    onAttempt();
    if (option.correct) {
      setSolved(true);
      onCanAdvanceChange(true);
      if (conceptTag) recordConceptResult(conceptTag, true);
    } else {
      onCanAdvanceChange(false);
      setWrongCount((c) => c + 1);
      if (conceptTag) recordConceptResult(conceptTag, false, { misconception: option.feedback });
      if (hintMeta) {
        saveTowerHintContext({
          lessonId: hintMeta.lessonId,
          lessonTitle: hintMeta.lessonTitle,
          prompt: hintMeta.prompt,
          selectedWrong: option.label,
          correctAnswer: correctOption?.label,
          feedback: option.feedback,
        });
      }
    }
  }

  const wrongSelected = graded && !!selected && !selected.correct && !solved;
  const hintContext =
    hintMeta && selected && wrongSelected
      ? {
          lessonId: hintMeta.lessonId,
          lessonTitle: hintMeta.lessonTitle,
          prompt: hintMeta.prompt,
          selectedWrong: selected.label,
          correctAnswer: correctOption?.label,
          feedback: selected.feedback,
          conceptTag: conceptTag ?? undefined,
        }
      : null;

  const fullExplanation =
    correctOption?.feedback || teaching || selected?.feedback || undefined;

  return (
    <div className="mt-5">
      <div className="flex flex-col gap-3">
        {options.map((option) => {
          const isSelected = option.id === selectedId;
          let tone = "border-slate-200 bg-white hover:border-indigo-300";
          if (isSelected) {
            if (graded) {
              tone = option.correct
                ? "border-emerald-400 bg-emerald-50"
                : "border-amber-400 bg-amber-50";
            } else {
              tone = "border-indigo-400 bg-indigo-50";
            }
          }
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => choose(option.id)}
              disabled={solved}
              aria-pressed={isSelected}
              data-lesson-choice
              className={`rounded-xl border px-4 py-3 text-left text-base font-medium text-slate-800 transition-colors disabled:cursor-default ${tone}`}
            >
              <MathText>{option.label}</MathText>
            </button>
          );
        })}
      </div>

      {selected && graded && (
        <>
          {selected.correct || solved ? (
            <ProgressiveFeedbackPanel
              isCorrect
              wrongCount={wrongCount}
              showExplanationRequested={showExplanationRequested}
              onRequestExplanation={() => setShowExplanationRequested(true)}
              questionContext={{
                conceptTag,
                fullExplanation,
                correctAnswerLabel: correctOption?.label,
              }}
              correctHeadline={getCorrectHeadline(wrongCount)}
              correctExplanation={selected.correct ? selected.feedback : fullExplanation}
              stepKey={stepKey}
            />
          ) : (
            wrongSelected && (
              <ProgressiveFeedbackPanel
                isCorrect={false}
                wrongCount={wrongCount}
                showExplanationRequested={showExplanationRequested}
                onRequestExplanation={() => setShowExplanationRequested(true)}
                questionContext={{
                  conceptTag,
                  fullExplanation,
                  correctAnswerLabel: correctOption?.label,
                }}
                hintContext={hintContext}
                stepKey={stepKey}
              />
            )
          )}
        </>
      )}

      {selected && !graded && (
        <div className="mt-4">
          <p className="rounded-lg bg-indigo-50 px-4 py-3 text-sm leading-6 text-indigo-800">
            <MathText>{selected.feedback}</MathText>
          </p>
        </div>
      )}

      {(solved || !graded) && teaching && (
        <p className="mt-3 text-sm leading-6 text-slate-600">
          <MathText>{teaching}</MathText>
        </p>
      )}
    </div>
  );
}
