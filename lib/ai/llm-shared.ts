// Shared LLM plumbing for every real-model provider (Claude, Pollinations,
// or any future one). A provider only supplies a `call()` function that
// turns {system, messages} into text; everything else — prompt building,
// JSON extraction, defensive normalization, and graceful fallback to the
// offline local engine — lives here so the providers stay tiny.

import { EMOTIONS, emotionLabel } from "@/lib/constants";
import { SYMBOL_LEXICON, symbolLabel } from "@/lib/ai/lexicon";
import { localProvider } from "@/lib/ai/local";
import type { AIProvider, DreamAnalysisResult, HistoryContext } from "@/lib/ai/types";

export const SAFETY_RULES = `Aturan keselamatan yang selalu wajib kamu patuhi:
- Kamu adalah asisten jurnal reflektif, BUKAN profesional medis atau psikologi.
- Jangan pernah mendiagnosis penyakit mental, meramal masa depan, atau mengklaim kepastian gaib.
- Bingkai setiap insight sebagai kemungkinan reflektif ("ini mungkin menandakan", "kamu bisa bertanya pada dirimu"), bukan fakta.
- Bersikap tenang, mendukung, hormat, penuh rasa ingin tahu, dan tidak menghakimi.
- Jika isi mimpi menunjukkan pengguna mungkin dalam krisis, sarankan lembut untuk bicara dengan orang yang dipercaya atau profesional — tanpa mendiagnosis.
- SELALU tulis seluruh jawaban dalam Bahasa Indonesia yang hangat dan natural.`;

export function extractJson<T>(text: string): T {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const body = (fenced ? fenced[1] : text).trim();
  const start = body.indexOf("{");
  if (start === -1) throw new Error("Tidak ada objek JSON dalam keluaran model");
  const raw = body.slice(start);

  // 1) Fast path: parse from first { to last }.
  const end = raw.lastIndexOf("}");
  if (end !== -1) {
    try {
      return JSON.parse(raw.slice(0, end + 1)) as T;
    } catch {
      /* fall through to repair */
    }
  }
  // 2) Repair truncated / trailing-comma JSON by balancing brackets.
  return JSON.parse(repairJson(raw)) as T;
}

