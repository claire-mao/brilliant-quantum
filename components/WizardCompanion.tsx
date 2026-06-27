"use client";

/**
 * Grouped pixel wizard with quantum wand and layered body parts.
 * CSS variables drive floppy drag physics on each group independently.
 */

type Mood = "idle" | "thinking" | "happy" | "still";

export type WandMode = "idle" | "glow" | "beam" | "celebrate";

const COLOR = {
  hat: "#4338ca",
  hatDark: "#3730a3",
  star: "#fbbf24",
  skin: "#f3c9a4",
  eye: "#1f2937",
  beard: "#eef2f7",
  robe: "#6366f1",
  robeDark: "#4f46e5",
  wand: "#7c3aed",
  wandTip: "#c4b5fd",
  orb: "#a5b4fc",
  cat: "#64748b",
  catDark: "#475569",
};

interface Pixel {
  x: number;
  y: number;
  w: number;
  h: number;
  c: string;
}

const ROBE: Pixel[] = [
  { x: 4, y: 12, w: 8, h: 5, c: COLOR.robe },
  { x: 4, y: 16, w: 8, h: 1, c: COLOR.robeDark },
  { x: 5, y: 11, w: 6, h: 1, c: COLOR.robeDark },
];

const ARMS: Pixel[] = [
  { x: 3, y: 9, w: 2, h: 4, c: COLOR.robe },
  { x: 11, y: 9, w: 2, h: 4, c: COLOR.robe },
  { x: 3, y: 12, w: 1, h: 1, c: COLOR.skin },
  { x: 12, y: 12, w: 1, h: 1, c: COLOR.skin },
];

const BODY: Pixel[] = [
  { x: 5, y: 6, w: 6, h: 3, c: COLOR.skin },
  { x: 6, y: 7, w: 1, h: 1, c: COLOR.eye },
  { x: 9, y: 7, w: 1, h: 1, c: COLOR.eye },
  { x: 5, y: 9, w: 6, h: 1, c: COLOR.beard },
  { x: 6, y: 10, w: 4, h: 1, c: COLOR.beard },
  { x: 7, y: 11, w: 2, h: 1, c: COLOR.beard },
];

// Symmetric about x=8 (the face/beard center) so the hat sits centered.
const HAT: Pixel[] = [
  { x: 3, y: 5, w: 10, h: 1, c: COLOR.hatDark },
  { x: 4, y: 4, w: 8, h: 1, c: COLOR.hat },
  { x: 5, y: 3, w: 6, h: 1, c: COLOR.hat },
  { x: 6, y: 2, w: 4, h: 1, c: COLOR.hat },
  { x: 7, y: 1, w: 2, h: 1, c: COLOR.hat },
  { x: 7, y: 3, w: 2, h: 1, c: COLOR.star },
];

const CAT: Pixel[] = [
  { x: 0, y: 14, w: 1, h: 1, c: COLOR.cat },
  { x: 2, y: 14, w: 1, h: 1, c: COLOR.cat },
  { x: 0, y: 15, w: 3, h: 2, c: COLOR.cat },
  { x: 3, y: 13, w: 1, h: 3, c: COLOR.catDark },
  { x: 1, y: 15, w: 1, h: 1, c: COLOR.eye },
];

function PixelGroup({ pixels }: { pixels: Pixel[] }) {
  return (
    <>
      {pixels.map((p, i) => (
        <rect key={i} x={p.x} y={p.y} width={p.w} height={p.h} fill={p.c} />
      ))}
    </>
  );
}

/** Quantum wand with optional glow, beam, and particle trail. */
function QuantumWand({ mode, aimDeg = -35 }: { mode: WandMode; aimDeg?: number }) {
  const glowing = mode === "glow" || mode === "beam" || mode === "celebrate";
  return (
    <g
      className="wizard-wand-group"
      style={{ transformOrigin: "11px 11px", transform: `rotate(${aimDeg}deg)` }}
    >
      <rect x={11} y={10} width={1} height={6} fill={COLOR.wand} />
      <rect x={10} y={9} width={3} height={1} fill={COLOR.wandTip} />
      {glowing && (
        <g className="wand-sun" aria-hidden="true">
          {/* light radiating outward like a small sun */}
          <circle cx={11.5} cy={8.5} r={3.4} fill="url(#wand-sun-grad)" className="wand-sun-core" />
          <circle cx={11.5} cy={8.5} r={3.4} fill="url(#wand-sun-grad)" className="wand-sun-core" style={{ animationDelay: "0.9s" }} />
          <g className="wand-sun-rays" stroke="#fde68a" strokeWidth={0.35} strokeLinecap="round">
            <line x1={11.5} y1={3.8} x2={11.5} y2={2.1} />
            <line x1={11.5} y1={13.2} x2={11.5} y2={14.9} />
            <line x1={6.8} y1={8.5} x2={5.1} y2={8.5} />
            <line x1={16.2} y1={8.5} x2={17.0} y2={8.5} />
            <line x1={8.3} y1={5.3} x2={7.2} y2={4.2} />
            <line x1={14.7} y1={5.3} x2={15.8} y2={4.2} />
            <line x1={8.3} y1={11.7} x2={7.2} y2={12.8} />
            <line x1={14.7} y1={11.7} x2={15.8} y2={12.8} />
          </g>
        </g>
      )}
      <circle cx={11.5} cy={8.5} r={1.2} fill={COLOR.orb} className={glowing ? "wand-orb-glow" : ""} />
      {glowing && (
        <>
          <circle cx={11.5} cy={8.5} r={2.5} fill="none" stroke="#c4b5fd" strokeWidth={0.4} className="wand-ring" />
          <WandParticles active intense={mode === "celebrate" || mode === "beam"} />
        </>
      )}
    </g>
  );
}

