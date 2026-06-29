"use client";

import { useEffect, useRef } from "react";
import { useCompanion } from "@/components/companions/CompanionProvider";
import { saveTowerHintContext, type HintRequest } from "@/lib/companions/tower-context";
import { playSound } from "@/lib/sound/sounds";
import { AI_OFF_HINT_FALLBACKS, WRONG_ESCALATION, type HintLevel } from "@/lib/companions/messages";

/**
 * Opening offer after a wrong answer (the first rung of the escalation ladder).
 * From here the wizard walks the learner through it one step at a time.
 */
const OFFER_MESSAGE = WRONG_ESCALATION[1];

/** Clamp an arbitrary step number to a valid 1..4 scaffolding level. */
function toHintLevel(level: number): HintLevel {
  return Math.min(4, Math.max(1, Math.floor(level))) as HintLevel;
}

/**
 * Handwritten hint content used when the AI hint call is unavailable. Mirrors the
 * four AI scaffolding levels (retrieval -> attention -> concept -> reasoning) so
 * the step-by-step loop still works fully AI-off.
 */
function fallbackForLevel(level: number): string {
  return AI_OFF_HINT_FALLBACKS[toHintLevel(level)];
}

const START_ACTION = { id: "help-hint", label: "Walk me through it", variant: "primary" as const };
const LATER_ACTION = { id: "help-later", label: "Not yet", variant: "ghost" as const };
const NEXT_ACTION = { id: "help-next", label: "Next step", variant: "primary" as const };
const GOTIT_ACTION = { id: "help-gotit", label: "I've got it", variant: "ghost" as const };

/**
 * Proactively summons the Wizard after a wrong answer and then guides the learner
 * step by step. Each step reveals one more level of scaffolding (retrieval cue ->
 * attention cue -> concept cue -> short explanation), and after every hint the
 * wizard keeps guiding by offering the next step. The answer is never revealed
 * before the final step. The tower Hint Chamber remains a backup.
 */
export default function WizardHelpPrompt({
  context,
  wrongCount,
  stepKey,
  enabled = true,
}: {
  context: HintRequest & { lessonId?: string };
  wrongCount: number;
  stepKey: string;
  enabled?: boolean;
}) {
  const { summon, update, dismiss, setBubbleActionHandler, clearBubbleActionHandler } = useCompanion();
  const lastOffered = useRef(0);
  const snoozedUntil = useRef(0);
  const lastStepKey = useRef(stepKey);

  // Keep latest context available to the stably registered handlers, and track
  // which guidance step (hint level) the learner is currently on.
  const ctxRef = useRef(context);
  const guideStep = useRef(0);
  useEffect(() => {
    ctxRef.current = context;
  }, [context]);

  useEffect(() => {
    if (stepKey !== lastStepKey.current) {
      lastOffered.current = 0;
      snoozedUntil.current = 0;
      guideStep.current = 0;
      lastStepKey.current = stepKey;
    }
  }, [stepKey]);

  useEffect(() => {
    // Fetch the hint for one step, then keep guiding toward the next step.
    async function deliverStep(level: number) {
      const ctx = ctxRef.current;
      update("wizard", { state: "thinking", message: undefined, bubbleActions: undefined });
      playSound("thinking");
      let hint: string;
      try {
        const res = await fetch("/api/ai/hint", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...ctx, level, pageKind: "lesson" }),
        });
        const data = (await res.json().catch(() => null)) as { hint?: string } | null;
        hint = res.ok && data?.hint ? data.hint : fallbackForLevel(level);
      } catch {
        hint = fallbackForLevel(level);
      }
      // After every hint, keep guiding: offer the next step until the reasoning
      // is fully walked (level 4), where the learner completes the final step.
      const actions = level < 4 ? [NEXT_ACTION, GOTIT_ACTION] : [GOTIT_ACTION];
      update("wizard", {
        state: "speaking",
        message: hint,
        bubbleActions: actions,
        wandAim: 15,
        autoDismissMs: 60000,
      });
    }

    setBubbleActionHandler("help-hint", () => {
      guideStep.current = 1;
      void deliverStep(1);
    });

    setBubbleActionHandler("help-next", () => {
      guideStep.current = Math.min(4, guideStep.current + 1);
      void deliverStep(guideStep.current);
    });

    setBubbleActionHandler("help-gotit", () => {
      dismiss("wizard");
    });

    setBubbleActionHandler("help-later", () => {
      snoozedUntil.current = Date.now() + 45000;
      dismiss("wizard");
    });

    return () => {
      clearBubbleActionHandler("help-hint");
      clearBubbleActionHandler("help-next");
      clearBubbleActionHandler("help-gotit");
      clearBubbleActionHandler("help-later");
    };
  }, [update, dismiss, setBubbleActionHandler, clearBubbleActionHandler]);

  useEffect(() => {
    if (!enabled || wrongCount === 0) return;
    // Offer once per distinct wrong attempt, and respect a recent "Not yet".
    if (wrongCount === lastOffered.current) return;
    if (Date.now() < snoozedUntil.current) return;

    const delay = window.setTimeout(() => {
      saveTowerHintContext(context);
      lastOffered.current = wrongCount;
      guideStep.current = 0;
      summon({
        context: "hint",
        state: "speaking",
        message: OFFER_MESSAGE,
        bubbleActions: [START_ACTION, LATER_ACTION],
        wandAim: 20,
        showMotes: true,
      });
    }, 700);

    return () => clearTimeout(delay);
  }, [wrongCount, enabled, context, summon]);

  return null;
}
