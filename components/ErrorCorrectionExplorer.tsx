"use client";

import { useState } from "react";
import MathText from "./MathText";

/**
 * Repetition-code intuition for quantum error correction. One logical qubit is
 * encoded across N physical qubits; random bit-flip errors are injected; a
 * majority vote recovers the value when fewer than half flipped. Raising the
 * noise shows the threshold where correction fails. Conveys redundancy without
 * copying (No-Cloning), without stabilizer formalism.
 */

function injectFlips(n: number, noisePct: number): boolean[] {
  return Array.from({ length: n }, () => Math.random() * 100 < noisePct);
}
function runTrials(n: number, noisePct: number, count: number): number {
  let successes = 0;
  for (let t = 0; t < count; t++) {
    const flips = injectFlips(n, noisePct).filter(Boolean).length;
    if (flips <= Math.floor(n / 2)) successes += 1;
  }
  return successes;
}

export default function ErrorCorrectionExplorer({
  teaching,
  onInteracted,
}: {
  teaching: string;
  onInteracted: () => void;
}) {
  const [n, setN] = useState(3);
  const [logical, setLogical] = useState<0 | 1>(0);
  const [noise, setNoise] = useState(15);
  const [flips, setFlips] = useState<boolean[] | null>(null);
  const [trials, setTrials] = useState<{ ok: number; total: number } | null>(null);

  const flipped = flips ? flips.filter(Boolean).length : 0;
  const recovered = flips ? (flipped <= Math.floor(n / 2) ? logical : (1 - logical)) : null;
  const success = recovered === logical;

  function configure(next: { n?: number; logical?: 0 | 1 }) {
    if (next.n !== undefined) setN(next.n);
    if (next.logical !== undefined) setLogical(next.logical);
    setFlips(null);
    setTrials(null);
  }
  function inject() {
    setFlips(injectFlips(n, noise));
    setTrials(null);
    onInteracted();
  }
  function runMany() {
    setTrials({ ok: runTrials(n, noise, 100), total: 100 });
    setFlips(null);
    onInteracted();
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex flex-wrap items-center gap-4">
        <div>
          <p className="mb-1 text-xs font-medium text-slate-500">Logical qubit</p>
          <div className="flex gap-1">
            {([0, 1] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => configure({ logical: v })}
                aria-pressed={logical === v}
                className={`h-8 w-10 rounded-lg border text-sm font-bold tabular-nums transition-colors ${
                  logical === v
                    ? "border-indigo-400 bg-indigo-50 text-indigo-700"
                    : "border-slate-300 bg-white text-slate-600 hover:border-indigo-300"
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-1 text-xs font-medium text-slate-500">Physical qubits</p>
          <div className="flex gap-1">
            {[3, 5].map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => configure({ n: v })}
                aria-pressed={n === v}
                className={`h-8 w-10 rounded-lg border text-sm font-bold tabular-nums transition-colors ${
                  n === v
                    ? "border-indigo-400 bg-indigo-50 text-indigo-700"
                    : "border-slate-300 bg-white text-slate-600 hover:border-indigo-300"
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {Array.from({ length: n }, (_, i) => {
          const isFlipped = flips?.[i] ?? false;
          const shown = flips ? (isFlipped ? 1 - logical : logical) : logical;
          return (
            <div
              key={i}
              className={`flex h-11 w-11 items-center justify-center rounded-lg border-2 text-lg font-bold tabular-nums ${
                isFlipped
                  ? "border-rose-400 bg-rose-50 text-rose-600"
                  : "border-slate-300 bg-white text-slate-600"
              }`}
            >
              {shown}
            </div>
          );
        })}
      </div>

      {flips && (
        <div
          className={`mt-3 rounded-lg px-4 py-2 text-center text-sm ${
            success ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-800"
          }`}
        >
          {flipped} of {n} flipped · majority vote →{" "}
          <span className="font-semibold">{recovered}</span> ·{" "}
          {success ? "recovered" : "recovery failed"}
        </div>
      )}
      {trials && (
        <p className="mt-3 text-center text-sm text-slate-600">
          Recovered correctly in{" "}
          <span className="font-semibold tabular-nums">{trials.ok}</span> of {trials.total} trials.
        </p>
      )}

      <label className="mt-4 block text-sm font-medium text-slate-700">
        <span className="flex justify-between">
          <span>Per-qubit error rate</span>
          <span className="tabular-nums text-slate-500">{noise}%</span>
        </span>
        <input
          type="range"
          min={0}
          max={100}
          value={noise}
          onChange={(e) => {
            setNoise(Number(e.target.value));
            setFlips(null);
            setTrials(null);
          }}
          className="mt-1 w-full accent-indigo-600"
        />
      </label>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={inject}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
        >
          Inject errors &amp; recover
        </button>
        <button
          type="button"
          onClick={runMany}
          className="rounded-lg border border-indigo-300 bg-white px-4 py-2 text-sm font-semibold text-indigo-700 transition-colors hover:bg-indigo-50"
        >
          Run 100 trials
        </button>
      </div>

      <p className="mt-4 text-sm leading-6 text-slate-500">
        <MathText>{teaching}</MathText>
      </p>
    </div>
  );
}
