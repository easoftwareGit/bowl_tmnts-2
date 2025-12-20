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
      // show denied page (no login redirect loop)
      return NextResponse.rewrite(new URL("/denied", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/dataEntry/:path*",
    "/hello",
    "/sample",
    "/secret",
    "/user/:path*", // if you want /user and anything under it protected
  ],
};


// import NextAuth from "next-auth";
// import { NextResponse } from "next/server";
// import { authConfig } from "./auth-config";

// const { auth } = NextAuth(authConfig);

// export default auth((req) => {
//   const { pathname } = req.nextUrl;

//   // must be logged in for everything matched
//   if (!req.auth) {
//     const loginUrl = new URL("/login", req.url);
//     loginUrl.searchParams.set("callbackUrl", req.nextUrl.pathname);
//     return NextResponse.redirect(loginUrl);
//   }

//   // role gate for /dataEntry
//   if (pathname.startsWith("/dataEntry")) {
//     const role = req.auth.user?.role;
//     if (role !== "DIRECTOR" && role !== "ADMIN") {
//       return NextResponse.rewrite(new URL("/denied", req.url));
//     }
//   }

//   return NextResponse.next();
// });

// export const config = {
//   matcher: ["/dataEntry/:path*", "/denied", "/hello", "/sample", "/secret", "/user"],
// };


// import { NextResponse } from "next/server"
// import { auth } from "@/auth";

// export default auth((req) => {
//   const { pathname } = req.nextUrl;

//   // If you ever add /login to the matcher, this prevents a loop
//   if (pathname.startsWith("/login")) {
//     return NextResponse.next();
//   }

//   // Protect /dataEntry: only DIRECTOR or ADMIN
//   // MUST BE LOGGED IN for all matched routes
//   if (pathname.startsWith("/dataEntry")) {    
//     // const role = (req.auth?.token as any)?.role as string | undefined;
//     // const role = (req as any).auth?.token?.role as string | undefined;
//     const role = req.auth?.user?.role;
//     if (role !== "DIRECTOR" && role !== "ADMIN") {
//       return NextResponse.rewrite(new URL("/denied", req.url));
//     }
//   }

//   // If you return nothing, the request continues normally
//   return NextResponse.next();
// });

// // Without a defined matcher, this one line applies next-auth 
// // to the entire project

// export const config = {
//   matcher: ["/dataEntry/:path*", "/denied", "/hello", "/sample", "/secret", "/user"],
// };