"use client";

import { useState } from "react";
import ProbabilityVisual from "./ProbabilityVisual";

/**
 * Measure a single qubit once. Before measuring it shows the uncertain
 * superposition; after measuring it collapses to one concrete result with a
 * lightweight CSS transition. Calls onMeasured() after the first measurement so
 * the lesson player can unlock advancing.
 */
export default function SingleMeasurementSimulator({
  probabilityOfOne,
  teaching,
  onMeasured,
}: {
  probabilityOfOne: number;
  teaching: string;
  onMeasured: () => void;
}) {
  const [result, setResult] = useState<0 | 1 | null>(null);

  function measure() {
    const outcome: 0 | 1 = Math.random() * 100 < probabilityOfOne ? 1 : 0;
    setResult(outcome);
    onMeasured();
  }

  return (
    <div>
      {result === null ? (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <p className="text-center text-sm font-medium text-slate-500">
            Qubit is uncertain
          </p>
          <div className="mt-4">
            <ProbabilityVisual pOne={probabilityOfOne} />
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-6 text-center transition-colors duration-300">
          <p className="text-sm font-medium text-indigo-500">Measured result</p>
          <p className="mt-2 text-6xl font-bold tabular-nums text-indigo-700 transition-transform duration-300">
            {result}
          </p>
          <p className="mt-2 text-sm font-medium text-indigo-600">
            The qubit has collapsed to {result}.
          </p>
        </div>
      )}

      <button
        type="button"
        onClick={measure}
        className="mt-6 rounded-lg bg-indigo-600 px-4 py-2.5 text-base font-semibold text-white transition-colors hover:bg-indigo-700"
      >
        {result === null ? "Measure once" : "Measure again (fresh qubit)"}
      </button>

      {result !== null && (
        <p className="mt-4 text-sm leading-6 text-slate-600">{teaching}</p>
      )}
    </div>
  );
}
