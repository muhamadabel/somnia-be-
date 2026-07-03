// Mesin analisis demo lokal — menggerakkan setiap fitur AI ketika tidak ada
// kunci AI eksternal, sehingga seluruh produk tetap bisa dipakai offline
// (docs/03 alur error: "Lanjut Memakai Jurnal").
//
// Sengaja transparan: deteksi berbasis kamus dengan penjelasan pada setiap
// sinyal (docs/09 explainability). Seluruh keluaran berbahasa Indonesia.

import { EMOTION_KEYWORDS, INTENSIFIERS, SYMBOL_LEXICON, THEME_RULES, symbolLabel, SYMBOL_LABEL_BY_NAME } from "@/lib/ai/lexicon";
import { emotionLabel } from "@/lib/constants";
import type {
  AIProvider,
  DetectedEmotion,
  DetectedSymbol,
  DreamAnalysisResult,
  HistoryContext,
} from "@/lib/ai/types";

function normalize(text: string): string {
  return " " + text.toLowerCase().replace(/[^\p{L}\p{N}\s-]/gu, " ").replace(/\s+/g, " ") + " ";
}

function countMatches(haystack: string, term: string): number {
  let count = 0;
  let idx = haystack.indexOf(term);
  while (idx !== -1) {
    count++;
    idx = haystack.indexOf(term, idx + term.length);
  }
  return count;
}

export function detectEmotions(text: string): DetectedEmotion[] {
  const norm = normalize(text);
  const wordCount = Math.max(20, norm.split(" ").length);
  const intensifierBoost = INTENSIFIERS.reduce((acc, w) => acc + countMatches(norm, ` ${w} `), 0);

  const results: DetectedEmotion[] = [];
  for (const [name, keywords] of Object.entries(EMOTION_KEYWORDS)) {
    let hits = 0;
    const matched: string[] = [];
    for (const kw of keywords) {
      const c = countMatches(norm, kw.includes(" ") ? kw : ` ${kw}`);
      if (c > 0) {
        hits += c;
        if (matched.length < 3) matched.push(kw);
      }
    }
    if (hits > 0) {
      const density = hits / wordCount;
      const intensity = Math.min(95, Math.round(35 + density * 900 + Math.min(15, intensifierBoost * 4) + hits * 6));
      results.push({
        name,
        intensity,
        why: `Kata seperti ${matched.map((m) => `"${m.trim()}"`).join(", ")} menandakan ${emotionLabel(name).toLowerCase()}.`,
      });
    }
  }
  results.sort((a, b) => b.intensity - a.intensity);
  if (results.length === 0) {
    results.push({
      name: "Curiosity",
      intensity: 40,
      why: "Tidak ada kata beremosi kuat, jadi mimpi ini terbaca sebagai penjelajahan yang netral.",
    });
  }
  return results.slice(0, 4);
}

export function detectSymbols(text: string): DetectedSymbol[] {
  const norm = normalize(text);
  const results: DetectedSymbol[] = [];
  for (const entry of SYMBOL_LEXICON) {
    let hits = 0;
    const matched: string[] = [];
    for (const kw of entry.keywords) {
      const c = countMatches(norm, kw.includes(" ") ? kw : ` ${kw}`);
      if (c > 0) {
        hits += c;
        if (matched.length < 2) matched.push(kw);
      }
    }
    if (hits > 0) {
      results.push({
        name: entry.name,
        confidence: Math.min(95, 55 + hits * 12),
        why: `Menyebut ${matched.map((m) => `"${m.trim()}"`).join(" dan ")}.`,
      });
    }
  }
  results.sort((a, b) => b.confidence - a.confidence);
  return results.slice(0, 6);
}

function detectThemes(symbols: DetectedSymbol[]): string[] {
  const names = new Set(symbols.map((s) => s.name));
  const themes: string[] = [];
  for (const rule of THEME_RULES) {
    if (rule.requires.every((r) => names.has(r)) && !themes.includes(rule.theme)) {
      themes.push(rule.theme);
    }
  }
  return themes.slice(0, 3);
}

