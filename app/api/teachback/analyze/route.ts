import { NextResponse } from "next/server";
import { anthropicConfigured, claudeChat } from "@/lib/ai/anthropic";
import {
  CONCEPT_KEY_IDEAS,
  fallbackTeachBack,
  parseTeachBack,
  teachBackConcept,
  teachBackPrompt,
  type TeachBackContext,
} from "@/lib/ai/teachback";
import { CONCEPT_LABEL, type ConceptTag } from "@/lib/learning/concepts";
import { getLesson } from "@/content/lessons";

export const runtime = "nodejs";
export const maxDuration = 30;

const MAX_TRANSCRIPT_CHARS = 4000;

/**
 * POST { lessonId, transcript, priorMastery? }
 * -> { analysis: TeachBackAnalysis, source: "claude" | "fallback" }
 *
 * The Anthropic key never leaves this route. When the model is unavailable or
 * returns malformed JSON we fall back to a rubric-based analysis so the demo
 * flow always completes.
 */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const lessonId = typeof body?.lessonId === "string" ? body.lessonId : "";
  const transcript = typeof body?.transcript === "string" ? body.transcript.trim() : "";
  const priorMastery =
    typeof body?.priorMastery === "number" && Number.isFinite(body.priorMastery) ? body.priorMastery : null;

  const lesson = getLesson(lessonId);
  const conceptTag: ConceptTag | null = lesson ? teachBackConcept(lessonId) : null;
  if (!lesson || !conceptTag) {
    return NextResponse.json({ error: "unknown_lesson" }, { status: 400 });
  }
  if (transcript.length === 0) {
    return NextResponse.json({ error: "empty_transcript" }, { status: 400 });
  }

  const ctx: TeachBackContext = {
    lessonId,
    lessonTitle: lesson.title,
    conceptTag,
    conceptLabel: CONCEPT_LABEL[conceptTag],
    keyIdeas: CONCEPT_KEY_IDEAS[conceptTag],
    transcript: transcript.slice(0, MAX_TRANSCRIPT_CHARS),
    priorMastery,
  };

  if (anthropicConfigured()) {
    try {
      const { system, user } = teachBackPrompt(ctx);
      const raw = await claudeChat({ system, user, maxTokens: 900, temperature: 0.3, timeoutMs: 20_000 });
      const analysis = parseTeachBack(raw, ctx.conceptLabel);
      if (analysis) {
        return NextResponse.json({ analysis: { ...analysis, concept: ctx.conceptLabel }, source: "claude" });
      }
      console.warn("[teachback] model returned malformed JSON; using fallback");
    } catch (err) {
      console.warn("[teachback] model unavailable; using fallback", err instanceof Error ? err.message : err);
    }
  }

  return NextResponse.json({ analysis: fallbackTeachBack(ctx), source: "fallback" });
}
