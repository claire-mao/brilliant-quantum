/**
 * Static visual of a qubit that has already been measured and collapsed to a
 * concrete result. Used to set up the "collapse check" graded question.
 */
export default function CollapseCheckVisual({ result }: { result: 0 | 1 }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-5">
      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-4xl font-bold tabular-nums text-indigo-700">
        {result}
      </div>
      <div>
        <p className="font-semibold text-slate-900">Measured: {result}</p>
        <p className="text-sm text-slate-500">
          This qubit has collapsed. It is no longer uncertain.
        </p>
      </div>
    </div>
  );
}
