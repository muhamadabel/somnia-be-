import { db } from "@/lib/db";
import { AppError, getPagination, handle, notFound, ok, pageMeta, rateLimit } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { sharePostSchema } from "@/lib/validation";
import type { Prisma } from "@prisma/client";

export const GET = handle(async (req: Request) => {
  const user = await requireUser();
  const sp = new URL(req.url).searchParams;
  const { page, limit, skip } = getPagination(sp, 10);
  const q = sp.get("q")?.trim();
  const sort = sp.get("sort") ?? "recent";

  const where: Prisma.CommunityPostWhereInput = {
    deletedAt: null,
    ...(q ? { OR: [{ title: { contains: q } }, { content: { contains: q } }] } : {}),
  };

  const [total, posts] = await Promise.all([
    db.communityPost.count({ where }),
    db.communityPost.findMany({
      where,
      orderBy: sort === "top" ? [{ reactions: { _count: "desc" } }, { createdAt: "desc" }] : { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        user: { select: { anonName: true } },
        _count: { select: { comments: { where: { deletedAt: null } }, reactions: true } },
        reactions: { where: { userId: user.id }, select: { type: true } },
      },
    }),
  ]);

  return ok(posts, "Feed retrieved.", pageMeta(page, limit, total));
});

// Publish a dream to the community — an explicit snapshot (docs/02 rule 4).
export const POST = handle(async (req: Request) => {
  const user = await requireUser();
  rateLimit(`post:${user.id}`, 10, 60_000);
  const body = sharePostSchema.parse(await req.json());

  const dream = await db.dream.findFirst({
    where: { id: body.dreamId, userId: user.id, deletedAt: null },
    include: {
      emotions: { include: { emotion: true }, orderBy: { intensity: "desc" } },
      symbols: { include: { symbol: true }, orderBy: { confidence: "desc" } },
      post: true,
    },
  });
  if (!dream) throw notFound("Dream");
  if (dream.isDraft) throw new AppError(422, "Finish the draft before sharing it.");
  if (dream.post) throw new AppError(409, "This dream is already shared to the community.");

  const post = await db.communityPost.create({
    data: {
      userId: user.id,
      dreamId: dream.id,
      title: body.title,
      content: body.note ? `${dream.description}\n\n— ${body.note}` : dream.description,
      meta: JSON.stringify({
        emotions: dream.emotions.slice(0, 3).map((e) => ({ name: e.emotion.name, color: e.emotion.color })),
        symbols: dream.symbols.slice(0, 4).map((s) => s.symbol.name),
        mood: dream.mood,
      }),
    },
  });

  return ok(post, "Dream shared anonymously.");
});
