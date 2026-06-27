"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { Difficulty } from "@/lib/ai/validators";
import { useAuth } from "@/lib/auth-context";
import { CONCEPT_LABEL, type ConceptTag } from "@/lib/learning/concepts";
import { ACHIEVEMENTS, getUnlockedIds, type AchievementDef } from "@/lib/achievements/catalog";
import { getCelebrated, setCelebrated } from "@/lib/achievements/celebrated";
import BadgeCeremony from "@/components/achievements/BadgeCeremony";
import {
  CLIMATES,
  climateForFloor,
  climateIndexForFloor,
  type Climate,
} from "@/lib/tower/climates";
import {
  getFloorLayout,
  nextUnitToUnlock,
  TOTAL_FLOORS,
  unitUnlockedFloorCap,
  type FloorLayout,
} from "@/lib/tower/floors";
import {
  bossForFloor,
  bossHp,
  MONSTER_INFO,
  monsterForConcept,
  monsterHp,
  type MonsterType,
} from "@/lib/tower/monsters";
import {
  buildFloorPlan,
  type FloorPlan,
  type PlannedRoom,
} from "@/lib/tower/challenges";
import {
  getHighestUnlockedFloor,
  getTowerProgress,
  getTowerSummary,
  isRoomCleared,
  markBossDefeated,
  markFloorCleared,
  markRoomCleared,
  setCurrentFloor,
  type TowerProgress,
} from "@/lib/tower/progress";
import { TOWER_BADGES, unlockedTowerBadgeIds } from "@/lib/tower/rewards";
import TowerEntrance from "./TowerEntrance";
import TowerRoomMap, { type StaircaseState } from "./TowerRoomMap";
import TowerBattleStage from "./TowerBattleStage";
import TowerChallengePanel from "./TowerChallengePanel";
import TowerFloorClear from "./TowerFloorClear";
import TowerStaircaseTransition from "./TowerStaircaseTransition";
import DungeonBackdrop from "./TowerScene";
import useBattle, { type RoundSpec } from "./useBattle";
import useReducedMotion from "./useReducedMotion";

type View = "entrance" | "exploring" | "battle" | "floorClear" | "climbing";

const CEREMONY_MS = 2700;
const BOSS_KINDS = ["predict", "misconception", "recall", "compare-circuits", "predict", "misconception", "recall"] as const;

