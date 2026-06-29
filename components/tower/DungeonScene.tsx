"use client";

import type { ReactNode } from "react";
import { FLAME_DOT, FLAME_GLOW_R, FLAME_ORIGIN_STYLE } from "@/components/tower/flame-glow";
import { climateSceneTokens, type Climate, type ClimateSceneTokens } from "@/lib/tower/climates";

/**
 * A dark pixel dungeon room rendered entirely with inline SVG + CSS (no image
 * assets). It is a backdrop: stone walls, side pillars, a glowing back arch,
 * torches, a perspective floor with a rune circle, drifting mist and dust, plus
 * a climate-specific decoration. All motion freezes under prefers-reduced-motion
 * via the shared CSS rules.
 */

// Deterministic positions (no Math.random) so SSR and client match.
const DUST = [
  { left: "12%", top: "30%", delay: "0s", size: 2 },
  { left: "26%", top: "62%", delay: "1.1s", size: 1.5 },
  { left: "44%", top: "22%", delay: "2.2s", size: 2.5 },
  { left: "58%", top: "70%", delay: "0.6s", size: 1.5 },
  { left: "72%", top: "40%", delay: "1.7s", size: 2 },
  { left: "86%", top: "58%", delay: "2.8s", size: 1.5 },
  { left: "34%", top: "48%", delay: "3.3s", size: 2 },
  { left: "66%", top: "28%", delay: "0.9s", size: 1.5 },
];

function StoneWall({ climate }: { climate: ClimateSceneTokens }) {
  const rows = 5;
  const cols = 11;
  const blocks: ReactNode[] = [];
  for (let r = 0; r < rows; r++) {
    const offset = r % 2 === 0 ? 0 : -15;
    for (let c = -1; c < cols; c++) {
      const x = c * 30 + offset;
      const y = r * 22;
      const tint = (r + c) % 3 === 0 ? climate.stoneDark : climate.stone;
      blocks.push(
        <g key={`${r}-${c}`}>
          <rect x={x} y={y} width="30" height="22" fill={tint} />
          <rect x={x} y={y} width="30" height="2" fill="#000" opacity="0.18" />
          <rect x={x} y={y} width="2" height="22" fill="#000" opacity="0.14" />
        </g>
      );
    }
  }
  return <g>{blocks}</g>;
}

function Torch({ x, climate }: { x: number; climate: ClimateSceneTokens }) {
  const flameCx = x + 1;
  const flameCy = 58;
  return (
    <g>
      {/* bracket */}
      <rect x={x - 1} y={70} width="4" height="14" fill="#3a2a18" />
      <rect x={x - 4} y={68} width="10" height="3" fill="#2a1c0f" />
      <g transform={`translate(${flameCx}, ${flameCy})`}>
        <circle
          cx={FLAME_DOT.wallTorch.cx}
          cy={FLAME_DOT.wallTorch.cy}
          r={FLAME_GLOW_R.wallTorch}
          fill={climate.torch}
          opacity="0.18"
          className="torch-glow"
          style={FLAME_ORIGIN_STYLE}
        />
        <g className="torch-flame" style={FLAME_ORIGIN_STYLE}>
          <rect x={-3} y={0} width="8" height="9" fill={climate.torch} />
          <rect x={-2} y={-6} width="6" height="8" fill={climate.torch} />
          <rect x={-1} y={-10} width="4" height="6" fill="#fff7ed" opacity="0.85" />
        </g>
      </g>
    </g>
  );
}

