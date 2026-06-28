"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Difficulty, PracticeQuestion } from "@/lib/ai/validators";
import { CONCEPT_LABEL, CONCEPT_PREREQ, type ConceptTag } from "@/lib/learning/concepts";
import { getConceptSignal, recordConceptResult } from "@/lib/learning/signals";
import { KIND_LABEL, type ChallengeKind } from "@/lib/tower/floors";
import {
  selectChallenge,
  type ChallengeVisual,
} from "@/lib/tower/challenges";
import { recordTowerBattle } from "@/lib/tower/progress";
import type { MonsterState } from "./TowerMonster";
import type { WizardBattleState } from "./TowerBattleStage";

export interface RoundSpec {
  concept: ConceptTag;
  conceptLabel: string;
  kind: ChallengeKind;
  difficulty: Difficulty;
}

export interface ResolvedChallenge {
  concept: ConceptTag;
  kind: ChallengeKind;
  difficulty: Difficulty;
  prompt: string;
  choices: { id: string; label: string }[];
  correctChoiceId: string;
  explanation: string;
  misconception?: string;
  visual?: ChallengeVisual;
  hintLadder?: string[];
  usedAI: boolean;
}

export type BattlePhase = "loading" | "question" | "resolved" | "cleared";

function genericHint(level: number): string {
  switch (level) {
    case 1:
      return "Recall what the lesson's experiment for this idea showed — start there.";
    case 2:
      return "Focus on the one quantity that actually changes here; ignore the rest.";
    case 3:
      return "Name the core idea at play (for example, how amplitudes or phase behave).";
    default:
      return "Re-read the explanation, then complete the final step of the reasoning yourself.";
  }
}

const ANIM_MS = 540;

export interface UseBattleArgs {
  floor: number;
  boss: boolean;
  maxHp: number;
  rounds: RoundSpec[];
  onCleared: () => void;
}

export interface BattleApi {
  phase: BattlePhase;
  challenge: ResolvedChallenge | null;
  hp: number;
  maxHp: number;
  roundsWon: number;
  defeated: boolean;
  monsterState: MonsterState;
  wizardState: WizardBattleState;
  wrongPicks: string[];
  pickedCorrect: string | null;
  hint: string | null;
  hintLoading: boolean;
  hintLevel: number;
  round: { current: number; total: number };
  pick: (choiceId: string) => void;
  askHint: () => void;
  proceed: () => void;
}

/**
 * One battle session: a monster with `maxHp` is defeated by answering `maxHp`
 * rounds correctly (Battle Style A). Each round draws an AI-personalized
 * question when available and falls back to the hand-written bank. Every answer
 * strengthens the shared learner-model signals and the tower's own stats.
 */
