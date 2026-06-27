/**
 * Shield-shaped achievement badge, drawn purely with inline SVG (no images, no
 * icon libraries, no emoji). The shield color comes from `type`; the mark
 * inside comes from `icon`, so each achievement can look distinct. Locked
 * badges are a muted gray shield with a lock.
 */

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

const UNLOCKED_STYLE: Record<AchievementBadgeType, { fill: string; stroke: string }> = {
  streak: { fill: "fill-amber-500", stroke: "stroke-amber-600" },
  unit: { fill: "fill-indigo-500", stroke: "stroke-indigo-700" },
  course: { fill: "fill-amber-400", stroke: "stroke-amber-600" },
  challenge: { fill: "fill-violet-500", stroke: "stroke-violet-700" },
  secret: { fill: "fill-fuchsia-500", stroke: "stroke-fuchsia-700" },
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
  const fill = unlocked ? UNLOCKED_STYLE[type].fill : "fill-slate-200";
  const stroke = unlocked ? UNLOCKED_STYLE[type].stroke : "stroke-slate-300";

  return (
    <svg viewBox="0 0 48 56" className={className} role="img" aria-hidden="true">
      <path d={SHIELD} className={`${fill} ${stroke}`} strokeWidth={2} strokeLinejoin="round" />
      {/* subtle top gloss so unlocked badges read as "earned" without looking childish */}
      <ellipse cx={24} cy={16} rx={15} ry={5} className="fill-white opacity-20" />
      {unlocked ? <Mark icon={icon} /> : <LockMark />}
    </svg>
  );
}

