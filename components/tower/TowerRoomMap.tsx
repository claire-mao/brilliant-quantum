"use client";

import type { Climate } from "@/lib/tower/climates";
import type { FloorLayout, RoomSlot } from "@/lib/tower/floors";
import { KIND_LABEL, ROOM_LABEL } from "@/lib/tower/floors";
import type { FloorPlan, RoomAssignment } from "@/lib/tower/challenges";

export type StaircaseState = "locked" | "ready" | "unit-locked" | "final";

/**
 * The per-floor room map. Shows the floor's rooms as point-and-click cards with
 * their concept tag, challenge type, a short reason, and status. The staircase
 * (or tower break) becomes available once the required rooms are cleared.
 */
export default function TowerRoomMap({
  layout,
  plan,
  climate,
  cleared,
  onEnterRoom,
  staircase,
  canClimb = true,
  blockedReason,
  nextFloor,
  onClimb,
}: {
  layout: FloorLayout;
  plan: FloorPlan;
  climate: Climate;
  cleared: Set<string>;
  onEnterRoom: (slot: RoomSlot, assignment: RoomAssignment) => void;
  staircase: StaircaseState;
  canClimb?: boolean;
  blockedReason?: string;
  nextFloor: number;
  onClimb: () => void;
}) {
  const accent = climate.palette.accent;
  const firstUncleared = plan.rooms.find((r) => !cleared.has(r.slot.id) && !roomLocked(r.slot, layout, cleared));

  return (
    <div className="relative z-10">
      <ul className="grid gap-3 sm:grid-cols-3">
        {plan.rooms.map(({ slot, assignment }) => {
          const isCleared = cleared.has(slot.id);
          const locked = roomLocked(slot, layout, cleared);
          const isCurrent = !isCleared && !locked && firstUncleared?.slot.id === slot.id;
          const isBoss = slot.role === "boss";
          return (
            <li key={slot.id} className={isBoss ? "sm:col-span-3" : ""}>
              <RoomCard
                slot={slot}
                assignment={assignment}
                accent={accent}
                cleared={isCleared}
                locked={locked}
                current={isCurrent}
                boss={isBoss}
                bossName={layout.boss?.name}
                onClick={() => onEnterRoom(slot, assignment)}
              />
            </li>
          );
        })}
      </ul>

      <div className="mt-4">
        <StaircaseCard
          state={staircase}
          accent={accent}
          canClimb={canClimb}
          nextFloor={nextFloor}
          climateName={climate.name}
          blockedReason={blockedReason}
          onClimb={onClimb}
        />
      </div>
    </div>
  );
}

/** Boss gates need their warm-up rooms cleared first; other rooms are free to explore. */
function roomLocked(slot: RoomSlot, layout: FloorLayout, cleared: Set<string>): boolean {
  if (slot.role !== "boss") return false;
  return layout.battleRooms.filter((r) => r.role === "warmup").some((r) => !cleared.has(r.id));
}

function RoomCard({
  slot,
  assignment,
  accent,
  cleared,
  locked,
  current,
  boss,
  bossName,
  onClick,
}: {
  slot: RoomSlot;
  assignment: RoomAssignment;
  accent: string;
  cleared: boolean;
  locked: boolean;
  current: boolean;
  boss: boolean;
  bossName?: string;
  onClick: () => void;
}) {
  const title = boss ? `Boss Gate · ${bossName ?? "Boss"}` : ROOM_LABEL[slot.roomType];
  const status = cleared ? "Cleared" : locked ? "Locked" : current ? "Enter" : "Open";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={locked || cleared}
      aria-label={`${title}. ${KIND_LABEL[assignment.kind]}. ${assignment.reasonText}. ${status}.`}
      className={`group relative flex h-full w-full flex-col gap-2 rounded-2xl border p-4 text-left backdrop-blur-sm transition-all disabled:cursor-default ${
        cleared
          ? "border-emerald-400/40 bg-emerald-500/10"
          : locked
            ? "border-white/10 bg-black/30 opacity-60"
            : "border-white/15 bg-black/35 hover:-translate-y-0.5 hover:bg-black/45"
      } ${current ? "tower-room-current" : ""} ${boss ? "tower-room-boss px-5 py-5" : ""}`}
      style={current && !cleared ? { borderColor: accent, boxShadow: `0 0 16px ${accent}55` } : undefined}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-2">
          <RoomGlyph slot={slot} boss={boss} accent={accent} cleared={cleared} />
          <span className="text-sm font-bold text-white">{title}</span>
        </span>
        <StatusPill cleared={cleared} locked={locked} current={current} accent={accent} />
      </div>

      <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: accent }}>
        {KIND_LABEL[assignment.kind]}
      </p>

      <div className="flex flex-wrap items-center gap-1.5">
        <span className="rounded-full border border-white/15 bg-white/5 px-2 py-0.5 text-[11px] font-medium text-white/90">
          {assignment.conceptLabel}
        </span>
        <span className="text-[11px] text-white/60">{assignment.reasonText}</span>
      </div>
    </button>
  );
}

