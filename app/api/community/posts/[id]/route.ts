import { db } from "@/lib/db";
import { handle, notFound, ok } from "@/lib/api";
import { requireUser } from "@/lib/auth";

type Ctx = { params: Promise<{ id: string }> };

export const GET = handle(async (_req: Request, { params }: Ctx) => {
  const user = await requireUser();
  const { id } = await params;
  const post = await db.communityPost.findFirst({
    where: { id, deletedAt: null },
    include: {
      user: { select: { anonName: true } },
      comments: {
        where: { deletedAt: null },
        orderBy: { createdAt: "asc" },
        include: { user: { select: { anonName: true } } },
      },
      reactions: true,
      _count: { select: { comments: { where: { deletedAt: null } } } },
    },
  });
  if (!post) throw notFound("Post");
  return ok({ ...post, mine: post.userId === user.id });
});

export const DELETE = handle(async (_req: Request, { params }: Ctx) => {
  const user = await requireUser();
  const { id } = await params;
  const post = await db.communityPost.findFirst({ where: { id, deletedAt: null } });
  if (!post) throw notFound("Post");
  if (post.userId !== user.id && user.role !== "admin") {
    const { forbidden } = await import("@/lib/api");
    throw forbidden();
  }
  await db.communityPost.update({ where: { id }, data: { deletedAt: new Date() } });
  return ok(null, "Post removed.");
});
