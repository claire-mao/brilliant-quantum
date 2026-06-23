"use client";

export default function ProbabilityVisual({ pOne }: { pOne: number }) {
  const one = Math.round(pOne);
  const zero = 100 - one;

  return (
    <div className="w-full">
      <div className="flex items-end gap-4 sm:gap-8" aria-hidden="true">
        <Bar label="0" value={zero} color="bg-sky-500" track="bg-sky-100" />
        <Bar label="1" value={one} color="bg-indigo-600" track="bg-indigo-100" />
      </div>
      <p className="sr-only">
        Probability of measuring 0 is {zero} percent. Probability of measuring 1 is {one}{" "}
        percent.
      </p>
    </div>
  );
}

function Bar({
  label,
  value,
  color,
  track,
}: {
  label: string;
  value: number;
  color: string;
  track: string;
}) {
  return (
    <div className="flex flex-1 flex-col items-center gap-2">
      <span className="text-lg font-bold tabular-nums text-slate-900">{value}%</span>
      <div
        className={`relative flex h-40 w-full max-w-24 items-end overflow-hidden rounded-xl ${track}`}
      >
        <div
          className={`w-full rounded-xl transition-[height] duration-100 ease-out ${color}`}
          style={{ height: `${value}%` }}
        />
      </div>
      <span className="text-sm font-medium text-slate-500">Measure {label}</span>
    </div>
  );
}
