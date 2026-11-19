import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "./auth-config";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { pathname, search } = req.nextUrl;

  // must be logged in for everything matched
  if (!req.auth) {
    const loginUrl = new URL("/login", req.url);

    // preserve full requested path (including querystring)
    loginUrl.searchParams.set("callbackUrl", `${pathname}${search}`);

    return NextResponse.redirect(loginUrl);
  }

  // role gate for /dataEntry
  if (pathname.startsWith("/dataEntry")) {
    const role = req.auth.user?.role;

    if (role !== "DIRECTOR" && role !== "ADMIN") {
      // send the browser to /denied; the address bar changes to /denied
      return NextResponse.redirect(new URL("/denied", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/dataEntry/:path*",
    "/reports/:path*",
    "/hello",
    "/secret",
    "/user/:path*", // /user and anything under it protected
  ],
};
