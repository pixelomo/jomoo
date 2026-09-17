import type { MetadataRoute } from 'next'

/**
 * The origin, resolved exactly as sitemap.ts resolves it — the two must agree,
 * or robots.txt hands crawlers a sitemap on a host the sitemap does not
 * describe. See the note there for why VERCEL_PROJECT_PRODUCTION_URL comes
 * before VERCEL_URL.
 */
const baseUrl =
  process.env.NEXT_PUBLIC_SITE_URL
  ?? (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3000')

/**
 * There was no robots.txt, so the sitemap had nothing pointing at it and the
 * portal, the Studio and the scroll demo were all as crawlable as the shop
 * front.
 *
 * Disallow is not a security control — /admin and /studio keep their own auth,
 * and this only stops them turning up in results. The member tree is listed for
 * the same reason: those pages redirect to sign-in for a crawler, so indexing
 * them produces nothing but duplicate sign-in pages.
 *
 * /register is the exception and stays crawlable: it needs a session too, but
 * it is the page the packaging and the footer send owners to, and sitemap.ts
 * lists it deliberately. Disallowing it here would contradict that.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/studio',
          '/api/',
          '/dashboard',
          '/account',
          '/warranty/',
          '/verify',
          // A build demo that lives in the public tree but is not part of the
          // site; /search is a view of pages that are indexed in their own right.
          '/video-scroll-demo',
          '/search',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  }
}