/** A free-standing floor candle stand, casting a small pool of warm light. */
function Candle({ x, y, climate }: { x: number; y: number; climate: ClimateSceneTokens }) {
  const flameCy = y - 13;
  return (
    <g>
      {/* base + stand */}
      <rect x={x - 5} y={y + 4} width="10" height="3" fill="#2a1c0f" />
      <rect x={x - 2} y={y - 6} width="4" height="11" fill="#3a2a18" />
      {/* wax + flame */}
      <rect x={x - 2} y={y - 10} width="4" height="5" fill="#e7e0c8" />
      <g transform={`translate(${x}, ${flameCy})`}>
        <circle
          cx={FLAME_DOT.floorCandle.cx}
          cy={FLAME_DOT.floorCandle.cy}
          r={FLAME_GLOW_R.floorCandle}
          fill={climate.torch}
          opacity="0.12"
          className="torch-glow"
          style={FLAME_ORIGIN_STYLE}
        />
        <g className="torch-flame" style={FLAME_ORIGIN_STYLE}>
          <rect x={-1.5} y={-2} width="3" height="6" fill={climate.torch} />
          <rect x={-0.5} y={-4} width="1.5" height="4" fill="#fff7ed" opacity="0.9" />
        </g>
      </g>
    </g>
  );
}

/** Receding nested arches behind the back opening to suggest a deep corridor. */
function BackCorridor({ climate }: { climate: ClimateSceneTokens }) {
  const arches = [0, 1, 2];
  return (
    <g>
      {arches.map((i) => {
        const inset = i * 9;
        const x0 = 130 + inset;
        const x1 = 190 - inset;
        const top = 60 + i * 9;
        const shade = i === 0 ? climate.wallBottom : i === 1 ? climate.stoneDark : "#05070d";
        return (
          <path
            key={i}
            d={`M${x0} 120 L${x0} ${top} Q160 ${top - 28} ${x1} ${top} L${x1} 120 Z`}
            fill={shade}
            opacity={0.95}
          />
        );
      })}
      {/* faint light at the far end */}
      <ellipse cx="160" cy="86" rx="10" ry="20" fill={climate.accent} opacity="0.16" className="dungeon-rune" />
      <rect x="156" y="70" width="8" height="40" fill={climate.accent} opacity="0.1" />
    </g>
  );
}

function Decor({ climate, climateIndex }: { climate: ClimateSceneTokens; climateIndex: number }) {
  const a = climate.accent;
  switch (climateIndex) {
    case 0:
      return (
        <g>
          {/* hanging vines */}
          {[40, 110, 250, 290].map((x, i) => (
            <path
              key={i}
              d={`M${x} 0 q6 18 -2 34 t4 36`}
              stroke="#3f6212"
              strokeWidth="2.5"
              fill="none"
              opacity="0.8"
            />
          ))}
          {[44, 256].map((x, i) => (
            <circle key={`l${i}`} cx={x} cy={36 + i * 20} r="3" fill="#65a30d" opacity="0.8" />
          ))}
          {/* fireflies */}
          {[80, 200, 260].map((x, i) => (
            <rect key={`f${i}`} x={x} y={90 + (i % 2) * 24} width="2" height="2" fill={a} className="dungeon-rune" />
          ))}
        </g>
      );
    case 1:
      return (
        <g stroke={a} strokeWidth="2" fill="none" opacity="0.7" className="dungeon-rune">
          <path d="M40 40 l10 -10 l10 10 l-10 10 Z" />
          <path d="M270 36 v18 m-7 -9 h14" strokeLinecap="round" />
          <path d="M150 24 l8 0 m-4 -4 v12" strokeLinecap="round" />
        </g>
      );
    case 2:
      return (
        <g>
          {[
            [10, 150, 18],
            [302, 140, 22],
            [30, 90, 12],
            [290, 96, 14],
          ].map(([x, y, h], i) => (
            <polygon
              key={i}
              points={`${x},${y} ${x + 8},${y - h} ${x + 16},${y}`}
              fill={a}
              opacity="0.45"
            />
          ))}
          {[70, 240, 160].map((x, i) => (
            <rect key={`s${i}`} x={x} y={60 + i * 18} width="2" height="2" fill="#e0f2fe" className="dungeon-rune" />
          ))}
        </g>
      );
    case 3:
      return (
        <g>
          {/* floating books */}
          {[
            [40, 70],
            [264, 64],
          ].map(([x, y], i) => (
            <g key={i} className="dungeon-rune">
              <rect x={x} y={y} width="18" height="13" fill="#7c2d12" />
              <rect x={x + 8} y={y} width="2" height="13" fill="#fcd34d" />
            </g>
          ))}
          {/* linked orbs */}
          <line x1="58" y1="78" x2="262" y2="72" stroke={a} strokeWidth="1.5" opacity="0.45" className="dungeon-rune" />
          <circle cx="58" cy="78" r="3" fill={a} />
          <circle cx="262" cy="72" r="3" fill={a} />
        </g>
      );
    case 4:
      return (
        <g stroke={a} fill="none" opacity="0.55">
          {/* gears */}
          {[
            [42, 60, 12],
            [280, 54, 10],
          ].map(([cx, cy, r], i) => (
            <g key={i} className="eve-halo" style={{ transformBox: "fill-box", transformOrigin: `${cx}px ${cy}px` }}>
              <circle cx={cx} cy={cy} r={r} strokeWidth="2.5" />
              <circle cx={cx} cy={cy} r={r - 5} strokeWidth="1.5" />
            </g>
          ))}
          {/* circuit lines */}
          <path d="M120 20 h30 v14 h24 M180 20 v14" strokeWidth="2" strokeLinecap="round" />
          <circle cx="120" cy="20" r="2.5" fill={a} stroke="none" />
          <circle cx="204" cy="34" r="2.5" fill={a} stroke="none" />
        </g>
      );
    case 5:
    default:
      return (
        <g>
          {/* portal + orbit rings */}
          <g className="eve-halo" style={{ transformBox: "fill-box", transformOrigin: "160px 56px" }}>
            <ellipse cx="160" cy="56" rx="48" ry="18" fill="none" stroke={a} strokeWidth="1.5" opacity="0.5" />
            <ellipse cx="160" cy="56" rx="30" ry="40" fill="none" stroke={a} strokeWidth="1" opacity="0.35" />
          </g>
          <ellipse cx="160" cy="56" rx="18" ry="22" fill={a} opacity="0.18" className="dungeon-rune" />
          {/* reality cracks */}
          <path d="M20 30 l14 10 l-8 12 M300 24 l-12 12 l10 10" stroke={a} strokeWidth="1.5" fill="none" opacity="0.5" />
        </g>
      );
  }
}