function StatusPill({
  cleared,
  locked,
  current,
  accent,
}: {
  cleared: boolean;
  locked: boolean;
  current: boolean;
  accent: string;
}) {
  if (cleared) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[11px] font-semibold text-emerald-200">
        <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
          <path d="M3 8.5 L6.5 12 L13 4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Cleared
      </span>
    );
  }
  if (locked) {
    return <span className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] font-medium text-white/50">Locked</span>;
  }
  return (
    <span
      className="rounded-full px-2 py-0.5 text-[11px] font-semibold"
      style={{ backgroundColor: `${accent}22`, color: accent }}
    >
      {current ? "Enter" : "Open"}
    </span>
  );
}

function RoomGlyph({ slot, boss, accent, cleared }: { slot: RoomSlot; boss: boolean; accent: string; cleared: boolean }) {
  const color = cleared ? "#34d399" : accent;
  return (
    <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg" style={{ backgroundColor: `${color}1f` }}>
      <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke={color} strokeWidth={1.6} aria-hidden="true">
        {boss ? (
          <path d="M3 14 L4 6 L7 10 L10 4 L13 10 L16 6 L17 14 Z" strokeLinejoin="round" />
        ) : slot.roomType === "memory-chamber" ? (
          <path d="M10 3 a5 5 0 1 0 0.01 0 M10 7 v6 M7 10 h6" strokeLinecap="round" />
        ) : slot.roomType === "circuit-forge" ? (
          <path d="M3 10 h4 M13 10 h4 M7 7 h6 v6 h-6 z" strokeLinecap="round" strokeLinejoin="round" />
        ) : slot.roomType === "reflection-shrine" ? (
          <path d="M10 3 L12 8 L17 8 L13 11 L15 16 L10 13 L5 16 L7 11 L3 8 L8 8 Z" strokeLinejoin="round" />
        ) : (
          <path d="M10 3 v9 M10 15 v0.01 M4 16 h12 L10 4 Z" strokeLinecap="round" strokeLinejoin="round" />
        )}
      </svg>
    </span>
  );
}

function StaircaseCard({
  state,
  accent,
  canClimb,
  nextFloor,
  climateName,
  blockedReason,
  onClimb,
}: {
  state: StaircaseState;
  accent: string;
  canClimb: boolean;
  nextFloor: number;
  climateName: string;
  blockedReason?: string;
  onClimb: () => void;
}) {
  if (state === "locked") {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-dashed border-white/15 bg-black/25 px-4 py-3 text-sm text-white/60">
        <StairGlyph dim />
        Clear the floor&apos;s rooms to reveal the staircase.
      </div>
    );
  }

  const final = state === "final";
  const title = final ? "Break open the tower" : canClimb ? `Climb to Floor ${nextFloor}` : "Floor cleared";
  const subtitle = final
    ? "Awaken the Quantum Relic"
    : canClimb
      ? `Continue into ${climateName}`
      : blockedReason ?? "Review your ascent";

  return (
    <button
      type="button"
      onClick={onClimb}
      className="tower-stair-ready flex w-full items-center justify-between gap-3 rounded-2xl border px-5 py-4 text-left font-semibold text-white transition-transform hover:-translate-y-0.5"
      style={{ borderColor: accent, backgroundColor: `${accent}1f`, boxShadow: `0 0 18px ${accent}55` }}
    >
      <span className="flex items-center gap-3">
        <StairGlyph accent={accent} />
        <span>
          <span className="block text-base">{title}</span>
          <span className="block text-xs font-normal text-white/70">{subtitle}</span>
        </span>
      </span>
      <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2.2} aria-hidden="true">
        <path d="M10 16 V5 M5 9 L10 4 L15 9" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}

function StairGlyph({ accent = "#94a3b8", dim = false }: { accent?: string; dim?: boolean }) {
  return (
    <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg" style={{ backgroundColor: dim ? "#ffffff14" : `${accent}22` }}>
      <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" stroke={dim ? "#94a3b8" : accent} strokeWidth={1.7} aria-hidden="true">
        <path d="M3 17 h4 v-4 h4 v-4 h4 v-4 h2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}
