"use client";

import { useState } from "react";
import MathText from "./MathText";

/**
 * Graded sorting task: classify problems by the kind of quantum speedup they
 * get. Reinforces that quantum computers are specialized tools, not universal
 * replacements. Reusable with any problem set; defaults to the Unit 5 examples.
 */

type Category = "exp" | "quad" | "none";

interface Problem {
  id: string;
  label: string;
  answer: Category;
  note: string;
}

const CATEGORIES: { key: Category; label: string }[] = [
  { key: "exp", label: "Exponential" },
  { key: "quad", label: "Quadratic" },
  { key: "none", label: "No advantage" },
];

const DEFAULT_PROBLEMS: Problem[] = [
  {
    id: "factoring",
    label: "Factoring large numbers",
    answer: "exp",
    note: "Shor's algorithm gives an exponential speedup.",
  },
  {
    id: "simulation",
    label: "Simulating quantum systems",
    answer: "exp",
    note: "A natural fit — classically this scales exponentially.",
  },
  {
    id: "search",
    label: "Searching an unsorted list",
    answer: "quad",
    note: "Grover gives a quadratic speedup (about √N), not exponential.",
  },
  {
    id: "optimization",
    label: "General optimization",
    answer: "quad",
    note: "Often a modest (roughly quadratic) speedup, sometimes none.",
  },
  {
    id: "sorting",
    label: "Sorting a list",
    answer: "none",
    note: "No quantum speedup over good classical sorting.",
  },
];

export default function ProblemClassifier({
  teaching,
  onCanAdvanceChange,
  onAttempt,
  problems = DEFAULT_PROBLEMS,
}: {
  teaching: string;
  onCanAdvanceChange: (value: boolean) => void;
  onAttempt: () => void;
  problems?: Problem[];
}) {
  const [picks, setPicks] = useState<Record<string, Category>>({});
  const [checked, setChecked] = useState(false);
  const allAnswered = problems.every((p) => picks[p.id]);
  const allCorrect = problems.every((p) => picks[p.id] === p.answer);

  function choose(id: string, cat: Category) {
    setPicks((p) => ({ ...p, [id]: cat }));
    setChecked(false);
  }
  function check() {
    onAttempt();
    setChecked(true);
    onCanAdvanceChange(problems.every((p) => picks[p.id] === p.answer));
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex flex-col gap-3">
        {problems.map((p) => {
          const pick = picks[p.id];
          const correct = checked && pick === p.answer;
          const wrong = checked && pick && pick !== p.answer;
          return (
            <div
              key={p.id}
              className={`rounded-lg border p-3 ${
                correct ? "border-emerald-300 bg-emerald-50" : wrong ? "border-amber-300 bg-amber-50" : "border-slate-200"
              }`}
            >
              <p className="text-sm font-medium text-slate-800">{p.label}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {CATEGORIES.map((c) => (
                  <button
                    key={c.key}
                    type="button"
                    onClick={() => choose(p.id, c.key)}
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
              {checked && pick && <p className="mt-2 text-xs text-slate-600">{p.note}</p>}
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
      {!allAnswered && (
        <p className="mt-2 text-xs text-slate-400">Classify every problem to check.</p>
      )}
      {checked && (
        <p
          className={`mt-3 rounded-lg px-4 py-3 text-sm leading-6 ${
            allCorrect ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-800"
          }`}
        >
          {allCorrect
            ? "All correct. Quantum speedups are real but selective."
            : "Not all correct yet. Review the highlighted rows and try again."}
        </p>
      )}

      <p className="mt-4 text-sm leading-6 text-slate-500">
        <MathText>{teaching}</MathText>
      </p>
    </div>
  );
}
