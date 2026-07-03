import { db } from "@/lib/db";
import { handle, notFound, ok } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { deleteStoredFile } from "@/lib/services/storage";

type Ctx = { params: Promise<{ id: string }> };

export const DELETE = handle(async (_req: Request, { params }: Ctx) => {
  const user = await requireUser();
  const { id } = await params;
  const viz = await db.visualization.findFirst({
    where: { id, deletedAt: null, dream: { userId: user.id } },
  });
  if (!viz) throw notFound("Visualization");

  await db.visualization.update({ where: { id }, data: { deletedAt: new Date() } });
  await deleteStoredFile(viz.imagePath);
  return ok(null, "Artwork deleted.");
});
