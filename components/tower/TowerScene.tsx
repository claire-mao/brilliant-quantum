"use client";

import type { Climate, ClimateDetail } from "@/lib/tower/climates";
import { climateBackground } from "@/lib/tower/climates";

/**
 * The pixel dungeon backdrop for a climate: gradient sky, pixel walls and floor,
 * and small animated climate details (no image assets — pure CSS/SVG). Sits
 * behind the floor's content. Animations honor reduced motion via globals.css.
 */
export default function DungeonBackdrop({ climate, reduce = false }: { climate: Climate; reduce?: boolean }) {
  const p = climate.palette;
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true" style={{ background: climateBackground(p) }}>
      {/* side pixel walls */}
      <div className="absolute inset-y-0 left-0 w-6 sm:w-10" style={{ background: `repeating-linear-gradient(180deg, ${p.wall} 0 14px, ${p.wallDark} 14px 28px)` }} />
      <div className="absolute inset-y-0 right-0 w-6 sm:w-10" style={{ background: `repeating-linear-gradient(180deg, ${p.wall} 0 14px, ${p.wallDark} 14px 28px)` }} />

      {/* pixel floor strip */}
      <div className="absolute inset-x-0 bottom-0 h-16">
        <div className="absolute inset-x-0 top-0 h-2" style={{ background: p.accent, opacity: 0.5 }} />
        <div className="h-full w-full" style={{ background: `repeating-linear-gradient(90deg, ${p.floor} 0 22px, ${p.floorDark} 22px 44px)` }} />
        <div className="absolute inset-x-0 top-2 h-3" style={{ background: `repeating-linear-gradient(90deg, ${p.floorDark} 0 22px, ${p.floor} 22px 44px)`, opacity: 0.6 }} />
      </div>

      {/* torches / runes along the walls */}
      {[18, 52, 84].map((top) => (
        <span
          key={top}
          className={reduce ? "" : "tower-torch"}
          style={{
            position: "absolute",
            left: "2px",
            top: `${top}%`,
            width: 6,
            height: 6,
            borderRadius: 9999,
            background: p.accentSoft,
            boxShadow: `0 0 10px ${p.glow}`,
          }}
        />
      ))}
      {[26, 60, 90].map((top) => (
        <span
          key={top}
          className={reduce ? "" : "tower-torch"}
          style={{
            position: "absolute",
            right: "2px",
            top: `${top}%`,
            width: 6,
            height: 6,
            borderRadius: 9999,
            background: p.accentSoft,
            boxShadow: `0 0 10px ${p.glow}`,
            animationDelay: "0.6s",
          }}
        />
      ))}

      <ClimateDetails detail={climate.detail} accent={p.accent} accentSoft={p.accentSoft} reduce={reduce} />
    </div>
  );
}

const POSITIONS = [
  { left: "14%", top: "20%", delay: "0s" },
  { left: "32%", top: "44%", delay: "0.8s" },
  { left: "58%", top: "26%", delay: "1.6s" },
  { left: "74%", top: "52%", delay: "0.4s" },
  { left: "44%", top: "68%", delay: "1.2s" },
  { left: "86%", top: "34%", delay: "2s" },
];

function ClimateDetails({
  detail,
  accent,
  accentSoft,
  reduce,
}: {
  detail: ClimateDetail;
  accent: string;
  accentSoft: string;
  reduce: boolean;
}) {
  if (reduce) {
    // Static faint motes instead of motion.
    return (
      <>
        {POSITIONS.slice(0, 4).map((pos, i) => (
          <span
            key={i}
            style={{ position: "absolute", left: pos.left, top: pos.top, width: 5, height: 5, borderRadius: 9999, background: accentSoft, opacity: 0.4 }}
          />
        ))}
      </>
    );
  }

  return (
    <>
      {POSITIONS.map((pos, i) => (
        <DetailGlyph key={i} detail={detail} accent={accent} accentSoft={accentSoft} style={pos} />
      ))}
    </>
  );
}

function DetailGlyph({
  detail,
  accent,
  accentSoft,
  style,
}: {
  detail: ClimateDetail;
  accent: string;
  accentSoft: string;
  style: { left: string; top: string; delay: string };
}) {
  const base: React.CSSProperties = { position: "absolute", left: style.left, top: style.top, animationDelay: style.delay };

  switch (detail) {
    case "leaves":
      return <span className="tower-detail-drift" style={{ ...base, width: 7, height: 7, background: accent, borderRadius: "0 60% 0 60%", opacity: 0.7 }} />;
    case "embers":
      return <span className="tower-detail-rise" style={{ ...base, width: 4, height: 4, background: accentSoft, borderRadius: 9999, boxShadow: `0 0 6px ${accent}` }} />;
    case "crystals":
      return (
        <span className="tower-detail-twinkle" style={{ ...base }}>
          <svg viewBox="0 0 12 16" width="11" height="15">
            <path d="M6 0 L11 6 L6 16 L1 6 Z" fill={accentSoft} opacity="0.85" />
          </svg>
        </span>
      );
    case "books":
      return (
        <span className="tower-detail-drift" style={{ ...base }}>
          <svg viewBox="0 0 14 12" width="14" height="12">
            <rect x="1" y="1" width="12" height="9" rx="1" fill={accent} opacity="0.7" />
            <line x1="7" y1="1" x2="7" y2="10" stroke={accentSoft} strokeWidth="1" />
          </svg>
        </span>
      );
    case "circuits":
      return (
        <span className="tower-detail-twinkle" style={{ ...base }}>
          <svg viewBox="0 0 18 8" width="18" height="8">
            <line x1="0" y1="4" x2="18" y2="4" stroke={accent} strokeWidth="1.4" opacity="0.7" />
            <rect x="6" y="1" width="6" height="6" fill="none" stroke={accentSoft} strokeWidth="1.2" />
          </svg>
        </span>
      );
    case "qparticles":
    default:
      return <span className="tower-detail-orbit" style={{ ...base, width: 5, height: 5, background: accentSoft, borderRadius: 9999, boxShadow: `0 0 8px ${accent}` }} />;
  }
}
