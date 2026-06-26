"use client";

import type { CompanionState } from "@/lib/companions/types";
import type { WandMode } from "../WizardCompanion";
import WizardCompanion, { MagicMotes, SparkleBurst } from "../WizardCompanion";
import type { WizardPhysics } from "@/lib/companions/physics";
import { physicsToStyle } from "@/lib/companions/physics";

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
      <svg
        viewBox="0 0 48 48"
        className="companion-rune-spin absolute h-[150%] w-[150%] text-indigo-300"
      >
        <circle
          cx={24}
          cy={24}
          r={21}
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeDasharray="2 4"
        />
      </svg>
      <span className="companion-orbit absolute h-[140%] w-[140%]">
        <span className="absolute left-1/2 top-0 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-amber-400" />
        <span className="absolute bottom-0 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-indigo-400" />
      </span>
      <svg viewBox="0 0 24 16" className="absolute -bottom-3 h-6 w-9" aria-hidden="true">
        <path d="M2 3 L11 5 V15 L2 13 Z" fill="#6366f1" />
        <path d="M22 3 L13 5 V15 L22 13 Z" fill="#818cf8" />
        <path d="M11 5 L12 5 L13 5" stroke="#3730a3" strokeWidth={1} />
      </svg>
    </span>
  );
}
