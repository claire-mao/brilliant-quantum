"use client";

import { useEffect, useRef } from "react";
import { useCompanion } from "@/components/companions/CompanionProvider";
import { saveTowerHintContext, type HintRequest } from "@/lib/companions/tower-context";
import { playSound } from "@/lib/sound/sounds";

/** A single friendly invite. From here the wizard walks the learner step by step. */
const OFFER_MESSAGE = "Stuck here? Let's work through it together, one step at a time.";

/**
 * Handwritten scaffolded steps used when the AI is unavailable. They follow the
 * same four levels as the AI so the step-by-step loop works fully AI-off:
 * retrieval cue -> attention cue -> concept cue -> short explanation.
 */
function fallbackForLevel(level: number, ctx: HintRequest): string {
  switch (level) {
    case 1:
      return "First, recall what the previous experiment or step showed. What happened there?";
    case 2:
      return "Now look closely at what changed right before the result, and focus your attention there.";
    case 3:
      return "Think about the core idea at play here, how the amplitudes or phase behave.";
    default:
      return ctx.feedback
        ? `${ctx.feedback} Re-read that note, then finish the final step yourself.`
        : "Here is the reasoning in full. Walk through it, then complete the final step yourself.";
  }
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
          body: JSON.stringify({ ...ctx, level }),
        });
        const data = (await res.json().catch(() => null)) as { hint?: string } | null;
        hint = res.ok && data?.hint ? data.hint : fallbackForLevel(level, ctx);
      } catch {
        hint = fallbackForLevel(level, ctx);
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
