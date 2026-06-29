"use client";

import { useState } from "react";
import MathText from "@/components/MathText";
import BlochSphere from "@/components/BlochSphere";
import type { PracticeQuestion } from "@/lib/ai/validators";
import {
  shuffledSteps,
  type LocalChallenge,
  type MistakeChallenge,
  type OrderChallenge,
  type SlotsChallenge,
  type BlochChallenge,
  type FillChallenge,
} from "@/lib/tower/challenges";

/** The active challenge: either an AI/fallback MCQ or a local graded interaction. */
export type ActiveChallenge =
  | { kind: "mcq"; question: PracticeQuestion; usedAI: boolean }
  | { kind: "local"; challenge: LocalChallenge };

export interface ResolveOpts {
  explanation: string;
  misconception?: string;
  /** Label of the wrong choice the learner just picked (for hint context). */
  selectedWrong?: string;
}

interface SharedProps {
  /** True only after a correct answer; inputs stay live on wrong tries. */
  locked: boolean;
  showCorrectAnswer: boolean;
  seed: number;
  accent: string;
  onResolve: (correct: boolean, opts: ResolveOpts) => void;
}

/**
 * Renders the interactive input for the active challenge. Wrong answers keep
 * choices clickable; the parent shows progressive feedback until correct.
 */
export default function TowerChallenge({
  active,
  locked,
  showCorrectAnswer,
  seed,
  accent,
  onResolve,
}: SharedProps & { active: ActiveChallenge }) {
  if (active.kind === "mcq") {
    return (
      <McqInput
        question={active.question}
        locked={locked}
        showCorrectAnswer={showCorrectAnswer}
        accent={accent}
        seed={seed}
        onResolve={onResolve}
      />
    );
  }
  const ch = active.challenge;
  switch (ch.kind) {
    case "order":
      return (
        <OrderInput
          challenge={ch}
          locked={locked}
          showCorrectAnswer={showCorrectAnswer}
          accent={accent}
          seed={seed}
          onResolve={onResolve}
        />
      );
    case "slots":
      return (
        <SlotsInput
          challenge={ch}
          locked={locked}
          showCorrectAnswer={showCorrectAnswer}
          accent={accent}
          seed={seed}
          onResolve={onResolve}
        />
      );
    case "mistake":
      return (
        <MistakeInput
          challenge={ch}
          locked={locked}
          showCorrectAnswer={showCorrectAnswer}
          accent={accent}
          seed={seed}
          onResolve={onResolve}
        />
      );
    case "explain":
      return (
        <ExplainInput
          challenge={ch}
          locked={locked}
          showCorrectAnswer={showCorrectAnswer}
          accent={accent}
          seed={seed}
          onResolve={onResolve}
        />
      );
    case "prediction":
    case "estimate":
    case "interference":
      return (
        <ExplainInput
          challenge={ch}
          locked={locked}
          showCorrectAnswer={showCorrectAnswer}
          accent={accent}
          seed={seed}
          onResolve={onResolve}
        />
      );
    case "match":
      return (
        <ExplainInput
          challenge={ch}
          locked={locked}
          showCorrectAnswer={showCorrectAnswer}
          accent={accent}
          seed={seed}
          onResolve={onResolve}
        />
      );
    case "bloch":
      return (
        <BlochInput
          challenge={ch}
          locked={locked}
          showCorrectAnswer={showCorrectAnswer}
          accent={accent}
          seed={seed}
          onResolve={onResolve}
        />
      );
    case "fill":
      return (
        <FillInput
          challenge={ch}
          locked={locked}
          showCorrectAnswer={showCorrectAnswer}
          accent={accent}
          seed={seed}
          onResolve={onResolve}
        />
      );
  }
}

