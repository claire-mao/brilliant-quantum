"use client";

import { useState } from "react";
import type { PredictionOption } from "@/lib/types";
import MathText from "./MathText";

/**
 * Predict-before-explain multiple choice.
 *
 * - Graded (options include a `correct` one): a wrong pick shows handwritten
 *   feedback and a "Try again" state but keeps Next locked; only the correct
 *   pick unlocks Next and freezes the choices. Every pick counts as an attempt.
 * - Ungraded (no correct option): any pick reveals feedback and unlocks Next.
 */
export default function PredictionChoice({
  options,
  teaching,
  onCanAdvanceChange,
  onAttempt,
}: {
  options: PredictionOption[];
  teaching?: string;
  onCanAdvanceChange: (canAdvance: boolean) => void;
  onAttempt: () => void;
}) {
  const graded = options.some((o) => o.correct);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [solved, setSolved] = useState(false);
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
    } else {
      onCanAdvanceChange(false);
    }
  }

  const wrongSelected = graded && !!selected && !selected.correct && !solved;

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
              Try again - pick another answer.
            </p>
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
