// Site-wide search over the two things the public site actually publishes:
// products (Sanity) and blog posts (the build-time array in lib/blog/posts).
//
// Sanity's GROQ `match` is word-prefix based and tokenises on whitespace, which
// does nothing useful for Japanese — 「トイレ」 inside 「スマートトイレ」 is not a
// word boundary. So products are fetched once (there are a few dozen) and
// filtered here with plain substring matching, the same way the posts are.

import { getSanityClient, type AssetRef } from '@/lib/sanity'
import { BLOG_POSTS, type BlogPost } from '@/lib/blog/posts'

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

function blockText(post: BlogPost): string {
  return post.body
    .map((block) => {
      if (block.type === 'list') return block.items.join(' ')
      if (block.type === 'img') return block.alt
      return block.text
    })
    .join(' ')
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

  const posts = BLOG_POSTS.filter((post) =>
    matches(terms, [post.title, post.excerpt, post.author, blockText(post)])
  )
    .sort((a, b) => b.date.localeCompare(a.date))
    .map<PostHit>((post) => ({
      kind: 'post',
      id: post.slug,
      title: post.title,
      subtitle: post.excerpt,
      href: `/blog/${post.slug}`,
      date: post.date,
      cover: post.cover,
    }))

  const total = products.length + posts.length

  return {
    query,
    products: limit ? products.slice(0, limit) : products,
    posts: limit ? posts.slice(0, limit) : posts,
    total,
  }
}
