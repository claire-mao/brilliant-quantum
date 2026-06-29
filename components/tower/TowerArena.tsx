"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { PracticeQuestion } from "@/lib/ai/validators";
import MathText from "@/components/MathText";
import { useAuth } from "@/lib/auth-context";
import { playSound } from "@/lib/sound/sounds";
import { CONCEPT_LABEL, CONCEPT_PREREQ, CONCEPTS, type ConceptTag } from "@/lib/learning/concepts";
import { getConceptSignal, recordConceptResult } from "@/lib/learning/signals";
import { getRetrievalForConcept } from "@/lib/learning/retrieval";
import { shouldRevealAnswer, getCorrectHeadline } from "@/lib/learning/progressive-feedback";
import ProgressiveFeedbackPanel from "@/components/ProgressiveFeedbackPanel";
import { logFallbackUsed, verifyTowerQuestion } from "@/lib/tower/verify";
import { monsterForConcept, type Monster } from "@/lib/tower/encounters";
import { climateForFloor, climateSceneTokens, projectileColorForConcept } from "@/lib/tower/climates";
import {
  damagePerCorrect,
  enemyMaxHp,
  energyLostOnWrong,
  questionsInBattle,
  WIZARD_MAX_ENERGY,
  CORRECT_ENERGY_GAIN,
  EXPLANATION_ENERGY_COST,
} from "@/lib/tower/battle";
import { kindForChamber } from "@/lib/tower/chamber-kinds";
import {
  pickConceptForFloor,
  floorTitle,
  floorUnlockMessage,
  highestUnlockedFloor,
  isFloorUnlocked,
  slotsOnFloor,
  TOTAL_FLOORS,
} from "@/lib/tower/floor-plan";
import {
  CHAMBER_META,
  chamberInfoForPosition,
  defaultProgress,
  loadProgress,
  markChamberCleared,
  resetProgress,
  saveProgress,
  withPosition,
  isChamberCleared,
  type ChamberType,
  type TowerProgress,
} from "@/lib/tower/progression";
import { getChallenge } from "@/lib/tower/arena-challenges";
import { getLearnerConceptProfile, getMisconceptionSignals, getNeedsReviewItem, getRecommendedReview, isConceptNeedsReview } from "@/lib/learning/learner-model";
import { MonsterAvatar, EveBoss, DefeatSparkles, type MonsterFx } from "./dungeon-monsters";
import TowerChallenge, { type ActiveChallenge, type ResolveOpts } from "./TowerChallenge";
import FloorMap from "./FloorMap";
import { BossBreakthroughTransition, ClimbTransition, GameOverTransition, LeaveTransition } from "./TowerTransitions";
import DungeonScene from "./DungeonScene";
import TowerGate from "./TowerGate";
import TowerIntro, { hasSeenTowerIntro } from "./TowerIntro";
import { Alice, Bob, type HeroState, type BobState } from "./heroes";
import {
  isQuestionBlocked,
  isPromptBlocked,
  normalizePrompt,
  questionIdForLocal,
  questionIdForMcq,
  recentQuestionPrompts,
  recordQuestionUsed,
  clearQuestionHistory,
  excludeIdsForSelection,
} from "@/lib/tower/question-history";
import {
  buildTowerHintPayload,
  sanitizeTowerHint,
  towerHintFallback,
} from "@/lib/tower/hints";

type Phase = "loading" | "question" | "victory" | "fizzled" | "game-over";

interface BattleState {
  questionIndex: number;
  questionTotal: number;
  enemyHp: number;
  enemyMax: number;
  damage: number;
  isReplay: boolean;
}

import { useReducedMotion } from "@/hooks/useReducedMotion";

function initBattle(floor: number, chamber: number, bossSeed: number, replay: boolean): BattleState {
  const questionTotal = questionsInBattle(floor, chamber, bossSeed);
  const enemyMax = enemyMaxHp(floor, questionTotal);
  return {
    questionIndex: 0,
    questionTotal,
    enemyHp: enemyMax,
    enemyMax,
    damage: damagePerCorrect(enemyMax, questionTotal),
    isReplay: replay,
  };
}

function parseReviewTarget(raw: string | null): ConceptTag | undefined {
  if (!raw) return undefined;
  return CONCEPTS.includes(raw as ConceptTag) ? (raw as ConceptTag) : undefined;
}

/**
 * Wizard Tower arena: seven floors of retrieval practice with battle UI,
 * progressive feedback, floor map travel, and local progress persistence.
 * Reads learner profile for unlock gates and concept selection.
 */
