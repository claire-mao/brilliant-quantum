"use client";

import { useState } from "react";

const W = 320;
const H = 150;
const MID = H / 2;
const PERIODS = 2;

/** Build an SVG path for a sine wave across `width` px with `periods` cycles. */
function wavePath(width: number, periods: number, amp: number): string {
  const samples = 64;
  const points: string[] = [];
  for (let i = 0; i <= samples; i++) {
    const x = (i / samples) * width;
    const y = MID - amp * Math.sin((2 * Math.PI * periods * x) / W);
    points.push(`${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`);
  }
  return points.join(" ");
}

/**
 * Visualizes two waves and their pointwise sum. In interactive mode the learner
 * drags two amplitude sliders (which can go negative to invert a wave) and the
 * combined wave updates live. In story mode it shows a gently drifting wave via
 * a self-contained SVG SMIL animation (no JS timers).
 */
export default function WaveVisualizer({
  interactive,
  onInteracted,
}: {
  interactive: boolean;
  onInteracted?: () => void;
}) {
  const [ampA, setAmpA] = useState(28);
  const [ampB, setAmpB] = useState(28);

  if (!interactive) {
    // Story mode: a seamless, drifting combined wave (two tiles wide).
    const amp = 40;
    return (
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white p-4">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="h-auto w-full"
          role="img"
          aria-label="Animated interfering wave"
        >
          <line x1="0" y1={MID} x2={W} y2={MID} stroke="#e2e8f0" strokeWidth="1" />
          <g>
            <path
              d={wavePath(W * 2, PERIODS * 2, amp)}
              fill="none"
              stroke="#4f46e5"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <animateTransform
              attributeName="transform"
              type="translate"
              from="0 0"
              to={`-${W} 0`}
              dur="6s"
              repeatCount="indefinite"
            />
          </g>
        </svg>
      </div>
    );
  }

  const sum = ampA + ampB;

  function changeA(value: number) {
    setAmpA(value);
    onInteracted?.();
  }
  function changeB(value: number) {
    setAmpB(value);
    onInteracted?.();
  }

  return (
    <div>
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="h-auto w-full"
          role="img"
          aria-label="Two waves and their combined sum"
        >
          <line x1="0" y1={MID} x2={W} y2={MID} stroke="#e2e8f0" strokeWidth="1" />
          <path d={wavePath(W, PERIODS, ampA)} fill="none" stroke="#38bdf8" strokeWidth="2" />
          <path d={wavePath(W, PERIODS, ampB)} fill="none" stroke="#fbbf24" strokeWidth="2" />
          <path
            d={wavePath(W, PERIODS, sum)}
            fill="none"
            stroke="#4f46e5"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
        </svg>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs">
          <Legend color="#38bdf8" label="Wave A" />
          <Legend color="#fbbf24" label="Wave B" />
          <Legend color="#4f46e5" label="Combined" />
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-4">
        <AmplitudeSlider label="Wave A height" value={ampA} onChange={changeA} />
        <AmplitudeSlider label="Wave B height" value={ampB} onChange={changeB} />
      </div>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5 text-slate-500">
      <span
        className="inline-block h-2 w-4 rounded-full"
        style={{ backgroundColor: color }}
        aria-hidden="true"
      />
      {label}
    </span>
  );
}

function AmplitudeSlider({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm font-medium text-slate-600">
      <span className="flex items-center justify-between">
        <span>{label}</span>
        <span className="tabular-nums text-slate-900">{value > 0 ? `+${value}` : value}</span>
      </span>
      <input
        type="range"
        min={-50}
        max={50}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-3 w-full cursor-pointer touch-none appearance-none rounded-full bg-gradient-to-r from-sky-200 via-slate-200 to-amber-200 accent-indigo-600"
        style={{ touchAction: "none" }}
      />
    </label>
  );
}
