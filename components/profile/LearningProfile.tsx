"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import type { UserProfile } from "@/lib/types";
import { getMemoryGrimoire, getNeedsReview } from "@/lib/learning/insights";
import { lessonsForConcept, type ConceptTag } from "@/lib/learning/concepts";
import { getUnits, getLesson, isLessonUnlocked, getCompletedLessonCount } from "@/content/lessons";

/** Short, plain-English description of each concept. */
const CONCEPT_DESC: Record<ConceptTag, string> = {
  qubits: "The basic unit of quantum information.",
  measurement: "Reading a qubit collapses it to one outcome.",
  superposition: "A qubit can hold 0 and 1 at the same time.",
  "bloch-sphere": "A globe that pictures any single-qubit state.",
  phase: "A hidden angle that only interference reveals.",
  gates: "Reversible moves that transform qubit states.",
  interference: "Amplitudes that reinforce or cancel each other.",
  entanglement: "Qubits linked so neither has its own state.",
  algorithms: "Choreographed interference that finds the answer.",
  hardware: "How real, fragile qubits are built and run.",
};

interface ConceptFocus {
  tag: ConceptTag;
  label: string;
  unit: string;
  description: string;
  badge?: string;
  primaryLessonId: string | null;
}

interface NextFocus {
  unit: string;
  lessonId: string;
  lessonTitle: string;
  why: string;
}

interface FocusData {
  review: ConceptFocus[];
  stronger: ConceptFocus[];
  next: NextFocus | null;
}

function unitTitleForLesson(lessonId: string): string {
  for (const unit of getUnits()) {
    if (unit.lessonIds.includes(lessonId)) return unit.title;
  }
  return "";
}

function conceptLessons(tag: ConceptTag): { id: string; title: string }[] {
  return lessonsForConcept(tag).map((id) => ({ id, title: getLesson(id)?.title ?? id }));
}

/** First unlocked, not-yet-completed lesson in course order (new users get lesson 1). */
function computeNextLesson(profile: UserProfile | null): { unit: string; lessonId: string; lessonTitle: string } | null {
  for (const unit of getUnits()) {
    for (const id of unit.lessonIds) {
      const completed = !!profile?.progress?.[id]?.completed;
      if (!completed && isLessonUnlocked(id, profile)) {
        return { unit: unit.title, lessonId: id, lessonTitle: getLesson(id)?.title ?? id };
      }
    }
  }
  return null;
}

function buildFocus(profile: UserProfile | null): FocusData {
  const review: ConceptFocus[] = getNeedsReview(profile).map((item) => {
    const lessons = conceptLessons(item.tag);
    return {
      tag: item.tag,
      label: item.label,
      unit: lessons[0] ? unitTitleForLesson(lessons[0].id) : "",
      description: CONCEPT_DESC[item.tag],
      badge: item.due,
      primaryLessonId: lessons[0]?.id ?? null,
    };
  });

  const reviewTags = new Set(review.map((r) => r.tag));
  const stronger: ConceptFocus[] = getMemoryGrimoire(profile)
    .filter((c) => (c.strength === "growing" || c.strength === "stable") && !reviewTags.has(c.tag))
    .slice(0, 4)
    .map((c) => {
      const lessons = conceptLessons(c.tag);
      return {
        tag: c.tag,
        label: c.label,
        unit: lessons[0] ? unitTitleForLesson(lessons[0].id) : "",
        description: CONCEPT_DESC[c.tag],
        badge: c.strength === "stable" ? "Almost there" : "Building",
        primaryLessonId: lessons[0]?.id ?? null,
      };
    });

  const nextLesson = computeNextLesson(profile);
  const completed = getCompletedLessonCount(profile);
  const next: NextFocus | null = nextLesson
    ? {
        ...nextLesson,
        why: completed === 0 ? "Start your quantum journey here." : "The next step on your path.",
      }
    : null;

  return { review, stronger, next };
}

/**
 * The profile's study focus: three compact, clickable cards (Needs Review,
 * Getting Stronger, Next Challenge). Each expands inline to show the concepts
 * with their unit, lessons, and a clear next action. All derived from the
 * existing learner model (computed after mount); the model itself is unchanged.
 */
