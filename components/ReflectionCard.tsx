export default function ReflectionCard({
  intro,
  points,
}: {
  intro: string;
  points: string[];
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <p className="text-base text-slate-700">{intro}</p>
      <ul className="mt-4 flex flex-col gap-3">
        {points.map((point) => (
          <li key={point} className="flex items-start gap-3 text-slate-800">
            <span
              aria-hidden="true"
              className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700"
            >
              ✓
            </span>
            <span className="text-sm leading-6">{point}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
