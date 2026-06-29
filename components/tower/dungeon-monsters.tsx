"use client";

import type { MonsterType } from "@/lib/tower/encounters";

/**
 * Quantum monster avatars for the Tower: pure SVG/CSS, no image assets. Each is
 * one of Eve's agents, drawn as crisp blocky pixel art so it reads at small
 * sizes, themed by the concept it guards. Every monster supports four states:
 *
 *   idle      gentle float / breathing
 *   attack    lunges left toward Alice & Bob (fires on a wrong answer)
 *   hit       recoils + flashes (fires on a correct answer)
 *   defeated  dissolves into light (fires on victory)
 *
 * An optional climate `accent` tints a soft aura so the creature belongs to the
 * room it haunts.
 */
export type MonsterFx = "idle" | "attack" | "hit" | "defeated";

function stateClass(state: MonsterFx): string {
  switch (state) {
    case "attack":
      return "tower-mon-attack";
    case "hit":
      return "tower-mon-hit";
    case "defeated":
      return "tower-mon-defeated";
    default:
      return "tower-mon-idle";
  }
}

export function MonsterAvatar({
  type,
  state = "idle",
  defeated = false,
  glitch = false,
  accent,
  className = "h-28 w-28 sm:h-36 sm:w-36",
}: {
  type: MonsterType;
  state?: MonsterFx;
  /** Back-compat: when true, force the defeated dissolve. */
  defeated?: boolean;
  glitch?: boolean;
  accent?: string;
  className?: string;
}) {
  const fx: MonsterFx = defeated ? "defeated" : state;
  const glitchClass = glitch && !defeated ? "tower-mon-glitch" : "";
  return (
    <svg
      viewBox="0 0 96 96"
      className={`${className} ${stateClass(fx)} ${glitchClass}`}
      style={{ transformBox: "fill-box", transformOrigin: "48px 86px" }}
      shapeRendering="crispEdges"
      role="img"
      aria-label={`${type.replace(/-/g, " ")}, an agent of Eve`}
    >
      <defs>
        <linearGradient id={`mon-${type}`} x1="0" y1="0" x2="0" y2="1">
          {gradientStops(type)}
        </linearGradient>
      </defs>
      {accent && <ellipse cx="48" cy="56" rx="40" ry="40" fill={accent} opacity="0.14" />}
      {shape(type)}
    </svg>
  );
}

function gradientStops(type: MonsterType) {
  switch (type) {
    case "phase-reaper":
      return (
        <>
          <stop offset="0%" stopColor="#c4b5fd" />
          <stop offset="100%" stopColor="#6d28d9" />
        </>
      );
    case "rune-gatekeeper":
      return (
        <>
          <stop offset="0%" stopColor="#9aa6b5" />
          <stop offset="100%" stopColor="#3f4a5a" />
        </>
      );
    case "static-imp":
      return (
        <>
          <stop offset="0%" stopColor="#fcd34d" />
          <stop offset="100%" stopColor="#b45309" />
        </>
      );
    case "false-oracle":
      return (
        <>
          <stop offset="0%" stopColor="#5eead4" />
          <stop offset="100%" stopColor="#0f766e" />
        </>
      );
    case "wave-hydra":
      return (
        <>
          <stop offset="0%" stopColor="#67e8f9" />
          <stop offset="100%" stopColor="#0e7490" />
        </>
      );
    case "twin-shades":
      return (
        <>
          <stop offset="0%" stopColor="#a5b4fc" />
          <stop offset="100%" stopColor="#4338ca" />
        </>
      );
    case "hollow-wraith":
    default:
      return (
        <>
          <stop offset="0%" stopColor="#818cf8" />
          <stop offset="100%" stopColor="#3730a3" />
        </>
      );
  }
}

/** A pair of glowing pixel eyes with dark pupils. */
function eyes(cx1: number, cx2: number, cy: number, glow = "#e0e7ff", pupil = "#1e1b4b") {
  return (
    <>
      <rect x={cx1 - 5} y={cy - 5} width="10" height="9" fill={glow} />
      <rect x={cx2 - 5} y={cy - 5} width="10" height="9" fill={glow} />
      <rect x={cx1 - 2} y={cy - 2} width="4" height="4" fill={pupil} />
      <rect x={cx2 - 2} y={cy - 2} width="4" height="4" fill={pupil} />
      <rect x={cx1 + 1} y={cy - 4} width="2" height="2" fill="#fff" opacity="0.85" />
      <rect x={cx2 + 1} y={cy - 4} width="2" height="2" fill="#fff" opacity="0.85" />
    </>
  );
}

