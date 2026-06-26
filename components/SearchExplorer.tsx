"use client";

import { useState } from "react";
import MathText from "./MathText";

/**
 * Classical unstructured search. One of N boxes hides a target; the only way to
 * find it is to open boxes one by one. The learner feels the cost (about N/2
 * checks on average) before meeting Grover's quantum approach next.
 */

function pickTarget(size: number, avoid: number): number {
  let t = Math.floor(Math.random() * size);
  if (t === avoid) t = (t + 1) % size;
  return t;
}

export default function SearchExplorer({
  teaching,
  onInteracted,
  size = 12,
}: {
  teaching: string;
  onInteracted: () => void;
  size?: number;
}) {
  const [target, setTarget] = useState(() => Math.floor(size / 2));
  const [opened, setOpened] = useState<number[]>([]);
  const [found, setFound] = useState(false);

  function open(i: number) {
    if (found || opened.includes(i)) return;
    setOpened((o) => [...o, i]);
    if (i === target) setFound(true);
    onInteracted();
  }
  function newGame() {
    setTarget((t) => pickTarget(size, t));
    setOpened([]);
    setFound(false);
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="grid grid-cols-6 gap-2">
        {Array.from({ length: size }, (_, i) => {
          const isOpen = opened.includes(i);
          const isTarget = i === target;
          return (
            <button
              key={i}
              type="button"
              onClick={() => open(i)}
              disabled={found || isOpen}
              className={`flex h-12 items-center justify-center rounded-lg border text-lg transition-colors ${
                isOpen && isTarget
                  ? "border-emerald-400 bg-emerald-100 text-emerald-700"
                  : isOpen
                    ? "border-slate-200 bg-slate-100 text-slate-300"
                    : "border-slate-300 bg-white text-slate-400 hover:border-indigo-300"
              }`}
            >
              {isOpen ? (isTarget ? "★" : "·") : "?"}
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <p className="text-sm text-slate-600">
          Boxes opened: <span className="font-semibold tabular-nums">{opened.length}</span>
          {found && <span className="ml-2 font-semibold text-emerald-700">Target found.</span>}
        </p>
        <button
          type="button"
          onClick={newGame}
          className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
        >
          New target
        </button>
      </div>
      <p className="mt-1 text-xs text-slate-400">
        With no clues, classical search takes about {Math.round(size / 2)} checks on average for {size} boxes.
      </p>

      <p className="mt-4 text-sm leading-6 text-slate-500">
        <MathText>{teaching}</MathText>
      </p>
    </div>
  );
}
