"use client";

import { useState } from "react";
import {
  applyOps,
  basisKetLatex,
  bitOf,
  collapse,
  initialAmps,
  isEntangled,
  jointStateLatex,
  marginals,
  probabilities,
  sampleCounts,
  sampleIndex,
  type Amps,
  type TwoQubitOp,
} from "@/lib/twoqubit";
import JointMeasurementHistogram from "./JointMeasurementHistogram";
import MathText, { InlineMath } from "./MathText";

const SHOTS = 200;

/**
 * Reusable two-qubit interaction engine. Display two qubits and their joint
 * state, choose an initial basis state, apply single-qubit gates or CNOT,
 * measure one or both qubits (with an animated collapse), or run a histogram.
 * Everything is driven by props so lessons configure rather than fork it.
 */
export default function TwoQubitExplorer({
  teaching,
  onInteracted,
  preset = [],
  allowedGates = ["X", "H", "Z"],
  showCnot = true,
  allowInitialChoice = false,
  lockCircuit = false,
  allowMeasureSingle = true,
  allowMeasureBoth = true,
  allowHistogram = true,
  showMarginals = false,
}: {
  teaching: string;
  onInteracted: () => void;
  preset?: TwoQubitOp[];
  allowedGates?: ("X" | "H" | "Z")[];
  showCnot?: boolean;
  allowInitialChoice?: boolean;
  lockCircuit?: boolean;
  allowMeasureSingle?: boolean;
  allowMeasureBoth?: boolean;
  allowHistogram?: boolean;
  showMarginals?: boolean;
}) {
  const [startIndex, setStartIndex] = useState(0);
  const [seq, setSeq] = useState<TwoQubitOp[]>([]);
  const [collapsed, setCollapsed] = useState<Amps | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [counts, setCounts] = useState<number[] | null>(null);
  const [measureCount, setMeasureCount] = useState(0);

  const ops = [...preset, ...seq];
  const base = applyOps(ops, startIndex);
  const display = collapsed ?? base;
  const probs = probabilities(base);
  const m = marginals(base);
  const entangled = isEntangled(base);

  function touch() {
    onInteracted();
  }
  function clearMeasurement() {
    setCollapsed(null);
    setResult(null);
    setCounts(null);
  }
  function addGate(gate: "X" | "H" | "Z" | "CNOT", qubit: 0 | 1) {
    setSeq((s) => [...s, { gate, qubit }]);
    clearMeasurement();
    touch();
  }
  function chooseStart(i: number) {
    setStartIndex(i);
    setSeq([]);
    clearMeasurement();
    touch();
  }
  function reset() {
    setSeq([]);
    clearMeasurement();
  }
  function measureSingle(qubit: 0 | 1) {
    const idx = sampleIndex(probs);
    const outcome = bitOf(idx, qubit);
    setCollapsed(collapse(base, qubit, outcome));
    setResult(`q${qubit} \\to ${outcome}`);
    setCounts(null);
    setMeasureCount((c) => c + 1);
    touch();
  }
  function measureBoth() {
    const idx = sampleIndex(probs);
    setCollapsed(initialAmps(idx));
    setResult(basisKetLatex(idx));
    setCounts(null);
    setMeasureCount((c) => c + 1);
    touch();
  }
  function runHistogram() {
    setCounts(sampleCounts(probs, SHOTS));
    setCollapsed(null);
    setResult(null);
    touch();
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      {allowInitialChoice && (
        <div className="mb-4">
          <p className="mb-2 text-sm font-medium text-slate-600">Initial state</p>
          <div className="flex flex-wrap gap-2">
            {[0, 1, 2, 3].map((i) => (
              <button
                key={i}
                type="button"
                onClick={() => chooseStart(i)}
                aria-pressed={startIndex === i}
                className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
                  startIndex === i
                    ? "border-indigo-400 bg-indigo-50 text-indigo-700"
                    : "border-slate-300 bg-white text-slate-700 hover:border-indigo-300"
                }`}
              >
                <InlineMath>{basisKetLatex(i)}</InlineMath>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-lg bg-slate-50 p-3">
        <CircuitRow label="q0" preset={preset} seq={seq} qubit={0} />
        <div className="mt-2">
          <CircuitRow label="q1" preset={preset} seq={seq} qubit={1} />
        </div>
      </div>

      <div
        key={measureCount}
        className={`mt-4 rounded-lg border px-4 py-3 text-center transition-all duration-300 ${
          collapsed ? "border-indigo-300 bg-indigo-50" : "border-slate-200 bg-white"
        }`}
      >
        <div className="flex items-center justify-center gap-2">
          <span className="text-xs uppercase tracking-wide text-slate-400">
            {collapsed ? "Collapsed state" : "Joint state"}
          </span>
          {!collapsed && (
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                entangled ? "bg-violet-100 text-violet-700" : "bg-slate-100 text-slate-500"
              }`}
            >
              {entangled ? "entangled" : "separable"}
            </span>
          )}
        </div>
        <p className="mt-1 text-xl">
          <InlineMath>{jointStateLatex(display)}</InlineMath>
        </p>
        {result && (
          <p className="mt-1 text-sm text-indigo-700">
            Measured <InlineMath>{result}</InlineMath>
          </p>
        )}
      </div>

      {showMarginals && (
        <div className="mt-4 grid grid-cols-2 gap-3">
          <Marginal label="q0 measures 1" pct={m.q0} />
          <Marginal label="q1 measures 1" pct={m.q1} />
        </div>
      )}

      {!lockCircuit && (
        <div className="mt-4 flex flex-col gap-2">
          {([0, 1] as const).map((q) => (
            <div key={q} className="flex items-center gap-2">
              <span className="w-8 text-sm font-medium text-slate-500">q{q}</span>
              {allowedGates.map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => addGate(g, q)}
                  className="h-9 w-9 rounded-lg border border-indigo-300 bg-white text-sm font-bold text-indigo-700 transition-colors hover:bg-indigo-50"
                >
                  {g}
                </button>
              ))}
            </div>
          ))}
          {showCnot && (
            <button
              type="button"
              onClick={() => addGate("CNOT", 0)}
              className="h-9 w-fit rounded-lg border border-violet-300 bg-white px-3 text-sm font-semibold text-violet-700 transition-colors hover:bg-violet-50"
            >
              CNOT 0→1
            </button>
          )}
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {allowMeasureSingle && (
          <>
            <MeasureButton onClick={() => measureSingle(0)}>Measure q0</MeasureButton>
            <MeasureButton onClick={() => measureSingle(1)}>Measure q1</MeasureButton>
          </>
        )}
        {allowMeasureBoth && <MeasureButton onClick={measureBoth}>Measure both</MeasureButton>}
        {allowHistogram && (
          <button
            type="button"
            onClick={runHistogram}
            className="h-9 rounded-lg bg-indigo-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
          >
            Run {SHOTS}
          </button>
        )}
        <button
          type="button"
          onClick={reset}
          className="ml-auto h-9 rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
        >
          Reset
        </button>
      </div>

      {counts && (
        <div className="mt-6">
          <JointMeasurementHistogram counts={counts} />
        </div>
      )}

      <p className="mt-4 text-sm leading-6 text-slate-500">
        <MathText>{teaching}</MathText>
      </p>
    </div>
  );
}

