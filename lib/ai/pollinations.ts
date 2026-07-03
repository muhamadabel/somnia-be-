// Free, key-less AI provider powered by Pollinations.ai.
//
// - Text (analysis, companion, reports): text.pollinations.ai OpenAI-compatible
//   endpoint. No API key, no signup, free. The full dream history is passed in
//   the prompt, so the model genuinely "remembers everything".
// - Images: see lib/ai/image.ts (image.pollinations.ai).
//
// Every call falls back to the offline local engine on error (llm-shared),
// so the app keeps working even if the free service is slow or unreachable.

import { makeLLMProvider, type LLMCall } from "@/lib/ai/llm-shared";

const TEXT_URL = "https://text.pollinations.ai/openai";
// "openai" completes long structured JSON reliably (finish=stop) even with a
// large history prompt; "openai-fast" tends to truncate it. Override with
// POLLINATIONS_MODEL if needed.
const MODEL = process.env.POLLINATIONS_MODEL || "openai";

async function once(model: string, opts: Parameters<LLMCall>[0]): Promise<string> {
  const res = await fetch(TEXT_URL, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      model,
      // max_tokens is REQUIRED — without it long JSON answers get truncated.
      max_tokens: opts.maxTokens ?? 1500,
      messages: [{ role: "system", content: opts.system }, ...opts.messages],
      ...(opts.json ? { response_format: { type: "json_object" } } : {}),
      private: true,
      referrer: "somnia-dream-journal",
    }),
    signal: AbortSignal.timeout(50_000),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Pollinations error ${res.status}: ${body.slice(0, 200)}`);
  }
  const raw = await res.text();
  try {
    const parsed = JSON.parse(raw) as { choices?: Array<{ message?: { content?: string } }> };
    const content = parsed.choices?.[0]?.message?.content;
    if (content) return content;
  } catch {
    /* not the OpenAI envelope — treat the body as plain completion text */
  }
  return raw;
}

// The free service occasionally returns empty content; retry once before the
// provider's own fall-through to the offline local engine kicks in.
const callPollinations: LLMCall = async (opts) => {
  const first = await once(MODEL, opts).catch(() => "");
  if (first.trim().length > 20) return first;
  return once(MODEL, opts);
};

export const pollinationsProvider = makeLLMProvider(
  "pollinations",
  "AI Gratis",
  "pollinations-openai",
  callPollinations
);