/** Best-effort repair for slightly-malformed or truncated LLM JSON. */
function repairJson(raw: string): string {
  const stack: string[] = [];
  let inStr = false;
  let esc = false;
  let out = "";
  for (const c of raw) {
    if (esc) { esc = false; out += c; continue; }
    if (c === "\\") { esc = true; out += c; continue; }
    if (c === '"') { inStr = !inStr; out += c; continue; }
    if (!inStr) {
      if (c === "{") stack.push("}");
      else if (c === "[") stack.push("]");
      else if (c === "}" || c === "]") stack.pop();
    }
    out += c;
  }
  if (inStr) out += '"'; // close a dangling string
  out = out.replace(/,\s*$/, ""); // drop trailing comma
  out = out.replace(/"\s*:\s*$/, '": null'); // dangling key → null
  while (stack.length) out += stack.pop(); // close open brackets in order
  return out;
}

// Full-history context so the model can genuinely "remember everything":
// up to 15 recent dreams verbatim + aggregate symbol/emotion tallies that
// summarize the entire journal.
export function historyBlock(history: HistoryContext): string {
  if (history.totalDreams === 0) return "Pengguna belum mencatat mimpi apa pun.";
  const recent = history.recentDreams
    .slice(0, 15)
    .map(
      (d) =>
        `- [${d.dreamDate}] "${d.title ?? "Tanpa judul"}": ${d.description.slice(0, 220)}${
          d.symbols.length ? ` (simbol: ${d.symbols.map((s) => symbolLabel(s)).join(", ")})` : ""
        }`
    )
    .join("\n");
  const recurring = history.recurringSymbols
    .slice(0, 10)
    .map((s) => `${symbolLabel(s.name)} (${s.count}×)`)
    .join(", ");
  const emotions = history.emotionCounts
    .slice(0, 8)
    .map((e) => `${emotionLabel(e.name)} (${e.count}×)`)
    .join(", ");
  return `Pengguna telah mencatat total ${history.totalDreams} mimpi.
Mimpi terbaru (paling relevan):
${recent}
Simbol yang berulang di seluruh jurnal: ${recurring || "belum ada"}
Emosi yang sering muncul: ${emotions || "belum ada"}`;
}

const KNOWN_EMOTIONS = EMOTIONS.map((e) => e.name).join(", ");
const KNOWN_SYMBOLS = SYMBOL_LEXICON.map((s) => s.name).join(", ");

function analyzeSystem(): string {
  return `Kamu menganalisis entri jurnal mimpi untuk aplikasi kesadaran diri yang reflektif.
${SAFETY_RULES}

Kembalikan HANYA objek JSON dengan bentuk persis ini (tanpa teks di luar JSON).
PENTING: nilai "name" pada emotions/dominantEmotion HARUS berupa salah satu kata Inggris dari daftar (dipakai sebagai kunci internal), tetapi SEMUA teks penjelasan ("why", "summary", "reflection", "themes", "recommendations", "suggestedQuestions", "patternNote") WAJIB Bahasa Indonesia.
{
  "summary": "ringkasan netral 2 kalimat dalam Bahasa Indonesia",
  "dominantEmotion": "salah satu dari: ${KNOWN_EMOTIONS}",
  "emotionIntensity": 0-100,
  "emotions": [{"name": "salah satu dari daftar di atas (kata Inggris)", "intensity": 0-100, "why": "alasan singkat maks 12 kata"}],
  "symbols": [{"name": "utamakan dari: ${KNOWN_SYMBOLS} — atau simbol baru 1-2 kata jika jelas ada", "confidence": 0-100, "why": "alasan singkat maks 12 kata"}],
  "themes": ["maksimal 3 nama tema singkat"],
  "reflection": "3-4 kalimat insight reflektif yang mendukung, merujuk riwayat mimpi bila relevan",
  "recommendations": ["2 saran singkat & actionable"],
  "suggestedQuestions": ["2 pertanyaan reflektif singkat"],
  "patternNote": "jika ada simbol/emosi berulang di riwayat, jelaskan singkat + alasan ditandai; jika tidak, null",
  "confidence": 0.0-1.0
}
Batas KETAT: maks 3 emosi, maks 4 simbol, "why" maks 12 kata. Semua teks Bahasa Indonesia. Penjelasan harus merujuk isi mimpi.`;
}

function analyzeUser(input: { title: string | null; description: string; mood: string | null; history: HistoryContext }): string {
  return `RIWAYAT MIMPI PENGGUNA (konteks — jangan diulang mentah-mentah):
${historyBlock(input.history)}

MIMPI BARU UNTUK DIANALISIS:
Judul: ${input.title ?? "(tidak ada)"}
Suasana hati saat bangun: ${input.mood ?? "(tidak dicatat)"}
Deskripsi:
${input.description}`;
}

function normalizeAnalysis(parsed: Partial<DreamAnalysisResult>, provider: string, model: string): DreamAnalysisResult {
  const clamp = (n: unknown, lo: number, hi: number, dflt: number) => {
    const v = typeof n === "number" && Number.isFinite(n) ? n : dflt;
    return Math.max(lo, Math.min(hi, Math.round(v)));
  };
  return {
    summary: String(parsed.summary ?? "").slice(0, 1200) || "Sebuah mimpi telah dicatat.",
    dominantEmotion: String(parsed.dominantEmotion ?? "Curiosity"),
    emotionIntensity: clamp(parsed.emotionIntensity, 0, 100, 50),
    emotions: (Array.isArray(parsed.emotions) ? parsed.emotions : []).slice(0, 4).map((e) => ({
      name: String(e.name ?? "Curiosity"),
      intensity: clamp(e.intensity, 0, 100, 50),
      why: String(e.why ?? "").slice(0, 300),
    })),
    symbols: (Array.isArray(parsed.symbols) ? parsed.symbols : []).slice(0, 6).map((s) => ({
      name: String(s.name ?? "").slice(0, 40),
      confidence: clamp(s.confidence, 0, 100, 60),
      why: String(s.why ?? "").slice(0, 300),
    })),
    themes: (Array.isArray(parsed.themes) ? parsed.themes : []).slice(0, 3).map((t) => String(t).slice(0, 60)),
    reflection: String(parsed.reflection ?? "").slice(0, 2000),
    recommendations: (Array.isArray(parsed.recommendations) ? parsed.recommendations : []).slice(0, 3).map((r) => String(r).slice(0, 300)),
    suggestedQuestions: (Array.isArray(parsed.suggestedQuestions) ? parsed.suggestedQuestions : []).slice(0, 3).map((q) => String(q).slice(0, 300)),
    patternNote: parsed.patternNote ? String(parsed.patternNote).slice(0, 800) : null,
    confidence: Math.max(0, Math.min(1, typeof parsed.confidence === "number" ? parsed.confidence : 0.7)),
    provider,
    model,
  };
}

function companionSystem(history: HistoryContext, memoryEnabled: boolean): string {
  return `Kamu adalah Teman Mimpi di dalam aplikasi jurnal mimpi. Berbeda dari chatbot biasa, kamu mengenal SELURUH riwayat mimpi pengguna dan menjawab berdasarkan itu.
${SAFETY_RULES}

${memoryEnabled ? `RIWAYAT MIMPI PENGGUNA:\n${historyBlock(history)}` : "Pengguna menonaktifkan memori AI: jelaskan dengan sopan bahwa kamu tidak bisa merujuk riwayat mimpinya (Pengaturan → Privasi untuk mengaktifkan lagi), dan jawab hanya secara umum."}

Panduan:
- Rujuk mimpi tertentu (judul/tanggal) bila relevan.
- Bandingkan mimpi dan tunjukkan simbol/emosi berulang bila ditanya.
- Jawaban ringkas (di bawah 180 kata), hangat, dan reflektif.
- Akhiri sebagian besar jawaban dengan satu pertanyaan reflektif yang lembut.`;
}

function reportSystem(): string {
  return `Kamu menulis observasi laporan kesejahteraan singkat untuk aplikasi jurnal mimpi.
${SAFETY_RULES}
Kembalikan HANYA JSON (semua teks Bahasa Indonesia): {"observations": ["3-5 observasi singkat berdasarkan statistik yang diberikan, tiap-tiap menjelaskan MENGAPA ia muncul"], "reflection": "3-4 kalimat yang mendukung"}`;
}

export type LLMCall = (opts: {
  system: string;
  messages: Array<{ role: "user" | "assistant"; content: string }>;
  maxTokens?: number;
  json?: boolean;
}) => Promise<string>;

/**
 * Build a full AIProvider from a single `call()` function. Every method
 * tries the real model and, on ANY error, falls back to the offline local
 * engine — so the app never breaks even if the free service is down.
 */
export function makeLLMProvider(id: string, label: string, model: string, call: LLMCall): AIProvider {
  return {
    id,
    label,

    async analyzeDream(input) {
      try {
        const text = await call({
          system: analyzeSystem(),
          messages: [{ role: "user", content: analyzeUser(input) }],
          maxTokens: 2000,
          json: true,
        });
        const result = normalizeAnalysis(extractJson(text), id, model);
        // Guard against truncated JSON that parsed but lost key prose:
        // if the reflection came back empty, treat as a failure and fall back.
        if (!result.reflection.trim()) throw new Error("Empty reflection in model output");
        return result;
      } catch (err) {
        console.error(`[ai] ${id} analysis failed, falling back to local:`, err instanceof Error ? err.message : err);
        const fallback = await localProvider.analyzeDream(input);
        return { ...fallback, provider: `${id}-fallback-local`, model: "lexicon-v1" };
      }
    },

    async companionReply(input) {
      try {
        const messages = [
          ...input.conversation.slice(-12).map((t) => ({ role: t.role, content: t.content })),
          { role: "user" as const, content: input.question },
        ];
        const reply = await call({ system: companionSystem(input.history, input.memoryEnabled), messages, maxTokens: 700 });
        if (!reply.trim()) throw new Error("Empty reply");
        return reply.trim();
      } catch (err) {
        console.error(`[ai] ${id} companion failed, falling back to local:`, err instanceof Error ? err.message : err);
        return localProvider.companionReply(input);
      }
    },

    async reportObservations(input) {
      try {
        const text = await call({
          system: reportSystem(),
          messages: [{ role: "user", content: `Periode: ${input.periodLabel}\nStatistik: ${JSON.stringify(input.stats)}` }],
          maxTokens: 800,
          json: true,
        });
        const parsed = extractJson<{ observations: string[]; reflection: string }>(text);
        const observations = (parsed.observations ?? []).slice(0, 5).map((o) => String(o).slice(0, 400));
        if (observations.length === 0) throw new Error("No observations");
        return { observations, reflection: String(parsed.reflection ?? "").slice(0, 1000) };
      } catch (err) {
        console.error(`[ai] ${id} report failed, falling back to local:`, err instanceof Error ? err.message : err);
        return localProvider.reportObservations(input);
      }
    },
  };
}
