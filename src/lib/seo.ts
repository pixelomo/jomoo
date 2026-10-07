import type { Metadata } from 'next'
import { urlFor } from '@/lib/sanity'

/**
 * Search and share metadata for every public page.
 *
 * Next merges metadata shallowly: a page that sets `openGraph` replaces the
 * layout's whole `openGraph`, and a page that does not inherits the layout's —
 * title and all, so every page would share as the top page. Each page therefore
 * builds its full set here, with its own title, description, URL and image.
 */

/** The origin, resolved as sitemap.ts and robots.ts resolve it. */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL
  ?? (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3000')

export const SITE_NAME = 'JOMOO JAPAN'

export const DEFAULT_TITLE = 'JOMOO JAPAN | スマートトイレ X40シリーズ・スマートバスルーム'

/** The top page's, until トップページ › 検索 in the Studio says otherwise. */
export const DEFAULT_DESCRIPTION =
  '1990年設立、世界120カ国で展開するスマートバスルームブランドJOMOO。セルフクリーニングとUV除菌のX40-B、白金脱臭と超静音フラッシュのX40-C — スマートトイレX40シリーズが、毎日のバスルームをもっと快適に。'

type ShareImage = { url: string; width: number; height: number; alt: string }

/** The X40 in the top page's hero, built by scripts/build-share-images.mjs. */
export const DEFAULT_IMAGES: ShareImage[] = [
  { url: '/og/jomoo-x40-1200x630.jpg', width: 1200, height: 630, alt: 'JOMOO スマートトイレ X40' },
  { url: '/og/jomoo-x40-1200x1200.jpg', width: 1200, height: 1200, alt: 'JOMOO スマートトイレ X40' },
]

/**
 * A Sanity image cut to the 1.91:1 card every platform's large preview uses,
 * as a JPEG — LINE and some older crawlers do not read WebP. The crop follows
 * the image's hotspot when one is set.
 */
export function sanityShareImage(source: unknown, alt: string): ShareImage[] | undefined {
  const ref = (source as { asset?: { _ref?: string } } | undefined)?.asset?._ref
  if (!ref || ref.endsWith('-svg') || ref.endsWith('-gif')) return undefined
  return [
    {
      url: urlFor(source).width(1200).height(630).fit('crop').format('jpg').quality(85).url(),
      width: 1200,
      height: 630,
      alt,
    },
  ]
}

export function pageMetadata({
  title,
  description,
  path,
  images,
  type = 'website',
  publishedTime,
}: {
  /** The page's own name; the template adds 「| JOMOO」. Omit for the top page. */
  title?: string
  description?: string
  /** The path from the site root, e.g. `/showroom`; omitted only by the layout's fallback. */
  path?: string
  images?: ShareImage[]
  type?: 'website' | 'article'
  publishedTime?: string
}): Metadata {
  const shareTitle = title ? `${title} | JOMOO` : DEFAULT_TITLE
  const shareDescription = description || DEFAULT_DESCRIPTION
  const shareImages = images?.length ? images : DEFAULT_IMAGES

  return {
    ...(title ? { title } : {}),
    description: shareDescription,
    ...(path ? { alternates: { canonical: path } } : {}),
    openGraph: {
      title: shareTitle,
      description: shareDescription,
      ...(path ? { url: path } : {}),
      siteName: SITE_NAME,
      locale: 'ja_JP',
      type,
      images: shareImages,
      ...(type === 'article' && publishedTime ? { publishedTime } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: shareTitle,
      description: shareDescription,
      // X takes the first image only; the 1.91:1 card is first.
      images: shareImages.slice(0, 1).map(({ url, alt }) => ({ url, alt })),
    },
  }
}
