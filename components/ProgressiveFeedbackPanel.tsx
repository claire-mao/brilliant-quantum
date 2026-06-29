"use client";

import MathText from "@/components/MathText";
import WizardHelpPrompt from "@/components/WizardHelpPrompt";
import type { HintRequest } from "@/lib/companions/tower-context";
import {
  canOfferExplanation,
  formatRevealBlock,
  getProgressiveFeedback,
  shouldRevealAnswer,
  type QuestionContext,
} from "@/lib/learning/progressive-feedback";

interface Props {
  isCorrect: boolean;
  wrongCount: number;
  showExplanationRequested: boolean;
  onRequestExplanation: () => void;
  questionContext: QuestionContext;
  /** Shown immediately on correct (after headline). */
  correctExplanation?: string;
  correctHeadline?: string;
  hintContext?: (HintRequest & { lessonId?: string }) | null;
  stepKey?: string;
  /** Tower uses a denser action row; lessons link to the Tower as backup. */
  variant?: "lesson" | "tower";
  onAskGuide?: () => void;
  hintLoading?: boolean;
  hint?: string | null;
  /** Review questions withhold the answer until the reveal threshold. */
  reviewMode?: boolean;
  /** Tower: after revealing the explanation, advance without retrying the question. */
  onContinueAfterExplanation?: () => void;
}

/**
 * Shared wrong/correct feedback panel for retrieval-first grading.
 * Wrong attempts show escalating cues; full explanation only on reveal.
 */
export default function ProgressiveFeedbackPanel({
  isCorrect,
  wrongCount,
  showExplanationRequested,
  onRequestExplanation,
  questionContext,
  correctExplanation,
  correctHeadline = "Correct.",
  hintContext,
  stepKey,
  variant = "lesson",
  onAskGuide,
  hintLoading,
  hint,
  reviewMode = false,
  onContinueAfterExplanation,
}: Props) {
  if (isCorrect) {
    return (
      <div className="mt-4">
        <p className="rounded-lg bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-800">
          <span className="font-semibold">{correctHeadline}</span>
          {correctExplanation?.trim() ? (
            <>
              {" "}
              <MathText>{correctExplanation}</MathText>
            </>
          ) : null}
        </p>
      </div>
    );
  }

  const reveal = shouldRevealAnswer(wrongCount, showExplanationRequested, false, { reviewMode });
  const progressive = getProgressiveFeedback(wrongCount, questionContext, variant);
  const revealText = formatRevealBlock(
    questionContext.fullExplanation,
    questionContext.correctAnswerLabel
  );

  return (
    <div className="mt-4">
      <p className="rounded-lg bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-800">
        <MathText>{reveal ? revealText || progressive.message : progressive.message}</MathText>
      </p>

      {!reveal && canOfferExplanation(wrongCount) && (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          {variant === "tower" && onAskGuide ? (
            <button
              type="button"
              onClick={onAskGuide}
              disabled={hintLoading}
              className="rounded-lg border border-cyan-700/40 bg-cyan-50 px-3 py-2 text-sm font-medium text-cyan-800 transition-colors hover:bg-cyan-100 disabled:opacity-60"
            >
              {hintLoading ? "Loading hint…" : "Ask Bob"}
            </button>
          ) : (
            <span aria-hidden="true" />
          )}
          <button
            type="button"
            onClick={onRequestExplanation}
            className="rounded-lg border border-indigo-300 bg-indigo-50 px-3 py-2 text-sm font-medium text-indigo-800 transition-colors hover:bg-indigo-100"
          >
            Show explanation
          </button>
        </div>
      )}

      {reveal && variant === "tower" && onContinueAfterExplanation && (
        <button
          type="button"
          onClick={onContinueAfterExplanation}
          className="mt-3 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
        >
          Continue
        </button>
      )}

      {variant === "tower" && hint && (
        <p className="mt-3 rounded-lg border border-cyan-700/30 bg-cyan-50 px-3 py-2 text-sm text-cyan-900">
          <MathText>{hint}</MathText>
        </p>
      )}

      {hintContext && stepKey && variant === "lesson" && (
        <WizardHelpPrompt context={hintContext} wrongCount={wrongCount} stepKey={stepKey} />
      )}
    </div>
  );
}
