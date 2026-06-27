"use client";

import Link from "next/link";
import { useState } from "react";

/**
 * The Wizard Tower — a clean, frameless castle in the right rail beneath the
 * grimoire: centered, comfortably sized, with a clear "Enter the tower" CTA.
 * Magical dots drift up from the doorway (more/faster on hover); links to /tower.
 */
export default function TowerCard() {
  const [hover, setHover] = useState(false);

  return (
    <div className="mt-6 flex justify-center">
      <Link
        href="/tower"
        aria-label="Enter the Wizard Tower"
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        className="tower-trigger group relative flex flex-col items-center"
      >
        <div className="relative">
          <TowerArt active={hover} />
          <TowerMagic />
        </div>
        <span className="-mt-1 inline-flex items-center gap-1.5 rounded-full border border-indigo-400/40 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-100 transition-colors group-hover:bg-indigo-500/20">
          Enter the tower
          <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path d="M4 10 H15 M11 6 L15 10 L11 14" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </Link>
    </div>
  );
}

const BASE_DOTS = [
  { cx: 54, dx: -5, r: 1.6, delay: 0 },
  { cx: 58, dx: 3, r: 1.4, delay: -1.1 },
  { cx: 60, dx: -2, r: 1.8, delay: -2.2 },
  { cx: 62, dx: 4, r: 1.5, delay: -3.3 },
  { cx: 66, dx: 6, r: 1.6, delay: -4.4 },
  { cx: 56, dx: -4, r: 1.3, delay: -5.5 },
];
const EXTRA_DOTS = [
  { cx: 52, dx: -7, r: 1.5, delay: 0 },
  { cx: 57, dx: 2, r: 1.7, delay: 0.25 },
  { cx: 61, dx: -3, r: 1.4, delay: 0.5 },
  { cx: 64, dx: 5, r: 1.6, delay: 0.15 },
  { cx: 59, dx: -5, r: 1.3, delay: 0.4 },
  { cx: 63, dx: 7, r: 1.5, delay: 0.7 },
];

function TowerMagic() {
  return (
    <span className="pointer-events-none absolute inset-0" aria-hidden="true">
      <svg viewBox="0 0 120 200" className="h-full w-full" fill="none">
        {BASE_DOTS.map((p, i) => (
          <circle
            key={`b${i}`}
            cx={p.cx}
            cy={166}
            r={p.r}
            fill={i % 3 === 0 ? "#c4b5fd" : "#ffffff"}
            className="tower-dot"
            style={{ ["--dx" as string]: p.dx, animationDelay: `${p.delay}s` }}
          />
        ))}
        {EXTRA_DOTS.map((p, i) => (
          <circle
            key={`e${i}`}
            cx={p.cx}
            cy={166}
            r={p.r}
            fill={i % 3 === 0 ? "#c4b5fd" : "#ffffff"}
            className="tower-dot tower-dot-extra"
            style={{ ["--dx" as string]: p.dx, animationDelay: `${p.delay}s` }}
          />
        ))}
      </svg>
    </span>
  );
}

/** A tall pixel-stone castle. viewBox 120x200 (slender + tall). */
function TowerArt({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 120 200" className="h-60 w-36" aria-hidden="true">
      <defs>
        <linearGradient id="tower-stone-deep" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#818cf8" />
          <stop offset="55%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#3730a3" />
        </linearGradient>
        <linearGradient id="tower-door-glow" x1="0.5" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stopColor="#fde68a" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#6366f1" stopOpacity="0.2" />
        </linearGradient>
        <linearGradient id="tower-beam" x1="0.5" y1="1" x2="0.5" y2="0">
          <stop offset="0%" stopColor="#a78bfa" stopOpacity="0" />
          <stop offset="100%" stopColor="#fde68a" stopOpacity={active ? 0.7 : 0.35} />
        </linearGradient>
      </defs>

      {/* ground / foundation */}
      <rect x="0" y="188" width="120" height="12" fill="#312e81" />
      <rect x="8" y="182" width="104" height="8" rx="1" fill="#4338ca" />
      <rect x="14" y="176" width="92" height="6" fill="#4f46e5" opacity="0.9" />

      {/* base glow */}
      <ellipse cx="60" cy="188" rx="40" ry="6" fill="#6366f1" opacity="0.22" className="tower-base-glow" />

      {/* light beam from the spire when hovered */}
      <path
        d="M60 18 L50 188 L70 188 Z"
        fill="url(#tower-beam)"
        className={active ? "tower-beam-active" : "tower-beam-idle"}
        opacity="0.35"
      />

      {/* roof + tall body */}
      <path d="M30 60 L60 14 L90 60 Z" fill="url(#tower-stone-deep)" />
      <rect x="34" y="60" width="52" height="116" fill="url(#tower-stone-deep)" />

      {/* battlements */}
      <rect x="28" y="56" width="10" height="8" fill="#818cf8" />
      <rect x="46" y="52" width="12" height="12" fill="#a5b4fc" />
      <rect x="62" y="52" width="12" height="12" fill="#a5b4fc" />
      <rect x="82" y="56" width="10" height="8" fill="#818cf8" />

      {/* rune ring */}
      <circle
        cx="60"
        cy="78"
        r="14"
        fill="none"
        stroke="#c4b5fd"
        strokeWidth="1"
        strokeDasharray="3 4"
        className="tower-rune-ring"
        opacity="0.6"
      />

      {/* windows down the body */}
      <rect x="42" y="74" width="10" height="14" rx="1" fill={active ? "#fde68a" : "#c4b5fd"} className="tower-window-idle" />
      <rect x="68" y="74" width="10" height="14" rx="1" fill={active ? "#fde68a" : "#c4b5fd"} className="tower-window-idle" />
      <rect x="42" y="106" width="10" height="14" rx="1" fill="#c4b5fd" opacity="0.5" />
      <rect x="68" y="106" width="10" height="14" rx="1" fill="#c4b5fd" opacity="0.5" />
      <rect x="42" y="138" width="10" height="12" rx="0.5" fill="#312e81" opacity="0.45" />
      <rect x="68" y="138" width="10" height="12" rx="0.5" fill="#312e81" opacity="0.45" />

      {/* glowing doorway */}
      <path d="M48 158 Q60 148 72 158 V176 H48 Z" fill="url(#tower-door-glow)" className={active ? "tower-door-active" : ""} />
      <path d="M52 158 Q60 152 68 158 V172 H52 Z" fill="#312e81" opacity="0.35" />

      {/* spire */}
      <circle cx="60" cy="12" r="4" fill="#fbbf24" className="tower-spire" />
      <path d="M60 2 L64 16 L56 16 Z" fill="#fde68a" opacity="0.75" />

      {active && (
        <>
          <circle cx="60" cy="150" r="2" fill="#fde68a" className="tower-spark" />
          <circle cx="48" cy="80" r="1.5" fill="#c4b5fd" className="tower-spark" style={{ animationDelay: "0.3s" }} />
          <circle cx="72" cy="80" r="1.5" fill="#c4b5fd" className="tower-spark" style={{ animationDelay: "0.6s" }} />
        </>
      )}
    </svg>
  );
}
