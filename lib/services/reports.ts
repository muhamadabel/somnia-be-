// Wellness Report service (docs/06) — aggregates historical dream data
// into a periodic reflection. Reports never modify original records
// (docs/02 rule 6).

import { db } from "@/lib/db";
import { getAIProvider } from "@/lib/ai";
import { getStreak } from "@/lib/services/trends";
import { EMOTION_TONE, EMOTION_COLOR } from "@/lib/constants";
import type { Report } from "@prisma/client";

export interface ReportContent {
  stats: {
    dreamCount: number;
    analyzedCount: number;
    avgSleep: number | null;
    streak: number;
    positiveRatio: number | null;
  };
  emotions: Array<{ name: string; count: number; color: string; tone: string }>;
  symbols: Array<{ name: string; count: number }>;
  highlights: Array<{ id: string; title: string; date: string; dominantEmotion: string | null; intensity: number | null }>;
  observations: string[];
  reflection: string;
}

function periodRange(period: "weekly" | "monthly" | "yearly"): { start: Date; end: Date; label: string } {
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  const start = new Date(end);
  if (period === "weekly") start.setDate(end.getDate() - 6);
  if (period === "monthly") start.setDate(end.getDate() - 29);
  if (period === "yearly") start.setDate(end.getDate() - 364);
  start.setHours(0, 0, 0, 0);
  const label =
    period === "weekly" ? "dalam 7 hari terakhir" : period === "monthly" ? "dalam 30 hari terakhir" : "dalam setahun terakhir";
  return { start, end, label };
}

export async function generateReport(userId: string, period: "weekly" | "monthly" | "yearly"): Promise<Report> {
  const { start, end, label } = periodRange(period);

  const dreams = await db.dream.findMany({
    where: { userId, deletedAt: null, isDraft: false, dreamDate: { gte: start, lte: end } },
    include: {
      emotions: { include: { emotion: true } },
      symbols: { include: { symbol: true } },
      analyses: { orderBy: { version: "desc" }, take: 1 },
    },
    orderBy: { dreamDate: "desc" },
  });

  const emotionMap = new Map<string, number>();
  const symbolMap = new Map<string, number>();
  let sleepSum = 0;
  let sleepCount = 0;
  for (const d of dreams) {
    for (const e of d.emotions) emotionMap.set(e.emotion.name, (emotionMap.get(e.emotion.name) ?? 0) + 1);
    for (const s of d.symbols) symbolMap.set(s.symbol.name, (symbolMap.get(s.symbol.name) ?? 0) + 1);
    if (d.sleepDuration) {
      sleepSum += d.sleepDuration;
      sleepCount++;
    }
  }

  const emotions = [...emotionMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({ name, count, color: EMOTION_COLOR[name] ?? "#94a3b8", tone: EMOTION_TONE[name] ?? "neutral" }));
  const symbols = [...symbolMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, count]) => ({ name, count }));

  const totalSignals = emotions.reduce((a, e) => a + e.count, 0);
  const positives = emotions.filter((e) => e.tone === "positive").reduce((a, e) => a + e.count, 0);
  const positiveRatio = totalSignals > 0 ? positives / totalSignals : null;
  const streak = await getStreak(userId);
  const avgSleep = sleepCount > 0 ? sleepSum / sleepCount : null;

  const provider = getAIProvider();
  const ai = await provider.reportObservations({
    periodLabel: label,
    stats: {
      dreamCount: dreams.length,
      topEmotions: emotions.slice(0, 5),
      topSymbols: symbols.slice(0, 5),
      positiveRatio: positiveRatio ?? 0.5,
      avgSleep,
      streak,
    },
  });

  const highlights = dreams
    .filter((d) => d.analyses[0])
    .sort((a, b) => (b.analyses[0]?.emotionIntensity ?? 0) - (a.analyses[0]?.emotionIntensity ?? 0))
    .slice(0, 3)
    .map((d) => ({
      id: d.id,
      title: d.title ?? "Untitled dream",
      date: d.dreamDate.toISOString().slice(0, 10),
      dominantEmotion: d.analyses[0]?.dominantEmotion ?? null,
      intensity: d.analyses[0]?.emotionIntensity ?? null,
    }));

  const content: ReportContent = {
    stats: {
      dreamCount: dreams.length,
      analyzedCount: dreams.filter((d) => d.analyses.length > 0).length,
      avgSleep,
      streak,
      positiveRatio,
    },
    emotions,
    symbols,
    highlights,
    observations: ai.observations,
    reflection: ai.reflection,
  };

  const titles = { weekly: "Laporan Kesejahteraan Mingguan", monthly: "Laporan Kesejahteraan Bulanan", yearly: "Laporan Kesejahteraan Tahunan" };
  return db.report.create({
    data: {
      userId,
      period,
      periodStart: start,
      periodEnd: end,
      title: titles[period],
      content: JSON.stringify(content),
      provider: provider.id,
    },
  });
}
