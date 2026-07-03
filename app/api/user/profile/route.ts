import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { AppError, handle, ok } from "@/lib/api";
import { audit, requireUser } from "@/lib/auth";
import { changePasswordSchema, preferencesSchema, profileSchema } from "@/lib/validation";

export const GET = handle(async () => {
  const user = await requireUser();
  const [dreamCount, analysisCount, postCount] = await Promise.all([
    db.dream.count({ where: { userId: user.id, deletedAt: null, isDraft: false } }),
    db.analysis.count({ where: { dream: { userId: user.id, deletedAt: null } } }),
    db.communityPost.count({ where: { userId: user.id, deletedAt: null } }),
  ]);
  const { passwordHash: _ph, ...safe } = user;
  return ok({ ...safe, stats: { dreamCount, analysisCount, postCount } });
});

export const PATCH = handle(async (req: Request) => {
  const user = await requireUser();
  const body = (await req.json()) as Record<string, unknown>;

  if (body.kind === "password") {
    const { currentPassword, newPassword } = changePasswordSchema.parse(body);
    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) throw new AppError(401, "Current password is incorrect.");
    await db.user.update({
      where: { id: user.id },
      data: { passwordHash: await bcrypt.hash(newPassword, 12) },
    });
    await audit("user.password_changed", user.id);
    return ok(null, "Password updated.");
  }

  if (body.kind === "preferences") {
    const prefs = preferencesSchema.parse(body);
    await db.user.update({ where: { id: user.id }, data: prefs });
    return ok(null, "Preferences saved.");
  }

  const profile = profileSchema.parse(body);
  await db.user.update({ where: { id: user.id }, data: profile });
  return ok(null, "Profile updated.");
});

export const DELETE = handle(async (req: Request) => {
  const user = await requireUser();
  const body = (await req.json().catch(() => ({}))) as { confirm?: string };
  if (body.confirm !== user.email) {
    throw new AppError(422, "Type your email address to confirm account deletion.");
  }
  await audit("user.account_deleted", user.id);
  await db.user.delete({ where: { id: user.id } }); // cascades to all owned data
  return ok(null, "Account and all data deleted.");
});
