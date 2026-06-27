"use client";

import { useEffect, useState } from "react";
import type { UserProfile } from "@/lib/types";
import {
  getCurrentFocus,
  getMemoryGrimoire,
  getNeedsReview,
  getWizardObservations,
  MEMORY_LABEL,
  type ConceptMemory,
  type CurrentFocus,
  type MemoryStrength,
  type NeedsReviewItem,
} from "@/lib/learning/insights";

interface GrimoireData {
  concepts: ConceptMemory[];
  review: NeedsReviewItem[];
  focus: CurrentFocus;
  observations: string[];
}

const CRYSTAL: Record<MemoryStrength, { fill: string; text: string; glow: boolean }> = {
  strong: { fill: "#34d399", text: "text-emerald-200", glow: true },
  stable: { fill: "#a78bfa", text: "text-violet-200", glow: true },
  growing: { fill: "#38bdf8", text: "text-sky-200", glow: false },
  fading: { fill: "#fbbf24", text: "text-amber-200", glow: false },
  forgotten: { fill: "#fb7185", text: "text-rose-200", glow: false },
  dormant: { fill: "#475569", text: "text-slate-500", glow: false },
};

/** Friendly, jargon-free status shown on the dashboard. */
const FRIENDLY: Record<MemoryStrength, string> = {
  strong: "Strong",
  stable: "Solid",
  growing: "Getting stronger",
  fading: "Needs review",
  forgotten: "Review soon",
  dormant: "Not started",
};

function nextActionText(focus: CurrentFocus, review: NeedsReviewItem[]): string {
  const urgent = review.find((r) => r.due === "Overdue" || r.due === "Today");
  if (urgent) return `Review ${urgent.label}`;
  if (focus.next) return `Start ${focus.next}`;
  if (review[0]) return `Review ${review[0].label}`;
  if (focus.strengthening) return `Keep practicing ${focus.strengthening}`;
  return "Pick up your next lesson.";
}

/**
 * The Memory Grimoire, simplified: one clear next action, what needs review, and
 * a few concept statuses in friendly language. The full per-concept breakdown and
 * the Wizard's observations live behind an expandable "Learning details" section,
 * so the learner sees only what is actionable at a glance. The learner model and
 * its logic are unchanged; this only changes what is surfaced.
 */