/* --------------------------------- MCQ ---------------------------------- */
function McqInput({
  question,
  locked,
  showCorrectAnswer,
  onResolve,
}: SharedProps & { question: PracticeQuestion }) {
  const [wrongPicks, setWrongPicks] = useState<Set<string>>(() => new Set());
  const [correctPick, setCorrectPick] = useState<string | null>(null);

  return (
    <div className="mt-4 flex flex-col gap-2">
      {question.choices.map((choice) => {
        const isCorrect = choice.id === question.correctChoiceId;
        const wasWrong = wrongPicks.has(choice.id);
        const isCorrectPick = correctPick === choice.id;
        let tone = "border-[#b59a6a] bg-[#f6efdb] hover:border-amber-700 hover:bg-[#f1e6c8]";
        if (locked && showCorrectAnswer && isCorrect) tone = "border-emerald-600 bg-emerald-100";
        else if (wasWrong) tone = "border-rose-500 bg-rose-100";
        else if (locked && isCorrectPick) tone = "border-emerald-600 bg-emerald-100";
        return (
          <button
            key={choice.id}
            type="button"
            disabled={locked}
            onClick={() => {
              if (locked) return;
              if (isCorrect) {
                setCorrectPick(choice.id);
                onResolve(true, {
                  explanation: question.explanation,
                  misconception: question.misconception,
                });
              } else {
                setWrongPicks((prev) => new Set(prev).add(choice.id));
                onResolve(false, {
                  explanation: question.explanation,
                  misconception: question.misconception,
                  selectedWrong: choice.label,
                });
              }
            }}
            className={`rounded-xl border-2 px-4 py-3 text-left text-sm font-medium text-slate-900 transition-colors disabled:cursor-default ${tone}`}
          >
            <MathText>{choice.label}</MathText>
          </button>
        );
      })}
    </div>
  );
}

/* ------------------------------- Explain -------------------------------- */
function ExplainInput({
  challenge,
  locked,
  showCorrectAnswer,
  onResolve,
}: SharedProps & { challenge: { options: { id: string; label: string }[]; correctId: string; explanation: string; misconception?: string } }) {
  const [wrongPicks, setWrongPicks] = useState<Set<string>>(() => new Set());
  const [correctPick, setCorrectPick] = useState<string | null>(null);

  return (
    <div className="mt-4 flex flex-col gap-2">
      {challenge.options.map((opt) => {
        const isCorrect = opt.id === challenge.correctId;
        const wasWrong = wrongPicks.has(opt.id);
        const isCorrectPick = correctPick === opt.id;
        let tone = "border-[#b59a6a] bg-[#f6efdb] hover:border-amber-700 hover:bg-[#f1e6c8]";
        if (locked && showCorrectAnswer && isCorrect) tone = "border-emerald-600 bg-emerald-100";
        else if (wasWrong) tone = "border-rose-500 bg-rose-100";
        else if (locked && isCorrectPick) tone = "border-emerald-600 bg-emerald-100";
        return (
          <button
            key={opt.id}
            type="button"
            disabled={locked}
            onClick={() => {
              if (locked) return;
              if (isCorrect) {
                setCorrectPick(opt.id);
                onResolve(true, { explanation: challenge.explanation, misconception: challenge.misconception });
              } else {
                setWrongPicks((prev) => new Set(prev).add(opt.id));
                onResolve(false, { explanation: challenge.explanation, misconception: challenge.misconception, selectedWrong: opt.label });
              }
            }}
            className={`rounded-xl border-2 px-4 py-3 text-left text-sm font-medium text-slate-900 transition-colors disabled:cursor-default ${tone}`}
          >
            <MathText>{opt.label}</MathText>
          </button>
        );
      })}
    </div>
  );
}

/* ------------------------------- Mistake -------------------------------- */
function MistakeInput({
  challenge,
  locked,
  showCorrectAnswer,
  onResolve,
}: SharedProps & { challenge: MistakeChallenge }) {
  const [wrongPicks, setWrongPicks] = useState<Set<number>>(() => new Set());
  const [correctPick, setCorrectPick] = useState<number | null>(null);

  return (
    <div className="mt-4 flex flex-col gap-2">
      {challenge.statements.map((s, i) => {
        const wasWrong = wrongPicks.has(i);
        const isCorrectPick = correctPick === i;
        let tone = "border-[#b59a6a] bg-[#f6efdb] hover:border-amber-700 hover:bg-[#f1e6c8]";
        if (locked && showCorrectAnswer && s.flawed) tone = "border-emerald-600 bg-emerald-100";
        else if (wasWrong) tone = "border-rose-500 bg-rose-100";
        else if (locked && isCorrectPick) tone = "border-emerald-600 bg-emerald-100";
        return (
          <button
            key={i}
            type="button"
            disabled={locked}
            onClick={() => {
              if (locked) return;
              if (s.flawed) {
                setCorrectPick(i);
                onResolve(true, { explanation: challenge.explanation, misconception: challenge.misconception });
              } else {
                setWrongPicks((prev) => new Set(prev).add(i));
                onResolve(false, {
                  explanation: challenge.explanation,
                  misconception: challenge.misconception,
                  selectedWrong: s.text,
                });
              }
            }}
            className={`flex items-start gap-2 rounded-xl border-2 px-4 py-3 text-left text-sm font-medium text-slate-900 transition-colors disabled:cursor-default ${tone}`}
          >
            <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-amber-700/70" aria-hidden="true" />
            <span><MathText>{s.text}</MathText></span>
          </button>
        );
      })}
      {locked && showCorrectAnswer && (
        <p className="mt-1 text-xs font-medium text-emerald-800">Correct. You found the false claim.</p>
      )}
    </div>
  );
}

