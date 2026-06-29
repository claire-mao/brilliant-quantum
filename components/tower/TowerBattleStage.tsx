"use client";

import WizardCompanion from "@/components/WizardCompanion";
import TowerMonster, { DefeatSparkles, type MonsterState } from "./TowerMonster";
import type { MonsterType } from "@/lib/tower/monsters";

export type WizardBattleState = "ready" | "cast" | "hurt" | "win";

/**
 * The battle stage: the Guide Wizard faces a quantum monster across HP and
 * focus bars. Correct answers cast a light attack (monster flashes + recoils);
 * wrong answers let the monster lunge while the wizard blocks. All SVG/CSS.
 */
export default function TowerBattleStage({
  monsterType,
  monsterName,
  monsterTagline,
  boss,
  accent,
  hp,
  maxHp,
  monsterState,
  wizardState,
  round,
  conceptLabel,
  kindLabel,
}: {
  monsterType: MonsterType;
  monsterName: string;
  monsterTagline: string;
  boss: boolean;
  accent: string;
  hp: number;
  maxHp: number;
  monsterState: MonsterState;
  wizardState: WizardBattleState;
  round?: { current: number; total: number };
  conceptLabel: string;
  kindLabel: string;
}) {
  const defeated = monsterState === "defeated" || hp <= 0;
  const damage = maxHp - hp;

  return (
    <section className="relative z-10 overflow-hidden rounded-2xl border border-white/15 bg-black/30 p-4 backdrop-blur-sm sm:p-6">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: accent }}>
          {boss ? "Boss battle" : "Battle"} · {conceptLabel}
        </span>
        <span className="text-[11px] font-medium text-white/60">
          {round ? `Round ${round.current} / ${round.total}` : kindLabel}
        </span>
      </div>

      <div className="mt-3 flex items-end justify-between gap-3 sm:gap-6">
        {/* Wizard */}
        <div className="flex flex-col items-center gap-2 text-center">
          <span className={wizardStateClass(wizardState)}>
            <WizardCompanion
              mood={wizardState === "win" ? "happy" : "still"}
              wandMode={wizardState === "win" ? "celebrate" : "beam"}
              wandAim={30}
              className="h-20 w-20 sm:h-24 sm:w-24"
              floppy={false}
            />
            {wizardState === "hurt" && <span className="tower-wizard-shield pointer-events-none absolute inset-0" aria-hidden="true" />}
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-wide text-white/80">Guide Wizard</span>
          <Bar value={damage} max={maxHp} label="Focus" color={accent} track="rgba(255,255,255,0.12)" />
        </div>

        {/* Spell bolt on a successful cast */}
        {wizardState === "cast" && !defeated && (
          <span className="tower-spell-bolt pointer-events-none absolute left-1/2 top-1/2 -translate-y-1/2" aria-hidden="true">
            <span className="block h-1.5 w-16 rounded-full" style={{ background: `linear-gradient(90deg, transparent, ${accent})`, boxShadow: `0 0 12px ${accent}` }} />
          </span>
        )}

        <span className="hidden self-center text-xs font-bold uppercase tracking-widest text-white/30 sm:inline">vs</span>

        {/* Monster */}
        <div className="flex flex-col items-center gap-2 text-center">
          <span className="relative">
            <TowerMonster type={monsterType} state={monsterState} boss={boss} accent={accent} />
            {defeated && <DefeatSparkles accent={accent} />}
          </span>
          <span className="text-sm font-bold text-white">{monsterName}</span>
          <span className="hidden text-[11px] text-white/60 sm:block">{monsterTagline}</span>
          <Bar value={hp} max={maxHp} label={defeated ? "Defeated" : "Stability"} color="#fb7185" track="rgba(255,255,255,0.12)" showCount />
        </div>
      </div>
    </section>
  );
}

function wizardStateClass(state: WizardBattleState): string {
  const base = "relative inline-flex";
  if (state === "cast") return `${base} tower-wizard-cast`;
  if (state === "hurt") return `${base} tower-wizard-hurt`;
  return base;
}

function Bar({
  value,
  max,
  label,
  color,
  track,
  showCount = false,
}: {
  value: number;
  max: number;
  label: string;
  color: string;
  track: string;
  showCount?: boolean;
}) {
  const pct = max > 0 ? Math.max(0, Math.min(100, Math.round((value / max) * 100))) : 0;
  return (
    <div className="w-28 sm:w-36">
      <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-wide text-white/70">
        <span>{label}</span>
        {showCount && (
          <span className="tabular-nums">
            {value}/{max}
          </span>
        )}
      </div>
      <div className="mt-1 h-2.5 w-full overflow-hidden rounded-full" style={{ backgroundColor: track }}>
        <div className="h-full rounded-full transition-[width] duration-500" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}