export default function MemoryGrimoire({ profile }: { profile: UserProfile | null }) {
  const [data, setData] = useState<GrimoireData | null>(null);

  useEffect(() => {
    const id = window.setTimeout(
      () =>
        setData({
          concepts: getMemoryGrimoire(profile),
          review: getNeedsReview(profile),
          focus: getCurrentFocus(profile),
          observations: getWizardObservations(profile),
        }),
      0
    );
    return () => clearTimeout(id);
  }, [profile]);

  if (!data) {
    return (
      <div className="mt-5">
        <h3 className="grimoire-heading text-xs font-semibold uppercase tracking-wide text-violet-200/80">
          Memory Grimoire
        </h3>
        <p className="mt-2 text-xs text-slate-500">Reading your grimoire…</p>
      </div>
    );
  }

  const introduced = data.concepts.filter((c) => c.introduced);
  const topConcepts = [...introduced].sort((a, b) => b.score - a.score).slice(0, 3);

  return (
    <div className="mt-5 flex flex-col gap-4">
      {/* What to do next */}
      <section className="rounded-xl border border-violet-300/25 bg-violet-500/10 p-3">
        <h3 className="grimoire-heading text-xs font-semibold uppercase tracking-wide text-violet-200/80">
          Up next
        </h3>
        <p className="mt-1 text-sm font-medium text-violet-50">{nextActionText(data.focus, data.review)}</p>
      </section>

      {/* Needs review (top 3, compact) */}
      {data.review.length > 0 && (
        <section>
          <h3 className="grimoire-heading text-xs font-semibold uppercase tracking-wide text-amber-200/80">
            Needs review
          </h3>
          <ul className="mt-2 flex flex-col gap-1.5">
            {data.review.slice(0, 3).map((r) => (
              <li
                key={r.tag}
                className="flex items-center justify-between gap-2 rounded-lg border border-amber-300/25 bg-amber-400/5 px-3 py-1.5"
              >
                <span className="flex items-center gap-2 text-sm font-medium text-amber-100">
                  <UnfinishedRune />
                  {r.label}
                </span>
                <span className="shrink-0 rounded-full border border-amber-300/40 bg-amber-400/10 px-2 py-0.5 text-[10px] font-semibold text-amber-200">
                  {r.due}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* A few concept statuses (what is getting stronger) */}
      {topConcepts.length > 0 && (
        <section>
          <h3 className="grimoire-heading text-xs font-semibold uppercase tracking-wide text-violet-200/80">
            Getting stronger
          </h3>
          <ul className="mt-2 flex flex-col gap-1.5">
            {topConcepts.map((c) => (
              <li key={c.tag} className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-2 text-sm text-slate-200">
                  <MemoryCrystal strength={c.strength} />
                  {c.label}
                </span>
                <span className={`shrink-0 text-[11px] font-semibold ${CRYSTAL[c.strength].text}`}>
                  {FRIENDLY[c.strength]}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Everything deeper lives here, hidden by default */}
      {(introduced.length > 0 || data.observations.length > 0) && (
        <details className="group">
          <summary className="flex cursor-pointer list-none items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400 transition-colors hover:text-slate-200 [&::-webkit-details-marker]:hidden">
            <svg viewBox="0 0 16 16" className="h-3 w-3 transition-transform group-open:rotate-90" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path d="M6 4 L10 8 L6 12" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Learning details
          </summary>

          <div className="mt-3 flex flex-col gap-4">
            <ul className="flex flex-col gap-1.5">
              {introduced.map((c) => (
                <li key={c.tag} className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2 text-sm text-slate-200">
                    <MemoryCrystal strength={c.strength} />
                    {c.label}
                  </span>
                  <span className={`shrink-0 text-[11px] font-semibold ${CRYSTAL[c.strength].text}`}>
                    {MEMORY_LABEL[c.strength]}
                  </span>
                </li>
              ))}
            </ul>

            {data.observations.length > 0 && (
              <ul className="flex flex-col gap-2">
                {data.observations.map((o, i) => (
                  <li key={i} className="grimoire-note flex gap-2 text-sm italic leading-6 text-slate-300">
                    <span className="mt-1 select-none text-violet-300/70" aria-hidden="true">
                      ✶
                    </span>
                    <span>{o}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </details>
      )}
    </div>
  );
}

function MemoryCrystal({ strength }: { strength: MemoryStrength }) {
  const c = CRYSTAL[strength];
  return (
    <svg
      viewBox="0 0 16 16"
      className="h-4 w-4 shrink-0"
      aria-hidden="true"
      style={c.glow ? { filter: `drop-shadow(0 0 3px ${c.fill})` } : undefined}
    >
      <path d="M8 1 L13 6 L8 15 L3 6 Z" fill={c.fill} opacity={strength === "dormant" ? 0.5 : 0.95} />
      <path
        d="M3 6 H13 M8 1 L6 6 M8 1 L10 6 M6 6 L8 15 M10 6 L8 15"
        fill="none"
        stroke="#ffffff"
        strokeOpacity={0.35}
        strokeWidth={0.6}
      />
    </svg>
  );
}

function UnfinishedRune() {
  return (
    <svg viewBox="0 0 16 16" className="grimoire-rune h-4 w-4 shrink-0 text-amber-300" fill="none" stroke="currentColor" strokeWidth={1.4} aria-hidden="true">
      <circle cx="8" cy="8" r="6" strokeDasharray="3 3" />
      <path d="M8 5 V11 M5.5 7 L8 5 L10.5 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
