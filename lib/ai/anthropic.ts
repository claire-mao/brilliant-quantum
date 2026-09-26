/**
 * Server-only Anthropic Claude client for the Teach-Back tutor. Must never be
 * imported by client code: the key is read from a non-public env var and used
 * only inside API routes.
 *
 *   ANTHROPIC_API_KEY  required
 *   ANTHROPIC_MODEL    default claude-haiku-4-5 (fast, structured analysis)
 */

import { AIUnavailableError } from "./client";

export const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
export const ANTHROPIC_VERSION = "2023-06-01";
export const ANTHROPIC_DEFAULT_MODEL = "claude-haiku-4-5";

export function anthropicModel(): string {
  return process.env.ANTHROPIC_MODEL?.trim() || ANTHROPIC_DEFAULT_MODEL;
}

export function anthropicConfigured(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY?.trim());
}

interface ClaudeChatOptions {
  system: string;
  user: string;
  maxTokens?: number;
  temperature?: number;
  timeoutMs?: number;
}

interface MessagesResponse {
  content?: { type: string; text?: string }[];
}

/** Single-turn Claude Messages call; returns the concatenated text output. */
export async function claudeChat({
  system,
  user,
  maxTokens = 900,
  temperature = 0.3,
  timeoutMs = 20_000,
}: ClaudeChatOptions): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
  if (!apiKey) throw new AIUnavailableError("Anthropic is not configured");

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(ANTHROPIC_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": ANTHROPIC_VERSION,
      },
      body: JSON.stringify({
        model: anthropicModel(),
        max_tokens: maxTokens,
        temperature,
        system,
        messages: [{ role: "user", content: user }],
      }),
      signal: controller.signal,
    });

    if (!res.ok) {
      throw new Error(`Anthropic request failed with status ${res.status}`);
    }

    const data = (await res.json()) as MessagesResponse;
    const text = (data.content ?? [])
      .filter((block) => block.type === "text" && typeof block.text === "string")
      .map((block) => block.text as string)
      .join("")
      .trim();
    if (!text) throw new Error("Anthropic returned an empty response");
    return text;
  } finally {
    clearTimeout(timer);
  }
}
