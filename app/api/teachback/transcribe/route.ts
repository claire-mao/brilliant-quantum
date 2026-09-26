import { NextResponse } from "next/server";

export const runtime = "nodejs";

const MAX_AUDIO_BYTES = 15 * 1024 * 1024;
const TIMEOUT_MS = 30_000;

/**
 * POST multipart/form-data { audio: Blob } -> { transcript }
 *
 * Proxies the recording to Deepgram using the server-side DEEPGRAM_API_KEY.
 * Returns 503 `stt_unavailable` when the key is missing so the client can
 * offer the typed fallback.
 */
export async function POST(request: Request) {
  const apiKey = process.env.DEEPGRAM_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "stt_unavailable" }, { status: 503 });
  }

  const form = await request.formData().catch(() => null);
  const audio = form?.get("audio");
  if (!(audio instanceof Blob) || audio.size === 0) {
    return NextResponse.json({ error: "missing_audio" }, { status: 400 });
  }
  if (audio.size > MAX_AUDIO_BYTES) {
    return NextResponse.json({ error: "audio_too_large" }, { status: 413 });
  }

  const model = process.env.DEEPGRAM_MODEL ?? "nova-3";
  const params = new URLSearchParams({
    model,
    smart_format: "true",
    punctuate: "true",
    language: "en",
  });

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`https://api.deepgram.com/v1/listen?${params.toString()}`, {
      method: "POST",
      headers: {
        Authorization: `Token ${apiKey}`,
        "Content-Type": audio.type || "audio/webm",
      },
      body: Buffer.from(await audio.arrayBuffer()),
      signal: controller.signal,
    });
    if (!res.ok) {
      console.warn("[teachback] deepgram error", res.status);
      return NextResponse.json({ error: "stt_failed" }, { status: 502 });
    }
    const data = (await res.json()) as {
      results?: { channels?: { alternatives?: { transcript?: string }[] }[] };
    };
    const transcript = data.results?.channels?.[0]?.alternatives?.[0]?.transcript?.trim() ?? "";
    if (!transcript) {
      return NextResponse.json({ error: "no_speech" }, { status: 422 });
    }
    return NextResponse.json({ transcript });
  } catch (err) {
    console.warn("[teachback] deepgram request failed", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "stt_failed" }, { status: 502 });
  } finally {
    clearTimeout(timer);
  }
}