/* -------------------------------- Order --------------------------------- */
function OrderInput({
  challenge,
  locked,
  showCorrectAnswer,
  accent,
  seed,
  onResolve,
}: SharedProps & { challenge: OrderChallenge }) {
  const [display] = useState(() => shuffledSteps(challenge, seed));
  const [order, setOrder] = useState<number[]>([]);
  const [lastWrong, setLastWrong] = useState(false);

  const remaining = display.map((_, i) => i).filter((i) => !order.includes(i));
  const complete = order.length === display.length;
  const chosenTexts = order.map((i) => display[i]);
  const correctSoFar = chosenTexts.map((t, i) => t === challenge.steps[i]);

  function add(i: number) {
    if (locked) return;
    setLastWrong(false);
    setOrder((o) => (o.includes(i) ? o : [...o, i]));
  }
  function removeAt(pos: number) {
    if (locked) return;
    setLastWrong(false);
    setOrder((o) => o.filter((_, p) => p !== pos));
  }
  function check() {
    if (locked || !complete) return;
    const correct = chosenTexts.every((t, i) => t === challenge.steps[i]);
    if (correct) {
      setLastWrong(false);
      onResolve(true, { explanation: challenge.explanation, misconception: challenge.misconception });
    } else {
      setLastWrong(true);
      onResolve(false, {
        explanation: challenge.explanation,
        misconception: challenge.misconception,
        selectedWrong: chosenTexts.join(" → "),
      });
    }
  }

  return (
    <div className="mt-4">
      <ol className="flex flex-col gap-2">
        {order.map((i, pos) => {
          const ok = correctSoFar[pos];
          let tone = "border-[#b59a6a] bg-[#f6efdb]";
          if (locked) {
            if (showCorrectAnswer) tone = ok ? "border-emerald-600 bg-emerald-100" : "border-rose-500 bg-rose-100";
            else if (!ok) tone = "border-rose-500 bg-rose-100";
          } else if (lastWrong && !ok) tone = "border-rose-500 bg-rose-100";
          return (
            <li key={i}>
              <button
                type="button"
                disabled={locked}
                onClick={() => removeAt(pos)}
                className={`flex w-full items-center gap-3 rounded-xl border-2 px-3 py-2.5 text-left text-sm font-medium text-slate-900 transition-colors disabled:cursor-default ${tone}`}
              >
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-amber-800 text-xs font-bold text-amber-50">{pos + 1}</span>
                <span className="flex-1"><MathText>{display[i]}</MathText></span>
                {!locked && <span className="text-xs text-amber-700">remove</span>}
              </button>
            </li>
          );
        })}
        {order.length === 0 && (
          <li className="rounded-xl border-2 border-dashed border-[#b59a6a]/70 px-3 py-3 text-center text-xs text-amber-800">
            Tap steps below in order.
          </li>
        )}
      </ol>

      {remaining.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {remaining.map((i) => (
            <button
              key={i}
              type="button"
              disabled={locked}
              onClick={() => add(i)}
              className="rounded-lg border-2 border-[#b59a6a] bg-[#f6efdb] px-3 py-2 text-left text-sm font-medium text-slate-900 transition-colors hover:border-amber-700 hover:bg-[#f1e6c8] disabled:cursor-default"
            >
              <MathText>{display[i]}</MathText>
            </button>
          ))}
        </div>
      )}

      {!locked && (
        <button
          type="button"
          onClick={check}
          disabled={!complete}
          className="mt-4 rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors disabled:opacity-50"
          style={{ background: complete ? "#4f46e5" : "#9ca3af" }}
        >
          Check order
        </button>
      )}
      {locked && showCorrectAnswer && (
        <p className="mt-3 text-xs font-medium text-slate-700" style={{ color: accent }}>
          Correct order: {challenge.steps.map((_, i) => i + 1).join(" → ")}
        </p>
      )}
    </div>
  );
}

