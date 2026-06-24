"use client";

import { useState } from "react";
import type { GateId } from "@/lib/types";
import CircuitWire from "./CircuitWire";
import ProbabilityVisual from "./ProbabilityVisual";

/**
 * Graded circuit-building challenge. The learner assembles a gate sequence from
 * |0>, then "Measure & check" grades the final state (each check is an attempt).
 * X swaps P(0)/P(1); H -> 50/50. Only reaching targetPOne unlocks advancing;
 * otherwise a handwritten, case-specific explanation is shown. Reset clears.
 */
export default function CircuitBuilder({
  targetPOne,
  correctFeedback,
  feedbackMeasuredEmpty,
  feedbackDefinite,
  feedbackSuperposition,
  incorrectFeedback,
  teaching,
  onCanAdvanceChange,
  onAttempt,
}: {
  targetPOne: number;
  correctFeedback: string;
  feedbackMeasuredEmpty: string;
  feedbackDefinite?: string;
  feedbackSuperposition?: string;
  incorrectFeedback: string;
  teaching?: string;
  onCanAdvanceChange: (canAdvance: boolean) => void;
  onAttempt: () => void;
}) {
  const [gates, setGates] = useState<GateId[]>([]);
  const [result, setResult] = useState<"correct" | "incorrect" | null>(null);
  const [feedback, setFeedback] = useState("");
  const solved = result === "correct";

  const pOne = gates.reduce((p, g) => (g === "X" ? 100 - p : 50), 0);

  function addGate(gate: GateId) {
    if (solved) return;
    setGates((g) => [...g, gate]);
    setResult(null);
  }

  function reset() {
    if (solved) return;
    setGates([]);
    setResult(null);
  }

  function check() {
    if (solved) return;
    onAttempt();
    if (pOne === targetPOne) {
      setResult("correct");
      setFeedback(correctFeedback);
      onCanAdvanceChange(true);
      return;
    }

    let message = incorrectFeedback;
    if (gates.length === 0) {
      message = feedbackMeasuredEmpty;
    } else if (targetPOne === 100 && pOne === 50 && feedbackSuperposition) {
      message = feedbackSuperposition;
    } else if (targetPOne === 50 && (pOne === 0 || pOne === 100) && feedbackDefinite) {
      message = feedbackDefinite;
    }
    setResult("incorrect");
    setFeedback(message);
    onCanAdvanceChange(false);
  }

  return (
    <div>
      <CircuitWire gates={gates} />

      <div className="mt-6">
        <ProbabilityVisual pOne={pOne} />
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => addGate("X")}
          disabled={solved}
          className="rounded-lg bg-indigo-600 px-4 py-2.5 text-base font-semibold text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
        >
          Add X
        </button>
        <button
          type="button"
          onClick={() => addGate("H")}
          disabled={solved}
          className="rounded-lg bg-indigo-600 px-4 py-2.5 text-base font-semibold text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
        >
          Add H
        </button>
        <button
          type="button"
          onClick={reset}
          disabled={solved}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-base font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50"
        >
          Reset
        </button>
      </div>

      {!solved && (
        <button
          type="button"
          onClick={check}
          className="mt-6 rounded-lg bg-emerald-600 px-4 py-2.5 text-base font-semibold text-white transition-colors hover:bg-emerald-700"
        >
          Measure &amp; check
        </button>
      )}

      {result && (
        <p
          className={`mt-4 rounded-lg px-4 py-3 text-sm leading-6 ${
            result === "correct"
              ? "bg-emerald-50 text-emerald-800"
              : "bg-amber-50 text-amber-800"
          }`}
        >
          {feedback}
        </p>
      )}
      {result === "incorrect" && (
        <p className="mt-2 text-sm font-medium text-amber-700">
          Try again - reset and adjust your circuit.
        </p>
      )}
      {solved && teaching && (
        <p className="mt-3 text-sm leading-6 text-slate-600">{teaching}</p>
      )}
    </div>
  );
}
