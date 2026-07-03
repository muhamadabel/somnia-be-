import { handle, ok } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";
import { aiModeLabel } from "@/lib/ai";

export const GET = handle(async () => {
  const user = await getCurrentUser();
  if (!user) return ok({ authenticated: false });
  return ok({
    authenticated: true,
    user: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      theme: user.theme,
      onboarded: !!user.onboardedAt,
    },
    aiMode: aiModeLabel(),
  });
});