export default function TowerArena() {
  const { profile } = useAuth();
  const reduce = useReducedMotion();
  const router = useRouter();
  const searchParams = useSearchParams();
  const reviewFromUrl = parseReviewTarget(searchParams.get("review"));

  const [progress, setProgress] = useState<TowerProgress>(() => defaultProgress());
  const [showIntro, setShowIntro] = useState(false);
  const [introReady, setIntroReady] = useState(false);
  const [entered, setEntered] = useState(false);

  const floor = progress.floor;
  const chamber = progress.chamber;
  const chamberInfo = chamberInfoForPosition(floor, chamber, progress.bossSeed);

  const [currentConceptTag, setCurrentConceptTag] = useState<ConceptTag>("qubits");
  const concept = currentConceptTag;
  const conceptLabel = CONCEPT_LABEL[concept];
  const monster: Monster = monsterForConcept(concept);
  const climate = climateForFloor(floor);
  const scene = climateSceneTokens(climate);
  const projColor = projectileColorForConcept(concept);
  const isBoss = chamberInfo.isBoss;
  const slotsTotal = slotsOnFloor(floor, progress.bossSeed);

  const [phase, setPhase] = useState<Phase>("loading");
  const [active, setActive] = useState<ActiveChallenge | null>(null);
  const [loadKey, setLoadKey] = useState(0);
  const [lastExplanation, setLastExplanation] = useState<string>("");
  const [wrongInEncounter, setWrongInEncounter] = useState(0);
  const [showExplanationRequested, setShowExplanationRequested] = useState(false);
  const [explanationSkipped, setExplanationSkipped] = useState(false);
  const [hint, setHint] = useState<string | null>(null);
  const [hintLoading, setHintLoading] = useState(false);
  const [lastWrongChoice, setLastWrongChoice] = useState<string | null>(null);
  const [reviewReason, setReviewReason] = useState<string | undefined>();
  const [activeMisconception, setActiveMisconception] = useState<string | undefined>();
  const [questionLocked, setQuestionLocked] = useState(false);
  const [isReviewQuestion, setIsReviewQuestion] = useState(false);

  const reviewTargetRef = useRef<ConceptTag | undefined>(reviewFromUrl);
  const reviewCursorRef = useRef(0);
  const sessionKeyRef = useRef("");
  /** Concept (and thus monster) locked for the current chamber — all strikes share one enemy. */
  const chamberConceptRef = useRef<ConceptTag>("qubits");

  const [aliceState, setAliceState] = useState<HeroState>("idle");
  const [bobState, setBobState] = useState<BobState>("idle");
  const [monsterState, setMonsterState] = useState<MonsterFx>("idle");
  const [projectile, setProjectile] = useState<{ on: boolean; key: number }>({ on: false, key: 0 });
  const [missile, setMissile] = useState<{ on: boolean; key: number }>({ on: false, key: 0 });
  const [darkPulse, setDarkPulse] = useState(false);
  const [monsterGlitch, setMonsterGlitch] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [focus, setFocus] = useState(WIZARD_MAX_ENERGY);
  const [battle, setBattle] = useState<BattleState>(() =>
    initBattle(1, 0, 1, false)
  );

  const [showMap, setShowMap] = useState(false);
  const [climbing, setClimbing] = useState<{ toFloor: number } | null>(null);
  const [bossBreakthrough, setBossBreakthrough] = useState(false);
  const [leaving, setLeaving] = useState(false);

  const seedRef = useRef(0);
  const startedRef = useRef(false);
  const projKeyRef = useRef(0);
  const strikeRef = useRef(0);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach((t) => clearTimeout(t));
  }, []);

  const later = useCallback((fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  }, []);

  const clearPendingTimers = useCallback(() => {
    timers.current.forEach((t) => clearTimeout(t));
    timers.current = [];
  }, []);

  const pickTagForQuestion = useCallback(
    (targetFloor: number, targetChamber: number, strike: number): ConceptTag => {
      const info = chamberInfoForPosition(targetFloor, targetChamber, progress.bossSeed);
      const target = reviewTargetRef.current;
      const tag = pickConceptForFloor(targetFloor, targetChamber, profile, info.globalIndex + strike, {
        targetConcept: target,
        reviewCursor: reviewCursorRef.current + strike,
      });
      if (target) {
        reviewTargetRef.current = undefined;
        if (reviewFromUrl) {
          router.replace("/tower", { scroll: false });
        }
      } else {
        reviewCursorRef.current += 1;
      }
      return tag;
    },
    [profile, progress.bossSeed, reviewFromUrl, router]
  );

  const loadChallenge = useCallback(
    async (
      tag: ConceptTag,
      type: ChamberType,
      strike: number,
      targetFloor: number,
      targetChamber: number,
      roomLabel: string
    ) => {
      setPhase("loading");
      setQuestionLocked(false);
      setHint(null);
      setLastWrongChoice(null);
      setActiveMisconception(undefined);
      setWrongInEncounter(0);
      setShowExplanationRequested(false);
      setExplanationSkipped(false);
      setAliceState("idle");
      setBobState("idle");
      setMonsterState("idle");
      setMonsterGlitch(false);
      setLoadKey((k) => k + 1);
      setCurrentConceptTag(tag);
      setIsReviewQuestion(isConceptNeedsReview(profile, tag));
      const reviewItem = getNeedsReviewItem(profile, tag);
      setReviewReason(reviewItem?.reason);

      const kind = kindForChamber(type, strike);
      const exclude = excludeIdsForSelection(targetFloor, targetChamber);
      const avoidPrompts = recentQuestionPrompts();

      if (kind !== "mcq") {
        for (let attempt = 0; attempt < 8; attempt++) {
          const challenge = getChallenge(kind, tag, seedRef.current + attempt + strike, exclude);
          const prompt = normalizePrompt(challenge.prompt);
          if (!isPromptBlocked(prompt, targetFloor, targetChamber)) {
            seedRef.current += attempt + 1;
            recordQuestionUsed(targetFloor, questionIdForLocal(challenge, tag, kind), prompt, targetChamber);
            setActive({ kind: "local", challenge });
            setPhase("question");
            return;
          }
        }
        const fallback = getChallenge(kind, tag, seedRef.current + strike, exclude);
        seedRef.current += 1;
        recordQuestionUsed(
          targetFloor,
          questionIdForLocal(fallback, tag, kind),
          normalizePrompt(fallback.prompt),
          targetChamber
        );
        setActive({ kind: "local", challenge: fallback });
        setPhase("question");
        return;
      }

      const prereq = CONCEPT_PREREQ[tag];
      const sig = getConceptSignal(tag);
      const misconception = sig?.misconceptions[sig.misconceptions.length - 1]?.text;
      const profiles = getLearnerConceptProfile(profile);
      const masteredConcepts = profiles.filter((p) => p.status === "mastered").map((p) => p.label);
      const dueConcepts = getRecommendedReview(profile).map((r) => r.label);
      const learnerMisconceptions = getMisconceptionSignals()
        .flatMap((m) => m.notes.map((n) => n.text))
        .slice(0, 6);
      const recentWrongPattern =
        misconception ??
        (sig?.lastResult === "wrong" ? `Recent miss on ${CONCEPT_LABEL[tag]}` : undefined);

      for (let attempt = 0; attempt < 5; attempt++) {
        try {
          const res = await fetch("/api/ai/practice", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              forTower: true,
              topic: CONCEPT_LABEL[tag],
              concept: CONCEPT_LABEL[tag],
              conceptTag: tag,
              prerequisite: prereq ? CONCEPT_LABEL[prereq] : undefined,
              misconception,
              recentPrompts: avoidPrompts,
              floor: targetFloor,
              roomType: roomLabel,
              interactionKind: kind,
              difficulty: attempt >= 2 ? "hard" : attempt >= 1 ? "medium" : "easy",
              masteredConcepts,
              dueConcepts,
              learnerMisconceptions,
              reviewReason: reviewItem?.reason,
              unitTitle: reviewItem?.unitTitle,
              lessonTitle: reviewItem?.lessonTitle,
              recentWrongPattern,
            }),
          });
          const data = (await res.json().catch(() => null)) as { practice?: PracticeQuestion } | null;
          if (res.ok && data?.practice) {
            const verified = verifyTowerQuestion(data.practice, {
              expectedConceptTag: tag,
              source: "ai",
              recentPrompts: avoidPrompts,
            });
            if (verified) {
              const qid = questionIdForMcq(verified.question);
              const prompt = normalizePrompt(verified.question.prompt);
              if (!isQuestionBlocked(qid, targetFloor, targetChamber) && !isPromptBlocked(prompt, targetFloor, targetChamber)) {
                recordQuestionUsed(targetFloor, qid, prompt, targetChamber);
                setActive({ kind: "mcq", question: verified.question, usedAI: true });
                setPhase("question");
                return;
              }
            }
          }
        } catch {
          break;
        }
      }

      const fallback = getRetrievalForConcept(tag, seedRef.current + strike, exclude, avoidPrompts);
      seedRef.current += 1;
      if (fallback) {
        const verified = verifyTowerQuestion(fallback, {
          expectedConceptTag: tag,
          source: "fallback",
          recentPrompts: avoidPrompts,
        });
        if (verified) {
          const prompt = normalizePrompt(fallback.prompt);
          if (!isPromptBlocked(prompt, targetFloor, targetChamber)) {
            logFallbackUsed(tag, fallback.questionId);
            recordQuestionUsed(targetFloor, questionIdForMcq(fallback), prompt, targetChamber);
            setActive({ kind: "mcq", question: verified.question, usedAI: false });
            setPhase("question");
            return;
          }
        }
      }

      setActive(null);
      setPhase("fizzled");
    },
    [profile]
  );

  const beginRoom = useCallback(
    (p: TowerProgress, replay = false, resetEnergy = false) => {
      if (!isFloorUnlocked(p.floor, p, profile)) {
        const allowed = highestUnlockedFloor(p, profile);
        const clamped = withPosition(p, allowed, 0);
        saveProgress(clamped);
        setProgress(clamped);
        p = clamped;
      }
      clearPendingTimers();
      const info = chamberInfoForPosition(p.floor, p.chamber, p.bossSeed);
      sessionKeyRef.current = `tower:${p.floor}-${p.chamber}-${Date.now()}`;
      const tag = pickTagForQuestion(p.floor, p.chamber, 0);
      chamberConceptRef.current = tag;
      const alreadyCleared = isChamberCleared(p, p.floor, p.chamber);
      const isReplay = replay || alreadyCleared;
      strikeRef.current = 0;
      if (resetEnergy) {
        setFocus(WIZARD_MAX_ENERGY);
      }
      setBattle(initBattle(p.floor, p.chamber, p.bossSeed, isReplay));
      void loadChallenge(tag, info.type, 0, p.floor, p.chamber, CHAMBER_META[info.type].name);
    },
    [clearPendingTimers, loadChallenge, pickTagForQuestion, profile]
  );

  useEffect(() => {
    if (!startedRef.current) return;
    if (isFloorUnlocked(progress.floor, progress, profile)) return;
    const clamped = withPosition(progress, highestUnlockedFloor(progress, profile), 0);
    saveProgress(clamped);
    queueMicrotask(() => beginRoom(clamped));
    // Re-clamp when auth profile loads so unit completion gates apply.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- profile-driven unlock only
  }, [profile, beginRoom]);

  useEffect(() => {
    if (reviewFromUrl) {
      reviewTargetRef.current = reviewFromUrl;
    }
  }, [reviewFromUrl]);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    setShowIntro(!hasSeenTowerIntro());
    setIntroReady(true);
    const saved = loadProgress() ?? defaultProgress();
    setProgress(saved);
    beginRoom(saved);
  }, [beginRoom]);

  function loadNextQuestionInBattle(nextIndex: number) {
    strikeRef.current = nextIndex;
    const info = chamberInfoForPosition(floor, chamber, progress.bossSeed);
    const tag = chamberConceptRef.current;
    setQuestionLocked(false);
    setWrongInEncounter(0);
    setShowExplanationRequested(false);
    setExplanationSkipped(false);
    setBattle((b) => ({ ...b, questionIndex: nextIndex }));
    void loadChallenge(tag, info.type, nextIndex, floor, chamber, CHAMBER_META[info.type].name);
  }

  function continueAfterExplanation() {
    if (!explanationSkipped) return;

    setExplanationSkipped(false);

    if (focus <= 0) {
      setPhase("game-over");
      return;
    }

    const nextIndex = battle.questionIndex + 1;
    if (nextIndex >= battle.questionTotal) {
      setPhase("victory");
      return;
    }

    loadNextQuestionInBattle(nextIndex);
  }

  function requestExplanation() {
    if (explanationSkipped || questionLocked || phase !== "question" || !active) return;
    if (!window.confirm("Are you sure? You will lose 10 energy.")) return;

    const nextEnergy = Math.max(0, focus - EXPLANATION_ENERGY_COST);
    setFocus(nextEnergy);
    setExplanationSkipped(true);
    setShowExplanationRequested(true);
  }

  function continueAfterCorrect() {
    if (!questionLocked) return;

    const nextIndex = battle.questionIndex + 1;
    const chamberComplete = battle.enemyHp <= 0 || nextIndex >= battle.questionTotal;

    if (chamberComplete) {
      setPhase("victory");
      return;
    }

    loadNextQuestionInBattle(nextIndex);
  }

  function resolveAnswer(correct: boolean, opts: ResolveOpts) {
    if (phase !== "question" || !active || questionLocked) return;

    if (correct) {
      setQuestionLocked(true);
      recordConceptResult(concept, true, {
        hints: wrongInEncounter,
        sessionKey: sessionKeyRef.current,
      });
      setLastExplanation(opts.explanation);
      playSound("correct");
      setAliceState("cast");
      setMonsterState("hit");
      if (!reduce) {
        projKeyRef.current += 1;
        setProjectile({ on: true, key: projKeyRef.current });
        later(() => setProjectile((p) => ({ ...p, on: false })), 640);
      }
      setToast(wrongInEncounter > 0 ? "Correct after a wrong try." : "Correct.");
      later(() => setToast(null), 1500);
      setFocus((f) => Math.min(WIZARD_MAX_ENERGY, f + CORRECT_ENERGY_GAIN));

      const nextHp = Math.max(0, battle.enemyHp - battle.damage);
      setBattle((b) => ({ ...b, enemyHp: nextHp }));

      if (nextHp <= 0) {
        playSound("defeat");
        setMonsterGlitch(true);
        setAliceState("victory");
        later(() => setMonsterGlitch(false), reduce ? 0 : 520);
        if (!battle.isReplay) {
          setProgress((prev) => {
            const next = markChamberCleared(prev, floor, chamber);
            saveProgress(next);
            return next;
          });
        }
        return;
      }

      playSound("defeat");
      setMonsterGlitch(true);
      later(() => setMonsterGlitch(false), reduce ? 0 : 520);
      later(() => setAliceState("idle"), reduce ? 0 : 400);

      const nextIndex = battle.questionIndex + 1;
      if (nextIndex >= battle.questionTotal) {
        setAliceState("victory");
        if (!battle.isReplay) {
          setProgress((prev) => {
            const next = markChamberCleared(prev, floor, chamber);
            saveProgress(next);
            return next;
          });
        }
      }
    } else {
      recordConceptResult(concept, false, { misconception: opts.misconception });
      if (opts.selectedWrong) setLastWrongChoice(opts.selectedWrong);
      if (opts.misconception) setActiveMisconception(opts.misconception);
      playSound("wrong");
      setWrongInEncounter((w) => w + 1);
      setAliceState("cast");
      if (!reduce) {
        projKeyRef.current += 1;
        setMissile({ on: true, key: projKeyRef.current });
        later(() => setMissile((p) => ({ ...p, on: false })), 640);
      }
      later(() => setMonsterState("hit"), reduce ? 0 : 280);
      later(() => {
        setMonsterState("attack");
        setAliceState("hit");
        setBobState("block");
      }, reduce ? 80 : 420);
      later(() => {
        setAliceState("idle");
        setBobState("idle");
        setMonsterState("idle");
      }, reduce ? 200 : 900);
      if (!reduce) {
        later(() => {
          setDarkPulse(true);
          later(() => setDarkPulse(false), 620);
        }, 480);
      }
      setFocus((f) => {
        const next = Math.max(0, f - energyLostOnWrong(floor));
        if (next <= 0) {
          later(() => setPhase("game-over"), reduce ? 60 : 700);
        }
        return next;
      });
    }
  }

  function nextEncounter() {
    const nextChamber = chamber + 1;
    if (nextChamber < slotsTotal) {
      setProgress((prev) => {
        const next = withPosition(prev, floor, nextChamber);
        saveProgress(next);
        beginRoom(next);
        return next;
      });
      return;
    }

    if (floor >= TOTAL_FLOORS) {
      setBossBreakthrough(true);
      return;
    }

    const nextFloor = floor + 1;
    if (!isFloorUnlocked(nextFloor, progress, profile)) {
      setToast(floorUnlockMessage(nextFloor, profile, progress));
      later(() => setToast(null), 3500);
      return;
    }
    setProgress((prev) => {
      const next = withPosition(prev, nextFloor, 0);
      saveProgress(next);
      return next;
    });
    setClimbing({ toFloor: nextFloor });
  }

  function onClimbDone() {
    if (!climbing) return;
    const targetFloor = climbing.toFloor;
    setClimbing(null);
    setProgress((prev) => {
      const next = withPosition(prev, targetFloor, 0);
      saveProgress(next);
      beginRoom(next);
      return next;
    });
  }

  function reloadRoom() {
    strikeRef.current += 1;
    const info = chamberInfoForPosition(floor, chamber, progress.bossSeed);
    const tag = chamberConceptRef.current;
    void loadChallenge(tag, info.type, strikeRef.current, floor, chamber, CHAMBER_META[info.type].name);
  }

  function travelToFloor(targetFloor: number) {
    if (!isFloorUnlocked(targetFloor, progress, profile)) {
      setToast(floorUnlockMessage(targetFloor, profile, progress));
      later(() => setToast(null), 3500);
      return;
    }
    const targetChamber = Math.min(
      slotsOnFloor(targetFloor, progress.bossSeed) - 1,
      progress.chamberByFloor[targetFloor] ?? 0
    );
    travelToChamber(targetFloor, targetChamber, false);
  }

  function travelToChamber(targetFloor: number, targetChamber: number, replay = true) {
    if (!isFloorUnlocked(targetFloor, progress, profile)) {
      setToast(floorUnlockMessage(targetFloor, profile, progress));
      later(() => setToast(null), 3500);
      return;
    }
    setProgress((prev) => {
      const next = withPosition(prev, targetFloor, targetChamber);
      saveProgress(next);
      beginRoom(next, replay);
      return next;
    });
    setShowMap(false);
  }

  function tryAgainAfterGameOver() {
    setPhase("loading");
    setEntered(false);
    setShowMap(false);
    beginRoom(progress, battle.isReplay, true);
  }

  function goDashboardFromGameOver() {
    router.push("/dashboard");
  }

  function resetTower() {
    resetProgress();
    clearQuestionHistory();
    const fresh = defaultProgress();
    saveProgress(fresh);
    setProgress(fresh);
    setShowMap(false);
    setBossBreakthrough(false);
    beginRoom(fresh, false, true);
  }

  function leaveTower() {
    setLeaving(true);
  }

  function replayIntro() {
    setShowMap(false);
    setShowIntro(true);
  }

  async function askGuide() {
    if (hintLoading || !active) return;
    setHintLoading(true);
    setBobState("support");
    later(() => setBobState("idle"), 1400);
    const level = Math.max(1, Math.min(4, wrongInEncounter));
    const hintInput = {
      conceptTag: concept,
      level,
      wrongCount: wrongInEncounter,
      active,
      selectedWrong: lastWrongChoice,
      reviewReason,
      misconception: activeMisconception,
    };

    try {
      const res = await fetch("/api/ai/hint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildTowerHintPayload(hintInput)),
      });
      const data = (await res.json().catch(() => null)) as { hint?: string } | null;
      const raw = res.ok && data?.hint ? data.hint : "";
      setHint(sanitizeTowerHint(raw, hintInput));
    } catch {
      setHint(towerHintFallback(hintInput));
    } finally {
      setHintLoading(false);
    }
  }

  const defeated = phase === "victory" || (questionLocked && battle.enemyHp <= 0);
  const revealAnswer =
    explanationSkipped ||
    shouldRevealAnswer(wrongInEncounter, showExplanationRequested, questionLocked, {
      reviewMode: isReviewQuestion,
    });
  const inputsLocked = questionLocked || explanationSkipped;
  const enraged = isBoss && !defeated && wrongInEncounter >= 1;
  const enemyName = isBoss ? "Eve, the Observer" : monster.name;
  const nextChamberExists = chamber + 1 < slotsTotal;
  const nextFloorExists = floor < TOTAL_FLOORS;
  const isFinalBoss = isBoss && floor >= TOTAL_FLOORS;
  const showNext = nextChamberExists || nextFloorExists || isFinalBoss;
  const slotLabel = isBoss ? "Boss" : "Chamber";

  const activePrompt = active
    ? active.kind === "mcq"
      ? active.question.prompt
      : active.challenge.prompt
    : "";

  return (
    <div className="font-arcane relative flex min-h-0 flex-1 flex-col bg-[radial-gradient(120%_120%_at_50%_-10%,#0c1430_0%,#070a12_55%,#04060c_100%)] text-slate-100">
      {leaving && <LeaveTransition reduce={reduce} onDone={() => router.push("/dashboard")} />}
      {climbing && (
        <ClimbTransition
          toFloor={climbing.toFloor}
          climate={climateForFloor(climbing.toFloor)}
          reduce={reduce}
          onDone={onClimbDone}
        />
      )}
      {bossBreakthrough && (
        <BossBreakthroughTransition reduce={reduce} onDone={() => setBossBreakthrough(false)} />
      )}
      {phase === "game-over" && (
        <GameOverTransition
          reduce={reduce}
          onTryAgain={tryAgainAfterGameOver}
          onDashboard={goDashboardFromGameOver}
        />
      )}

      {introReady && showIntro ? (
        <TowerIntro reduce={reduce} onComplete={() => setShowIntro(false)} />
      ) : !entered ? (
        <div className="relative flex min-h-0 flex-1 flex-col">
          <TowerGate
            canEnter={() => {
              if (isFloorUnlocked(1, progress, profile)) return true;
              setToast(floorUnlockMessage(1, profile, progress));
              later(() => setToast(null), 3500);
              return false;
            }}
            onEnter={() => {
              setFocus(WIZARD_MAX_ENERGY);
              setEntered(true);
            }}
            reduce={reduce}
          />
          {!isFloorUnlocked(1, progress, profile) && (
            <div className="pointer-events-none absolute inset-x-4 top-24 z-30 mx-auto max-w-md rounded-xl border border-amber-400/35 bg-black/75 px-4 py-3 text-center text-sm text-amber-100 shadow-lg backdrop-blur-sm">
              {floorUnlockMessage(1, profile, progress)}
            </div>
          )}
          <div className="absolute bottom-6 left-1/2 z-20 -translate-x-1/2">
            <button
              type="button"
              onClick={replayIntro}
              className="rounded-lg border border-white/15 bg-black/40 px-3 py-1.5 text-xs font-medium text-slate-300 backdrop-blur-sm transition-colors hover:bg-white/10 hover:text-slate-100"
            >
              Replay story
            </button>
          </div>
        </div>
      ) : (
        <main className="mx-auto w-full max-w-[1100px] px-4 py-6 pb-32 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-cyan-50">The Tower</h1>
              <p className="mt-1 text-sm text-slate-300">
                Floor {floor}: {floorTitle(floor)}
              </p>
            </div>
            <div className="flex w-full shrink-0 flex-wrap gap-2 sm:w-auto">
              <button
                type="button"
                onClick={() => setShowMap(true)}
                className="min-h-11 flex-1 rounded-lg border border-cyan-300/30 bg-cyan-400/10 px-3 py-2 text-sm font-semibold text-cyan-200 transition-colors hover:bg-cyan-400/20 sm:flex-none"
              >
                Tower Map
              </button>
              <button
                type="button"
                onClick={leaveTower}
                className="min-h-11 flex-1 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm font-medium text-slate-200 transition-colors hover:bg-white/10 sm:flex-none"
              >
                Leave tower
              </button>
            </div>
          </div>

          <section className="relative mt-6 min-h-[300px] overflow-hidden rounded-3xl border border-white/10 sm:min-h-[360px]">
            <DungeonScene climate={climate} />

            <span
              className="pointer-events-none absolute left-4 top-3 z-10 rounded-md bg-black/40 px-2 py-1 text-[10px] font-semibold uppercase tracking-widest"
              style={{ color: scene.accent }}
            >
              Floor {floor}: {floorTitle(floor)}
            </span>
            {isBoss && (
              <span className="pointer-events-none absolute right-4 top-3 z-10 rounded-md border border-rose-300/40 bg-rose-500/15 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-rose-200">
                Boss
              </span>
            )}

            <div className="relative z-10 flex min-h-[300px] items-end justify-between gap-2 px-4 pb-6 pt-14 sm:min-h-[360px] sm:px-10">
              <div className="flex flex-col items-center gap-2">
                <div className="flex items-end gap-0.5">
                  <Alice state={aliceState} wandGlow={projColor} reduce={reduce} className="h-28 w-auto sm:h-36" />
                  <Bob state={bobState} reduce={reduce} className="h-20 w-auto sm:h-24" />
                </div>
                <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: scene.accent }}>
                  Alice &amp; Bob
                </p>
                <FocusMeter value={focus} max={WIZARD_MAX_ENERGY} accent={scene.accent} label="Energy" />
              </div>

              <div className="flex flex-col items-center gap-2">
                <div className="relative">
                  {isBoss ? (
                    <EveBoss
                      defeated={defeated}
                      enraged={enraged}
                      glitch={monsterGlitch}
                      className="h-36 w-auto sm:h-52"
                    />
                  ) : (
                    <MonsterAvatar
                      type={monster.type}
                      state={monsterState}
                      defeated={defeated}
                      glitch={monsterGlitch}
                      accent={scene.accent}
                      className="h-28 w-28 sm:h-36 sm:w-36"
                    />
                  )}
                  {defeated && <DefeatSparkles big={isBoss} />}
                </div>
                <p className="text-sm font-bold text-white drop-shadow">{enemyName}</p>
                <EnemyHpMeter
                  key={`${floor}-${chamber}-${monster.type}`}
                  value={battle.enemyHp}
                  max={battle.enemyMax}
                  accent={scene.accent}
                  defeated={defeated}
                />
              </div>
            </div>

            {projectile.on && !reduce && (
              <span
                key={projectile.key}
                className="spell-bolt pointer-events-none absolute z-20 h-3 w-3 rounded-full"
                style={{
                  top: "52%",
                  background: projColor,
                  boxShadow: `0 0 12px 4px ${projColor}, 0 0 24px 8px ${projColor}55`,
                }}
                aria-hidden="true"
              />
            )}

            {missile.on && !reduce && (
              <span
                key={missile.key}
                className="spell-bolt spell-bolt-miss pointer-events-none absolute z-20 h-3 w-3 rounded-full"
                style={{
                  top: "48%",
                  background: "#f87171",
                  boxShadow: "0 0 10px 3px #f87171, 0 0 20px 6px rgba(248,113,113,0.45)",
                }}
                aria-hidden="true"
              />
            )}

            {darkPulse && !reduce && (
              <span className="dark-pulse pointer-events-none absolute inset-0 z-20" aria-hidden="true" />
            )}

            {toast && (
              <span className="battle-toast pointer-events-none absolute left-1/2 top-1/4 z-30 -translate-x-1/2 rounded-full border border-white/20 bg-black/60 px-3 py-1 text-xs font-semibold text-cyan-100">
                {toast}
              </span>
            )}
          </section>

          <section className="mt-5">
            {phase === "loading" && (
              <div className="rounded-2xl border border-cyan-300/20 bg-[#0e1424] p-6 text-center text-sm text-cyan-200">
                Loading question…
              </div>
            )}

            {phase === "fizzled" && (
              <div className="rounded-2xl border border-amber-400/30 bg-[#1a1408] p-6 text-center">
                <p className="text-base font-semibold text-amber-100">Could not load a question.</p>
                <p className="mt-2 text-sm text-amber-200/80">No verified question was available. Nothing was graded.</p>
                <button
                  type="button"
                  onClick={reloadRoom}
                  className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
                >
                  Try again
                </button>
              </div>
            )}

            {phase === "victory" ? (
              <VictoryPanel
                enemyName={enemyName}
                conceptLabel={conceptLabel}
                isBoss={isBoss}
                accent={scene.accent}
                nextLabel={
                  nextChamberExists
                    ? `Next ${slotLabel.toLowerCase()}`
                    : nextFloorExists
                      ? "Next floor"
                      : "Tower cleared"
                }
                showNext={showNext}
                onNext={nextEncounter}
              />
            ) : (
              active &&
              phase === "question" && (
                <div
                  key={`q-${floor}-${chamber}-${loadKey}`}
                  className="arena-card-enter rounded-2xl border-2 border-[#8a6a3a] bg-[#efe4c8] p-5 text-slate-900 shadow-[0_8px_30px_rgba(0,0,0,0.5)] sm:p-6"
                >
                  <p className="text-base leading-7 text-slate-900">
                    <MathText>{activePrompt}</MathText>
                  </p>

                  <TowerChallenge
                    key={`c-${floor}-${chamber}-${loadKey}`}
                    active={active}
                    locked={inputsLocked}
                    showCorrectAnswer={revealAnswer}
                    seed={loadKey + chamber}
                    accent="#92400e"
                    onResolve={resolveAnswer}
                  />

                  {(wrongInEncounter > 0 || explanationSkipped) && !questionLocked && (
                    <div className="mt-4 rounded-xl border border-[#cdb98c] bg-[#e6d8b4] px-4 py-3 text-sm leading-6 text-slate-800">
                      {active.kind === "mcq" ? (
                        <ProgressiveFeedbackPanel
                          isCorrect={false}
                          wrongCount={wrongInEncounter}
                          showExplanationRequested={showExplanationRequested}
                          onRequestExplanation={requestExplanation}
                          questionContext={{
                            conceptTag: concept,
                            fullExplanation: active.question.explanation,
                            correctAnswerLabel: active.question.choices.find(
                              (c) => c.id === active.question.correctChoiceId
                            )?.label,
                          }}
                          variant="tower"
                          reviewMode={isReviewQuestion}
                          onAskGuide={askGuide}
                          hintLoading={hintLoading}
                          hint={hint}
                          onContinueAfterExplanation={continueAfterExplanation}
                        />
                      ) : (
                        <>
                          <ProgressiveFeedbackPanel
                            isCorrect={false}
                            wrongCount={wrongInEncounter}
                            showExplanationRequested={showExplanationRequested}
                            onRequestExplanation={requestExplanation}
                            questionContext={{
                              conceptTag: concept,
                              fullExplanation: active.challenge.explanation,
                            }}
                            variant="tower"
                            reviewMode={isReviewQuestion}
                            onAskGuide={askGuide}
                            hintLoading={hintLoading}
                            hint={hint}
                            onContinueAfterExplanation={continueAfterExplanation}
                          />
                        </>
                      )}
                    </div>
                  )}

                  {questionLocked && (
                    <div className="mt-4 rounded-xl border border-emerald-700/30 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-900">
                      <p className="font-semibold">{getCorrectHeadline(wrongInEncounter, "tower")}</p>
                      <p className="mt-1">
                        <MathText>{lastExplanation}</MathText>
                      </p>
                      <button
                        type="button"
                        onClick={continueAfterCorrect}
                        className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
                      >
                        Continue
                      </button>
                    </div>
                  )}
                </div>
              )
            )}
          </section>
        </main>
      )}

      {entered && showMap && (
        <FloorMap
          progress={progress}
          currentFloor={floor}
          profile={profile}
          climateForFloor={climateForFloor}
          onTravel={travelToFloor}
          onTravelToChamber={travelToChamber}
          onLockedFloor={(_floor, message) => {
            setToast(message);
            later(() => setToast(null), 3500);
          }}
          onReset={resetTower}
          onClose={() => setShowMap(false)}
        />
      )}
    </div>
  );
}

