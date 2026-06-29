"use client";

/**
 * Collectible shield/crystal relic badge, drawn purely with inline SVG (no
 * images, no icon libraries, no emoji). A radial face gradient + beveled rim +
 * gloss give it a minted, gem-like depth; unlocked badges carry a colored glow
 * while locked ones are a muted gray shield with a lock — a clear distinction.
 * The face color comes from `type`; the mark inside comes from `icon`.
 */

import { useId } from "react";

export type AchievementBadgeType = "streak" | "unit" | "course" | "challenge" | "secret";
export type AchievementIcon =
  | "spark"
  | "flame"
  | "moonstar"
  | "mountain"
  | "sun"
  | "atom"
  | "circuit"
  | "wave"
  | "nodes"
  | "maze"
  | "chip"
  | "staff"
  | "gate"
  | "crystal"
  | "sunrise"
  | "moon"
  | "tower"
  | "star"
  | "wand"
  | "shield"
  | "compass"
  | "rune";

const SHIELD = "M24 3 L43 11 V28 C43 41 34 49 24 53 C14 49 5 41 5 28 V11 Z";

interface Palette {
  light: string;
  mid: string;
  dark: string;
  rim: string;
  glow: string;
}

const PALETTE: Record<AchievementBadgeType, Palette> = {
  streak: { light: "#fcd34d", mid: "#f59e0b", dark: "#b45309", rim: "#7c2d12", glow: "rgba(245,158,11,0.55)" },
  unit: { light: "#a5b4fc", mid: "#6366f1", dark: "#3730a3", rim: "#1e1b4b", glow: "rgba(99,102,241,0.55)" },
  course: { light: "#fde68a", mid: "#fbbf24", dark: "#d97706", rim: "#92400e", glow: "rgba(251,191,36,0.6)" },
  challenge: { light: "#c4b5fd", mid: "#8b5cf6", dark: "#6d28d9", rim: "#3b0764", glow: "rgba(139,92,246,0.55)" },
  secret: { light: "#f5d0fe", mid: "#d946ef", dark: "#a21caf", rim: "#581c87", glow: "rgba(217,70,239,0.55)" },
};

const LOCKED: Palette = {
  light: "#e2e8f0",
  mid: "#cbd5e1",
  dark: "#94a3b8",
  rim: "#64748b",
  glow: "transparent",
};

export default function AchievementBadge({
  unlocked,
  type,
  icon,
  className = "h-12 w-12",
}: {
  unlocked: boolean;
  type: AchievementBadgeType;
  icon: AchievementIcon;
  className?: string;
}) {
  const uid = useId().replace(/:/g, "");
  const faceId = `bf-${uid}`;
  const rimId = `br-${uid}`;
  const p = unlocked ? PALETTE[type] : LOCKED;

  return (
    <svg
      viewBox="0 0 48 56"
      className={className}
      role="img"
      aria-hidden="true"
      style={unlocked ? { filter: `drop-shadow(0 2px 6px ${p.glow})` } : undefined}
    >
      <defs>
        <radialGradient id={faceId} cx="50%" cy="32%" r="80%">
          <stop offset="0%" stopColor={p.light} />
          <stop offset="58%" stopColor={p.mid} />
          <stop offset="100%" stopColor={p.dark} />
        </radialGradient>
        <linearGradient id={rimId} x1="0" y1="0" x2="0.25" y2="1">
          <stop offset="0%" stopColor={p.light} />
          <stop offset="100%" stopColor={p.rim} />
        </linearGradient>
      </defs>

      {/* beveled rim + gem face */}
      <path d={SHIELD} fill={`url(#${faceId})`} stroke={`url(#${rimId})`} strokeWidth={3} strokeLinejoin="round" />
      {/* thin inner sheen line for a minted look */}
      <path d={SHIELD} fill="none" stroke="#ffffff" strokeOpacity={unlocked ? 0.3 : 0.12} strokeWidth={0.8} strokeLinejoin="round" />
      {/* top gloss */}
      <path d="M11 12 Q24 8 37 12 Q31 19 24 19 Q17 19 11 12 Z" fill="#ffffff" opacity={unlocked ? 0.28 : 0.16} />
      {/* faint facet down the center */}
      <path d="M24 5 L24 52" stroke="#ffffff" strokeOpacity={0.1} strokeWidth={1} />

      {unlocked ? <Mark icon={icon} /> : <LockMark />}
    </svg>
  );
}

