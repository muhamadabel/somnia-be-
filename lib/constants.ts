// Konstanta domain bersama (docs/02 — emosi adalah data terstruktur).
//
// Catatan: `name` emosi & `slug`/`name` simbol tetap berbahasa Inggris
// karena dipakai sebagai KUNCI (deteksi kamus, relasi DB, peta warna).
// Yang ditampilkan ke pengguna adalah label Indonesia via peta di bawah.

export const EMOTIONS = [
  { name: "Joy", tone: "positive", color: "#f59e0b", label: "Bahagia", description: "Kebahagiaan, keceriaan, atau kejutan menyenangkan di dalam mimpi." },
  { name: "Calm", tone: "positive", color: "#38bdf8", label: "Tenang", description: "Perasaan damai, tenteram, atau aman sepanjang mimpi." },
  { name: "Excitement", tone: "positive", color: "#ec4899", label: "Antusias", description: "Sensasi seru, petualangan, atau antisipasi yang menggebu." },
  { name: "Curiosity", tone: "positive", color: "#2dd4bf", label: "Penasaran", description: "Rasa ingin tahu, eksplorasi, dan keterbukaan pada hal baru." },
  { name: "Love", tone: "positive", color: "#fb7185", label: "Kasih", description: "Kasih sayang, kehangatan, keterikatan, atau rasa memiliki." },
  { name: "Fear", tone: "negative", color: "#8b5cf6", label: "Takut", description: "Ancaman, ketakutan, atau dorongan untuk melarikan diri." },
  { name: "Anxiety", tone: "negative", color: "#f97316", label: "Cemas", description: "Khawatir, tertekan, merasa tidak siap atau kewalahan." },
  { name: "Sadness", tone: "negative", color: "#64748b", label: "Sedih", description: "Kehilangan, duka, kerinduan, atau kekecewaan." },
  { name: "Anger", tone: "negative", color: "#ef4444", label: "Marah", description: "Frustrasi, ketidakadilan, atau batas yang dilanggar." },
  { name: "Confusion", tone: "neutral", color: "#a78bfa", label: "Bingung", description: "Kebingungan, tempat yang berubah-ubah, atau logika yang kabur." },
] as const;

export type EmotionName = (typeof EMOTIONS)[number]["name"];

export const EMOTION_COLOR: Record<string, string> = Object.fromEntries(
  EMOTIONS.map((e) => [e.name, e.color])
);
export const EMOTION_TONE: Record<string, string> = Object.fromEntries(
  EMOTIONS.map((e) => [e.name, e.tone])
);
/** Nama emosi Inggris → label Indonesia (untuk tampilan). */
export const EMOTION_LABEL: Record<string, string> = Object.fromEntries(
  EMOTIONS.map((e) => [e.name, e.label])
);
export function emotionLabel(name: string) {
  return EMOTION_LABEL[name] ?? name;
}

export const TONE_LABEL: Record<string, string> = {
  positive: "positif",
  negative: "negatif",
  neutral: "netral",
};

export const MOODS = [
  { value: "great", label: "Sangat baik", emoji: "😊" },
  { value: "good", label: "Baik", emoji: "🙂" },
  { value: "neutral", label: "Biasa saja", emoji: "😐" },
  { value: "low", label: "Kurang", emoji: "😕" },
  { value: "bad", label: "Buruk", emoji: "😞" },
] as const;

export const MOOD_LABEL: Record<string, string> = Object.fromEntries(
  MOODS.map((m) => [m.value, `${m.emoji} ${m.label}`])
);

export const REACTION_TYPES = [
  { type: "heart", emoji: "❤️", label: "Suka" },
  { type: "hug", emoji: "🫂", label: "Peluk" },
  { type: "sparkle", emoji: "✨", label: "Kagum" },
  { type: "insight", emoji: "💡", label: "Insight" },
] as const;

export const SYMBOL_CATEGORIES = [
  "Nature",
  "Creature",
  "Action",
  "Place",
  "Object",
  "People",
  "Event",
] as const;

/** Kategori simbol (kunci Inggris) → label Indonesia. */
export const CATEGORY_LABEL: Record<string, string> = {
  Nature: "Alam",
  Creature: "Makhluk",
  Action: "Aksi",
  Place: "Tempat",
  Object: "Benda",
  People: "Orang",
  Event: "Peristiwa",
};

export const MAX_DREAM_LENGTH = 8000;
export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5MB
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export const APP_NAME = "Somnia";
export const APP_TAGLINE = "Penganalisis Jurnal Mimpi";
