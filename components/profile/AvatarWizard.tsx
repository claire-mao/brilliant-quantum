"use client";

import { useEffect } from "react";
import type { AuraStyle, AvatarConfig } from "@/lib/profile/avatar";
import { playAura, playCatMeow, startAuraLoop, stopAuraLoop } from "@/lib/sound/sounds";

const CX = 60;
const CY = 68;

/**
 * A customizable SVG wizard avatar. Colors, wand style, a single self-contained
 * aura, and an optional familiar cat are driven by AvatarConfig. The wizard is
 * faceless (a shadowed hood) with a full beard. SVG/CSS only; aura, wand-cast,
 * and cat animations respect prefers-reduced-motion via CSS.
 *
 * On hover the wand rises and "casts" the aura spell (the aura pulses). `meow`
 * triggers a one-shot cat reaction.
 */
export default function AvatarWizard({
  config,
  className = "h-32 w-32",
  meow = false,
}: {
  config: AvatarConfig;
  className?: string;
  meow?: boolean;
}) {
  const { hat, robe, aura, wand, familiar, auraStyle } = config;

  // Stop any aura sound loop if this avatar unmounts while still hovered.
  useEffect(() => () => stopAuraLoop(), []);

  return (
    <svg
      viewBox="0 0 120 140"
      className={`avatar-wizard overflow-visible ${className}`}
      role="img"
      aria-label="Your wizard avatar"
      onPointerEnter={(e) => {
        if (e.pointerType === "mouse") startAuraLoop(auraStyle);
      }}
      onPointerLeave={(e) => {
        if (e.pointerType === "mouse") stopAuraLoop();
      }}
      onPointerCancel={() => stopAuraLoop()}
      onPointerDown={(e) => {
        if (e.pointerType === "mouse") return;
        playAura(auraStyle);
        if (familiar) playCatMeow();
      }}
    >
      <g className="aura-cast">
        <Aura style={auraStyle} color={aura} />
      </g>

      {/* robe */}
      <path d="M44 66 L76 66 L90 126 L30 126 Z" fill={robe} />
      <path d="M30 126 L90 126 L92 132 L28 132 Z" fill="#000" opacity="0.18" />
      {/* arms */}
      <path d="M44 70 L34 98 L45 100 L52 74 Z" fill={robe} />
      <path d="M76 70 L86 98 L75 100 L68 74 Z" fill={robe} />
      {/* hands */}
      <circle cx="40" cy="99" r="4" fill="#f3c9a4" />
      <circle cx="80" cy="99" r="4" fill="#f3c9a4" />

      {familiar && <FamiliarCat meow={meow} />}

      {/* shadowed hood (faceless) + full, wide beard */}
      <ellipse cx="60" cy="58" rx="13" ry="10" fill="#1e1b4b" />
      <path d="M46 56 L74 56 C77 72 70 88 60 93 C50 88 43 72 46 56 Z" fill="#eef2f7" />
      <path d="M46 56 L74 56 L70 62 L50 62 Z" fill="#cbd5e1" opacity="0.4" />

      {/* wand (rises + casts on hover) */}
      <g className="wand-cast">
        <line x1="80" y1="100" x2="102" y2="56" stroke="#7c3aed" strokeWidth="4" strokeLinecap="round" />
        <circle cx="104" cy="52" r="11" fill={aura} opacity="0.35" className="avatar-wand-glow" />
        <WandTip style={wand} color={aura} />
      </g>

      {/* hat (lowered so it sits close to the body) */}
      <path d="M40 50 L60 10 L80 50 Z" fill={hat} />
      <path d="M34 50 L86 50 L81 56 L39 56 Z" fill={hat} />
      <path d="M34 50 L86 50 L81 56 L39 56 Z" fill="#000" opacity="0.15" />
      <path d="M60 28 L62 34 L68 34 L63 38 L65 44 L60 40 L55 44 L57 38 L52 34 L58 34 Z" fill="#fbbf24" />
    </svg>
  );
}

function WandTip({ style, color }: { style: AvatarConfig["wand"]; color: string }) {
  if (style === "crystal") {
    return <path d="M104 44 L110 52 L104 62 L98 52 Z" fill={color} stroke="#fff" strokeWidth="0.8" />;
  }
  if (style === "star") {
    return (
      <path
        d="M104 44 L106 50 L112 50 L107 54 L109 60 L104 56 L99 60 L101 54 L96 50 L102 50 Z"
        fill={color}
        stroke="#fff"
        strokeWidth="0.6"
      />
    );
  }
  return <circle cx="104" cy="52" r="6" fill={color} stroke="#fff" strokeWidth="0.8" />;
}

/* ----------------------------- Familiar cat ----------------------------- */

