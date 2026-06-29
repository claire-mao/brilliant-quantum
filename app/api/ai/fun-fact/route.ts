import { NextResponse } from "next/server";
import { chat } from "@/lib/ai/client";
import { funFactPrompt, type PageKind } from "@/lib/ai/prompts";

export const runtime = "nodejs";

function str(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() !== "" ? value : undefined;
}

function pageKind(value: unknown): PageKind | undefined {
  if (value === "dashboard" || value === "lesson" || value === "tower" || value === "profile") {
    return value;
  }
  return undefined;
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const topic = str(body?.topic);
  if (!body || !topic) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  try {
    const { system, user } = funFactPrompt({ topic, pageKind: pageKind(body.pageKind) });
    const fact = await chat({ system, user, maxTokens: 160, temperature: 0.7 });
    return NextResponse.json({ fact });
  } catch {
    return NextResponse.json({ error: "ai_unavailable" }, { status: 503 });
  }
}
