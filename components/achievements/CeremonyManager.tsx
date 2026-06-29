"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { ACHIEVEMENTS, getUnlockedIds, type AchievementDef } from "@/lib/achievements/catalog";
import { getCelebrated, setCelebrated } from "@/lib/achievements/celebrated";
import { playSound } from "@/lib/sound/sounds";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import BadgeCeremony from "./BadgeCeremony";

const CEREMONY_MS = 3000;

/**
 * Watches derived achievements and plays the unlock ceremony for newly earned
 * ones, one at a time. Seeds silently on first run (so existing achievements
 * don't all replay) and marks each unlock celebrated immediately so it never
 * repeats. Mounted once in the root layout; renders nothing until an unlock.
 */
export default function CeremonyManager() {
  const { user, profile } = useAuth();
  const reduce = useReducedMotion();
  const [current, setCurrent] = useState<AchievementDef | null>(null);
  const queueRef = useRef<AchievementDef[]>([]);
  const playingRef = useRef(false);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach((t) => clearTimeout(t));
  }, []);

  const playNext = useCallback(function run() {
    const next = queueRef.current.shift();
    if (!next) {
      playingRef.current = false;
      setCurrent(null);
      return;
    }
    playingRef.current = true;
    setCurrent(next);
    const end = window.setTimeout(() => {
      setCurrent(null);
      const gap = window.setTimeout(run, 250);
      timers.current.push(gap);
    }, CEREMONY_MS);
    timers.current.push(end);
  }, []);

  useEffect(() => {
    if (!user) return;
    // Deferred so localStorage-derived state runs client-side only.
    const id = window.setTimeout(() => {
      const unlocked = getUnlockedIds(profile);
      const seen = getCelebrated();
      if (seen === null) {
        setCelebrated(unlocked); // first run: adopt current set without a ceremony
        return;
      }
      const seenSet = new Set(seen);
      const newly = unlocked.filter((u) => !seenSet.has(u));
      if (newly.length === 0) return;
      setCelebrated([...seen, ...newly]); // never replay
      playSound("badge");
      if (reduce) return; // respect reduced motion: skip the animation
      const defs = newly
        .map((u) => ACHIEVEMENTS.find((d) => d.id === u))
        .filter((d): d is AchievementDef => !!d);
      queueRef.current.push(...defs);
      if (!playingRef.current) playNext();
    }, 0);
    return () => clearTimeout(id);
  }, [user, profile, reduce, playNext]);

  if (!current) return null;
  return <BadgeCeremony def={current} />;
}
