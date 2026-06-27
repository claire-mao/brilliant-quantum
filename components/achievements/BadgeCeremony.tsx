"use client";

import AchievementBadge from "@/components/AchievementBadge";
import type { AchievementDef } from "@/lib/achievements/catalog";

/**
 * The badge unlock ceremony overlay (~4s, SVG + CSS only). A single large badge
 * grows and glows in the center of the screen (about 40% of the smaller viewport
 * side), the title appears beneath it, then the badge flies up toward the
 * profile/relics area and everything fades. No wizard. Non-blocking
 * (pointer-events: none); frozen under reduced motion.
 */
export default function BadgeCeremony({ def }: { def: AchievementDef }) {
  return (
    <div className="pointer-events-none fixed inset-0 z-[100] overflow-hidden" aria-hidden="true">
      <div className="ceremony-dim absolute inset-0 bg-slate-950/55" />

      {/* large, glowing badge in the center (about 60% of the screen) */}
      <div className="ceremony-badge absolute left-1/2 top-1/2">
        <span className="relative block h-[60vmin] w-[60vmin]">
          <span
            className="ceremony-glow absolute -inset-[5vmin] rounded-full"
            style={{ background: "radial-gradient(circle, rgba(167,139,250,0.75), transparent 70%)" }}
          />
          <AchievementBadge unlocked type={def.type} icon={def.icon} className="relative h-[60vmin] w-[60vmin]" />
        </span>
      </div>

      <p className="ceremony-title absolute left-1/2 top-[calc(50%+33vmin)] whitespace-nowrap rounded-full bg-slate-900/85 px-5 py-2 text-base font-semibold text-white shadow-lg ring-1 ring-white/10">
        {def.title}
      </p>
    </div>
  );
}
