import { NextRequest, NextResponse } from "next/server";

// This deployment is an API-only backend (no pages). The middleware's only
// job is CORS so a separate frontend (different domain) can call it.
//
// Auth uses a Bearer token (Authorization header), NOT cookies, so we don't
// need credentialed CORS — a plain allow-origin is enough.

const ALLOW_ORIGIN = process.env.FRONTEND_URL || "*";
const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": ALLOW_ORIGIN,
  "Access-Control-Allow-Methods": "GET,POST,PATCH,DELETE,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Max-Age": "86400",
  Vary: "Origin",
};

export function middleware(req: NextRequest) {
  // Preflight → answer immediately with CORS headers.
  if (req.method === "OPTIONS") {
    return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
  }
  // Attach CORS headers to every API response.
  const res = NextResponse.next();
  for (const [k, v] of Object.entries(CORS_HEADERS)) res.headers.set(k, v);
  return res;
}

export const config = {
  matcher: ["/api/:path*"],
};
