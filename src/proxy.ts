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

export default clerkMiddleware(async (auth, req: NextRequest) => {
  if (isProtectedRoute(req)) {
    await auth.protect()
  }
  return handleI18nRouting(req)
})

export const config = {
  matcher: [
    // Skip Next.js internals, static files, and Sanity Studio
    '/((?!_next/static|_next/image|favicon.ico|studio|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml|json)$).*)',
    '/',
  ],
}
