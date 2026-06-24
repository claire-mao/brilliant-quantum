export type TileKind = "init" | "gate" | "measure";

/** A single labeled tile on a circuit wire: the |0> start, a gate, or Measure. */
export default function GateTile({
  kind,
  label,
  active = false,
}: {
  kind: TileKind;
  label: string;
  active?: boolean;
}) {
  const base =
    "flex h-12 min-w-12 items-center justify-center rounded-lg px-3 text-base font-bold transition-colors";

  let tone: string;
  if (kind === "init") {
    tone = "bg-slate-100 text-slate-700";
  } else if (kind === "measure") {
    tone = active
      ? "bg-emerald-600 text-white"
      : "bg-emerald-100 text-emerald-700";
  } else {
    tone = active ? "bg-indigo-600 text-white" : "bg-indigo-100 text-indigo-700";
  }

  return (
    <div
      className={`${base} ${tone} ${active ? "ring-2 ring-offset-2 ring-indigo-400" : ""}`}
      aria-label={kind === "measure" ? "Measure" : label}
    >
      {label}
    </div>
  );
}
