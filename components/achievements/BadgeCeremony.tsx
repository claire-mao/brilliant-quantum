"use client";

import AchievementBadge from "@/components/AchievementBadge";
import WizardCompanion, { SparkleBurst } from "@/components/WizardCompanion";
import type { AchievementDef } from "@/lib/achievements/catalog";

/**
 * The badge unlock ceremony overlay (~2.6s, SVG + CSS only). The wizard
 * teleports in and raises its wand, light magic forms the badge, the badge
 * glows and grows, the title appears, then the badge flies toward the profile
 * area and the wizard teleports away. Non-blocking (pointer-events: none).
 */
export default function BadgeCeremony({ def }: { def: AchievementDef }) {
  return (
    <div className="pointer-events-none fixed inset-0 z-[100] overflow-hidden" aria-hidden="true">
      <div className="ceremony-dim absolute inset-0 bg-slate-950/40" />

      <div className="ceremony-wizard absolute left-1/2 top-[42%]">
        <span className="relative block h-28 w-28">
          <SparkleBurst />
          <WizardCompanion mood="happy" wandMode="celebrate" wandAim={-44} className="h-28 w-28" floppy={false} />
        </span>
      </div>

      <div className="ceremony-badge absolute left-1/2 top-1/2">
        <span className="relative block h-24 w-24">
          <span
            className="ceremony-glow absolute -inset-4 rounded-full"
            style={{ background: "radial-gradient(circle, rgba(167,139,250,0.7), transparent 70%)" }}
          />
          <AchievementBadge unlocked type={def.type} icon={def.icon} className="relative h-24 w-24" />
        </span>
      </div>

      <p className="ceremony-title absolute left-1/2 top-[64%] whitespace-nowrap rounded-full bg-slate-900/85 px-4 py-1.5 text-sm font-semibold text-white shadow-lg ring-1 ring-white/10">
        {def.title}
      </p>
    </div>
  );
}
