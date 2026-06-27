"use client";

import { useState } from "react";
import type { ClassifierCategory, ClassifierItem } from "@/lib/types";
import MathText from "./MathText";

/**
 * Generic graded classifier: assign each item to one of several categories,
 * then check. Fully prop-driven, so it works for matching applications to
 * quantum fit, scenarios to hardware platforms, traits to technologies, etc.
 */

export default function ApplicationClassifier({
  categories,
  items,
  teaching,
  onCanAdvanceChange,
  onAttempt,
}: {
  categories: ClassifierCategory[];
  items: ClassifierItem[];
  teaching: string;
  onCanAdvanceChange: (value: boolean) => void;
  onAttempt: () => void;
}) {
  const [picks, setPicks] = useState<Record<string, string>>({});
  const [checked, setChecked] = useState(false);
  const allAnswered = items.every((it) => picks[it.id]);
  const allCorrect = items.every((it) => picks[it.id] === it.answer);

  function choose(id: string, cat: string) {
    setPicks((p) => ({ ...p, [id]: cat }));
    setChecked(false);
  }
  function check() {
    onAttempt();
    setChecked(true);
    onCanAdvanceChange(items.every((it) => picks[it.id] === it.answer));
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex flex-col gap-3">
        {items.map((it) => {
          const pick = picks[it.id];
          const correct = checked && pick === it.answer;
          const wrong = checked && pick && pick !== it.answer;
          return (
            <div
              key={it.id}
              className={`rounded-lg border p-3 ${
                correct
                  ? "border-emerald-300 bg-emerald-50"
                  : wrong
                    ? "border-amber-300 bg-amber-50"
                    : "border-slate-200"
              }`}
            >
              <p className="text-sm font-medium text-slate-800">{it.label}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {categories.map((c) => (
                  <button
                    key={c.key}
                    type="button"
                    onClick={() => choose(it.id, c.key)}
                    aria-pressed={pick === c.key}
                    className={`rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors ${
                      pick === c.key
                        ? "border-indigo-400 bg-indigo-50 text-indigo-700"
                        : "border-slate-300 bg-white text-slate-600 hover:border-indigo-300"
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
              {checked && pick && <p className="mt-2 text-xs text-slate-600">{it.note}</p>}
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={check}
        disabled={!allAnswered}
        className="mt-4 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
      >
        Check answers
      </button>
      {!allAnswered && <p className="mt-2 text-xs text-slate-400">Classify every item to check.</p>}
      {checked && (
        <p
          className={`mt-3 rounded-lg px-4 py-3 text-sm leading-6 ${
            allCorrect ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-800"
          }`}
        >
          {allCorrect
            ? "All correct."
            : "Not all correct yet — review the highlighted rows and try again."}
        </p>
      )}

      <p className="mt-4 text-sm leading-6 text-slate-500">
        <MathText>{teaching}</MathText>
      </p>
    </div>
  );
}
