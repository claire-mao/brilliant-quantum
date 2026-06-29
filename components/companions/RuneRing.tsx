/**
 * Arcane rune ring: concentric solid circles, radial ticks, geometric sigils,
 * node constellation, and counter-rotating layers. Uses `aura-spin-*` from
 * globals.css; rotation is disabled under prefers-reduced-motion.
 */
const C = 24;

const CARDINAL_NODES: ReadonlyArray<{ cx: number; cy: number; r: number }> = [
  { cx: 24, cy: 3, r: 1.5 },
  { cx: 38.85, cy: 9.15, r: 1 },
  { cx: 45, cy: 24, r: 1.5 },
  { cx: 38.85, cy: 38.85, r: 1 },
  { cx: 24, cy: 45, r: 1.5 },
  { cx: 9.15, cy: 38.85, r: 1 },
  { cx: 3, cy: 24, r: 1.5 },
  { cx: 9.15, cy: 9.15, r: 1 },
];

/** Constellation edges between cardinal nodes (indices into CARDINAL_NODES). */
const CONSTELLATION_EDGES: ReadonlyArray<[number, number]> = [
  [0, 2],
  [2, 4],
  [4, 6],
  [6, 0],
  [1, 3],
  [3, 5],
  [5, 7],
  [7, 1],
  [0, 1],
  [2, 3],
  [4, 5],
  [6, 7],
];

function rays(count: number, inner: number, outer: number, offset = 0) {
  return Array.from({ length: count }, (_, i) => {
    const a = (i * 2 * Math.PI) / count + offset;
    return {
      x1: C + Math.cos(a) * inner,
      y1: C + Math.sin(a) * inner,
      x2: C + Math.cos(a) * outer,
      y2: C + Math.sin(a) * outer,
    };
  });
}

function polygonPoints(n: number, r: number, offset = -Math.PI / 2): string {
  return Array.from({ length: n }, (_, i) => {
    const a = (i * 2 * Math.PI) / n + offset;
    return `${(C + Math.cos(a) * r).toFixed(2)},${(C + Math.sin(a) * r).toFixed(2)}`;
  }).join(" ");
}

function starPath(points: number, skip: number, radius: number): string {
  const pts = Array.from({ length: points }, (_, i) => {
    const a = (i * 2 * Math.PI) / points - Math.PI / 2;
    return [C + Math.cos(a) * radius, C + Math.sin(a) * radius] as const;
  });
  const order: (readonly [number, number])[] = [];
  let idx = 0;
  for (let k = 0; k < points; k++) {
    order.push(pts[idx]);
    idx = (idx + skip) % points;
  }
  return "M" + order.map((p) => `${p[0].toFixed(2)} ${p[1].toFixed(2)}`).join(" L") + " Z";
}

function runeGlyphs(count: number, radius: number, offset = Math.PI / 8) {
  return Array.from({ length: count }, (_, i) => {
    const a = (i * 2 * Math.PI) / count + offset;
    const cx = C + Math.cos(a) * radius;
    const cy = C + Math.sin(a) * radius;
    const s = 2.2;
    return { cx, cy, s, rot: (a * 180) / Math.PI + 90 };
  });
}

const OUTER_TICKS = rays(24, 19.5, 22.5);
const MID_TICKS = rays(12, 15.5, 17.5, Math.PI / 12);
const INNER_TICKS = rays(16, 11.5, 13.2, Math.PI / 16);
const RUNE_GLYPHS = runeGlyphs(8, 15.8);

const SIZE_CLASS = {
  sm: "h-7 w-7",
  lg: "h-full w-full",
} as const;

