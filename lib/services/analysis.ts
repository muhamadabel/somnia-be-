// Dream Analysis service (docs/06 Dream Analysis module).
// Generates versioned AI insight for a dream and synchronizes the
// dream's current emotions/symbols. Never mutates the dream itself.

import { db } from "@/lib/db";
import { buildHistoryContext, getAIProvider } from "@/lib/ai";
import { EMOTIONS } from "@/lib/constants";
import { SYMBOL_LEXICON } from "@/lib/ai/lexicon";
import { notFound } from "@/lib/api";
import type { Analysis } from "@prisma/client";

export async function generateAnalysis(dreamId: string, userId: string): Promise<Analysis> {
  const dream = await db.dream.findFirst({
    where: { id: dreamId, userId, deletedAt: null },
  });
  if (!dream) throw notFound("Dream");

  const history = await buildHistoryContext(userId, dreamId);
  const provider = getAIProvider();
  const result = await provider.analyzeDream({
    title: dream.title,
    description: dream.description,
    mood: dream.mood,
    history,
  });

  const lastVersion = await db.analysis.findFirst({
    where: { dreamId },
    orderBy: { version: "desc" },
    select: { version: true },
  });

  const analysis = await db.analysis.create({
    data: {
      dreamId,
      version: (lastVersion?.version ?? 0) + 1,
      summary: result.summary,
      reflection: result.reflection,
      dominantEmotion: result.dominantEmotion,
      emotionIntensity: result.emotionIntensity,
      themes: JSON.stringify(result.themes),
      recommendations: JSON.stringify(result.recommendations),
      suggestedQuestions: JSON.stringify(result.suggestedQuestions),
      patternNote: result.patternNote,
      emotionsJson: JSON.stringify(result.emotions),
      symbolsJson: JSON.stringify(result.symbols),
      confidence: result.confidence,
      provider: result.provider,
      model: result.model,
    },
  });

  // Sync the dream's *current* structured emotions/symbols to the latest
  // analysis (versions keep their own snapshots in emotionsJson/symbolsJson).
  await db.dreamEmotion.deleteMany({ where: { dreamId } });
  for (const e of result.emotions) {
    const known = EMOTIONS.find((k) => k.name.toLowerCase() === e.name.toLowerCase());
    if (!known) continue;
    const emotion = await db.emotion.upsert({
      where: { name: known.name },
      create: { name: known.name, tone: known.tone, color: known.color, description: known.description },
      update: {},
    });
    await db.dreamEmotion.create({
      data: { dreamId, emotionId: emotion.id, intensity: e.intensity },
    });
  }

  await db.dreamSymbol.deleteMany({ where: { dreamId } });
  for (const s of result.symbols) {
    const lex = SYMBOL_LEXICON.find((l) => l.name.toLowerCase() === s.name.toLowerCase());
    const slug = (lex?.slug ?? s.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")) || "symbol";
    if (!slug) continue;
    const symbol = await db.symbol.upsert({
      where: { slug },
      create: {
        name: lex?.name ?? s.name,
        slug,
        category: lex?.category ?? "Object",
        description: lex?.description ?? `The symbol "${s.name}" detected in dreams.`,
        interpretation:
          lex?.interpretation ??
          `"${s.name}" appeared in your dream. Personal symbols like this gain meaning through repetition — notice how it behaves next time it appears.`,
        relatedEmotions: JSON.stringify(lex?.relatedEmotions ?? []),
      },
      update: {},
    });
    await db.dreamSymbol.create({
      data: { dreamId, symbolId: symbol.id, confidence: s.confidence },
    });
  }

  return analysis;
}
