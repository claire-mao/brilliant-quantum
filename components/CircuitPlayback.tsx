"use client";

import { useState } from "react";
import type { GateId } from "@/lib/types";
import CircuitWire from "./CircuitWire";
import ProbabilityVisual from "./ProbabilityVisual";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Plays a fixed circuit left to right, stepping the qubit's probabilities
 * through each gate (X swaps P(0)/P(1); H -> 50/50), highlighting the active
 * tile, then sampling one measurement. Calls onPlayed() after a full run to
 * unlock advancing. The animation runs in the click handler (no effects).
 */
export default function CircuitPlayback({
  gates,
  teaching,
  onPlayed,
}: {
  gates: GateId[];
  teaching: string;
  onPlayed: () => void;
}) {
  const [pOne, setPOne] = useState(0);
  const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined);
  const [result, setResult] = useState<0 | 1 | null>(null);
  const [playing, setPlaying] = useState(false);

  async function play() {
    if (playing) return;
    setPlaying(true);
    setResult(null);

    let p = 0;
    setPOne(0);
    setActiveIndex(0);
    await delay(600);

    for (let i = 0; i < gates.length; i++) {
      setActiveIndex(i + 1);
      p = gates[i] === "X" ? 100 - p : 50;
      setPOne(p);
      await delay(700);
    }

    setActiveIndex(gates.length + 1);
    await delay(300);
    const sampled: 0 | 1 = Math.random() * 100 < p ? 1 : 0;
    setResult(sampled);
    setPlaying(false);
    onPlayed();
  }

  return (
    <div>
      <CircuitWire gates={gates} activeIndex={activeIndex} />

      <div className="mt-6">
        <ProbabilityVisual pOne={pOne} />
      </div>

      <button
        type="button"
        onClick={play}
        disabled={playing}
        className="mt-6 rounded-lg bg-indigo-600 px-4 py-2.5 text-base font-semibold text-white transition-colors hover:bg-indigo-700 disabled:opacity-60"
      >
        {playing ? "Playing..." : result !== null ? "Play again" : "Play circuit"}
      </button>

      {result !== null && (
        <div className="mt-4 rounded-lg bg-emerald-50 px-4 py-3">
          <p className="text-sm text-emerald-800">
            Measured result:{" "}
            <span className="text-base font-bold tabular-nums">{result}</span>
          </p>
        </div>
      )}

      {result !== null && (
        <p className="mt-4 text-sm leading-6 text-slate-600">{teaching}</p>
      )}
    </div>
  );
}
