import { db } from "@/lib/db";
import { handle, notFound, ok, rateLimit } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { generateDreamArt } from "@/lib/ai/art";
import { detectSymbols, detectEmotions } from "@/lib/ai/local";
import { buildImagePrompt, generateAiImage } from "@/lib/ai/image";
import { aiImagesEnabled } from "@/lib/ai";
import { saveFile } from "@/lib/services/storage";
import { safeParseJson } from "@/lib/utils";

type Ctx = { params: Promise<{ id: string }> };

export const POST = handle(async (_req: Request, { params }: Ctx) => {
  const user = await requireUser();
  // AI image generation is slower, so a slightly tighter limit.
  rateLimit(`visualize:${user.id}`, 10, 60_000);
  const { id } = await params;

  const dream = await db.dream.findFirst({
    where: { id, userId: user.id, deletedAt: null },
    include: { analyses: { orderBy: { version: "desc" }, take: 1 } },
  });
  if (!dream) throw notFound("Dream");

  // Prefer the latest analysis' structured signals; fall back to on-the-fly
  // detection so visualization works even before an analysis exists.
  const latest = dream.analyses[0];
  const symbols = latest
    ? safeParseJson<Array<{ name: string }>>(latest.symbolsJson, []).map((s) => s.name)
    : detectSymbols(`${dream.title ?? ""}. ${dream.description}`).map((s) => s.name);
  const dominantEmotion =
    latest?.dominantEmotion ?? detectEmotions(`${dream.title ?? ""}. ${dream.description}`)[0].name;

  const seed = Math.floor(Math.random() * 1_000_000);

  // 1) Try free AI image generation (Pollinations Flux).
  let imagePath: string | null = null;
  let prompt = "";
  let provider = "";
  if (aiImagesEnabled()) {
    prompt = buildImagePrompt(dominantEmotion, symbols);
    const buffer = await generateAiImage({ prompt, seed });
    if (buffer) {
      imagePath = await saveFile("visualizations", "jpg", buffer);
      provider = "pollinations-flux";
    }
  }

  // 2) Fall back to the built-in procedural SVG art (always works, offline).
  if (!imagePath) {
    const art = generateDreamArt({ dominantEmotion, symbols, seed });
    imagePath = await saveFile("visualizations", "svg", art.svg);
    prompt = art.prompt;
    provider = "procedural-art";
  }

  const visualization = await db.visualization.create({
    data: { dreamId: id, imagePath, prompt, provider, seed },
  });

  return ok(visualization, "Visualisasi mimpi dibuat.");
});
