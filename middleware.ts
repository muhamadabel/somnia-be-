import { NextRequest, NextResponse } from "next/server";

// Fast cookie-presence gate for protected pages. Real session validation
// happens server-side in the (app) layout and every API route — this only
// improves UX by redirecting obvious guests before rendering.
const PROTECTED = [
  "/dashboard",
  "/dreams",
  "/calendar",
  "/trends",
  "/gallery",
  "/symbols",
  "/reports",
  "/companion",
  "/community",
  "/settings",
  "/notifications",
  "/admin",
  "/onboarding",
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const hasSession = req.cookies.has("djs_session");

  if (PROTECTED.some((p) => pathname === p || pathname.startsWith(p + "/")) && !hasSession) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }
  if ((pathname === "/login" || pathname === "/register") && hasSession) {
    const url = req.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|icon.svg|favicon.ico).*)"],
};
