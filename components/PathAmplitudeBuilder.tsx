"use client";

import { useState } from "react";

type Sign = 1 | -1;
type Mode = "experiment" | "build-constructive" | "build-destructive";

/**
 * Two contributing paths, each with a signed amplitude (+1 / -1). The combined
 * amplitude is their sum and the target probability is (sum / 2)^2. In
 * experiment mode any change unlocks advancing; the build modes grade against a
 * target via "Check" (constructive => |sum| === 2; destructive => sum === 0).
 */
export default function PathAmplitudeBuilder({
  mode,
  correctFeedback,
  incorrectFeedback,
  teaching,
  onCanAdvanceChange,
  onAttempt,
}: {
  mode: Mode;
  correctFeedback?: string;
  incorrectFeedback?: string;
  teaching?: string;
  onCanAdvanceChange: (canAdvance: boolean) => void;
  onAttempt: () => void;
}) {
  const [a, setA] = useState<Sign>(1);
  const [b, setB] = useState<Sign>(1);
  const [result, setResult] = useState<"correct" | "incorrect" | null>(null);
  const graded = mode !== "experiment";
  const solved = result === "correct";

  const sum = a + b;
  const probability = Math.round((sum / 2) ** 2 * 100);

  function setSign(path: "a" | "b", sign: Sign) {
    if (solved) return;
    if (path === "a") setA(sign);
    else setB(sign);
    setResult(null);
    if (!graded) onCanAdvanceChange(true);
  }

  function check() {
    if (solved) return;
    onAttempt();
    const passed =
      mode === "build-constructive" ? Math.abs(sum) === 2 : sum === 0;
    setResult(passed ? "correct" : "incorrect");
    onCanAdvanceChange(passed);
  }

  return (
    <div>
      <div className="flex flex-col gap-3">
        <PathRow label="Path A" value={a} disabled={solved} onChange={(s) => setSign("a", s)} />
        <PathRow label="Path B" value={b} disabled={solved} onChange={(s) => setSign("b", s)} />
      </div>

      <div className="mt-5 rounded-xl border border-slate-200 bg-white p-4">
        <p className="text-sm text-slate-500">
          Combined amplitude:{" "}
          <span className="font-bold tabular-nums text-slate-900">
            {sum > 0 ? `+${sum}` : sum}
          </span>
        </p>
        <p className="mt-3 mb-1 flex items-center justify-between text-sm font-medium text-slate-600">
          <span>Chance of reaching the target</span>
          <span className="tabular-nums text-slate-900">{probability}%</span>
        </p>
        <div className="h-4 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-indigo-600 transition-[width] duration-300"
            style={{ width: `${probability}%` }}
          />
        </div>
      </div>

      {graded && !solved && (
        <button
          type="button"
          onClick={check}
          className="mt-6 rounded-lg bg-emerald-600 px-4 py-2.5 text-base font-semibold text-white transition-colors hover:bg-emerald-700"
        >
          Check answer
        </button>
      )}

      {graded && result && (
        <p
          className={`mt-4 rounded-lg px-4 py-3 text-sm leading-6 ${
            result === "correct"
              ? "bg-emerald-50 text-emerald-800"
              : "bg-amber-50 text-amber-800"
          }`}
        >
          {result === "correct" ? correctFeedback : incorrectFeedback}
        </p>
      )}
      {graded && result === "incorrect" && (
        <p className="mt-2 text-sm font-medium text-amber-700">
          Try again - flip a path&apos;s sign and check once more.
        </p>
      )}
      {solved && teaching && (
        <p className="mt-3 text-sm leading-6 text-slate-600">{teaching}</p>
      )}
    </div>
  );
}

function PathRow({
  label,
  value,
  disabled,
  onChange,
}: {
  label: string;
  value: Sign;
  disabled: boolean;
  onChange: (sign: Sign) => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3">
      <span className="font-medium text-slate-700">{label}</span>
      <div className="flex gap-1">
        {([1, -1] as Sign[]).map((sign) => (
          <button
            key={sign}
            type="button"
            onClick={() => onChange(sign)}
            disabled={disabled}
            aria-pressed={value === sign}
            className={`w-12 rounded-lg border px-2 py-1.5 text-sm font-bold tabular-nums transition-colors disabled:opacity-60 ${
              value === sign
                ? "border-indigo-400 bg-indigo-50 text-indigo-700"
                : "border-slate-300 bg-white text-slate-600 hover:border-indigo-300"
            }`}
          >
            {sign > 0 ? "+1" : "-1"}
          </button>
        ))}
      </div>
    </div>
  );
}