export default function LearningProfile({ profile }: { profile: UserProfile | null }) {
  const [data, setData] = useState<FocusData | null>(null);
  const [open, setOpen] = useState<"review" | "stronger" | "next" | null>(null);

  useEffect(() => {
    const id = window.setTimeout(() => setData(buildFocus(profile)), 0);
    return () => clearTimeout(id);
  }, [profile]);

  const toggle = (key: "review" | "stronger" | "next") => setOpen((cur) => (cur === key ? null : key));

  return (
    <section className="mt-8">
      <h3 className="font-serif text-xl font-bold text-white">Your Study Focus</h3>
      <p className="mt-1 text-sm text-slate-400">Here&apos;s what to practice next.</p>

      <div className="mt-4 grid items-start gap-3 sm:grid-cols-3">
        <FocusCard
          tone="amber"
          title="Needs review"
          summary={
            !data ? "…" : data.review.length === 0 ? "All caught up" : `${data.review.length} to refresh`
          }
          icon={<RuneIcon />}
          open={open === "review"}
          onToggle={() => toggle("review")}
          controlsId="focus-review"
        >
          {!data ? null : data.review.length === 0 ? (
            <EmptyNote>Nothing needs review yet.</EmptyNote>
          ) : (
            <ul className="flex flex-col gap-2">
              {data.review.map((c) => (
                <ConceptRow key={c.tag} c={c} tone="amber" towerLabel="Review in Tower" />
              ))}
            </ul>
          )}
        </FocusCard>

        <FocusCard
          tone="emerald"
          title="Getting stronger"
          summary={
            !data ? "…" : data.stronger.length === 0 ? "Just getting started" : `${data.stronger.length} improving`
          }
          icon={<RisingIcon />}
          open={open === "stronger"}
          onToggle={() => toggle("stronger")}
          controlsId="focus-stronger"
        >
          {!data ? null : data.stronger.length === 0 ? (
            <EmptyNote>Start a few lessons to build momentum.</EmptyNote>
          ) : (
            <ul className="flex flex-col gap-2">
              {data.stronger.map((c) => (
                <ConceptRow key={c.tag} c={c} tone="emerald" towerLabel="Practice in Tower" />
              ))}
            </ul>
          )}
        </FocusCard>

        <FocusCard
          tone="violet"
          title="Next challenge"
          summary={!data ? "…" : data.next ? data.next.lessonTitle : "Course complete"}
          icon={<FlagIcon />}
          open={open === "next"}
          onToggle={() => toggle("next")}
          controlsId="focus-next"
        >
          {!data ? null : data.next ? (
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
              <p className="text-[11px] uppercase tracking-wide text-violet-200/70">{data.next.unit}</p>
              <p className="mt-0.5 text-sm font-semibold text-white">{data.next.lessonTitle}</p>
              <p className="mt-1 text-sm text-slate-300">{data.next.why}</p>
              <div className="mt-2">
                <Link
                  href={`/lessons/${data.next.lessonId}`}
                  className="inline-flex rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-violet-500"
                >
                  Start lesson
                </Link>
              </div>
            </div>
          ) : (
            <EmptyNote>You have mastered every lesson. Revisit the Tower to keep memories sharp.</EmptyNote>
          )}
        </FocusCard>
      </div>
    </section>
  );
}

const TONE: Record<
  "amber" | "emerald" | "violet",
  { border: string; bg: string; icon: string; chip: string }
> = {
  amber: {
    border: "border-amber-300/25",
    bg: "bg-amber-400/[0.06]",
    icon: "bg-amber-400/15 text-amber-200",
    chip: "border-amber-300/40 bg-amber-400/10 text-amber-200",
  },
  emerald: {
    border: "border-emerald-300/25",
    bg: "bg-emerald-400/[0.06]",
    icon: "bg-emerald-400/15 text-emerald-200",
    chip: "border-emerald-300/40 bg-emerald-400/10 text-emerald-200",
  },
  violet: {
    border: "border-violet-300/25",
    bg: "bg-violet-500/[0.08]",
    icon: "bg-violet-400/15 text-violet-200",
    chip: "border-violet-300/40 bg-violet-400/10 text-violet-200",
  },
};

function FocusCard({
  tone,
  title,
  summary,
  icon,
  open,
  onToggle,
  controlsId,
  children,
}: {
  tone: "amber" | "emerald" | "violet";
  title: string;
  summary: string;
  icon: ReactNode;
  open: boolean;
  onToggle: () => void;
  controlsId: string;
  children: ReactNode;
}) {
  const t = TONE[tone];
  return (
    <div className={`overflow-hidden rounded-2xl border ${t.border} ${t.bg} backdrop-blur-md`}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={controlsId}
        className="flex w-full items-center gap-3 p-4 text-left outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
      >
        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${t.icon}`}>{icon}</span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold text-white">{title}</span>
          <span className="block truncate text-xs text-slate-400">{summary}</span>
        </span>
        <svg
          viewBox="0 0 16 16"
          className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${open ? "rotate-90" : ""}`}
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path d="M6 4 L10 8 L6 12" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <div id={controlsId} className="focus-card-body border-t border-white/10 px-4 pb-4 pt-3">
          {children}
        </div>
      )}
    </div>
  );
}

function ConceptRow({
  c,
  tone,
  towerLabel,
}: {
  c: ConceptFocus;
  tone: "amber" | "emerald" | "violet";
  towerLabel: string;
}) {
  const t = TONE[tone];
  return (
    <li className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-semibold text-white">{c.label}</span>
        {c.badge && (
          <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${t.chip}`}>
            {c.badge}
          </span>
        )}
      </div>
      <p className="mt-1 text-sm text-slate-300">{c.description}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        <Link
          href="/tower"
          className="inline-flex rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-violet-500"
        >
          {towerLabel}
        </Link>
        {c.primaryLessonId && (
          <Link
            href={`/lessons/${c.primaryLessonId}`}
            className="inline-flex rounded-lg border border-white/15 px-3 py-1.5 text-xs font-semibold text-slate-200 transition-colors hover:bg-white/10"
          >
            Open lesson
          </Link>
        )}
      </div>
    </li>
  );
}

function EmptyNote({ children }: { children: ReactNode }) {
  return <p className="text-sm text-slate-400">{children}</p>;
}

function RuneIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.4} aria-hidden="true">
      <circle cx="8" cy="8" r="6" strokeDasharray="3 3" />
      <path d="M8 5 V11 M5.5 7 L8 5 L10.5 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function RisingIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.6} aria-hidden="true">
      <path d="M2 12 L6 8 L9 10 L14 4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14 4 H10.5 M14 4 V7.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function FlagIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
      <path d="M4 14 V2" strokeLinecap="round" />
      <path d="M4 3 H12 L10 5.5 L12 8 H4" strokeLinejoin="round" />
    </svg>
  );
}