/* -------------------------------- Slots --------------------------------- */
function SlotsInput({
  challenge,
  locked,
  showCorrectAnswer,
  onResolve,
}: SharedProps & { challenge: SlotsChallenge }) {
  const chips = Array.from(new Set(challenge.palette));
  const [filled, setFilled] = useState<(string | null)[]>(() => challenge.solution.map(() => null));
  const [lastWrong, setLastWrong] = useState(false);

  const complete = filled.every((f) => f !== null);
  function place(chip: string) {
    if (locked) return;
    setLastWrong(false);
    setFilled((prev) => {
      const next = [...prev];
      const idx = next.findIndex((f) => f === null);
      if (idx >= 0) next[idx] = chip;
      return next;
    });
  }
  function clearSlot(i: number) {
    if (locked) return;
    setLastWrong(false);
    setFilled((prev) => {
      const next = [...prev];
      next[i] = null;
      return next;
    });
  }
  function check() {
    if (locked || !complete) return;
    const correct = filled.every((f, i) => f === challenge.solution[i]);
    if (correct) {
      setLastWrong(false);
      onResolve(correct, { explanation: challenge.explanation, misconception: challenge.misconception });
    } else {
      setLastWrong(true);
      onResolve(false, {
        explanation: challenge.explanation,
        misconception: challenge.misconception,
        selectedWrong: filled.filter(Boolean).join(" → "),
      });
    }
  }

  return (
    <div className="mt-4">
      <div className="flex flex-wrap items-center gap-2">
        {filled.map((f, i) => {
          const ok = f === challenge.solution[i];
          let tone = "border-[#b59a6a] bg-[#f6efdb]";
          if (locked) {
            if (showCorrectAnswer) tone = ok ? "border-emerald-600 bg-emerald-100" : "border-rose-500 bg-rose-100";
            else if (!ok) tone = "border-rose-500 bg-rose-100";
          } else if (lastWrong && !ok) tone = "border-rose-500 bg-rose-100";
          else if (f) tone = "border-amber-700 bg-[#f1e6c8]";
          return (
            <button
              key={i}
              type="button"
              disabled={locked}
              onClick={() => clearSlot(i)}
              className={`grid h-12 w-14 place-items-center rounded-lg border-2 border-dashed text-base font-bold text-slate-900 transition-colors disabled:cursor-default ${tone}`}
            >
              {f ? <MathText>{f}</MathText> : <span className="text-amber-700/60">{i + 1}</span>}
            </button>
          );
        })}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {chips.map((chip) => (
          <button
            key={chip}
            type="button"
            disabled={locked}
            onClick={() => place(chip)}
            className="grid h-11 min-w-[3.25rem] place-items-center rounded-lg border-2 border-[#b59a6a] bg-[#f6efdb] px-3 text-base font-bold text-slate-900 transition-colors hover:border-amber-700 hover:bg-[#f1e6c8] disabled:cursor-default"
          >
            <MathText>{chip}</MathText>
          </button>
        ))}
      </div>

      {!locked && (
        <button
          type="button"
          onClick={check}
          disabled={!complete}
          className="mt-4 rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors disabled:opacity-50"
          style={{ background: complete ? "#4f46e5" : "#9ca3af" }}
        >
          Check answer
        </button>
      )}
    </div>
  );
}

