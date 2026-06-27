"use client";

import { useState } from "react";
import JointMeasurementHistogram from "./JointMeasurementHistogram";
import MathText from "./MathText";

const SHOTS = 200;

/**
 * Classical correlation sandbox. Two ordinary bits come from either a perfectly
 * correlated source (a shared coin: always 00 or 11) or two independent coins
 * (all four outcomes). The learner flips single pairs or runs many, building the
 * intuition that classical correlation is just shared randomness between two
 * objects that each hold a definite value.
 */

function randBit(): 0 | 1 {
  return Math.random() < 0.5 ? 0 : 1;
}
function samplePair(correlated: boolean): [0 | 1, 0 | 1] {
  if (correlated) {
    const b = randBit();
    return [b, b];
  }
  return [randBit(), randBit()];
}
function sampleClassical(correlated: boolean, n: number): number[] {
  const counts = [0, 0, 0, 0];
  for (let i = 0; i < n; i++) {
    const [a, b] = samplePair(correlated);
    counts[a * 2 + b] += 1;
  }
  return counts;
}

export default function CorrelationVisualizer({
  teaching,
  onInteracted,
}: {
  teaching: string;
  onInteracted: () => void;
}) {
  const [correlated, setCorrelated] = useState(true);
  const [pair, setPair] = useState<[0 | 1, 0 | 1] | null>(null);
  const [counts, setCounts] = useState<number[] | null>(null);

  function setSource(value: boolean) {
    setCorrelated(value);
    setPair(null);
    setCounts(null);
  }
  function flipOne() {
    setPair(samplePair(correlated));
    setCounts(null);
    onInteracted();
  }
  function flipMany() {
    setCounts(sampleClassical(correlated, SHOTS));
    setPair(null);
    onInteracted();
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex flex-wrap gap-2">
        {[
          { v: true, label: "Perfectly correlated" },
          { v: false, label: "Independent" },
        ].map(({ v, label }) => (
          <button
            key={label}
            type="button"
            onClick={() => setSource(v)}
            aria-pressed={correlated === v}
            className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
              correlated === v
                ? "border-indigo-400 bg-indigo-50 text-indigo-700"
                : "border-slate-300 bg-white text-slate-600 hover:border-indigo-300"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-center gap-6">
        <Coin label="Bit A" value={pair?.[0]} />
        <Coin label="Bit B" value={pair?.[1]} />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={flipOne}
          className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
        >
          Flip one pair
        </button>
        <button
          type="button"
          onClick={flipMany}
          className="rounded-lg border border-indigo-300 bg-white px-4 py-2.5 text-sm font-semibold text-indigo-700 transition-colors hover:bg-indigo-50"
        >
          Flip {SHOTS} pairs
        </button>
      </div>

      {counts && (
        <div className="mt-6">
          <JointMeasurementHistogram counts={counts} highlight={correlated ? [0, 3] : undefined} />
        </div>
      )}

      <p className="mt-4 text-sm leading-6 text-slate-500">
        <MathText>{teaching}</MathText>
      </p>
    </div>
  );
}

function Coin({ label, value }: { label: string; value?: 0 | 1 }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={`flex h-14 w-14 items-center justify-center rounded-full border-2 text-xl font-bold tabular-nums ${
          value === undefined
            ? "border-dashed border-slate-300 text-slate-300"
            : "border-indigo-400 bg-indigo-50 text-indigo-700"
        }`}
      >
        {value === undefined ? "?" : value}
      </div>
      <span className="text-xs text-slate-500">{label}</span>
    </div>
  );
}