export default function TowerDungeon() {
  const { profile } = useAuth();
  const reduce = useReducedMotion();

  const [progress, setProgress] = useState<TowerProgress | null>(null);
  const [floor, setFloor] = useState(1);
  const [plan, setPlan] = useState<FloorPlan | null>(null);
  const [view, setView] = useState<View>("entrance");
  const [activeRoom, setActiveRoom] = useState<PlannedRoom | null>(null);
  const [ceremony, setCeremony] = useState<AchievementDef | null>(null);

  const ceremonyQueue = useRef<AchievementDef[]>([]);
  const ceremonyPlaying = useRef(false);
  const badgesThisFloor = useRef<string[]>([]);
  const initRef = useRef(false);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach((t) => clearTimeout(t));
  }, []);

  // Load saved progress once and resume at the saved floor.
  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;
    const p = getTowerProgress();
    const start = Math.max(1, Math.min(p.currentFloor || 1, getHighestUnlockedFloor(profile, p)));
    setProgress(p);
    setFloor(start);
    setPlan(buildFloorPlan(start, profile));
  }, [profile]);

  const playNextCeremony = useCallback(function run() {
    const next = ceremonyQueue.current.shift();
    if (!next) {
      ceremonyPlaying.current = false;
      setCeremony(null);
      return;
    }
    ceremonyPlaying.current = true;
    setCeremony(next);
    timers.current.push(
      window.setTimeout(() => {
        setCeremony(null);
        timers.current.push(window.setTimeout(run, 250));
      }, CEREMONY_MS)
    );
  }, []);

  // Surface any newly earned tower badges through the shared badge ceremony.
  const celebrateTowerBadges = useCallback(() => {
    const summary = getTowerSummary();
    const unlocked = unlockedTowerBadgeIds(summary);
    const seen = getCelebrated();
    if (seen === null) {
      // Adopt the current unlocked set silently (mirrors CeremonyManager seeding).
      setCelebrated(getUnlockedIds(profile));
      return;
    }
    const newly = unlocked.filter((id) => !seen.includes(id));
    if (newly.length === 0) return;
    setCelebrated([...seen, ...newly]);
    badgesThisFloor.current.push(
      ...newly.map((id) => TOWER_BADGES.find((b) => b.id === id)?.title).filter((t): t is string => !!t)
    );
    if (reduce) return; // honor reduced motion: skip the animation, but mark celebrated
    const defs = newly
      .map((id) => ACHIEVEMENTS.find((d) => d.id === id))
      .filter((d): d is AchievementDef => !!d);
    ceremonyQueue.current.push(...defs);
    if (!ceremonyPlaying.current) playNextCeremony();
  }, [profile, reduce, playNextCeremony]);

  const enterFloor = useCallback(
    (n: number) => {
      const target = Math.max(1, Math.min(n, TOTAL_FLOORS));
      badgesThisFloor.current = [];
      setProgress(setCurrentFloor(target));
      setFloor(target);
      setPlan(buildFloorPlan(target, profile));
      setActiveRoom(null);
      setView("exploring");
    },
    [profile]
  );

  if (!progress || !plan) {
    return (
      <div className="flex flex-1 items-center justify-center bg-[#0b0a1f]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-white/20 border-t-violet-400" />
      </div>
    );
  }

  const layout = getFloorLayout(floor);
  const climate = climateForFloor(floor);
  const cleared = new Set(progress.clearedRooms[floor] ?? []);
  const allRoomsCleared = layout.battleRooms.every((r) => cleared.has(r.id));
  const cap = unitUnlockedFloorCap(profile);
  const isFinal = floor === TOTAL_FLOORS;
  const canClimb = !isFinal && floor + 1 <= cap;
  const climateChanging = !isFinal && climateIndexForFloor(floor + 1) !== climateIndexForFloor(floor);
  const nextClimate: Climate | undefined = isFinal ? undefined : CLIMATES[climateIndexForFloor(floor + 1)];
  const blockedUnit = !canClimb && !isFinal ? nextUnitToUnlock(floor)?.title ?? null : null;

  const staircaseState: StaircaseState = !allRoomsCleared ? "locked" : isFinal ? "final" : "ready";

  function onRoomCleared(room: PlannedRoom) {
    markRoomCleared(floor, room.slot.id);
    if (room.slot.role === "boss") markBossDefeated(floor);
    let np = getTowerProgress();
    const done = layout.battleRooms.every((r) => isRoomCleared(np, floor, r.id));
    if (done) np = markFloorCleared(floor);
    setProgress(np);
    celebrateTowerBadges();
    setActiveRoom(null);
    setView("exploring");
  }

  function startClimb() {
    if (isFinal) {
      setView("floorClear");
      return;
    }
    setView("floorClear");
  }

  function continueFromClear() {
    if (isFinal || !canClimb) {
      setView("exploring");
      return;
    }
    setCurrentFloor(floor + 1);
    setView("climbing");
  }

  const conceptsStrengthened = distinctLabels(plan, floor);

  return (
    <div className="relative isolate flex flex-1 flex-col overflow-hidden">
      {view === "entrance" ? (
        <TowerEntrance
          climate={climate}
          floor={floor}
          resuming={progress.highestClearedFloor > 0 || floor > 1}
          onEnter={() => setView("exploring")}
        />
      ) : (
        <>
          <DungeonBackdrop climate={climate} reduce={reduce} />

          <main className="relative z-10 mx-auto w-full max-w-[1100px] flex-1 px-4 py-6 pb-28 sm:px-6 lg:px-8">
            <FloorHeader
              floor={floor}
              climate={climate}
              highestCleared={progress.highestClearedFloor}
              cap={cap}
            />

            {view === "exploring" && (
              <div className="mt-5">
                <TowerRoomMap
                  layout={layout}
                  plan={plan}
                  climate={climate}
                  cleared={cleared}
                  onEnterRoom={(slot, assignment) => {
                    const found = plan.rooms.find((r) => r.slot.id === slot.id);
                    setActiveRoom(found ?? { slot, assignment });
                    setView("battle");
                  }}
                  staircase={staircaseState}
                  canClimb={canClimb}
                  blockedReason={blockedUnit ? `Complete ${blockedUnit} to climb` : undefined}
                  nextFloor={Math.min(floor + 1, TOTAL_FLOORS)}
                  onClimb={startClimb}
                />
              </div>
            )}

            {view === "battle" && activeRoom && (
              <BattleView
                key={`${floor}-${activeRoom.slot.id}`}
                floor={floor}
                layout={layout}
                plan={plan}
                room={activeRoom}
                climate={climate}
                onCleared={() => onRoomCleared(activeRoom)}
                onExit={() => {
                  setActiveRoom(null);
                  setView("exploring");
                }}
              />
            )}

            {view === "floorClear" && (
              <div className="mt-8">
                <TowerFloorClear
                  floor={floor}
                  isFinal={isFinal}
                  isBoss={layout.isBoss}
                  bossName={layout.boss?.name}
                  relicLine={layout.boss?.relicLine}
                  conceptsStrengthened={conceptsStrengthened}
                  nextFloor={Math.min(floor + 1, TOTAL_FLOORS)}
                  nextClimateName={nextClimate?.name}
                  climateChanging={climateChanging}
                  canClimb={canClimb}
                  blockedUnitTitle={blockedUnit}
                  earnedBadgeTitles={badgesThisFloor.current}
                  climate={climate}
                  onContinue={continueFromClear}
                  onBackToMap={() => setView("exploring")}
                />
              </div>
            )}
          </main>

          {view === "climbing" && (
            <TowerStaircaseTransition
              climate={nextClimate ?? climate}
              toFloor={Math.min(floor + 1, TOTAL_FLOORS)}
              isFinal={isFinal}
              onDone={() => enterFloor(floor + 1)}
            />
          )}
        </>
      )}

      {ceremony && <BadgeCeremony def={ceremony} />}
    </div>
  );
}