function MeasureButton({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="h-9 rounded-lg border border-emerald-300 bg-white px-3 text-sm font-semibold text-emerald-700 transition-colors hover:bg-emerald-50"
    >
      {children}
    </button>
  );
}

function Marginal({ label, pct }: { label: string; pct: number }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2">
      <div className="flex justify-between text-xs text-slate-500">
        <span>{label}</span>
        <span className="tabular-nums">{pct}%</span>
      </div>
      <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-2 rounded-full bg-indigo-500 transition-[width] duration-200"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function CircuitRow({
  label,
  preset,
  seq,
  qubit,
}: {
  label: string;
  preset: TwoQubitOp[];
  seq: TwoQubitOp[];
  qubit: 0 | 1;
}) {
  const items = [
    ...preset.map((op) => ({ op, fromPreset: true })),
    ...seq.map((op) => ({ op, fromPreset: false })),
  ].filter(({ op }) => op.gate === "CNOT" || op.qubit === qubit);

  return (
    <div className="flex items-center gap-2">
      <span className="w-7 font-mono text-xs text-slate-500">{label}</span>
      <div className="flex h-8 flex-1 items-center gap-1.5 border-t border-slate-300">
        {items.map(({ op, fromPreset }, i) => (
          <span
            key={i}
            className={`-mt-3 rounded px-1.5 py-0.5 font-mono text-xs font-semibold ${
              op.gate === "CNOT"
                ? "bg-violet-100 text-violet-700"
                : fromPreset
                  ? "bg-slate-200 text-slate-500"
                  : "bg-indigo-100 text-indigo-700"
            }`}
          >
            {op.gate === "CNOT" ? (qubit === 0 ? "●" : "⊕") : op.gate}
          </span>
        ))}
      </div>
    </div>
  );
}
