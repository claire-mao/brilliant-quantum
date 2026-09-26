"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { lessonsForConcept } from "@/lib/learning/concepts";
import {
  loadTeachBackProfile,
  masteryRows,
  masteryTone,
  subscribeTeachBackProfile,
  type MasteryRow,
} from "@/lib/learning/teachback-profile";

/** Mastery-by-concept panel fed by completed Teach-Back sessions (dark profile styling). */
export default function TeachBackMastery() {
  const [rows, setRows] = useState<MasteryRow[] | null>(null);

  useEffect(() => {
    const refresh = () => setRows(masteryRows(loadTeachBackProfile()));
    const id = window.setTimeout(refresh, 0);
    const unsub = subscribeTeachBackProfile(refresh);
    return () => {
      clearTimeout(id);
      unsub();
    };
  }, []);

  return (
    <section className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="font-serif text-xl font-bold text-white">Teach-Back mastery</h3>
        <p className="text-xs text-slate-400">Updated each time you explain a concept back to the tutor</p>
      </div>

      {rows === null ? (
        <p className="mt-3 text-sm text-slate-500">Reading your explanations…</p>
      ) : rows.length === 0 ? (
        <p className="mt-3 text-sm text-slate-400">
          No Teach-Back sessions yet. Open any lesson and press{" "}
          <span className="font-semibold text-violet-200">Teach It Back</span> to explain a concept in your own words.
        </p>
      ) : (
        <ul className="mt-4 flex flex-col gap-3">
          {rows.map((row) => {
            const tone = masteryTone(row.score);
            const lessonId = lessonsForConcept(row.tag)[0];
            return (
              <li key={row.tag} className="flex items-center gap-4">
                <div className="w-32 shrink-0 sm:w-40">
                  {lessonId ? (
                    <Link href={`/lessons/${lessonId}`} className="text-sm font-semibold text-white hover:text-violet-200">
                      {row.label}
                    </Link>
                  ) : (
                    <span className="text-sm font-semibold text-white">{row.label}</span>
                  )}
                  <p className="text-xs text-slate-500">
                    {row.sessions} {row.sessions === 1 ? "session" : "sessions"}
                  </p>
                </div>
                <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-white/10">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${tone.bar} transition-[width] duration-700 ease-out`}
                    style={{ width: `${row.score}%` }}
                  />
                </div>
                <span className="w-10 shrink-0 text-right text-sm font-bold tabular-nums text-white">{row.score}</span>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
