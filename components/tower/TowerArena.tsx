"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { PracticeQuestion } from "@/lib/ai/validators";
import MathText from "@/components/MathText";
import WizardCompanion from "@/components/WizardCompanion";
import { useAuth } from "@/lib/auth-context";
import { getTowerLessonContext } from "@/lib/companions/tower-context";
import {
  CONCEPT_LABEL,
  CONCEPT_ORDER,
  CONCEPT_PREREQ,
  primaryConcept,
  type ConceptTag,
} from "@/lib/learning/concepts";
import { getRecommendedReview } from "@/lib/learning/learner-model";
import { getConceptSignal, recordConceptResult } from "@/lib/learning/signals";
import { getRetrievalForConcept } from "@/lib/learning/retrieval";
import { monsterForConcept, type Monster } from "@/lib/tower/encounters";
import { MonsterAvatar, DefeatSparkles } from "./dungeon-monsters";

const LORE_FALLBACK = "Even cancelled amplitudes shape the outcome: interference is subtraction, not just addition.";

type Phase = "loading" | "question" | "feedback" | "victory";

function hintFallback(level: number): string {
  switch (level) {
    case 1:
      return "What did the lesson's experiment for this idea show? Recall that first.";
    case 2:
      return "Focus on the one quantity that changes here — look only at that.";
    case 3:
      return "Name the core idea at play (for example, how amplitudes or phase behave).";
    default:
      return "Re-read the explanation, then complete the final step of the reasoning yourself.";
  }
}

/**
 * Build the battle plan: struggled concepts first, then concepts due for spaced
 * review, then the current lesson, then everything else. This makes the tower a
 * targeted retrieval-practice arena rather than random trivia.
 */
function buildPlan(profile: Parameters<typeof getRecommendedReview>[0]): ConceptTag[] {
  const review = getRecommendedReview(profile).map((r) => r.tag);
  const ctx = getTowerLessonContext();
  const current = ctx ? primaryConcept(ctx.lessonId) : null;
  const ordered: ConceptTag[] = [...review];
  if (current && !ordered.includes(current)) ordered.push(current);
  for (const t of CONCEPT_ORDER) if (!ordered.includes(t)) ordered.push(t);
  return ordered.length ? ordered : ["qubits"];
}

