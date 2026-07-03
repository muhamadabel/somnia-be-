import { db } from "@/lib/db";
import { handle, notFound, ok } from "@/lib/api";
import { audit, requireUser } from "@/lib/auth";
import { dreamUpdateSchema } from "@/lib/validation";
import { toDreamDate } from "@/lib/utils";

type Ctx = { params: Promise<{ id: string }> };

async function ownDream(id: string, userId: string) {
  const dream = await db.dream.findFirst({ where: { id, userId, deletedAt: null } });
  if (!dream) throw notFound("Dream");
  return dream;
}

export const GET = handle(async (_req: Request, { params }: Ctx) => {
  const user = await requireUser();
  const { id } = await params;
  const dream = await db.dream.findFirst({
    where: { id, userId: user.id, deletedAt: null },
    include: {
      emotions: { include: { emotion: true } },
      symbols: { include: { symbol: true } },
      analyses: { orderBy: { version: "desc" } },
      visualizations: { where: { deletedAt: null }, orderBy: { createdAt: "desc" } },
      post: true,
    },
  });
  if (!dream) throw notFound("Dream");
  return ok(dream);
});

export const PATCH = handle(async (req: Request, { params }: Ctx) => {
  const user = await requireUser();
  const { id } = await params;
  await ownDream(id, user.id);
  const body = dreamUpdateSchema.parse(await req.json());

  const dream = await db.dream.update({
    where: { id },
    data: {
      ...(body.title !== undefined ? { title: body.title || null } : {}),
      ...(body.description !== undefined ? { description: body.description } : {}),
      ...(body.notes !== undefined ? { notes: body.notes || null } : {}),
      ...(body.mood !== undefined ? { mood: body.mood } : {}),
      ...(body.sleepDuration !== undefined ? { sleepDuration: body.sleepDuration } : {}),
      ...(body.dreamDate ? { dreamDate: toDreamDate(body.dreamDate) } : {}),
      ...(body.isDraft !== undefined ? { isDraft: body.isDraft } : {}),
    },
  });
  return ok(dream, "Dream updated.");
});

export const DELETE = handle(async (_req: Request, { params }: Ctx) => {
  const user = await requireUser();
  const { id } = await params;
  await ownDream(id, user.id);
  // Soft delete (docs/06): recoverable, history preserved.
  await db.dream.update({ where: { id }, data: { deletedAt: new Date() } });
  await audit("dream.deleted", user.id, `dream:${id}`);
  return ok(null, "Dream moved to trash.");
});
