"use client";

import { useState } from "react";
import ProbabilityVisual from "./ProbabilityVisual";
import MathText, { InlineMath } from "./MathText";

/**
 * One quantum path. The amplitude slides from -1 to +1; the probability is the
 * amplitude squared, so it grows quadratically and ignores the sign. Reusable
 * wherever a single amplitude -> probability relationship is taught.
 */
export default function AmplitudeExplorer({
  teaching,
  onInteracted,
}: {
  teaching: string;
  onInteracted: () => void;
}) {
  const [amp100, setAmp100] = useState(50); // amplitude * 100, integer for the slider
  const alpha = amp100 / 100;
  const probability = alpha * alpha; // 0..1
  const pct = Math.round(probability * 100);
  const alphaStr = alpha.toFixed(2);
  const pStr = probability.toFixed(2);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <AmplitudeArrow alpha={alpha} />

      <label className="mt-4 block text-sm font-medium text-slate-700">
        <span className="flex justify-between">
          <span>Amplitude α</span>
          <span className="tabular-nums text-slate-500">{alphaStr}</span>
        </span>
        <input
          type="range"
          min={-100}
          max={100}
          value={amp100}
          onChange={(e) => {
            setAmp100(Number(e.target.value));
            onInteracted();
          }}
          className="mt-1 w-full accent-indigo-600"
        />
      </label>

      <div className="mt-6">
        <ProbabilityVisual pOne={pct} zeroLabel="other" oneLabel="this outcome" />
      </div>

      <p className="mt-6 text-center text-lg">
        <InlineMath>{`P = |\\alpha|^2 = (${alphaStr})^2 = ${pStr}`}</InlineMath>
      </p>

      <p className="mt-4 text-sm leading-6 text-slate-500">
        <MathText>{teaching}</MathText>
      </p>
    </div>
  );
}

/** Signed horizontal arrow: length proportional to |alpha|, direction by sign. */
function AmplitudeArrow({ alpha }: { alpha: number }) {
  const w = 240;
  const mid = w / 2;
  const tip = mid + alpha * (mid - 14);
  const positive = alpha >= 0;
  const color = positive ? "stroke-indigo-600" : "stroke-rose-500";
  const head = positive ? "fill-indigo-600" : "fill-rose-500";
  return (
    <svg viewBox={`0 0 ${w} 40`} className="h-10 w-full" aria-hidden="true">
      <line x1={0} y1={20} x2={w} y2={20} className="stroke-slate-200" strokeWidth={1} />
      <line x1={mid} y1={6} x2={mid} y2={34} className="stroke-slate-300" strokeWidth={1} />
      {Math.abs(alpha) > 0.01 && (
        <>
          <line x1={mid} y1={20} x2={tip} y2={20} className={color} strokeWidth={3} strokeLinecap="round" />
          <circle cx={tip} cy={20} r={4} className={head} />
        </>
      )}
    </svg>
  );
}
