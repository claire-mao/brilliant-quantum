"use client";

import { useState } from "react";
import ProbabilityVisual from "./ProbabilityVisual";
import MathText from "./MathText";
import { getCorrectHeadline } from "@/lib/learning/progressive-feedback";
import ProgressiveFeedbackPanel from "./ProgressiveFeedbackPanel";

/**
 * Graded build challenge: starting from a definite 0, apply gates to reach a
 * 50/50 superposition. X swaps P(0)/P(1); H sets an even 50/50. "Check" grades
 * the current state (each check is a graded attempt); only P(1)===50 unlocks
 * advancing. Reset returns to the definite 0 start.
 */
export default function GateSequenceBuilder({
  correctFeedback,
  incorrectFeedback,
  teaching,
  onCanAdvanceChange,
  onAttempt,
}: {
  correctFeedback: string;
  incorrectFeedback: string;
  teaching?: string;
  onCanAdvanceChange: (canAdvance: boolean) => void;
  onAttempt: () => void;
}) {
  const [pOne, setPOne] = useState(0);
  const [appliedGates, setAppliedGates] = useState<string[]>([]);
  const [result, setResult] = useState<"correct" | "incorrect" | null>(null);
  const [wrongCount, setWrongCount] = useState(0);
  const [showExplanationRequested, setShowExplanationRequested] = useState(false);
  const solved = result === "correct";

  function applyGate(gate: "X" | "H") {
    if (solved) return;
    setPOne((p) => (gate === "X" ? 100 - p : 50));
    setAppliedGates((g) => [...g, gate]);
    setResult(null);
  }

  function reset() {
    if (solved) return;
    setPOne(0);
    setAppliedGates([]);
    setResult(null);
  }

  function check() {
    if (solved) return;
    onAttempt();
    const passed = pOne === 50;
    setResult(passed ? "correct" : "incorrect");
    onCanAdvanceChange(passed);
    if (!passed) setWrongCount((c) => c + 1);
  }

  return (
    <div>
      <ProbabilityVisual pOne={pOne} />

      <p className="mt-4 text-sm text-slate-500">
        Gates applied:{" "}
        <span className="font-medium text-slate-700">
          {appliedGates.length > 0 ? appliedGates.join(" \u2192 ") : "none yet"}
        </span>
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => applyGate("X")}
          disabled={solved}
          className="rounded-lg bg-indigo-600 px-4 py-2.5 text-base font-semibold text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
        >
          Apply X
        </button>
        <button
          type="button"
          onClick={() => applyGate("H")}
          disabled={solved}
          className="rounded-lg bg-indigo-600 px-4 py-2.5 text-base font-semibold text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
        >
          Apply H
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
          Check answer
        </button>
      )}

      {result === "correct" && (
        <ProgressiveFeedbackPanel
          isCorrect
          wrongCount={wrongCount}
          showExplanationRequested={showExplanationRequested}
          onRequestExplanation={() => setShowExplanationRequested(true)}
          questionContext={{ fullExplanation: correctFeedback }}
          correctHeadline={getCorrectHeadline(wrongCount)}
          correctExplanation={correctFeedback}
        />
      )}
      {result === "incorrect" && (
        <ProgressiveFeedbackPanel
          isCorrect={false}
          wrongCount={wrongCount}
          showExplanationRequested={showExplanationRequested}
          onRequestExplanation={() => setShowExplanationRequested(true)}
          questionContext={{ fullExplanation: `${incorrectFeedback} ${teaching ?? ""}`.trim() }}
        />
      )}
      {solved && teaching && (
        <p className="mt-3 text-sm leading-6 text-slate-600">
          <MathText>{teaching}</MathText>
        </p>
      )}
    </div>
  );
}
