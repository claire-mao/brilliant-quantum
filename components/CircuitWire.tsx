import type { GateId } from "@/lib/types";
import GateTile, { type TileKind } from "./GateTile";

/**
 * Renders a circuit as a left-to-right wire: |0> -> gates -> Measure.
 * Wraps on small screens. `activeIndex` highlights one tile (0 = the |0> start,
 * 1..n = gates, n+1 = Measure) for playback.
 */
export default function CircuitWire({
  gates,
  showMeasure = true,
  activeIndex,
}: {
  gates: GateId[];
  showMeasure?: boolean;
  activeIndex?: number;
}) {
  const tiles: { kind: TileKind; label: string }[] = [
    { kind: "init", label: "|0\u27E9" },
    ...gates.map((g) => ({ kind: "gate" as TileKind, label: g })),
  ];
  if (showMeasure) tiles.push({ kind: "measure", label: "Measure" });

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white p-4">
      {tiles.map((tile, i) => (
        <div key={i} className="flex items-center gap-2">
          {i > 0 && (
            <span aria-hidden="true" className="text-slate-300">
              &rarr;
            </span>
          )}
          <GateTile kind={tile.kind} label={tile.label} active={activeIndex === i} />
        </div>
      ))}
    </div>
  );
}