function firstSentences(text: string, maxChars: number): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= maxChars) return clean;
  const slice = clean.slice(0, maxChars);
  const lastStop = Math.max(slice.lastIndexOf(". "), slice.lastIndexOf("! "), slice.lastIndexOf("? "));
  if (lastStop > maxChars * 0.4) return slice.slice(0, lastStop + 1);
  return slice.replace(/\s+\S*$/, "") + "…";
}

function buildSummary(description: string, symbols: DetectedSymbol[], dominant: string): string {
  const opening = firstSentences(description, 220);
  const symbolPart =
    symbols.length > 0
      ? ` Citra utama: ${symbols.slice(0, 3).map((s) => symbolLabel(s.name).toLowerCase()).join(", ")}.`
      : "";
  return `${opening}${symbolPart} Nada emosi keseluruhan condong ke ${emotionLabel(dominant).toLowerCase()}.`;
}

const REFLECTIONS: Record<string, string[]> = {
  Joy: [
    "Mimpi ini membawa muatan positif yang ringan. Momen bahagia dalam mimpi sering menggemakan kepuasan nyata — sekecil apa pun — yang layak diakui. Coba tanyakan pada dirimu, apa yang diam-diam berjalan baik belakangan ini.",
    "Mimpi yang diwarnai kebahagiaan bisa menjadi pengingat lembut akan hal-hal yang menyuburkanmu. Renungkan bagian mana dari mimpi ini yang terasa paling hidup, dan apakah kehidupan nyata memberi ruang cukup untuk itu.",
  ],
  Calm: [
    "Nada tenang dari mimpi ini menandakan kondisi batin yang settle, atau mungkin kerinduan akannya. Perhatikan elemen mana yang terasa paling aman — mungkin di situlah letak hal yang memulihkanmu.",
    "Mimpi yang damai kerap menyertai masa integrasi, saat pikiran diam-diam menata pengalaman. Ini bisa jadi saat yang baik untuk menjaga rutinitas yang membuatmu stabil.",
  ],
  Excitement: [
    "Ada energi nyata dalam mimpi ini. Antusiasme sering mencerminkan antisipasi akan sebuah perubahan atau kemungkinan. Coba beri nama pada apa yang kamu nantikan — dan bagian mana darinya yang terasa berisiko.",
  ],
  Curiosity: [
    "Mimpi ini punya kualitas menjelajah. Rasa penasaran dalam mimpi sering muncul saat kamu sedang mengolah sesuatu yang baru atau berdiri di ambang keputusan. Apa yang terasa belum terjelajahi dalam hidupmu saat ini?",
  ],
  Love: [
    "Ada benang koneksi yang membentang di mimpi ini. Mimpi tentang kehangatan dan kasih sering mencerminkan hubungan yang penting — atau kebutuhan akan kedekatan yang minta diperhatikan. Siapa yang terlintas saat kamu mencatat ini?",
  ],
  Fear: [
    "Ketakutan dalam mimpi jarang tentang monster di layar; biasanya tentang apa yang diwakilinya. Alih-alih menyingkirkan citranya, mungkin membantu untuk bertanya, apa dalam hidup nyata yang menghadirkan rasa terancam atau kehilangan rasa aman serupa.",
    "Mimpi ini membawa rasa takut yang nyata, dan itu layak disikapi dengan kelembutan, bukan kepanikan. Mimpi menakutkan sering muncul saat pikiran melatih diri menghadapi situasi sulit. Seperti apa 'rasa aman' bagimu minggu ini?",
  ],
  Anxiety: [
    "Tekstur cemas dari mimpi ini menandakan tekanan yang belum sepenuhnya menemukan kata — tenggat, ekspektasi, atau keputusan yang membayangi. Menuliskan kekhawatiran spesifiknya, di atas kertas, sering membuatnya menciut.",
    "Mimpi tentang ketidaksiapan atau terjebak cenderung muncul saat tanggung jawab terasa lebih berat dari biasa. Mungkin patut ditanya: kewajiban mana yang bisa dinegosiasi ulang, dibagi, atau diperkecil?",
  ],
  Sadness: [
    "Ada duka atau kerinduan yang terjalin dalam mimpi ini. Kesedihan dalam mimpi sering mengolah kehilangan yang belum sepenuhnya kita renungi — orang, tempat, atau versi diri kita. Bersikaplah lembut pada apa yang muncul di sini.",
  ],
  Anger: [
    "Kemarahan dalam mimpi kerap menyuarakan batas yang dilanggar saat kamu tetap bersikap sopan. Ada baiknya menanyakan pada siapa — atau pada apa — frustrasi dalam mimpi ini sebenarnya ditujukan.",
  ],
  Confusion: [
    "Kualitas berubah-ubah dan tak pasti dari mimpi ini mencerminkan cara pikiran mengolah ambiguitas. Mimpi yang membingungkan lumrah terjadi di masa transisi. Kejernihan biasanya menyusul setelah sebuah keputusan tertunda diambil.",
  ],
};

