import { NextResponse } from 'next/server'
import { search } from '@/lib/search'
import { imgUrl } from '@/lib/sanity'

/** How many of each kind the drop-down panel shows before "see all results". */
const PREVIEW_LIMIT = 4

export async function GET(request: Request) {
  const q = new URL(request.url).searchParams.get('q') ?? ''
  const results = await search(q, PREVIEW_LIMIT)

  return NextResponse.json({
    query: results.query,
    total: results.total,
    products: results.products.map((hit) => ({
      id: hit.id,
      title: hit.title,
      subtitle: hit.subtitle,
      href: hit.href,
      image: hit.thumbnail ? imgUrl(hit.thumbnail, 260) : null,
    })),
    posts: results.posts.map((hit) => ({
      id: hit.id,
      title: hit.title,
      subtitle: hit.subtitle,
      href: hit.href,
      image: hit.cover ?? null,
    })),
  })
}
