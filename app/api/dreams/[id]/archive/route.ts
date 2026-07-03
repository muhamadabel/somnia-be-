import { db } from "@/lib/db";
import { handle, notFound, ok } from "@/lib/api";
import { requireUser } from "@/lib/auth";

type Ctx = { params: Promise<{ id: string }> };

export const POST = handle(async (_req: Request, { params }: Ctx) => {
  const user = await requireUser();
  const { id } = await params;
  const dream = await db.dream.findFirst({ where: { id, userId: user.id, deletedAt: null } });
  if (!dream) throw notFound("Dream");

  const updated = await db.dream.update({
    where: { id },
    data: { archivedAt: dream.archivedAt ? null : new Date() },
  });
  return ok(updated, updated.archivedAt ? "Mimpi diarsipkan." : "Mimpi dikeluarkan dari arsip.");
});