const RECOMMENDATIONS: Record<string, string[]> = {
  Joy: ["Tuliskan satu momen nyata minggu ini yang terasa seperti mimpi ini.", "Baca ulang catatan ini saat harimu terasa berat."],
  Calm: ["Jaga satu ritual tenang minggu ini — yang paling menyerupai suasana mimpi ini.", "Catat jam tidurmu; mimpi tenang sering menyusul tidur yang teratur."],
  Excitement: ["Salurkan energi ini: ambil satu langkah kecil nyata menuju hal yang kamu nantikan.", "Catat juga mimpi besok — fase berenergi tinggi sering menghasilkan rangkaian mimpi yang jelas."],
  Curiosity: ["Pilih satu citra dari mimpi ini dan tulis bebas tentangnya selama lima menit.", "Jelajahi entri pustaka simbol untuk citra yang paling menonjol."],
  Love: ["Hubungi seseorang yang mimpi ini ingatkan padanya.", "Perhatikan hubungan mana yang paling sering muncul di mimpimu."],
  Fear: ["Sebelum tidur malam ini, catat apa yang terasa tak aman atau belum tuntas — mengeluarkannya sering meredakan intensitas mimpi.", "Jika ketakutan ini berulang di mimpi lain, baca entri-entri itu bersama dan cari pemicu yang sama."],
  Anxiety: ["Tulis tiga tekanan terbesarmu saat ini, lalu tandai satu yang benar-benar jadi tanggung jawabmu.", "Coba rutinitas menjelang tidur yang lebih santai; mimpi cemas sering menyusul malam yang terburu-buru."],
  Sadness: ["Beri sedikit ruang untuk perasaan ini hari ini — jalan kaki, musik, atau menulis beberapa baris jujur.", "Jika kehilangan dalam mimpi ini baru terjadi, pertimbangkan membagikan catatannya pada orang yang kamu percaya."],
  Anger: ["Tulis pesan yang tak terkirim: katakan — di atas kertas — apa yang ingin dikatakan versi dirimu dalam mimpi.", "Periksa apakah ada batas yang perlu ditegaskan ulang dalam hidup nyata."],
  Confusion: ["Baca ulang catatan ini tiga hari lagi; jarak sering menyingkap benang merahnya.", "Catat keputusan yang sedang kamu tunda — mimpi bingung sering mengitarinya."],
};

