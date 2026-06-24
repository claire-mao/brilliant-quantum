"use client";

import { useState } from "react";
import QubitSlider from "./QubitSlider";
import Histogram from "./Histogram";

/**
 * Interactive measurement simulator: set a probability, then measure the qubit
 * many times and watch the histogram fill in. Unlocks advancing after the first
 * run via onMeasured.
 */
export default function MeasurementSimulator({
  defaultProbability,
  sampleSize,
  teaching,
  onMeasured,
}: {
  defaultProbability: number;
  sampleSize: number;
  teaching: string;
  onMeasured: () => void;
}) {
  const [pOne, setPOne] = useState(defaultProbability);
  const [results, setResults] = useState<{ zeros: number; ones: number } | null>(null);

  function measure() {
    let ones = 0;
    for (let i = 0; i < sampleSize; i++) {
      if (Math.random() * 100 < pOne) ones++;
    }
    setResults({ ones, zeros: sampleSize - ones });
    onMeasured();
  }

  return (
    <div>
      <div className="mb-6">
        <QubitSlider value={pOne} onChange={setPOne} />
      </div>

      <button
        type="button"
        onClick={measure}
        className="rounded-lg bg-indigo-600 px-4 py-2.5 text-base font-semibold text-white transition-colors hover:bg-indigo-700"
      >
        {results ? "Measure again" : `Measure ${sampleSize} times`}
      </button>

      {results && (
        <div className="mt-6">
          <Histogram zeros={results.zeros} ones={results.ones} total={sampleSize} />
          <p className="mt-4 text-sm leading-6 text-slate-600">{teaching}</p>
        </div>
      )}
    </div>
  );
}
