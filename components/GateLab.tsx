"use client";

import { useState } from "react";
import {
  applySequence,
  pOne,
  stateKetLatex,
  type Gate1,
  type QState,
} from "@/lib/quantum";
import ProbabilityVisual from "./ProbabilityVisual";
import Histogram from "./Histogram";
import MathText, { InlineMath } from "./MathText";

const MEASURE_SHOTS = 50;

/** Sample how many of `shots` measurements return 1, given P(1) percent. */
function sampleOnes(probPercent: number, shots: number): number {
  let ones = 0;
  for (let i = 0; i < shots; i++) {
    if (Math.random() * 100 < probPercent) ones += 1;
  }
  return ones;
}

/**
 * Single-qubit gate lab. Exploration mode (no `target`): apply X/H/Z, undo,
 * reset, and optionally measure into a histogram; advancing unlocks after the
 * first interaction. Graded mode (`target` set): drive the qubit to the target
 * state and Check; each check counts as an attempt.
 */
export default function GateLab({
  allowedGates,
  start = "0",
  allowStartToggle = false,
  preset = [],
  target,
  measure = false,
  correctFeedback,
  incorrectFeedback,
  teaching,
  onCanAdvanceChange,
  onAttempt,
}: {
  allowedGates: Gate1[];
  start?: QState;
  allowStartToggle?: boolean;
  preset?: Gate1[];
  target?: QState;
  measure?: boolean;
  correctFeedback?: string;
  incorrectFeedback?: string;
  teaching: string;
  onCanAdvanceChange: (value: boolean) => void;
  onAttempt: () => void;
}) {
  const graded = target !== undefined;
  const [startState, setStartState] = useState<QState>(start);
  const [seq, setSeq] = useState<Gate1[]>([]);
  const [counts, setCounts] = useState<{ zeros: number; ones: number } | null>(null);
  const [result, setResult] = useState<"correct" | "incorrect" | null>(null);

  const initial = applySequence(startState, preset);
  const current = applySequence(initial, seq);
  const solved = result === "correct";
  const touched = seq.length > 0 || counts !== null;

  function unlockExploration() {
    if (!graded) onCanAdvanceChange(true);
  }

  function addGate(gate: Gate1) {
    if (solved) return;
    setSeq((s) => [...s, gate]);
    setCounts(null);
    setResult(null);
    unlockExploration();
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
  function chooseStart(s: QState) {
    if (solved) return;
    setStartState(s);
    setSeq([]);
    setCounts(null);
    setResult(null);
  }
  function doMeasure() {
    const ones = sampleOnes(pOne(current), MEASURE_SHOTS);
    setCounts({ ones, zeros: MEASURE_SHOTS - ones });
    unlockExploration();
  }
  function check() {
    if (solved || target === undefined) return;
    onAttempt();
    const ok = current === target;
    setResult(ok ? "correct" : "incorrect");
    onCanAdvanceChange(ok);
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      {allowStartToggle && (
        <div className="mb-4">
          <p className="mb-2 text-sm font-medium text-slate-600">Starting state</p>
          <div className="flex gap-2">
            {(["0", "1"] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => chooseStart(s)}
                aria-pressed={startState === s}
                className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
                  startState === s
                    ? "border-indigo-400 bg-indigo-50 text-indigo-700"
                    : "border-slate-300 bg-white text-slate-700 hover:border-indigo-300"
                }`}
              >
                <InlineMath>{stateKetLatex(s)}</InlineMath>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="text-center">
        <p className="text-sm text-slate-500">Current state</p>
        <p className="mt-1 text-2xl">
          <InlineMath>{stateKetLatex(current)}</InlineMath>
        </p>
      </div>

      <div className="mt-4">
        <ProbabilityVisual pOne={pOne(current)} />
      </div>

      {(preset.length > 0 || seq.length > 0) && (
        <div className="mt-4 flex flex-wrap items-center gap-1.5 text-sm">
          <span className="font-mono text-slate-500">{stateKetLatexPlain(startState)}</span>
          {[...preset.map((g) => ({ g, preset: true })), ...seq.map((g) => ({ g, preset: false }))].map(
            (item, i) => (
              <span
                key={i}
                className={`rounded px-1.5 py-0.5 font-mono text-xs font-semibold ${
                  item.preset ? "bg-slate-100 text-slate-500" : "bg-indigo-100 text-indigo-700"
                }`}
              >
                {item.g}
              </span>
            )
          )}
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {allowedGates.map((gate) => (
          <button
            key={gate}
            type="button"
            onClick={() => addGate(gate)}
            disabled={solved}
            className="h-10 w-12 rounded-lg border-2 border-indigo-300 bg-white text-base font-bold text-indigo-700 transition-colors hover:bg-indigo-50 disabled:opacity-50"
          >
            {gate}
          </button>
        ))}
        <button
          type="button"
          onClick={undo}
          disabled={solved || seq.length === 0}
          className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-50"
        >
          Undo
        </button>
        <button
          type="button"
          onClick={reset}
          disabled={solved || seq.length === 0}
          className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-50"
        >
          Reset
        </button>
      </div>

      {graded ? (
        <div className="mt-5">
          <p className="text-sm text-slate-600">
            Target:{" "}
            <span className="text-base">
              <InlineMath>{stateKetLatex(target)}</InlineMath>
            </span>
          </p>
          {!solved && (
            <button
              type="button"
              onClick={check}
              className="mt-3 rounded-lg bg-indigo-600 px-4 py-2.5 text-base font-semibold text-white transition-colors hover:bg-indigo-700"
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
              <MathText>{result === "correct" ? correctFeedback ?? "" : incorrectFeedback ?? ""}</MathText>
            </p>
          )}
        </div>
      ) : (
        measure && (
          <div className="mt-5">
            <button
              type="button"
              onClick={doMeasure}
              className="rounded-lg bg-emerald-600 px-4 py-2.5 text-base font-semibold text-white transition-colors hover:bg-emerald-700"
            >
              {counts ? "Measure again" : `Measure ${MEASURE_SHOTS} fresh qubits`}
            </button>
            {counts && (
              <div className="mt-6">
                <Histogram zeros={counts.zeros} ones={counts.ones} total={MEASURE_SHOTS} />
              </div>
            )}
          </div>
        )
      )}

      {(touched || solved) && (
        <p className="mt-4 text-sm leading-6 text-slate-500">
          <MathText>{teaching}</MathText>
        </p>
      )}
    </div>
  );
}

/** Plain-text ket (no LaTeX) for the compact sequence strip. */
function stateKetLatexPlain(state: QState): string {
  const kets: Record<QState, string> = { "0": "|0⟩", "1": "|1⟩", "+": "|+⟩", "-": "|−⟩" };
  return kets[state];
}
