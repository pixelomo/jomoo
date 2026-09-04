import type { MetadataRoute } from 'next'
import { getProductSlugs } from '@/lib/sanity'

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL
  ?? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')

type ChangeFreq = 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'

const SERIES = ['smart-toilet', 'washstand', 'faucets', 'shower-set'] as const

const staticPages: { path: string; priority: number; changeFrequency: ChangeFreq }[] = [
  { path: '',                      priority: 1.0, changeFrequency: 'weekly'  },
  ...SERIES.map(series => ({
    path: `/products/${series}`,   priority: 0.9, changeFrequency: 'weekly' as ChangeFreq,
  })),
  { path: '/register',             priority: 0.7, changeFrequency: 'monthly' },
  { path: '/dashboard',            priority: 0.6, changeFrequency: 'monthly' },
  { path: '/privacy-policy',       priority: 0.3, changeFrequency: 'yearly'  },
  { path: '/terms-of-use',         priority: 0.3, changeFrequency: 'yearly'  },
]

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

  return [
    ...staticPages.map(page => ({
      url: `${baseUrl}${page.path}`,
      lastModified,
      changeFrequency: page.changeFrequency,
      priority: page.priority,
    })),
    ...productPages,
  ]
}
