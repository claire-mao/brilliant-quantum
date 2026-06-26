"use client";

import { useState } from "react";
import type { Milestone } from "@/lib/types";
import MathText from "./MathText";

/**
 * Interactive timeline of quantum-computing eras. Each milestone reveals a short
 * detail on click. Prop-driven so it can host any sequence of milestones.
 */

export default function TechnologyTimeline({
  milestones,
  teaching,
  onInteracted,
}: {
  milestones: Milestone[];
  teaching: string;
  onInteracted: () => void;
}) {
  const [open, setOpen] = useState<string | null>(null);

  function toggle(id: string) {
    setOpen((cur) => (cur === id ? null : id));
    onInteracted();
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <ol className="relative ml-2 border-l-2 border-slate-200">
        {milestones.map((m) => {
          const isOpen = open === m.id;
          return (
            <li key={m.id} className="mb-3 ml-4">
              <span
                className={`absolute -left-[7px] mt-1.5 h-3 w-3 rounded-full border-2 ${
                  isOpen ? "border-indigo-600 bg-indigo-600" : "border-slate-300 bg-white"
                }`}
              />
              <button
                type="button"
                onClick={() => toggle(m.id)}
                className="text-left"
                aria-expanded={isOpen}
              >
                <span className="text-xs font-semibold uppercase tracking-wide text-indigo-600">
                  {m.period}
                </span>
                <span className="block text-sm font-medium text-slate-800">{m.title}</span>
              </button>
              {isOpen && <p className="mt-1 text-sm leading-6 text-slate-600">{m.detail}</p>}
            </li>
          );
        })}
      </ol>

      <p className="mt-2 text-sm leading-6 text-slate-500">
        <MathText>{teaching}</MathText>
      </p>
    </div>
  );
}
