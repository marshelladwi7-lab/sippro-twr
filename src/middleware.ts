import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AUTH_COOKIE_NAME, decodeSession } from "@/lib/auth/session";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect /workstation route and subroutes
  if (pathname.startsWith("/workstation")) {
    const sessionToken = request.cookies.get(AUTH_COOKIE_NAME)?.value;

    if (!sessionToken || !decodeSession(sessionToken)) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/workstation/:path*"],
};
