"use client";

import { useState } from "react";
import MathText, { InlineMath } from "./MathText";

/**
 * Decoherence visualizer. A Bloch vector starts on the surface (a definite
 * quantum state) and shrinks toward the center as noise, elapsed time, and gate
 * count rise — the state drifts from quantum toward a random classical mixture.
 * The probability of the intended outcome decays from 100% toward 50%.
 */

function coherence(noise: number, time: number, gates: number): number {
  const base = 1 - noise / 100;
  if (base <= 0) return 0;
  const exponent = 1 + time / 25 + gates / 10;
  return Math.max(0, Math.min(1, Math.pow(base, exponent)));
}

export default function DecoherenceSimulator({
  teaching,
  onInteracted,
  showGates = true,
}: {
  teaching: string;
  onInteracted: () => void;
  showGates?: boolean;
}) {
  const [noise, setNoise] = useState(20);
  const [time, setTime] = useState(20);
  const [gates, setGates] = useState(0);

  const r = coherence(noise, time, gates);
  const intendedPct = Math.round(50 + 50 * r);

  // Bloch vector pointing up-right on a 120x120 circle, length scaled by r.
  const cx = 60;
  const cy = 60;
  const R = 48;
  const angle = -Math.PI / 4;
  const tipX = cx + Math.cos(angle) * R * r;
  const tipY = cy + Math.sin(angle) * R * r;

  function update(setter: (v: number) => void, value: number) {
    setter(value);
    onInteracted();
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
        <svg viewBox="0 0 120 120" className="h-36 w-36 shrink-0" aria-hidden="true">
          <circle cx={cx} cy={cy} r={R} className="fill-slate-50 stroke-slate-200" />
          <line x1={cx - R} y1={cy} x2={cx + R} y2={cy} className="stroke-slate-200" strokeWidth={0.5} />
          <line x1={cx} y1={cy - R} x2={cx} y2={cy + R} className="stroke-slate-200" strokeWidth={0.5} />
          <circle cx={tipX} cy={tipY} r={4} className="fill-indigo-600" />
          <line x1={cx} y1={cy} x2={tipX} y2={tipY} className="stroke-indigo-600" strokeWidth={2.5} />
          <circle cx={cx} cy={cy} r={2} className="fill-slate-400" />
        </svg>

        <div className="w-full">
          <p className="text-sm text-slate-600">
            Coherence <InlineMath>{"r"}</InlineMath> ={" "}
            <span className="font-semibold tabular-nums">{r.toFixed(2)}</span>
          </p>
          <div className="mt-2 flex justify-between text-xs text-slate-500">
            <span>Probability of the intended outcome</span>
            <span className="tabular-nums">{intendedPct}%</span>
          </div>
          <div className="mt-1 h-3 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-3 rounded-full bg-indigo-600 transition-[width] duration-200"
              style={{ width: `${intendedPct}%` }}
            />
          </div>
          <p className="mt-1 text-xs text-slate-400">100% = perfectly preserved · 50% = fully random</p>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-4">
        <Slider label="Noise level" value={noise} onChange={(v) => update(setNoise, v)} />
        <Slider label="Elapsed time" value={time} onChange={(v) => update(setTime, v)} />
        {showGates && (
          <Slider label="Gate count" value={gates} max={50} onChange={(v) => update(setGates, v)} />
        )}
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
  onChange,
  max = 100,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  max?: number;
}) {
  return (
    <label className="block text-sm font-medium text-slate-700">
      <span className="flex justify-between">
        <span>{label}</span>
        <span className="tabular-nums text-slate-500">{value}</span>
      </span>
      <input
        type="range"
        min={0}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-1 w-full accent-indigo-600"
      />
    </label>
  );
}
