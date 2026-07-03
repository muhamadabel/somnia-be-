import { db } from "@/lib/db";
import { getPagination, handle, ok, pageMeta } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { dreamSchema } from "@/lib/validation";
import { toDreamDate } from "@/lib/utils";
import type { Prisma } from "@prisma/client";

export const GET = handle(async (req: Request) => {
  const user = await requireUser();
  const url = new URL(req.url);
  const sp = url.searchParams;
  const { page, limit, skip } = getPagination(sp);

  const q = sp.get("q")?.trim();
  const emotion = sp.get("emotion")?.trim();
  const symbol = sp.get("symbol")?.trim();
  const mood = sp.get("mood")?.trim();
  const status = sp.get("status") ?? "active"; // active | drafts | archived | all
  const from = sp.get("from");
  const to = sp.get("to");
  const sort = sp.get("sort") ?? "newest";

  const where: Prisma.DreamWhereInput = {
    userId: user.id,
    deletedAt: null,
    ...(status === "active" ? { isDraft: false, archivedAt: null } : {}),
    ...(status === "drafts" ? { isDraft: true } : {}),
    ...(status === "archived" ? { archivedAt: { not: null } } : {}),
    ...(q ? { OR: [{ title: { contains: q } }, { description: { contains: q } }] } : {}),
    ...(mood ? { mood } : {}),
    ...(emotion ? { emotions: { some: { emotion: { name: emotion } } } } : {}),
    ...(symbol ? { symbols: { some: { symbol: { slug: symbol } } } } : {}),
    ...(from ? { dreamDate: { gte: toDreamDate(from) } } : {}),
    ...(to ? { dreamDate: { lte: toDreamDate(to) } } : {}),
  };

  const [total, dreams] = await Promise.all([
    db.dream.count({ where }),
    db.dream.findMany({
      where,
      orderBy: sort === "oldest" ? { dreamDate: "asc" } : { dreamDate: "desc" },
      skip,
      take: limit,
      include: {
        emotions: { include: { emotion: true } },
        symbols: { include: { symbol: true } },
        analyses: { orderBy: { version: "desc" }, take: 1, select: { dominantEmotion: true } },
      },
    }),
  ]);

  return ok(dreams, "Dreams retrieved.", pageMeta(page, limit, total));
});

export const POST = handle(async (req: Request) => {
  const user = await requireUser();
  const body = dreamSchema.parse(await req.json());

  const dream = await db.dream.create({
    data: {
      userId: user.id,
      title: body.title || null,
      description: body.description,
      notes: body.notes || null,
      mood: body.mood ?? null,
      sleepDuration: body.sleepDuration ?? null,
      dreamDate: toDreamDate(body.dreamDate),
      isDraft: body.isDraft ?? false,
    },
  });

  return ok(dream, body.isDraft ? "Draft saved." : "Dream recorded.");
});
