"use client";

import type { PointerEvent as ReactPointerEvent } from "react";

export type CatPhase = "appearing" | "present" | "leaving";

const FUR = "#94a3b8";
const FUR_DK = "#64748b";
const EYE = "#334155";
const PINK = "#f9a8d4";

/**
 * The wizard's familiar: a blocky, pixel-style cat matching the pixel wizard. It
 * blinks/lifts its head and swishes its tail at rest, breaks into a blocky run
 * (legs + body bob) while chasing, and meows with little sound lines when clicked.
 * When it leaves, a cardboard box pops up, the cat lifts above it, then drops
 * inside. SVG + CSS only; animations freeze under prefers-reduced-motion.
 */
export default function SchrodingerCat({
  phase,
  running = false,
  meowing = false,
  bounce = false,
  reduce = false,
  onMeow,
}: {
  phase: CatPhase;
  running?: boolean;
  meowing?: boolean;
  bounce?: boolean;
  reduce?: boolean;
  onMeow?: () => void;
}) {
  const leaving = phase === "leaving" && !reduce;
  const active = phase !== "leaving" && !reduce;
  const clickable = phase === "present" && !!onMeow;
  const wrapClass = reduce ? "" : phase === "appearing" ? "familiar-cat-in" : "";

  return (
    <span
      className={`relative block h-12 w-12 ${clickable ? "pointer-events-auto cursor-pointer" : "pointer-events-none"} ${wrapClass}`}
      aria-hidden="true"
      onPointerDown={clickable ? (e: ReactPointerEvent) => e.stopPropagation() : undefined}
      onClick={
        clickable
          ? (e) => {
              e.stopPropagation();
              onMeow?.();
            }
          : undefined
      }
    >
      <span className={`absolute inset-0 ${leaving ? "schro-cat-leaving" : ""} ${bounce && !reduce ? "schro-bounce" : ""}`}>
        <svg viewBox="0 0 18 18" className="h-full w-full" shapeRendering="crispEdges">
          <PixelCat active={active} running={running && active} meowing={meowing} />
        </svg>
      </span>

      {leaving && (
        <span className="schro-box absolute inset-0 z-[2] block">
          <svg viewBox="0 0 24 24" className="h-full w-full overflow-visible">
            <CardboardBox />
          </svg>
        </span>
      )}
    </span>
  );
}

function PixelCat({ active, running, meowing }: { active: boolean; running: boolean; meowing: boolean }) {
  const headAnim = meowing ? "schro-cat-meow" : active ? "schro-head" : "";
  const tailAnim = meowing || active ? "schro-tail" : "";
  return (
    <g className={running ? "schro-run" : ""}>
      {/* pixel tail */}
      <g className={tailAnim} style={{ transformOrigin: "13px 12px" }}>
        <rect x={13} y={11} width={1} height={2} fill={FUR_DK} />
        <rect x={14} y={9} width={1} height={2} fill={FUR_DK} />
        <rect x={14} y={8} width={1} height={1} fill={FUR} />
      </g>

      {/* blocky body */}
      <rect x={4} y={10} width={9} height={5} fill={FUR} />
      <rect x={4} y={14} width={9} height={1} fill={FUR_DK} />

      {/* legs (only move while running) */}
      <g className="schro-leg-a">
        <rect x={5} y={15} width={2} height={2} fill={FUR_DK} />
      </g>
      <g className="schro-leg-b">
        <rect x={10} y={15} width={2} height={2} fill={FUR_DK} />
      </g>

      {/* head group (lift / meow nod) */}
      <g className={headAnim} style={{ transformOrigin: "8px 7px" }}>
        {/* small ears */}
        <rect x={4} y={2} width={2} height={2} fill={FUR} />
        <rect x={11} y={2} width={2} height={2} fill={FUR} />
        <rect x={4.5} y={3} width={1} height={1} fill={PINK} />
        <rect x={11.5} y={3} width={1} height={1} fill={PINK} />
        {/* square head; extends down into the body (same FUR color, so invisible
            at rest) so a head lift never opens a seam between head and body */}
        <rect x={4} y={4} width={9} height={8} fill={FUR} />
        {/* tiny pixel eyes */}
        <rect x={6} y={6} width={1} height={2} fill={EYE} />
        <rect x={10} y={6} width={1} height={2} fill={EYE} />
        {/* nose */}
        <rect x={8} y={8} width={1} height={1} fill={PINK} />
      </g>

      {/* meow sound lines */}
      {meowing && (
        <g className="schro-meow-lines" stroke={FUR_DK} strokeWidth={0.5} strokeLinecap="round">
          <line x1={2} y1={5} x2={0.4} y2={4} />
          <line x1={2} y1={7} x2={0.2} y2={7} />
          <line x1={2} y1={9} x2={0.4} y2={10} />
        </g>
      )}
    </g>
  );
}

/** A cardboard box, larger than the cat, with two open flaps and a taped seam.
 *  Scaled up around its opening (12, 11) so it grows wider and deeper without
 *  moving the rim, keeping the cat's lift-and-drop timing intact. */
function CardboardBox() {
  return (
    <g transform="translate(12 11) scale(1.35) translate(-12 -11)">
      <rect x={4.5} y={9} width={15} height={3.6} fill="#5b3d22" />
      <path d="M4.5 10 L1.4 6.4 L8 7.6 L12 10 Z" fill="#e0b985" stroke="#8a5a2b" strokeWidth={0.3} strokeLinejoin="round" />
      <path d="M19.5 10 L22.6 6.4 L16 7.6 L12 10 Z" fill="#cda46e" stroke="#8a5a2b" strokeWidth={0.3} strokeLinejoin="round" />
      <rect x={4.5} y={11} width={15} height={12.5} rx={0.7} fill="#c8975a" stroke="#8a5a2b" strokeWidth={0.4} />
      <rect x={4.5} y={11} width={15} height={1.7} rx={0.7} fill="#dcb079" />
      <rect x={4.5} y={21.6} width={15} height={1.9} fill="#a9763f" />
      <line x1={12} y1={12.7} x2={12} y2={23.5} stroke="#a9763f" strokeWidth={0.4} opacity={0.5} />
      <rect x={10.6} y={11} width={2.8} height={12.5} fill="#e8d3a8" opacity={0.4} />
    </g>
  );
}
