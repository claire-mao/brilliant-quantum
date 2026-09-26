"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useCompanion } from "@/components/companions/CompanionProvider";
import type { BubbleAction, ContextKind } from "@/lib/companions/types";
import { aiTopicForPage, pageKindFromPath, type PageKind } from "@/lib/companions/page-context";
import {
  getActiveLessonContext,
  getQuestionAttempt,
  type ActiveLessonContext,
} from "@/lib/companions/lesson-context";
import { fallbackFunFact, fallbackHint, fallbackPractice } from "@/lib/companions/wizard-fallbacks";
import { toHintLevel, type WizardHintLevel, type WizardReply, type WizardRequest } from "@/lib/ai/wizard";
import { quantumBasicsCourse } from "@/content/lessons";
import type { UserProfile } from "@/lib/types";
import {
  FAREWELLS,
  LESSON_PAGE_MESSAGES,
  SUMMON_FALLBACKS,
  TOWER_MESSAGES,
  pickDashboardMessage,
  pickProfileMessage,
  pickRandom,
} from "@/lib/companions/messages";

/** App pages where the summon control should appear (never inside the Tower or auth). */
function isAppPage(pathname: string): boolean {
  return (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/lessons") ||
    pathname.startsWith("/profile")
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

const LESSON_ACTIONS: BubbleAction[] = [
  { id: "summon-hint", label: "Hint", variant: "primary" },
  { id: "summon-practice", label: "Practice", variant: "ghost" },
  { id: "summon-funfact", label: "Fun fact", variant: "ghost" },
];

/** Shown under a practice question so the learner can check themselves. */
const PRACTICE_ACTIONS: BubbleAction[] = [
  { id: "summon-reveal", label: "Show answer", variant: "primary" },
  { id: "summon-practice", label: "Another", variant: "ghost" },
  { id: "summon-hint", label: "Hint", variant: "ghost" },
];

/**
 * Pick the bubble copy for the page the wizard was summoned on. All copy comes
 * from the local (non-AI) pools in lib/companions/messages.ts. This runs from a
 * click handler (openHome), so the module-level random pickers are safe here.
 * The dashboard line is context-aware: it reflects the learner's local progress,
 * review needs, and streak rather than a fixed greeting.
 */
function sceneFor(pathname: string, profile: UserProfile | null): SceneCopy {
  if (pathname.startsWith("/lessons")) {
    return {
      context: "hint",
      message: pickRandom(LESSON_PAGE_MESSAGES),
      actions: LESSON_ACTIONS,
    };
  }
  if (pathname.startsWith("/profile")) {
    return {
      context: "generic",
      message: pickProfileMessage(profile),
      actions: [{ id: "summon-dashboard", label: "Back to course", variant: "primary" }],
    };
  }
  if (pathname.startsWith("/tower")) {
    return { context: "generic", message: pickRandom(TOWER_MESSAGES), actions: [] };
  }
  // dashboard / home (default app page): one context-aware line, kept stable
  // until dismissed or replaced by Continue (see the manual-dashboard pin).
  return {
    context: "generic",
    message: pickDashboardMessage(profile),
    actions: [{ id: "summon-continue", label: "Continue", variant: "primary" }],
  };
}

/** Session-scoped memory so repeated clicks vary and hints escalate per question. */
const shownFacts: string[] = [];
const FACT_HISTORY = 5;
const shownPractice: string[] = [];
const hintLevels = new Map<string, number>();

function hintKey(ctx: ActiveLessonContext): string {
  return `${ctx.lessonId}::${ctx.stepId}::${ctx.question ?? ""}`;
}

function wizardRequest(ctx: ActiveLessonContext): Omit<WizardRequest, "action"> {
  const attempt = ctx.question ? getQuestionAttempt(ctx.lessonId, ctx.question) : null;
  return {
    lessonId: ctx.lessonId,
    lessonTitle: ctx.lessonTitle,
    step: `${ctx.stepIndex + 1} of ${ctx.stepCount}: ${ctx.stepTitle} (${ctx.stepType})`,
    concept: ctx.concept,
    question: ctx.question,
    choices: ctx.choices,
    studentAnswer: attempt?.studentAnswer ?? null,
    incorrectAttempts: attempt?.incorrectAttempts ?? 0,
    attemptFeedback: attempt?.lastFeedback,
    stepSummary: ctx.question ? undefined : ctx.stepSummary,
  };
}

async function callWizard(body: WizardRequest): Promise<WizardReply | null> {
  try {
    const res = await fetch("/api/wizard", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) return null;
    const data = (await res.json().catch(() => null)) as Partial<WizardReply> | null;
    return data && typeof data.text === "string" && data.text.trim() ? { text: data.text, answer: data.answer } : null;
  } catch {
    return null;
  }
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
  const busyRef = useRef(false);
  const practiceAnswerRef = useRef<string | null>(null);

  useEffect(() => {
    const ids = [
      "summon-hint",
      "summon-practice",
      "summon-funfact",
      "summon-reveal",
      "summon-continue",
      "summon-tower",
      "summon-dashboard",
    ];

    /** Runs one wizard request at a time; extra clicks while thinking are ignored. */
    async function withWizard(run: () => Promise<void>) {
      if (busyRef.current) return;
      busyRef.current = true;
      // Long auto-dismiss replaces any timer left by the previous bubble so the
      // wizard stays out while the model is still answering.
      update("wizard", { state: "thinking", message: undefined, bubbleActions: undefined, autoDismissMs: 90000 });
      try {
        await run();
      } finally {
        busyRef.current = false;
      }
    }

    function speak(message: string, actions: BubbleAction[], wandAim: number, autoDismissMs: number) {
      update("wizard", { state: "speaking", message, bubbleActions: actions, wandAim, autoDismissMs });
    }

    function askHint() {
      const ctx = getActiveLessonContext();
      const pageKind = pageKindFromPath(pathname) as PageKind;
      if (!ctx || pageKind !== "lesson") {
        const fallback =
          pageKind === "profile"
            ? SUMMON_FALLBACKS.profileHint
            : pageKind === "dashboard"
              ? SUMMON_FALLBACKS.dashboardHint
              : SUMMON_FALLBACKS.noContext;
        update("wizard", { state: "speaking", message: fallback, bubbleActions: undefined, autoDismissMs: 16000 });
        return;
      }
      void withWizard(async () => {
        const key = hintKey(ctx);
        const level = toHintLevel(Math.min(3, (hintLevels.get(key) ?? 0) + 1)) as WizardHintLevel;
        hintLevels.set(key, level);
        const reply = await callWizard({ action: "hint", hintLevel: level, ...wizardRequest(ctx) });
        speak(reply?.text ?? fallbackHint(ctx.conceptTag, level), LESSON_ACTIONS, 16, 30000);
      });
    }

    function askPractice() {
      const ctx = getActiveLessonContext();
      if (!ctx) {
        update("wizard", { state: "speaking", message: SUMMON_FALLBACKS.noContext, bubbleActions: undefined, autoDismissMs: 16000 });
        return;
      }
      void withWizard(async () => {
        const reply = await callWizard({ action: "practice", avoid: shownPractice.slice(-6), ...wizardRequest(ctx) });
        const practice = reply?.answer ? { text: reply.text, answer: reply.answer } : fallbackPractice(ctx.conceptTag, shownPractice);
        shownPractice.push(practice.text);
        practiceAnswerRef.current = practice.answer;
        speak(practice.text, PRACTICE_ACTIONS, 12, 60000);
      });
    }

    function revealAnswer() {
      const answer = practiceAnswerRef.current;
      if (!answer) return;
      speak(answer, LESSON_ACTIONS, 20, 30000);
    }

    function askFunFact() {
      const ctx = getActiveLessonContext();
      const pageKind = pageKindFromPath(pathname) as PageKind;
      const lessonCtx = pageKind === "lesson" ? ctx : null;
      void withWizard(async () => {
        const reply = await callWizard({
          action: "fun_fact",
          avoidFacts: shownFacts.slice(-FACT_HISTORY),
          ...(lessonCtx
            ? wizardRequest(lessonCtx)
            : { lessonTitle: aiTopicForPage(pathname), concept: aiTopicForPage(pathname) }),
        });
        const fact = reply?.text ?? fallbackFunFact(lessonCtx?.conceptTag ?? null, shownFacts);
        shownFacts.push(fact);
        if (shownFacts.length > FACT_HISTORY) shownFacts.splice(0, shownFacts.length - FACT_HISTORY);
        speak(fact, lessonCtx ? LESSON_ACTIONS : [], -12, 30000);
      });
    }

    function go(href: string, farewell: string) {
      // A user-pressed button is a manual action, so it may replace the pinned message.
      update("wizard", { state: "speaking", message: farewell, bubbleActions: undefined, autoDismissMs: 4000, source: "manual" });
      router.push(href);
    }

    setBubbleActionHandler("summon-hint", askHint);
    setBubbleActionHandler("summon-practice", askPractice);
    setBubbleActionHandler("summon-funfact", askFunFact);
    setBubbleActionHandler("summon-reveal", revealAnswer);
    setBubbleActionHandler("summon-continue", () => go(nextLessonHref(profile), FAREWELLS.continue));
    setBubbleActionHandler("summon-tower", () => go("/tower", FAREWELLS.tower));
    setBubbleActionHandler("summon-dashboard", () => go("/dashboard", FAREWELLS.dashboard));

    return () => ids.forEach(clearBubbleActionHandler);
  }, [pathname, profile, router, update, setBubbleActionHandler, clearBubbleActionHandler]);

  // Reset the companion on navigation so a page's message never lingers onto the
  // next one. The Tower is Alice's arena (never float the companion there), and
  // leaving the dashboard drops the pinned greeting so it cannot block or carry
  // over to another page.
  const prevPathRef = useRef(pathname);
  useEffect(() => {
    const prev = prevPathRef.current;
    prevPathRef.current = pathname;
    const leftDashboard = prev.startsWith("/dashboard") && !pathname.startsWith("/dashboard");
    const leftProfile = prev.startsWith("/profile") && !pathname.startsWith("/profile");
    if (pathname.startsWith("/tower") || leftDashboard || leftProfile) dismiss("wizard");
  }, [pathname, dismiss]);

  if (!user || !isAppPage(pathname)) return null;

  function openHome() {
    // Toggle: if the wizard is already out, clicking the house sends it home.
    if (isActive("wizard")) {
      dismiss("wizard");
      return;
    }
    const scene = sceneFor(pathname, profile);
    // Always spawn the companion in front of its home (no random anchor). The
    // dashboard greeting is pinned as a manual message so nothing auto-overwrites it.
    summon({
      context: scene.context,
      state: "speaking",
      anchorId: "house",
      message: scene.message,
      bubbleActions: scene.actions.length ? scene.actions : undefined,
      showMotes: true,
      wandAim: 18,
      source: pathname.startsWith("/dashboard")
        ? "manual-dashboard"
        : pathname.startsWith("/profile")
          ? "manual-profile"
          : "manual-lesson",
    });
  }

  return (
    <div className="pointer-events-none fixed bottom-5 left-4 z-[60] flex flex-col items-center gap-1 pb-[env(safe-area-inset-bottom,0px)] sm:bottom-6 sm:left-6">
      <button
        type="button"
        onClick={openHome}
        aria-label="Open the wizard's home"
        className="home-trigger pointer-events-auto group flex min-h-11 min-w-11 items-center justify-center bg-transparent transition-transform hover:scale-[1.03] active:scale-95"
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
