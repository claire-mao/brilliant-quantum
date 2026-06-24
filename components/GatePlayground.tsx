"use client";

import { useState } from "react";
import type { GateId } from "@/lib/types";
import ProbabilityVisual from "./ProbabilityVisual";
import Histogram from "./Histogram";

const GATE_LABEL: Record<GateId, string> = {
  X: "Apply X gate",
  H: "Apply H gate",
};

/**
 * Apply quantum gates to a qubit and watch its probabilities change.
 * Deterministic beginner model: X swaps P(0)/P(1); H turns any state into a
 * 50/50 superposition. Optionally measures N fresh qubits into a histogram.
 * Calls onInteracted() once the required interaction is done (a gate applied,
 * and also a measurement when measureSampleSize is set) to unlock advancing.
 */
export default function GatePlayground({
  initialPOne,
  allowStateSelect = false,
  gates,
  measureSampleSize,
  teaching,
  onInteracted,
}: {
  initialPOne: number;
  allowStateSelect?: boolean;
  gates: GateId[];
  measureSampleSize?: number;
  teaching: string;
  onInteracted: () => void;
}) {
  const [pOne, setPOne] = useState(initialPOne);
  const [appliedGate, setAppliedGate] = useState(false);
  const [results, setResults] = useState<{ zeros: number; ones: number } | null>(null);

  function unlockIfReady(applied: boolean, measured: boolean) {
    if (measureSampleSize ? applied && measured : applied) onInteracted();
  }

  function selectState(value: 0 | 1) {
    setPOne(value === 1 ? 100 : 0);
    setAppliedGate(false);
    setResults(null);
  }

  function applyGate(gate: GateId) {
    setPOne((p) => (gate === "X" ? 100 - p : 50));
    setAppliedGate(true);
    setResults(null);
    unlockIfReady(true, false);
  }

  function measure() {
    if (!measureSampleSize) return;
    let ones = 0;
    for (let i = 0; i < measureSampleSize; i++) {
      if (Math.random() * 100 < pOne) ones++;
    }
    setResults({ ones, zeros: measureSampleSize - ones });
    unlockIfReady(appliedGate, true);
  }

  function reset() {
    setPOne(initialPOne);
    setAppliedGate(false);
    setResults(null);
  }

  const showTeaching = measureSampleSize ? !!results : appliedGate;
  const isDefiniteZero = pOne === 0;
  const isDefiniteOne = pOne === 100;

  return (
    <div>
      {allowStateSelect && (
        <div className="mb-5">
          <p className="mb-2 text-sm font-medium text-slate-600">Starting state</p>
          <div className="flex gap-2">
            <StateButton
              label="Definitely 0"
              active={isDefiniteZero && !appliedGate}
              onClick={() => selectState(0)}
            />
            <StateButton
              label="Definitely 1"
              active={isDefiniteOne && !appliedGate}
              onClick={() => selectState(1)}
            />
          </div>
        </div>
      )}

      <ProbabilityVisual pOne={pOne} />

      <div className="mt-6 flex flex-wrap gap-2">
        {gates.map((gate) => (
          <button
            key={gate}
            type="button"
            onClick={() => applyGate(gate)}
            className="rounded-lg bg-indigo-600 px-4 py-2.5 text-base font-semibold text-white transition-colors hover:bg-indigo-700"
          >
            {GATE_LABEL[gate]}
          </button>
        ))}
        <button
          type="button"
          onClick={reset}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-base font-semibold text-slate-700 transition-colors hover:bg-slate-50"
        >
          Reset
        </button>
      </div>

      {measureSampleSize && (
        <div className="mt-6">
          <button
            type="button"
            onClick={measure}
            className="rounded-lg bg-emerald-600 px-4 py-2.5 text-base font-semibold text-white transition-colors hover:bg-emerald-700"
          >
            {results ? "Measure again" : `Measure ${measureSampleSize} fresh qubits`}
          </button>
          {results && (
            <div className="mt-6">
              <Histogram zeros={results.zeros} ones={results.ones} total={measureSampleSize} />
            </div>
          )}
        </div>
      )}

      {showTeaching && (
        <p className="mt-4 text-sm leading-6 text-slate-600">{teaching}</p>
      )}
    </div>
  );
}

function StateButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
        active
          ? "border-indigo-400 bg-indigo-50 text-indigo-700"
          : "border-slate-300 bg-white text-slate-700 hover:border-indigo-300"
      }`}
    >
      {label}
    </button>
  );
}