function FamiliarCat({ meow }: { meow: boolean }) {
  return (
    <g className={`cat ${meow ? "meow-active" : ""}`} aria-hidden="true">
      <ellipse cx="22" cy="122" rx="11" ry="7" fill="#64748b" />
      <path className="meow-tail" d="M32 120 Q42 111 37 125" stroke="#475569" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <g
        className="meow-head"
        onAnimationStart={() => playCatMeow()}
        onAnimationIteration={() => playCatMeow()}
      >
        <circle cx="13" cy="115" r="5.5" fill="#64748b" />
        <path d="M9 110 L12 115 L15 112 Z" fill="#64748b" />
        <path d="M16 110 L18 115 L21 111 Z" fill="#64748b" />
        <circle cx="11" cy="114" r="1" fill="#1f2937" />
        <circle cx="15" cy="114" r="1" fill="#1f2937" />
        <ellipse className="meow-mouth" cx="13" cy="117.5" rx="1.4" ry="1.2" fill="#1f2937" />
      </g>
      <g className="meow-wave" stroke="#94a3b8" strokeWidth="1" fill="none" strokeLinecap="round">
        <path d="M4 112 Q1.5 114 4 116" />
        <path d="M1 110 Q-2.5 114 1 118" />
      </g>
    </g>
  );
}

/* ----------------------------- Aura ----------------------------- */

function Aura({ style, color }: { style: AuraStyle; color: string }) {
  return (
    <g aria-hidden="true">
      <AuraEls style={style} color={color} />
    </g>
  );
}

function heart(cx: number, cy: number): string {
  return `M${cx} ${cy + 3} C${cx} ${cy + 1} ${cx - 3} ${cy} ${cx - 5} ${cy + 2} C${cx - 7} ${cy + 4} ${cx - 5} ${cy + 7} ${cx} ${cy + 10} C${cx + 5} ${cy + 7} ${cx + 7} ${cy + 4} ${cx + 5} ${cy + 2} C${cx + 3} ${cy} ${cx} ${cy + 1} ${cx} ${cy + 3} Z`;
}

function rays(count: number, inner: number, outer: number, offset = 0) {
  return Array.from({ length: count }, (_, i) => {
    const a = (i * 2 * Math.PI) / count + offset;
    return {
      x1: CX + Math.cos(a) * inner,
      y1: CY + Math.sin(a) * inner,
      x2: CX + Math.cos(a) * outer,
      y2: CY + Math.sin(a) * outer,
    };
  });
}

function polygonPoints(n: number, r: number, offset = -Math.PI / 2): string {
  return Array.from({ length: n }, (_, i) => {
    const a = (i * 2 * Math.PI) / n + offset;
    return `${(CX + Math.cos(a) * r).toFixed(1)},${(CY + Math.sin(a) * r).toFixed(1)}`;
  }).join(" ");
}

