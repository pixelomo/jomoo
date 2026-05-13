import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import createIntlMiddleware from 'next-intl/middleware'
import { NextRequest } from 'next/server'
import { routing } from './i18n/routing'

const handleI18nRouting = createIntlMiddleware(routing)

const isProtectedRoute = createRouteMatcher([
  '/:locale/dashboard(.*)',
  '/:locale/register(.*)',
  '/:locale/warranty(.*)',
])

// Returning undefined (bare return) for API routes lets Clerk inject its own
// auth headers before passing to the route handler. Returning NextResponse.next()
// bypasses that injection and breaks auth(). next-intl is skipped for API routes
// so it cannot redirect /api/... to /en/api/...
const isApiRoute = createRouteMatcher(['/api/(.*)'])

export default clerkMiddleware(async (auth, req: NextRequest) => {
  if (isApiRoute(req)) return
  if (isProtectedRoute(req)) {
    await auth.protect()
  }
  return handleI18nRouting(req)
})

export const config = {
  matcher: [
    // API routes are intentionally included so Clerk processes session cookies
    '/((?!_next/static|_next/image|favicon.ico|studio|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml|json)$).*)',
    '/',
  ],
}
