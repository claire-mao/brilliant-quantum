import { NextResponse } from "next/server";
import { anthropicConfigured, claudeChat } from "@/lib/ai/anthropic";
import { getLesson } from "@/content/lessons";
import { correctAnswerFor } from "@/lib/companions/lesson-context";
import {
  WIZARD_ACTIONS,
  parseWizardReply,
  hintRevealsAnswer,
  toHintLevel,
  wizardPrompt,
  type WizardAction,
  type WizardRequest,
} from "@/lib/ai/wizard";

export const runtime = "nodejs";
export const maxDuration = 30;

const MAX_AVOID = 12;
const MAX_AVOID_FACTS = 5;
const MAX_TEXT = 1200;

function str(value: unknown, max = MAX_TEXT): string | undefined {
  if (typeof value !== "string") return undefined;
  const t = value.trim();
  return t ? t.slice(0, max) : undefined;
}

function strArray(value: unknown, limit: number): string[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const out = value
    .filter((v): v is string => typeof v === "string" && v.trim() !== "")
    .map((v) => v.trim().slice(0, 300))
    .slice(-limit);
  return out.length ? out : undefined;
}

function num(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 ? Math.floor(value) : undefined;
}

/**
 * Context-aware Guide Wizard: one endpoint for Hint / Practice / Fun fact so
 * all three share the same lesson context and the same server-side Claude
 * client. On any failure the client falls back to its handwritten copy.
 */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const action = body?.action;
  if (!body || !WIZARD_ACTIONS.includes(action as WizardAction)) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  if (!anthropicConfigured()) {
    return NextResponse.json({ error: "ai_unavailable" }, { status: 503 });
  }

  const lessonId = str(body.lessonId, 80);
  const question = str(body.question);
  const req: WizardRequest = {
    action: action as WizardAction,
    lessonId,
    lessonTitle: str(body.lessonTitle, 160),
    step: str(body.step, 200),
    concept: str(body.concept, 120),
    question,
    choices: strArray(body.choices, 8),
    studentAnswer: str(body.studentAnswer, 300) ?? null,
    correctAnswer: action === "hint" ? correctAnswerFor(lessonId ? getLesson(lessonId) : undefined, question) : undefined,
    attemptFeedback: str(body.attemptFeedback, 400),
    incorrectAttempts: num(body.incorrectAttempts),
    hintLevel: toHintLevel(body.hintLevel),
    avoid: strArray(body.avoid, MAX_AVOID),
    avoidFacts: strArray(body.avoidFacts, MAX_AVOID_FACTS),
    stepSummary: str(body.stepSummary, 600),
  };

  try {
    const { system, user } = wizardPrompt(req);
    const raw = await claudeChat({
      system,
      user,
      maxTokens: req.action === "practice" ? 260 : 180,
      temperature: req.action === "hint" ? 0.4 : 0.9,
      timeoutMs: 15_000,
    });
    let reply = parseWizardReply(raw, req.action);
    if (reply && req.action === "hint" && hintRevealsAnswer(reply.text, req.correctAnswer)) {
      const retry = await claudeChat({
        system,
        user: `${user}\n\nYour previous hint quoted the correct choice, which is forbidden. Rewrite it as a guiding question that does not contain the answer.`,
        maxTokens: 180,
        temperature: 0.2,
        timeoutMs: 15_000,
      });
      reply = parseWizardReply(retry, req.action);
      if (reply && hintRevealsAnswer(reply.text, req.correctAnswer)) reply = null;
    }
    if (!reply) {
      console.warn("[wizard] malformed model reply", req.action);
      return NextResponse.json({ error: "invalid_reply" }, { status: 422 });
    }
    return NextResponse.json({ action: req.action, hintLevel: req.hintLevel, ...reply });
  } catch (err) {
    console.warn("[wizard] model unavailable", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "ai_unavailable" }, { status: 503 });
  }
}
