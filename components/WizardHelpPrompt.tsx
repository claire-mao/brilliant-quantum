"use client";

import { useEffect, useRef } from "react";
import type { HintRequest } from "@/components/WizardHint";
import { useCompanion } from "@/components/companions/CompanionProvider";
import { saveTowerHintContext } from "@/lib/companions/tower-context";

/** Guide-style offers that escalate with each wrong attempt (never reveal). */
const OFFER_MESSAGES = [
  "Need a nudge? Let's retrieve what you already saw.",
  "Want me to point at what changed?",
  "Shall I name the idea at play?",
  "Want me to walk the reasoning with you?",
];

/**
 * Handwritten scaffolded hints used when AI is unavailable. They follow the same
 * four levels as the AI so the learning loop works fully AI-off.
 */
function fallbackForLevel(level: number, ctx: HintRequest): string {
  switch (level) {
    case 1:
      return "What did the previous experiment or step show? Recall that first.";
    case 2:
      return "Look closely at what changed right before the result — focus your attention there.";
    case 3:
      return "Think about the core idea at play here — how the amplitudes or phase behave.";
    default:
      return ctx.feedback
        ? `${ctx.feedback} Re-read that note, then finish the final step yourself.`
        : "Re-read the lesson's explanation of this idea, then complete the final step yourself.";
  }
}

const HINT_ACTION = { id: "help-hint", label: "Give me a hint", variant: "primary" as const };
const LATER_ACTION = { id: "help-later", label: "Not yet", variant: "ghost" as const };

function levelFor(wrongCount: number): number {
  return Math.max(1, Math.min(4, wrongCount));
}

/**
 * Proactively summons the Guide Wizard after a wrong answer. Hints are
 * progressive: retrieval cue -> attention cue -> concept cue -> short
 * explanation, escalating only as the learner keeps missing. The answer is
 * never revealed before the final stage. The tower Hint Chamber remains a backup.
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

  // Keep latest values available to the (stably registered) bubble handlers.
  const ctxRef = useRef(context);
  const levelRef = useRef(levelFor(wrongCount));
  useEffect(() => {
    ctxRef.current = context;
    levelRef.current = levelFor(wrongCount);
  }, [context, wrongCount]);

  useEffect(() => {
    if (stepKey !== lastStepKey.current) {
      lastOffered.current = 0;
      snoozedUntil.current = 0;
      lastStepKey.current = stepKey;
    }
  }, [stepKey]);

  useEffect(() => {
    setBubbleActionHandler("help-hint", async () => {
      const level = levelRef.current;
      const ctx = ctxRef.current;
      update("wizard", { state: "thinking", message: undefined, bubbleActions: undefined });
      try {
        const res = await fetch("/api/ai/hint", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...ctx, level }),
        });
        const data = (await res.json().catch(() => null)) as { hint?: string } | null;
        const hint = res.ok && data?.hint ? data.hint : fallbackForLevel(level, ctx);
        update("wizard", { state: "speaking", message: hint, bubbleActions: undefined, wandAim: 15, autoDismissMs: 24000 });
      } catch {
        update("wizard", {
          state: "speaking",
          message: fallbackForLevel(level, ctx),
          bubbleActions: undefined,
          wandAim: 15,
          autoDismissMs: 24000,
        });
      }
    });

    setBubbleActionHandler("help-later", () => {
      snoozedUntil.current = Date.now() + 45000;
      dismiss("wizard");
    });

    return () => {
      clearBubbleActionHandler("help-hint");
      clearBubbleActionHandler("help-later");
    };
  }, [update, dismiss, setBubbleActionHandler, clearBubbleActionHandler]);

  useEffect(() => {
    if (!enabled || wrongCount === 0) return;
    // Offer once per distinct wrong attempt; a new wrong attempt overrides snooze.
    if (wrongCount === lastOffered.current) return;
    if (wrongCount === lastOffered.current + 0 && Date.now() < snoozedUntil.current) return;

    const delay = window.setTimeout(() => {
      saveTowerHintContext(context);
      lastOffered.current = wrongCount;
      const level = levelFor(wrongCount);
      const msg = OFFER_MESSAGES[level - 1];
      summon({
        context: "hint",
        state: "speaking",
        message: msg,
        bubbleActions: [HINT_ACTION, LATER_ACTION],
        wandAim: 20,
        showMotes: true,
      });
    }, 700);

    return () => clearTimeout(delay);
  }, [wrongCount, enabled, context, summon]);

  return null;
}
