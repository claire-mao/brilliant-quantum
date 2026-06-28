"use client";

import { useEffect, useRef } from "react";
import WizardCompanion from "@/components/WizardCompanion";
import type { Climate } from "@/lib/tower/climates";
import useReducedMotion from "./useReducedMotion";

/**
 * The climb between floors: light particles rise, the wizard walks up the
 * stairs, and the view scrolls upward before the next floor loads. Honors
 * reduced motion (near-instant fade) and always calls `onDone`.
 */
export default function TowerStaircaseTransition({
  climate,
  toFloor,
  isFinal,
  onDone,
}: {
  climate: Climate;
  toFloor: number;
  isFinal: boolean;
  onDone: () => void;
}) {
  const reduce = useReducedMotion();
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
      onDone();
    };
    timers.current.push(window.setTimeout(finish, reduce ? 350 : 1500));
  }, [reduce, onDone]);

  const p = climate.palette;
  return (
    <div
      className="absolute inset-0 z-30 flex items-center justify-center overflow-hidden"
      style={{ background: `linear-gradient(180deg, ${p.bgVia} 0%, ${p.bgTo} 100%)` }}
      aria-live="polite"
    >
      {!reduce &&
        [...Array(10)].map((_, i) => (
          <span
            key={i}
            className="tower-climb-mote pointer-events-none absolute h-1.5 w-1.5 rounded-full"
            style={{
              left: `${8 + i * 9}%`,
              bottom: "10%",
              backgroundColor: p.accentSoft,
              boxShadow: `0 0 8px ${p.accent}`,
              animationDelay: `${i * 0.12}s`,
            }}
          />
        ))}

      <div className={`flex flex-col items-center ${reduce ? "" : "tower-climb-rise"}`}>
        <svg viewBox="0 0 120 80" className="h-24 w-36" aria-hidden="true">
          {[0, 1, 2, 3, 4].map((i) => (
            <rect
              key={i}
              x={20 + i * 16}
              y={64 - i * 12}
              width={20}
              height={12 + i * 12}
              fill={i % 2 === 0 ? p.floor : p.floorDark}
            />
          ))}
        </svg>
        <span className={reduce ? "" : "tower-climb-wizard"}>
          <WizardCompanion mood="still" wandMode="beam" wandAim={-30} className="h-14 w-14" floppy={false} />
        </span>
        <p className="mt-3 text-sm font-semibold uppercase tracking-[0.2em]" style={{ color: p.inkSoft }}>
          {isFinal ? "The tower breaks open" : `Climbing to Floor ${toFloor}`}
        </p>
      </div>
    </div>
  );
}