/* -------------------------------- Bloch --------------------------------- */
function BlochInput({
  challenge,
  locked,
  showCorrectAnswer,
  onResolve,
}: SharedProps & { challenge: BlochChallenge }) {
  const [wrongPicks, setWrongPicks] = useState<Set<string>>(() => new Set());
  const [correctPick, setCorrectPick] = useState<string | null>(null);
  const [preview, setPreview] = useState<{ theta: number; phi: number }>({
    theta: challenge.theta,
    phi: challenge.phi,
  });

  return (
    <div className="mt-4">
      <BlochSphere theta={preview.theta} phi={preview.phi} size={200} />
      <div className="mt-3 flex flex-col gap-2">
        {challenge.options.map((opt) => {
          const isCorrect = opt.id === challenge.correctId;
          const wasWrong = wrongPicks.has(opt.id);
          const isCorrectPick = correctPick === opt.id;
          let tone = "border-[#b59a6a] bg-[#f6efdb] hover:border-amber-700 hover:bg-[#f1e6c8]";
          if (locked && showCorrectAnswer && isCorrect) tone = "border-emerald-600 bg-emerald-100";
          else if (wasWrong) tone = "border-rose-500 bg-rose-100";
          else if (locked && isCorrectPick) tone = "border-emerald-600 bg-emerald-100";
          return (
            <button
              key={opt.id}
              type="button"
              disabled={locked}
              onMouseEnter={() => !locked && setPreview({ theta: opt.theta, phi: opt.phi })}
              onFocus={() => !locked && setPreview({ theta: opt.theta, phi: opt.phi })}
              onClick={() => {
                if (locked) return;
                setPreview({ theta: opt.theta, phi: opt.phi });
                if (isCorrect) {
                  setCorrectPick(opt.id);
                  onResolve(true, { explanation: challenge.explanation, misconception: challenge.misconception });
                } else {
                  setWrongPicks((prev) => new Set(prev).add(opt.id));
                  onResolve(false, { explanation: challenge.explanation, misconception: challenge.misconception, selectedWrong: opt.label });
                }
              }}
              className={`rounded-xl border-2 px-4 py-3 text-left text-sm font-medium text-slate-900 transition-colors disabled:cursor-default ${tone}`}
            >
              <MathText>{opt.label}</MathText>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* --------------------------------- Fill --------------------------------- */
function FillInput({
  challenge,
  locked,
  showCorrectAnswer,
  onResolve,
}: SharedProps & { challenge: FillChallenge }) {
  const [picked, setPicked] = useState<string | null>(null);
  const [lastWrong, setLastWrong] = useState(false);
  const answer = challenge.solution[challenge.missingIndex] ?? "";

  return (
    <div className="mt-4">
      <div className="flex flex-wrap items-center gap-2 text-base font-bold text-slate-900">
        {challenge.solution.map((gate, i) => (
          <span
            key={i}
            className={`grid h-12 min-w-[3.25rem] place-items-center rounded-lg border-2 px-3 ${
              i === challenge.missingIndex
                ? lastWrong
                  ? "border-rose-500 bg-rose-100"
                  : picked
                    ? picked === answer
                      ? "border-emerald-600 bg-emerald-100"
                      : "border-rose-500 bg-rose-100"
                    : "border-dashed border-[#b59a6a] bg-[#f6efdb]"
                : "border-[#b59a6a] bg-[#f1e6c8]"
            }`}
          >
            {i === challenge.missingIndex ? (picked ? <MathText>{picked}</MathText> : "?") : <MathText>{gate}</MathText>}
          </span>
        ))}
      </div>
      {!locked && (
        <div className="mt-3 flex flex-wrap gap-2">
          {challenge.palette.map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => {
                setLastWrong(false);
                setPicked(chip);
                if (chip === answer) {
                  onResolve(true, { explanation: challenge.explanation, misconception: challenge.misconception });
                } else {
                  setLastWrong(true);
                  onResolve(false, {
                    explanation: challenge.explanation,
                    misconception: challenge.misconception,
                    selectedWrong: chip,
                  });
                }
              }}
              className="grid h-11 min-w-[3.25rem] place-items-center rounded-lg border-2 border-[#b59a6a] bg-[#f6efdb] px-3 text-base font-bold text-slate-900 transition-colors hover:border-amber-700 hover:bg-[#f1e6c8]"
            >
              <MathText>{chip}</MathText>
            </button>
          ))}
        </div>
      )}
      {locked && showCorrectAnswer && (
        <p className="mt-2 text-xs font-medium text-emerald-800">
          Missing gate: <MathText>{answer}</MathText>
        </p>
      )}
    </div>
  );
}
