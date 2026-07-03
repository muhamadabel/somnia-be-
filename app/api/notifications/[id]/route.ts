import { db } from "@/lib/db";
import { handle, notFound, ok } from "@/lib/api";
import { requireUser } from "@/lib/auth";

type Ctx = { params: Promise<{ id: string }> };

// Mark one notification read
export const POST = handle(async (_req: Request, { params }: Ctx) => {
  const user = await requireUser();
  const { id } = await params;
  const n = await db.notification.findFirst({ where: { id, userId: user.id } });
  if (!n) throw notFound("Notification");
  await db.notification.update({ where: { id }, data: { readAt: new Date() } });
  return ok(null, "Notification read.");
});

export const DELETE = handle(async (_req: Request, { params }: Ctx) => {
  const user = await requireUser();
  const { id } = await params;
  const n = await db.notification.findFirst({ where: { id, userId: user.id } });
  if (!n) throw notFound("Notification");
  await db.notification.delete({ where: { id } });
  return ok(null, "Notification deleted.");
});