function FocusMeter({
  value,
  max,
  accent,
  label = "Focus",
}: {
  value: number;
  max: number;
  accent: string;
  label?: string;
}) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className="w-32">
      <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-wide" style={{ color: accent }}>
        <span>{label}</span>
        <span className="tabular-nums">{Math.round(value)}</span>
      </div>
      <div className="mt-1 h-2.5 w-full overflow-hidden rounded-full border border-white/15 bg-black/40">
        <div
          className="h-full rounded-full transition-[width] duration-500"
          style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${accent}, #fff)`, boxShadow: `0 0 10px ${accent}` }}
        />
      </div>
    </div>
  );
}

function EnemyHpMeter({
  value,
  max,
  accent,
  defeated = false,
}: {
  value: number;
  max: number;
  accent: string;
  defeated?: boolean;
}) {
  if (defeated) {
    return (
      <div className="w-36" aria-hidden="true">
        <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-wide text-rose-200/50">
          <span>Enemy</span>
          <span className="tabular-nums">0</span>
        </div>
        <div className="mt-1 h-2 w-full overflow-hidden rounded-full border border-rose-300/20 bg-black/40" />
      </div>
    );
  }

  const pct = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;
  return (
    <div className="w-36">
      <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-wide text-rose-200">
        <span>Enemy</span>
        <span className="tabular-nums">{Math.max(0, Math.round(value))}</span>
      </div>
      <div className="mt-1 h-2 w-full overflow-hidden rounded-full border border-rose-300/30 bg-black/40">
        <div
          className="h-full rounded-full bg-gradient-to-r from-rose-600 to-rose-300 transition-[width] duration-500"
          style={{ width: `${pct}%`, boxShadow: `0 0 8px ${accent}` }}
        />
      </div>
    </div>
  );
}

