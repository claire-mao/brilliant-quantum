"use client";

import { useState } from "react";
import MathText from "./MathText";

/**
 * Shor's-algorithm intuition: a hidden repeating pattern. The displayed
 * sequence repeats with some period; finding that period is what reveals the
 * factors. The learner scans periods by hand (slow), then "reveals" the period
 * the way the quantum part of Shor does. No modular arithmetic or Fourier math.
 */

const PALETTE = [
  "bg-indigo-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-sky-500",
  "bg-violet-500",
];

export default function PatternExplorer({
  teaching,
  onInteracted,
  n = 15,
  cycle = [7, 4, 13, 1],
  period = 4,
  factors = [3, 5],
  terms = 12,
}: {
  teaching: string;
  onInteracted: () => void;
  n?: number;
  cycle?: number[];
  period?: number;
  factors?: [number, number];
  terms?: number;
}) {
  const [guess, setGuess] = useState(1);
  const sequence = Array.from({ length: terms }, (_, i) => cycle[i % cycle.length]);
  const distinct = Array.from(new Set(cycle));
  const colorOf = (v: number) => PALETTE[distinct.indexOf(v) % PALETTE.length];

  const matches = sequence.every((v, i) => i + guess >= sequence.length || v === sequence[i + guess]);
  const isPeriod = guess === period;

  function setPeriodGuess(value: number) {
    setGuess(value);
    onInteracted();
  }
  function reveal() {
    setGuess(period);
    onInteracted();
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-sm text-slate-600">
        A repeating pattern hides in the powers used to factor{" "}
        <span className="font-semibold">N = {n}</span>. Find how often it repeats.
      </p>

      <div className="mt-4 flex flex-wrap gap-1">
        {sequence.map((v, i) => (
          <div
            key={i}
            className={`flex h-10 w-10 items-center justify-center rounded-md text-sm font-bold text-white ${colorOf(v)} ${
              i > 0 && i % guess === 0 ? "ml-3" : ""
            }`}
          >
            {v}
          </div>
        ))}
      </div>

      <label className="mt-5 block text-sm font-medium text-slate-700">
        <span className="flex justify-between">
          <span>Guess the period</span>
          <span className="tabular-nums text-slate-500">r = {guess}</span>
        </span>
        <input
          type="range"
          min={1}
          max={Math.min(8, terms - 1)}
          value={guess}
          onChange={(e) => setPeriodGuess(Number(e.target.value))}
          className="mt-1 w-full accent-indigo-600"
        />
      </label>

      <div
        className={`mt-3 rounded-lg px-4 py-3 text-sm leading-6 ${
          isPeriod
            ? "bg-emerald-50 text-emerald-800"
            : matches
              ? "bg-amber-50 text-amber-800"
              : "bg-slate-50 text-slate-600"
        }`}
      >
        {isPeriod ? (
          <span>
            Period found: <span className="font-semibold">r = {period}</span>. From it, the factors of {n}{" "}
            fall out: <span className="font-semibold">{factors[0]} × {factors[1]}</span>.
          </span>
        ) : matches ? (
          <span>The blocks line up, but this is a multiple of the period. Find the smallest one.</span>
        ) : (
          <span>The blocks do not match yet — try another period.</span>
        )}
      </div>

      <button
        type="button"
        onClick={reveal}
        className="mt-4 rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-violet-700"
      >
        Reveal period with quantum
      </button>

      <p className="mt-4 text-sm leading-6 text-slate-500">
        <MathText>{teaching}</MathText>
      </p>
    </div>
  );
}
