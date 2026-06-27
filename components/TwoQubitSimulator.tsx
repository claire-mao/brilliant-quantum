"use client";

import { useState } from "react";
import MathText from "./MathText";

/**
 * Two-qubit state-vector simulator with H, X, Z (per qubit) and CNOT (control
 * q0, target q1). Builds an op sequence, replays it from |00> to get the exact
 * amplitudes, then samples measurements into a 00/01/10/11 histogram. Reusable
 * by the No-Cloning lesson now and the Entanglement chapter later.
 */

type Gate = "X" | "H" | "Z" | "CNOT";
interface Op {
  gate: Gate;
  qubit: 0 | 1;
}

const INV_SQRT2 = 1 / Math.SQRT2;
const SHOTS = 200;
const OUTCOME_LABELS = ["00", "01", "10", "11"];

function bitOfIndex(i: number, q: 0 | 1): number {
  return q === 0 ? (i >> 1) & 1 : i & 1;
}
function flipBit(i: number, q: 0 | 1): number {
  return q === 0 ? i ^ 0b10 : i ^ 0b01;
}
function swap(re: number[], im: number[], a: number, b: number): void {
  const tr = re[a];
  re[a] = re[b];
  re[b] = tr;
  const ti = im[a];
  im[a] = im[b];
  im[b] = ti;
}

function applyOp(re: number[], im: number[], op: Op): void {
  if (op.gate === "CNOT") {
    swap(re, im, 2, 3); // control q0 = 1 (indices 2,3): flip q1
    return;
  }
  const q = op.qubit;
  if (op.gate === "X") {
    for (let i = 0; i < 4; i++) {
      if (bitOfIndex(i, q) === 0) swap(re, im, i, flipBit(i, q));
    }
    return;
  }
  if (op.gate === "Z") {
    for (let i = 0; i < 4; i++) {
      if (bitOfIndex(i, q) === 1) {
        re[i] = -re[i];
        im[i] = -im[i];
      }
    }
    return;
  }
  // Hadamard
  for (let i = 0; i < 4; i++) {
    if (bitOfIndex(i, q) === 0) {
      const j = flipBit(i, q);
      const ar = re[i];
      const ai = im[i];
      const br = re[j];
      const bi = im[j];
      re[i] = (ar + br) * INV_SQRT2;
      im[i] = (ai + bi) * INV_SQRT2;
      re[j] = (ar - br) * INV_SQRT2;
      im[j] = (ai - bi) * INV_SQRT2;
    }
  }
}

function probabilities(ops: Op[]): number[] {
  const re = [1, 0, 0, 0];
  const im = [0, 0, 0, 0];
  for (const op of ops) applyOp(re, im, op);
  return re.map((r, i) => r * r + im[i] * im[i]);
}

function sample(probs: number[], shots: number): number[] {
  const counts = [0, 0, 0, 0];
  for (let s = 0; s < shots; s++) {
    const r = Math.random();
    let cum = 0;
    for (let i = 0; i < 4; i++) {
      cum += probs[i];
      if (r < cum) {
        counts[i] += 1;
        break;
      }
    }
  }
  return counts;
}

export default function TwoQubitSimulator({
  teaching,
  onRun,
}: {
  teaching: string;
  onRun: () => void;
}) {
  const [ops, setOps] = useState<Op[]>([]);
  const [counts, setCounts] = useState<number[] | null>(null);

  function add(gate: Gate, qubit: 0 | 1) {
    setOps((prev) => [...prev, { gate, qubit }]);
    setCounts(null);
  }
  function reset() {
    setOps([]);
    setCounts(null);
  }
  function measure() {
    setCounts(sample(probabilities(ops), SHOTS));
    onRun();
  }

  const total = counts ? counts.reduce((a, b) => a + b, 0) : 0;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="rounded-lg bg-slate-50 p-3">
        <CircuitRow label="q0" ops={ops} qubit={0} />
        <div className="mt-2">
          <CircuitRow label="q1" ops={ops} qubit={1} />
        </div>
        {ops.length === 0 && (
          <p className="mt-2 text-center text-xs text-slate-400">
            Both qubits start in |0⟩. Add gates below.
          </p>
        )}
      </div>

      <div className="mt-4 flex flex-col gap-2">
        {([0, 1] as const).map((q) => (
          <div key={q} className="flex items-center gap-2">
            <span className="w-8 text-sm font-medium text-slate-500">q{q}</span>
            {(["X", "H", "Z"] as const).map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => add(g, q)}
                className="h-9 w-9 rounded-lg border border-indigo-300 bg-white text-sm font-bold text-indigo-700 transition-colors hover:bg-indigo-50"
              >
                {g}
              </button>
            ))}
          </div>
        ))}
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => add("CNOT", 0)}
            className="h-9 rounded-lg border border-indigo-300 bg-white px-3 text-sm font-semibold text-indigo-700 transition-colors hover:bg-indigo-50"
          >
            CNOT 0→1
          </button>
          <button
            type="button"
            onClick={reset}
            className="h-9 rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={measure}
            className="ml-auto h-9 rounded-lg bg-indigo-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
          >
            Measure {SHOTS}
          </button>
        </div>
      </div>

      {counts && (
        <div className="mt-6">
          <div className="flex items-end justify-around gap-3" aria-hidden="true">
            {counts.map((c, i) => {
              const pct = total ? Math.round((c / total) * 100) : 0;
              return (
                <div key={OUTCOME_LABELS[i]} className="flex flex-1 flex-col items-center gap-2">
                  <span className="text-sm font-bold tabular-nums text-slate-900">{pct}%</span>
                  <div className="relative flex h-32 w-full max-w-16 items-end overflow-hidden rounded-lg bg-indigo-100">
                    <div
                      className="w-full rounded-lg bg-indigo-600 transition-[height] duration-200"
                      style={{ height: `${pct}%` }}
                    />
                  </div>
                  <span className="font-mono text-sm font-medium text-slate-600">
                    {OUTCOME_LABELS[i]}
                  </span>
                </div>
              );
            })}
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-500">
            <MathText>{teaching}</MathText>
          </p>
        </div>
      )}
    </div>
  );
}

function CircuitRow({ label, ops, qubit }: { label: string; ops: Op[]; qubit: 0 | 1 }) {
  const chips = ops.filter((op) => op.gate === "CNOT" || op.qubit === qubit);
  return (
    <div className="flex items-center gap-2">
      <span className="w-7 font-mono text-xs text-slate-500">{label}</span>
      <div className="flex h-8 flex-1 items-center gap-1.5 border-t border-slate-300">
        {chips.map((op, i) => (
          <span
            key={i}
            className={`-mt-3 rounded px-1.5 py-0.5 font-mono text-xs font-semibold ${
              op.gate === "CNOT"
                ? "bg-violet-100 text-violet-700"
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
