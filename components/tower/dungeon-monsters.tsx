"use client";

import type { MonsterType } from "@/lib/tower/encounters";

/**
 * Quantum monster avatars for the Tower Arena — pure SVG/CSS, no image assets.
 * Each idles with a gentle bob and dissolves into light when defeated.
 */
export function MonsterAvatar({
  type,
  defeated = false,
  className = "h-28 w-28 sm:h-36 sm:w-36",
}: {
  type: MonsterType;
  defeated?: boolean;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 96 96"
      className={`${className} ${defeated ? "concept-defeated" : "concept-wraith-idle"}`}
      role="img"
      aria-label={`${type.replace("-", " ")} monster`}
    >
      <defs>
        <linearGradient id={`mon-${type}`} x1="0" y1="0" x2="0" y2="1">
          {gradientStops(type)}
        </linearGradient>
      </defs>
      {shape(type)}
    </svg>
  );
}

function gradientStops(type: MonsterType) {
  switch (type) {
    case "phase-phantom":
      return (
        <>
          <stop offset="0%" stopColor="#c4b5fd" />
          <stop offset="100%" stopColor="#7c3aed" />
        </>
      );
    case "gate-golem":
      return (
        <>
          <stop offset="0%" stopColor="#94a3b8" />
          <stop offset="100%" stopColor="#475569" />
        </>
      );
    case "noise-gremlin":
      return (
        <>
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#b45309" />
        </>
      );
    case "oracle-mimic":
      return (
        <>
          <stop offset="0%" stopColor="#5eead4" />
          <stop offset="100%" stopColor="#0f766e" />
        </>
      );
    case "concept-wraith":
    default:
      return (
        <>
          <stop offset="0%" stopColor="#818cf8" />
          <stop offset="100%" stopColor="#4338ca" />
        </>
      );
  }
}

function eyes(cx1: number, cx2: number, cy: number, fill = "#c4b5fd") {
  return (
    <>
      <ellipse cx={cx1} cy={cy} rx="5" ry="6" fill={fill} />
      <ellipse cx={cx2} cy={cy} rx="5" ry="6" fill={fill} />
      <circle cx={cx1} cy={cy} r="2" fill="#1e1b4b" />
      <circle cx={cx2} cy={cy} r="2" fill="#1e1b4b" />
    </>
  );
}

function shape(type: MonsterType) {
  const fill = `url(#mon-${type})`;
  switch (type) {
    case "phase-phantom":
      return (
        <g>
          <path d="M30 78 Q24 90 18 94 L78 94 Q72 90 66 78 Z" fill={fill} opacity="0.6" />
          <path d="M48 14 C28 14 22 40 24 58 Q24 74 48 74 Q72 74 72 58 C74 40 68 14 48 14 Z" fill={fill} opacity="0.85" />
          {eyes(38, 58, 44)}
          <text x="48" y="64" textAnchor="middle" fill="#fde68a" fontSize="13" fontFamily="monospace">±φ</text>
          <path d="M16 30 q8 -8 16 0 t16 0" stroke="#a5b4fc" strokeWidth="2" fill="none" strokeLinecap="round" className="wand-particle" />
        </g>
      );
    case "gate-golem":
      return (
        <g>
          <rect x="22" y="30" width="52" height="52" rx="4" fill={fill} />
          <rect x="30" y="14" width="14" height="14" rx="2" fill={fill} />
          <rect x="52" y="14" width="14" height="14" rx="2" fill={fill} />
          {eyes(38, 58, 46, "#cbd5e1")}
          <rect x="36" y="60" width="24" height="6" rx="1" fill="#1e293b" opacity="0.5" />
          <text x="48" y="78" textAnchor="middle" fill="#e2e8f0" fontSize="11" fontFamily="monospace">H · X</text>
          <rect x="14" y="44" width="8" height="20" rx="2" fill={fill} />
          <rect x="74" y="44" width="8" height="20" rx="2" fill={fill} />
        </g>
      );
    case "noise-gremlin":
      return (
        <g>
          <path
            d="M48 16 L58 30 L74 28 L64 42 L80 50 L62 56 L66 74 L48 64 L30 74 L34 56 L16 50 L32 42 L22 28 L38 30 Z"
            fill={fill}
          />
          {eyes(40, 56, 46, "#fff7ed")}
          <path d="M40 60 q8 6 16 0" stroke="#7c2d12" strokeWidth="2" fill="none" strokeLinecap="round" />
          <circle cx="24" cy="24" r="2" fill="#fbbf24" className="wand-particle" />
          <circle cx="74" cy="66" r="2" fill="#fbbf24" className="wand-particle" style={{ animationDelay: "0.3s" }} />
        </g>
      );
    case "oracle-mimic":
      return (
        <g>
          <rect x="22" y="40" width="52" height="40" rx="4" fill={fill} />
          <path d="M22 44 Q22 26 48 26 Q74 26 74 44 Z" fill={fill} />
          <rect x="20" y="52" width="56" height="8" rx="2" fill="#0f3d3a" opacity="0.5" />
          <ellipse cx="48" cy="44" rx="9" ry="10" fill="#ccfbf1" />
          <circle cx="48" cy="44" r="4" fill="#0f766e" />
          <circle cx="48" cy="44" r="1.6" fill="#022c22" />
          <text x="48" y="76" textAnchor="middle" fill="#ccfbf1" fontSize="14" fontFamily="monospace">?</text>
          <path d="M30 80 l4 8 M66 80 l-4 8" stroke="#0f766e" strokeWidth="3" strokeLinecap="round" />
        </g>
      );
    case "concept-wraith":
    default:
      return (
        <g>
          <path d="M30 76 Q22 90 16 94 L80 94 Q74 90 66 76 Z" fill={fill} opacity="0.65" />
          <ellipse cx="48" cy="48" rx="26" ry="32" fill={fill} opacity="0.88" />
          {eyes(38, 58, 44)}
          <text x="48" y="64" textAnchor="middle" fill="#fde68a" fontSize="14" fontFamily="monospace">ψ</text>
          <path d="M22 52 Q8 46 6 58" stroke="#6366f1" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M74 52 Q88 46 90 58" stroke="#6366f1" strokeWidth="3" fill="none" strokeLinecap="round" />
        </g>
      );
  }
}

/** Light particles shown when a monster is defeated. */
export function DefeatSparkles() {
  return (
    <span className="pointer-events-none absolute inset-0" aria-hidden="true">
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <span
          key={i}
          className="magic-mote absolute h-1.5 w-1.5 rounded-full bg-amber-300"
          style={{
            top: `${18 + (i % 3) * 24}%`,
            left: `${12 + i * 12}%`,
            animationDelay: `${i * 0.1}s`,
          }}
        />
      ))}
    </span>
  );
}
