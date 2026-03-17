import { auth } from "@/lib/auth/config";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // Public routes
  const publicPaths = ["/login", "/api/auth"];
  const isPublic = publicPaths.some((p) => pathname.startsWith(p));

  if (isPublic) {
    return NextResponse.next();
  }

  // Redirect to login if not authenticated
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
