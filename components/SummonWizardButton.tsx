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
  if (pathname.startsWith("/tower")) {
    return { context: "generic", message: "Choose your next challenge.", actions: [] };
  }
  // dashboard (default app page)
  return {
    context: "generic",
    message: "Ready for the next lesson?",
    actions: [{ id: "summon-continue", label: "Continue", variant: "primary" }],
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
  const { summon, update, dismiss, isActive, setBubbleActionHandler, clearBubbleActionHandler } = useCompanion();

  useEffect(() => {
    const ids = [
      "summon-hint",
      "summon-practice",
      "summon-funfact",
      "summon-continue",
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
    setBubbleActionHandler("summon-tower", () => go("/tower", "To the tower."));
    setBubbleActionHandler("summon-dashboard", () => go("/dashboard", "Back to the course."));

    return () => ids.forEach(clearBubbleActionHandler);
  }, [profile, router, update, setBubbleActionHandler, clearBubbleActionHandler]);

  if (!user || !isAppPage(pathname)) return null;

  function openHome() {
    // Toggle: if the wizard is already out, clicking the house sends it home.
    if (isActive("wizard")) {
      dismiss("wizard");
      return;
    }
    const scene = sceneFor(pathname);
    // Always spawn the companion in front of its home (no random anchor).
    summon({
      context: scene.context,
      state: "speaking",
      anchorId: "house",
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
        onClick={openHome}
        aria-label="Open the wizard's home"
        className="home-trigger pointer-events-auto group flex items-center justify-center bg-transparent transition-transform hover:scale-[1.03] active:scale-95"
      >
        <PixelHome />
      </button>
      <span className="pointer-events-none -mt-1 rounded-full bg-indigo-950/70 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-violet-200 opacity-0 shadow-sm transition-opacity group-hover:opacity-100 sm:text-[11px]">
        Wizard&apos;s home
      </span>
    </div>
  );
}

/**
 * A pixel-art wizard cabin nestled deep in a pine forest. No frame or chrome —
 * just the scene. On hover the chimney puffs steam and the door swings open to a
 * warm-lit interior. Fireflies twinkle on a loop; motion freezes under reduced
 * motion. (Clicking summons the full companion in front of the cabin.)
 */
function PixelHome() {
  return (
    <svg
      viewBox="0 0 48 40"
      className="aspect-[6/5] h-auto w-[clamp(5.2rem,22vw,11.2rem)]"
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      {/* forest floor */}
      <rect x="0" y="34" width="48" height="6" fill="#1c2a17" />
      <rect x="0" y="34" width="48" height="1" fill="#2c4322" />

      {/* distant pines for forest depth */}
      <g fill="#173021">
        <rect x="14" y="15" width="2" height="1" />
        <rect x="13" y="17" width="4" height="1" />
        <rect x="12" y="19" width="6" height="1" />
        <rect x="11" y="21" width="8" height="2" />
        <rect x="37" y="16" width="2" height="1" />
        <rect x="36" y="18" width="4" height="1" />
        <rect x="35" y="20" width="6" height="1" />
        <rect x="34" y="22" width="8" height="2" />
        <rect x="42" y="20" width="2" height="1" />
        <rect x="41" y="22" width="4" height="2" />
      </g>

      {/* cabin walls (timber) */}
      <rect x="18" y="22" width="16" height="12" fill="#6b4a2a" />
      <rect x="18" y="22" width="16" height="1" fill="#8a6336" />
      <rect x="18" y="22" width="1" height="12" fill="#573a20" />
      <rect x="33" y="22" width="1" height="12" fill="#573a20" />
      <rect x="18" y="26" width="16" height="1" fill="#5a3e22" opacity="0.5" />
      <rect x="18" y="30" width="16" height="1" fill="#5a3e22" opacity="0.5" />

      {/* roof (slate-violet with moss) */}
      <rect x="25" y="14" width="2" height="1" fill="#8a73b5" />
      <rect x="24" y="15" width="4" height="1" fill="#4c3b6e" />
      <rect x="23" y="16" width="6" height="1" fill="#4c3b6e" />
      <rect x="22" y="17" width="8" height="1" fill="#4c3b6e" />
      <rect x="21" y="18" width="10" height="1" fill="#4c3b6e" />
      <rect x="20" y="19" width="12" height="1" fill="#43345f" />
      <rect x="18" y="20" width="16" height="1" fill="#43345f" />
      <rect x="15" y="21" width="22" height="1" fill="#43345f" />
      <rect x="21" y="18" width="2" height="1" fill="#3a5a3f" />
      <rect x="28" y="19" width="2" height="1" fill="#3a5a3f" />

      {/* chimney + steam (rises on hover) */}
      <rect x="30" y="13" width="2" height="7" fill="#3a2a18" />
      <rect x="29" y="13" width="4" height="1" fill="#4a3522" />
      <circle cx="31" cy="12" r="1" fill="#cbd5e1" className="home-smoke" />
      <circle cx="32" cy="10" r="0.8" fill="#cbd5e1" className="home-smoke" style={{ animationDelay: "0.8s" }} />
      <circle cx="30.5" cy="8" r="0.7" fill="#e2e8f0" className="home-smoke" style={{ animationDelay: "1.6s" }} />

      {/* lit window */}
      <rect x="21" y="25" width="4" height="4" fill="#fbbf24" />
      <rect x="22" y="25" width="1" height="4" fill="#7a4d12" />
      <rect x="21" y="27" width="4" height="1" fill="#7a4d12" />

      {/* warm interior revealed when the door opens */}
      <rect x="27" y="28" width="6" height="6" fill="#fde68a" />
      <rect x="27" y="28" width="6" height="1" fill="#b45309" />

      {/* door — swings open on hover (hinged on the left) */}
      <g className="home-door">
        <rect x="27" y="28" width="6" height="6" fill="#3a2614" />
        <rect x="27" y="28" width="6" height="1" fill="#5a3e22" />
        <rect x="27" y="28" width="1" height="6" fill="#241406" />
        <rect x="30" y="28" width="1" height="6" fill="#2f200f" opacity="0.6" />
        <circle cx="32" cy="31" r="0.6" fill="#fbbf24" />
      </g>

      {/* dirt path */}
      <rect x="27" y="34" width="6" height="6" fill="#3a2e1a" opacity="0.75" />

      {/* left foreground pine (tall) */}
      <rect x="6" y="29" width="2" height="5" fill="#4a2f17" />
      <g fill="#1f5d2e">
        <rect x="6" y="12" width="2" height="1" fill="#2f7a3f" />
        <rect x="5" y="13" width="4" height="2" />
        <rect x="4" y="15" width="6" height="1" />
        <rect x="4" y="16" width="6" height="1" fill="#2f7a3f" />
        <rect x="3" y="17" width="8" height="2" />
        <rect x="2" y="19" width="10" height="1" />
        <rect x="4" y="20" width="6" height="1" fill="#2f7a3f" />
        <rect x="3" y="21" width="8" height="1" />
        <rect x="2" y="22" width="10" height="2" />
        <rect x="1" y="24" width="12" height="1" />
        <rect x="0" y="25" width="14" height="1" />
        <rect x="1" y="26" width="12" height="2" />
      </g>

      {/* fireflies */}
      <rect x="12" y="22" width="1" height="1" fill="#fde68a" className="home-star" />
      <rect x="39" y="18" width="1" height="1" fill="#fde68a" className="home-star" style={{ animationDelay: "0.9s" }} />
      <rect x="16" y="31" width="1" height="1" fill="#fbbf24" className="home-star" style={{ animationDelay: "1.8s" }} />
      <rect x="41" y="28" width="1" height="1" fill="#fbbf24" className="home-star" style={{ animationDelay: "1.2s" }} />
    </svg>
  );
}
