"use client";

import type { MonsterType } from "@/lib/tower/monsters";

/**
 * Quantum monster avatars for the Wizard Tower — pure SVG/CSS pixel art, no
 * image assets. Each family has idle / hit / attack / defeated states driven by
 * the `state` prop (animations live in globals.css and honor reduced motion).
 * Bosses render larger with an extra aura ring. Cute-intimidating, never scary.
 */

export type MonsterState = "idle" | "hit" | "attack" | "defeated";

export default function TowerMonster({
  type,
  state = "idle",
  boss = false,
  accent = "#a5b4fc",
  className,
}: {
  type: MonsterType;
  state?: MonsterState;
  boss?: boolean;
  accent?: string;
  className?: string;
}) {
  const stateClass =
    state === "defeated"
      ? "tower-mon-defeated"
      : state === "hit"
        ? "tower-mon-hit"
        : state === "attack"
          ? "tower-mon-attack"
          : "tower-mon-idle";

  const size = className ?? (boss ? "h-40 w-40 sm:h-52 sm:w-52" : "h-28 w-28 sm:h-32 sm:w-32");

  return (
    <span className={`relative inline-flex ${size}`}>
      {boss && (
        <span
          className="tower-boss-aura pointer-events-none absolute inset-[-12%] rounded-full"
          aria-hidden="true"
          style={{ background: `radial-gradient(circle, ${accent}55, transparent 70%)` }}
        />
      )}
      <svg
        viewBox="0 0 96 96"
        className={`relative h-full w-full ${stateClass}`}
        role="img"
        aria-label={`${type.replace(/-/g, " ")}${boss ? " boss" : ""}`}
        shapeRendering="geometricPrecision"
      >
        <defs>
          <linearGradient id={`mon-${type}`} x1="0" y1="0" x2="0" y2="1">
            {gradientStops(type)}
          </linearGradient>
        </defs>
        {boss && <circle cx="48" cy="48" r="44" fill="none" stroke={accent} strokeWidth="1.5" strokeDasharray="3 5" className="tower-boss-ring" opacity="0.7" />}
        {shape(type, accent)}
      </svg>
    </span>
  );
}

function gradientStops(type: MonsterType) {
  const map: Record<MonsterType, [string, string]> = {
    "concept-wraith": ["#818cf8", "#4338ca"],
    "phase-phantom": ["#c4b5fd", "#7c3aed"],
    "gate-golem": ["#cb9a5a", "#7a4a1f"],
    "noise-gremlin": ["#fbbf24", "#b45309"],
    "oracle-mimic": ["#5eead4", "#0f766e"],
    "interference-hydra": ["#7dd3fc", "#0369a1"],
    "entanglement-twins": ["#e9d5ff", "#7e22ce"],
    "algorithm-titan": ["#99f6e4", "#0f766e"],
    "qubit-shade": ["#a5b4fc", "#312e81"],
    observer: ["#f5d0fe", "#86198f"],
  };
  const [a, b] = map[type];
  return (
    <>
      <stop offset="0%" stopColor={a} />
      <stop offset="100%" stopColor={b} />
    </>
  );
}

function eyes(cx1: number, cx2: number, cy: number, fill = "#e0e7ff") {
  return (
    <>
      <ellipse cx={cx1} cy={cy} rx="5" ry="6" fill={fill} />
      <ellipse cx={cx2} cy={cy} rx="5" ry="6" fill={fill} />
      <circle cx={cx1} cy={cy} r="2" fill="#1e1b4b" />
      <circle cx={cx2} cy={cy} r="2" fill="#1e1b4b" />
    </>
  );
}

