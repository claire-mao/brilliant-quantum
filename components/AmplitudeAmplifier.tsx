"use client";

import { useState } from "react";
import MathText from "./MathText";

/**
 * Grover amplitude amplification, visualized. N answers start with equal
 * amplitude. Each iteration flips the target's phase and reflects all
 * amplitudes about their mean, concentrating probability on the target. Over-
 * iterating sends it back down — the learner discovers there is a best number
 * of iterations. Reuses the inversion-about-the-mean idea from Unit 3.
 */

function uniform(size: number): number[] {
  const a = 1 / Math.sqrt(size);
  return Array.from({ length: size }, () => a);
}

function iterate(amps: number[], target: number): number[] {
  const flipped = amps.map((a, i) => (i === target ? -a : a));
  const mean = flipped.reduce((s, a) => s + a, 0) / flipped.length;
  return flipped.map((a) => 2 * mean - a);
}

export default function AmplitudeAmplifier({
  teaching,
  onInteracted,
  size = 8,
}: {
  teaching: string;
  onInteracted: () => void;
  size?: number;
}) {
  const target = Math.floor(size / 2);
  const [amps, setAmps] = useState<number[]>(() => uniform(size));
  const [iterations, setIterations] = useState(0);

  const probs = amps.map((a) => a * a);
  const targetPct = Math.round(probs[target] * 100);
  const optimal = Math.max(1, Math.round((Math.PI / 4) * Math.sqrt(size)));

  function applyIteration() {
    setAmps((a) => iterate(a, target));
    setIterations((n) => n + 1);
    onInteracted();
  }
  function reset() {
    setAmps(uniform(size));
    setIterations(0);
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-end justify-around gap-1.5">
        {probs.map((p, i) => {
          const pct = Math.round(p * 100);
          const isTarget = i === target;
          return (
            <div key={i} className="flex flex-1 flex-col items-center gap-1">
              <span
                className={`text-xs font-bold tabular-nums ${
                  isTarget ? "text-emerald-700" : "text-slate-400"
                }`}
              >
                {pct}%
              </span>
              <div className="relative flex h-28 w-full max-w-10 items-end overflow-hidden rounded-md bg-slate-100">
                <div
                  className={`w-full rounded-md transition-[height] duration-300 ${
                    isTarget ? "bg-emerald-500" : "bg-indigo-500"
                  }`}
                  style={{ height: `${pct}%` }}
                />
              </div>
              <span className="text-[10px] text-slate-400">{isTarget ? "target" : i + 1}</span>
            </div>
          );
        })}
      </div>

      <p className="mt-4 text-center text-sm text-slate-600">
        Iterations: <span className="font-semibold tabular-nums">{iterations}</span> · Target
        probability: <span className="font-semibold tabular-nums text-emerald-700">{targetPct}%</span>
      </p>
      <p className="mt-1 text-center text-xs text-slate-400">
        For {size} answers, the target peaks after about {optimal} iteration
        {optimal === 1 ? "" : "s"}. Keep going and it falls again.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={applyIteration}
          className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
        >
          Apply Grover iteration
        </button>
        <button
          type="button"
          onClick={reset}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
        >
          Reset
        </button>
      </div>

      <p className="mt-4 text-sm leading-6 text-slate-500">
        <MathText>{teaching}</MathText>
      </p>
    </div>
  );
}
