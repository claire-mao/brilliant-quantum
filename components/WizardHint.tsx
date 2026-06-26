"use client";

import { useState } from "react";
import { useCompanion } from "./companions/CompanionProvider";

const FALLBACK = "Look back at the experiment. What changed before the answer became visible?";

export interface HintRequest {
  lessonTitle?: string;
  prompt: string;
  selectedWrong?: string;
  correctAnswer?: string;
  feedback?: string;
  conceptTag?: string;
}

/**
 * "Ask the wizard for a hint" — shown after a wrong answer. Summons the
 * floating wizard (thinking, then speaking) rather than rendering a card. The
 * wizard never reveals the answer; if AI is unavailable it offers a handwritten
 * fallback nudge so the lesson still works AI-off.
 */
export default function WizardHint({ context }: { context: HintRequest }) {
  const { summon, update } = useCompanion();
  const [pending, setPending] = useState(false);

  async function askWizard() {
    if (pending) return;
    setPending(true);
    summon({ context: "hint", state: "thinking" });
    try {
      const res = await fetch("/api/ai/hint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(context),
      });
      const data = (await res.json().catch(() => null)) as { hint?: string } | null;
      const hint = res.ok && data?.hint ? data.hint : FALLBACK;
      update("wizard", { state: "speaking", message: hint, autoDismissMs: 20000 });
    } catch {
      update("wizard", { state: "speaking", message: FALLBACK, autoDismissMs: 20000 });
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      onClick={askWizard}
      className="mt-3 inline-flex items-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-sm font-medium text-indigo-700 transition-colors hover:bg-indigo-100"
    >
      <StarGlyph />
      Ask the wizard for a hint
    </button>
  );
}

function StarGlyph() {
  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4 text-indigo-500" fill="currentColor" aria-hidden="true">
      <path d="M8 1 L9.2 6 L14 8 L9.2 10 L8 15 L6.8 10 L2 8 L6.8 6 Z" />
    </svg>
  );
}
