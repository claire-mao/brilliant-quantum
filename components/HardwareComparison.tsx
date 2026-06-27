"use client";

import { useState } from "react";
import type { HardwarePlatform } from "@/lib/types";
import MathText from "./MathText";

/**
 * Hardware gallery and comparison. Each platform is a selectable card revealing
 * its operating conditions, strengths, and limits; a metric grid compares all
 * platforms side by side. Used both as a 4-platform gallery (Lesson 1) and a
 * 2-platform head-to-head (Lesson 2) purely by changing the `platforms` prop.
 */

const METRICS: { key: keyof HardwarePlatform["metrics"]; label: string }[] = [
  { key: "gateSpeed", label: "Gate speed" },
  { key: "coherence", label: "Coherence" },
  { key: "scalability", label: "Scalability" },
  { key: "fidelity", label: "Fidelity" },
  { key: "compactness", label: "Compactness" },
];

export default function HardwareComparison({
  platforms,
  teaching,
  onInteracted,
}: {
  platforms: HardwarePlatform[];
  teaching: string;
  onInteracted: () => void;
}) {
  const [selected, setSelected] = useState(platforms[0]?.id ?? "");
  const current = platforms.find((p) => p.id === selected) ?? platforms[0];

  function pick(id: string) {
    setSelected(id);
    onInteracted();
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex flex-wrap gap-2">
        {platforms.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => pick(p.id)}
            aria-pressed={selected === p.id}
            className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
              selected === p.id
                ? "border-indigo-400 bg-indigo-50 text-indigo-700"
                : "border-slate-300 bg-white text-slate-600 hover:border-indigo-300"
            }`}
          >
            {p.name}
          </button>
        ))}
      </div>

      {current && (
        <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
          <p className="text-sm font-semibold text-slate-800">{current.name}</p>
          <dl className="mt-2 space-y-1 text-sm text-slate-600">
            <div className="flex gap-2">
              <dt className="w-24 shrink-0 text-slate-400">Operating</dt>
              <dd>{current.temperature}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="w-24 shrink-0 text-slate-400">Strengths</dt>
              <dd>{current.strengths}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="w-24 shrink-0 text-slate-400">Limitations</dt>
              <dd>{current.limitations}</dd>
            </div>
          </dl>
        </div>
      )}

      <div className="mt-4 space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Compare</p>
        {METRICS.map((m) => (
          <div key={m.key} className="flex items-center gap-2">
            <span className="w-20 shrink-0 text-xs text-slate-500">{m.label}</span>
            <div className="flex flex-1 flex-col gap-1">
              {platforms.map((p) => (
                <div key={p.id} className="flex items-center gap-2">
                  <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-2.5 rounded-full transition-[width] duration-300 ${
                        p.id === selected ? "bg-indigo-600" : "bg-slate-300"
                      }`}
                      style={{ width: `${p.metrics[m.key]}%` }}
                    />
                  </div>
                  <span className="w-16 shrink-0 truncate text-[10px] text-slate-400">{p.name}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <p className="mt-4 text-sm leading-6 text-slate-500">
        <MathText>{teaching}</MathText>
      </p>
    </div>
  );
}
