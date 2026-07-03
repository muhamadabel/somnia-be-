import { db } from "@/lib/db";
import { forbidden, handle, notFound, ok } from "@/lib/api";
import { requireUser } from "@/lib/auth";

type Ctx = { params: Promise<{ id: string }> };

export const DELETE = handle(async (_req: Request, { params }: Ctx) => {
  const user = await requireUser();
  const { id } = await params;
  const comment = await db.comment.findFirst({ where: { id, deletedAt: null } });
  if (!comment) throw notFound("Comment");
  if (comment.userId !== user.id && user.role !== "admin") throw forbidden();
  await db.comment.update({ where: { id }, data: { deletedAt: new Date() } });
  return ok(null, "Comment removed.");
});
