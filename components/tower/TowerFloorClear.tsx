"use client";

import WizardCompanion, { SparkleBurst } from "@/components/WizardCompanion";
import type { Climate } from "@/lib/tower/climates";

/**
 * Floor-cleared summary: the concepts strengthened, any newly earned tower
 * badge, the next floor (and climate if it changes), and the staircase climb —
 * or the climactic tower break on Floor 60. Fast and satisfying.
 */
export default function TowerFloorClear({
  floor,
  isFinal,
  isBoss,
  bossName,
  relicLine,
  conceptsStrengthened,
  nextFloor,
  nextClimateName,
  climateChanging,
  canClimb,
  blockedUnitTitle,
  earnedBadgeTitles,
  climate,
  onContinue,
  onBackToMap,
}: {
  floor: number;
  isFinal: boolean;
  isBoss: boolean;
  bossName?: string;
  relicLine?: string;
  conceptsStrengthened: string[];
  nextFloor: number;
  nextClimateName?: string;
  climateChanging: boolean;
  canClimb: boolean;
  blockedUnitTitle?: string | null;
  earnedBadgeTitles: string[];
  climate: Climate;
  onContinue: () => void;
  onBackToMap: () => void;
}) {
  const p = climate.palette;

  if (isFinal) {
    return (
      <div className="relative z-20 mx-auto max-w-xl rounded-3xl border border-white/15 bg-black/40 p-8 text-center backdrop-blur-md">
        <div className="relative mx-auto mb-4 flex h-24 w-24 items-center justify-center">
          <SparkleBurst />
          <span className="tower-relic block h-16 w-16 rounded-lg" style={{ background: `conic-gradient(${p.accent}, ${p.accentSoft}, ${p.accent})`, boxShadow: `0 0 40px ${p.accent}` }} />
        </div>
        <h2 className="text-2xl font-bold text-white">Tower cleared</h2>
        <p className="mt-1 text-lg font-semibold" style={{ color: p.accentSoft }}>
          Quantum Relic awakened
        </p>
        <p className="mx-auto mt-3 max-w-prose text-sm leading-6 text-white/80">
          {relicLine ?? "The Observer blinks — light escapes upward and the tower breaks open to the sky."}
        </p>
        {earnedBadgeTitles.length > 0 && <BadgeNote titles={earnedBadgeTitles} accent={p.accent} />}
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button type="button" onClick={onBackToMap} className="rounded-lg border px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/10" style={{ borderColor: p.accent }}>
            Return to the summit
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative z-20 mx-auto max-w-xl rounded-3xl border border-white/15 bg-black/40 p-6 text-center backdrop-blur-md sm:p-8">
      <div className="relative mx-auto mb-3 h-20 w-20">
        <SparkleBurst />
        <WizardCompanion mood="happy" wandMode="celebrate" wandAim={-30} className="h-20 w-20" floppy={false} />
      </div>

      <p className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: p.accentSoft }}>
        Floor {floor} cleared
      </p>
      <h2 className="mt-1 text-2xl font-bold text-white">
        {isBoss ? `${bossName ?? "Boss"} defeated` : "The way upward opens"}
      </h2>
      {isBoss && relicLine && <p className="mx-auto mt-2 max-w-prose text-sm leading-6 text-white/80">{relicLine}</p>}

      <div className="mt-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-white/60">Concepts strengthened</p>
        <div className="mt-2 flex flex-wrap justify-center gap-1.5">
          {conceptsStrengthened.map((label) => (
            <span key={label} className="rounded-full border px-2.5 py-0.5 text-xs font-medium text-white" style={{ borderColor: `${p.accent}66`, backgroundColor: `${p.accent}1f` }}>
              {label}
            </span>
          ))}
        </div>
      </div>

      {earnedBadgeTitles.length > 0 && <BadgeNote titles={earnedBadgeTitles} accent={p.accent} />}

      {canClimb ? (
        <div className="mt-5">
          {climateChanging && nextClimateName && (
            <p className="mb-2 text-sm text-white/80">
              Ahead lies <span className="font-semibold" style={{ color: p.accentSoft }}>{nextClimateName}</span>.
            </p>
          )}
          <button
            type="button"
            onClick={onContinue}
            className="tower-stair-ready inline-flex items-center gap-2 rounded-lg border px-5 py-2.5 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5"
            style={{ borderColor: p.accent, backgroundColor: `${p.accent}1f`, boxShadow: `0 0 18px ${p.accent}55` }}
          >
            Climb to Floor {nextFloor}
            <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.2} aria-hidden="true">
              <path d="M10 16 V5 M5 9 L10 4 L15 9" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      ) : (
        <div className="mt-5 rounded-xl border border-amber-300/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
          You&apos;ve reached the top of what&apos;s unlocked. Complete{" "}
          <span className="font-semibold">{blockedUnitTitle ?? "the next course unit"}</span> to ascend further.
          <div className="mt-3">
            <button type="button" onClick={onBackToMap} className="rounded-lg border border-white/20 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-white/10">
              Back to this floor
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function BadgeNote({ titles, accent }: { titles: string[]; accent: string }) {
  return (
    <div className="mt-4 rounded-xl border px-4 py-2 text-sm" style={{ borderColor: `${accent}55`, backgroundColor: `${accent}14` }}>
      <span className="font-semibold text-white">Badge earned: </span>
      <span className="text-white/85">{titles.join(", ")}</span>
    </div>
  );
}
