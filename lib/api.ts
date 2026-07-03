import { NextResponse } from "next/server";
import { ZodError } from "zod";

// ── Standard response envelope (docs/07-api-contract.md) ──────────────

export function ok<T>(data: T, message = "OK", meta: Record<string, unknown> = {}) {
  return NextResponse.json({ success: true, message, data, meta });
}

export function fail(status: number, message: string, errors: unknown[] = []) {
  return NextResponse.json(
    {
      success: false,
      message,
      errors,
      requestId: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
    },
    { status }
  );
}

export class AppError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export const unauthorized = () => new AppError(401, "Kamu harus masuk untuk melakukan itu.");
export const forbidden = () => new AppError(403, "Kamu tidak punya akses ke sumber ini.");
export const notFound = (what = "Sumber") => new AppError(404, `${what} tidak ditemukan.`);

/**
 * Wrap a route handler with consistent validation/error semantics.
 * Internal details are never leaked to clients (docs/06 error handling).
 */
export function handle<Args extends unknown[]>(
  fn: (...args: Args) => Promise<Response>
): (...args: Args) => Promise<Response> {
  return async (...args: Args) => {
    try {
      return await fn(...args);
    } catch (err) {
      if (err instanceof ZodError) {
        return fail(
          422,
          "Beberapa isian tidak valid.",
          err.issues.map((i) => ({ field: i.path.join("."), message: i.message }))
        );
      }
      if (err instanceof AppError) {
        return fail(err.status, err.message);
      }
      console.error("[api] unhandled error:", err instanceof Error ? err.message : err);
      return fail(500, "Ada masalah di sisi kami. Silakan coba lagi.");
    }
  };
}

// ── Rate limiting (in-memory sliding window) ───────────────────────────
// Suitable for a single-node deployment; swap for Redis when scaling out.

const buckets = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(key: string, max: number, windowMs: number) {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return;
  }
  bucket.count++;
  if (bucket.count > max) {
    throw new AppError(429, "Terlalu banyak permintaan. Pelan-pelan dulu dan coba lagi sebentar.");
  }
}

export function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  return fwd ? fwd.split(",")[0].trim() : "local";
}

// ── Pagination helpers ─────────────────────────────────────────────────

export function getPagination(searchParams: URLSearchParams, defaultLimit = 12) {
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") ?? String(defaultLimit), 10) || defaultLimit));
  return { page, limit, skip: (page - 1) * limit };
}

export function pageMeta(page: number, limit: number, total: number) {
  return { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) };
}