export default function DungeonScene({ climate: climateProp, children }: { climate: Climate; children?: ReactNode }) {
  const climate = climateSceneTokens(climateProp);
  return (
    <div
      className="dungeon-scene pointer-events-none absolute inset-0 overflow-hidden rounded-3xl"
      style={{ background: `linear-gradient(180deg, ${climate.wallTop} 0%, ${climate.wallBottom} 100%)` }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full">
        {/* back wall stone */}
        <g opacity="0.9">
          <StoneWall climate={climate} />
        </g>

        {/* back arch opening into a deep, receding corridor */}
        <path d="M130 120 L130 60 Q160 30 190 60 L190 120 Z" fill="#04060d" />
        <BackCorridor climate={climate} />
        <path d="M130 60 Q160 30 190 60" fill="none" stroke={climate.stone} strokeWidth="6" />
        <path d="M126 60 Q160 26 194 60" fill="none" stroke="#000" strokeWidth="2" opacity="0.5" />

        {/* hanging chains framing the doorway */}
        {[120, 200].map((x, i) => (
          <g key={i} opacity="0.5">
            {[0, 8, 16, 24].map((dy) => (
              <rect key={dy} x={x - 1} y={dy} width="2.5" height="5" fill="#1c222e" />
            ))}
            <circle cx={x} cy="30" r="2.5" fill={climate.torch} opacity="0.5" className="dungeon-rune" />
          </g>
        ))}

        <Decor climate={climate} climateIndex={climateProp.index} />

        {/* side pillars */}
        {[8, 284].map((x, i) => (
          <g key={i}>
            <rect x={x} y={0} width="28" height="200" fill={climate.stoneDark} />
            <rect x={x} y={0} width="28" height="200" fill="#000" opacity="0.2" />
            <rect x={x - 4} y={0} width="36" height="10" fill={climate.stone} />
            {[40, 90, 140].map((y) => (
              <rect key={y} x={x} y={y} width="28" height="3" fill="#000" opacity="0.25" />
            ))}
          </g>
        ))}

        {/* torches on the pillars */}
        <Torch x={30} climate={climate} />
        <Torch x={290} climate={climate} />

        {/* floor: perspective trapezoid + tiles */}
        <polygon points="40,120 280,120 320,200 0,200" fill={climate.floor} />
        <polygon points="40,120 280,120 320,200 0,200" fill="#000" opacity="0.12" />
        {/* darker pooled shadow toward the front for grounded depth */}
        <polygon points="0,200 320,200 300,176 20,176" fill="#000" opacity="0.22" />
        {[134, 152, 174, 200].map((y, i) => (
          <line key={i} x1={40 - i * 13} y1={y} x2={280 + i * 13} y2={y} stroke={climate.floorDark} strokeWidth="2" />
        ))}
        {[80, 120, 160, 200, 240].map((x, i) => (
          <line
            key={`v${i}`}
            x1={x}
            y1={120}
            x2={x + (x - 160) * 0.55}
            y2={200}
            stroke={climate.floorDark}
            strokeWidth="1.5"
          />
        ))}

        {/* central floor rune circle */}
        <g className="dungeon-rune" style={{ transformBox: "fill-box", transformOrigin: "160px 158px" }}>
          <ellipse cx="160" cy="158" rx="46" ry="16" fill="none" stroke={climate.accent} strokeWidth="2" opacity="0.7" />
          <ellipse cx="160" cy="158" rx="30" ry="10" fill="none" stroke={climate.accent} strokeWidth="1" opacity="0.5" />
          {[0, 60, 120, 180, 240, 300].map((deg) => {
            const rad = (deg * Math.PI) / 180;
            return (
              <rect
                key={deg}
                x={160 + Math.cos(rad) * 46 - 1.5}
                y={158 + Math.sin(rad) * 16 - 1.5}
                width="3"
                height="3"
                fill={climate.accent}
              />
            );
          })}
        </g>

        {/* free-standing candles flanking the arena floor */}
        <Candle x={70} y={150} climate={climate} />
        <Candle x={250} y={150} climate={climate} />
      </svg>

      {/* mist rising from the floor */}
      <div
        className="absolute inset-x-0 bottom-0 h-1/2"
        style={{ background: `linear-gradient(0deg, ${climate.mist}, transparent)` }}
      />
      <div className="dungeon-mist absolute inset-x-0 bottom-0 h-2/3" style={{ background: `radial-gradient(60% 40% at 50% 100%, ${climate.mist}, transparent)` }} />

      {/* drifting dust */}
      {DUST.map((d, i) => (
        <span
          key={i}
          className="dungeon-dust absolute rounded-full"
          style={{
            left: d.left,
            top: d.top,
            width: d.size,
            height: d.size,
            background: climate.particle,
            animationDelay: d.delay,
          }}
        />
      ))}

      {/* warm embers rising near the wall torches */}
      {[
        { left: "9%", top: "34%", d: "0s" },
        { left: "11%", top: "26%", d: "1.3s" },
        { left: "90%", top: "32%", d: "0.7s" },
        { left: "88%", top: "24%", d: "2.1s" },
      ].map((e, i) => (
        <span
          key={`ember-${i}`}
          className="dungeon-dust absolute h-1 w-1 rounded-full"
          style={{ left: e.left, top: e.top, background: climate.torch, animationDelay: e.d, opacity: 0.8 }}
        />
      ))}

      {/* top corner shadows for a closed-in, vaulted feel */}
      <div className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(120% 80% at 50% 120%, transparent 60%, rgba(0,0,0,0.5) 100%)" }} />

      {/* vignette for dramatic contrast */}
      <div className="absolute inset-0 rounded-3xl" style={{ boxShadow: "inset 0 0 160px rgba(0,0,0,0.82)" }} />
    </div>
  );
}
