"use client";

import { useState } from "react";
import type { Climate } from "@/lib/tower/climates";
import type { UserProfile } from "@/lib/types";
import {
  floorTitle,
  floorUnlockMessage,
  TOTAL_FLOORS,
  isBossFloor,
  isFloorUnlocked,
  slotsOnFloor,
} from "@/lib/tower/floor-plan";
import {
  CHAMBER_META,
  chamberTypeFor,
  isChamberCleared,
  type TowerProgress,
} from "@/lib/tower/progression";

/**
 * Tower Map: seven floors (six unit reviews + Eve boss). Unlocked floors are
 * selectable; locked floors show requirements. Footer offers reset only.
 */
export default function FloorMap({
  progress,
  currentFloor,
  profile,
  climateForFloor,
  onTravel,
  onTravelToChamber,
  onLockedFloor,
  onReset,
  onClose,
}: {
  progress: TowerProgress;
  currentFloor: number;
  profile: UserProfile | null;
  climateForFloor: (floor: number) => Climate;
  onTravel: (floor: number) => void;
  onTravelToChamber: (floor: number, chamber: number) => void;
  onLockedFloor?: (floor: number, message: string) => void;
  onReset: () => void;
  onClose: () => void;
}) {
  const [confirmReset, setConfirmReset] = useState(false);

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center sm:items-center" role="dialog" aria-modal="true" aria-label="Tower Map">
      <button type="button" aria-label="Close map" onClick={onClose} className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      <div className="relative z-10 max-h-[82vh] w-full max-w-md overflow-y-auto rounded-t-3xl border border-white/10 bg-[#0b1120] p-5 shadow-2xl sm:rounded-3xl">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-cyan-50">Tower Map</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-sm font-medium text-slate-200 hover:bg-white/10"
          >
            Close
          </button>
        </div>

        <ul className="mt-4 flex flex-col gap-2.5">
          {Array.from({ length: TOTAL_FLOORS }, (_, i) => i + 1).map((floor) => {
            const unlocked = isFloorUnlocked(floor, progress, profile);
            const lockMessage = unlocked ? "" : floorUnlockMessage(floor, profile, progress);
            const visited = floor <= progress.highestFloor;
            const isCurrent = floor === currentFloor;
            const boss = isBossFloor(floor);
            const climate = climateForFloor(floor);
            const title = floorTitle(floor);
            const slotCount = slotsOnFloor(floor, progress.bossSeed);

            return (
              <li
                key={floor}
                role={!unlocked ? "button" : undefined}
                tabIndex={!unlocked ? 0 : undefined}
                onClick={() => {
                  if (!unlocked) onLockedFloor?.(floor, lockMessage);
                }}
                onKeyDown={(e) => {
                  if (!unlocked && (e.key === "Enter" || e.key === " ")) {
                    e.preventDefault();
                    onLockedFloor?.(floor, lockMessage);
                  }
                }}
                className={`rounded-2xl border p-3 transition-colors ${
                  isCurrent
                    ? "border-cyan-300/60 bg-cyan-400/10"
                    : unlocked
                      ? "border-white/10 bg-white/5"
                      : "cursor-pointer border-white/5 bg-white/[0.02] opacity-60 hover:border-white/10"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-bold text-white">
                        Floor {floor}: {title}
                      </span>
                      {boss && (
                        <span className="rounded-full border border-rose-300/40 bg-rose-500/15 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-rose-200">
                          Boss
                        </span>
                      )}
                      {isCurrent && (
                        <span className="rounded-full border border-cyan-300/40 bg-cyan-500/15 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-cyan-200">
                          Here
                        </span>
                      )}
                    </div>
                    {!unlocked && (
                      <p className="mt-0.5 text-xs leading-snug text-slate-400">{lockMessage}</p>
                    )}
                  </div>

                  {unlocked && visited && !isCurrent ? (
                    <button
                      type="button"
                      onClick={() => onTravel(floor)}
                      className="shrink-0 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-indigo-700"
                    >
                      Travel
                    </button>
                  ) : (
                    <span className="shrink-0 text-xs text-slate-500">{unlocked ? "Open" : "Locked"}</span>
                  )}
                </div>

                <div className="mt-2.5 flex items-center gap-1.5">
                  {Array.from({ length: slotCount }).map((_, c) => {
                    const type = chamberTypeFor(floor, c);
                    const cleared = unlocked && isChamberCleared(progress, floor, c);
                    const chamberHere = floor === currentFloor && c === progress.chamber;
                    const canReplay = unlocked && cleared;
                    return (
                      <button
                        key={c}
                        type="button"
                        disabled={!canReplay && !unlocked}
                        title={
                          cleared
                            ? boss
                              ? "Boss cleared. Practice again."
                              : "Cleared. Practice again."
                            : CHAMBER_META[type].name
                        }
                        onClick={() => {
                          if (canReplay) onTravelToChamber(floor, c);
                        }}
                        className={`grid h-7 flex-1 place-items-center rounded-md border text-[9px] font-bold transition-colors ${
                          canReplay ? "cursor-pointer hover:brightness-125" : "cursor-default"
                        } ${chamberHere ? "ring-1 ring-cyan-300/60" : ""}`}
                        style={{
                          borderColor: boss ? "rgba(251,113,133,0.5)" : "rgba(255,255,255,0.12)",
                          background: cleared
                            ? `${climate.palette.accent}33`
                            : boss
                              ? "rgba(244,63,94,0.12)"
                              : "rgba(255,255,255,0.03)",
                          color: cleared ? climate.palette.accent : "rgba(226,232,240,0.7)",
                        }}
                      >
                        {cleared ? (boss ? "★" : "✓") : c + 1}
                      </button>
                    );
                  })}
                </div>
              </li>
            );
          })}
        </ul>

        <div className="mt-5 flex flex-col gap-3 border-t border-white/10 pt-4">
          {confirmReset ? (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-slate-300">Reset all tower progress and return to Floor 1?</p>
              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  onClick={() => setConfirmReset(false)}
                  className="rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={onReset}
                  className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-700"
                >
                  Reset
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmReset(true)}
              className="self-start text-xs font-medium text-rose-300/80 hover:text-rose-200 hover:underline"
            >
              Reset tower progress
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
