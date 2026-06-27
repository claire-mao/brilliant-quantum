"use client";

import { useState } from "react";
import type { PracticeQuestion } from "@/lib/ai/validators";
import type { ConceptTag } from "@/lib/learning/concepts";
import { recordConceptResult } from "@/lib/learning/signals";
import MathText from "@/components/MathText";

/**
 * A single, low-stakes retrieval question shown between lessons. Answering
 * records a learning signal (which also schedules spaced review) but never
 * gates progress — retrieval practice, not a graded checkpoint.
 */
export default function RetrievalPrompt({
  question,
  conceptTag,
  heading,
  onAnswered,
}: {
  question: PracticeQuestion;
  conceptTag: ConceptTag;
  heading: string;
  onAnswered?: (correct: boolean) => void;
}) {
  const [picked, setPicked] = useState<string | null>(null);
  const answered = picked !== null;
  const correct = answered && picked === question.correctChoiceId;

  function choose(id: string) {
    if (answered) return;
    setPicked(id);
    const isCorrect = id === question.correctChoiceId;
    recordConceptResult(conceptTag, isCorrect, {
      misconception: isCorrect ? undefined : question.misconception,
    });
    onAnswered?.(isCorrect);
  }

  return (
    <div className="rounded-xl border border-indigo-200 bg-indigo-50/60 p-4 text-left">
      <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">{heading}</p>
      <p className="mt-2 text-sm leading-6 text-slate-800">
        <MathText>{question.prompt}</MathText>
      </p>

      <div className="mt-3 flex flex-col gap-2">
        {question.choices.map((choice) => {
          const isPicked = picked === choice.id;
          const isCorrect = choice.id === question.correctChoiceId;
          let tone = "border-slate-200 bg-white hover:border-indigo-300";
          if (answered && isCorrect) tone = "border-emerald-400 bg-emerald-50";
          else if (answered && isPicked) tone = "border-amber-400 bg-amber-50";
          return (
            <button
              key={choice.id}
              type="button"
              onClick={() => choose(choice.id)}
              disabled={answered}
              className={`rounded-lg border px-3 py-2 text-left text-sm text-slate-800 transition-colors disabled:cursor-default ${tone}`}
            >
              <MathText>{choice.label}</MathText>
            </button>
          );
        })}
      </div>

      {answered && (
        <div className="mt-3 rounded-lg bg-white px-3 py-2 text-sm leading-6 text-slate-700">
          <p className="font-medium text-slate-900">{correct ? "Remembered it." : "Worth another look."}</p>
          <p className="mt-1">
            <MathText>{question.explanation}</MathText>
          </p>
        </div>
      )}
    </div>
  );
}
