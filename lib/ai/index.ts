import { anthropicProvider } from "@/lib/ai/anthropic";
import { pollinationsProvider } from "@/lib/ai/pollinations";
import { localProvider } from "@/lib/ai/local";
import type { AIProvider, HistoryContext } from "@/lib/ai/types";
import { db } from "@/lib/db";
import { EMOTION_TONE } from "@/lib/constants";

// Free hybrid: the conversational companion uses the real free LLM
// (Pollinations) so it genuinely "remembers everything" across the whole
// journal, while structured analysis + reports use the instant, always-on
// local engine (a live free LLM is too slow/inconsistent for strict JSON
// under demo load). Both are free; images use Pollinations separately.
const freeHybridProvider: AIProvider = {
  id: "pollinations",
  label: "AI Gratis",
  analyzeDream: (input) => localProvider.analyzeDream(input),
  reportObservations: (input) => localProvider.reportObservations(input),
  companionReply: (input) => pollinationsProvider.companionReply(input),
};

/**
 * Select the active AI provider (provider-agnostic by design, docs/09):
 *   1. Claude       — if ANTHROPIC_API_KEY is set (real AI for everything).
 *   2. Free hybrid  — default: free real-LLM companion + AI images, reliable
 *                     local analysis. No API key, no signup.
 *   3. Local engine — fully offline (AI_MODE=local).
 */
export function getAIProvider(): AIProvider {
  if (process.env.ANTHROPIC_API_KEY) return anthropicProvider;
  if (process.env.AI_MODE === "local") return localProvider;
  return freeHybridProvider;
}

/** Whether AI image generation should use the free Pollinations service. */
export function aiImagesEnabled(): boolean {
  return process.env.AI_MODE !== "local";
}

export function aiModeLabel(): { id: string; label: string } {
  const p = getAIProvider();
  const label =
    p.id === "anthropic" ? "Claude AI" : p.id === "pollinations" ? "AI Gratis" : "Mode Demo";
  return { id: p.id, label };
}

/**
 * Build the historical context supplied to every AI request
 * (docs/09 context strategy: current dream + history + trends).
 * Only the authenticated user's own data is ever included (docs/10 AI security).
 */
export async function buildHistoryContext(userId: string, excludeDreamId?: string): Promise<HistoryContext> {
  const dreams = await db.dream.findMany({
    where: {
      userId,
      deletedAt: null,
      isDraft: false,
      ...(excludeDreamId ? { id: { not: excludeDreamId } } : {}),
    },
    orderBy: { dreamDate: "desc" },
    take: 60,
    include: {
      symbols: { include: { symbol: true } },
      analyses: { orderBy: { version: "desc" }, take: 1 },
      emotions: { include: { emotion: true } },
    },
  });

  const symbolCounts = new Map<string, number>();
  const emotionCounts = new Map<string, number>();
  for (const d of dreams) {
    for (const s of d.symbols) {
      symbolCounts.set(s.symbol.name, (symbolCounts.get(s.symbol.name) ?? 0) + 1);
    }
    for (const e of d.emotions) {
      emotionCounts.set(e.emotion.name, (emotionCounts.get(e.emotion.name) ?? 0) + 1);
    }
  }

  return {
    totalDreams: dreams.length,
    // Up to 20 recent dreams verbatim; the aggregate tallies below cover the
    // rest of the journal so the model has the whole picture.
    recentDreams: dreams.slice(0, 20).map((d) => ({
      title: d.title,
      description: d.description.slice(0, 400),
      dreamDate: d.dreamDate.toISOString().slice(0, 10),
      dominantEmotion: d.analyses[0]?.dominantEmotion ?? null,
      symbols: d.symbols.map((s) => s.symbol.name),
    })),
    recurringSymbols: [...symbolCounts.entries()]
      .filter(([, c]) => c >= 2)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12)
      .map(([name, count]) => ({ name, count })),
    emotionCounts: [...emotionCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => ({ name, count, tone: EMOTION_TONE[name] ?? "neutral" })),
  };
}
