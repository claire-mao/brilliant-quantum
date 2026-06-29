"use client";

import type { CompanionState } from "@/lib/companions/types";
import type { WandMode } from "../WizardCompanion";
import WizardCompanion, { MagicMotes, SparkleBurst } from "../WizardCompanion";
import type { WizardPhysics } from "@/lib/companions/physics";
import { physicsToStyle } from "@/lib/companions/physics";
import RuneRing from "./RuneRing";

/**
 * The Guide Wizard avatar with live behavior: floppy layered SVG, quantum wand
 * glow/beam, spellbook aura while thinking, and celebration sparkles.
 */
export default function GuideWizard({
  state,
  physics,
  wandMode,
  wandAim,
  showMotes,
}: {
  state: CompanionState;
  physics?: WizardPhysics;
  wandMode?: WandMode;
  wandAim?: number;
  showMotes?: boolean;
}) {
  const style = physics ? physicsToStyle(physics) : undefined;
  const resolvedWand: WandMode =
    wandMode ??
    (state === "celebrating" ? "celebrate" : state === "thinking" ? "glow" : state === "speaking" ? "beam" : "idle");

  return (
    <div className="relative h-24 w-24" style={style}>
      {state === "thinking" && <ThinkingAura />}
      {(state === "celebrating" || showMotes) && <MagicMotes />}
      {state === "celebrating" && <SparkleBurst />}
      <div className={state === "speaking" ? "companion-idle" : ""}>
        <WizardCompanion
          mood={state === "celebrating" ? "happy" : "still"}
          blink={state !== "thinking"}
          className="h-24 w-24"
          wandMode={resolvedWand}
          wandAim={wandAim ?? -28}
          floppy
        />
      </div>
    </div>
  );
}

function ThinkingAura() {
  return (
    <span className="pointer-events-none absolute inset-0 flex items-center justify-center" aria-hidden="true">
      <RuneRing size="lg" className="absolute h-[150%] w-[150%] text-indigo-300" />
      <svg viewBox="0 0 24 16" className="absolute -bottom-3 h-6 w-9" aria-hidden="true">
        <path d="M2 3 L11 5 V15 L2 13 Z" fill="#6366f1" />
        <path d="M22 3 L13 5 V15 L22 13 Z" fill="#818cf8" />
        <path d="M11 5 L12 5 L13 5" stroke="#3730a3" strokeWidth={1} />
      </svg>
    </span>
  );
}