function Mark({ icon }: { icon: AchievementIcon }) {
  switch (icon) {
    // Apprentice Spark: the first spark of training.
    case "spark":
      return (
        <g className="fill-white">
          <path d="M24 14 L25.9 25.1 L37 27 L25.9 28.9 L24 40 L22.1 28.9 L11 27 L22.1 25.1 Z" />
          <path d="M32 18 L32.7 20.3 L35 21 L32.7 21.7 L32 24 L31.3 21.7 L29 21 L31.3 20.3 Z" className="opacity-70" />
          <circle cx={15.5} cy={32.5} r={1.2} className="opacity-70" />
          <circle cx={33.5} cy={33} r={1} className="opacity-60" />
        </g>
      );
    // Three-Day Spell: a kindling flame with a bright inner core.
    case "flame":
      return (
        <g>
          <path
            d="M24 13 C31 21 29 27 24 31.5 C20.5 28.5 21.6 25 21.6 25 C18 28 18 33.5 22 36.5 C23 37.3 24 37.8 24 37.8 C28 36.8 31 33 30.4 27.6 C30 23.2 26.4 19 24 13 Z"
            className="fill-white opacity-85"
          />
          <path d="M24 26 C27 29 26 33 24 35.5 C22.2 33.5 22.6 31 24 26 Z" className="fill-white" />
        </g>
      );
    // Weeklong Ward: a crescent watched over by a week of stars.
    case "moonstar":
      return (
        <g className="fill-white">
          <path d="M28 17 A10 10 0 1 0 28 37 A7.6 7.6 0 1 1 28 17 Z" />
          <path
            d="M33.5 17.5 L34.5 20.2 L37.2 21.2 L34.5 22.2 L33.5 24.9 L32.5 22.2 L29.8 21.2 L32.5 20.2 Z"
            className="opacity-90"
          />
          <circle cx={33.5} cy={30.5} r={1.1} className="opacity-80" />
          <circle cx={30} cy={36} r={0.9} className="opacity-65" />
        </g>
      );
    // Fortnight Focus: twin summits with snow caps and a summit flag.
    case "mountain":
      return (
        <g>
          <path d="M11 38 L20 22 L25.5 31 L30 23 L37 38 Z" className="fill-white opacity-90" />
          <path d="M20 22 L17.4 26.5 L22.6 26.5 Z" className="fill-white" />
          <path d="M30 23 L27.7 27 L32.3 27 Z" className="fill-white" />
          <path d="M20 22 L25.5 31 L20 31 Z" fill="#0b1020" opacity={0.12} />
          <path d="M30 23 L34 31 L30 31 Z" fill="#0b1020" opacity={0.12} />
          <line x1={20} y1={22} x2={20} y2={16.5} className="stroke-white" strokeWidth={1} strokeLinecap="round" />
          <path d="M20 17 L23.6 18.4 L20 19.8 Z" className="fill-white" />
        </g>
      );
    // Archmage Discipline: a radiant sun (the grandest streak).
    case "sun": {
      const rays = Array.from({ length: 12 }, (_, i) => {
        const a = (i * Math.PI) / 6;
        return {
          key: i,
          x1: 24 + Math.cos(a) * 6.6,
          y1: 27 + Math.sin(a) * 6.6,
          x2: 24 + Math.cos(a) * (i % 2 === 0 ? 10 : 8.6),
          y2: 27 + Math.sin(a) * (i % 2 === 0 ? 10 : 8.6),
        };
      });
      return (
        <g className="stroke-white" strokeWidth={1.5} strokeLinecap="round">
          <circle cx={24} cy={27} r={4.8} className="fill-white" />
          <circle cx={24} cy={27} r={7.4} fill="none" strokeWidth={0.8} className="opacity-45" />
          {rays.map((r) => (
            <line key={r.key} x1={r.x1} y1={r.y1} x2={r.x2} y2={r.y2} />
          ))}
        </g>
      );
    }
    case "circuit":
      return (
        <g className="stroke-white" fill="none" strokeWidth={1.7} strokeLinecap="round">
          <line x1={13} y1={27} x2={20} y2={27} />
          <line x1={28} y1={27} x2={35} y2={27} />
          <rect x={20} y={23} width={8} height={8} rx={1.5} />
          <circle cx={13} cy={27} r={1.6} className="fill-white" />
          <circle cx={35} cy={27} r={1.6} className="fill-white" />
        </g>
      );
    // Interference Weaver: two waves crossing at interference nodes.
    case "wave":
      return (
        <g fill="none" strokeLinecap="round">
          <path d="M13 27 C16.5 19 20 19 23.5 27 C27 35 30.5 35 34 27" className="stroke-white" strokeWidth={1.8} />
          <path
            d="M13 27 C16.5 35 20 35 23.5 27 C27 19 30.5 19 34 27"
            className="stroke-white opacity-55"
            strokeWidth={1.8}
          />
          <g className="fill-white">
            <circle cx={13} cy={27} r={1.2} />
            <circle cx={23.5} cy={27} r={1.3} />
            <circle cx={34} cy={27} r={1.2} />
          </g>
        </g>
      );
    // Entanglement Adept: two qubits bound into interlocking rings.
    case "nodes":
      return (
        <g className="stroke-white" fill="none" strokeWidth={2}>
          <circle cx={19.5} cy={27} r={6} />
          <circle cx={28.5} cy={27} r={6} />
          <g className="fill-white" stroke="none">
            <circle cx={19.5} cy={27} r={1.4} />
            <circle cx={28.5} cy={27} r={1.4} />
          </g>
        </g>
      );
    // Algorithm Sorcerer: a branch-and-converge flow of steps.
    case "maze":
      return (
        <g className="stroke-white" fill="none" strokeWidth={1.6} strokeLinecap="round">
          <path d="M24 18 V21 L17 26 M24 21 L31 26 M17 30 L24 35 M31 30 L24 35" />
          <g className="fill-white" stroke="none">
            <circle cx={24} cy={16.5} r={2} />
            <circle cx={17} cy={28} r={2} />
            <circle cx={31} cy={28} r={2} />
            <circle cx={24} cy={36.5} r={2.2} />
          </g>
        </g>
      );
    // Hardware Alchemist: a processor die with a qubit at its core.
    case "chip": {
      const pins: { key: string; x1: number; y1: number; x2: number; y2: number }[] = [];
      [20, 24, 28].forEach((x, i) => {
        pins.push({ key: `t${i}`, x1: x, y1: 18.5, x2: x, y2: 21 });
        pins.push({ key: `b${i}`, x1: x, y1: 33, x2: x, y2: 35.5 });
      });
      [23, 27, 31].forEach((y, i) => {
        pins.push({ key: `l${i}`, x1: 15.5, y1: y, x2: 18, y2: y });
        pins.push({ key: `r${i}`, x1: 30, y1: y, x2: 32.5, y2: y });
      });
      return (
        <g className="stroke-white" fill="none" strokeWidth={1.4} strokeLinecap="round">
          <rect x={18} y={21} width={12} height={12} rx={1.5} />
          <rect x={21.5} y={24.5} width={5} height={5} rx={0.8} className="opacity-60" />
          <circle cx={24} cy={27} r={1.5} className="fill-white" />
          {pins.map((p) => (
            <line key={p.key} x1={p.x1} y1={p.y1} x2={p.x2} y2={p.y2} />
          ))}
        </g>
      );
    }
    case "staff":
      return (
        <g>
          <line x1={24} y1={39} x2={24} y2={22} className="stroke-white" strokeWidth={2} strokeLinecap="round" />
          <path d="M24 12 L28.5 18 L24 24 L19.5 18 Z" className="fill-white" />
          <circle cx={31} cy={15} r={1.3} className="fill-white opacity-80" />
        </g>
      );
    // Gatecaster: a controlled-NOT gate across two qubit wires.
    case "gate":
      return (
        <g className="stroke-white" fill="none" strokeWidth={1.5} strokeLinecap="round">
          <line x1={13} y1={22} x2={35} y2={22} />
          <line x1={13} y1={33} x2={35} y2={33} />
          <line x1={24} y1={22} x2={24} y2={33} />
          <circle cx={24} cy={22} r={2.1} className="fill-white" />
          <circle cx={24} cy={33} r={3.5} />
          <line x1={24} y1={29.5} x2={24} y2={36.5} />
          <line x1={20.5} y1={33} x2={27.5} y2={33} />
        </g>
      );
    // Quantum Archmage: a richly faceted gemstone (course mastery).
    case "crystal":
      return (
        <g>
          <path d="M18 20 H30 L35 25 L24 40 L13 25 Z" className="fill-white opacity-95" />
          <path d="M18 20 L21 25 H27 L30 20 Z" className="fill-white" />
          <g className="stroke-white opacity-40" strokeWidth={0.7} fill="none">
            <path d="M13 25 H35" />
            <path d="M21 25 L24 40" />
            <path d="M27 25 L24 40" />
          </g>
          <circle cx={33.5} cy={18.5} r={1} className="fill-white opacity-80" />
        </g>
      );
    // Early Bird: a sun cresting the horizon with a bird overhead.
    case "sunrise":
      return (
        <g className="stroke-white" strokeWidth={1.6} strokeLinecap="round" fill="none">
          <path d="M13 34 H35" />
          <path d="M18 34 a6 6 0 0 1 12 0" className="fill-white" stroke="none" />
          <line x1={24} y1={19} x2={24} y2={23} />
          <line x1={14.5} y1={24} x2={17} y2={26.5} />
          <line x1={33.5} y1={24} x2={31} y2={26.5} />
          <path d="M26.5 20 q1.4 -1.6 2.8 0 q1.4 -1.6 2.8 0" strokeWidth={1.2} className="opacity-80" />
        </g>
      );
    // Night Owl: a crescent moon among night stars.
    case "moon":
      return (
        <g className="fill-white">
          <path d="M29 16 A11 11 0 1 0 29 38 A8.5 8.5 0 1 1 29 16 Z" />
          <path d="M32.5 18 L33.2 20 L35.2 20.7 L33.2 21.4 L32.5 23.4 L31.8 21.4 L29.8 20.7 L31.8 20 Z" className="opacity-85" />
          <circle cx={34} cy={30} r={1} className="opacity-75" />
          <circle cx={30.5} cy={35.5} r={0.85} className="opacity-60" />
        </g>
      );
    // Weekend Wizard: a wizard's tower with a banner and lit window.
    case "tower":
      return (
        <g className="fill-white">
          <line x1={24} y1={14.5} x2={24} y2={10} className="stroke-white" strokeWidth={1.1} strokeLinecap="round" />
          <path d="M24 10.5 L28 12 L24 13.5 Z" />
          <path d="M17 23 L24 14 L31 23 Z" />
          <rect x={19} y={23} width={10} height={15} />
          <rect x={18} y={21.5} width={3} height={2.5} />
          <rect x={27} y={21.5} width={3} height={2.5} />
          <rect x={22} y={27} width={4} height={5} rx={1} fill="#0b1020" opacity={0.32} />
          <path d="M22 38 V34.5 a2 2 0 0 1 4 0 V38 Z" fill="#0b1020" opacity={0.28} />
        </g>
      );
    // Perfect Lesson: a five-point star with sparkles.
    case "star":
      return (
        <g className="fill-white">
          <path d="M24 13 L27 22 L36.5 22 L28.8 27.6 L31.7 36.5 L24 31 L16.3 36.5 L19.2 27.6 L11.5 22 L21 22 Z" />
          <path d="M24 18 L25.6 22.4 L30 22.4 L26.4 25.2 L27.8 29.6 L24 26.9 L20.2 29.6 L21.6 25.2 L18 22.4 L22.4 22.4 Z" fill="#0b1020" opacity={0.1} />
          <circle cx={33.5} cy={31} r={1} className="opacity-70" />
        </g>
      );
    // First Try: a wand with a star tip and a sparkle trail.
    case "wand":
      return (
        <g>
          <line x1={17} y1={37.5} x2={29.5} y2={20} className="stroke-white" strokeWidth={2.4} strokeLinecap="round" />
          <path d="M31 14.5 L32.4 18 L36 19.4 L32.4 20.8 L31 24.3 L29.6 20.8 L26 19.4 L29.6 18 Z" className="fill-white" />
          <circle cx={22.5} cy={30.5} r={0.9} className="fill-white opacity-70" />
          <circle cx={26} cy={25.5} r={0.8} className="fill-white opacity-55" />
        </g>
      );
    // Never Give Up: a shield of resilience with rising chevrons.
    case "shield":
      return (
        <g>
          <path
            d="M24 15 L33 18.5 V27 C33 33.5 28.5 36.8 24 39 C19.5 36.8 15 33.5 15 27 V18.5 Z"
            fill="none"
            className="stroke-white"
            strokeWidth={1.8}
            strokeLinejoin="round"
          />
          <g className="stroke-white" fill="none" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
            <path d="M19.5 30.5 L24 26 L28.5 30.5" />
            <path d="M19.5 25.5 L24 21 L28.5 25.5" className="opacity-65" />
          </g>
        </g>
      );
    // Explorer: a compass with cardinal ticks and a two-tone needle.
    case "compass":
      return (
        <g className="stroke-white" fill="none" strokeWidth={1.5}>
          <circle cx={24} cy={27} r={9.5} />
          <g strokeLinecap="round">
            <line x1={24} y1={18.5} x2={24} y2={20.5} />
            <line x1={24} y1={33.5} x2={24} y2={35.5} />
            <line x1={15.5} y1={27} x2={17.5} y2={27} />
            <line x1={30.5} y1={27} x2={32.5} y2={27} />
          </g>
          <path d="M24 27 L27.5 20 L24 27 Z" className="fill-white" stroke="none" />
          <path d="M24 27 L20.5 34 L24 27 Z" className="fill-white opacity-50" stroke="none" />
          <circle cx={24} cy={27} r={1.4} className="fill-white" stroke="none" />
        </g>
      );
    // Secrets: an arcane stave rune circled by dashed glyphs.
    case "rune":
      return (
        <g className="stroke-white" fill="none" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
          <circle cx={24} cy={27} r={10} strokeDasharray="2 3" strokeWidth={1} className="opacity-70" />
          <path d="M24 17 V37" />
          <path d="M24 21 L29 18 M24 21 L19 18 M24 27.5 L30 24.5 M24 27.5 L18 24.5 M24 33 L28.5 36 M24 33 L19.5 36" />
          <circle cx={24} cy={27} r={1.3} className="fill-white" />
        </g>
      );
    // Qubit Initiate: an atom with orbiting electrons (quantum states).
    case "atom":
    default:
      return (
        <g className="stroke-white" fill="none" strokeWidth={1.5}>
          <ellipse cx={24} cy={27} rx={11} ry={4.4} />
          <ellipse cx={24} cy={27} rx={11} ry={4.4} transform="rotate(60 24 27)" />
          <ellipse cx={24} cy={27} rx={11} ry={4.4} transform="rotate(120 24 27)" />
          <g className="fill-white" stroke="none">
            <circle cx={24} cy={27} r={2.6} />
            <circle cx={35} cy={27} r={1.4} />
            <circle cx={18.5} cy={17.5} r={1.3} />
            <circle cx={18.5} cy={36.5} r={1.3} />
          </g>
        </g>
      );
  }
}

function LockMark() {
  return (
    <g className="fill-slate-400 stroke-slate-400">
      <rect x={18} y={26} width={12} height={11} rx={2} className="fill-slate-400" />
      <path d="M21 26 V22.5 a3 3 0 0 1 6 0 V26" fill="none" strokeWidth={2} strokeLinecap="round" />
    </g>
  );
}