export default function TowerArena() {
  const { profile } = useAuth();

  // Deterministic first render (matches SSR); the real plan is built after mount
  // so localStorage-derived priorities don't cause hydration mismatches.
  const [plan, setPlan] = useState<ConceptTag[]>(["qubits"]);
  const [encounterIndex, setEncounterIndex] = useState(0);

  const concept = plan[encounterIndex % plan.length];
  const conceptLabel = CONCEPT_LABEL[concept];
  const monster: Monster = monsterForConcept(concept);

  const [hp, setHp] = useState(monster.maxHp);
  const [phase, setPhase] = useState<Phase>("loading");
  const [question, setQuestion] = useState<PracticeQuestion | null>(null);
  const [picked, setPicked] = useState<string | null>(null);
  const [usedAI, setUsedAI] = useState(false);
  const [wrongInEncounter, setWrongInEncounter] = useState(0);
  const [hint, setHint] = useState<string | null>(null);
  const [hintLoading, setHintLoading] = useState(false);
  const [lore, setLore] = useState<string | null>(null);
  const [loreLoading, setLoreLoading] = useState(false);
  const [hitFlash, setHitFlash] = useState(false);

  const seedRef = useRef(0);
  const startedRef = useRef(false);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach((t) => clearTimeout(t));
  }, []);

  const loadQuestionFor = useCallback(async (tag: ConceptTag) => {
    setPhase("loading");
    setPicked(null);
    setHint(null);
    setWrongInEncounter(0);
    const prereq = CONCEPT_PREREQ[tag];
    const sig = getConceptSignal(tag);
    const misconception = sig?.misconceptions[sig.misconceptions.length - 1]?.text;
    try {
      const res = await fetch("/api/ai/practice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: CONCEPT_LABEL[tag],
          concept: CONCEPT_LABEL[tag],
          conceptTag: tag,
          prerequisite: prereq ? CONCEPT_LABEL[prereq] : undefined,
          misconception,
        }),
      });
      const data = (await res.json().catch(() => null)) as { practice?: PracticeQuestion } | null;
      if (res.ok && data?.practice) {
        setQuestion(data.practice);
        setUsedAI(true);
        setPhase("question");
        return;
      }
    } catch {
      // fall through to the hand-written retrieval bank
    }
    const fallback = getRetrievalForConcept(tag, seedRef.current);
    seedRef.current += 1;
    setQuestion(fallback);
    setUsedAI(false);
    setPhase(fallback ? "question" : "victory");
  }, []);

  // Build the plan and load the first encounter once, after mount.
  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    const p = buildPlan(profile);
    setPlan(p);
    setHp(monsterForConcept(p[0]).maxHp);
    void loadQuestionFor(p[0]);
  }, [profile, loadQuestionFor]);

  function answer(choiceId: string) {
    if (phase !== "question" || !question) return;
    setPicked(choiceId);
    setPhase("feedback");
    const correct = choiceId === question.correctChoiceId;

    if (correct) {
      recordConceptResult(concept, true, { hints: wrongInEncounter });
      setHitFlash(true);
      timers.current.push(window.setTimeout(() => setHitFlash(false), 520));
      const nextHp = Math.max(0, hp - 1);
      setHp(nextHp);
      if (nextHp === 0) timers.current.push(window.setTimeout(() => setPhase("victory"), 900));
    } else {
      recordConceptResult(concept, false, { misconception: question.misconception });
      setWrongInEncounter((w) => w + 1);
    }
  }

  function nextEncounter() {
    const idx = encounterIndex + 1;
    setEncounterIndex(idx);
    setHp(monsterForConcept(plan[idx % plan.length]).maxHp);
    setLore(null);
    void loadQuestionFor(plan[idx % plan.length]);
  }

  async function askGuide() {
    if (hintLoading || !question) return;
    setHintLoading(true);
    const level = Math.max(1, Math.min(4, wrongInEncounter));
    const correctLabel = question.choices.find((c) => c.id === question.correctChoiceId)?.label;
    try {
      const res = await fetch("/api/ai/hint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lessonTitle: conceptLabel,
          prompt: question.prompt,
          conceptTag: concept,
          correctAnswer: correctLabel,
          feedback: question.explanation,
          level,
        }),
      });
      const data = (await res.json().catch(() => null)) as { hint?: string } | null;
      setHint(res.ok && data?.hint ? data.hint : hintFallback(level));
    } catch {
      setHint(hintFallback(level));
    } finally {
      setHintLoading(false);
    }
  }

  async function revealLore() {
    if (loreLoading) return;
    setLoreLoading(true);
    try {
      const res = await fetch("/api/ai/fun-fact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: conceptLabel }),
      });
      const data = (await res.json().catch(() => null)) as { fact?: string } | null;
      setLore(res.ok && data?.fact ? data.fact : LORE_FALLBACK);
    } catch {
      setLore(LORE_FALLBACK);
    } finally {
      setLoreLoading(false);
    }
  }

  const defeated = phase === "victory" || hp === 0;
  const correctPicked = !!picked && !!question && picked === question.correctChoiceId;

  return (
    <main className="mx-auto w-full max-w-[1100px] flex-1 px-4 py-6 pb-32 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Tower Arena</h1>
          <p className="text-sm text-slate-500">
            Retrieval practice on the concepts you most need. Battles never affect your lesson progress.
          </p>
        </div>
        <Link href="/dashboard" className="shrink-0 text-sm font-medium text-indigo-600 hover:underline">
          Back to course
        </Link>
      </div>

      {/* Arena stage */}
      <section className="arena-stage relative mt-6 overflow-hidden rounded-3xl border border-indigo-200 p-5 sm:p-8">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col items-center gap-2 text-center">
            <WizardCompanion
              mood={phase === "victory" ? "happy" : "still"}
              className="h-24 w-24"
              wandMode={phase === "victory" ? "celebrate" : "beam"}
              wandAim={28}
              floppy={false}
            />
            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700">Guide Wizard</p>
            <FocusBar value={monster.maxHp - hp} max={monster.maxHp} />
          </div>

          <span className="hidden text-sm font-bold uppercase tracking-widest text-indigo-400 sm:inline">versus</span>

          <div className="flex flex-col items-center gap-2 text-center">
            <div className={`relative ${hitFlash ? "arena-hit" : ""}`}>
              <MonsterAvatar type={monster.type} defeated={defeated} />
              {defeated && <DefeatSparkles />}
            </div>
            <p className="text-sm font-bold text-slate-900">{monster.name}</p>
            <p className="text-xs text-slate-500">{monster.tagline}</p>
            <HealthBar value={hp} max={monster.maxHp} defeated={defeated} />
          </div>
        </div>

        <span className="pointer-events-none absolute left-4 top-4 text-[10px] font-semibold uppercase tracking-widest text-indigo-300">
          Encounter {encounterIndex + 1} · Realm of {conceptLabel}
        </span>
      </section>

      {/* Action panel */}
      <section className="mt-5">
        {phase === "loading" && (
          <div className="rounded-2xl border border-indigo-100 bg-white p-6 text-center text-sm text-indigo-700">
            Summoning a challenge from the realm of {conceptLabel}…
          </div>
        )}

        {phase === "victory" ? (
          <VictoryPanel
            monsterName={monster.name}
            conceptLabel={conceptLabel}
            lore={lore}
            loreLoading={loreLoading}
            onReveal={revealLore}
            onNext={nextEncounter}
          />
        ) : (
          question &&
          (phase === "question" || phase === "feedback") && (
            <div className="rounded-2xl border border-indigo-100 bg-white p-5 sm:p-6">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-indigo-600">
                  {correctPicked ? "Concept weakened" : "Challenge"} · {question.difficulty}
                </span>
                {!usedAI && (
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500">
                    Practice rune
                  </span>
                )}
              </div>

              <p className="mt-2 text-base leading-7 text-slate-800">
                <MathText>{question.prompt}</MathText>
              </p>

              <div className="mt-4 flex flex-col gap-2">
                {question.choices.map((choice) => {
                  const isPicked = picked === choice.id;
                  const isCorrect = choice.id === question.correctChoiceId;
                  const answered = phase === "feedback";
                  let tone = "border-slate-200 bg-white hover:border-indigo-300";
                  if (answered && isCorrect) tone = "border-emerald-400 bg-emerald-50";
                  else if (answered && isPicked) tone = "border-amber-400 bg-amber-50";
                  return (
                    <button
                      key={choice.id}
                      type="button"
                      onClick={() => answer(choice.id)}
                      disabled={answered}
                      className={`rounded-xl border px-4 py-3 text-left text-sm font-medium text-slate-800 transition-colors disabled:cursor-default ${tone}`}
                    >
                      <MathText>{choice.label}</MathText>
                    </button>
                  );
                })}
              </div>

              {phase === "feedback" && (
                <div className="mt-4 rounded-xl bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-700">
                  <p className="font-semibold text-slate-900">
                    {correctPicked
                      ? hp === 0
                        ? "Final blow — the concept dissolves into light."
                        : "Correct — the monster reels back."
                      : "The monster holds its ground."}
                  </p>
                  <p className="mt-1">
                    <MathText>{question.explanation}</MathText>
                  </p>

                  {!correctPicked && (
                    <div className="mt-3">
                      {hint ? (
                        <p className="rounded-lg border border-indigo-100 bg-indigo-50 px-3 py-2 text-indigo-900">{hint}</p>
                      ) : (
                        <button
                          type="button"
                          onClick={askGuide}
                          disabled={hintLoading}
                          className="inline-flex items-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-sm font-medium text-indigo-700 transition-colors hover:bg-indigo-100 disabled:opacity-60"
                        >
                          {hintLoading ? "Consulting the guide…" : "Ask the guide for a hint"}
                        </button>
                      )}
                    </div>
                  )}

                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => void loadQuestionFor(concept)}
                      className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
                    >
                      {correctPicked ? "Next attack" : "Try another challenge"}
                    </button>
                    <Link
                      href="/dashboard"
                      className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                    >
                      Back to course
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )
        )}
      </section>

      <p className="mt-6 text-center text-xs text-slate-400">
        More encounter types — Circuit duels and timed review — are coming soon.
      </p>
    </main>
  );
}

