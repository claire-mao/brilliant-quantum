"use client";

export default function QubitSlider({
  value,
  onChange,
  disabled = false,
}: {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}) {
  return (
    <div className="w-full">
      <label
        htmlFor="qubit-slider"
        className="mb-2 flex items-center justify-between text-sm font-medium text-slate-600"
      >
        <span>Chance of measuring 1</span>
        <span className="tabular-nums text-slate-900">{value}%</span>
      </label>
      <input
        id="qubit-slider"
        type="range"
        min={0}
        max={100}
        step={1}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-valuetext={`${value} percent chance of measuring 1`}
        className="h-3 w-full cursor-pointer touch-none appearance-none rounded-full bg-gradient-to-r from-sky-200 to-indigo-200 accent-indigo-600 disabled:opacity-60"
        style={{ touchAction: "none" }}
      />
      <div className="mt-1 flex justify-between text-xs text-slate-400">
        <span>0%</span>
        <span>100%</span>
      </div>
    </div>
  );
}
