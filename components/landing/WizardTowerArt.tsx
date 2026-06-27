"use client";

import WizardCompanion from "@/components/WizardCompanion";

/**
 * Decorative wizard-tower scene built only from SVG/CSS: a tower silhouette,
 * floating runes, a rising light beam, and a tiny guide wizard at the base.
 * Purely presentational; respects reduced motion via global animation classes.
 */
export default function WizardTowerArt({ className = "" }: { className?: string }) {
  return (
    <div className={`tower-scene relative rounded-3xl ${className}`} aria-hidden="true">
      <svg viewBox="0 0 220 260" className="h-full w-full" role="presentation">
        <defs>
          <linearGradient id="hero-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#312e81" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0.04" />
          </linearGradient>
          <linearGradient id="hero-stone" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#818cf8" />
            <stop offset="55%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#3730a3" />
          </linearGradient>
          <linearGradient id="hero-beam" x1="0.5" y1="1" x2="0.5" y2="0">
            <stop offset="0%" stopColor="#a78bfa" stopOpacity="0" />
            <stop offset="100%" stopColor="#fde68a" stopOpacity="0.55" />
          </linearGradient>
          <radialGradient id="hero-moon" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor="#fef3c7" />
            <stop offset="100%" stopColor="#fde68a" stopOpacity="0" />
          </radialGradient>
        </defs>

        <rect x="0" y="0" width="220" height="260" rx="24" fill="url(#hero-sky)" />

        {/* moon glow */}
        <circle cx="158" cy="56" r="40" fill="url(#hero-moon)" className="hero-moon" />
        <circle cx="158" cy="56" r="18" fill="#fde68a" opacity="0.85" className="tower-spire" />

        {/* floating runes */}
        <g className="rune-float" fill="none" stroke="#a5b4fc" strokeWidth="1.5">
          <circle cx="40" cy="60" r="9" strokeDasharray="3 4" />
          <path d="M40 56 L40 64 M36 60 L44 60" strokeLinecap="round" />
        </g>
        <g className="rune-float-slow" fill="none" stroke="#c4b5fd" strokeWidth="1.5">
          <rect x="178" y="120" width="16" height="16" rx="2" transform="rotate(45 186 128)" />
        </g>
        <g className="rune-float" fill="none" stroke="#818cf8" strokeWidth="1.5" style={{ animationDelay: "1.2s" }}>
          <path d="M28 150 q8 -10 16 0 t16 0" strokeLinecap="round" />
        </g>

        {/* light beam from the spire */}
        <path d="M110 30 L92 250 L128 250 Z" fill="url(#hero-beam)" className="tower-beam-active hero-beam" opacity="0.4" />

        {/* ground */}
        <ellipse cx="110" cy="246" rx="78" ry="10" fill="#6366f1" opacity="0.18" className="tower-base-glow" />

        {/* tower */}
        <path d="M78 96 L110 44 L142 96 Z" fill="url(#hero-stone)" />
        <rect x="82" y="96" width="56" height="140" fill="url(#hero-stone)" />
        {/* battlements */}
        <rect x="76" y="92" width="11" height="9" fill="#818cf8" />
        <rect x="95" y="88" width="13" height="13" fill="#a5b4fc" />
        <rect x="116" y="88" width="13" height="13" fill="#a5b4fc" />
        <rect x="133" y="92" width="11" height="9" fill="#818cf8" />
        {/* rune ring */}
        <circle cx="110" cy="120" r="15" fill="none" stroke="#c4b5fd" strokeWidth="1" strokeDasharray="3 4" className="tower-rune-ring" opacity="0.7" />
        {/* windows */}
        <rect x="92" y="116" width="11" height="15" rx="1.5" fill="#fde68a" className="tower-window-idle" />
        <rect x="117" y="116" width="11" height="15" rx="1.5" fill="#fde68a" className="tower-window-idle" />
        <rect x="90" y="146" width="9" height="11" rx="1" fill="#312e81" opacity="0.45" />
        <rect x="121" y="146" width="9" height="11" rx="1" fill="#312e81" opacity="0.45" />
        {/* glowing doorway */}
        <path d="M97 214 Q110 202 123 214 V236 H97 Z" fill="#fde68a" opacity="0.9" className="tower-window-active" />
        <path d="M102 214 Q110 206 118 214 V230 H102 Z" fill="#312e81" opacity="0.4" />
        {/* spire */}
        <circle cx="110" cy="42" r="4.5" fill="#fbbf24" className="tower-spire" />

        {/* sparkles that twinkle when the scene is hovered */}
        <g className="hero-spark" fill="#fde68a">
          <circle cx="158" cy="28" r="2" />
          <circle cx="188" cy="58" r="1.6" style={{ animationDelay: "0.3s" }} />
          <circle cx="130" cy="44" r="1.6" style={{ animationDelay: "0.6s" }} />
          <circle cx="110" cy="18" r="1.8" style={{ animationDelay: "0.45s" }} />
          <circle cx="176" cy="86" r="1.4" style={{ animationDelay: "0.8s" }} />
        </g>

        {/* on hover, wizards soar across the scene on brooms (right to left) */}
        <BroomWizard x={206} y={76} delay={0} />
        <BroomWizard x={216} y={130} delay={1.1} />
        <BroomWizard x={202} y={186} delay={2.2} />
      </svg>

      {/* tiny guide wizard at the tower base */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 translate-x-12">
        <WizardCompanion mood="idle" className="h-12 w-12" wandMode="glow" wandAim={-32} floppy={false} />
      </div>
    </div>
  );
}

/**
 * A broom-riding wizard, facing left. Idle/invisible until the scene is hovered,
 * then it soars right to left across the sky. The outer group sets the start
 * position, the middle group carries the flight animation, and the inner group
 * mirrors the (right-facing) sprite so it faces its direction of travel.
 */
function BroomWizard({ x, y, delay }: { x: number; y: number; delay: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <g className="hero-broom" style={{ animationDelay: `${delay}s` }}>
        <g transform="scale(-1 1)">
          {/* broom */}
          <line x1="-13" y1="4" x2="13" y2="-3" stroke="#7c3aed" strokeWidth="2.2" strokeLinecap="round" />
          <path d="M-13 4 l-5 1 M-13 4 l-4 3 M-13 4 l-2 5" stroke="#b45309" strokeWidth="1.6" strokeLinecap="round" />
          {/* rider */}
          <circle cx="1" cy="-3" r="4.2" fill="#6366f1" />
          <circle cx="5" cy="-7.5" r="2.6" fill="#f3c9a4" />
          <path d="M1.5 -8.5 L8.5 -8.5 L5 -14 Z" fill="#4338ca" />
          <circle cx="5" cy="-14" r="1" fill="#fbbf24" />
        </g>
      </g>
    </g>
  );
}
