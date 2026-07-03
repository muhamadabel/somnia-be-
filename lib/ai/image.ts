// Free, key-less AI image generation via Pollinations.ai (Flux model).
// Turns a dream's emotion + symbols into a descriptive prompt, fetches a
// real generated image, and returns it as a Buffer. Returns null on any
// failure so the caller can fall back to the built-in procedural SVG art.

import { symbolLabel } from "@/lib/ai/lexicon";

// English descriptors read best by image models.
const EMOTION_MOOD: Record<string, string> = {
  Joy: "joyful, warm golden light, uplifting",
  Calm: "serene, tranquil, soft blue tones, peaceful",
  Excitement: "vibrant, dynamic, energetic, glowing pink and violet",
  Curiosity: "mysterious, wondrous, teal and turquoise, exploratory",
  Love: "tender, warm rose light, intimate, gentle",
  Fear: "eerie, shadowy, deep indigo, tense, moonlit",
  Anxiety: "uneasy, hazy, restless amber and dusk tones",
  Sadness: "melancholic, muted blue-grey, quiet rain",
  Anger: "intense, fiery red and ember, dramatic",
  Confusion: "surreal, shifting, dreamy violet fog, disorienting",
};

// Map internal symbol keys to vivid visual nouns for the prompt.
const SYMBOL_VISUAL: Record<string, string> = {
  Water: "still water reflecting the sky",
  Ocean: "vast glowing ocean",
  Flying: "a figure flying through the sky",
  Falling: "falling through clouds",
  Forest: "a misty ancient forest",
  Mountain: "distant mountain peaks",
  Fire: "soft floating embers",
  Snake: "a coiled serpent",
  House: "a lonely house with lit windows",
  Stairs: "an endless spiral staircase",
  Door: "a glowing doorway",
  Bridge: "an old bridge over clouds",
  Moon: "a large crescent moon",
  Stars: "a sky full of glowing stars",
  Storm: "distant lightning and storm clouds",
  Mirror: "a floating mirror",
  Light: "beams of radiant light",
  Darkness: "deep velvety darkness",
  Sky: "an expansive twilight sky",
  Ghost: "a faint translucent figure",
};

export function buildImagePrompt(dominantEmotion: string, symbols: string[]): string {
  const mood = EMOTION_MOOD[dominantEmotion] ?? "dreamlike, ethereal";
  const visuals = symbols
    .map((s) => SYMBOL_VISUAL[s] ?? symbolLabel(s).toLowerCase())
    .slice(0, 4);
  const scene = visuals.length ? `, featuring ${visuals.join(", ")}` : "";
  return `Dreamlike surreal digital painting of an imagined dream${scene}. ${mood} atmosphere, ethereal soft glowing light, floating particles, cinematic, highly detailed, painterly, no text, no words.`;
}

export async function generateAiImage(opts: {
  prompt: string;
  seed: number;
  width?: number;
  height?: number;
}): Promise<Buffer | null> {
  const { prompt, seed, width = 1024, height = 768 } = opts;
  const url =
    `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}` +
    `?width=${width}&height=${height}&seed=${seed}&model=flux&nologo=true&private=true`;
  // Best-effort: the free service is usually fast (5-20s) but can be
  // overloaded. On any failure we return null so the caller falls back to
  // the built-in procedural art instead of making the user wait.
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(35_000) });
    if (!res.ok) return null;
    const contentType = res.headers.get("content-type") ?? "";
    if (!contentType.startsWith("image/")) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.byteLength < 1024) return null; // tiny = error placeholder
    return buf;
  } catch (err) {
    console.error("[ai] Pollinations image failed:", err instanceof Error ? err.message : err);
    return null;
  }
}
