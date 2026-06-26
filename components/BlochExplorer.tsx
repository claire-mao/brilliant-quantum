"use client";

import { useState } from "react";
import BlochSphere from "./BlochSphere";
import ProbabilityVisual from "./ProbabilityVisual";
import MathText, { InlineMath } from "./MathText";

const DEG = Math.PI / 180;

/**
 * Interactive Bloch sphere with theta/phi sliders and live measurement
 * probabilities. Optionally exposes an X-basis measurement toggle so the learner
 * can see that the relative phase phi is invisible in Z but decisive in X.
 */
export default function BlochExplorer({
  showPhi,
  showXMeasurement = false,
  teaching,
  onInteracted,
}: {
  showPhi: boolean;
  showXMeasurement?: boolean;
  teaching: string;
  onInteracted: () => void;
}) {
  const [thetaDeg, setThetaDeg] = useState(60);
  const [phiDeg, setPhiDeg] = useState(0);
  const [basis, setBasis] = useState<"z" | "x">("z");

  const theta = thetaDeg * DEG;
  const phi = phiDeg * DEG;

  const cosHalf = Math.cos(theta / 2);
  const sinHalf = Math.sin(theta / 2);
  const pOneZ = sinHalf * sinHalf * 100;
  const xExpectation = Math.sin(theta) * Math.cos(phi); // <X> = sin(theta)cos(phi)
  const pMinusX = ((1 - xExpectation) / 2) * 100;

  const phaseFactor = phiDeg !== 0 && showPhi ? `e^{i·${phiDeg}°}·` : "";
  const stateExpr = `|ψ⟩ = ${cosHalf.toFixed(2)}|0⟩ + ${phaseFactor}${sinHalf.toFixed(2)}|1⟩`;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <BlochSphere theta={theta} phi={phi} />

      <p className="mt-1 text-center text-sm text-slate-500">
        <InlineMath>{stateExpr}</InlineMath>
      </p>

      <div className="mt-4 flex flex-col gap-4">
        <label className="block text-sm font-medium text-slate-700">
          <span className="flex justify-between">
            <span>θ (polar angle)</span>
            <span className="tabular-nums text-slate-500">{thetaDeg}°</span>
          </span>
          <input
            type="range"
            min={0}
            max={180}
            value={thetaDeg}
            onChange={(e) => {
              setThetaDeg(Number(e.target.value));
              onInteracted();
            }}
            className="mt-1 w-full accent-indigo-600"
          />
        </label>

        {showPhi && (
          <label className="block text-sm font-medium text-slate-700">
            <span className="flex justify-between">
              <span>φ (relative phase)</span>
              <span className="tabular-nums text-slate-500">{phiDeg}°</span>
            </span>
            <input
              type="range"
              min={0}
              max={360}
              value={phiDeg}
              onChange={(e) => {
                setPhiDeg(Number(e.target.value));
                onInteracted();
              }}
              className="mt-1 w-full accent-indigo-600"
            />
          </label>
        )}
      </div>

      {showXMeasurement && (
        <div className="mt-4">
          <p className="text-xs font-medium text-slate-500">Measurement basis</p>
          <div className="mt-1 flex gap-2">
            {(["z", "x"] as const).map((b) => (
              <button
                key={b}
                type="button"
                aria-pressed={basis === b}
                onClick={() => {
                  setBasis(b);
                  onInteracted();
                }}
                className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
                  basis === b
                    ? "border-indigo-400 bg-indigo-50 text-indigo-700"
                    : "border-slate-300 bg-white text-slate-600 hover:border-indigo-300"
                }`}
              >
                {b === "z" ? "Z basis (0 / 1)" : "X basis (+ / −)"}
              </button>
            ))}
          </div>
          <p className="mt-1 text-xs text-slate-400">X-basis measurement = apply H, then measure.</p>
        </div>
      )}

      <div className="mt-6">
        {basis === "z" ? (
          <ProbabilityVisual pOne={pOneZ} />
        ) : (
          <ProbabilityVisual pOne={pMinusX} zeroLabel="+" oneLabel="−" />
        )}
      </div>

      <p className="mt-4 text-sm leading-6 text-slate-500">
        <MathText>{teaching}</MathText>
      </p>
    </div>
  );
}
