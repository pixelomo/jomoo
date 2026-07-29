import { getSessionCookie } from 'better-auth/cookies'
import { NextRequest, NextResponse } from 'next/server'

// Fast cookie-existence check — no DB round-trip in the proxy.
// Full session validation happens inside each server component / API route.
const PROTECTED = /^\/(dashboard|register|warranty)(\/|$)/

export default function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Admin portal and its API routes have their own auth
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    return NextResponse.next()
  }

  // Skip API routes entirely — Better Auth handles auth for its own handler,
  // and our API routes validate sessions themselves.
  if (pathname.startsWith('/api/')) return NextResponse.next()

  if (PROTECTED.test(pathname)) {
    const session = getSessionCookie(req)
    if (!session) {
      return NextResponse.redirect(new URL('/sign-in', req.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|studio|images/|glb/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml|json|mov|mp4|webm|glb)$).*)',
    '/',
  ],
}
