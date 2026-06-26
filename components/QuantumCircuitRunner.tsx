"use client";

import { useState } from "react";
import {
  applyOps,
  basisKetLatex,
  jointStateLatex,
  probabilities,
  sampleCounts,
  type TwoQubitOp,
} from "@/lib/twoqubit";
import JointMeasurementHistogram from "./JointMeasurementHistogram";
import MathText, { InlineMath } from "./MathText";

const SHOTS = 200;

/**
 * A two-qubit "program": assemble a gate sequence, run it, and read the output
 * distribution. Reuses the shared two-qubit engine. In free mode any run
 * unlocks advancing; in graded mode (a `goalIndex` is set) the learner must
 * build a circuit whose measured output is the target basis state.
 */
export default function QuantumCircuitRunner({
  teaching,
  onCanAdvanceChange,
  onAttempt,
  allowedGates = ["X", "H", "Z"],
  showCnot = true,
  goalIndex,
  correctFeedback,
  incorrectFeedback,
}: {
  teaching: string;
  onCanAdvanceChange: (value: boolean) => void;
  onAttempt: () => void;
  allowedGates?: ("X" | "H" | "Z")[];
  showCnot?: boolean;
  goalIndex?: number;
  correctFeedback?: string;
  incorrectFeedback?: string;
}) {
  const graded = goalIndex !== undefined;
  const [seq, setSeq] = useState<TwoQubitOp[]>([]);
  const [counts, setCounts] = useState<number[] | null>(null);
  const [result, setResult] = useState<"correct" | "incorrect" | null>(null);
  const solved = result === "correct";

  const base = applyOps(seq);
  const probs = probabilities(base);

  function add(gate: "X" | "H" | "Z" | "CNOT", qubit: 0 | 1) {
    if (solved) return;
    setSeq((s) => [...s, { gate, qubit }]);
    setCounts(null);
    setResult(null);
  }
  function undo() {
    if (solved) return;
    setSeq((s) => s.slice(0, -1));
    setCounts(null);
    setResult(null);
  }
  function reset() {
    if (solved) return;
    setSeq([]);
    setCounts(null);
    setResult(null);
  }
  function run() {
    setCounts(sampleCounts(probs, SHOTS));
    if (graded) {
      onAttempt();
      const ok = probs[goalIndex] > 0.99;
      setResult(ok ? "correct" : "incorrect");
      onCanAdvanceChange(ok);
    } else {
      onCanAdvanceChange(true);
    }
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      {graded && (
        <p className="mb-3 text-sm text-slate-600">
          Target output:{" "}
          <span className="text-base">
            <InlineMath>{basisKetLatex(goalIndex)}</InlineMath>
          </span>
        </p>
      )}

      <div className="rounded-lg bg-slate-50 p-3">
        <CircuitRow label="q0" seq={seq} qubit={0} />
        <div className="mt-2">
          <CircuitRow label="q1" seq={seq} qubit={1} />
        </div>
        {seq.length === 0 && (
          <p className="mt-2 text-center text-xs text-slate-400">Both qubits start at |0⟩. Add gates.</p>
        )}
      </div>

      <div className="mt-3 rounded-lg border border-slate-200 bg-white px-4 py-2 text-center">
        <span className="text-xs uppercase tracking-wide text-slate-400">Output state</span>
        <p className="mt-1 text-lg">
          <InlineMath>{jointStateLatex(base)}</InlineMath>
        </p>
      </div>

      <div className="mt-4 flex flex-col gap-2">
        {([0, 1] as const).map((q) => (
          <div key={q} className="flex items-center gap-2">
            <span className="w-8 text-sm font-medium text-slate-500">q{q}</span>
            {allowedGates.map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => add(g, q)}
                disabled={solved}
                className="h-9 w-9 rounded-lg border border-indigo-300 bg-white text-sm font-bold text-indigo-700 transition-colors hover:bg-indigo-50 disabled:opacity-50"
              >
                {g}
              </button>
            ))}
          </div>
        ))}
        <div className="mt-1 flex flex-wrap items-center gap-2">
          {showCnot && (
            <button
              type="button"
              onClick={() => add("CNOT", 0)}
              disabled={solved}
              className="h-9 rounded-lg border border-violet-300 bg-white px-3 text-sm font-semibold text-violet-700 transition-colors hover:bg-violet-50 disabled:opacity-50"
            >
              CNOT 0→1
            </button>
          )}
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
          <button
            type="button"
            onClick={run}
            className="ml-auto h-9 rounded-lg bg-indigo-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
          >
            {graded ? "Run & check" : `Run ${SHOTS}`}
          </button>
        </div>
      </div>

      {counts && (
        <div className="mt-6">
          <JointMeasurementHistogram counts={counts} />
        </div>
      )}

      {result && (
        <p
          className={`mt-4 rounded-lg px-4 py-3 text-sm leading-6 ${
            result === "correct" ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-800"
          }`}
        >
          <MathText>{result === "correct" ? correctFeedback ?? "" : incorrectFeedback ?? ""}</MathText>
        </p>
      )}

      <p className="mt-4 text-sm leading-6 text-slate-500">
        <MathText>{teaching}</MathText>
      </p>
    </div>
  );
}

function CircuitRow({ label, seq, qubit }: { label: string; seq: TwoQubitOp[]; qubit: 0 | 1 }) {
  const chips = seq.filter((op) => op.gate === "CNOT" || op.qubit === qubit);
  return (
    <div className="flex items-center gap-2">
      <span className="w-7 font-mono text-xs text-slate-500">{label}</span>
      <div className="flex h-8 flex-1 items-center gap-1.5 border-t border-slate-300">
        {chips.map((op, i) => (
          <span
            key={i}
            className={`-mt-3 rounded px-1.5 py-0.5 font-mono text-xs font-semibold ${
              op.gate === "CNOT" ? "bg-violet-100 text-violet-700" : "bg-indigo-100 text-indigo-700"
            }`}
          >
            {op.gate === "CNOT" ? (qubit === 0 ? "●" : "⊕") : op.gate}
          </span>
        ))}
      </div>
    </div>
  );
}
