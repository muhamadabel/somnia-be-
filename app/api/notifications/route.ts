import { db } from "@/lib/db";
import { handle, ok } from "@/lib/api";
import { requireUser } from "@/lib/auth";

export const GET = handle(async () => {
  const user = await requireUser();
  const notifications = await db.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return ok(notifications);
});

// Mark all read
export const POST = handle(async () => {
  const user = await requireUser();
  await db.notification.updateMany({
    where: { userId: user.id, readAt: null },
    data: { readAt: new Date() },
  });
  return ok(null, "All notifications marked as read.");
});
