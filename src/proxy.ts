import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import createIntlMiddleware from 'next-intl/middleware'
import { NextRequest, NextResponse } from 'next/server'
import { routing } from './i18n/routing'

const handleI18nRouting = createIntlMiddleware(routing)

const isProtectedRoute = createRouteMatcher([
  '/:locale/dashboard(.*)',
  '/:locale/register(.*)',
  '/:locale/warranty(.*)',
])

// API routes stay in the matcher so Clerk can read session cookies,
// but we skip next-intl to prevent /api/... being rewritten to /en/api/...
const isApiRoute = createRouteMatcher(['/api/(.*)'])

export default clerkMiddleware(async (auth, req: NextRequest) => {
  if (isApiRoute(req)) return NextResponse.next()
  if (isProtectedRoute(req)) {
    await auth.protect()
  }
  return handleI18nRouting(req)
})

export const config = {
  matcher: [
    // Skip Next.js internals, static files, and Sanity Studio
    // API routes are included so Clerk processes session cookies
    '/((?!_next/static|_next/image|favicon.ico|studio|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml|json)$).*)',
    '/',
  ],
}
