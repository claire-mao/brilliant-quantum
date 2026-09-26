/**
 * Server-only Meta Llama provider for the Teach-Back tutor. Any
 * OpenAI-compatible endpoint that serves Llama works (Meta Llama API, Groq,
 * Together, OpenRouter, ...). Configure with:
 *
 *   LLAMA_API_KEY   required
 *   LLAMA_BASE_URL  default https://api.llama.com/compat/v1
 *   LLAMA_MODEL     default Llama-4-Maverick-17B-128E-Instruct-FP8
 *
 * Never import from client code.
 */

import type { ProviderConfig } from "@/lib/ai/client";

export const LLAMA_DEFAULT_BASE_URL = "https://api.llama.com/compat/v1";
export const LLAMA_DEFAULT_MODEL = "Llama-4-Maverick-17B-128E-Instruct-FP8";

/**
 * Meta Llama API keys have the shape `LLM|<digits>|<token>`. Secret managers
 * and shells frequently mangle the `|` into `_`; accept both spellings.
 */
export function normalizeLlamaKey(raw: string | undefined): string | undefined {
  const key = raw?.trim();
  if (!key) return undefined;
  const m = /^LLM_(\d+)_(.+)$/.exec(key);
  return m ? `LLM|${m[1]}|${m[2]}` : key;
}

export function llamaProvider(): ProviderConfig {
  return {
    apiKey: normalizeLlamaKey(process.env.LLAMA_API_KEY),
    baseUrl: process.env.LLAMA_BASE_URL ?? LLAMA_DEFAULT_BASE_URL,
    model: process.env.LLAMA_MODEL ?? LLAMA_DEFAULT_MODEL,
  };
}

export function llamaConfigured(): boolean {
  return Boolean(normalizeLlamaKey(process.env.LLAMA_API_KEY));
}
