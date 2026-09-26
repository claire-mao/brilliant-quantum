"use client";

import { useState } from "react";
import TeachBackPanel from "./TeachBackPanel";

/**
 * Entry point for the Adaptive Teach-Back Tutor. `compact` renders a small pill
 * for the lesson header; the default is a full call-to-action button.
 */
export default function TeachBackButton({
  lessonId,
  lessonTitle,
  compact = false,
}: {
  lessonId: string;
  lessonTitle: string;
  compact?: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        data-teachback-trigger
        className={
          compact
            ? "inline-flex min-h-11 items-center gap-1.5 rounded-full border border-violet-300 bg-violet-50 px-3 py-1.5 text-sm font-semibold text-violet-800 transition-colors hover:border-violet-400 hover:bg-violet-100"
            : "inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-violet-300 bg-white px-4 py-3 text-base font-semibold text-violet-800 shadow-sm transition-colors hover:border-violet-400 hover:bg-violet-50 sm:w-auto"
        }
      >
        <svg viewBox="0 0 24 24" className={compact ? "h-4 w-4" : "h-5 w-5"} fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
          <rect x="9" y="3" width="6" height="11" rx="3" />
          <path d="M5 11a7 7 0 0 0 14 0M12 18v3M9 21h6" strokeLinecap="round" />
        </svg>
        Teach It Back
      </button>
      {open && <TeachBackPanel lessonId={lessonId} lessonTitle={lessonTitle} onClose={() => setOpen(false)} />}
    </>
  );
}
