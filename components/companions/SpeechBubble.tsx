"use client";

import type { BubbleAction, CompanionState } from "@/lib/companions/types";
import { useBubbleActionHandlers } from "./CompanionProvider";
import MathText from "../MathText";

/**
 * Speech bubble with optional action buttons (e.g. help offer on the lesson page).
 */
export default function SpeechBubble({
  state,
  message,
  arrow,
  horizontal,
  actions,
  onClose,
}: {
  state: CompanionState;
  message?: string;
  arrow: "up" | "down";
  horizontal: "left" | "center" | "right";
  actions?: BubbleAction[];
  onClose: () => void;
}) {
  const handlers = useBubbleActionHandlers();
  const arrowX =
    horizontal === "left" ? "left-4" : horizontal === "right" ? "right-4" : "left-1/2 -translate-x-1/2";
  const arrowPos = arrow === "up" ? "-top-1" : "-bottom-1";

  return (
    <div className="pointer-events-auto relative max-w-[16rem] rounded-2xl border border-indigo-200 bg-white px-3 py-2 text-sm leading-5 text-slate-700 shadow-lg">
      <span
        className={`absolute h-2.5 w-2.5 rotate-45 border border-indigo-200 bg-white ${arrowPos} ${arrowX} ${
          arrow === "up" ? "border-b-0 border-r-0" : "border-l-0 border-t-0"
        }`}
        aria-hidden="true"
      />
      {state === "thinking" ? (
        <span className="inline-flex items-center gap-1 text-indigo-600">
          Consulting the runes
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="wizard-think-dot inline-block h-1 w-1 rounded-full bg-indigo-400"
              style={{ animationDelay: `${i * 0.18}s` }}
            />
          ))}
        </span>
      ) : (
        <>
          <div className="flex items-start gap-2">
            <div className="min-w-0 flex-1">
              <MathText>{message ?? ""}</MathText>
            </div>
            {!actions?.length && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Dismiss the guide"
                className="-mr-1 -mt-0.5 shrink-0 rounded p-0.5 text-slate-300 transition-colors hover:text-slate-500"
              >
                <svg viewBox="0 0 12 12" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={1.8}>
                  <path d="M3 3 L9 9 M9 3 L3 9" strokeLinecap="round" />
                </svg>
              </button>
            )}
          </div>
          {actions && actions.length > 0 && (
            <div className="mt-2.5 flex flex-wrap gap-2">
              {actions.map((action) => (
                <button
                  key={action.id}
                  type="button"
                  onClick={() => handlers.current[action.id]?.()}
                  className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
                    action.variant === "ghost"
                      ? "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                      : "bg-indigo-600 text-white hover:bg-indigo-700"
                  }`}
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
