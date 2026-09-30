// The ブログ posts, edited in the Studio (blogPost documents). Newest first by
// the editor-set date.

import { cache } from 'react'
import { getSanityClient, imgUrl } from '@/lib/sanity'
import type { BlogPost, BlogPostSummary } from './format'

export * from './format'

/** Wide enough for a card on a retina screen and for a link preview. */
const COVER_WIDTH = 1200

const SUMMARY_FIELDS = `
  "slug": slug.current,
  title,
  date,
  author,
  excerpt,
  cover,
  "coverWidth": cover.asset->metadata.dimensions.width,
  "coverHeight": cover.asset->metadata.dimensions.height
`

type Raw<T> = Omit<T, 'cover'> & { cover?: unknown }

function withCover<T extends BlogPostSummary>(raw: Raw<T>): T {
  return {
    ...raw,
    cover: raw.cover ? imgUrl(raw.cover, COVER_WIDTH) : '',
    coverWidth: raw.coverWidth ?? 16,
    coverHeight: raw.coverHeight ?? 9,
  } as T
}

/** Every published post, newest first — once per request. */
export const getPosts = cache(async (): Promise<BlogPostSummary[]> => {
  try {
    const rows = await getSanityClient().fetch<Raw<BlogPostSummary>[]>(
      `*[_type == "blogPost" && defined(slug.current) && defined(date)]
        | order(date desc) { ${SUMMARY_FIELDS} }`
    )
    return rows.map(withCover)
  } catch {
    return []
  }
})

export const getPost = cache(async (slug: string): Promise<BlogPost | null> => {
  try {
    const row = await getSanityClient().fetch<Raw<BlogPost> | null>(
      `*[_type == "blogPost" && slug.current == $slug][0] {
        ${SUMMARY_FIELDS},
        body[] {
          ...,
          _type == "image" => {
            "width": asset->metadata.dimensions.width,
            "height": asset->metadata.dimensions.height
          }
        }
      }`,
      { slug }
    )
    return row ? withCover<BlogPost>({ ...row, body: row.body ?? [] }) : null
  } catch {
    return null
  }
})

/** Prev/next within the dated list, for the detail page's bottom bar. */
export async function getNeighbours(slug: string) {
  const posts = await getPosts()
  const index = posts.findIndex((post) => post.slug === slug)
  return {
    prev: index > 0 ? posts[index - 1] : undefined,
    next: index >= 0 && index < posts.length - 1 ? posts[index + 1] : undefined,
  }
}

/** The newest posts other than this one, for the "関連記事" grid. */
export async function getRelated(slug: string, limit = 3) {
  return (await getPosts()).filter((post) => post.slug !== slug).slice(0, limit)
}
