import { NextResponse } from "next/server";
import { chat } from "@/lib/ai/client";
import { practicePrompt } from "@/lib/ai/prompts";
import { parsePractice } from "@/lib/ai/validators";

export const runtime = "nodejs";

function str(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() !== "" ? value : undefined;
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const topic = str(body?.topic);
  if (!body || !topic) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  try {
    const { system, user } = practicePrompt({
      topic,
      conceptTag: str(body.conceptTag),
      concept: str(body.concept),
      prerequisite: str(body.prerequisite),
      misconception: str(body.misconception),
    });
    const raw = await chat({ system, user, json: true, maxTokens: 500, temperature: 0.7 });
    const practice = parsePractice(raw);
    if (!practice) {
      // Generated content failed validation — tell the client to show a fallback.
      return NextResponse.json({ error: "invalid_practice" }, { status: 422 });
    }
    return NextResponse.json({ practice });
  } catch {
    return NextResponse.json({ error: "ai_unavailable" }, { status: 503 });
  }
}
