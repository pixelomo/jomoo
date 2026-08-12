/**
 * The site's own origin, with no trailing slash.
 *
 * Everything that leaves the site needs this: an email has no origin of its own
 * to resolve a relative path against, so links and images in one must be
 * absolute or they simply do not work. Building them from here rather than
 * hardcoding a host is what makes a domain change a single environment
 * variable — set NEXT_PUBLIC_APP_URL and every email follows.
 *
 * The fallbacks matter because the alternative is silent breakage: returning an
 * empty string turns `${origin}/dashboard` into a relative `/dashboard`, which
 * looks fine in code and is a dead link in somebody's inbox.
 */
export function appOrigin(): string {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim()
  if (configured) return configured.replace(/\/$/, '')

  // Preview deployments have no configured URL but do know their own host.
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`

  if (process.env.NODE_ENV === 'production') {
    console.error(
      '[app-url] NEXT_PUBLIC_APP_URL is not set — links and images in email will ' +
        'point at the per-deployment URL, which changes on every deploy'
    )
  }
  return 'http://localhost:3000'
}
