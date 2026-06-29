"use client";

import MathText from "@/components/MathText";
import { KIND_LABEL } from "@/lib/tower/floors";
import type { ChallengeVisual } from "@/lib/tower/challenges";
import type { BattleApi } from "./useBattle";

/**
 * The challenge panel: shows the current battle question (with an optional
 * pixel visual), the choices, immediate feedback, and a progressive guide hint
 * after a wrong answer. Productive struggle — wrong answers don't reveal the
 * explanation; correct answers do, then advance the battle.
 */
export default function TowerChallengePanel({ api, accent }: { api: BattleApi; accent: string }) {
  if (api.phase === "loading" || !api.challenge) {
    return (
      <div className="relative z-10 mt-4 rounded-2xl border border-white/15 bg-black/30 p-6 text-center text-sm text-white/80 backdrop-blur-sm">
        Summoning a challenge…
      </div>
    );
  }

  const c = api.challenge;
  const resolved = api.phase === "resolved";
  const hasWrong = api.wrongPicks.length > 0;

  return (
    <div className="relative z-10 mt-4 rounded-2xl border border-white/15 bg-[#f8f6ff]/95 p-5 text-slate-900 shadow-xl sm:p-6">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-indigo-600">
          {KIND_LABEL[c.kind]} · {c.difficulty}
        </span>
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
            c.usedAI ? "bg-indigo-100 text-indigo-700" : "bg-slate-100 text-slate-500"
          }`}
        >
          {c.usedAI ? "Personalized" : "Practice rune"}
        </span>
      </div>

      {c.visual && <ChallengeVisualView visual={c.visual} accent={accent} />}

      <p className="mt-3 text-base leading-7 text-slate-800">
        <MathText>{c.prompt}</MathText>
      </p>

      <div className="mt-4 flex flex-col gap-2">
        {c.choices.map((choice) => {
          const isWrong = api.wrongPicks.includes(choice.id);
          const isCorrect = choice.id === c.correctChoiceId;
          let tone = "border-slate-200 bg-white hover:border-indigo-300";
          if (resolved && isCorrect) tone = "border-emerald-400 bg-emerald-50";
          else if (isWrong) tone = "border-amber-400 bg-amber-50 text-amber-900";
          const disabled = resolved || isWrong;
          return (
            <button
              key={choice.id}
              type="button"
              onClick={() => api.pick(choice.id)}
              disabled={disabled}
              className={`rounded-xl border px-4 py-3 text-left text-sm font-medium text-slate-800 transition-colors disabled:cursor-default ${tone}`}
            >
              <MathText>{choice.label}</MathText>
            </button>
          );
        })}
      </div>

      {resolved && (
        <div className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-900">
          <p className="font-semibold">
            {api.defeated ? "Final blow — the concept dissolves into light." : "Memory strengthened — the monster reels."}
          </p>
          <p className="mt-1 text-emerald-800">
            <MathText>{c.explanation}</MathText>
          </p>
          <button
            type="button"
            onClick={api.proceed}
            className="mt-3 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
          >
            {api.defeated ? "Claim the room" : "Next attack"}
          </button>
        </div>
      )}

      {!resolved && hasWrong && (
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
          <p className="font-semibold">The monster strikes — but you hold your focus. Try again.</p>
          {api.hint ? (
            <p className="mt-2 rounded-lg border border-indigo-100 bg-indigo-50 px-3 py-2 text-indigo-900">
              <span className="font-semibold">Guide (hint {api.hintLevel}): </span>
              {api.hint}
            </p>
          ) : (
            <button
              type="button"
              onClick={api.askHint}
              disabled={api.hintLoading}
              className="mt-2 inline-flex items-center gap-2 rounded-lg border border-indigo-200 bg-white px-3 py-2 text-sm font-medium text-indigo-700 transition-colors hover:bg-indigo-50 disabled:opacity-60"
            >
              {api.hintLoading ? "Consulting the guide…" : "Ask the guide for a hint"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/* ----------------------------- Visual views ------------------------------ */

function ChallengeVisualView({ visual, accent }: { visual: ChallengeVisual; accent: string }) {
  return (
    <div className="mt-3 flex flex-col items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-3">
      {visual.kind === "circuit" && <CircuitWire start={visual.start} gates={visual.gates} measure={visual.measure} accent={accent} />}
      {visual.kind === "two-circuits" && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="w-5 text-xs font-bold text-slate-500">{visual.aLabel ?? "A"}</span>
            <CircuitWire start={visual.start} gates={visual.a} accent={accent} />
          </div>
          <div className="flex items-center gap-2">
            <span className="w-5 text-xs font-bold text-slate-500">{visual.bLabel ?? "B"}</span>
            <CircuitWire start={visual.start} gates={visual.b} accent={accent} />
          </div>
        </div>
      )}
      {visual.kind === "histogram" && <HistogramView bars={visual.bars} accent={accent} />}
      {visual.kind === "bloch" && <BlochView vector={visual.vector} accent={accent} />}
      {visual.kind === "pair" && <PairView relation={visual.relation} accent={accent} />}
      {visual.caption && (
        <p className="text-[11px] text-slate-500">
          <MathText>{visual.caption}</MathText>
        </p>
      )}
    </div>
  );
}

function GateBox({ g, accent }: { g: string; accent: string }) {
  if (g === "I") {
    return <span className="text-xs font-medium text-slate-400">I</span>;
  }
  return (
    <span
      className="inline-flex h-7 w-7 items-center justify-center rounded-md border text-sm font-bold"
      style={{ borderColor: accent, color: accent, backgroundColor: `${accent}12` }}
    >
      {g}
    </span>
  );
}

function CircuitWire({
  start,
  gates,
  measure = false,
  accent,
}: {
  start: string;
  gates: string[];
  measure?: boolean;
  accent: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-semibold text-slate-700">
        <MathText>{start}</MathText>
      </span>
      <span className="h-px w-3 bg-slate-300" />
      {gates.map((g, i) => (
        <span key={i} className="flex items-center gap-2">
          <GateBox g={g} accent={accent} />
          {i < gates.length - 1 && <span className="h-px w-3 bg-slate-300" />}
        </span>
      ))}
      {measure && (
        <>
          <span className="h-px w-3 bg-slate-300" />
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-slate-400 text-slate-500" aria-label="measure">
            <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.6}>
              <path d="M4 14 a6 6 0 0 1 12 0" />
              <line x1="10" y1="14" x2="14" y2="8" strokeLinecap="round" />
            </svg>
          </span>
        </>
      )}
    </div>
  );
}

function HistogramView({ bars, accent }: { bars: { label: string; value: number; highlight?: boolean }[]; accent: string }) {
  const max = Math.max(1, ...bars.map((b) => b.value));
  return (
    <div className="flex items-end gap-3" style={{ height: 64 }}>
      {bars.map((b, i) => (
        <div key={i} className="flex flex-col items-center gap-1">
          <div
            className="w-7 rounded-t"
            style={{ height: `${Math.max(6, (b.value / max) * 52)}px`, backgroundColor: b.highlight ? accent : "#cbd5e1" }}
          />
          <span className="text-[11px] font-medium text-slate-600">
            <MathText>{b.label}</MathText>
          </span>
        </div>
      ))}
    </div>
  );
}

const BLOCH_DIR: Record<string, { x: number; y: number; label: string }> = {
  "0": { x: 0, y: -1, label: "0" },
  "1": { x: 0, y: 1, label: "1" },
  "+": { x: 1, y: 0, label: "+" },
  "-": { x: -1, y: 0, label: "−" },
  "+i": { x: 0.7, y: -0.7, label: "+i" },
  "-i": { x: -0.7, y: 0.7, label: "−i" },
};

function BlochView({ vector, accent }: { vector: string; accent: string }) {
  const dir = BLOCH_DIR[vector] ?? BLOCH_DIR["0"];
  const cx = 32;
  const cy = 32;
  const r = 24;
  const tipX = cx + dir.x * r;
  const tipY = cy + dir.y * r;
  return (
    <svg viewBox="0 0 64 64" className="h-16 w-16" aria-label={`Bloch vector ${dir.label}`}>
      <ellipse cx={cx} cy={cy} rx={r} ry={r} fill="none" stroke="#cbd5e1" strokeWidth="1.5" />
      <ellipse cx={cx} cy={cy} rx={r} ry={r / 2.5} fill="none" stroke="#e2e8f0" strokeWidth="1" />
      <line x1={cx} y1={cy} x2={tipX} y2={tipY} stroke={accent} strokeWidth="2" strokeLinecap="round" />
      <circle cx={tipX} cy={tipY} r="3" fill={accent} />
      <text x={cx} y={cy - r - 2} textAnchor="middle" fontSize="7" fill="#94a3b8">0</text>
      <text x={cx} y={cy + r + 7} textAnchor="middle" fontSize="7" fill="#94a3b8">1</text>
    </svg>
  );
}

function PairView({ relation, accent }: { relation: "same" | "opposite" | "independent"; accent: string }) {
  const dash = relation === "independent" ? "2 4" : "4 2";
  return (
    <svg viewBox="0 0 96 40" className="h-10 w-28" aria-label={`entangled pair, ${relation}`}>
      <line x1="28" y1="20" x2="68" y2="20" stroke={accent} strokeWidth="2" strokeDasharray={dash} />
      <circle cx="20" cy="20" r="12" fill={`${accent}22`} stroke={accent} strokeWidth="1.5" />
      <circle cx="76" cy="20" r="12" fill={`${accent}22`} stroke={accent} strokeWidth="1.5" />
      <text x="20" y="24" textAnchor="middle" fontSize="11" fill={accent}>A</text>
      <text x="76" y="24" textAnchor="middle" fontSize="11" fill={accent}>B</text>
    </svg>
  );
}
