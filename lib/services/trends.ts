// Emotional Trend service (docs/06) — all aggregation happens on the
// backend; the frontend only renders.

import { db } from "@/lib/db";
import { EMOTION_TONE, EMOTION_COLOR, emotionLabel } from "@/lib/constants";

export interface TrendData {
  range: number; // days
  daily: Array<{ date: string; label: string; positive: number; negative: number; count: number; score: number | null }>;
  frequency: Array<{ name: string; count: number; color: string; tone: string }>;
  dominant: { name: string; count: number; color: string } | null;
  positiveRatio: number | null;
  totalDreams: number;
  observation: string;
}

export async function getTrends(userId: string, rangeDays: number): Promise<TrendData> {
  const since = new Date();
  since.setDate(since.getDate() - rangeDays + 1);
  since.setHours(0, 0, 0, 0);

  const dreams = await db.dream.findMany({
    where: { userId, deletedAt: null, isDraft: false, dreamDate: { gte: since } },
    include: { emotions: { include: { emotion: true } } },
    orderBy: { dreamDate: "asc" },
  });

  // Build day buckets
  const days = new Map<string, { positive: number; negative: number; count: number; weighted: number; weight: number }>();
  for (let i = 0; i < rangeDays; i++) {
    const d = new Date(since);
    d.setDate(since.getDate() + i);
    days.set(d.toISOString().slice(0, 10), { positive: 0, negative: 0, count: 0, weighted: 0, weight: 0 });
  }

  const freq = new Map<string, number>();
  for (const dream of dreams) {
    const key = dream.dreamDate.toISOString().slice(0, 10);
    const bucket = days.get(key);
    if (bucket) bucket.count++;
    for (const de of dream.emotions) {
      freq.set(de.emotion.name, (freq.get(de.emotion.name) ?? 0) + 1);
      if (!bucket) continue;
      const tone = de.emotion.tone;
      if (tone === "positive") bucket.positive++;
      if (tone === "negative") bucket.negative++;
      // score: positive intensity pushes up, negative pushes down (0..100 scale, 50 = neutral)
      const dir = tone === "positive" ? 1 : tone === "negative" ? -1 : 0;
      bucket.weighted += 50 + dir * (de.intensity / 2);
      bucket.weight++;
    }
  }

  const daily = [...days.entries()].map(([date, b]) => ({
    date,
    label: new Date(date + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    positive: b.positive,
    negative: b.negative,
    count: b.count,
    score: b.weight > 0 ? Math.round(b.weighted / b.weight) : null,
  }));

  const frequency = [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({
      name,
      count,
      color: EMOTION_COLOR[name] ?? "#94a3b8",
      tone: EMOTION_TONE[name] ?? "neutral",
    }));

  const totalSignals = frequency.reduce((a, f) => a + f.count, 0);
  const positives = frequency.filter((f) => f.tone === "positive").reduce((a, f) => a + f.count, 0);
  const positiveRatio = totalSignals > 0 ? positives / totalSignals : null;

  const dominant = frequency[0]
    ? { name: frequency[0].name, count: frequency[0].count, color: frequency[0].color }
    : null;

  let observation: string;
  if (dreams.length === 0) {
    observation = "Belum ada mimpi di periode ini — catat mimpi dan buat analisisnya untuk melihat tren terbentuk.";
  } else if (positiveRatio === null) {
    observation = "Ada mimpi di periode ini tapi belum dianalisis. Buat analisis AI untuk membuka tren emosi.";
  } else {
    const pct = Math.round(positiveRatio * 100);
    const dom = dominant ? `${emotionLabel(dominant.name)} paling sering muncul (${dominant.count}×), terdeteksi dari pilihan kata beremosi di entrimu. ` : "";
    observation =
      pct >= 60
        ? `${dom}Secara keseluruhan, ${pct}% sinyal emosi condong positif — periode yang ringan untuk kehidupan mimpimu.`
        : pct >= 40
          ? `${dom}Mimpimu seimbang secara emosi (${pct}% positif) — tema ringan dan berat sama-sama sedang diolah.`
          : `${dom}Hanya ${pct}% sinyal yang condong positif, jadi periode ini membawa nada lebih berat. Suasana mimpi sering mencerminkan tekanan saat terjaga; renungkan apa yang membebanimu.`;
  }

  return { range: rangeDays, daily, frequency, dominant, positiveRatio, totalDreams: dreams.length, observation };
}

/** Consecutive-day dream streak ending today or yesterday. */
export async function getStreak(userId: string): Promise<number> {
  const dreams = await db.dream.findMany({
    where: { userId, deletedAt: null, isDraft: false },
    select: { dreamDate: true },
    orderBy: { dreamDate: "desc" },
    take: 400,
  });
  const dates = new Set(dreams.map((d) => d.dreamDate.toISOString().slice(0, 10)));
  const day = new Date();
  day.setHours(12, 0, 0, 0);
  // streak may start today or yesterday
  if (!dates.has(day.toISOString().slice(0, 10))) day.setDate(day.getDate() - 1);
  let streak = 0;
  while (dates.has(day.toISOString().slice(0, 10))) {
    streak++;
    day.setDate(day.getDate() - 1);
  }
  return streak;
}
