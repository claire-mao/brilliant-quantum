"use client";

/** Animated two-bar histogram of measurement outcomes (counts of 0 and 1). */
export default function Histogram({
  zeros,
  ones,
  total,
}: {
  zeros: number;
  ones: number;
  total: number;
}) {
  const max = Math.max(zeros, ones, 1);

  return (
    <div className="flex items-end gap-6 sm:gap-10">
      <HistogramBar
        label="0"
        count={zeros}
        total={total}
        heightPct={(zeros / max) * 100}
        color="bg-sky-500"
        track="bg-sky-100"
      />
      <HistogramBar
        label="1"
        count={ones}
        total={total}
        heightPct={(ones / max) * 100}
        color="bg-indigo-600"
        track="bg-indigo-100"
      />
    </div>
  );
}

function HistogramBar({
  label,
  count,
  total,
  heightPct,
  color,
  track,
}: {
  label: string;
  count: number;
  total: number;
  heightPct: number;
  color: string;
  track: string;
}) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex flex-1 flex-col items-center gap-2">
      <span className="text-lg font-bold tabular-nums text-slate-900">{count}</span>
      <div
        className={`relative flex h-40 w-full max-w-24 items-end overflow-hidden rounded-xl ${track}`}
      >
        <div
          className={`w-full rounded-xl transition-[height] duration-500 ease-out ${color}`}
          style={{ height: `${heightPct}%` }}
        />
      </div>
      <span className="text-sm font-medium text-slate-500">
        Measured {label}
      </span>
      <span className="text-xs text-slate-400 tabular-nums">{pct}%</span>
    </div>
  );
}
