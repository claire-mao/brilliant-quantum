"use client";

import { useState } from "react";
import { FLAME_DOT, FLAME_GLOW_R, FLAME_ORIGIN_STYLE } from "@/components/tower/flame-glow";

/**
 * The Tower entrance: a rough rock wall fills the whole page, with an arched
 * dressed-stone gateway centered on it. The arched double doors sit on the stone
 * floor; behind them a solid white void (hidden when closed) floods out when they
 * swing open, then the light fills the view. A delicate glowing sigil rides the
 * doors. Pixel/SVG + CSS only; the swing is skipped under prefers-reduced-motion.
 */
export default function TowerGate({
  onEnter,
  canEnter,
  reduce,
}: {
  /** Called after the door animation (or immediately when motion is reduced). */
  onEnter: () => void;
  /** Sync gate before opening; return false to block the white flash animation. */
  canEnter?: () => boolean;
  reduce: boolean;
}) {
  const [opening, setOpening] = useState(false);

  function handleEnter() {
    if (opening) return;
    if (canEnter && !canEnter()) return;
    if (reduce) {
      onEnter();
      return;
    }
    setOpening(true);
    window.setTimeout(() => {
      onEnter();
      // Parent may reject entry (e.g. floor still locked); undo the white flash.
      setOpening(false);
    }, 1200);
  }

  return (
    <button
      type="button"
      onClick={handleEnter}
      aria-label="Open the tower doors"
      className={`tower-gate group relative flex w-full flex-1 cursor-pointer flex-col overflow-hidden ${opening ? "opening" : ""}`}
    >
      <div className="gate-frame relative w-full flex-1 overflow-hidden min-h-[60vh]">
        {/* rough rock wall fills the entire page */}
        <svg className="absolute inset-0 h-full w-full" aria-hidden="true">
          <defs>
            <pattern id="gate-rock" width="64" height="72" patternUnits="userSpaceOnUse">
              <rect width="64" height="72" fill="#4e565f" />
              <rect x="0" y="0" width="32" height="36" fill="#5b636f" />
              <rect x="32" y="0" width="32" height="36" fill="#4a525b" />
              <rect x="-16" y="36" width="32" height="36" fill="#535b66" />
              <rect x="16" y="36" width="32" height="36" fill="#48505a" />
              <rect x="48" y="36" width="32" height="36" fill="#535b66" />
              <rect x="0" y="0" width="64" height="2" fill="#2f343c" opacity="0.5" />
              <rect x="0" y="36" width="64" height="2" fill="#2f343c" opacity="0.5" />
              <rect x="32" y="0" width="2" height="36" fill="#2f343c" opacity="0.4" />
              <rect x="16" y="36" width="2" height="36" fill="#2f343c" opacity="0.4" />
              <rect x="48" y="36" width="2" height="36" fill="#2f343c" opacity="0.4" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#gate-rock)" />
        </svg>

        {/* stone floor spanning the page */}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-[#4b525c]">
          <div className="h-[3px] w-full bg-[#5e6671]" />
        </div>

        {/* centered arched gateway sitting on the floor (fills the available height) */}
        <div className="absolute inset-x-0 top-2 bottom-16 flex justify-center">
          <svg viewBox="0 0 320 304" className="h-full max-h-full w-auto max-w-full" shapeRendering="geometricPrecision" aria-hidden="true">
            {/* dressed-stone jambs */}
            {[52, 248].map((x) => (
              <g key={x}>
                <rect x={x} y="132" width="20" height="172" fill="#7b8593" />
                <rect x={x} y="132" width="20" height="172" fill="#000" opacity="0.06" />
                {[160, 196, 232, 268].map((y) => (
                  <rect key={y} x={x} y={y} width="20" height="2" fill="#4b525c" opacity="0.6" />
                ))}
                <rect x={x} y="132" width="20" height="3" fill="#959fac" />
              </g>
            ))}

            {/* dressed-stone arch band */}
            <path
              d="M52 140 Q64 44 160 36 Q256 44 268 140 L248 140 Q232 72 160 64 Q88 72 72 140 Z"
              fill="#7b8593"
            />
            <path d="M52 140 Q64 44 160 36 Q256 44 268 140" fill="none" stroke="#959fac" strokeWidth="2" />
            {[-50, -25, 0, 25, 50].map((d) => {
              const a = ((d - 90) * Math.PI) / 180;
              return (
                <line
                  key={d}
                  x1={160 + Math.cos(a) * 78}
                  y1={92 + Math.sin(a) * 64}
                  x2={160 + Math.cos(a) * 100}
                  y2={92 + Math.sin(a) * 84}
                  stroke="#4b525c"
                  strokeWidth="1.5"
                  opacity="0.6"
                />
              );
            })}
            <rect x="152" y="34" width="16" height="16" fill="#8b96a4" stroke="#5b6470" strokeWidth="1.5" />

            {/* solid black void behind the doors: opening them reveals darkness,
                not the rock wall (the white step-through flash handles the entry) */}
            <g className="gate-light" style={{ transformBox: "fill-box", transformOrigin: "center" }}>
              <path d="M72 304 L72 140 Q88 72 160 64 Q232 72 248 140 L248 304 Z" fill="#000000" />
            </g>

            {/* left leaf (arched, hinged on the left) */}
            <g className="gate-leaf-l" style={{ transformBox: "fill-box", transformOrigin: "0% 50%" }}>
              <path d="M72 304 L72 140 Q88 72 160 64 L160 304 Z" fill="#5a4632" />
              <path d="M72 304 L72 140 Q88 72 160 64 L160 304 Z" fill="#000" opacity="0.1" />
              <rect x="98" y="120" width="2" height="184" fill="#3a2c1c" />
              <rect x="126" y="96" width="2" height="208" fill="#3a2c1c" />
              <rect x="64" y="220" width="10" height="1.5" fill="#3a2c1c" opacity="0.6" />
              <rect x="108" y="270" width="12" height="1.5" fill="#3a2c1c" opacity="0.6" />
              {[150, 256].map((y) => (
                <g key={y}>
                  <rect x="72" y={y} width="66" height="11" fill="#211d16" />
                  <rect x="72" y={y} width="66" height="2" fill="#3a352b" opacity="0.6" />
                  <path d={`M138 ${y - 1} L151 ${y + 5.5} L138 ${y + 12} Z`} fill="#211d16" />
                  <circle cx="131" cy={y + 5.5} r="5.5" fill="#2b261d" stroke="#3a352b" strokeWidth="1" />
                  <circle cx="82" cy={y + 5.5} r="2" fill="#3a352b" />
                  <circle cx="96" cy={y + 5.5} r="2" fill="#3a352b" />
                  <circle cx="110" cy={y + 5.5} r="2" fill="#3a352b" />
                </g>
              ))}
              <circle cx="142" cy="212" r="9" fill="none" stroke="#211d16" strokeWidth="4" />
              <circle cx="142" cy="203" r="2.5" fill="#2b261d" />
            </g>

            {/* right leaf (arched, hinged on the right) + the sigil rides it */}
            <g className="gate-leaf-r" style={{ transformBox: "fill-box", transformOrigin: "100% 50%" }}>
              <path d="M248 304 L248 140 Q232 72 160 64 L160 304 Z" fill="#5a4632" />
              <path d="M248 304 L248 140 Q232 72 160 64 L160 304 Z" fill="#000" opacity="0.1" />
              <rect x="220" y="120" width="2" height="184" fill="#3a2c1c" />
              <rect x="192" y="96" width="2" height="208" fill="#3a2c1c" />
              <rect x="246" y="220" width="10" height="1.5" fill="#3a2c1c" opacity="0.6" />
              <rect x="200" y="270" width="12" height="1.5" fill="#3a2c1c" opacity="0.6" />
              {[150, 256].map((y) => (
                <g key={y}>
                  <rect x="182" y={y} width="66" height="11" fill="#211d16" />
                  <rect x="182" y={y} width="66" height="2" fill="#3a352b" opacity="0.6" />
                  <path d={`M182 ${y - 1} L169 ${y + 5.5} L182 ${y + 12} Z`} fill="#211d16" />
                  <circle cx="189" cy={y + 5.5} r="5.5" fill="#2b261d" stroke="#3a352b" strokeWidth="1" />
                  <circle cx="238" cy={y + 5.5} r="2" fill="#3a352b" />
                  <circle cx="224" cy={y + 5.5} r="2" fill="#3a352b" />
                  <circle cx="210" cy={y + 5.5} r="2" fill="#3a352b" />
                </g>
              ))}
              <circle cx="178" cy="212" r="9" fill="none" stroke="#211d16" strokeWidth="4" />
              <circle cx="178" cy="203" r="2.5" fill="#2b261d" />
              <Sigil />
            </g>

            {/* wall sconces on the jambs: static flame, breathing hue ring */}
            {[62, 258].map((x) => {
              const flameCy = 189;
              return (
                <g key={x}>
                  <rect x={x - 2} y="198" width="4" height="8" fill="#2b261d" />
                  <rect x={x - 4} y="196" width="8" height="3" fill="#2b261d" />
                  <g transform={`translate(${x}, ${flameCy})`}>
                    <circle
                      cx={FLAME_DOT.sconce.cx}
                      cy={FLAME_DOT.sconce.cy}
                      r={FLAME_GLOW_R.sconce}
                      fill="#7dd3fc"
                      opacity="0.18"
                      className="torch-glow"
                      style={FLAME_ORIGIN_STYLE}
                    />
                    <g className="torch-flame" style={FLAME_ORIGIN_STYLE}>
                      <rect x={-2} y={-3} width="4" height="10" fill="#7dd3fc" />
                      <rect x={-1} y={-7} width="2" height="6" fill="#e0f2fe" />
                    </g>
                  </g>
                </g>
              );
            })}
          </svg>
        </div>

        {/* drifting dust */}
        {[
          { left: "26%", top: "26%", d: "0s" },
          { left: "70%", top: "30%", d: "1.4s" },
          { left: "44%", top: "62%", d: "2.6s" },
          { left: "60%", top: "70%", d: "0.8s" },
        ].map((p, i) => (
          <span
            key={i}
            className="dungeon-dust absolute h-1 w-1 rounded-full bg-cyan-100"
            style={{ left: p.left, top: p.top, animationDelay: p.d }}
          />
        ))}
      </div>

      {/* the light floods the whole view as you step through */}
      <span className="gate-flash pointer-events-none absolute inset-0 bg-white" aria-hidden="true" />
    </button>
  );
}

/** A delicate, whole glowing sigil: thin rings, atom-like orbits, a fine star core. */
function Sigil() {
  const cx = 160;
  const cy = 196;
  return (
    <g className="gate-symbol">
      <circle cx={cx} cy={cy} r="34" fill="#67e8f9" opacity="0.16" className="gate-rune" />
      <circle cx={cx} cy={cy} r="30" fill="none" stroke="#67e8f9" strokeWidth="1.5" />
      {Array.from({ length: 12 }).map((_, i) => {
        const a = (i * 30 * Math.PI) / 180;
        return (
          <line
            key={i}
            x1={cx + Math.cos(a) * 26}
            y1={cy + Math.sin(a) * 26}
            x2={cx + Math.cos(a) * 30}
            y2={cy + Math.sin(a) * 30}
            stroke="#a5f3fc"
            strokeWidth="1"
            opacity="0.7"
          />
        );
      })}
      {[0, 60, 120].map((deg) => (
        <ellipse
          key={deg}
          cx={cx}
          cy={cy}
          rx="26"
          ry="9"
          fill="none"
          stroke="#7dd3fc"
          strokeWidth="1"
          opacity="0.55"
          transform={`rotate(${deg} ${cx} ${cy})`}
        />
      ))}
      <circle cx={cx} cy={cy} r="13" fill="#0e2233" stroke="#a5f3fc" strokeWidth="1" />
      <path d={`M${cx} ${cy - 12} L${cx + 3} ${cy} L${cx} ${cy + 12} L${cx - 3} ${cy} Z`} fill="#cffafe" />
      <path d={`M${cx - 12} ${cy} L${cx} ${cy - 3} L${cx + 12} ${cy} L${cx} ${cy + 3} Z`} fill="#cffafe" />
      <circle cx={cx} cy={cy} r="3" fill="#ffffff" />
      {[
        [cx, cy - 36],
        [cx, cy + 36],
        [cx - 36, cy],
        [cx + 36, cy],
      ].map(([x, y], i) => (
        <rect key={i} x={x - 2} y={y - 2} width="4" height="4" fill="#67e8f9" opacity="0.85" transform={`rotate(45 ${x} ${y})`} />
      ))}
    </g>
  );
}
