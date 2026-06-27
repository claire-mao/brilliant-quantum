"use client";

import { useState } from "react";
import Link from "next/link";
import type { PredictionOption } from "@/lib/types";
import MathText from "./MathText";
import { saveTowerHintContext } from "@/lib/companions/tower-context";
import { recordConceptResult } from "@/lib/learning/signals";
import type { ConceptTag } from "@/lib/learning/concepts";
import WizardHelpPrompt from "./WizardHelpPrompt";

/**
 * Predict-before-explain multiple choice.
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
  const selected = options.find((o) => o.id === selectedId) ?? null;

  function choose(id: string) {
    if (solved) return;
    const option = options.find((o) => o.id === id);
    if (!option) return;
    setSelectedId(id);

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
          correctAnswer: options.find((o) => o.correct)?.label,
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
          correctAnswer: options.find((o) => o.correct)?.label,
          feedback: selected.feedback,
          conceptTag: conceptTag ?? undefined,
        }
      : null;

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

      {selected && (
        <div className="mt-4">
          <p
            className={`rounded-lg px-4 py-3 text-sm leading-6 ${
              graded
                ? selected.correct
                  ? "bg-emerald-50 text-emerald-800"
                  : "bg-amber-50 text-amber-800"
                : "bg-indigo-50 text-indigo-800"
            }`}
          >
            <MathText>{selected.feedback}</MathText>
          </p>
          {wrongSelected && (
            <p className="mt-2 text-sm font-medium text-amber-700">
              Try again — pick another answer. The guide may offer a nudge, or visit the{" "}
              <Link href="/tower" className="text-indigo-600 underline underline-offset-2 hover:text-indigo-700">
                Wizard Tower
              </Link>
              .
            </p>
          )}
          {hintContext && stepKey && (
            <WizardHelpPrompt context={hintContext} wrongCount={wrongCount} stepKey={stepKey} />
          )}
          {(solved || !graded) && teaching && (
            <p className="mt-3 text-sm leading-6 text-slate-600">
              <MathText>{teaching}</MathText>
            </p>
          )}
        </div>
      )}
    </div>
  );
}
