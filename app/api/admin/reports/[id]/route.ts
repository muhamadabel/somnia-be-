import { db } from "@/lib/db";
import { AppError, handle, notFound, ok } from "@/lib/api";
import { audit, requireAdmin } from "@/lib/auth";

type Ctx = { params: Promise<{ id: string }> };

// Resolve a moderation report: action = dismiss | remove-content
export const POST = handle(async (req: Request, { params }: Ctx) => {
  const admin = await requireAdmin();
  const { id } = await params;
  const { action } = (await req.json()) as { action?: string };
  if (action !== "dismiss" && action !== "remove-content") {
    throw new AppError(422, "Unknown moderation action.");
  }

  const report = await db.contentReport.findUnique({ where: { id } });
  if (!report || report.status !== "open") throw notFound("Open report");

  if (action === "remove-content") {
    if (report.postId) {
      await db.communityPost.update({ where: { id: report.postId }, data: { deletedAt: new Date() } });
    }
    if (report.commentId) {
      await db.comment.update({ where: { id: report.commentId }, data: { deletedAt: new Date() } });
    }
  }

  await db.contentReport.update({
    where: { id },
    data: { status: action === "dismiss" ? "dismissed" : "resolved" },
  });
  await audit(`admin.report_${action}`, admin.id, `report:${id}`);
  return ok(null, action === "dismiss" ? "Laporan diabaikan." : "Konten dihapus dan laporan diselesaikan.");
});
