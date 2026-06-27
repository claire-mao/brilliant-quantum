/**
 * Decorative cosmic backdrop for the dashboard — pure CSS/SVG, no images.
 * Deep navy/violet gradient, deterministic twinkling stars, faint orbital
 * lines, and drifting quantum-notation glyphs. Fully aria-hidden and behind
 * content; animations are disabled under prefers-reduced-motion.
 */

/** Deterministic PRNG so server and client render identical star fields. */
function mulberry32(seed: number): () => number {
  let s = seed;
  return () => {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(20260626);
const STARS = Array.from({ length: 46 }, () => ({
  top: rand() * 100,
  left: rand() * 100,
  size: 1 + rand() * 1.8,
  delay: rand() * 5,
  dur: 2.4 + rand() * 3.5,
  op: 0.25 + rand() * 0.6,
}));

const GLYPHS = [
  { t: "|0⟩", top: 16, left: 8 },
  { t: "|1⟩", top: 70, left: 14 },
  { t: "|ψ⟩", top: 30, left: 88 },
  { t: "H", top: 80, left: 82 },
  { t: "⊗", top: 50, left: 50 },
  { t: "|+⟩", top: 12, left: 64 },
  { t: "⟨φ|", top: 86, left: 44 },
  { t: "√", top: 44, left: 24 },
];

export default function QuantumWizardBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* radial accent glows */}
      <div className="absolute -left-32 -top-24 h-96 w-96 rounded-full bg-violet-600/20 blur-3xl" />
      <div className="absolute -right-24 top-32 h-80 w-80 rounded-full bg-indigo-500/15 blur-3xl" />
      <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-amber-400/10 blur-3xl" />

      {/* orbital lines */}
      <svg
        viewBox="0 0 400 400"
        className="orbit-rotate absolute -right-20 top-10 h-[28rem] w-[28rem] opacity-30"
        fill="none"
        stroke="currentColor"
      >
        <g className="text-violet-300/40">
          <ellipse cx="200" cy="200" rx="150" ry="60" strokeWidth="1" />
          <ellipse cx="200" cy="200" rx="150" ry="60" strokeWidth="1" transform="rotate(60 200 200)" />
          <ellipse cx="200" cy="200" rx="150" ry="60" strokeWidth="1" transform="rotate(120 200 200)" />
        </g>
      </svg>
      <svg
        viewBox="0 0 400 400"
        className="orbit-rotate-rev absolute -left-24 bottom-0 h-[24rem] w-[24rem] opacity-20"
        fill="none"
        stroke="currentColor"
      >
        <g className="text-indigo-300/40">
          <circle cx="200" cy="200" r="160" strokeWidth="1" strokeDasharray="4 10" />
          <circle cx="200" cy="200" r="110" strokeWidth="1" strokeDasharray="2 8" />
        </g>
      </svg>

      {/* stars */}
      {STARS.map((s, i) => (
        <span
          key={i}
          className="star-twinkle absolute rounded-full bg-white"
          style={{
            top: `${s.top}%`,
            left: `${s.left}%`,
            width: `${s.size}px`,
            height: `${s.size}px`,
            ["--star-op" as string]: s.op,
            animationDelay: `${s.delay}s`,
            animationDuration: `${s.dur}s`,
          }}
        />
      ))}

      {/* faint quantum glyphs */}
      {GLYPHS.map((g, i) => (
        <span
          key={i}
          className="glyph-drift absolute select-none font-mono text-2xl text-violet-200/10 sm:text-3xl"
          style={{ top: `${g.top}%`, left: `${g.left}%`, animationDelay: `${i * 0.7}s` }}
        >
          {g.t}
        </span>
      ))}
    </div>
  );
}
