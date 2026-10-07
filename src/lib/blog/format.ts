// Types and formatting the blog shares between the server and the browser.
// The posts themselves come from Sanity — see ./posts.

import type { PortableTextBlock } from '@portabletext/react'

export interface BlogPostSummary {
  slug: string
  title: string
  /** ISO date — formatted for display by formatBlogDate. */
  date: string
  author?: string
  /** Shown on the card and as the standfirst above the article body. */
  excerpt: string
  /** A sized Sanity CDN URL. */
  cover: string
  /** The cover's intrinsic pixel size, read off the Sanity asset. The index
   *  uses it to tell a landscape cover from a portrait one — the landscape ones
   *  are all cropped to one band so the cards line up, and a portrait cover
   *  would lose most of itself to it. */
  coverWidth: number
  coverHeight: number
  /** The Sanity image itself, for the link-preview card (lib/seo.ts). */
  coverSource?: unknown
}

/** A picture in the body, with the file's own size so the page can hold its
 *  space and lay a portrait one out taller. */
export interface BlogImage {
  _type: 'image'
  _key: string
  asset?: { _ref: string }
  alt?: string
  caption?: string
  width: number
  height: number
}

export type BlogBody = Array<PortableTextBlock | BlogImage>

export interface BlogPost extends BlogPostSummary {
  body: BlogBody
}

/** 2025-11-24 → 2025年11月24日 */
export function formatBlogDate(iso: string) {
  const [year, month, day] = iso.split('-')
  return `${year}年${Number(month)}月${Number(day)}日`
}
