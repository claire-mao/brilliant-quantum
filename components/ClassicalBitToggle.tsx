"use client";

import { useState } from "react";

/** A large, touch-friendly classical-bit switch the learner can flip 0 <-> 1. */
export default function ClassicalBitToggle() {
  const [on, setOn] = useState(false);

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        type="button"
        role="switch"
        aria-checked={on}
        aria-label="Classical bit toggle"
        onClick={() => setOn((v) => !v)}
        className={`relative flex h-20 w-40 items-center rounded-full p-2 transition-colors ${
          on ? "bg-indigo-600" : "bg-slate-300"
        }`}
      >
        <span
          className={`flex h-16 w-16 items-center justify-center rounded-full bg-white text-2xl font-bold text-slate-900 shadow-md transition-transform duration-200 ${
            on ? "translate-x-20" : "translate-x-0"
          }`}
        >
          {on ? "1" : "0"}
        </span>
      </button>
      <p className="text-sm font-medium text-slate-500">
        Current value: <span className="font-bold text-slate-900">{on ? "1" : "0"}</span>
      </p>
    </div>
  );
}