const QUESTIONS: Record<string, string[]> = {
  Joy: ["Apa dalam hidupmu yang paling mirip dengan momen terbaik mimpi ini?", "Apa yang dibutuhkan agar lebih banyak harimu terasa seperti ini?"],
  Calm: ["Di mana kamu merasa seaman ini saat terjaga?", "Rutinitas apa yang membantumu kembali ke keadaan ini?"],
  Excitement: ["Perubahan apa yang mungkin ditunjuk energi ini?", "Apa langkah kecil pertama yang bisa kamu ambil menujunya?"],
  Curiosity: ["Citra mana dari mimpi ini yang terus kamu pikirkan — dan mengapa?", "Minat apa yang belum terjelajahi yang terus muncul belakangan ini?"],
  Love: ["Siapa yang pertama terlintas karena mimpi ini?", "Jenis koneksi seperti apa yang kamu rasa lebih kamu butuhkan sekarang?"],
  Fear: ["Jika elemen menakutkan dari mimpi ini adalah pesan, tentang apa ia memperingatkanmu?", "Apa yang membantumu merasa membumi setelah mimpi seperti ini?"],
  Anxiety: ["Tekanan nyata mana yang paling mirip dengan situasi dalam mimpi ini?", "Satu komitmen apa yang bisa kamu ringankan minggu ini?"],
  Sadness: ["Apa — atau siapa — yang mungkin sedang dibantu mimpi ini untuk kamu lepaskan?", "Seperti apa rasa nyaman bagimu hari ini?"],
  Anger: ["Batas apa yang mungkin sedang dibela mimpi ini?", "Apa yang akan kamu katakan jika tak ada konsekuensinya?"],
  Confusion: ["Keputusan apa yang sedang kamu pertimbangkan?", "Jika pemandangan berubah-ubah dalam mimpi itu adalah suasana hati, kamu menyebutnya apa?"],
};

function pick<T>(arr: T[], seedText: string): T {
  let h = 0;
  for (let i = 0; i < seedText.length; i++) h = (h * 31 + seedText.charCodeAt(i)) >>> 0;
  return arr[h % arr.length];
}

function buildPatternNote(symbols: DetectedSymbol[], history: HistoryContext): string | null {
  const recurring = history.recurringSymbols.filter((r) =>
    symbols.some((s) => (SYMBOL_LABEL_BY_NAME[s.name] ?? s.name) === r.name || s.name === r.name)
  );
  if (recurring.length === 0) return null;
  const parts = recurring
    .slice(0, 3)
    .map((r) => `"${symbolLabel(r.name)}" kini muncul di ${r.count + 1} dari ${history.totalDreams + 1} mimpimu`);
  return `Pola berulang: ${parts.join("; ")}. Simbol yang kembali sesering ini biasanya menyimpan makna pribadi yang patut dijelajahi — ini ditandai karena citra yang sama terus muncul di malam-malam berbeda, bukan karena satu mimpi tertentu.`;
}

// ── Implementasi provider ──────────────────────────────────────────────

