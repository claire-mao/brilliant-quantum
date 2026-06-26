"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useCompanion } from "@/components/companions/CompanionProvider";
import type { BubbleAction, ContextKind } from "@/lib/companions/types";
import { getTowerHintContext, getTowerTopic } from "@/lib/companions/tower-context";
import { quantumBasicsCourse } from "@/content/lessons";
import type { UserProfile } from "@/lib/types";

const HINT_FALLBACK = "Look back at the experiment first — what changed right before the answer appeared?";
const FACT_FALLBACK = "The guide's spellbook is resting. Your lessons are unaffected — try again later.";
const NO_CONTEXT_HINT =
  "Open a lesson and attempt a challenge — then I can point at the useful clue.";

/** App pages where the summon control should appear. */
function isAppPage(pathname: string): boolean {
  return (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/lessons") ||
    pathname.startsWith("/achievements") ||
    pathname.startsWith("/tower")
  );
}

function nextLessonHref(profile: UserProfile | null): string {
  const lesson = quantumBasicsCourse.lessons.find(
    (l) => l.steps.length > 0 && !profile?.progress?.[l.id]?.completed
  );
  return lesson ? `/lessons/${lesson.id}` : "/dashboard";
}

interface SceneCopy {
  context: ContextKind;
  message: string;
  actions: BubbleAction[];
}

function sceneFor(pathname: string): SceneCopy {
  if (pathname.startsWith("/lessons")) {
    return {
      context: "hint",
      message: "Need a nudge?",
      actions: [
        { id: "summon-hint", label: "Hint", variant: "primary" },
        { id: "summon-practice", label: "Practice", variant: "ghost" },
        { id: "summon-funfact", label: "Fun fact", variant: "ghost" },
      ],
    };
  }
  if (pathname.startsWith("/achievements")) {
    return {
      context: "badge",
      message: "Want to inspect your relics?",
      actions: [
        { id: "summon-dashboard", label: "Back to course", variant: "primary" },
        { id: "summon-tower", label: "Tower", variant: "ghost" },
      ],
    };
  }
  if (pathname.startsWith("/tower")) {
    return { context: "generic", message: "Choose your next challenge.", actions: [] };
  }
  // dashboard (default app page)
  return {
    context: "generic",
    message: "Ready for the next lesson?",
    actions: [
      { id: "summon-continue", label: "Continue", variant: "primary" },
      { id: "summon-achievements", label: "Achievements", variant: "ghost" },
      { id: "summon-tower", label: "Tower", variant: "ghost" },
    ],
  };
}

/**
 * Persistent control to summon the guide wizard from any authenticated page.
 * Route-aware: the speech bubble offers context-appropriate, guide-style
 * actions. Reuses CompanionProvider.summon — no duplicated wizard logic.
 */
export default function SummonWizardButton() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile } = useAuth();
  const { summon, update, setBubbleActionHandler, clearBubbleActionHandler } = useCompanion();

  useEffect(() => {
    const ids = [
      "summon-hint",
      "summon-practice",
      "summon-funfact",
      "summon-continue",
      "summon-achievements",
      "summon-tower",
      "summon-dashboard",
    ];

    async function askHint() {
      const ctx = getTowerHintContext();
      if (!ctx) {
        update("wizard", { state: "speaking", message: NO_CONTEXT_HINT, bubbleActions: undefined, autoDismissMs: 16000 });
        return;
      }
      update("wizard", { state: "thinking", message: undefined, bubbleActions: undefined });
      try {
        const res = await fetch("/api/ai/hint", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(ctx),
        });
        const data = (await res.json().catch(() => null)) as { hint?: string } | null;
        const hint = res.ok && data?.hint ? data.hint : HINT_FALLBACK;
        update("wizard", { state: "speaking", message: hint, bubbleActions: undefined, wandAim: 16, autoDismissMs: 22000 });
      } catch {
        update("wizard", { state: "speaking", message: HINT_FALLBACK, bubbleActions: undefined, autoDismissMs: 22000 });
      }
    }

    async function askFunFact() {
      const topic = getTowerTopic() ?? "quantum computing";
      update("wizard", { state: "thinking", message: undefined, bubbleActions: undefined });
      try {
        const res = await fetch("/api/ai/fun-fact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ topic }),
        });
        const data = (await res.json().catch(() => null)) as { fact?: string } | null;
        const fact = res.ok && data?.fact ? data.fact : FACT_FALLBACK;
        update("wizard", { state: "speaking", message: fact, bubbleActions: undefined, wandAim: -12, autoDismissMs: 24000 });
      } catch {
        update("wizard", { state: "speaking", message: FACT_FALLBACK, bubbleActions: undefined, autoDismissMs: 24000 });
      }
    }

    function go(href: string, farewell: string) {
      update("wizard", { state: "speaking", message: farewell, bubbleActions: undefined, autoDismissMs: 4000 });
      router.push(href);
    }

    setBubbleActionHandler("summon-hint", () => void askHint());
    setBubbleActionHandler("summon-practice", () => go("/tower", "To the arena — let's practice."));
    setBubbleActionHandler("summon-funfact", () => void askFunFact());
    setBubbleActionHandler("summon-continue", () => go(nextLessonHref(profile), "Onward, apprentice."));
    setBubbleActionHandler("summon-achievements", () => go("/achievements", "Your relics await."));
    setBubbleActionHandler("summon-tower", () => go("/tower", "To the tower."));
    setBubbleActionHandler("summon-dashboard", () => go("/dashboard", "Back to the course."));

    return () => ids.forEach(clearBubbleActionHandler);
  }, [profile, router, update, setBubbleActionHandler, clearBubbleActionHandler]);

  if (!user || !isAppPage(pathname)) return null;

  function callGuide() {
    const scene = sceneFor(pathname);
    summon({
      context: scene.context,
      state: "speaking",
      message: scene.message,
      bubbleActions: scene.actions.length ? scene.actions : undefined,
      showMotes: true,
      wandAim: 18,
    });
  }

  return (
    <div className="pointer-events-none fixed bottom-5 left-4 z-[60] flex flex-col items-center gap-1 pb-[env(safe-area-inset-bottom,0px)] sm:bottom-6 sm:left-6">
      <button
        type="button"
        onClick={callGuide}
        aria-label="Call the guide wizard"
        className="summon-rune pointer-events-auto group flex h-14 w-14 items-center justify-center rounded-full border border-indigo-200 bg-white/90 text-indigo-600 shadow-lg ring-1 ring-indigo-100 backdrop-blur-sm transition-transform hover:scale-105 active:scale-95 sm:h-16 sm:w-16"
      >
        <RuneWand />
      </button>
      <span className="pointer-events-none rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-indigo-700 opacity-0 shadow-sm ring-1 ring-indigo-100 transition-opacity group-hover:opacity-100 sm:text-[11px]">
        Call guide
      </span>
    </div>
  );
}

function RuneWand() {
  return (
    <span className="relative inline-flex h-7 w-7 items-center justify-center">
      <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth={1.6} aria-hidden="true">
        <circle cx="12" cy="12" r="9" strokeDasharray="3 4" className="summon-ring" />
        <path d="M8.5 15.5 L15 9" strokeLinecap="round" />
        <path d="M15 9 l1.5 -1.5" strokeLinecap="round" />
      </svg>
      <span className="summon-orb absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-amber-400" />
    </span>
  );
}
