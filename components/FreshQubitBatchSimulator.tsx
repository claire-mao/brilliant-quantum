"use client";

import { useState } from "react";
import MathText from "./MathText";

/**
 * Measure a small batch of freshly prepared qubits. Each run re-randomizes the
 * sequence and shows the results as colored chips plus counts of 0s and 1s.
 * Calls onRun() after the first run so the lesson player can unlock advancing.
 */
export default function FreshQubitBatchSimulator({
  probabilityOfOne,
  sampleSize,
  prompt,
  teaching,
  onRun,
}: {
  probabilityOfOne: number;
  sampleSize: number;
  prompt: string;
  teaching: string;
  onRun: () => void;
}) {
  const [results, setResults] = useState<(0 | 1)[] | null>(null);

  function run() {
    const next: (0 | 1)[] = Array.from({ length: sampleSize }, () =>
      Math.random() * 100 < probabilityOfOne ? 1 : 0
    );
    setResults(next);
    onRun();
  }

  const ones = results?.filter((r) => r === 1).length ?? 0;
  const zeros = results ? results.length - ones : 0;

  return (
    <div>
      <button
        type="button"
        onClick={run}
        className="rounded-lg bg-indigo-600 px-4 py-2.5 text-base font-semibold text-white transition-colors hover:bg-indigo-700"
      >
        {results ? "Measure again" : `Measure ${sampleSize} fresh qubits`}
      </button>

      {results && (
        <div className="mt-6">
          <div className="flex flex-wrap gap-2">
            {results.map((r, i) => (
              <span
                key={i}
                className={`flex h-9 w-9 items-center justify-center rounded-lg text-base font-bold tabular-nums ${
                  r === 1
                    ? "bg-indigo-100 text-indigo-700"
                    : "bg-sky-100 text-sky-700"
                }`}
              >
                {r}
              </span>
            ))}
          </div>

          <div className="mt-4 flex gap-3 text-sm">
            <span className="rounded-lg bg-sky-50 px-3 py-2 text-sky-700">
              Measured 0: <span className="font-semibold tabular-nums">{zeros}</span>
            </span>
            <span className="rounded-lg bg-indigo-50 px-3 py-2 text-indigo-700">
              Measured 1: <span className="font-semibold tabular-nums">{ones}</span>
            </span>
          </div>

          <p className="mt-4 text-base font-medium text-slate-700">
            <MathText>{prompt}</MathText>
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            <MathText>{teaching}</MathText>
          </p>
        </div>
      )}
    </div>
  );
}
