import withAuth from "next-auth/middleware"
import type { NextRequestWithAuth } from "next-auth/middleware"

export default withAuth(
  function proxy(req: NextRequestWithAuth) {
    const isAuth = !!req.nextauth.token
    const isAuthPage =
      req.nextUrl.pathname.startsWith("/login") || req.nextUrl.pathname.startsWith("/signup")

    if (isAuthPage && isAuth) {
      return Response.redirect(new URL("/dashboard", req.nextUrl))
    }

    return null
  },
  {
    pages: {
      signIn: "/login",
    },
    callbacks: {
      authorized: ({ req, token }) => {
        const isAuthPage =
          req.nextUrl.pathname.startsWith("/login") || req.nextUrl.pathname.startsWith("/signup")

        if (isAuthPage) {
          return true
        }

        return !!token
      },
    },
  }
)

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
