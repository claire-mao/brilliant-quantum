"use client";

import { useState } from "react";
import Histogram from "./Histogram";

const SAMPLE_SIZE = 100;

type CaseId = "constructive" | "destructive";
type Counts = { zeros: number; ones: number };

/** Sample how many of `sampleSize` measurements hit the target (measured 1). */
function sampleTargetHits(targetProb: number, sampleSize: number): number {
  let ones = 0;
  for (let i = 0; i < sampleSize; i++) {
    if (Math.random() * 100 < targetProb) ones++;
  }
  return ones;
}

const CASES: { id: CaseId; title: string; description: string; targetProb: number }[] = [
  {
    id: "constructive",
    title: "Constructive interference",
    description: "The two paths reinforce (+1 and +1), so the target's amplitude adds up.",
    targetProb: 100,
  },
  {
    id: "destructive",
    title: "Destructive interference",
    description: "The two paths cancel (+1 and -1), so the target's amplitude drops to zero.",
    targetProb: 0,
  },
];

/**
 * Runs many measurements for the constructive and destructive cases. "Target
 * reached" is encoded as measuring 1. The learner must run both cases before
 * advancing (onBothRun). Sampling uses Math.random locally.
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
      {CASES.map((c) => {
        const r = results[c.id];
        return (
          <div key={c.id} className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="font-semibold text-slate-900">{c.title}</p>
            <p className="mt-1 text-sm text-slate-500">{c.description}</p>
            <button
              type="button"
              onClick={() => run(c.id, c.targetProb)}
              className="mt-4 rounded-lg bg-indigo-600 px-4 py-2.5 text-base font-semibold text-white transition-colors hover:bg-indigo-700"
            >
              {r ? "Run again" : `Run ${SAMPLE_SIZE} measurements`}
            </button>
            {r && (
              <div className="mt-5">
                <Histogram zeros={r.zeros} ones={r.ones} total={SAMPLE_SIZE} />
                <p className="mt-2 text-center text-xs text-slate-400">
                  Measured 1 = target reached
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