function shape(type: MonsterType) {
  const fill = `url(#mon-${type})`;
  switch (type) {
    /* Hollow Wraith: a tattered cloaked spectre with a void where a face
       should be; a faint ψ burns in its chest. */
    case "hollow-wraith":
      return (
        <g>
          {/* tattered hem (stepped pixels) */}
          <rect x="22" y="78" width="10" height="10" fill={fill} opacity="0.7" />
          <rect x="38" y="80" width="10" height="8" fill={fill} opacity="0.7" />
          <rect x="54" y="78" width="10" height="10" fill={fill} opacity="0.7" />
          {/* cloak body */}
          <rect x="22" y="30" width="52" height="50" fill={fill} />
          <rect x="22" y="30" width="52" height="4" fill="#c7d2fe" opacity="0.4" />
          {/* hood peak */}
          <rect x="30" y="20" width="36" height="14" fill={fill} />
          <rect x="36" y="14" width="24" height="8" fill={fill} />
          {/* dark void inside the hood */}
          <rect x="32" y="26" width="32" height="26" fill="#0b0a1f" />
          {eyes(40, 56, 38, "#a5b4fc")}
          {/* hollow ψ ember */}
          <text x="48" y="70" textAnchor="middle" fill="#fde68a" fontSize="16" fontFamily="monospace">ψ</text>
          {/* drifting wisp arms */}
          <rect x="14" y="44" width="8" height="6" fill={fill} opacity="0.85" className="tower-mon-wisp" />
          <rect x="74" y="44" width="8" height="6" fill={fill} opacity="0.85" className="tower-mon-wisp" style={{ animationDelay: "0.4s" }} />
        </g>
      );

    /* Phase Reaper: a hooded reaper wielding a curved scythe; a ±φ rune orbits
       its blade. */
    case "phase-reaper":
      return (
        <g>
          {/* scythe (animated swing) */}
          <g className="tower-reaper-scythe" style={{ transformBox: "fill-box", transformOrigin: "78px 80px" }}>
            <rect x="76" y="20" width="4" height="62" fill="#3a2c4a" />
            <path d="M40 20 q40 -8 40 18 q-22 -10 -40 -2 Z" fill="#ddd6fe" />
            <path d="M40 20 q40 -8 40 18" fill="none" stroke="#a78bfa" strokeWidth="1.5" />
          </g>
          {/* robe */}
          <rect x="26" y="34" width="44" height="48" fill={fill} />
          <rect x="20" y="78" width="56" height="8" fill={fill} opacity="0.75" />
          <rect x="46" y="40" width="4" height="42" fill="#3b0764" opacity="0.5" />
          {/* hood */}
          <rect x="30" y="22" width="36" height="16" fill={fill} />
          <rect x="36" y="16" width="24" height="8" fill={fill} />
          <rect x="34" y="28" width="28" height="20" fill="#1a0b2e" />
          {eyes(42, 56, 38, "#d8b4fe", "#2e1065")}
          {/* phase rune */}
          <text x="49" y="70" textAnchor="middle" fill="#fde68a" fontSize="13" fontFamily="monospace">±φ</text>
          <circle cx="78" cy="20" r="4" fill="none" stroke="#c4b5fd" strokeWidth="1.5" className="dungeon-rune" />
        </g>
      );

    /* Rune Gatekeeper: a stone golem built of gate blocks (H X Z) with heavy
       arms and glowing rune eyes. */
    case "rune-gatekeeper":
      return (
        <g>
          {/* arms */}
          <rect x="10" y="42" width="12" height="30" fill={fill} />
          <rect x="74" y="42" width="12" height="30" fill={fill} />
          <rect x="8" y="68" width="16" height="12" fill={fill} />
          <rect x="72" y="68" width="16" height="12" fill={fill} />
          {/* torso of stacked gate blocks */}
          <rect x="24" y="30" width="48" height="52" fill={fill} />
          <rect x="24" y="30" width="48" height="4" fill="#cbd5e1" opacity="0.4" />
          {/* seams */}
          <rect x="24" y="48" width="48" height="2" fill="#1f2937" opacity="0.5" />
          <rect x="24" y="64" width="48" height="2" fill="#1f2937" opacity="0.5" />
          <rect x="47" y="30" width="2" height="52" fill="#1f2937" opacity="0.4" />
          {/* head */}
          <rect x="34" y="16" width="28" height="16" fill={fill} />
          {eyes(42, 54, 24, "#7dd3fc", "#0c1430")}
          {/* gate runes carved on the body */}
          <text x="36" y="46" textAnchor="middle" fill="#e2e8f0" fontSize="10" fontFamily="monospace">H</text>
          <text x="60" y="46" textAnchor="middle" fill="#e2e8f0" fontSize="10" fontFamily="monospace">X</text>
          <text x="48" y="62" textAnchor="middle" fill="#bae6fd" fontSize="10" fontFamily="monospace" className="dungeon-rune">Z</text>
        </g>
      );

    /* Static Imp: a small jagged gremlin of decohering static; pixels flicker
       around it. */
    case "static-imp":
      return (
        <g>
          {/* flickering static motes */}
          <rect x="16" y="26" width="4" height="4" fill="#fde68a" className="tower-imp-static" />
          <rect x="74" y="34" width="4" height="4" fill="#fde68a" className="tower-imp-static" style={{ animationDelay: "0.2s" }} />
          <rect x="22" y="62" width="3" height="3" fill="#fde68a" className="tower-imp-static" style={{ animationDelay: "0.45s" }} />
          <rect x="72" y="66" width="3" height="3" fill="#fde68a" className="tower-imp-static" style={{ animationDelay: "0.7s" }} />
          {/* jagged body */}
          <path
            d="M30 40 L24 30 L34 32 L32 22 L42 30 L48 18 L54 30 L64 22 L62 32 L72 30 L66 40 L74 52 L66 56 L70 74 L52 66 L48 76 L44 66 L26 74 L30 56 L22 52 Z"
            fill={fill}
          />
          {/* horns */}
          <rect x="34" y="20" width="4" height="6" fill="#7c2d12" />
          <rect x="58" y="20" width="4" height="6" fill="#7c2d12" />
          {eyes(40, 56, 44, "#fff7ed", "#7c2d12")}
          {/* sharp grin */}
          <path d="M40 56 l4 4 l4 -4 l4 4 l4 -4" stroke="#7c2d12" strokeWidth="2" fill="none" strokeLinecap="square" />
        </g>
      );

    /* False Oracle: a floating eye-orb set in a blocky shrine frame; speaks in
       riddles (a ? rune). */
    case "false-oracle":
      return (
        <g>
          {/* shrine frame */}
          <rect x="22" y="24" width="52" height="56" fill="#0f3d3a" />
          <rect x="22" y="24" width="52" height="56" fill="none" stroke={fill} strokeWidth="3" />
          <rect x="30" y="16" width="36" height="10" fill={fill} />
          <rect x="40" y="10" width="16" height="8" fill={fill} />
          {/* orb */}
          <rect x="30" y="34" width="36" height="36" fill={fill} />
          <ellipse cx="48" cy="52" rx="14" ry="14" fill="#ccfbf1" />
          {/* iris */}
          <circle cx="48" cy="52" r="7" fill="#0f766e" className="tower-oracle-iris" />
          <circle cx="48" cy="52" r="3" fill="#022c22" />
          <rect x="50" y="46" width="3" height="3" fill="#fff" opacity="0.9" />
          {/* riddle rune */}
          <text x="48" y="82" textAnchor="middle" fill="#ccfbf1" fontSize="14" fontFamily="monospace">?</text>
          <rect x="20" y="44" width="4" height="4" fill="#5eead4" className="dungeon-rune" />
          <rect x="72" y="44" width="4" height="4" fill="#5eead4" className="dungeon-rune" style={{ animationDelay: "0.5s" }} />
        </g>
      );

    /* Wave Hydra: three serpentine heads (each an amplitude) rising from a
       crested body. */
    case "wave-hydra":
      return (
        <g>
          {/* body / coil */}
          <rect x="28" y="60" width="40" height="24" fill={fill} />
          <rect x="22" y="78" width="52" height="8" fill={fill} opacity="0.7" />
          <path d="M28 66 q20 -10 40 0" fill="none" stroke="#cffafe" strokeWidth="2" opacity="0.4" />
          {/* three necks + heads */}
          {[
            { x: 30, d: "0s" },
            { x: 46, d: "0.3s" },
            { x: 62, d: "0.6s" },
          ].map((h, i) => (
            <g key={i} className="tower-hydra-head" style={{ transformBox: "fill-box", transformOrigin: `${h.x + 4}px 60px`, animationDelay: h.d }}>
              <rect x={h.x + 2} y="40" width="6" height="24" fill={fill} />
              <rect x={h.x - 2} y="30" width="14" height="12" fill={fill} />
              <rect x={h.x + 9} y="33" width="4" height="3" fill="#0e7490" />
              <rect x={h.x} y="33" width="3" height="3" fill="#022c22" />
            </g>
          ))}
        </g>
      );

    /* Twin Shades: two linked shade figures bound by an entanglement thread;
       what strikes one strikes both. */
    case "twin-shades":
      return (
        <g>
          {/* entanglement thread */}
          <line x1="34" y1="50" x2="62" y2="50" stroke="#fde68a" strokeWidth="2" strokeDasharray="3 3" className="tower-twin-link" />
          {[
            { x: 16, eye1: 22, eye2: 30 },
            { x: 52, eye1: 58, eye2: 66 },
          ].map((t, i) => (
            <g key={i}>
              {/* tattered hem */}
              <rect x={t.x} y="74" width="8" height="8" fill={fill} opacity="0.7" />
              <rect x={t.x + 12} y="76" width="8" height="6" fill={fill} opacity="0.7" />
              {/* body */}
              <rect x={t.x} y="34" width="28" height="44" fill={fill} />
              {/* hood */}
              <rect x={t.x + 4} y="24" width="20" height="12" fill={fill} />
              <rect x={t.x + 6} y="30" width="16" height="14" fill="#1e1b4b" />
              {eyes(t.eye1, t.eye2, 38, "#c7d2fe")}
            </g>
          ))}
        </g>
      );
  }
}

