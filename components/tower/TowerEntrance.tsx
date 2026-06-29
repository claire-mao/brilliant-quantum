"use client";

import { useEffect, useRef, useState } from "react";
import WizardCompanion from "@/components/WizardCompanion";
import type { Climate } from "@/lib/tower/climates";
import { climateBackground } from "@/lib/tower/climates";
import useReducedMotion from "./useReducedMotion";

/**
 * Tower entrance: a closed pixel gate rolls upward, warm white/violet light
 * spills out, and the wizard walks inside before the scene fades into the
 * dungeon. Under reduced motion the long animation is skipped and a static
 * "open gate" state is shown briefly before continuing.
 */
export default function TowerEntrance({
  climate,
  floor,
  resuming,
  onEnter,
}: {
  climate: Climate;
  floor: number;
  resuming: boolean;
  onEnter: () => void;
}) {
  const reduce = useReducedMotion();
  const [leaving, setLeaving] = useState(false);
  const done = useRef(false);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach((t) => clearTimeout(t));
  }, []);

  useEffect(() => {
    const finish = () => {
      if (done.current) return;
      done.current = true;
      onEnter();
    };
    if (reduce) {
      timers.current.push(window.setTimeout(finish, 500));
      return;
    }
    // Begin the fade just before handing off, so the dungeon appears seamlessly.
    timers.current.push(window.setTimeout(() => setLeaving(true), 2350));
    timers.current.push(window.setTimeout(finish, 2850));
  }, [reduce, onEnter]);

  function skip() {
    if (done.current) return;
    done.current = true;
    onEnter();
  }

  return (
    <div
      className={`relative flex min-h-[60vh] flex-1 items-center justify-center overflow-hidden ${leaving ? "tower-entrance-leaving" : ""}`}
      style={{ background: climateBackground(climate.palette) }}
    >
      <button
        type="button"
        onClick={skip}
        className="absolute right-4 top-4 z-20 rounded-full border border-white/20 bg-black/30 px-3 py-1 text-xs font-medium text-white/80 backdrop-blur-sm transition-colors hover:bg-black/50"
      >
        Skip
      </button>

      <div className="relative flex flex-col items-center" aria-live="polite">
        <GateScene reduce={reduce} accent={climate.palette.accent} accentSoft={climate.palette.accentSoft} wall={climate.palette.wall} wallDark={climate.palette.wallDark} />

        <p className="mt-6 text-sm font-semibold uppercase tracking-[0.2em]" style={{ color: climate.palette.inkSoft }}>
          {resuming ? `Returning to Floor ${floor}` : "Entering the Wizard Tower"}
        </p>
        <p className="mt-1 text-lg font-bold" style={{ color: climate.palette.ink }}>
          {climate.name}
        </p>
      </div>
    </div>
  );
}

function GateScene({
  reduce,
  accent,
  accentSoft,
  wall,
  wallDark,
}: {
  reduce: boolean;
  accent: string;
  accentSoft: string;
  wall: string;
  wallDark: string;
}) {
  return (
    <div className="relative h-56 w-64">
      <svg viewBox="0 0 256 224" className="h-full w-full" aria-hidden="true">
        <defs>
          <linearGradient id="entrance-light" x1="0.5" y1="1" x2="0.5" y2="0">
            <stop offset="0%" stopColor={accent} stopOpacity="0" />
            <stop offset="100%" stopColor="#fff7ed" stopOpacity="0.95" />
          </linearGradient>
        </defs>

        {/* arch + side towers */}
        <rect x="20" y="36" width="216" height="180" fill={wallDark} />
        <rect x="32" y="48" width="192" height="168" fill={wall} />
        <rect x="8" y="24" width="40" height="200" fill={wallDark} />
        <rect x="208" y="24" width="40" height="200" fill={wallDark} />
        <path d="M8 24 L28 4 L48 24 Z" fill={accent} />
        <path d="M208 24 L228 4 L248 24 Z" fill={accent} />

        {/* doorway interior with light spilling out */}
        <rect x="72" y="84" width="112" height="132" fill="#0a0712" />
        <rect
          x="72"
          y="84"
          width="112"
          height="132"
          fill="url(#entrance-light)"
          className={reduce ? "tower-gate-light-static" : "tower-gate-light"}
        />

        {/* portcullis gate that lifts upward */}
        <g className={reduce ? "tower-gate-open" : "tower-gate-lift"}>
          <rect x="72" y="84" width="112" height="132" fill={wallDark} />
          <g stroke={accent} strokeWidth="4" opacity="0.9">
            {[88, 104, 120, 136, 152, 168].map((x) => (
              <line key={x} x1={x} y1="84" x2={x} y2="216" />
            ))}
            {[104, 132, 160, 188].map((y) => (
              <line key={y} x1="72" y1={y} x2="184" y2={y} />
            ))}
          </g>
        </g>

        {/* glowing runes on the arch */}
        <circle cx="128" cy="60" r="12" fill="none" stroke={accentSoft} strokeWidth="2" strokeDasharray="3 4" className={reduce ? "" : "tower-rune-ring"} />
        <circle cx="128" cy="60" r="3" fill={accentSoft} />
      </svg>

      {/* the wizard walks in */}
      <span className={`absolute bottom-2 left-1/2 -translate-x-1/2 ${reduce ? "" : "tower-wizard-walkin"}`}>
        <WizardCompanion mood="still" wandMode="glow" wandAim={-30} className="h-16 w-16" floppy={false} />
      </span>
    </div>
  );
}
