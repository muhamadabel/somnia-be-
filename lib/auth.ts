import { cookies, headers } from "next/headers";
import { cache } from "react";
import { randomBytes } from "crypto";
import { db } from "@/lib/db";
import type { User } from "@prisma/client";

const COOKIE_NAME = "djs_session";
const SESSION_DAYS = 30;

/**
 * Read the session token. A separate cross-origin SPA sends it as
 * `Authorization: Bearer <token>`; the same-origin app uses the cookie.
 * Bearer takes precedence so the token-based frontend works anywhere.
 */
async function getSessionToken(): Promise<string | null> {
  const auth = (await headers()).get("authorization");
  if (auth && /^bearer /i.test(auth)) return auth.slice(7).trim() || null;
  const jar = await cookies();
  return jar.get(COOKIE_NAME)?.value ?? null;
}

// ── Session lifecycle ──────────────────────────────────────────────────

export async function createSession(userId: string, userAgent?: string | null) {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await db.session.create({ data: { token, userId, expiresAt, userAgent: userAgent ?? null } });

  const jar = await cookies();
  jar.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
  return token;
}

export async function destroySession() {
  const token = await getSessionToken();
  if (token) await db.session.deleteMany({ where: { token } });
  const jar = await cookies();
  if (jar.get(COOKIE_NAME)) jar.delete(COOKIE_NAME);
}

/**
 * Resolve the current user from the session token (Bearer header or cookie).
 * Cached per-request so layouts/pages/routes can all call it freely.
 */
export const getCurrentUser = cache(async (): Promise<User | null> => {
  const token = await getSessionToken();
  if (!token) return null;

  const session = await db.session.findUnique({
    where: { token },
    include: { user: true },
  });
  if (!session) return null;
  if (session.expiresAt < new Date()) {
    await db.session.delete({ where: { id: session.id } }).catch(() => {});
    return null;
  }
  if (session.user.status !== "active") return null;
  return session.user;
});

export async function requireUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) {
    const { unauthorized } = await import("@/lib/api");
    throw unauthorized();
  }
  return user;
}

export async function requireAdmin(): Promise<User> {
  const user = await requireUser();
  if (user.role !== "admin") {
    const { forbidden } = await import("@/lib/api");
    throw forbidden();
  }
  return user;
}

// ── Community pseudonyms (privacy by design) ───────────────────────────

const ADJECTIVES = ["Quiet", "Drifting", "Lucid", "Gentle", "Wandering", "Silver", "Hidden", "Amber", "Misty", "Velvet", "Starlit", "Curious", "Golden", "Twilight", "Soft"];
const NOUNS = ["Lantern", "Comet", "Willow", "Harbor", "Feather", "Ember", "Tide", "Meadow", "Aurora", "Compass", "Moth", "Cloud", "Echo", "Fern", "Moon"];

export function generateAnonName(): string {
  const a = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const n = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  const num = Math.floor(100 + Math.random() * 900);
  return `${a} ${n} ${num}`;
}

// ── Audit logging (never includes dream content — docs/10) ────────────

export async function audit(event: string, userId?: string | null, detail?: string, ip?: string) {
  try {
    await db.auditLog.create({
      data: { event, userId: userId ?? null, detail: detail ?? null, ip: ip ?? null },
    });
  } catch (err) {
    console.error("[audit] failed to record event", event, err instanceof Error ? err.message : "");
  }
}