/**
 * Eve, the Observer: the recurring shadow boss. An elegant hooded mage crowned by
 * an eye-like quantum halo, casting a measurement beam. Larger and more dramatic
 * than ordinary agents; pulses when enraged at low stability.
 */
export function EveBoss({
  defeated = false,
  enraged = false,
  glitch = false,
  className = "h-44 w-44 sm:h-56 sm:w-56",
}: {
  defeated?: boolean;
  enraged?: boolean;
  glitch?: boolean;
  className?: string;
}) {
  const glitchClass = glitch && !defeated ? "tower-mon-glitch" : "";
  return (
    <svg
      viewBox="0 0 120 140"
      className={`${className} overflow-visible ${glitchClass} ${defeated ? "tower-mon-defeated" : enraged ? "eve-enraged" : "eve-float"}`}
      shapeRendering="crispEdges"
      role="img"
      aria-label="Eve, the Observer"
    >
      {/* measurement beam */}
      <rect x="58" y="2" width="4" height="134" fill="#bfdbfe" opacity="0.25" className="eve-beam" />

      {/* eye-like quantum halo behind the head */}
      <g className="eve-halo" style={{ transformBox: "fill-box", transformOrigin: "60px 36px" }}>
        <ellipse cx="60" cy="36" rx="34" ry="14" fill="none" stroke="#a5b4fc" strokeWidth="1.5" opacity="0.55" />
        <ellipse cx="60" cy="36" rx="24" ry="9" fill="none" stroke="#c4b5fd" strokeWidth="1" opacity="0.4" />
        <rect x="92" y="34" width="4" height="4" fill="#dbeafe" />
        <rect x="24" y="34" width="4" height="4" fill="#dbeafe" />
      </g>

      {/* robe body */}
      <path d="M60 44 C42 44 36 64 34 92 L30 132 L90 132 L86 92 C84 64 78 44 60 44 Z" fill="#1e1b4b" />
      <path d="M60 44 C50 44 44 58 42 78 L40 132 L60 132 Z" fill="#312e81" opacity="0.7" />
      {/* sleeves */}
      <path d="M36 70 L22 104 L34 106 Z" fill="#1e1b4b" />
      <path d="M84 70 L98 104 L86 106 Z" fill="#1e1b4b" />
      <rect x="20" y="100" width="8" height="8" fill="#312e81" />
      <rect x="92" y="100" width="8" height="8" fill="#312e81" />

      {/* hood */}
      <path d="M60 18 C44 18 38 34 40 52 L80 52 C82 34 76 18 60 18 Z" fill="#0f0a1e" />
      <path d="M60 24 C50 24 45 36 46 50 L74 50 C75 36 70 24 60 24 Z" fill="#000" opacity="0.7" />
      {/* the observer eye */}
      <ellipse cx="60" cy="42" rx="10" ry="6" fill="#1e1b4b" />
      <ellipse cx="60" cy="42" rx="8" ry="4.5" fill="#c4b5fd" className="eve-eye" />
      <circle cx="60" cy="42" r="2.4" fill="#1e1b4b" />
      <rect x="59" y="41" width="1.5" height="1.5" fill="#fff" />

      {/* hem trim */}
      <rect x="30" y="129" width="60" height="3" fill="#4338ca" opacity="0.6" />
    </svg>
  );
}

/** Light particles shown when an enemy is defeated. */
export function DefeatSparkles({ big = false }: { big?: boolean }) {
  const n = big ? [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] : [0, 1, 2, 3, 4, 5, 6];
  return (
    <span className="pointer-events-none absolute inset-0" aria-hidden="true">
      {n.map((i) => (
        <span
          key={i}
          className="magic-mote absolute h-1.5 w-1.5 rounded-full bg-amber-300"
          style={{
            top: `${12 + (i % 4) * 22}%`,
            left: `${8 + i * 9}%`,
            animationDelay: `${i * 0.08}s`,
          }}
        />
      ))}
    </span>
  );
}