function HealthBar({ value, max, defeated }: { value: number; max: number; defeated: boolean }) {
  const pct = Math.max(0, Math.round((value / max) * 100));
  return (
    <div className="w-40">
      <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-wide text-slate-500">
        <span>{defeated ? "Defeated" : "Stability"}</span>
        <span className="tabular-nums">
          {value}/{max}
        </span>
      </div>
      <div className="mt-1 h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-gradient-to-r from-rose-400 to-rose-600 transition-[width] duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function FocusBar({ value, max }: { value: number; max: number }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div className="w-32">
      <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-wide text-indigo-500">
        <span>Focus</span>
        <span className="tabular-nums">{value}</span>
      </div>
      <div className="mt-1 h-2.5 w-full overflow-hidden rounded-full bg-indigo-100">
        <div
          className="h-full rounded-full bg-gradient-to-r from-indigo-400 to-indigo-600 transition-[width] duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function VictoryPanel({
  monsterName,
  conceptLabel,
  lore,
  loreLoading,
  onReveal,
  onNext,
}: {
  monsterName: string;
  conceptLabel: string;
  lore: string | null;
  loreLoading: boolean;
  onReveal: () => void;
  onNext: () => void;
}) {
  return (
    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center">
      <p className="text-lg font-bold text-emerald-900">Concept defeated</p>
      <p className="mt-1 text-sm text-emerald-800">
        The {monsterName} dissolves into light — you strengthened your grasp of {conceptLabel}.
      </p>

      {lore ? (
        <p className="mx-auto mt-4 max-w-prose rounded-lg border border-amber-100 bg-amber-50 px-3 py-2 text-sm leading-6 text-amber-950">
          {lore}
        </p>
      ) : (
        <button
          type="button"
          onClick={onReveal}
          disabled={loreLoading}
          className="mt-4 inline-flex items-center gap-2 rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm font-medium text-amber-800 transition-colors hover:bg-amber-50 disabled:opacity-60"
        >
          {loreLoading ? "Opening the spellbook…" : "Reveal lore drop"}
        </button>
      )}

      <div className="mt-5 flex flex-wrap justify-center gap-2">
        <button
          type="button"
          onClick={onNext}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
        >
          Next encounter
        </button>
        <Link
          href="/dashboard"
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
        >
          Back to course
        </Link>
      </div>
    </div>
  );
}