/* ------------------------------ Battle view ------------------------------ */

function buildRounds(room: PlannedRoom, plan: FloorPlan, floor: number): { rounds: RoundSpec[]; maxHp: number; boss: boolean; monsterType: MonsterType; monsterName: string; monsterTagline: string } {
  if (room.slot.role === "boss") {
    const boss = bossForFloor(floor);
    const hp = bossHp(floor);
    const concepts = (plan.bossConcepts.length ? plan.bossConcepts : boss?.concepts ?? ["qubits"]) as ConceptTag[];
    const diff: Difficulty = floor <= 20 ? "medium" : "hard";
    const rounds: RoundSpec[] = Array.from({ length: hp }, (_, i) => {
      const concept = concepts[i % concepts.length];
      return {
        concept,
        conceptLabel: CONCEPT_LABEL[concept],
        kind: BOSS_KINDS[i % BOSS_KINDS.length],
        difficulty: diff,
      };
    });
    return {
      rounds,
      maxHp: hp,
      boss: true,
      monsterType: (boss?.type ?? "concept-wraith") as MonsterType,
      monsterName: boss?.name ?? "Boss",
      monsterTagline: boss?.tagline ?? "",
    };
  }

  const a = room.assignment;
  const hp = monsterHp(floor);
  const rounds: RoundSpec[] = Array.from({ length: hp }, () => ({
    concept: a.concept,
    conceptLabel: a.conceptLabel,
    kind: a.kind,
    difficulty: a.difficulty,
  }));
  const monsterType = monsterForConcept(a.concept);
  return {
    rounds,
    maxHp: hp,
    boss: false,
    monsterType,
    monsterName: MONSTER_INFO[monsterType].name,
    monsterTagline: MONSTER_INFO[monsterType].tagline,
  };
}

function BattleView({
  floor,
  layout,
  plan,
  room,
  climate,
  onCleared,
  onExit,
}: {
  floor: number;
  layout: FloorLayout;
  plan: FloorPlan;
  room: PlannedRoom;
  climate: Climate;
  onCleared: () => void;
  onExit: () => void;
}) {
  const { rounds, maxHp, boss, monsterType, monsterName, monsterTagline } = buildRounds(room, plan, floor);
  const api = useBattle({ floor, boss, maxHp, rounds, onCleared });
  const accent = climate.palette.accent;
  void layout;

  return (
    <div className="mt-5">
      <button
        type="button"
        onClick={onExit}
        className="mb-3 inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-black/30 px-3 py-1.5 text-sm font-medium text-white/85 backdrop-blur-sm transition-colors hover:bg-black/45"
      >
        <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
          <path d="M12 5 L7 10 L12 15" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Back to rooms
      </button>

      <TowerBattleStage
        monsterType={monsterType}
        monsterName={monsterName}
        monsterTagline={monsterTagline}
        boss={boss}
        accent={accent}
        hp={api.hp}
        maxHp={api.maxHp}
        monsterState={api.monsterState}
        wizardState={api.wizardState}
        round={boss ? api.round : undefined}
        conceptLabel={api.challenge ? CONCEPT_LABEL[api.challenge.concept] : room.assignment.conceptLabel}
        kindLabel={room.assignment.reasonText}
      />

      <TowerChallengePanel api={api} accent={accent} />
    </div>
  );
}

/* -------------------------------- Header --------------------------------- */

function FloorHeader({
  floor,
  climate,
  highestCleared,
  cap,
}: {
  floor: number;
  climate: Climate;
  highestCleared: number;
  cap: number;
}) {
  return (
    <header className="relative z-10 flex flex-wrap items-center justify-between gap-3">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ color: climate.palette.inkSoft }}>
          Floor {floor} of {TOTAL_FLOORS} · {climate.name}
        </p>
        <h1 className="mt-0.5 text-2xl font-bold text-white">{climate.subtitle}</h1>
        <p className="mt-1 text-xs text-white/60">
          Highest cleared: Floor {highestCleared} · Unlocked through Floor {cap}
        </p>
      </div>
      <Link
        href="/dashboard"
        className="shrink-0 rounded-lg border border-white/20 bg-black/30 px-3 py-1.5 text-sm font-medium text-white/85 backdrop-blur-sm transition-colors hover:bg-black/45"
      >
        Back to course
      </Link>
    </header>
  );
}

function distinctLabels(plan: FloorPlan, floor: number): string[] {
  const set = new Set<string>();
  for (const r of plan.rooms) set.add(r.assignment.conceptLabel);
  const boss = bossForFloor(floor);
  if (boss) for (const c of boss.concepts) set.add(CONCEPT_LABEL[c]);
  return Array.from(set).slice(0, 6);
}
