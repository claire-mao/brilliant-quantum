"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import RouteGuard from "@/components/RouteGuard";
import NavBar from "@/components/NavBar";
import QuantumWizardBackground from "@/components/dashboard/QuantumWizardBackground";
import MagicalStatCard from "@/components/dashboard/MagicalStatCard";
import AvatarWizard from "@/components/profile/AvatarWizard";
import AvatarBuilder from "@/components/profile/AvatarBuilder";
import LearningProfile from "@/components/profile/LearningProfile";
import DeleteAccountSection from "@/components/profile/DeleteAccountSection";
import AchievementBadge from "@/components/AchievementBadge";
import { useAuth } from "@/lib/auth-context";
import {
  getCompletedLessonCount,
  getTotalLessonCount,
  getCompletedUnitCount,
  getTotalUnitCount,
} from "@/content/lessons";
import { DEFAULT_AVATAR, loadAvatar, saveAvatar, type AvatarConfig } from "@/lib/profile/avatar";
import { getLongestStreak, recordStreakObservation } from "@/lib/profile/activity";
import {
  evaluateAchievements,
  CATEGORY_LABEL,
  SECRET_HINT,
  SECRET_TITLE,
  type AchievementCategory,
  type EvaluatedAchievement,
} from "@/lib/achievements/catalog";

const CATEGORY_ORDER: AchievementCategory[] = ["learning", "consistency", "challenge", "tower", "secrets"];

export default function ProfilePage() {
  return (
    <RouteGuard>
      <div className="relative isolate flex flex-1 flex-col bg-[radial-gradient(120%_120%_at_50%_-10%,#1e1245_0%,#0d0a24_45%,#070611_100%)] text-slate-100">
        <QuantumWizardBackground />
        <NavBar variant="dark" />
        <ProfileContent />
      </div>
    </RouteGuard>
  );
}

