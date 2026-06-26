"use client";

import { useState } from "react";
import type { PracticeQuestion } from "@/lib/ai/validators";
import { useCompanion } from "./companions/CompanionProvider";
import MathText from "./MathText";

/**
 * "Create practice spell" — fetches one extra AI practice question on the same
 * concept. The interactive question renders inline (it can't live in a speech
 * bubble), while the floating wizard appears beside it to guide. Server-side
 * validation means only well-formed questions reach here; otherwise a safe
 * fallback shows. Answering never affects lesson unlocking or progress.
 */
export default function PracticeSpell({
  topic,
  conceptTag,
}: {
  topic: string;
  conceptTag?: string;
}) {
  const { summon, update } = useCompanion();
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "fallback">("idle");
  const [question, setQuestion] = useState<PracticeQuestion | null>(null);
  const [picked, setPicked] = useState<string | null>(null);

  async function conjure() {
    if (status === "loading") return;
    setStatus("loading");
    setPicked(null);
    setQuestion(null);
    summon({ context: "practice", state: "thinking" });
    try {
      const res = await fetch("/api/ai/practice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, conceptTag }),
      });
      const data = (await res.json().catch(() => null)) as { practice?: PracticeQuestion } | null;
      if (res.ok && data?.practice) {
        setQuestion(data.practice);
        setStatus("done");
        update("wizard", {
          state: "speaking",
          message: "A fresh challenge. Trust your reasoning, apprentice.",
          autoDismissMs: 16000,
        });
      } else {
        setStatus("fallback");
        update("wizard", {
          state: "speaking",
          message: "The spell fizzled — your progress is safe. Try again?",
          autoDismissMs: 9000,
        });
      }
    } catch {
      setStatus("fallback");
      update("wizard", {
        state: "speaking",
        message: "The spell fizzled — your progress is safe. Try again?",
        autoDismissMs: 9000,
      });
    }
  }

  if (status === "idle") {
    return (
      <button
        type="button"
        onClick={conjure}
        className="inline-flex items-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-sm font-medium text-indigo-700 transition-colors hover:bg-indigo-100"
      >
        <StarGlyph />
        Create practice spell
      </button>
    );
  }

  if (status === "loading") {
    return (
      <div className="rounded-xl border border-indigo-200 bg-indigo-50/70 px-4 py-3 text-sm text-indigo-700">
        Summoning a practice spell...
      </div>
    );
  }

  if (status === "fallback" || !question) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50/70 px-4 py-3 text-sm text-amber-900">
        <p>The spell fizzled this time. Your lesson and progress are unaffected.</p>
        <button
          type="button"
          onClick={conjure}
          className="mt-2 rounded-lg border border-amber-300 bg-white px-3 py-1.5 text-xs font-semibold text-amber-800 transition-colors hover:bg-amber-50"
        >
          Try again
        </button>
      </div>
    );
  }

  const answered = picked !== null;

  return (
    <div className="rounded-xl border border-indigo-200 bg-white p-4">
      <span className="text-xs font-semibold uppercase tracking-wide text-indigo-600">
        Practice spell · {question.difficulty}
      </span>

      <p className="mt-2 text-base leading-7 text-slate-800">
        <MathText>{question.prompt}</MathText>
      </p>

      <div className="mt-3 flex flex-col gap-2">
        {question.choices.map((choice) => {
          const isPicked = picked === choice.id;
          const isCorrect = choice.id === question.correctChoiceId;
          let tone = "border-slate-200 bg-white hover:border-indigo-300";
          if (answered && isCorrect) tone = "border-emerald-400 bg-emerald-50";
          else if (answered && isPicked) tone = "border-amber-400 bg-amber-50";
          return (
            <button
              key={choice.id}
              type="button"
              onClick={() => setPicked(choice.id)}
              className={`rounded-xl border px-4 py-3 text-left text-sm font-medium text-slate-800 transition-colors ${tone}`}
            >
              <MathText>{choice.label}</MathText>
            </button>
          );
        })}
      </div>

      {answered && (
        <div className="mt-3 rounded-lg bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-700">
          <p className="font-medium text-slate-900">
            {picked === question.correctChoiceId ? "Correct." : "Not quite."}
          </p>
          <p className="mt-1">
            <MathText>{question.explanation}</MathText>
          </p>
        </div>
      )}

      <button
        type="button"
        onClick={conjure}
        className="mt-3 text-sm font-medium text-indigo-600 underline underline-offset-2 hover:text-indigo-700"
      >
        Conjure another
      </button>
    </div>
  );
}

function StarGlyph() {
  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4 text-indigo-500" fill="currentColor" aria-hidden="true">
      <path d="M8 1 L9.2 6 L14 8 L9.2 10 L8 15 L6.8 10 L2 8 L6.8 6 Z" />
    </svg>
  );
}
