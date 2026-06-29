"use client";

import { useCallback, useEffect, useState } from "react";
import type { UserProfile } from "@/lib/types";
import { getCurrentFocus, type CurrentFocus } from "@/lib/learning/insights";
import { getNeedsReview, type NeedsReviewItem } from "@/lib/learning/learner-model";
import { LEARNING_SIGNALS_UPDATED } from "@/lib/learning/signals";

interface GrimoireData {
  review: NeedsReviewItem[];
  focus: CurrentFocus;
}

function nextActionText(focus: CurrentFocus, review: NeedsReviewItem[]): string {
  const urgent = review.find((r) => r.due === "Overdue" || r.due === "Today");
  if (urgent) return `Review ${urgent.label}`;
  if (focus.next) return `Start ${focus.next}`;
  if (review[0]) return `Review ${review[0].label}`;
  if (focus.strengthening) return `Keep practicing ${focus.strengthening}`;
  return "Pick up your next lesson.";
}

function readGrimoireData(profile: UserProfile | null): GrimoireData {
  return { review: getNeedsReview(profile), focus: getCurrentFocus(profile) };
}

/**
 * The Memory Grimoire, kept lean: one clear next action and anything that needs
 * review. Only actionable information is shown here. The underlying learner model
 * is unchanged; this just surfaces the useful parts.
 */
export default function MemoryGrimoire({ profile }: { profile: UserProfile | null }) {
  const [data, setData] = useState<GrimoireData | null>(null);

  const refresh = useCallback(() => {
    setData(readGrimoireData(profile));
  }, [profile]);

  useEffect(() => {
    const id = window.setTimeout(refresh, 0);
    return () => clearTimeout(id);
  }, [refresh]);

  useEffect(() => {
    const onSignals = () => refresh();
    window.addEventListener(LEARNING_SIGNALS_UPDATED, onSignals);
    return () => window.removeEventListener(LEARNING_SIGNALS_UPDATED, onSignals);
  }, [refresh]);

  if (!data) {
    return (
      <div className="mt-5">
        <h3 className="grimoire-heading text-xs font-semibold uppercase tracking-wide text-violet-200/80">
          Up next
        </h3>
        <p className="mt-2 text-xs text-slate-500">Reading your grimoire…</p>
      </div>
    );
  }

  return (
    <div className="mt-5 flex flex-col gap-4">
      <section className="rounded-xl border border-violet-300/25 bg-violet-500/10 p-3">
        <h3 className="grimoire-heading text-xs font-semibold uppercase tracking-wide text-violet-200/80">
          Up next
        </h3>
        <p className="mt-1 text-sm font-medium text-violet-50">{nextActionText(data.focus, data.review)}</p>
      </section>

      {data.review.length > 0 && (
        <section>
          <h3 className="grimoire-heading text-xs font-semibold uppercase tracking-wide text-amber-200/80">
            Needs review
          </h3>
          <ul className="mt-2 flex flex-col gap-2">
            {data.review.slice(0, 5).map((r) => (
              <li
                key={r.tag}
                className="flex items-center justify-between gap-2 rounded-lg border border-amber-300/25 bg-amber-400/5 px-3 py-2"
              >
                <span className="text-sm font-medium text-amber-100">{r.label}</span>
                <span
                  className={`shrink-0 text-[11px] font-semibold tabular-nums ${
                    r.due === "Overdue"
                      ? "text-rose-300"
                      : r.due === "Today"
                        ? "text-amber-200"
                        : "text-slate-400"
                  }`}
                >
                  {r.due}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
