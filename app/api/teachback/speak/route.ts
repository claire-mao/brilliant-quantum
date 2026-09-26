import { NextResponse } from "next/server";

export const runtime = "nodejs";

const MAX_TEXT_CHARS = 2000;
const TIMEOUT_MS = 30_000;
/** ElevenLabs premade "Alice" (clear educator) — available on the free tier. */
const DEFAULT_VOICE_ID = "Xb7hH8MSUJpSbSDYk0k2";

/**
 * POST { text } -> audio/mpeg
 *
 * Speaks the tutor's response with ElevenLabs using the server-side
 * ELEVENLABS_API_KEY. Returns 503 `tts_unavailable` when not configured.
 */
export async function POST(request: Request) {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "tts_unavailable" }, { status: 503 });
  }

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const text = typeof body?.text === "string" ? body.text.trim() : "";
  if (!text) {
    return NextResponse.json({ error: "missing_text" }, { status: 400 });
  }

  const voiceId = process.env.ELEVENLABS_VOICE_ID ?? DEFAULT_VOICE_ID;
  const modelId = process.env.ELEVENLABS_MODEL_ID ?? "eleven_turbo_v2_5";

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voiceId)}?output_format=mp3_44100_128`,
      {
        method: "POST",
        headers: {
          "xi-api-key": apiKey,
          "Content-Type": "application/json",
          Accept: "audio/mpeg",
        },
        body: JSON.stringify({
          text: text.slice(0, MAX_TEXT_CHARS),
          model_id: modelId,
          voice_settings: { stability: 0.5, similarity_boost: 0.75 },
        }),
        signal: controller.signal,
      }
    );
    if (!res.ok || !res.body) {
      console.warn("[teachback] elevenlabs error", res.status);
      return NextResponse.json({ error: "tts_failed" }, { status: 502 });
    }
    const audio = await res.arrayBuffer();
    return new NextResponse(audio, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.warn("[teachback] elevenlabs request failed", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "tts_failed" }, { status: 502 });
  } finally {
    clearTimeout(timer);
  }
}
