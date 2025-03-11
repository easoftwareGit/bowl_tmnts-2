// Ref: https://next-auth.js.org/configuration/nextjs#advanced-usage
import nextAuth from "next-auth"
import { withAuth, NextRequestWithAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"
import { roleTypes } from "./lib/types/types"

export default withAuth(
  function middleware(request: NextRequestWithAuth) {
    console.log(request.nextUrl.pathname)
    console.log(request.nextauth.token)

    if (request.nextUrl.pathname.startsWith('/dataEntry')
        && request.nextauth.token?.role !== 'DIRECTOR'
        && request.nextauth.token?.role !== 'ADMIN') {
      return NextResponse.rewrite(new URL('/denied', request.url))
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    }
  }
)

// // Without a defined matcher, this one line applies next-auth 
// // to the entire project
// export { default } from "next-auth/middleware"

export const config = {
  matcher: [
    '/dataEntry',
    '/denied',
    '/hello',
    '/sample',
    '/secret',  
    '/user',    
  ]
}

// '/app/:path*'
// will include all sub folders for /app/ and all sub directories