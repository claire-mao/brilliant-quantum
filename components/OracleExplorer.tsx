"use client";

import { useState } from "react";
import MathText from "./MathText";

/**
 * Deutsch-Jozsa intuition engine. A hidden function on 3 input bits is either
 * constant (same output everywhere) or balanced (half 0s, half 1s). Classically
 * the learner must query inputs one at a time to be sure; the "quantum
 * experiment" settles it in a single shot. No oracle formalism — just the gap
 * between many classical checks and one interference experiment.
 */

type FuncId = "const0" | "const1" | "balHalf" | "balAlt";
const N = 8;

const FUNC_BUTTONS: { key: FuncId; label: string }[] = [
  { key: "const0", label: "Function A" },
  { key: "balHalf", label: "Function B" },
  { key: "const1", label: "Function C" },
  { key: "balAlt", label: "Function D" },
];

function fval(fn: FuncId, x: number): 0 | 1 {
  if (fn === "const0") return 0;
  if (fn === "const1") return 1;
  if (fn === "balHalf") return x < 4 ? 0 : 1;
  return (x % 2) as 0 | 1;
}
function kindOf(fn: FuncId): "constant" | "balanced" {
  return fn === "const0" || fn === "const1" ? "constant" : "balanced";
}

export default function OracleExplorer({
  teaching,
  onInteracted,
}: {
  teaching: string;
  onInteracted: () => void;
}) {
  const [fn, setFn] = useState<FuncId>("const0");
  const [revealed, setRevealed] = useState<Record<number, 0 | 1>>({});
  const [quantum, setQuantum] = useState<"constant" | "balanced" | null>(null);

  const queries = Object.keys(revealed).length;
  const values = Object.values(revealed);
  const has0 = values.includes(0);
  const has1 = values.includes(1);
  let verdict = "Not enough information yet";
  if (has0 && has1) verdict = "Balanced — confirmed";
  else if (queries > N / 2) verdict = "Constant — confirmed";

  function loadFunction(key: FuncId) {
    setFn(key);
    setRevealed({});
    setQuantum(null);
  }
  function query(x: number) {
    setRevealed((r) => (x in r ? r : { ...r, [x]: fval(fn, x) }));
    onInteracted();
  }
  function runQuantum() {
    setQuantum(kindOf(fn));
    onInteracted();
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="mb-2 text-sm font-medium text-slate-600">Load a hidden function</p>
      <div className="flex flex-wrap gap-2">
        {FUNC_BUTTONS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => loadFunction(key)}
            aria-pressed={fn === key}
            className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
              fn === key
                ? "border-indigo-400 bg-indigo-50 text-indigo-700"
                : "border-slate-300 bg-white text-slate-600 hover:border-indigo-300"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-5 rounded-lg border border-slate-200 p-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Classical: query inputs one at a time
        </p>
        <div className="mt-3 grid grid-cols-8 gap-1.5">
          {Array.from({ length: N }, (_, x) => {
            const v = revealed[x];
            return (
              <button
                key={x}
                type="button"
                onClick={() => query(x)}
                className={`flex h-10 flex-col items-center justify-center rounded-md border text-xs transition-colors ${
                  v === undefined
                    ? "border-slate-300 bg-white text-slate-400 hover:border-indigo-300"
                    : "border-indigo-400 bg-indigo-50 font-bold text-indigo-700"
                }`}
              >
                <span className="text-[10px] text-slate-400">x={x}</span>
                <span>{v === undefined ? "?" : v}</span>
              </button>
            );
          })}
        </div>
        <p className="mt-3 text-sm text-slate-600">
          Queries used: <span className="font-semibold tabular-nums">{queries}</span> · Verdict:{" "}
          <span className="font-semibold">{verdict}</span>
        </p>
        <p className="mt-1 text-xs text-slate-400">
          Classically you may need to check more than half the inputs (5 of 8) to be certain.
        </p>
      </div>

      <div className="mt-4 rounded-lg border border-violet-200 bg-violet-50 p-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-violet-700">
          Quantum: one interference experiment
        </p>
        <button
          type="button"
          onClick={runQuantum}
          className="mt-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-violet-700"
        >
          Run quantum experiment (1 query)
        </button>
        {quantum && (
          <p className="mt-3 text-sm text-violet-900">
            Result: <span className="font-semibold">{quantum}</span> — settled in a single experiment,
            no matter how many inputs the function has.
          </p>
        )}
      </div>

      <p className="mt-4 text-sm leading-6 text-slate-500">
        <MathText>{teaching}</MathText>
      </p>
    </div>
  );
}
