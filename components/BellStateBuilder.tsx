"use client";

import { useState } from "react";
import {
  applyOps,
  BELL_TARGETS,
  isEntangled,
  jointStateLatex,
  matchesBell,
  type BellId,
  type TwoQubitOp,
} from "@/lib/twoqubit";
import MathText, { InlineMath } from "./MathText";

/**
 * Graded Bell-state builder. From |00>, apply H/X/Z/CNOT to reach the requested
 * Bell state; "Check" grades the current state (up to global phase). Built on
 * the shared two-qubit engine so it stays consistent with the explorer.
 */
export default function BellStateBuilder({
  target,
  correctFeedback,
  incorrectFeedback,
  teaching,
  onCanAdvanceChange,
  onAttempt,
}: {
  target: BellId;
  correctFeedback: string;
  incorrectFeedback: string;
  teaching: string;
  onCanAdvanceChange: (value: boolean) => void;
  onAttempt: () => void;
}) {
  const [seq, setSeq] = useState<TwoQubitOp[]>([]);
  const [result, setResult] = useState<"correct" | "incorrect" | null>(null);
  const solved = result === "correct";

  const base = applyOps(seq);
  const entangled = isEntangled(base);

  function addGate(gate: "X" | "H" | "Z" | "CNOT", qubit: 0 | 1) {
    if (solved) return;
    setSeq((s) => [...s, { gate, qubit }]);
    setResult(null);
  }
  function undo() {
    if (solved) return;
    setSeq((s) => s.slice(0, -1));
    setResult(null);
  }
  function reset() {
    if (solved) return;
    setSeq([]);
    setResult(null);
  }
  function check() {
    if (solved) return;
    onAttempt();
    const ok = matchesBell(base, target);
    setResult(ok ? "correct" : "incorrect");
    onCanAdvanceChange(ok);
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-sm text-slate-600">
        Target:{" "}
        <span className="text-base">
          <InlineMath>{BELL_TARGETS[target].latex}</InlineMath>
        </span>
      </p>

      <div className="mt-3 rounded-lg border border-slate-200 bg-white px-4 py-3 text-center">
        <span className="text-xs uppercase tracking-wide text-slate-400">Current state</span>
        <p className="mt-1 text-xl">
          <InlineMath>{jointStateLatex(base)}</InlineMath>
        </p>
        <span
          className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
            entangled ? "bg-violet-100 text-violet-700" : "bg-slate-100 text-slate-500"
          }`}
        >
          {entangled ? "entangled" : "separable"}
        </span>
      </div>

      <div className="mt-4 rounded-lg bg-slate-50 p-2 text-center font-mono text-xs text-slate-600">
        {seq.length === 0
          ? "|00⟩  (apply gates below)"
          : seq.map((op, i) => (
              <span key={i} className="mx-0.5">
                {op.gate === "CNOT" ? "CNOT" : `${op.gate}${op.qubit === 0 ? "₀" : "₁"}`}
                {i < seq.length - 1 ? " ·" : ""}
              </span>
            ))}
      </div>

      <div className="mt-4 flex flex-col gap-2">
        {([0, 1] as const).map((q) => (
          <div key={q} className="flex items-center gap-2">
            <span className="w-8 text-sm font-medium text-slate-500">q{q}</span>
            {(["X", "H", "Z"] as const).map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => addGate(g, q)}
                disabled={solved}
                className="h-9 w-9 rounded-lg border border-indigo-300 bg-white text-sm font-bold text-indigo-700 transition-colors hover:bg-indigo-50 disabled:opacity-50"
              >
                {g}
              </button>
            ))}
          </div>
        ))}
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => addGate("CNOT", 0)}
            disabled={solved}
            className="h-9 rounded-lg border border-violet-300 bg-white px-3 text-sm font-semibold text-violet-700 transition-colors hover:bg-violet-50 disabled:opacity-50"
          >
            CNOT 0→1
          </button>
          <button
            type="button"
            onClick={undo}
            disabled={solved || seq.length === 0}
            className="h-9 rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-50"
          >
            Undo
          </button>
          <button
            type="button"
            onClick={reset}
            disabled={solved || seq.length === 0}
            className="h-9 rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-50"
          >
            Reset
          </button>
        </div>
      </div>

      {!solved && (
        <button
          type="button"
          onClick={check}
          className="mt-5 rounded-lg bg-emerald-600 px-4 py-2.5 text-base font-semibold text-white transition-colors hover:bg-emerald-700"
        >
          Check
        </button>
      )}

      {result && (
        <p
          className={`mt-4 rounded-lg px-4 py-3 text-sm leading-6 ${
            result === "correct" ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-800"
          }`}
        >
          <MathText>{result === "correct" ? correctFeedback : incorrectFeedback}</MathText>
        </p>
      )}
      {result === "incorrect" && (
        <p className="mt-2 text-sm font-medium text-amber-700">
          Try again — adjust the gates and check once more.
        </p>
      )}
      {solved && (
        <p className="mt-3 text-sm leading-6 text-slate-500">
          <MathText>{teaching}</MathText>
        </p>
      )}
    </div>
  );
}
