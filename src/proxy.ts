import { getSessionCookie } from 'better-auth/cookies'
import createIntlMiddleware from 'next-intl/middleware'
import { NextRequest, NextResponse } from 'next/server'
import { routing } from './i18n/routing'

const handleI18nRouting = createIntlMiddleware(routing)

// Fast cookie-existence check — no DB round-trip in the proxy.
// Full session validation happens inside each server component / API route.
const PROTECTED = /^\/(zh-CN|en)\/(dashboard|register|warranty)/

export default function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Admin portal and its API routes are outside the locale tree
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    return NextResponse.next()
  }

  // Skip API routes entirely — Better Auth handles auth for its own handler,
  // and our API routes validate sessions themselves.
  if (pathname.startsWith('/api/')) return NextResponse.next()

  if (PROTECTED.test(req.nextUrl.pathname)) {
    const session = getSessionCookie(req)
    if (!session) {
      const locale = req.nextUrl.pathname.split('/')[1] ?? 'zh-CN'
      return NextResponse.redirect(new URL(`/${locale}/sign-in`, req.url))
    }
  }

  return handleI18nRouting(req)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|studio|images/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml|json|mov|mp4|webm)$).*)',
    '/',
  ],
}