export default function RuneRing({
  className,
  size = "sm",
  glow = true,
}: {
  /** Tailwind size utilities; defaults from `size` when omitted. */
  className?: string;
  size?: keyof typeof SIZE_CLASS;
  glow?: boolean;
}) {
  const resolvedClass = className ?? SIZE_CLASS[size];

  return (
    <span className={`relative inline-flex shrink-0 items-center justify-center ${resolvedClass}`} aria-hidden="true">
      {glow && (
        <>
          <span className="absolute inset-0 rounded-full bg-indigo-400/20 blur-[6px] motion-safe:animate-pulse" />
          <span
            className="absolute inset-[8%] rounded-full bg-violet-400/15 blur-[4px] motion-safe:animate-pulse"
            style={{ animationDelay: "0.6s" }}
          />
        </>
      )}
      {/* Outer layer — slow clockwise */}
      <svg
        viewBox="0 0 48 48"
        fill="none"
        stroke="currentColor"
        className="aura-spin-cw absolute inset-0 h-full w-full text-indigo-500"
      >
        <circle cx={C} cy={C} r="22" strokeWidth="1.75" opacity="0.5" />
        <circle cx={C} cy={C} r="20" strokeWidth="0.85" opacity="0.35" />
        <circle cx={C} cy={C} r="18" strokeWidth="1.35" opacity="0.65" />
        <circle cx={C} cy={C} r="16" strokeWidth="0.7" opacity="0.4" />
        <circle cx={C} cy={C} r="14" strokeWidth="1.1" opacity="0.55" />

        <polygon points={polygonPoints(6, 20.5)} strokeWidth="0.95" opacity="0.45" />

        <g strokeLinecap="round" strokeWidth="1.15" opacity="0.62">
          {OUTER_TICKS.map((t, i) => (
            <line key={`o${i}`} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} />
          ))}
        </g>
        <g strokeLinecap="round" strokeWidth="0.85" opacity="0.48">
          {MID_TICKS.map((t, i) => (
            <line key={`m${i}`} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} />
          ))}
        </g>

        <g strokeWidth="0.75" opacity="0.38">
          {CONSTELLATION_EDGES.map(([a, b], i) => (
            <line
              key={`e${i}`}
              x1={CARDINAL_NODES[a].cx}
              y1={CARDINAL_NODES[a].cy}
              x2={CARDINAL_NODES[b].cx}
              y2={CARDINAL_NODES[b].cy}
            />
          ))}
        </g>

        <g strokeWidth="0.9" opacity="0.55">
          {RUNE_GLYPHS.map((g, i) => (
            <g key={`g${i}`} transform={`rotate(${g.rot} ${g.cx} ${g.cy})`}>
              <line x1={g.cx} y1={g.cy - g.s} x2={g.cx} y2={g.cy + g.s} />
              <line x1={g.cx - g.s * 0.65} y1={g.cy} x2={g.cx + g.s * 0.65} y2={g.cy} />
            </g>
          ))}
        </g>

        <g fill="currentColor" stroke="none" opacity="0.88">
          {CARDINAL_NODES.map((n, i) => (
            <circle key={i} cx={n.cx} cy={n.cy} r={n.r} />
          ))}
        </g>
      </svg>

      {/* Inner layer — slow counter-clockwise */}
      <svg
        viewBox="0 0 48 48"
        fill="none"
        stroke="currentColor"
        className="aura-spin-ccw absolute inset-0 h-full w-full text-indigo-400"
      >
        <circle cx={C} cy={C} r="12.5" strokeWidth="1.05" opacity="0.42" />
        <circle cx={C} cy={C} r="10.5" strokeWidth="0.75" opacity="0.35" />
        <circle cx={C} cy={C} r="8.2" strokeWidth="1.2" opacity="0.5" />
        <circle cx={C} cy={C} r="6" strokeWidth="0.65" opacity="0.38" />

        <path d={starPath(7, 3, 9.8)} strokeWidth="0.95" strokeLinejoin="round" opacity="0.58" />
        <polygon points={polygonPoints(3, 7.2)} strokeWidth="0.8" opacity="0.42" />
        <polygon points={polygonPoints(3, 7.2, Math.PI / 2)} strokeWidth="0.8" opacity="0.42" />
        <polygon points={polygonPoints(6, 5.8)} strokeWidth="0.75" opacity="0.45" />

        <path
          d="M24 13.5 L30.17 32.49 L14.01 20.76 L33.99 20.76 L17.83 32.49 Z"
          strokeWidth="0.85"
          strokeLinejoin="round"
          opacity="0.52"
        />

        <g strokeLinecap="round" strokeWidth="0.9" opacity="0.5">
          {INNER_TICKS.map((t, i) => (
            <line key={`i${i}`} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} />
          ))}
        </g>

        {/* Secondary inner sigil: cross + corner arcs */}
        <g strokeWidth="0.85" opacity="0.55">
          <line x1={C} y1={C - 4.2} x2={C} y2={C + 4.2} strokeLinecap="round" />
          <line x1={C - 4.2} y1={C} x2={C + 4.2} y2={C} strokeLinecap="round" />
          <path d="M20.2 20.2 A3.2 3.2 0 0 1 22.4 18.6" strokeLinecap="round" />
          <path d="M27.8 20.2 A3.2 3.2 0 0 0 25.6 18.6" strokeLinecap="round" />
          <path d="M27.8 27.8 A3.2 3.2 0 0 1 25.6 29.4" strokeLinecap="round" />
          <path d="M20.2 27.8 A3.2 3.2 0 0 0 22.4 29.4" strokeLinecap="round" />
        </g>

        <circle cx={C} cy={C} r="1.8" fill="currentColor" stroke="none" opacity="0.75" />
        <circle cx={C} cy={C} r="3.4" strokeWidth="0.7" opacity="0.45" />
      </svg>
    </span>
  );
}