function ProfileContent() {
  const { user, profile } = useAuth();

  const completedLessons = getCompletedLessonCount(profile);
  const totalLessons = getTotalLessonCount();
  const completedUnits = getCompletedUnitCount(profile);
  const totalUnits = getTotalUnitCount();
  const streak = profile?.streak ?? 0;
  const displayName = profile?.displayName ?? user?.displayName ?? "Apprentice";

  const [avatar, setAvatar] = useState<AvatarConfig>(DEFAULT_AVATAR);
  const [editing, setEditing] = useState(false);
  const [longestStreak, setLongestStreak] = useState<number | null>(null);
  const [achievements, setAchievements] = useState<EvaluatedAchievement[] | null>(null);
  const [spotlight, setSpotlight] = useState<EvaluatedAchievement | null>(null);

  useEffect(() => {
    const id = window.setTimeout(() => setAvatar(loadAvatar()), 0);
    return () => clearTimeout(id);
  }, []);

  // Streak + relics read localStorage / derive from progress, so compute after mount.
  useEffect(() => {
    const id = window.setTimeout(() => {
      recordStreakObservation(streak);
      setLongestStreak(getLongestStreak(streak));
      setAchievements(evaluateAchievements(profile));
    }, 0);
    return () => clearTimeout(id);
  }, [profile, streak]);

  function updateAvatar(next: AvatarConfig) {
    setAvatar(next);
    saveAvatar(next);
  }

  return (
    <main className="relative z-10 mx-auto w-full max-w-[1100px] flex-1 px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between gap-3">
        <h1 className="font-serif text-2xl font-bold tracking-tight text-white sm:text-3xl">Wizard Profile</h1>
        <Link href="/dashboard" className="shrink-0 text-sm font-medium text-violet-300 hover:text-violet-200">
          Back to course
        </Link>
      </div>

      {/* Identity card */}
      <section className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
        <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center">
          <AvatarWizard config={avatar} className="h-28 w-28 shrink-0 sm:h-36 sm:w-36" />
          <div className="min-w-0 flex-1 text-center sm:text-left">
            <h2 className="font-serif text-2xl font-bold text-white">{displayName}</h2>
            <p className="mt-1 text-sm text-slate-400">
              {completedLessons} {completedLessons === 1 ? "lesson" : "lessons"} completed
              {streak > 0 ? ` · ${streak}-day streak` : ""}
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2 sm:justify-start">
              <button
                type="button"
                onClick={() => setEditing((e) => !e)}
                className="rounded-lg border border-violet-400/40 bg-violet-500/15 px-4 py-2 text-sm font-semibold text-violet-100 transition-colors hover:bg-violet-500/25"
              >
                {editing ? "Done customizing" : "Customize avatar"}
              </button>
            </div>
          </div>
        </div>

        {editing && (
          <div className="mt-6 border-t border-white/10 pt-6">
            <AvatarBuilder value={avatar} onChange={updateAvatar} />
          </div>
        )}
      </section>

      {/* Progress stats */}
      <section className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MagicalStatCard label="Lessons" value={`${completedLessons}/${totalLessons}`} hint="completed" />
        <MagicalStatCard label="Units" value={`${completedUnits}/${totalUnits}`} hint="completed" />
        <MagicalStatCard label="Current streak" value={`${streak}`} hint={streak === 1 ? "day" : "days"} />
        <MagicalStatCard label="Longest streak" value={`${longestStreak ?? streak}`} hint="days" />
      </section>

      <LearningProfile profile={profile} />

      {/* Relics (integrated, compact, self-contained) */}
      <section className="mt-8">
        <h3 className="font-serif text-xl font-bold text-white">Relics</h3>

        {achievements === null ? (
          <p className="mt-3 text-sm text-slate-500">Reading your grimoire…</p>
        ) : (
          <div className="mt-4 flex flex-col gap-6">
            {CATEGORY_ORDER.map((category) => {
              const items = achievements.filter((a) => a.def.category === category);
              if (items.length === 0) return null;
              return (
                <div key={category}>
                  <h4 className="text-xs font-semibold uppercase tracking-widest text-violet-200/80">
                    {CATEGORY_LABEL[category]}
                  </h4>
                  <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {items.map((a) => (
                      <ProfileAchievementTile key={a.def.id} item={a} onSelect={setSpotlight} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <DeleteAccountSection />

      {spotlight && <BadgeSpotlight item={spotlight} onClose={() => setSpotlight(null)} />}
    </main>
  );
}

function ProfileAchievementTile({
  item,
  onSelect,
}: {
  item: EvaluatedAchievement;
  onSelect: (item: EvaluatedAchievement) => void;
}) {
  const hideSecret = item.def.secret && !item.unlocked;
  const title = hideSecret ? SECRET_TITLE : item.def.title;
  const icon = hideSecret ? "rune" : item.def.icon;
  const status = item.unlocked ? "Unlocked" : hideSecret ? "Locked" : item.progressLabel;

  return (
    <button
      type="button"
      onClick={() => onSelect(item)}
      className={`group relative flex w-full items-center gap-3 rounded-xl border p-3 text-left outline-none transition-colors hover:border-violet-400/50 focus-visible:ring-2 focus-visible:ring-violet-400 ${
        item.unlocked ? "border-violet-400/30 bg-white/5" : "border-white/10 bg-white/[0.03]"
      }`}
    >
      <AchievementBadge unlocked={item.unlocked} type={item.def.type} icon={icon} className="h-10 w-10 shrink-0" />
      <div className="min-w-0">
        <p className={`truncate text-sm font-semibold ${item.unlocked ? "text-white" : "text-slate-300"}`}>{title}</p>
        <p className={`truncate text-xs ${item.unlocked ? "text-violet-300" : "text-slate-500"}`}>{status}</p>
      </div>
    </button>
  );
}

/** Click a relic to bring it into the spotlight (frameless) with the way to earn it as a subtitle. */
function BadgeSpotlight({
  item,
  onClose,
}: {
  item: EvaluatedAchievement;
  onClose: () => void;
}) {
  const hideSecret = item.def.secret && !item.unlocked;
  const title = hideSecret ? SECRET_TITLE : item.def.title;
  const icon = hideSecret ? "rune" : item.def.icon;
  const hint = hideSecret ? SECRET_HINT : item.def.earnHint;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${title} relic`}
      onClick={onClose}
      className="fixed inset-0 z-[90] flex items-center justify-center p-6"
    >
      <div className="badge-spotlight-backdrop absolute inset-0 bg-slate-950/85 backdrop-blur-sm" />

      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute right-4 top-4 z-20 rounded-full p-2 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
      >
        <svg viewBox="0 0 20 20" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M5 5l10 10M15 5L5 15" strokeLinecap="round" />
        </svg>
      </button>

      <div
        onClick={(e) => e.stopPropagation()}
        className="badge-spotlight-card relative z-10 flex flex-col items-center text-center"
      >
        <span className="relative block h-[min(30rem,82vw,72vh)] w-[min(30rem,82vw,72vh)]">
          <span
            className="badge-spotlight-glow absolute -inset-[6%] rounded-full"
            style={{ background: "radial-gradient(circle, rgba(167,139,250,0.5), transparent 70%)" }}
          />
          <AchievementBadge unlocked={item.unlocked} type={item.def.type} icon={icon} className="relative h-full w-full" />
        </span>

        <h3 className="mt-3 font-serif text-3xl font-bold text-white sm:text-4xl">{title}</h3>
        <p className="mt-2 max-w-sm text-base leading-7 text-slate-300">{hint}</p>
      </div>
    </div>
  );
}
