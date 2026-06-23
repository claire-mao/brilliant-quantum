export default function Badge({
  title = "Quantum Beginner",
  subtitle = "Completed your first lesson",
}: {
  title?: string;
  subtitle?: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-400 text-lg">
        <span aria-hidden="true">★</span>
      </div>
      <div>
        <p className="font-semibold text-amber-900">{title}</p>
        <p className="text-sm text-amber-700">{subtitle}</p>
      </div>
    </div>
  );
}
