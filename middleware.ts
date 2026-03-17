import { auth } from "@/lib/auth/config";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // Public routes — no auth required
  const publicPaths = ["/login", "/api/auth", "/api/public"];
  const isPublic = publicPaths.some((p) => pathname.startsWith(p));

  // Root homepage and property detail pages are public
  if (pathname === "/" || pathname.startsWith("/p/") || isPublic) {
    return NextResponse.next();
  }

  // Dashboard routes require auth
  if (!req.auth) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public).*)"],
};