/** Star polygon (e.g. {7/3} heptagram) drawn by skipping vertices. */
function starPath(points: number, skip: number, radius: number): string {
  const pts = Array.from({ length: points }, (_, i) => {
    const a = (i * 2 * Math.PI) / points - Math.PI / 2;
    return [CX + Math.cos(a) * radius, CY + Math.sin(a) * radius] as const;
  });
  const order: (readonly [number, number])[] = [];
  let idx = 0;
  for (let k = 0; k < points; k++) {
    order.push(pts[idx]);
    idx = (idx + skip) % points;
  }
  return "M" + order.map((p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" L") + " Z";
}

function AuraEls({ style, color }: { style: AuraStyle; color: string }) {
  switch (style) {
    case "hearts": {
      // Hearts live only in the upper half (y <= ~68) and float higher.
      const hearts = [
        { x: 40, y: 64, d: "0s" },
        { x: 60, y: 66, d: "0.9s" },
        { x: 80, y: 64, d: "1.9s" },
        { x: 48, y: 56, d: "2.7s" },
        { x: 72, y: 56, d: "1.4s" },
      ];
      return (
        <g>
          {hearts.map((h, i) => (
            <path
              key={i}
              className="aura-heart"
              style={{ animationDelay: h.d }}
              d={heart(h.x, h.y)}
              fill={color}
              opacity="0.5"
              stroke={color}
              strokeWidth="0.8"
            />
          ))}
        </g>
      );
    }
    case "lightning": {
      const bolts = [10, 70, 130, 190, 250, 310];
      return (
        <g>
          <circle cx={CX} cy={CY} r={16} fill={color} opacity="0.12" />
          {bolts.map((deg, i) => (
            <g key={i} className="aura-bolt" style={{ animationDelay: `${i * 0.28}s` }} transform={`rotate(${deg} ${CX} ${CY})`}>
              <path
                d={`M${CX} ${CY - 16} L${CX - 5} ${CY - 26} L${CX + 4} ${CY - 29} L${CX - 2} ${CY - 42}`}
                fill="none"
                stroke={color}
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>
          ))}
        </g>
      );
    }
    case "circles":
      return (
        <g className="aura-rot aura-fx-pulse">
          <circle cx={CX} cy={CY} r={50} fill={color} opacity="0.1" />
          <circle cx={CX} cy={CY} r={38} fill={color} opacity="0.16" />
          <circle cx={CX} cy={CY} r={26} fill={color} opacity="0.1" />
        </g>
      );
    case "orbit": {
      const atoms = Array.from({ length: 3 }, (_, i) => {
        const a = (i * 2 * Math.PI) / 3;
        return { cx: CX + Math.cos(a) * 44, cy: CY + Math.sin(a) * 44 };
      });
      return (
        <g>
          <circle cx={CX} cy={CY} r={18} fill={color} opacity="0.14" />
          <g fill="none" stroke={color} strokeWidth="1.4" opacity="0.5">
            <ellipse cx={CX} cy={CY} rx={46} ry={18} />
            <ellipse cx={CX} cy={CY} rx={46} ry={18} transform={`rotate(60 ${CX} ${CY})`} />
            <ellipse cx={CX} cy={CY} rx={46} ry={18} transform={`rotate(120 ${CX} ${CY})`} />
          </g>
          <g className="aura-rot aura-orbit-spin">
            {atoms.map((a, i) => (
              <circle key={i} cx={a.cx} cy={a.cy} r="2.6" fill={color} />
            ))}
          </g>
        </g>
      );
    }
    case "starburst": {
      const inner = rays(12, 18, 38);
      const outer = rays(8, 32, 50, Math.PI / 8);
      return (
        <g>
          <circle cx={CX} cy={CY} r={14} fill={color} opacity="0.16" />
          <g className="aura-rot aura-spin-cw" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.5">
            {inner.map((r, i) => (
              <line key={i} x1={r.x1} y1={r.y1} x2={r.x2} y2={r.y2} />
            ))}
          </g>
          <g className="aura-rot aura-spin-ccw" stroke={color} strokeWidth="1.6" strokeLinecap="round" opacity="0.4">
            {outer.map((r, i) => (
              <line key={i} x1={r.x1} y1={r.y1} x2={r.x2} y2={r.y2} />
            ))}
          </g>
        </g>
      );
    }
    case "rune-ring": {
      const outerTicks = rays(24, 44, 48);
      const midTicks = rays(12, 33, 37, Math.PI / 12);
      const dots = Array.from({ length: 6 }, (_, i) => {
        const a = (i * Math.PI) / 3;
        return { cx: CX + Math.cos(a) * 44, cy: CY + Math.sin(a) * 44 };
      });
      const runes = Array.from({ length: 8 }, (_, i) => {
        const a = (i * Math.PI) / 4 + Math.PI / 8;
        return { cx: CX + Math.cos(a) * 38, cy: CY + Math.sin(a) * 38 };
      });
      return (
        <g className="aura-rot aura-rune-rp">
          <circle cx={CX} cy={CY} r={42} fill={color} opacity="0.07" />
          {/* concentric rings */}
          <circle cx={CX} cy={CY} r={48} fill="none" stroke={color} strokeWidth="2" opacity="0.55" />
          <circle cx={CX} cy={CY} r={44} fill="none" stroke={color} strokeWidth="1" opacity="0.4" />
          <circle cx={CX} cy={CY} r={40} fill="none" stroke={color} strokeWidth="1" strokeDasharray="2 4" opacity="0.4" />
          <circle cx={CX} cy={CY} r={32} fill="none" stroke={color} strokeWidth="1" opacity="0.35" />
          {/* inscribed geometry: heptagram star + overlapping triangles + hexagon */}
          <path d={starPath(7, 3, 30)} fill="none" stroke={color} strokeWidth="1.2" opacity="0.5" />
          <polygon points={polygonPoints(3, 26)} fill="none" stroke={color} strokeWidth="1" opacity="0.3" />
          <polygon points={polygonPoints(3, 26, Math.PI / 2)} fill="none" stroke={color} strokeWidth="1" opacity="0.3" />
          <polygon points={polygonPoints(6, 20)} fill="none" stroke={color} strokeWidth="1" opacity="0.3" />
          {/* outer + mid tick marks */}
          <g stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.6">
            {outerTicks.map((t, i) => (
              <line key={`o${i}`} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} />
            ))}
          </g>
          <g stroke={color} strokeWidth="1.4" strokeLinecap="round" opacity="0.45">
            {midTicks.map((t, i) => (
              <line key={`m${i}`} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} />
            ))}
          </g>
          {/* small diamond runes around the band */}
          <g fill="none" stroke={color} strokeWidth="1" opacity="0.5">
            {runes.map((r, i) => (
              <polygon
                key={`r${i}`}
                points={`${r.cx} ${r.cy - 2.4} ${r.cx + 2.4} ${r.cy} ${r.cx} ${r.cy + 2.4} ${r.cx - 2.4} ${r.cy}`}
              />
            ))}
          </g>
          <g fill={color} opacity="0.8">
            {dots.map((d, i) => (
              <circle key={i} cx={d.cx} cy={d.cy} r="2" />
            ))}
          </g>
        </g>
      );
    }
    default:
      return null;
  }
}
