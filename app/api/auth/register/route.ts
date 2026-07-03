import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { handle, ok, fail, rateLimit, clientIp } from "@/lib/api";
import { registerSchema } from "@/lib/validation";
import { audit, createSession, generateAnonName } from "@/lib/auth";

export const POST = handle(async (req: Request) => {
  rateLimit(`register:${clientIp(req)}`, 5, 60_000);

  const body = registerSchema.parse(await req.json());
  const existing = await db.user.findUnique({ where: { email: body.email } });
  if (existing) return fail(409, "Akun dengan email ini sudah ada.");

  const passwordHash = await bcrypt.hash(body.password, 12);
  const user = await db.user.create({
    data: {
      fullName: body.fullName,
      email: body.email,
      passwordHash,
      anonName: generateAnonName(),
      theme: "dark", // dreamy night look by default
    },
  });

  await db.notification.create({
    data: {
      userId: user.id,
      type: "welcome",
      title: "Selamat datang di Somnia 🌙",
      message: "Jurnal mimpimu sudah siap. Catat mimpi pertamamu untuk memulai.",
    },
  });

  await createSession(user.id, req.headers.get("user-agent"));
  await audit("user.registered", user.id, undefined, clientIp(req));

  return ok({ id: user.id, fullName: user.fullName, email: user.email }, "Account created.");
});
