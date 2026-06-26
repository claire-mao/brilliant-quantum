import AchievementBadge, {
  type AchievementBadgeType,
  type AchievementIcon,
} from "./AchievementBadge";

/**
 * A single achievement: a shield badge, title, short description, locked/
 * unlocked state, and a progress bar with a caption. Unlocked cards read as
 * solid; locked cards are muted. Purely presentational and responsive.
 */
export default function AchievementCard({
  title,
  description,
  unlocked,
  type,
  icon,
  progressLabel,
  ratio,
}: {
  title: string;
  description: string;
  unlocked: boolean;
  type: AchievementBadgeType;
  icon: AchievementIcon;
  progressLabel: string;
  ratio: number;
}) {
  const pct = Math.round(Math.max(0, Math.min(1, ratio)) * 100);

  return (
    <div
      className={`flex gap-3 rounded-xl border p-4 transition-colors ${
        unlocked ? "border-indigo-200 bg-white" : "border-slate-200 bg-slate-50"
      }`}
    >
      <AchievementBadge unlocked={unlocked} type={type} icon={icon} className="h-12 w-12 shrink-0" />

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className={`font-semibold ${unlocked ? "text-slate-900" : "text-slate-500"}`}>{title}</p>
          <span
            className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
              unlocked ? "bg-indigo-100 text-indigo-700" : "bg-slate-200 text-slate-500"
            }`}
          >
            {unlocked ? "Unlocked" : "Locked"}
          </span>
        </div>
        <p className="mt-0.5 text-sm text-slate-500">{description}</p>

        <div className="mt-3">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className={`h-1.5 rounded-full transition-[width] duration-300 ${
                unlocked ? "bg-indigo-600" : "bg-slate-300"
              }`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="mt-1 text-xs text-slate-400">{progressLabel}</p>
        </div>
      </div>
    </div>
  );
}
