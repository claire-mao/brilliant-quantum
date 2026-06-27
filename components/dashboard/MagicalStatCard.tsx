import type { ReactNode } from "react";

/** Small glassy stat tile for the dark dashboard progress panel. */
export default function MagicalStatCard({
  label,
  value,
  hint,
  icon,
}: {
  label: string;
  value: string;
  hint?: string;
  icon?: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 backdrop-blur-sm">
      <div className="flex items-center gap-1.5">
        {icon && <span className="text-violet-300">{icon}</span>}
        <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">{label}</p>
      </div>
      <p className="mt-0.5 truncate text-lg font-semibold tabular-nums text-white" title={value}>
        {value}
      </p>
      {hint && <p className="text-[11px] text-slate-500">{hint}</p>}
    </div>
  );
}
