"use client";

import { useState } from "react";
import MathText, { InlineMath } from "./MathText";

/**
 * Several computational paths (answers), each with a signed amplitude. The
 * learner marks a target, flips its phase, then "interferes" (reflects every
 * amplitude about their mean). The target amplitude grows while the others
 * cancel — probability is redistributed, not created. Reusable for amplitude
 * amplification demonstrations.
 */

const START = [0.5, 0.5, 0.5, 0.5];
const LABELS = ["A", "B", "C", "D"];

export default function PathAmplitudeDiagram({
  teaching,
  onInteracted,
}: {
  teaching: string;
  onInteracted: () => void;
}) {
  const [amps, setAmps] = useState<number[]>(START);
  const [target, setTarget] = useState(0);

  function flipPhase() {
    setAmps((a) => a.map((x, i) => (i === target ? -x : x)));
    onInteracted();
  }
  function interfere() {
    setAmps((a) => {
      const mean = a.reduce((s, x) => s + x, 0) / a.length;
      return a.map((x) => 2 * mean - x);
    });
    onInteracted();
  }
  function reset() {
    setAmps(START);
  }

  const totalProb = amps.reduce((s, x) => s + x * x, 0);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-end justify-around gap-3">
        {amps.map((a, i) => {
          const probPct = Math.round(a * a * 100);
          const ampHeight = Math.min(50, Math.abs(a) * 50); // % of the 80px half-track
          const isTarget = i === target;
          return (
            <div key={LABELS[i]} className="flex flex-1 flex-col items-center gap-2">
              <span className="text-xs font-semibold tabular-nums text-slate-900">{probPct}%</span>
              {/* probability bar */}
              <div className="relative flex h-24 w-full max-w-12 items-end overflow-hidden rounded-lg bg-indigo-100">
                <div
                  className="w-full rounded-lg bg-indigo-600 transition-[height] duration-300"
                  style={{ height: `${probPct}%` }}
                />
              </div>
              {/* signed amplitude indicator */}
              <div className="relative h-10 w-full max-w-12">
                <div className="absolute left-0 right-0 top-1/2 h-px bg-slate-300" />
                <div
                  className={`absolute left-1/4 w-1/2 rounded ${a >= 0 ? "bottom-1/2 bg-emerald-500" : "top-1/2 bg-rose-500"}`}
                  style={{ height: `${ampHeight}%` }}
                />
              </div>
              <span className="text-xs tabular-nums text-slate-500">{a.toFixed(2)}</span>
              <button
                type="button"
                onClick={() => setTarget(i)}
                aria-pressed={isTarget}
                className={`rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors ${
                  isTarget
                    ? "bg-indigo-600 text-white"
                    : "border border-slate-300 bg-white text-slate-600 hover:border-indigo-300"
                }`}
              >
                {LABELS[i]}
              </button>
            </div>
          );
        })}
      </div>

      <p className="mt-4 text-center text-sm text-slate-500">
        Target: <span className="font-semibold text-slate-700">{LABELS[target]}</span> ·{" "}
        <InlineMath>{`P_i = |a_i|^2`}</InlineMath> · total{" "}
        <span className="tabular-nums">{Math.round(totalProb * 100)}%</span>
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={flipPhase}
          className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
        >
          Flip target phase
        </button>
        <button
          type="button"
          onClick={interfere}
          className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
        >
          Interfere
        </button>
        <button
          type="button"
          onClick={reset}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
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
