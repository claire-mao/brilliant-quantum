"use client";

import { useState } from "react";
import MathText, { InlineMath } from "./MathText";

/**
 * Two amplitudes reaching the same outcome, added as signed contributions:
 * A_total = A1 + A2, with probability proportional to |A_total|^2. Same signs
 * reinforce (constructive); opposite signs cancel (destructive). Reusable for
 * any two-path interference demonstration.
 */
export default function WaveInterference({
  teaching,
  onInteracted,
}: {
  teaching: string;
  onInteracted: () => void;
}) {
  const [a1100, setA1100] = useState(70);
  const [a2100, setA2100] = useState(70);
  const a1 = a1100 / 100;
  const a2 = a2100 / 100;
  const total = a1 + a2;
  // Relative probability, normalized so |A_total| = 2 reads as 100%.
  const rel = (total / 2) * (total / 2);
  const pct = Math.round(rel * 100);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex flex-col gap-2">
        <Arrow label="A₁" value={a1} tone="indigo" />
        <Arrow label="A₂" value={a2} tone="sky" />
        <div className="my-1 border-t border-dashed border-slate-200" />
        <Arrow label="A₁+A₂" value={total} tone="emerald" scale={0.5} />
      </div>

      <div className="mt-4 flex flex-col gap-4">
        <Slider label="Amplitude A₁" value={a1100} set={setA1100} alpha={a1} onInteracted={onInteracted} />
        <Slider label="Amplitude A₂" value={a2100} set={setA2100} alpha={a2} onInteracted={onInteracted} />
      </div>

      <p className="mt-6 text-center">
        <InlineMath>{`A_{\\text{total}} = A_1 + A_2 = ${a1.toFixed(2)} + ${a2.toFixed(2)} = ${total.toFixed(2)}`}</InlineMath>
      </p>

      <div className="mt-4">
        <div className="flex justify-between text-sm text-slate-600">
          <span>
            <InlineMath>{`P = |A_{\\text{total}}|^2`}</InlineMath>
          </span>
          <span className="tabular-nums">{pct}%</span>
        </div>
        <div className="mt-1 h-3 w-full overflow-hidden rounded-full bg-indigo-100">
          <div
            className="h-3 rounded-full bg-indigo-600 transition-[width] duration-200"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <p className="mt-4 text-sm leading-6 text-slate-500">
        <MathText>{teaching}</MathText>
      </p>
    </div>
  );
}

function Slider({
  label,
  value,
  set,
  alpha,
  onInteracted,
}: {
  label: string;
  value: number;
  set: (v: number) => void;
  alpha: number;
  onInteracted: () => void;
}) {
  return (
    <label className="block text-sm font-medium text-slate-700">
      <span className="flex justify-between">
        <span>{label}</span>
        <span className="tabular-nums text-slate-500">{alpha.toFixed(2)}</span>
      </span>
      <input
        type="range"
        min={-100}
        max={100}
        value={value}
        onChange={(e) => {
          set(Number(e.target.value));
          onInteracted();
        }}
        className="mt-1 w-full accent-indigo-600"
      />
    </label>
  );
}

const TONES: Record<string, string> = {
  indigo: "bg-indigo-500",
  sky: "bg-sky-500",
  emerald: "bg-emerald-500",
};

/** Horizontal signed bar from a center line. */
function Arrow({
  label,
  value,
  tone,
  scale = 1,
}: {
  label: string;
  value: number;
  tone: string;
  scale?: number;
}) {
  const widthPct = Math.min(50, Math.abs(value) * scale * 50);
  const positive = value >= 0;
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-12 shrink-0 font-mono text-slate-500">{label}</span>
      <div className="relative h-4 flex-1">
        <div className="absolute left-1/2 top-0 h-4 w-px bg-slate-300" />
        <div
          className={`absolute top-0.5 h-3 rounded ${value >= 0 ? "left-1/2" : ""} ${TONES[tone]}`}
          style={
            positive
              ? { width: `${widthPct}%` }
              : { right: "50%", width: `${widthPct}%` }
          }
        />
      </div>
      <span className="w-12 shrink-0 text-right tabular-nums text-slate-600">{value.toFixed(2)}</span>
    </div>
  );
}