export default function useBattle({ floor, boss, maxHp, rounds, onCleared }: UseBattleArgs): BattleApi {
  const [roundsWon, setRoundsWon] = useState(0);
  const [phase, setPhase] = useState<BattlePhase>("loading");
  const [challenge, setChallenge] = useState<ResolvedChallenge | null>(null);
  const [wrongPicks, setWrongPicks] = useState<string[]>([]);
  const [pickedCorrect, setPickedCorrect] = useState<string | null>(null);
  const [monsterState, setMonsterState] = useState<MonsterState>("idle");
  const [wizardState, setWizardState] = useState<WizardBattleState>("ready");
  const [hint, setHint] = useState<string | null>(null);
  const [hintLoading, setHintLoading] = useState(false);
  const [hintLevel, setHintLevel] = useState(0);

  const usedIds = useRef<string[]>([]);
  const seedRef = useRef(floor * 13 + 1);
  const timers = useRef<number[]>([]);
  const started = useRef(false);

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach((t) => clearTimeout(t));
  }, []);

  const loadRound = useCallback(
    async (index: number) => {
      const spec = rounds[Math.min(index, rounds.length - 1)];
      setPhase("loading");
      setChallenge(null);
      setWrongPicks([]);
      setPickedCorrect(null);
      setHint(null);
      setHintLevel(0);
      setMonsterState("idle");
      setWizardState("ready");

      const sig = getConceptSignal(spec.concept);
      const misconception = sig?.misconceptions[sig.misconceptions.length - 1]?.text;
      const prereq = CONCEPT_PREREQ[spec.concept];

      // Try AI personalization first (grounded in concept, kind, difficulty, floor).
      try {
        const res = await fetch("/api/ai/practice", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            topic: `${spec.conceptLabel} — ${KIND_LABEL[spec.kind]} (Wizard Tower floor ${floor}${boss ? ", boss" : ""}, ${spec.difficulty})`,
            concept: spec.conceptLabel,
            conceptTag: spec.concept,
            prerequisite: prereq ? CONCEPT_LABEL[prereq] : undefined,
            misconception,
          }),
        });
        const data = (await res.json().catch(() => null)) as { practice?: PracticeQuestion } | null;
        if (res.ok && data?.practice) {
          setChallenge({
            concept: spec.concept,
            kind: spec.kind,
            difficulty: data.practice.difficulty,
            prompt: data.practice.prompt,
            choices: data.practice.choices,
            correctChoiceId: data.practice.correctChoiceId,
            explanation: data.practice.explanation,
            misconception: data.practice.misconception ?? misconception,
            usedAI: true,
          });
          setPhase("question");
          return;
        }
      } catch {
        // fall through to the bank
      }

      const bank = selectChallenge({
        concept: spec.concept,
        kind: spec.kind,
        difficulty: spec.difficulty,
        seed: (seedRef.current += 1),
        excludeIds: usedIds.current,
      });
      usedIds.current.push(bank.id);
      setChallenge({
        concept: spec.concept,
        kind: bank.kind,
        difficulty: bank.difficulty,
        prompt: bank.prompt,
        choices: bank.choices,
        correctChoiceId: bank.correctChoiceId,
        explanation: bank.explanation,
        misconception: bank.misconception,
        visual: bank.visual,
        hintLadder: bank.hintLadder,
        usedAI: false,
      });
      setPhase("question");
    },
    [rounds, floor, boss]
  );

  // Kick off the first round once (guarded against StrictMode double-invoke).
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    void loadRound(0);
  }, [loadRound]);

  const pick = useCallback(
    (choiceId: string) => {
      if (phase !== "question" || !challenge) return;
      const correct = choiceId === challenge.correctChoiceId;

      if (correct) {
        recordConceptResult(challenge.concept, true, { hints: wrongPicks.length });
        recordTowerBattle(floor, challenge.concept, true);
        const won = roundsWon + 1;
        const last = won >= maxHp;
        setRoundsWon(won);
        setPickedCorrect(choiceId);
        setPhase("resolved");
        setWizardState("cast");
        setMonsterState(last ? "defeated" : "hit");
        timers.current.push(
          window.setTimeout(() => {
            setWizardState(last ? "win" : "ready");
            if (!last) setMonsterState("idle");
          }, ANIM_MS)
        );
        return;
      }

      if (wrongPicks.includes(choiceId)) return;
      setWrongPicks((w) => [...w, choiceId]);
      recordConceptResult(challenge.concept, false, { misconception: challenge.misconception });
      recordTowerBattle(floor, challenge.concept, false);
      setMonsterState("attack");
      setWizardState("hurt");
      timers.current.push(
        window.setTimeout(() => {
          setMonsterState("idle");
          setWizardState("ready");
        }, ANIM_MS)
      );
    },
    [phase, challenge, wrongPicks, roundsWon, maxHp, floor]
  );

  const proceed = useCallback(() => {
    if (phase !== "resolved") return;
    if (roundsWon >= maxHp) {
      setPhase("cleared");
      onCleared();
      return;
    }
    void loadRound(roundsWon);
  }, [phase, roundsWon, maxHp, onCleared, loadRound]);

  const askHint = useCallback(async () => {
    if (hintLoading || !challenge) return;
    setHintLoading(true);
    const level = Math.max(1, Math.min(4, wrongPicks.length || 1));
    setHintLevel(level);
    const correctLabel = challenge.choices.find((c) => c.id === challenge.correctChoiceId)?.label;
    try {
      const res = await fetch("/api/ai/hint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lessonTitle: CONCEPT_LABEL[challenge.concept],
          prompt: challenge.prompt,
          conceptTag: challenge.concept,
          correctAnswer: correctLabel,
          feedback: challenge.explanation,
          level,
        }),
      });
      const data = (await res.json().catch(() => null)) as { hint?: string } | null;
      const fallback = challenge.hintLadder?.[level - 1] ?? genericHint(level);
      setHint(res.ok && data?.hint ? data.hint : fallback);
    } catch {
      setHint(challenge.hintLadder?.[level - 1] ?? genericHint(level));
    } finally {
      setHintLoading(false);
    }
  }, [hintLoading, challenge, wrongPicks.length]);

  return {
    phase,
    challenge,
    hp: maxHp - roundsWon,
    maxHp,
    roundsWon,
    defeated: roundsWon >= maxHp,
    monsterState,
    wizardState,
    wrongPicks,
    pickedCorrect,
    hint,
    hintLoading,
    hintLevel,
    round: { current: Math.min(roundsWon + 1, maxHp), total: maxHp },
    pick,
    askHint,
    proceed,
  };
}
