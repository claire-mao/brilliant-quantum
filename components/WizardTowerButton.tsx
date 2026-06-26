"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

/**
 * Wizard Tower — a magical structure anchored to the bottom edge of the viewport.
 * Rises from the ground like a destination, not a floating chip.
 */
export default function WizardTowerButton() {
  const pathname = usePathname();
  const [hover, setHover] = useState(false);

  if (pathname === "/tower" || pathname.startsWith("/login") || pathname.startsWith("/signup")) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[60] flex justify-end pb-[env(safe-area-inset-bottom,0px)]">
      <Link
        href="/tower"
        aria-label="Enter Wizard Tower"
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        className={`pointer-events-auto group relative mr-3 flex flex-col items-center sm:mr-8 ${
          hover ? "tower-hover-lift" : ""
        }`}
      >
        <AnchoredTowerSvg active={hover} />
        <span className="absolute -top-1 left-1/2 z-10 -translate-x-1/2 rounded-full bg-indigo-950/80 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-indigo-100 opacity-0 shadow-lg ring-1 ring-indigo-400/40 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 sm:text-xs">
          Enter tower
        </span>
      </Link>
    </div>
  );
}

function AnchoredTowerSvg({ active }: { active: boolean }) {
  return (
    <svg
      viewBox="0 0 120 160"
      className="tower-anchored h-[7.5rem] w-[5.5rem] sm:h-[9.5rem] sm:w-[7rem]"
      aria-hidden="true"
    >
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

      {/* Ground / foundation flush with viewport bottom */}
      <rect x="0" y="148" width="120" height="12" fill="#312e81" />
      <rect x="8" y="142" width="104" height="8" rx="1" fill="#4338ca" />
      <rect x="14" y="136" width="92" height="6" fill="#4f46e5" opacity="0.9" />

      {/* Base glow pool */}
      <ellipse cx="60" cy="148" rx="42" ry="6" fill="#6366f1" opacity="0.22" className="tower-base-glow" />

      {/* Light beam from spire when hovered */}
      <path
        d="M60 18 L48 148 L72 148 Z"
        fill="url(#tower-beam)"
        className={active ? "tower-beam-active" : "tower-beam-idle"}
        opacity="0.35"
      />

      {/* Main structure */}
      <path d="M28 58 L60 14 L92 58 Z" fill="url(#tower-stone-deep)" />
      <rect x="32" y="58" width="56" height="78" fill="url(#tower-stone-deep)" />

      {/* Battlements */}
      <rect x="26" y="54" width="10" height="8" fill="#818cf8" />
      <rect x="44" y="50" width="12" height="12" fill="#a5b4fc" />
      <rect x="64" y="50" width="12" height="12" fill="#a5b4fc" />
      <rect x="84" y="54" width="10" height="8" fill="#818cf8" />

      {/* Rune ring */}
      <circle
        cx="60"
        cy="72"
        r="14"
        fill="none"
        stroke="#c4b5fd"
        strokeWidth="1"
        strokeDasharray="3 4"
        className="tower-rune-ring"
        opacity="0.6"
      />

      {/* Windows */}
      <rect x="40" y="68" width="10" height="14" rx="1" fill={active ? "#fde68a" : "#c4b5fd"} className="tower-window-idle" />
      <rect x="70" y="68" width="10" height="14" rx="1" fill={active ? "#fde68a" : "#c4b5fd"} className="tower-window-idle" />
      <rect x="38" y="92" width="8" height="10" rx="0.5" fill="#312e81" opacity="0.45" />
      <rect x="74" y="92" width="8" height="10" rx="0.5" fill="#312e81" opacity="0.45" />

      {/* Glowing doorway */}
      <path d="M48 118 Q60 108 72 118 V136 H48 Z" fill="url(#tower-door-glow)" className={active ? "tower-door-active" : ""} />
      <path d="M52 118 Q60 112 68 118 V132 H52 Z" fill="#312e81" opacity="0.35" />

      {/* Spire */}
      <circle cx="60" cy="12" r="4" fill="#fbbf24" className="tower-spire" />
      <path d="M60 2 L64 16 L56 16 Z" fill="#fde68a" opacity="0.75" />

      {active && (
        <>
          <circle cx="60" cy="110" r="2" fill="#fde68a" className="tower-spark" />
          <circle cx="48" cy="64" r="1.5" fill="#c4b5fd" className="tower-spark" style={{ animationDelay: "0.3s" }} />
          <circle cx="72" cy="64" r="1.5" fill="#c4b5fd" className="tower-spark" style={{ animationDelay: "0.6s" }} />
        </>
      )}
    </svg>
  );
}
