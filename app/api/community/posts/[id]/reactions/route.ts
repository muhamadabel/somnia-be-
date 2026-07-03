import { db } from "@/lib/db";
import { handle, notFound, ok, rateLimit } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { reactionSchema } from "@/lib/validation";

type Ctx = { params: Promise<{ id: string }> };

// Toggle a reaction of the given type.
export const POST = handle(async (req: Request, { params }: Ctx) => {
  const user = await requireUser();
  rateLimit(`react:${user.id}`, 30, 60_000);
  const { id } = await params;
  const { type } = reactionSchema.parse(await req.json());

  const post = await db.communityPost.findFirst({ where: { id, deletedAt: null } });
  if (!post) throw notFound("Post");

  const existing = await db.reaction.findUnique({
    where: { postId_userId_type: { postId: id, userId: user.id, type } },
  });
  if (existing) {
    await db.reaction.delete({ where: { id: existing.id } });
    return ok({ reacted: false, type }, "Reaction removed.");
  }
  await db.reaction.create({ data: { postId: id, userId: user.id, type } });
  return ok({ reacted: true, type }, "Reaction added.");
});
