import type { UnitStatus } from "@/content/lessons";

export type SigilKind = "atom" | "gate" | "wave" | "nodes" | "branch" | "chip";

/** Map a course unit id to its sigil. Unknown ids fall back to the atom. */
export function sigilForUnitId(id: string): SigilKind {
  switch (id) {
    case "chapter-information":
      return "atom";
    case "chapter-transforming":
      return "gate";
    case "chapter-why-quantum":
      return "wave";
    case "chapter-multiple-qubits":
      return "nodes";
    case "chapter-algorithms":
      return "branch";
    case "chapter-hardware":
      return "chip";
    default:
      return "atom";
  }
}

const STATUS_RING: Record<UnitStatus, string> = {
  completed: "border-emerald-400/60 text-emerald-300 shadow-[0_0_18px_rgba(52,211,153,0.35)]",
  active: "border-violet-400/60 text-violet-200 shadow-[0_0_18px_rgba(167,139,250,0.4)] sigil-pulse",
  locked: "border-white/10 text-slate-500",
  "coming-soon": "border-white/10 text-slate-500",
};

const STATUS_FILL: Record<UnitStatus, string> = {
  completed: "from-emerald-500/25 to-emerald-900/10",
  active: "from-violet-500/30 to-indigo-900/10",
  locked: "from-white/5 to-white/0",
  "coming-soon": "from-white/5 to-white/0",
};

/** Glowing circular unit sigil with a distinct quantum glyph per unit. */
export default function UnitSigil({
  kind,
  status,
  className = "h-12 w-12",
}: {
  kind: SigilKind;
  status: UnitStatus;
  className?: string;
}) {
  return (
    <span
      className={`relative inline-flex shrink-0 items-center justify-center rounded-full border bg-gradient-to-b ${className} ${STATUS_RING[status]} ${STATUS_FILL[status]}`}
      aria-hidden="true"
    >
      <svg viewBox="0 0 48 48" className="h-2/3 w-2/3" fill="none" stroke="currentColor" strokeWidth={2}>
        {glyph(kind)}
      </svg>
    </span>
  );
}

function glyph(kind: SigilKind) {
  switch (kind) {
    case "gate":
      return (
        <g strokeLinecap="round">
          <line x1="8" y1="18" x2="16" y2="18" />
          <line x1="8" y1="30" x2="16" y2="30" />
          <line x1="32" y1="18" x2="40" y2="18" />
          <line x1="32" y1="30" x2="40" y2="30" />
          <rect x="16" y="13" width="16" height="22" rx="3" />
          <text x="24" y="28" textAnchor="middle" fontSize="11" stroke="none" fill="currentColor" fontFamily="monospace">
            H
          </text>
        </g>
      );
    case "wave":
      return (
        <g strokeLinecap="round">
          <path d="M6 24 C12 10 18 10 24 24 C30 38 36 38 42 24" />
          <path d="M6 24 C12 38 18 38 24 24 C30 10 36 10 42 24" className="opacity-60" />
        </g>
      );
    case "nodes":
      return (
        <g>
          <g strokeLinecap="round">
            <line x1="14" y1="14" x2="34" y2="14" />
            <line x1="14" y1="14" x2="14" y2="34" />
            <line x1="34" y1="14" x2="34" y2="34" />
            <line x1="14" y1="34" x2="34" y2="34" />
            <line x1="14" y1="14" x2="34" y2="34" />
          </g>
          <g fill="currentColor" stroke="none">
            <circle cx="14" cy="14" r="3.4" />
            <circle cx="34" cy="14" r="3.4" />
            <circle cx="14" cy="34" r="3.4" />
            <circle cx="34" cy="34" r="3.4" />
          </g>
        </g>
      );
    case "branch":
      return (
        <g strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 38 V26 M12 26 L24 14 M12 26 L24 30 M24 14 L36 10 M24 14 L36 18" />
          <g fill="currentColor" stroke="none">
            <circle cx="12" cy="40" r="3" />
            <circle cx="36" cy="9" r="3" />
            <circle cx="36" cy="19" r="3" />
            <circle cx="24" cy="31" r="3" />
          </g>
        </g>
      );
    case "chip":
      return (
        <g strokeLinecap="round">
          <rect x="15" y="15" width="18" height="18" rx="2" />
          <rect x="21" y="21" width="6" height="6" rx="1" fill="currentColor" stroke="none" />
          <path d="M20 15 V9 M28 15 V9 M20 33 V39 M28 33 V39 M15 20 H9 M15 28 H9 M33 20 H39 M33 28 H39" />
        </g>
      );
    case "atom":
    default:
      return (
        <g>
          <g fill="none">
            <ellipse cx="24" cy="24" rx="16" ry="6.5" />
            <ellipse cx="24" cy="24" rx="16" ry="6.5" transform="rotate(60 24 24)" />
            <ellipse cx="24" cy="24" rx="16" ry="6.5" transform="rotate(120 24 24)" />
          </g>
          <circle cx="24" cy="24" r="3.4" fill="currentColor" stroke="none" />
        </g>
      );
  }
}