function VictoryPanel({
  enemyName,
  conceptLabel,
  isBoss,
  accent,
  nextLabel,
  showNext,
  onNext,
}: {
  enemyName: string;
  conceptLabel: string;
  isBoss: boolean;
  accent: string;
  nextLabel: string;
  showNext: boolean;
  onNext: () => void;
}) {
  return (
    <div className="arena-victory relative overflow-hidden rounded-2xl border border-cyan-300/30 bg-[#0e1626] p-6 text-center">
      <span className="pointer-events-none absolute inset-0">
        <DefeatSparkles big={isBoss} />
      </span>
      <p className="relative text-lg font-bold" style={{ color: accent }}>
        {isBoss ? "Eve defeated" : "Chamber cleared"}
      </p>
      <p className="mt-1 text-sm text-slate-300">
        You beat {enemyName}. Reviewed {conceptLabel}.
      </p>

      <svg viewBox="0 0 80 40" className="mx-auto mt-3 h-10 w-24" shapeRendering="crispEdges" aria-hidden="true">
        <rect x="10" y="30" width="60" height="8" fill="#1e293b" />
        <rect x="20" y="22" width="50" height="8" fill="#243044" />
        <rect x="30" y="14" width="40" height="8" fill="#2b394f" />
        <rect x="40" y="6" width="30" height="8" fill="#33425b" />
        <rect x="40" y="2" width="30" height="4" fill={accent} opacity="0.5" className="dungeon-rune" />
      </svg>

      {showNext && (
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <button
            type="button"
            onClick={onNext}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
          >
            {nextLabel}
          </button>
        </div>
      )}
    </div>
  );
}