function Mark({ icon }: { icon: AchievementIcon }) {
  switch (icon) {
    case "spark":
      return (
        <g className="fill-white">
          <path d="M24 16 L25.7 25.3 L34 27 L25.7 28.7 L24 38 L22.3 28.7 L14 27 L22.3 25.3 Z" />
          <circle cx={32.5} cy={20} r={1.2} className="opacity-80" />
          <circle cx={16} cy={33} r={1} className="opacity-80" />
        </g>
      );
    case "flame":
      return (
        <path
          d="M24 14 C30 21 28.5 27 24 31 C21 28.5 21.8 25.5 21.8 25.5 C18.5 28.5 18.5 33 22 36 C23 37 24 37.6 24 37.6 C27.5 36.6 30.5 33 30 28 C29.6 24 26 20 24 14 Z"
          className="fill-white"
        />
      );
    case "moonstar":
      return (
        <g className="fill-white">
          <path d="M28 17 A10 10 0 1 0 28 37 A7.6 7.6 0 1 1 28 17 Z" />
          <path
            d="M33.5 18 L34.4 20.4 L36.8 21.3 L34.4 22.2 L33.5 24.6 L32.6 22.2 L30.2 21.3 L32.6 20.4 Z"
            className="opacity-90"
          />
        </g>
      );
    case "mountain":
      return <path d="M13 37 L21 23 L26 30 L30 22 L35 37 Z" className="fill-white" />;
    case "sun": {
      const rays = Array.from({ length: 8 }, (_, i) => {
        const a = (i * Math.PI) / 4;
        return {
          key: i,
          x1: 24 + Math.cos(a) * 6.5,
          y1: 27 + Math.sin(a) * 6.5,
          x2: 24 + Math.cos(a) * 9.5,
          y2: 27 + Math.sin(a) * 9.5,
        };
      });
      return (
        <g className="stroke-white" strokeWidth={1.7} strokeLinecap="round">
          <circle cx={24} cy={27} r={4.5} className="fill-white" />
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
    case "wave":
      return (
        <g className="stroke-white" fill="none" strokeWidth={1.8} strokeLinecap="round">
          <path d="M14 27 C17 20 21 20 24 27 C27 34 31 34 34 27" />
          <path d="M14 27 C17 34 21 34 24 27 C27 20 31 20 34 27" className="opacity-70" />
        </g>
      );
    case "nodes":
      return (
        <g className="stroke-white" strokeWidth={1.6}>
          <g fill="none">
            <line x1={17} y1={20} x2={31} y2={20} />
            <line x1={17} y1={20} x2={17} y2={34} />
            <line x1={31} y1={20} x2={31} y2={34} />
            <line x1={17} y1={34} x2={31} y2={34} />
            <line x1={17} y1={20} x2={31} y2={34} />
          </g>
          <g className="fill-white">
            <circle cx={17} cy={20} r={2.4} />
            <circle cx={31} cy={20} r={2.4} />
            <circle cx={17} cy={34} r={2.4} />
            <circle cx={31} cy={34} r={2.4} />
          </g>
        </g>
      );
    case "maze":
      return (
        <g className="stroke-white" fill="none" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
          <path d="M24 38 V31 M24 31 L18 25 M24 31 L30 25 M18 25 V19 M30 25 V19" />
          <g className="fill-white">
            <circle cx={18} cy={18} r={1.8} />
            <circle cx={30} cy={18} r={1.8} />
            <circle cx={24} cy={38} r={1.8} />
          </g>
        </g>
      );
    case "chip": {
      const pins: { key: string; x1: number; y1: number; x2: number; y2: number }[] = [];
      [20, 24, 28].forEach((x, i) => {
        pins.push({ key: `t${i}`, x1: x, y1: 18.5, x2: x, y2: 22 });
        pins.push({ key: `b${i}`, x1: x, y1: 32, x2: x, y2: 35.5 });
      });
      [23, 27, 31].forEach((y, i) => {
        pins.push({ key: `l${i}`, x1: 15.5, y1: y, x2: 19, y2: y });
        pins.push({ key: `r${i}`, x1: 29, y1: y, x2: 32.5, y2: y });
      });
      return (
        <g className="stroke-white" fill="none" strokeWidth={1.5} strokeLinecap="round">
          <rect x={19} y={22} width={10} height={10} rx={1.5} />
          <rect x={22.5} y={25.5} width={3} height={3} className="fill-white" />
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
    case "gate":
      return (
        <g className="stroke-white" fill="none" strokeWidth={1.7} strokeLinecap="round">
          <line x1={12} y1={22} x2={18} y2={22} />
          <line x1={12} y1={32} x2={18} y2={32} />
          <line x1={30} y1={22} x2={36} y2={22} />
          <line x1={30} y1={32} x2={36} y2={32} />
          <rect x={18} y={19} width={12} height={16} rx={2} />
          <circle cx={24} cy={27} r={2} className="fill-white" stroke="none" />
        </g>
      );
    case "crystal":
      return (
        <g className="fill-white">
          <path d="M24 14 L31 23 L24 39 L17 23 Z" className="opacity-95" />
          <path d="M24 14 L24 39 L31 23 Z" className="opacity-60" />
          <circle cx={33} cy={18} r={1.1} className="opacity-80" />
        </g>
      );
    case "sunrise":
      return (
        <g className="stroke-white" strokeWidth={1.7} strokeLinecap="round" fill="none">
          <path d="M14 34 H34" />
          <path d="M18 34 a6 6 0 0 1 12 0" className="fill-white" stroke="none" />
          <line x1={24} y1={20} x2={24} y2={24} />
          <line x1={15} y1={24} x2={17.5} y2={26.5} />
          <line x1={33} y1={24} x2={30.5} y2={26.5} />
        </g>
      );
    case "moon":
      return <path d="M29 16 A11 11 0 1 0 29 38 A8.5 8.5 0 1 1 29 16 Z" className="fill-white" />;
    case "tower":
      return (
        <g className="fill-white">
          <path d="M18 22 L24 15 L30 22 Z" />
          <rect x={19} y={22} width={10} height={16} />
          <rect x={22} y={26} width={4} height={5} className="fill-indigo-700" />
          <rect x={17} y={20} width={3} height={3} />
          <rect x={28} y={20} width={3} height={3} />
        </g>
      );
    case "star":
      return (
        <path
          d="M24 14 L26.8 22 L35 22 L28.5 27 L31 35 L24 30 L17 35 L19.5 27 L13 22 L21.2 22 Z"
          className="fill-white"
        />
      );
    case "wand":
      return (
        <g>
          <line x1={17} y1={37} x2={30} y2={20} className="stroke-white" strokeWidth={2.4} strokeLinecap="round" />
          <path d="M31 15 L32.2 18 L35 19 L32.2 20 L31 23 L29.8 20 L27 19 L29.8 18 Z" className="fill-white" />
        </g>
      );
    case "shield":
      return (
        <g className="fill-white">
          <path d="M24 16 L32 19 V27 C32 33 28 36 24 38 C20 36 16 33 16 27 V19 Z" className="opacity-95" />
          <path d="M24 16 V38 C28 36 32 33 32 27 V19 Z" className="opacity-60" />
        </g>
      );
    case "compass":
      return (
        <g className="stroke-white" fill="none" strokeWidth={1.6}>
          <circle cx={24} cy={27} r={9} />
          <path d="M24 27 L28 19 L24 27 L20 35 Z" className="fill-white" />
          <circle cx={24} cy={27} r={1.4} className="fill-white" stroke="none" />
        </g>
      );
    case "rune":
      return (
        <g className="stroke-white" fill="none" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
          <path d="M24 16 V38 M24 22 L30 18 M24 28 L18 24 M24 28 L30 32" />
          <circle cx={24} cy={27} r={9.5} strokeDasharray="2 4" strokeWidth={1.2} />
        </g>
      );
    case "atom":
    default:
      return (
        <g className="stroke-white" fill="none" strokeWidth={1.6}>
          <ellipse cx={24} cy={27} rx={11} ry={4.4} />
          <ellipse cx={24} cy={27} rx={11} ry={4.4} transform="rotate(60 24 27)" />
          <ellipse cx={24} cy={27} rx={11} ry={4.4} transform="rotate(120 24 27)" />
          <circle cx={24} cy={27} r={2.6} className="fill-white" />
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
