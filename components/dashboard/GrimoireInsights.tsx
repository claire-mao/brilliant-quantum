"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AchievementBadge, { type AchievementIcon } from "@/components/AchievementBadge";
import type { UserProfile } from "@/lib/types";
import {
  getLearnerConceptProfile,
  getRecommendedReview,
  type ConceptProfile,
  type ReviewItem,
} from "@/lib/learning/learner-model";
import ConceptMasteryPanel from "./ConceptMasteryPanel";

export interface GrimoireRelic {
  id: string;
  title: string;
  icon: AchievementIcon;
}

interface Insights {
  review: ReviewItem[];
  strong: ConceptProfile[];
}

const MASTERY_RANK: Record<string, number> = { mastered: 0, strengthening: 1 };

/**
 * The actionable, low-clutter part of the grimoire: what to review, what is
 * getting stronger, and a "Details" drawer that tucks away the full concept
 * list and earned relics. All signal-derived data is computed after mount
 * (reads localStorage), so it never causes a hydration mismatch.
 */
export default function GrimoireInsights({
  profile,
  relics,
}: {
  profile: UserProfile | null;
  relics: GrimoireRelic[];
}) {
  const [data, setData] = useState<Insights | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => {
      const review = getRecommendedReview(profile);
      const reviewTags = new Set(review.map((r) => r.tag));
      const strong = getLearnerConceptProfile(profile)
        .filter(
          (c) =>
            (c.status === "mastered" || c.status === "strengthening") && !reviewTags.has(c.tag)
        )
        .sort((a, b) => (MASTERY_RANK[a.status] ?? 9) - (MASTERY_RANK[b.status] ?? 9));
      setData({ review, strong });
    }, 0);
    return () => clearTimeout(id);
  }, [profile]);

  const review = data?.review.slice(0, 3) ?? [];
  const strong = data?.strong.slice(0, 3) ?? [];

  return (
    <div className="mt-5 flex flex-col gap-4">
      {/* What should I review? */}
      <section>
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">Needs review</h3>
          {review.length > 0 && (
            <Link
              href="/tower"
              className="inline-flex items-center gap-1 text-[11px] font-medium text-violet-300 hover:text-violet-200"
            >
              Review
              <svg
                viewBox="0 0 20 20"
                className="h-3 w-3"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path d="M4 10 H15 M11 6 L15 10 L11 14" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          )}
        </div>
        {!data ? (
          <p className="mt-2 text-xs text-slate-500">Reading your grimoire…</p>
        ) : review.length > 0 ? (
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {review.map((r) => (
              <Chip key={r.tag} tone="amber" label={r.label} />
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-xs text-slate-500">Nothing due — nicely kept.</p>
        )}
      </section>

      {/* What's working? */}
      <section>
        <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">Getting stronger</h3>
        {!data ? (
          <p className="mt-2 text-xs text-slate-500">Reading your grimoire…</p>
        ) : strong.length > 0 ? (
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {strong.map((c) => (
              <Chip key={c.tag} tone="emerald" label={c.label} />
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-xs text-slate-500">Answer a recall question to grow a strength.</p>
        )}
      </section>

      {/* Tucked-away detail so the panel stays scannable. */}
      <div>
        <button
          type="button"
          onClick={() => setShowDetails((v) => !v)}
          aria-expanded={showDetails}
          className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400 transition-colors hover:text-slate-200"
        >
          Details
          <svg
            viewBox="0 0 20 20"
            className={`h-3.5 w-3.5 transition-transform ${showDetails ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path d="M5 7.5 L10 12.5 L15 7.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {showDetails && (
          <div className="mt-3">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-400">Relics</h4>
            {relics.length > 0 ? (
              <ul className="mt-2 flex flex-wrap gap-3">
                {relics.map((r) => (
                  <li key={r.id} className="flex flex-col items-center gap-1 text-center" title={r.title}>
                    <AchievementBadge
                      unlocked
                      type="unit"
                      icon={r.icon}
                      className="h-10 w-10 drop-shadow-[0_0_8px_rgba(167,139,250,0.5)]"
                    />
                    <span className="max-w-[4.5rem] text-[10px] leading-tight text-slate-400">{r.title}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-xs leading-5 text-slate-500">
                Complete a full unit to earn your first relic.
              </p>
            )}
            <ConceptMasteryPanel profile={profile} />
          </div>
        )}
      </div>
    </div>
  );
}

function Chip({ label, tone }: { label: string; tone: "amber" | "emerald" }) {
  const cls =
    tone === "amber"
      ? "border-amber-400/30 bg-amber-400/10 text-amber-200"
      : "border-emerald-400/30 bg-emerald-400/10 text-emerald-200";
  return (
    <li className={`rounded-full border px-2.5 py-1 text-xs font-medium ${cls}`}>{label}</li>
  );
}
