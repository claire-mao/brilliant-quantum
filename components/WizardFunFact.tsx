"use client";

import { useState } from "react";
import { useCompanion } from "./companions/CompanionProvider";

const FALLBACK = "The wizard's spellbook is resting. Try again later — your lesson is unaffected.";

/**
 * Optional "Wizard fun fact" — summons the floating wizard, who shares a short
 * topic-related fact in a speech bubble. Additive and non-blocking: if AI is
 * unavailable the wizard simply says so and the lesson is unaffected.
 */
export default function WizardFunFact({ topic }: { topic: string }) {
  const { summon, update } = useCompanion();
  const [pending, setPending] = useState(false);

  async function summonFact() {
    if (pending) return;
    setPending(true);
    summon({ context: "fun-fact", state: "thinking" });
    try {
      const res = await fetch("/api/ai/fun-fact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic }),
      });
      const data = (await res.json().catch(() => null)) as { fact?: string } | null;
      const fact = res.ok && data?.fact ? data.fact : FALLBACK;
      update("wizard", { state: "speaking", message: fact, autoDismissMs: 24000 });
    } catch {
      update("wizard", { state: "speaking", message: FALLBACK, autoDismissMs: 24000 });
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      onClick={summonFact}
      className="inline-flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-800 transition-colors hover:bg-amber-100"
    >
      <StarGlyph />
      Wizard fun fact
    </button>
  );
}

function StarGlyph() {
  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4 text-amber-500" fill="currentColor" aria-hidden="true">
      <path d="M8 1 L9.2 6 L14 8 L9.2 10 L8 15 L6.8 10 L2 8 L6.8 6 Z" />
    </svg>
  );
}
