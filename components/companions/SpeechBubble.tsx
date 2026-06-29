"use client";

import { forwardRef, useMemo, useState, type CSSProperties, type ForwardedRef } from "react";
import type { BubbleAction, CompanionState } from "@/lib/companions/types";
import { splitMessageParts } from "@/lib/companions/messages";
import { useBubbleActionHandlers } from "./CompanionProvider";
import MathText from "../MathText";
import RuneRing from "./RuneRing";

const actionClass = (variant?: BubbleAction["variant"]) =>
  `rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
    variant === "ghost"
      ? "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
      : "bg-indigo-600 text-white hover:bg-indigo-700"
  }`;

/**
 * Speech bubble with optional action buttons (e.g. help offer on the lesson page).
 * `style` lets the caller clamp width/offset to keep it in the viewport, and
 * `arrowLeft` points the tail at the wizard regardless of where the bubble sits.
 *
 * Long copy is split into sequential pages with Next; dismiss closes the whole bubble.
 */
const SpeechBubble = forwardRef(function SpeechBubble(
  {
    state,
    message,
    messageParts,
    arrow,
    horizontal,
    actions,
    onClose,
    style,
    arrowLeft,
  }: {
    state: CompanionState;
    message?: string;
    /** When set, overrides auto-splitting of `message`. */
    messageParts?: string[];
    arrow: "up" | "down";
    horizontal: "left" | "center" | "right";
    actions?: BubbleAction[];
    onClose: () => void;
    style?: CSSProperties;
    arrowLeft?: number;
  },
  ref: ForwardedRef<HTMLDivElement>
) {
  const handlers = useBubbleActionHandlers();
  const parts = useMemo(() => {
    if (messageParts?.length) return messageParts;
    if (message) return splitMessageParts(message);
    return [""];
  }, [message, messageParts]);

  const [partIndex, setPartIndex] = useState(0);

  const isMultiPart = parts.length > 1;
  const onLastPart = partIndex >= parts.length - 1;
  const displayMessage = parts[partIndex] ?? "";
  const showActions = onLastPart ? actions : undefined;

  const arrowClass =
    arrowLeft !== undefined
      ? ""
      : horizontal === "left"
        ? "left-4"
        : horizontal === "right"
          ? "right-4"
          : "left-1/2 -translate-x-1/2";
  const arrowPos = arrow === "up" ? "-top-1" : "-bottom-1";
  const arrowStyle: CSSProperties = arrowLeft !== undefined ? { left: arrowLeft, marginLeft: -5 } : {};

  return (
    <div
      ref={ref}
      style={style}
      className="pointer-events-auto relative box-border w-fit rounded-2xl border border-indigo-200 bg-white px-3 py-2 text-sm leading-snug text-slate-700 shadow-lg [overflow-wrap:anywhere] [hyphens:auto]"
    >
      <span
        style={arrowStyle}
        className={`absolute h-2.5 w-2.5 rotate-45 border border-indigo-200 bg-white ${arrowPos} ${arrowClass} ${
          arrow === "up" ? "border-b-0 border-r-0" : "border-l-0 border-t-0"
        }`}
        aria-hidden="true"
      />
      {state === "thinking" ? (
        <span className="inline-flex items-center gap-2 text-indigo-600">
          <RuneRing size="sm" />
          <span className="inline-flex items-center gap-1">
            Consulting runes
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="wizard-think-dot inline-block h-1 w-1 rounded-full bg-indigo-400"
                style={{ animationDelay: `${i * 0.18}s` }}
              />
            ))}
          </span>
        </span>
      ) : (
        <>
          {showActions && showActions.length === 1 ? (
            // Single action (e.g. Continue): the message sets the width, and the
            // whole block is centered (mx-auto) with the button below it,
            // right-aligned so it ends where the line ends.
            <div className="mx-auto flex w-fit max-w-full flex-col">
              <div className="min-w-0">
                <MathText>{displayMessage}</MathText>
              </div>
              <div className="mt-2.5 flex flex-wrap items-center justify-end gap-2">
                {isMultiPart && !onLastPart ? (
                  <PartNav
                    partIndex={partIndex}
                    partCount={parts.length}
                    onNext={() => setPartIndex((i) => Math.min(i + 1, parts.length - 1))}
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => handlers.current[showActions[0].id]?.()}
                    className={actionClass(showActions[0].variant)}
                  >
                    {showActions[0].label}
                  </button>
                )}
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-start gap-2">
                <div className="min-w-0">
                  <MathText>{displayMessage}</MathText>
                </div>
                {(!showActions || showActions.length === 0) && (
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
              {(isMultiPart && !onLastPart) || (showActions && showActions.length > 1) ? (
                <div className="mt-2.5 flex flex-wrap items-center gap-2">
                  {isMultiPart && !onLastPart && (
                    <PartNav
                      partIndex={partIndex}
                      partCount={parts.length}
                      onNext={() => setPartIndex((i) => Math.min(i + 1, parts.length - 1))}
                    />
                  )}
                  {showActions?.map((action) => (
                    <button
                      key={action.id}
                      type="button"
                      onClick={() => handlers.current[action.id]?.()}
                      className={actionClass(action.variant)}
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              ) : null}
            </>
          )}
        </>
      )}
    </div>
  );
});

export default SpeechBubble;

function PartNav({
  partIndex,
  partCount,
  onNext,
}: {
  partIndex: number;
  partCount: number;
  onNext: () => void;
}) {
  return (
    <>
      <button type="button" onClick={onNext} className={actionClass("primary")}>
        Next
      </button>
      <span className="text-[10px] font-medium text-slate-400">
        {partIndex + 1}/{partCount}
      </span>
    </>
  );
}
