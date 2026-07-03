import { handle, ok } from "@/lib/api";
import { audit, destroySession, getCurrentUser } from "@/lib/auth";

export const POST = handle(async () => {
  const user = await getCurrentUser();
  await destroySession();
  if (user) await audit("auth.logout", user.id);
  return ok(null, "Signed out.");
});
