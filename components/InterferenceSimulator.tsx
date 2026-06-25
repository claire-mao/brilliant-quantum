"use client";

import { useState } from "react";
import Histogram from "./Histogram";

const SAMPLE_SIZE = 100;

type CaseId = "constructive" | "destructive";
type Counts = { zeros: number; ones: number };
type Arrow = "up" | "down";

/** Sample how many of `sampleSize` measurements hit the target (measured 1). */
function sampleTargetHits(targetProb: number, sampleSize: number): number {
  let ones = 0;
  for (let i = 0; i < sampleSize; i++) {
    if (Math.random() * 100 < targetProb) ones++;
  }
  return ones;
}

const CASES: {
  id: CaseId;
  title: string;
  arrows: [Arrow, Arrow];
  summary: string;
  targetProb: number;
}[] = [
  {
    id: "constructive",
    title: "Constructive interference",
    arrows: ["up", "up"],
    summary: "The two paths point the same way and reinforce, so the target is reached often.",
    targetProb: 90,
  },
  {
    id: "destructive",
    title: "Destructive interference",
    arrows: ["up", "down"],
    summary: "The two paths point opposite ways and cancel, so the target is reached rarely.",
    targetProb: 10,
  },
];

/**
 * Runs many measurements for the constructive and destructive cases. Each case
 * shows the two path directions (reinforcing vs cancelling) next to a histogram
 * of how often the target outcome was reached. The learner must run both cases
 * before advancing (onBothRun). Sampling uses Math.random locally.
 */
export default function InterferenceSimulator({
  teaching,
  onBothRun,
}: {
  teaching: string;
  onBothRun: () => void;
}) {
  const [results, setResults] = useState<Record<CaseId, Counts | null>>({
    constructive: null,
    destructive: null,
  });

  function run(caseId: CaseId, targetProb: number) {
    const ones = sampleTargetHits(targetProb, SAMPLE_SIZE);
    const next = { ...results, [caseId]: { ones, zeros: SAMPLE_SIZE - ones } };
    setResults(next);
    if (next.constructive && next.destructive) onBothRun();
  }

  const bothRun = !!results.constructive && !!results.destructive;

  return (
    <div className="flex flex-col gap-5">
      <p className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">
        Two paths can reach a target outcome. The arrows show each path&apos;s direction;
        the histogram counts how often the target is reached over {SAMPLE_SIZE} measurements.
      </p>

      {CASES.map((c) => {
        const r = results[c.id];
        return (
          <div key={c.id} className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="font-semibold text-slate-900">{c.title}</p>
              <div className="flex items-center gap-1.5">
                <PathArrow dir={c.arrows[0]} />
                <PathArrow dir={c.arrows[1]} />
              </div>
            </div>
            <p className="mt-2 text-sm text-slate-500">{c.summary}</p>
            <button
              type="button"
              onClick={() => run(c.id, c.targetProb)}
              className="mt-4 rounded-lg bg-indigo-600 px-4 py-2.5 text-base font-semibold text-white transition-colors hover:bg-indigo-700"
            >
              {r ? "Run again" : `Run ${SAMPLE_SIZE} measurements`}
            </button>
            {r && (
              <div className="mt-5">
                <Histogram
                  zeros={r.zeros}
                  ones={r.ones}
                  total={SAMPLE_SIZE}
                  zeroLabel="Target missed"
                  oneLabel="Target reached"
                />
                <p className="mt-3 text-center text-sm text-slate-600">
                  Target reached{" "}
                  <span className="font-semibold tabular-nums text-slate-900">{r.ones}</span>{" "}
                  of {SAMPLE_SIZE} times.
                </p>
              </div>
            )}
          </div>
        );
      })}

      {bothRun && <p className="text-sm leading-6 text-slate-600">{teaching}</p>}
    </div>
  );
}

function PathArrow({ dir }: { dir: Arrow }) {
  return (
    <span
      className={`flex h-9 w-9 items-center justify-center rounded-lg text-lg font-bold ${
        dir === "up" ? "bg-indigo-100 text-indigo-700" : "bg-sky-100 text-sky-700"
      }`}
      aria-label={dir === "up" ? "path pointing up" : "path pointing down"}
    >
      {dir === "up" ? "\u2191" : "\u2193"}
    </span>
  );
}
