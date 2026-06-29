"use client";

import { useEffect, useRef, useState } from "react";
import { climateSceneTokens, type Climate } from "@/lib/tower/climates";
import { floorTitle } from "@/lib/tower/floor-plan";
import { Alice, Bob } from "./heroes";
import { EveBoss } from "./dungeon-monsters";

/** Fire `onDone` exactly once after `ms`, immune to parent re-renders. */
function useCompletion(ms: number, onDone: () => void) {
  const cb = useRef(onDone);
  useEffect(() => {
    cb.current = onDone;
  }, [onDone]);
  useEffect(() => {
    const t = window.setTimeout(() => cb.current(), ms);
    return () => window.clearTimeout(t);
  }, [ms]);
}

/**
 * Between-floor and leave-the-tower cinematics. Both are pure CSS/SVG overlays
 * and both honor prefers-reduced-motion: when motion is reduced they collapse to
 * a quick fade and fire their completion callback almost immediately.
 */

/** A short ascending staircase drawn as stacked pixel steps. */
function Staircase({ accent }: { accent: string }) {
  const steps = [0, 1, 2, 3, 4, 5];
  return (
    <svg viewBox="0 0 160 120" className="h-40 w-52" shapeRendering="crispEdges" aria-hidden="true">
      {steps.map((s) => {
        const w = 150 - s * 18;
        const x = 6 + s * 9;
        const y = 104 - s * 17;
        return (
          <g key={s}>
            <rect x={x} y={y} width={w} height="17" fill={s % 2 === 0 ? "#243044" : "#2b394f"} />
            <rect x={x} y={y} width={w} height="3" fill="#33425b" />
            <rect x={x} y={y} width={w} height="1.5" fill={accent} opacity={0.18 + s * 0.06} className="dungeon-rune" />
          </g>
        );
      })}
      <rect x="64" y="0" width="34" height="22" fill={accent} opacity="0.35" className="dungeon-rune" />
      <rect x="70" y="0" width="22" height="22" fill="#fff" opacity="0.18" />
    </svg>
  );
}

