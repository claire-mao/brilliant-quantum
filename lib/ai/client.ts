/**
 * Server-only AI client. Talks to an OpenAI-compatible chat-completions API
 * using `OPENAI_API_KEY`. This module must never be imported by client code:
 * the key is read from a non-public env var and used only inside API routes.
 *
 * If the key is missing or the request fails, callers should fall back to
 * handwritten content so the course keeps working with AI turned off.
 */

export class AIUnavailableError extends Error {
  constructor(message = "AI is not configured") {
    super(message);
    this.name = "AIUnavailableError";
  }
}

interface ChatOptions {
  system: string;
  user: string;
  /** Ask the model for a strict JSON object response. */
  json?: boolean;
  maxTokens?: number;
  temperature?: number;
}

const TIMEOUT_MS = 12_000;

export async function chat({
  system,
  user,
  json = false,
  maxTokens = 300,
  temperature = 0.6,
}: ChatOptions): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new AIUnavailableError();

  const baseUrl = process.env.OPENAI_BASE_URL ?? "https://api.openai.com/v1";
  const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature,
        max_tokens: maxTokens,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        ...(json ? { response_format: { type: "json_object" } } : {}),
      }),
      signal: controller.signal,
    });

    if (!res.ok) {
      throw new Error(`AI request failed with status ${res.status}`);
    }

    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const content = data.choices?.[0]?.message?.content;
    if (typeof content !== "string" || content.trim() === "") {
      throw new Error("AI returned an empty response");
    }
    return content.trim();
  } finally {
    clearTimeout(timer);
  }
}
