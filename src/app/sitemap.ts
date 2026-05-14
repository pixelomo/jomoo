import type { MetadataRoute } from 'next'

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL
  ?? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')

const locales = ['zh-CN', 'en']

type ChangeFreq = 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'

const pages: { path: string; priority: number; changeFrequency: ChangeFreq }[] = [
  // Homepage
  { path: '',                                          priority: 1.0, changeFrequency: 'weekly'  },
  // Product series (Phase 1)
  { path: '/products/smart-toilet',                   priority: 0.9, changeFrequency: 'weekly'  },
  { path: '/products/washstand',                      priority: 0.9, changeFrequency: 'weekly'  },
  { path: '/products/faucets',                        priority: 0.9, changeFrequency: 'weekly'  },
  { path: '/products/shower-set',                     priority: 0.9, changeFrequency: 'weekly'  },
  // Product detail pages (Phase 1)
  { path: '/products/smart-toilet/xp40-basic',        priority: 0.8, changeFrequency: 'monthly' },
  { path: '/products/smart-toilet/xp40-pro',          priority: 0.8, changeFrequency: 'monthly' },
  { path: '/products/smart-toilet/neorest-nx',        priority: 0.8, changeFrequency: 'monthly' },
  { path: '/products/washstand/ayzm24005-custom',     priority: 0.8, changeFrequency: 'monthly' },
  { path: '/products/washstand/new-economic',         priority: 0.8, changeFrequency: 'monthly' },
  { path: '/products/faucets/basin-p32758',           priority: 0.8, changeFrequency: 'monthly' },
  { path: '/products/faucets/kitchen-33231',          priority: 0.8, changeFrequency: 'monthly' },
  { path: '/products/faucets/pendant-square',         priority: 0.8, changeFrequency: 'monthly' },
  { path: '/products/faucets/pendant-round',          priority: 0.8, changeFrequency: 'monthly' },
  { path: '/products/shower-set/shower-set',          priority: 0.8, changeFrequency: 'monthly' },
  // Member portal + registration (Phase 1)
  { path: '/register',                                priority: 0.7, changeFrequency: 'monthly' },
  { path: '/dashboard',                               priority: 0.6, changeFrequency: 'monthly' },
]

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = []

  for (const locale of locales) {
    for (const page of pages) {
      entries.push({
        url: `${baseUrl}/${locale}${page.path}`,
        lastModified: new Date(),
        changeFrequency: page.changeFrequency,
        priority: page.priority,
      })
    }
  }

  return entries
}
