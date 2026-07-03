import { db } from "@/lib/db";
import { handle, notFound, ok, rateLimit } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { commentSchema } from "@/lib/validation";

type Ctx = { params: Promise<{ id: string }> };

export const POST = handle(async (req: Request, { params }: Ctx) => {
  const user = await requireUser();
  rateLimit(`comment:${user.id}`, 15, 60_000);
  const { id } = await params;
  const { content } = commentSchema.parse(await req.json());

  const post = await db.communityPost.findFirst({ where: { id, deletedAt: null } });
  if (!post) throw notFound("Post");

  const comment = await db.comment.create({
    data: { postId: id, userId: user.id, content },
    include: { user: { select: { anonName: true } } },
  });

  // Notify the post owner (docs/06 notification module) — skip self-comments.
  if (post.userId !== user.id) {
    const owner = await db.user.findUnique({ where: { id: post.userId }, select: { communityAlerts: true } });
    if (owner?.communityAlerts) {
      await db.notification.create({
        data: {
          userId: post.userId,
          type: "comment",
          title: "Komentar baru di mimpimu",
          message: `Seseorang berkomentar di “${post.title}”.`,
          link: `/community/${post.id}`,
        },
      });
    }
  }

  return ok(comment, "Comment posted.");
});