export function ClimbTransition({
  toFloor,
  climate,
  reduce,
  onDone,
}: {
  toFloor: number;
  climate: Climate;
  reduce: boolean;
  onDone: () => void;
}) {
  useCompletion(reduce ? 420 : 2600, onDone);
  const scene = climateSceneTokens(climate);

  return (
    <div
      className="tower-climb-overlay fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden"
      style={{ background: `linear-gradient(180deg, ${scene.wallTop} 0%, ${scene.wallBottom} 100%)` }}
      role="status"
      aria-live="polite"
    >
      <span className="sr-only">
        Climbing to floor {toFloor}: {floorTitle(toFloor)}
      </span>

      <div
        className="tower-climb-bg pointer-events-none absolute inset-x-0 top-0 h-1/2"
        style={{ background: `radial-gradient(80% 80% at 50% 0%, ${scene.accent}33, transparent)` }}
      />

      <p
        className={`relative mb-6 text-lg font-semibold text-white drop-shadow-md ${reduce ? "" : "tower-climb-rise"}`}
      >
        Floor {toFloor}: {floorTitle(toFloor)}
      </p>

      <div className={`relative ${reduce ? "" : "tower-climb-stairs-enter"}`}>
        <Staircase accent={scene.accent} />
        <div
          className={`absolute bottom-2 left-6 flex items-end gap-1 ${reduce ? "tower-climb-heroes-static" : "tower-climb-heroes-walk"}`}
        >
          <Alice state={reduce ? "idle" : "walk"} wandGlow={scene.accent} reduce={reduce} className="h-16 w-auto" />
          <Bob state={reduce ? "idle" : "walk"} reduce={reduce} className="h-12 w-auto" />
        </div>
      </div>

      {!reduce && (
        <div className="pointer-events-none absolute inset-0">
          {[18, 38, 60, 78].map((left, i) => (
            <span
              key={i}
              className="dungeon-dust absolute h-1 w-1 rounded-full"
              style={{ left: `${left}%`, top: `${30 + (i % 3) * 16}%`, background: scene.particle, animationDelay: `${i * 0.4}s` }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function LeaveTransition({
  reduce,
  onDone,
}: {
  reduce: boolean;
  onDone: () => void;
}) {
  useCompletion(reduce ? 200 : 1500, onDone);

  return (
    <div
      className="tower-leave-overlay fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden bg-[#04060c]"
      role="status"
      aria-live="polite"
    >
      <div className={`relative ${reduce ? "" : "tower-leave-gate"}`}>
        <svg viewBox="0 0 240 260" className="h-72 w-72 sm:h-80 sm:w-80" shapeRendering="crispEdges" aria-hidden="true">
          <defs>
            <radialGradient id="leave-light" cx="50%" cy="42%" r="58%">
              <stop offset="0%" stopColor="#fde68a" />
              <stop offset="40%" stopColor="#67e8f9" />
              <stop offset="100%" stopColor="#0c1430" />
            </radialGradient>
          </defs>
          <path d="M40 260 L40 100 Q120 20 200 100 L200 260 Z" fill="url(#leave-light)" />
          <path d="M40 100 Q120 20 200 100" fill="none" stroke="#a5f3fc" strokeWidth="4" opacity="0.85" />
          <rect x="108" y="118" width="24" height="36" fill="#fde68a" opacity="0.35" className="tower-leave-portal-glow" />
        </svg>
      </div>

      <div className={`relative -mt-14 flex items-end gap-2 ${reduce ? "" : "tower-hero-exit"}`}>
        <Alice state={reduce ? "idle" : "walk"} reduce={reduce} className="h-28 w-auto sm:h-32" />
        <Bob state={reduce ? "idle" : "walk"} reduce={reduce} className="h-20 w-auto sm:h-24" />
      </div>

      <p className="relative mt-6 text-sm font-semibold uppercase tracking-[0.25em] text-cyan-200">Leaving tower</p>
    </div>
  );
}

/** Full-screen defeat sequence when wizard energy reaches zero. */
export function GameOverTransition({
  reduce,
  onTryAgain,
  onDashboard,
}: {
  reduce: boolean;
  onTryAgain: () => void;
  onDashboard: () => void;
}) {
  const [beat, setBeat] = useState(0);

  useEffect(() => {
    if (reduce) return;
    const timers = [0, 700, 1400, 2100].map((ms, i) => window.setTimeout(() => setBeat(i + 1), ms));
    return () => timers.forEach(clearTimeout);
  }, [reduce]);

  const showActions = reduce || beat >= 3;

  return (
    <div
      className="tower-gameover-overlay fixed inset-0 z-[60] flex flex-col items-center justify-end overflow-hidden pb-16"
      role="dialog"
      aria-modal="true"
      aria-label="Game over"
    >
      {/* Background layers — darken for mood, but stay behind readable content */}
      <div className="pointer-events-none absolute inset-0 bg-[#121820]" aria-hidden="true" />
      <div
        className={`pointer-events-none absolute inset-0 transition-opacity duration-1000 ${beat >= 1 ? "opacity-100" : "opacity-70"}`}
        style={{ background: "radial-gradient(70% 50% at 50% 35%, rgba(51,65,85,0.55), transparent 72%)" }}
        aria-hidden="true"
      />
      <div
        className={`tower-gameover-bg-darken pointer-events-none absolute inset-0 bg-[#070a10] ${beat >= 4 ? "opacity-55" : "opacity-0"}`}
        aria-hidden="true"
      />

      <div className="relative z-10 flex w-full max-w-lg flex-col items-center px-6 text-center">
        <div className={`relative mb-6 flex items-end justify-center gap-3 ${reduce ? "" : "tower-gameover-heroes"}`}>
          <Alice state={reduce ? "idle" : "kneel"} reduce={reduce} className="h-28 w-auto sm:h-32" />
          <Bob state={reduce ? "idle" : "defeated"} reduce={reduce} className="h-20 w-auto sm:h-24" />
        </div>

        {beat >= 2 && (
          <div className={`pointer-events-none absolute -top-8 right-8 opacity-50 ${reduce ? "" : "tower-gameover-eve"}`} aria-hidden="true">
            <EveBoss defeated={false} enraged={false} glitch={false} className="h-24 w-auto" />
          </div>
        )}

        <div className="tower-gameover-panel w-full rounded-2xl border border-slate-600/40 bg-slate-900/75 px-6 py-7 shadow-[0_12px_40px_rgba(0,0,0,0.45)] backdrop-blur-sm">
          <h2 className="text-2xl font-bold text-white drop-shadow-md sm:text-3xl">The Tower does not fall in a single climb</h2>

          <div className="mt-4 space-y-2 text-sm leading-relaxed text-amber-200">
            {(reduce || beat >= 1) && (
              <>
                <p>Alice steadies herself.</p>
                <p>Bob gathers the scattered pages of the spellbook.</p>
              </>
            )}
            {(reduce || beat >= 2) && (
              <>
                <p>Together, they step back through the old gate.</p>
                <p>High above, a figure lingers at the window before disappearing into the shadows.</p>
              </>
            )}
            {(reduce || beat >= 3) && (
              <>
                <p>The Tower still stands.</p>
                <p>It will be waiting when they return.</p>
              </>
            )}
          </div>

          {showActions && (
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={onTryAgain}
                className="rounded-lg bg-indigo-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-colors hover:bg-indigo-400"
              >
                Try Again
              </button>
              <button
                type="button"
                onClick={onDashboard}
                className="rounded-lg border border-slate-400/60 bg-slate-800/90 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-700"
              >
                Return to Dashboard
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/** Full-tower victory after Eve is defeated on Floor 7. */
export function BossBreakthroughTransition({
  reduce,
  onDone,
}: {
  reduce: boolean;
  onDone: () => void;
}) {
  useCompletion(reduce ? 400 : 2800, onDone);

  return (
    <div
      className="tower-climb-overlay fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden bg-[#0a0514]"
      role="status"
      aria-live="polite"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_60%_at_50%_40%,rgba(251,113,133,0.25),transparent)]" />
      <p className="relative text-xs font-semibold uppercase tracking-[0.35em] text-rose-200">Breakthrough</p>
      <h2 className="relative mt-2 text-3xl font-bold text-white drop-shadow">Eve, the Observer, defeated</h2>
      <p className="relative mt-2 max-w-sm text-center text-sm text-slate-300">
        You cleared all seven floors. Mixed retrieval from every unit, mastered.
      </p>
      <svg viewBox="0 0 120 120" className={`relative mt-8 h-28 w-28 ${reduce ? "" : "tower-intro-gate-window"}`} aria-hidden="true">
        <circle cx="60" cy="60" r="48" fill="none" stroke="#fb7185" strokeWidth="2" opacity="0.6" />
        <circle cx="60" cy="60" r="32" fill="none" stroke="#67e8f9" strokeWidth="1.5" opacity="0.8" />
        <path d="M60 24 L72 72 L48 72 Z" fill="#1e1030" opacity="0.9" />
        <rect x="54" y="48" width="12" height="8" fill="#fb7185" opacity="0.85" />
      </svg>
      {!reduce && (
        <div className="pointer-events-none absolute inset-0">
          {[20, 45, 70, 85].map((left, i) => (
            <span
              key={i}
              className="dungeon-dust absolute h-1.5 w-1.5 rounded-full bg-rose-200"
              style={{ left: `${left}%`, top: `${22 + i * 14}%`, animationDelay: `${i * 0.35}s` }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
