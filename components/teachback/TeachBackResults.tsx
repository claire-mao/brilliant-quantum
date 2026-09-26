"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { TeachBackAnalysis, TeachingStrategy } from "@/lib/ai/teachback";
import { masteryTone } from "@/lib/learning/teachback-profile";

const STRATEGY_LABEL: Record<TeachingStrategy, string> = {
  "affirm-and-extend": "Affirm and extend",
  "correct-misconception": "Correct a misconception",
  "fill-gap": "Fill a gap",
  "contrast-cases": "Contrast cases",
  "worked-example": "Worked example",
  "analogy-repair": "Repair an analogy",
};

type TtsState = "idle" | "loading" | "playing" | "unavailable" | "error";

const TTS_TIMEOUT_MS = 30_000;

export default function TeachBackResults({
  analysis,
  source,
  priorMastery,
  profileMastery,
  transcript,
  onRetry,
  onDone,
}: {
  analysis: TeachBackAnalysis;
  source: "claude" | "fallback";
  priorMastery: number | null;
  profileMastery: number | null;
  transcript: string;
  onRetry: () => void;
  onDone: () => void;
}) {
  const fix = analysis.misconceptions[0] ?? analysis.missingIdeas[0] ?? null;
  const fixKind = analysis.misconceptions[0] ? "misconception" : analysis.missingIdeas[0] ? "missing" : null;
  const tone = masteryTone(analysis.masteryScore);
  const delta = priorMastery !== null && profileMastery !== null ? profileMastery - priorMastery : null;

  return (
    <div className="flex flex-col gap-5">
      <section className="flex flex-col items-center gap-5 rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:flex-row sm:items-center">
        <MasteryRing score={analysis.masteryScore} gradientId="teachback-ring" />
        <div className="min-w-0 flex-1 text-center sm:text-left">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Mastery · {analysis.concept}</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">
            {analysis.masteryScore}%{" "}
            <span className={`ml-1 inline-block rounded-full border px-2 py-0.5 align-middle text-xs font-semibold ${tone.className}`}>
              {tone.label}
            </span>
          </p>
          <p className="mt-1 text-sm text-slate-600">
            {profileMastery !== null && (
              <>
                Profile score for {analysis.concept}: <span className="font-semibold tabular-nums">{profileMastery}</span>
                {delta !== null && delta !== 0 && (
                  <span className={`ml-1 font-semibold tabular-nums ${delta > 0 ? "text-emerald-600" : "text-amber-600"}`}>
                    ({delta > 0 ? "+" : ""}
                    {delta})
                  </span>
                )}
              </>
            )}
          </p>
          <p className="mt-2 text-xs text-slate-500">
            Strategy: <span className="font-medium text-slate-700">{STRATEGY_LABEL[analysis.teachingStrategy]}</span>
            {source === "fallback" && (
              <span className="ml-2 rounded bg-slate-200 px-1.5 py-0.5 font-medium text-slate-600" title="The Claude model was unavailable; the built-in rubric tutor produced this feedback.">
                rubric tutor
              </span>
            )}
          </p>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2">
        <section className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4">
          <h3 className="flex items-center gap-2 text-sm font-bold text-emerald-800">
            <CheckIcon className="h-4 w-4" /> What you understood
          </h3>
          {analysis.correctIdeas.length === 0 ? (
            <p className="mt-2 text-sm leading-6 text-emerald-900/80">
              Nothing solid yet — that is fine. The tutor&apos;s explanation below gives you a starting point.
            </p>
          ) : (
            <ul className="mt-2 flex flex-col gap-1.5 text-sm leading-6 text-emerald-950">
              {analysis.correctIdeas.map((idea, i) => (
                <li key={i} className="flex gap-2">
                  <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                  <span>{idea}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4">
          <h3 className="flex items-center gap-2 text-sm font-bold text-amber-800">
            <WrenchIcon className="h-4 w-4" /> One thing to fix
          </h3>
          {fix ? (
            <>
              <p className="mt-2 text-sm leading-6 text-amber-950">{fix}</p>
              <p className="mt-2 text-xs font-medium text-amber-700">
                {fixKind === "misconception" ? "A misconception in what you said" : "An idea your explanation left out"}
              </p>
            </>
          ) : (
            <p className="mt-2 text-sm leading-6 text-amber-950">
              No misconceptions spotted and no key idea missing. Keep sharpening your wording with the next challenge below.
            </p>
          )}
          {(analysis.misconceptions.length > 1 || (fixKind === "misconception" && analysis.missingIdeas.length > 0)) && (
            <details className="mt-3 text-xs text-amber-800">
              <summary className="cursor-pointer font-medium">Also worth revisiting</summary>
              <ul className="mt-1 list-disc pl-4">
                {analysis.misconceptions.slice(1).map((m, i) => (
                  <li key={`m${i}`}>{m}</li>
                ))}
                {analysis.missingIdeas.map((m, i) => (
                  <li key={`g${i}`}>{m}</li>
                ))}
              </ul>
            </details>
          )}
        </section>
      </div>

      <section className="rounded-2xl border border-indigo-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-sm font-bold text-indigo-800">Your tutor explains</h3>
          <ListenButton text={analysis.tutorResponse} />
        </div>
        <p className="mt-3 text-base leading-8 text-slate-800">{analysis.tutorResponse}</p>
      </section>

      <section className="rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-700 p-5 text-white shadow-lg shadow-indigo-500/20">
        <p className="text-xs font-semibold uppercase tracking-widest text-indigo-200">Next challenge</p>
        <p className="mt-2 text-lg font-semibold leading-7">{analysis.followUpQuestion}</p>
        <p className="mt-2 text-sm text-indigo-100">Answer this out loud or in writing on your next Teach-Back to raise your mastery.</p>
      </section>

      <details className="text-sm text-slate-500">
        <summary className="cursor-pointer font-medium text-slate-600">What you said</summary>
        <p className="mt-2 rounded-lg bg-slate-50 px-3 py-2 leading-6 text-slate-700">&ldquo;{transcript}&rdquo;</p>
      </details>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onRetry}
          className="min-h-12 rounded-lg border border-slate-300 bg-white px-5 py-3 text-base font-semibold text-slate-700 transition-colors hover:bg-slate-50"
        >
          Try the challenge
        </button>
        <button
          type="button"
          onClick={onDone}
          className="min-h-12 rounded-lg bg-indigo-600 px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-indigo-700"
        >
          Back to lesson
        </button>
      </div>
    </div>
  );
}

function ListenButton({ text }: { text: string }) {
  const [state, setState] = useState<TtsState>("idle");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const urlRef = useRef<string | null>(null);
  const pendingRef = useRef<Promise<HTMLAudioElement | null> | null>(null);

  const fetchAudio = useCallback((): Promise<HTMLAudioElement | null> => {
    if (audioRef.current) return Promise.resolve(audioRef.current);
    if (pendingRef.current) return pendingRef.current;
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), TTS_TIMEOUT_MS);
    const p = (async () => {
      try {
        const res = await fetch("/api/teachback/speak", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text }),
          signal: controller.signal,
        });
        if (res.status === 503) {
          setState("unavailable");
          return null;
        }
        if (!res.ok) return null;
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        urlRef.current = url;
        const audio = new Audio(url);
        audio.preload = "auto";
        audio.onended = () => setState("idle");
        audio.onerror = () => setState("error");
        audioRef.current = audio;
        return audio;
      } catch {
        return null;
      } finally {
        window.clearTimeout(timer);
        pendingRef.current = null;
      }
    })();
    pendingRef.current = p;
    return p;
  }, [text]);

  // Warm the voice as soon as results render so "Listen" starts instantly.
  useEffect(() => {
    void fetchAudio();
    return () => {
      audioRef.current?.pause();
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    };
  }, [fetchAudio]);

  async function toggle() {
    if (state === "playing") {
      audioRef.current?.pause();
      if (audioRef.current) audioRef.current.currentTime = 0;
      setState("idle");
      return;
    }
    if (!audioRef.current) setState("loading");
    const audio = await fetchAudio();
    if (!audio) {
      setState((s) => (s === "unavailable" ? s : "error"));
      return;
    }
    try {
      audio.currentTime = 0;
      await audio.play();
      setState("playing");
    } catch {
      setState("error");
    }
  }

  if (state === "unavailable") {
    return <span className="text-xs text-slate-400">Listen unavailable (voice not configured)</span>;
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={state === "loading"}
      className="flex min-h-10 items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700 transition-colors hover:bg-indigo-100 disabled:opacity-60"
      aria-pressed={state === "playing"}
    >
      {state === "loading" ? (
        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-indigo-300 border-t-indigo-700" aria-hidden="true" />
      ) : state === "playing" ? (
        <StopIcon className="h-4 w-4" />
      ) : (
        <SpeakerIcon className="h-4 w-4" />
      )}
      {state === "loading" ? "Preparing voice…" : state === "playing" ? "Stop" : state === "error" ? "Retry listen" : "Listen"}
    </button>
  );
}

function MasteryRing({ score, gradientId }: { score: number; gradientId: string }) {
  const r = 44;
  const c = 2 * Math.PI * r;
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const id = window.setTimeout(() => setProgress(score), 50);
    return () => clearTimeout(id);
  }, [score]);
  return (
    <div className="relative h-28 w-28 shrink-0" role="img" aria-label={`Mastery ${score} percent`}>
      <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r={r} fill="none" stroke="#e2e8f0" strokeWidth="9" />
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (progress / 100) * c}
          className="transition-[stroke-dashoffset] duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold tabular-nums text-slate-900">{score}</span>
        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">mastery</span>
      </div>
    </div>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={2.4} aria-hidden="true">
      <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function WrenchIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path d="M14.7 6.3a4 4 0 0 0 4.9 4.9L21 12.6 12.6 21 3 11.4l8.4-8.4 3.3 1.4z" strokeLinejoin="round" />
    </svg>
  );
}

function SpeakerIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path d="M4 10v4h3l4 3V7L7 10H4zM15 9a4 4 0 0 1 0 6M18 6a8 8 0 0 1 0 12" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function StopIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <rect x="6" y="6" width="12" height="12" rx="2" />
    </svg>
  );
}
