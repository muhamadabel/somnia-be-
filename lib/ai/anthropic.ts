// Claude provider — used automatically when ANTHROPIC_API_KEY is set.
// All prompt logic lives in llm-shared; here we only wire up the HTTP call.

import { makeLLMProvider, type LLMCall } from "@/lib/ai/llm-shared";

const API_URL = "https://api.anthropic.com/v1/messages";
const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-5";

const callClaude: LLMCall = async ({ system, messages, maxTokens }) => {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY ?? "",
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({ model: MODEL, max_tokens: maxTokens ?? 1500, system, messages }),
    signal: AbortSignal.timeout(60_000),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Claude API error ${res.status}: ${body.slice(0, 300)}`);
  }
  const json = (await res.json()) as { content: Array<{ type: string; text?: string }> };
  return json.content.filter((b) => b.type === "text").map((b) => b.text ?? "").join("");
};

export const anthropicProvider = makeLLMProvider("anthropic", "Claude", MODEL, callClaude);
