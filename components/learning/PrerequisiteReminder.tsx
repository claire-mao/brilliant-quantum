"use client";

import { useState } from "react";
import { getPrerequisiteReminder } from "@/lib/learning/concepts";
import { getRetrievalForConcept } from "@/lib/learning/retrieval";
import RetrievalPrompt from "./RetrievalPrompt";

/**
 * Activates prior knowledge at the start of a lesson: a one-line reminder of the
 * prerequisite concept, plus an optional quick recall question. Non-blocking —
 * the lesson is still the teacher; this just primes long-term memory.
 */
export default function PrerequisiteReminder({ lessonId }: { lessonId: string }) {
  const pre = getPrerequisiteReminder(lessonId);
  const [open, setOpen] = useState(false);

  if (!pre) return null;
  const recall = getRetrievalForConcept(pre.tag);

  return (
    <div className="mt-6 rounded-xl border border-violet-200 bg-violet-50/70 px-4 py-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-violet-900">
          <span className="font-semibold">Before you begin · {pre.label}:</span> recall that {pre.text}
        </p>
        {recall && (
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            className="shrink-0 rounded-lg border border-violet-300 bg-white px-3 py-1 text-xs font-semibold text-violet-700 transition-colors hover:bg-violet-50"
          >
            {open ? "Hide recall" : "Quick recall"}
          </button>
        )}
      </div>
      {open && recall && (
        <div className="mt-3">
          <RetrievalPrompt question={recall} conceptTag={pre.tag} heading={`Warm-up recall · ${pre.label}`} />
        </div>
      )}
    </div>
  );
}
