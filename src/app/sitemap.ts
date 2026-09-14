import type { MetadataRoute } from 'next'
import { getProductSlugs } from '@/lib/sanity'
import { SITE_ROUTES } from '@/lib/site-routes.generated'

/**
 * The origin every URL in the sitemap is written against.
 *
 * VERCEL_PROJECT_PRODUCTION_URL comes before VERCEL_URL deliberately: the
 * latter is the URL of *this deployment*, which is a different host on every
 * push. A sitemap built from it tells Google about jomoo-3dv9g….vercel.app
 * rather than jomoo.jp — every canonical URL wrong, and a new set of them each
 * time the site ships. VERCEL_URL is kept last so a preview deployment still
 * links to itself rather than to production.
 */
const baseUrl =
  process.env.NEXT_PUBLIC_SITE_URL
  ?? (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3000')

type ChangeFreq = 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'

const SERIES = ['smart-toilet', 'washstand', 'faucets', 'shower-set'] as const

/**
 * How often a page changes and how much it matters, for the pages where the
 * default is wrong. Everything else — including any page added from now on —
 * takes DEFAULT_RANK, so a new route is listed the moment it exists rather
 * than the moment somebody remembers to come back here.
 */
const RANK: Record<string, { priority: number; changeFrequency: ChangeFreq }> = {
  '/': { priority: 1.0, changeFrequency: 'weekly' },
  '/blog': { priority: 0.8, changeFrequency: 'weekly' },
  '/global-projects': { priority: 0.8, changeFrequency: 'monthly' },
  '/company-information': { priority: 0.8, changeFrequency: 'monthly' },
  '/contact-us': { priority: 0.6, changeFrequency: 'yearly' },
  '/privacy-policy': { priority: 0.3, changeFrequency: 'yearly' },
  '/terms-of-use': { priority: 0.3, changeFrequency: 'yearly' },
  ...Object.fromEntries(
    SERIES.map((series) => [
      `/products/${series}`,
      { priority: 0.9, changeFrequency: 'weekly' as ChangeFreq },
    ])
  ),
}

const DEFAULT_RANK = { priority: 0.7, changeFrequency: 'monthly' as ChangeFreq }

/**
 * Pages that are not in SITE_ROUTES — it only covers the public tree — but that
 * belong in the sitemap anyway. 製品登録 sits behind a session, yet it is the
 * page the packaging and the footer point owners at, so it is worth indexing;
 * the rest of the protected tree is not.
 */
const EXTRA = [{ path: '/register', priority: 0.7, changeFrequency: 'monthly' as ChangeFreq }]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date()

  // Detail pages come from Sanity rather than a hand-kept list — the previous
  // hardcoded slugs no longer matched any published product and were listing
  // URLs that 404.
  const bySeries = await Promise.all(
    SERIES.map(async series => ({ series, slugs: await getProductSlugs(series) }))
  )

  const productPages = bySeries.flatMap(({ series, slugs }) =>
    slugs.map(slug => ({
      url: `${baseUrl}/products/${series}/${slug}`,
      lastModified,
      changeFrequency: 'monthly' as ChangeFreq,
      priority: 0.8,
    }))
  )

  const staticPages = [
    ...SITE_ROUTES.map((route) => ({ path: route, ...(RANK[route] ?? DEFAULT_RANK) })),
    ...EXTRA,
  ]

  return [
    ...staticPages.map(page => ({
      // The home page's route is '/', which would otherwise give a trailing slash.
      url: page.path === '/' ? baseUrl : `${baseUrl}${page.path}`,
      lastModified,
      changeFrequency: page.changeFrequency,
      priority: page.priority,
    })),
    ...productPages,
  ]
}
