import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { handle, ok, fail, rateLimit, clientIp } from "@/lib/api";
import { loginSchema } from "@/lib/validation";
import { audit, createSession } from "@/lib/auth";

export const POST = handle(async (req: Request) => {
  rateLimit(`login:${clientIp(req)}`, 8, 60_000);

  const body = loginSchema.parse(await req.json());
  const user = await db.user.findUnique({ where: { email: body.email } });
  // Constant-shape response: never reveal whether the email exists.
  const valid = user && (await bcrypt.compare(body.password, user.passwordHash));
  if (!user || !valid) {
    await audit("auth.login_failed", user?.id ?? null, undefined, clientIp(req));
    return fail(401, "Email atau kata sandi salah.");
  }
  if (user.status !== "active") {
    return fail(403, "Akun ini telah ditangguhkan. Hubungi dukungan jika kamu merasa ini keliru.");
  }

  await createSession(user.id, req.headers.get("user-agent"));
  await audit("auth.login", user.id, undefined, clientIp(req));

  return ok(
    { id: user.id, fullName: user.fullName, email: user.email, onboarded: !!user.onboardedAt },
    "Signed in."
  );
});