export const localProvider: AIProvider = {
  id: "local-demo",
  label: "Mesin Demo Bawaan",

  async analyzeDream({ title, description, mood, history }) {
    const text = `${title ?? ""}. ${description}`;
    const emotions = detectEmotions(text);
    const symbols = detectSymbols(text);
    const themes = detectThemes(symbols);
    const dominant = emotions[0];

    // Suasana hati setelah bangun menyesuaikan pembacaan intensitas (docs/01 fitur 1).
    let intensity = dominant.intensity;
    if (mood === "bad" || mood === "low") intensity = Math.min(100, intensity + 8);
    if (mood === "great") intensity = Math.max(10, intensity - 5);

    const reflectionPool = REFLECTIONS[dominant.name] ?? REFLECTIONS.Curiosity;
    const patternNote = buildPatternNote(symbols, history);

    const result: DreamAnalysisResult = {
      summary: buildSummary(description, symbols, dominant.name),
      dominantEmotion: dominant.name,
      emotionIntensity: intensity,
      emotions,
      symbols,
      themes,
      reflection:
        pick(reflectionPool, description) +
        (themes.length > 0
          ? ` Mimpi ini juga menyentuh tema ${themes[0].toLowerCase()} — ${THEME_RULES.find((t) => t.theme === themes[0])?.description ?? ""}.`
          : ""),
      recommendations: (RECOMMENDATIONS[dominant.name] ?? RECOMMENDATIONS.Curiosity).slice(0, 2),
      suggestedQuestions: (QUESTIONS[dominant.name] ?? QUESTIONS.Curiosity).slice(0, 2),
      patternNote,
      confidence: Math.min(0.9, 0.45 + Math.min(0.25, description.length / 2000) + symbols.length * 0.04),
      provider: "local-demo",
      model: "lexicon-v1",
    };
    return result;
  },

  async companionReply({ question, history, memoryEnabled }) {
    const q = normalize(question);

    const greeting = /( hi | hello | hey | halo | hai | pagi | malam )/.test(q) && question.length < 30;
    if (greeting) {
      return "Halo! Aku teman mimpimu — aku bisa menelaah seluruh mimpi yang kamu catat untuk membantumu melihat pola, simbol yang berulang, dan tren emosi. Coba tanya sesuatu seperti \"simbol apa yang sering muncul di mimpiku?\" atau \"bagaimana perasaan mimpiku belakangan ini?\"";
    }

    if (!memoryEnabled) {
      return "Aku senang bisa menjawab berdasarkan riwayat mimpimu, tapi memori AI sedang nonaktif di pengaturan privasimu. Kamu bisa mengaktifkannya di Pengaturan → Privasi, atau tanyakan sesuatu yang lebih umum tentang menulis jurnal mimpi.";
    }

    if (history.totalDreams === 0) {
      return "Kamu belum mencatat mimpi apa pun, jadi aku belum punya riwayat untuk ditelaah. Catat mimpi pertamamu, dan aku akan mulai memperhatikan emosi, simbol, serta pola yang bisa kamu tanyakan padaku.";
    }

    // Maksud: simbol/pola berulang
    if (/(symbol|pattern|recurring|repeat|often|berulang|simbol|pola|sering)/.test(q)) {
      if (history.recurringSymbols.length === 0) {
        return `Dari ${history.totalDreams} mimpi yang kamu catat, belum ada simbol yang berulang — tiap mimpi masih cukup berbeda. Seiring kamu mencatat lebih banyak, aku akan menunjuk citra yang kembali muncul. Adakah citra dari mimpi terbaru yang masih membekas?`;
      }
      const top = history.recurringSymbols.slice(0, 3);
      const lines = top.map((s) => `• ${symbolLabel(s.name)} — muncul di ${s.count} mimpi`).join("\n");
      return `Menelaah ${history.totalDreams} mimpimu, simbol-simbol ini terus kembali:\n\n${lines}\n\nSimbol berulang biasanya menyimpan makna pribadi: ia muncul saat pikiran mengitari kekhawatiran atau harapan yang sama. Apakah ${symbolLabel(top[0].name).toLowerCase()} berkaitan dengan sesuatu yang sedang terjadi dalam hidupmu?`;
    }

    // Maksud: emosi/perasaan/tren
    if (/(feel|feeling|emotion|mood|trend|lately|akhir-akhir|perasaan|emosi|rasa)/.test(q)) {
      if (history.emotionCounts.length === 0) {
        return "Aku belum punya data emosi — buat analisis AI pada mimpimu, dan aku akan bisa menggambarkan bagaimana suasana mimpimu bergerak.";
      }
      const top = history.emotionCounts.slice(0, 3);
      const positives = history.emotionCounts.filter((e) => e.tone === "positive").reduce((a, b) => a + b.count, 0);
      const total = history.emotionCounts.reduce((a, b) => a + b.count, 0);
      const ratio = total > 0 ? Math.round((positives / total) * 100) : 0;
      return `Belakangan, emosi yang paling hadir dalam mimpimu adalah ${top.map((t) => emotionLabel(t.name).toLowerCase()).join(", ")}. Sekitar ${ratio}% sinyal emosinya condong positif.\n\nIngat, ini mencerminkan mimpimu, bukan ukuran klinis — tapi suasana mimpi sering menggemakan tekanan dan istirahat di kehidupan nyata. Apakah keseimbangan itu cocok dengan bagaimana hari-harimu terasa?`;
    }

    // Maksud: tentang mimpi/topik tertentu → ambil mimpi yang paling cocok
    const qWords = new Set(q.split(" ").filter((w) => w.length > 3));
    const scored = history.recentDreams
      .map((d) => {
        const dText = normalize(`${d.title ?? ""} ${d.description} ${d.symbols.join(" ")}`);
        let score = 0;
        for (const w of qWords) if (dText.includes(` ${w}`)) score++;
        return { d, score };
      })
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 2);

    if (scored.length > 0) {
      const refs = scored
        .map(({ d }) => `• "${d.title ?? "Mimpi tanpa judul"}" (${d.dreamDate})${d.symbols.length ? ` — simbol: ${d.symbols.map((s) => symbolLabel(s)).join(", ")}` : ""}`)
        .join("\n");
      return `Itu berkaitan dengan apa yang pernah kamu catat. Yang paling cocok di jurnalmu:\n\n${refs}\n\nMimpi yang kembali ke wilayah yang sama sering berarti perasaan di baliknya belum selesai diolah. Membandingkan entri-entri itu berdampingan, apa yang terasa sama — dan apa yang sudah berubah?`;
    }

    // Cadangan: jawaban reflektif
    return `Pertanyaan yang bagus. Dari ${history.totalDreams} mimpi yang kamu catat, benang terkuat yang bisa kulihat adalah ${
      history.recurringSymbols[0]
        ? `simbol berulang "${symbolLabel(history.recurringSymbols[0].name)}"`
        : history.emotionCounts[0]
          ? `emosi ${emotionLabel(history.emotionCounts[0].name).toLowerCase()}`
          : "masih terbentuk — beberapa entri lagi akan mempertajamnya"
    }. Aku tak bisa memberi kepastian (dan tak ingin — mimpi itu pribadi), tapi langkah bagus berikutnya adalah membaca ulang beberapa entri terakhir dan memperhatikan apa yang menyita perhatianmu. Apa yang membuatmu bertanya ini hari ini?`;
  },

  async reportObservations({ periodLabel, stats }) {
    const observations: string[] = [];
    if (stats.dreamCount === 0) {
      return {
        observations: ["Tidak ada mimpi yang tercatat di periode ini, jadi belum ada yang bisa dibandingkan."],
        reflection: "Minggu yang kosong pun adalah informasi — mungkin tidur kurang, atau pagi terburu-buru. Jika menulis jurnal penting bagimu, coba letakkan jurnalmu dalam jangkauan besok pagi.",
      };
    }
    observations.push(
      `Kamu mencatat ${stats.dreamCount} mimpi ${periodLabel}${stats.streak > 1 ? `, termasuk streak ${stats.streak} hari` : ""}.`
    );
    if (stats.topEmotions[0]) {
      const t = stats.topEmotions[0];
      observations.push(
        `${emotionLabel(t.name)} adalah emosi mimpi paling sering (${t.count}×) — terdeteksi dari pilihan kata beremosi di seluruh entri, itulah mengapa ia memimpin laporan ini.`
      );
    }
    const pct = Math.round(stats.positiveRatio * 100);
    observations.push(
      pct >= 60
        ? `${pct}% sinyal emosi condong positif — kehidupan mimpimu terasa ringan di periode ini.`
        : pct >= 40
          ? `Sinyal emosi seimbang (${pct}% positif) — campuran mimpi ringan dan berat.`
          : `Hanya ${pct}% sinyal yang condong positif — mimpimu membawa nada yang lebih berat dari biasa. Layak untuk bersikap lembut pada diri sendiri.`
    );
    if (stats.topSymbols[0]) {
      observations.push(
        `Simbol "${symbolLabel(stats.topSymbols[0].name)}" muncul ${stats.topSymbols[0].count}× — citra berulang seperti ini sering mengitari sebuah kekhawatiran atau harapan yang sedang berlangsung.`
      );
    }
    if (stats.avgSleep) {
      observations.push(`Rata-rata tidur yang dilaporkan ${stats.avgSleep.toFixed(1)} jam.`);
    }
    const reflection =
      pct >= 55
        ? "Secara keseluruhan periode ini terbaca stabil. Pertahankan rutinitas yang menopangnya — pencatatan yang konsisten mempertajam setiap insight ke depan."
        : "Periode ini membawa nada yang lebih berat. Itu bukan vonis, hanya pola yang patut diperhatikan: tekanan dalam hidup nyata cenderung sampai lebih dulu ke mimpi. Pertimbangkan satu kewajiban yang bisa diringankan, dan teruslah mencatat — tren baru terlihat seiring bertambahnya riwayat.";
    return { observations, reflection };
  },
};
