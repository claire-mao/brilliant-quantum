"use client";

import { useEffect, useState } from "react";
import type { UserProfile } from "@/lib/types";
import {
  getLearnerConceptProfile,
  MASTERY_LABEL,
  type ConceptProfile,
  type MasteryStatus,
} from "@/lib/learning/learner-model";

const STATUS_STYLE: Record<MasteryStatus, string> = {
  new: "border-white/10 bg-white/5 text-slate-500",
  introduced: "border-slate-400/30 bg-slate-400/10 text-slate-300",
  practiced: "border-sky-400/30 bg-sky-400/10 text-sky-200",
  strengthening: "border-violet-400/40 bg-violet-400/10 text-violet-200",
  mastered: "border-emerald-400/40 bg-emerald-400/10 text-emerald-200",
};

const ORDER: Record<MasteryStatus, number> = {
  mastered: 0,
  strengthening: 1,
  practiced: 2,
  introduced: 3,
  new: 4,
};

/**
 * Concept mastery list using learning-science language (Introduced → Practiced
 * → Strengthening → Mastered). Mastery is derived from completion + correct
 * retrieval, not clicking through. Computed after mount (reads local signals),
 * so it never causes a hydration mismatch.
 */
export default function ConceptMasteryPanel({ profile }: { profile: UserProfile | null }) {
  const [items, setItems] = useState<ConceptProfile[] | null>(null);

  useEffect(() => {
    const id = window.setTimeout(() => setItems(getLearnerConceptProfile(profile)), 0);
    return () => clearTimeout(id);
  }, [profile]);

  const sorted = items
    ? [...items].sort((a, b) => ORDER[a.status] - ORDER[b.status] || a.label.localeCompare(b.label))
    : [];

  return (
    <div className="mt-5">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">Concept mastery</h3>
      {!items ? (
        <p className="mt-2 text-xs text-slate-500">Reading your grimoire…</p>
      ) : (
        <ul className="mt-3 flex flex-col gap-1.5">
          {sorted.map((c) => (
            <li key={c.tag} className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-2 text-sm text-slate-200">
                {c.label}
                {c.struggling && (
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-amber-300">review</span>
                )}
              </span>
              <span
                className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium ${STATUS_STYLE[c.status]}`}
              >
                {MASTERY_LABEL[c.status]}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
