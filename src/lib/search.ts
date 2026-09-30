// Site-wide search over the two things the public site actually publishes:
// products and blog posts, both in Sanity.
//
// Sanity's GROQ `match` is word-prefix based and tokenises on whitespace, which
// does nothing useful for Japanese — 「トイレ」 inside 「スマートトイレ」 is not a
// word boundary. So both are fetched whole (a few dozen products, a handful of
// posts) and filtered here with plain substring matching.

import { getSanityClient, imgUrl, type AssetRef } from '@/lib/sanity'

export interface ProductHit {
  kind: 'product'
  id: string
  title: string
  subtitle?: string
  href: string
  thumbnail?: AssetRef
}

export interface PostHit {
  kind: 'post'
  id: string
  title: string
  subtitle?: string
  href: string
  date: string
  cover?: string
}

export type SearchHit = ProductHit | PostHit

export interface SearchResults {
  query: string
  products: ProductHit[]
  posts: PostHit[]
  total: number
}

interface SearchableProduct {
  _id: string
  slug?: string
  series?: string
  name?: string
  tagline?: string
  modelCode?: string
  description?: string
  heroTitle?: string
  heroCatchphrase?: string
  thumbnail?: AssetRef
}

/** Every product a visitor can reach, in one query — cached per request by Next. */
async function getSearchableProducts(): Promise<SearchableProduct[]> {
  try {
    return await getSanityClient().fetch(
      `*[_type == "product" && defined(slug.current) && defined(series)] | order(name asc) {
        _id,
        "slug": slug.current,
        series,
        name,
        tagline,
        modelCode,
        "description": card.description,
        "heroTitle": hero.title,
        "heroCatchphrase": hero.catchphrase,
        "thumbnail": coalesce(card.image.asset, images[0].asset)
      }`
    )
  } catch {
    return []
  }
}

function normalise(value: string): string {
  return value
    .toLowerCase()
    // Full-width alphanumerics to half-width, so ｘ４０ finds X40.
    .replace(/[Ａ-Ｚａ-ｚ０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0))
    .replace(/[\s　]+/g, '')
}

/** Every whitespace-separated term must appear somewhere in the haystack. */
function matches(terms: string[], fields: Array<string | undefined>): boolean {
  const haystack = normalise(fields.filter(Boolean).join(' '))
  return terms.every((term) => haystack.includes(term))
}

interface SearchablePost {
  slug: string
  title: string
  date: string
  author?: string
  excerpt?: string
  cover?: { asset?: AssetRef }
  /** The body as plain text, with the pictures' alt text alongside. */
  text?: string
  alts?: string[]
}

async function getSearchablePosts(): Promise<SearchablePost[]> {
  try {
    return await getSanityClient().fetch(
      `*[_type == "blogPost" && defined(slug.current) && defined(date)] | order(date desc) {
        "slug": slug.current,
        title,
        date,
        author,
        excerpt,
        cover,
        "text": pt::text(body),
        "alts": body[_type == "image"].alt
      }`
    )
  } catch {
    return []
  }
}

export async function search(rawQuery: string, limit?: number): Promise<SearchResults> {
  const query = rawQuery.trim()
  if (!query) return { query: '', products: [], posts: [], total: 0 }

  const terms = query
    .split(/[\s　]+/)
    .map(normalise)
    .filter(Boolean)

  const products = (await getSearchableProducts())
    .filter((p) =>
      matches(terms, [
        p.name,
        p.tagline,
        p.modelCode,
        p.description,
        p.heroTitle,
        p.heroCatchphrase,
        p.series,
      ])
    )
    .map<ProductHit>((p) => ({
      kind: 'product',
      id: p._id,
      title: p.name ?? p.modelCode ?? '',
      subtitle: p.tagline ?? p.description,
      href: `/products/${p.series}/${p.slug}`,
      thumbnail: p.thumbnail,
    }))

  const posts = (await getSearchablePosts())
    .filter((post) =>
      matches(terms, [post.title, post.excerpt, post.author, post.text, ...(post.alts ?? [])])
    )
    .map<PostHit>((post) => ({
      kind: 'post',
      id: post.slug,
      title: post.title,
      subtitle: post.excerpt,
      href: `/blog/${post.slug}`,
      date: post.date,
      cover: post.cover?.asset ? imgUrl(post.cover, 400) : undefined,
    }))

  const total = products.length + posts.length

  return {
    query,
    products: limit ? products.slice(0, limit) : products,
    posts: limit ? posts.slice(0, limit) : posts,
    total,
  }
}