function WandParticles({ active, intense }: { active: boolean; intense: boolean }) {
  if (!active) return null;
  const spots = intense ? 6 : 4;
  return (
    <g className="wand-particles pointer-events-none" aria-hidden="true">
      {Array.from({ length: spots }).map((_, i) => (
        <circle
          key={i}
          cx={11.5 + (i % 2 === 0 ? -1 : 1) * (1 + i * 0.3)}
          cy={6 - i * 1.1}
          r={0.45}
          fill={i % 2 === 0 ? "#fde68a" : "#a5b4fc"}
          className="wand-particle"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </g>
  );
}

export default function WizardCompanion({
  mood = "idle",
  withCat = false,
  blink = false,
  className = "h-12 w-12",
  wandMode = "idle",
  wandAim = -35,
  floppy = true,
}: {
  mood?: Mood;
  withCat?: boolean;
  blink?: boolean;
  className?: string;
  wandMode?: WandMode;
  /** Degrees — negative points upper-left, positive upper-right. */
  wandAim?: number;
  /** Enable layered CSS-variable physics transforms. */
  floppy?: boolean;
}) {
  const physicsClass = floppy ? "wizard-floppy" : "";

  return (
    <span className={`relative inline-flex shrink-0 ${mood === "idle" ? "wizard-bob" : ""} ${physicsClass}`}>
      <svg
        viewBox="-1 0 18 18"
        className={className}
        role="img"
        aria-label="Quantum wizard companion"
        shapeRendering="crispEdges"
      >
        <defs>
          <radialGradient id="wand-sun-grad" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor="#fff7ed" stopOpacity="0.95" />
            <stop offset="45%" stopColor="#fde68a" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
          </radialGradient>
        </defs>

        {withCat && (
          <g className="wizard-cat-group">
            <PixelGroup pixels={CAT} />
          </g>
        )}

        <g className="wizard-robe-group" style={{ transformOrigin: "8px 14px" }}>
          <PixelGroup pixels={ROBE} />
        </g>

        <g className="wizard-body-group" style={{ transformOrigin: "8px 10px" }}>
          <PixelGroup pixels={BODY} />
          {blink && (
            <g fill={COLOR.skin} className="companion-blink">
              <rect x={6} y={7} width={1} height={1} />
              <rect x={9} y={7} width={1} height={1} />
            </g>
          )}
        </g>

        <g className="wizard-arms-group" style={{ transformOrigin: "8px 11px" }}>
          <PixelGroup pixels={ARMS} />
        </g>

        <g className="wizard-hat-group" style={{ transformOrigin: "8px 5px" }}>
          <PixelGroup pixels={HAT} />
        </g>

        <g className="wizard-wand-wrap" style={{ transformOrigin: "11px 11px" }}>
          <QuantumWand
            mode={mood === "happy" ? "celebrate" : mood === "thinking" ? "glow" : wandMode}
            aimDeg={wandAim}
          />
        </g>

        {mood === "happy" && (
          <g fill={COLOR.star}>
            <rect className="sparkle" x={3} y={2} width={1} height={1} />
            <rect className="sparkle" x={12} y={3} width={1} height={1} style={{ animationDelay: "0.5s" }} />
          </g>
        )}
      </svg>
      {mood === "thinking" && (
        <span className="absolute -right-1 top-0 flex gap-0.5" aria-hidden="true">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="wizard-think-dot h-1 w-1 rounded-full bg-indigo-400"
              style={{ animationDelay: `${i * 0.18}s` }}
            />
          ))}
        </span>
      )}
    </span>
  );
}

/** CSS-only light-magic sparkle burst. */
export function SparkleBurst({ className = "" }: { className?: string }) {
  const sparks = [
    { top: "0%", left: "10%", delay: "0s" },
    { top: "20%", left: "92%", delay: "0.3s" },
    { top: "80%", left: "0%", delay: "0.6s" },
    { top: "92%", left: "80%", delay: "0.9s" },
    { top: "-8%", left: "55%", delay: "0.45s" },
  ];
  return (
    <span className={`pointer-events-none absolute inset-0 ${className}`} aria-hidden="true">
      {sparks.map((s, i) => (
        <span
          key={i}
          className="sparkle absolute block h-2 w-2 rounded-[1px] bg-amber-300"
          style={{ top: s.top, left: s.left, animationDelay: s.delay }}
        />
      ))}
    </span>
  );
}

/** Floating magic motes for appear / help / badge moments. */
export function MagicMotes({ className = "" }: { className?: string }) {
  return (
    <span className={`pointer-events-none absolute inset-0 overflow-visible ${className}`} aria-hidden="true">
      {[0, 1, 2, 3, 4].map((i) => (
        <span
          key={i}
          className="magic-mote absolute h-1 w-1 rounded-full bg-indigo-300"
          style={{
            top: `${15 + i * 14}%`,
            left: `${10 + i * 18}%`,
            animationDelay: `${i * 0.22}s`,
          }}
        />
      ))}
    </span>
  );
}
