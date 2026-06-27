"use client";

import { OUTCOME_LABELS } from "@/lib/twoqubit";

/**
 * Four-bar histogram of two-qubit measurement counts (00/01/10/11). Reused by
 * the Two-Qubit Explorer, the correlation experiments, and the Bell-state work.
 */
export default function JointMeasurementHistogram({
  counts,
  highlight,
}: {
  counts: number[];
  /** Optional indices to emphasize (e.g. the correlated outcomes). */
  highlight?: number[];
}) {
  const total = counts.reduce((a, b) => a + b, 0);
  return (
    <div className="flex items-end justify-around gap-3" aria-hidden="true">
      {counts.map((c, i) => {
        const pct = total ? Math.round((c / total) * 100) : 0;
        const emphasized = !highlight || highlight.includes(i);
        return (
          <div key={OUTCOME_LABELS[i]} className="flex flex-1 flex-col items-center gap-2">
            <span className="text-sm font-bold tabular-nums text-slate-900">{pct}%</span>
            <div className="relative flex h-32 w-full max-w-16 items-end overflow-hidden rounded-lg bg-indigo-100">
              <div
                className={`w-full rounded-lg transition-[height] duration-300 ${
                  emphasized ? "bg-indigo-600" : "bg-slate-300"
                }`}
                style={{ height: `${pct}%` }}
              />
            </div>
            <span className="font-mono text-sm font-medium text-slate-600">{OUTCOME_LABELS[i]}</span>
          </div>
        );
      })}
    </div>
  );
}