function shape(type: MonsterType, accent: string) {
  const fill = `url(#mon-${type})`;
  switch (type) {
    case "phase-phantom":
      return (
        <g>
          <path d="M30 78 Q24 90 18 94 L78 94 Q72 90 66 78 Z" fill={fill} opacity="0.6" />
          <path d="M48 14 C28 14 22 40 24 58 Q24 74 48 74 Q72 74 72 58 C74 40 68 14 48 14 Z" fill={fill} opacity="0.9" />
          {eyes(38, 58, 44)}
          <text x="48" y="65" textAnchor="middle" fill="#fde68a" fontSize="12" fontFamily="monospace">±φ</text>
        </g>
      );
    case "gate-golem":
      return (
        <g>
          <rect x="22" y="30" width="52" height="52" rx="4" fill={fill} />
          <rect x="30" y="14" width="14" height="14" rx="2" fill={fill} />
          <rect x="52" y="14" width="14" height="14" rx="2" fill={fill} />
          {eyes(38, 58, 46, "#fde9c8")}
          <text x="48" y="78" textAnchor="middle" fill="#fff7ed" fontSize="11" fontFamily="monospace">H · X</text>
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
        </g>
      );
    case "interference-hydra":
      return (
        <g>
          {/* three sinuous necks, each a "path" amplitude */}
          {[-1, 0, 1].map((d, i) => (
            <g key={i}>
              <path
                d={`M${48 + d * 16} 84 C${48 + d * 22} 60 ${40 + d * 10} 46 ${48 + d * 18} 30`}
                stroke={fill}
                strokeWidth="7"
                fill="none"
                strokeLinecap="round"
              />
              <circle cx={48 + d * 18} cy={28} r="7" fill={fill} />
              <circle cx={46 + d * 18} cy={27} r="1.6" fill="#082f49" />
              <circle cx={50 + d * 18} cy={27} r="1.6" fill="#082f49" />
            </g>
          ))}
          <ellipse cx="48" cy="84" rx="22" ry="8" fill={fill} opacity="0.85" />
          <path d="M30 88 q18 6 36 0" stroke={accent} strokeWidth="1.5" fill="none" opacity="0.7" />
        </g>
      );
    case "entanglement-twins":
      return (
        <g>
          <line x1="32" y1="50" x2="64" y2="50" stroke={accent} strokeWidth="2.5" strokeDasharray="3 3" className="tower-twin-link" />
          <g>
            <circle cx="30" cy="50" r="16" fill={fill} />
            <circle cx="26" cy="47" r="2" fill="#3b0764" />
            <circle cx="34" cy="47" r="2" fill="#3b0764" />
            <path d="M24 55 q6 4 12 0" stroke="#3b0764" strokeWidth="1.6" fill="none" strokeLinecap="round" />
          </g>
          <g>
            <circle cx="66" cy="50" r="16" fill={fill} />
            <circle cx="62" cy="47" r="2" fill="#3b0764" />
            <circle cx="70" cy="47" r="2" fill="#3b0764" />
            <path d="M60 55 q6 4 12 0" stroke="#3b0764" strokeWidth="1.6" fill="none" strokeLinecap="round" />
          </g>
        </g>
      );
    case "algorithm-titan":
      return (
        <g>
          <rect x="26" y="30" width="44" height="50" rx="6" fill={fill} />
          <path d="M30 30 L48 14 L66 30 Z" fill={fill} />
          <rect x="18" y="40" width="8" height="28" rx="3" fill={fill} />
          <rect x="70" y="40" width="8" height="28" rx="3" fill={fill} />
          {eyes(40, 56, 44, "#ccfbf1")}
          {/* circuit chest */}
          <g stroke="#022c22" strokeWidth="1.5" fill="none" opacity="0.7">
            <line x1="32" y1="62" x2="64" y2="62" />
            <line x1="32" y1="70" x2="64" y2="70" />
            <rect x="42" y="58" width="8" height="8" />
            <rect x="50" y="66" width="8" height="8" />
          </g>
        </g>
      );
    case "observer":
      return (
        <g>
          <g className="tower-observer-rays" stroke={accent} strokeWidth="2" strokeLinecap="round">
            {Array.from({ length: 12 }).map((_, i) => {
              const a = (i * Math.PI) / 6;
              return (
                <line
                  key={i}
                  x1={48 + Math.cos(a) * 30}
                  y1={48 + Math.sin(a) * 30}
                  x2={48 + Math.cos(a) * 40}
                  y2={48 + Math.sin(a) * 40}
                />
              );
            })}
          </g>
          <ellipse cx="48" cy="48" rx="34" ry="24" fill={fill} />
          <ellipse cx="48" cy="48" rx="16" ry="16" fill="#fdf4ff" />
          <circle cx="48" cy="48" r="8" fill="#86198f" className="tower-observer-pupil" />
          <circle cx="48" cy="48" r="3" fill="#1e1b4b" />
          <circle cx="44" cy="44" r="2" fill="#ffffff" opacity="0.9" />
        </g>
      );
    case "qubit-shade":
      return (
        <g>
          <path d="M30 80 Q22 92 16 94 L80 94 Q74 92 66 80 Z" fill={fill} opacity="0.5" />
          <ellipse cx="48" cy="48" rx="28" ry="34" fill={fill} opacity="0.9" />
          {eyes(38, 58, 42)}
          <text x="48" y="68" textAnchor="middle" fill="#fde68a" fontSize="13" fontFamily="monospace" className="tower-shade-flicker">
            |ψ⟩
          </text>
        </g>
      );
    case "concept-wraith":
    default:
      return (
        <g>
          <path d="M30 76 Q22 90 16 94 L80 94 Q74 90 66 76 Z" fill={fill} opacity="0.65" />
          <ellipse cx="48" cy="48" rx="26" ry="32" fill={fill} opacity="0.9" />
          {eyes(38, 58, 44)}
          <text x="48" y="64" textAnchor="middle" fill="#fde68a" fontSize="14" fontFamily="monospace">ψ</text>
        </g>
      );
  }
}

/** Light particles shown when a monster is defeated. */
export function DefeatSparkles({ accent = "#fde68a" }: { accent?: string }) {
  return (
    <span className="pointer-events-none absolute inset-0" aria-hidden="true">
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <span
          key={i}
          className="magic-mote absolute h-1.5 w-1.5 rounded-full"
          style={{
            top: `${18 + (i % 3) * 24}%`,
            left: `${12 + i * 12}%`,
            animationDelay: `${i * 0.1}s`,
            backgroundColor: accent,
          }}
        />
      ))}
    </span>
  );
}
