import { db } from "@/lib/db";
import { handle, notFound, ok, rateLimit } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { generateAnalysis } from "@/lib/services/analysis";

type Ctx = { params: Promise<{ id: string }> };

export const GET = handle(async (_req: Request, { params }: Ctx) => {
  const user = await requireUser();
  const { id } = await params;
  const dream = await db.dream.findFirst({ where: { id, userId: user.id, deletedAt: null } });
  if (!dream) throw notFound("Dream");
  const analyses = await db.analysis.findMany({ where: { dreamId: id }, orderBy: { version: "desc" } });
  return ok(analyses);
});

export const POST = handle(async (_req: Request, { params }: Ctx) => {
  const user = await requireUser();
  // AI generation is rate-limited per user (docs/10 rate limiting).
  rateLimit(`analysis:${user.id}`, 10, 60_000);
  const { id } = await params;
  const analysis = await generateAnalysis(id, user.id);
  return ok(analysis, "Analysis generated.");
});
