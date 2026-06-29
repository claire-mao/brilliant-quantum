import { NextResponse } from "next/server";
import { chat } from "@/lib/ai/client";
import { hintPrompt, type HintLevel, type PageKind } from "@/lib/ai/prompts";

export const runtime = "nodejs";

function str(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() !== "" ? value : undefined;
}

function level(value: unknown): HintLevel {
  const n = typeof value === "number" ? value : Number(value);
  if (n >= 4) return 4;
  if (n === 3) return 3;
  if (n === 2) return 2;
  return 1;
}

function pageKind(value: unknown): PageKind | undefined {
  if (value === "dashboard" || value === "lesson" || value === "tower" || value === "profile") {
    return value;
  }
  return undefined;
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const prompt = str(body?.prompt);
  if (!body || !prompt) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const lvl = level(body.level);

  try {
    const isTower = pageKind(body.pageKind) === "tower" || body.companion === "bob";
    const { system, user } = hintPrompt({
      lessonTitle: str(body.lessonTitle),
      prompt,
      selectedWrong: str(body.selectedWrong),
      correctAnswer: str(body.correctAnswer),
      feedback: str(body.feedback),
      conceptTag: str(body.conceptTag),
      conceptLabel: str(body.conceptLabel),
      level: lvl,
      pageKind: pageKind(body.pageKind),
      companion: body.companion === "bob" ? "bob" : undefined,
      wrongAttemptCount:
        typeof body.wrongAttemptCount === "number" ? body.wrongAttemptCount : undefined,
      reviewReason: str(body.reviewReason),
      misconception: str(body.misconception),
      choices: str(body.choices),
    });
    // Tower hints need room for question-specific detail; wizard hints stay shorter.
    const maxTokens = lvl >= 4 ? (isTower ? 180 : 160) : isTower ? 110 : 90;
    const hint = await chat({ system, user, maxTokens, temperature: 0.7 });
    return NextResponse.json({ hint, level: lvl });
  } catch {
    // Client shows a stage-appropriate handwritten fallback on a non-2xx response.
    return NextResponse.json({ error: "ai_unavailable" }, { status: 503 });
  }
}
