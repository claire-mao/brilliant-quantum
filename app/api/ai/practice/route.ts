import { NextResponse } from "next/server";
import { chat } from "@/lib/ai/client";
import { practicePrompt, towerPracticePrompt } from "@/lib/ai/prompts";
import { parsePractice } from "@/lib/ai/validators";

export const runtime = "nodejs";

function str(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() !== "" ? value.trim() : undefined;
}

function num(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function strArray(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const out = value.filter((v): v is string => typeof v === "string" && v.trim() !== "");
  return out.length ? out : undefined;
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const topic = str(body?.topic);
  if (!body || !topic) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const forTower = body.forTower === true || body.pageKind === "tower";

  try {
    const base = {
      topic,
      conceptTag: str(body.conceptTag),
      concept: str(body.concept),
      prerequisite: str(body.prerequisite),
      misconception: str(body.misconception),
    };

    const { system, user } = forTower
      ? towerPracticePrompt({
          ...base,
          floor: num(body.floor),
          roomType: str(body.roomType),
          difficulty: str(body.difficulty) as "easy" | "medium" | "hard" | undefined,
          learnerMisconceptions: strArray(body.learnerMisconceptions),
          masteredConcepts: strArray(body.masteredConcepts),
          dueConcepts: strArray(body.dueConcepts),
          recentPrompts: strArray(body.recentPrompts),
          interactionKind: str(body.interactionKind),
          reviewReason: str(body.reviewReason),
          unitTitle: str(body.unitTitle),
          lessonTitle: str(body.lessonTitle),
          recentWrongPattern: str(body.recentWrongPattern),
        })
      : practicePrompt(base);

    const raw = await chat({ system, user, json: true, maxTokens: 500, temperature: 0.7 });
    const practice = parsePractice(raw);
    if (!practice) {
      return NextResponse.json({ error: "invalid_practice" }, { status: 422 });
    }
    return NextResponse.json({ practice });
  } catch {
    return NextResponse.json({ error: "ai_unavailable" }, { status: 503 });
  }
}
