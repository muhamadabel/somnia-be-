import { db } from "@/lib/db";
import { AppError, handle, notFound, ok, rateLimit } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { contentReportSchema } from "@/lib/validation";

export const POST = handle(async (req: Request) => {
  const user = await requireUser();
  rateLimit(`content-report:${user.id}`, 10, 60_000);
  const body = contentReportSchema.parse(await req.json());
  if (!body.postId && !body.commentId) {
    throw new AppError(422, "Nothing to report.");
  }

  if (body.postId) {
    const post = await db.communityPost.findFirst({ where: { id: body.postId, deletedAt: null } });
    if (!post) throw notFound("Post");
  }
  if (body.commentId) {
    const comment = await db.comment.findFirst({ where: { id: body.commentId, deletedAt: null } });
    if (!comment) throw notFound("Comment");
  }

  await db.contentReport.create({
    data: {
      postId: body.postId ?? null,
      commentId: body.commentId ?? null,
      reporterId: user.id,
      reason: body.reason,
    },
  });

  return ok(null, "Terima kasih — moderator akan meninjau konten ini.");
});
