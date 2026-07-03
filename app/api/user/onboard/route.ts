import { db } from "@/lib/db";
import { handle, ok } from "@/lib/api";
import { requireUser } from "@/lib/auth";

export const POST = handle(async () => {
  const user = await requireUser();
  await db.user.update({ where: { id: user.id }, data: { onboardedAt: new Date() } });
  return ok(null, "Onboarding complete.");
});
