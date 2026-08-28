'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { formatBlogDate, type BlogPost } from '@/lib/blog/posts'

const PER_PAGE = 9

/** The global site lays the cards out with Masonry; three columns filled in
 *  reading order come to the same thing for a list this size, and they survive
 *  server rendering, so nothing jumps into place after hydration. */
function useColumnCount() {
  const [columns, setColumns] = useState(3)

  useEffect(() => {
    const wide = window.matchMedia('(min-width: 992px)')
    const medium = window.matchMedia('(min-width: 768px)')

    const read = () => setColumns(wide.matches ? 3 : medium.matches ? 2 : 1)

    read()
    wide.addEventListener('change', read)
    medium.addEventListener('change', read)
    return () => {
      wide.removeEventListener('change', read)
      medium.removeEventListener('change', read)
    }
  }, [])

  return columns
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.5-3.5" strokeLinecap="round" />
    </svg>
  )
}

function Card({ post }: { post: BlogPost }) {
  return (
    <Link href={`/blog/${post.slug}`} className="blog__card">
      <div className="blog__card-time">{formatBlogDate(post.date)}</div>
      <div className="blog__card-media">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={post.cover} alt={post.title} loading="lazy" />
      </div>
      <h3 className="blog__card-title">{post.title}</h3>
      <p className="blog__card-desc">{post.excerpt}</p>
    </Link>
  )
}

export function BlogGrid({ posts }: { posts: BlogPost[] }) {
  const columns = useColumnCount()

  const buckets = useMemo(() => {
    const out: BlogPost[][] = Array.from({ length: columns }, () => [])
    posts.forEach((post, index) => out[index % columns].push(post))
    return out
  }, [posts, columns])

  return (
    <div className="blog__grid">
      {buckets.map((bucket, index) => (
        <div className="blog__col" key={index}>
          {bucket.map((post) => (
            <Card post={post} key={post.slug} />
          ))}
        </div>
      ))}
    </div>
  )
}

export default function BlogIndex({ posts }: { posts: BlogPost[] }) {
  const [query, setQuery] = useState('')
  const [term, setTerm] = useState('')
  const [page, setPage] = useState(1)

  const matches = useMemo(() => {
    const needle = term.trim().toLowerCase()
    if (!needle) return posts
    return posts.filter((post) =>
      `${post.title} ${post.excerpt}`.toLowerCase().includes(needle)
    )
  }, [posts, term])

  const pageCount = Math.max(1, Math.ceil(matches.length / PER_PAGE))
  const current = Math.min(page, pageCount)
  const visible = matches.slice((current - 1) * PER_PAGE, current * PER_PAGE)

  const search = () => {
    setTerm(query)
    setPage(1)
  }

  return (
    <>
      <div className="blog__nav">
        <div className="blog__title-group">
          <h1 className="blog__heading">ブログ</h1>
          <p className="blog__subheading">
            バスルームにまつわる知見とアイデアをお届けします。
          </p>
        </div>

        <div className="blog__search">
          <input
            type="text"
            className="blog__search-field"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyUp={(event) => {
              if (event.key === 'Enter') search()
            }}
            placeholder="記事を検索"
            aria-label="記事を検索"
          />
          <button type="button" className="blog__search-btn" onClick={search} aria-label="検索">
            <SearchIcon />
          </button>
        </div>
      </div>

      <div className="blog__rule" />

      {visible.length > 0 ? (
        <BlogGrid posts={visible} />
      ) : (
        <p className="blog__empty">該当する記事は見つかりませんでした。</p>
      )}

      {pageCount > 1 && (
        <div className="blog__pagination">
          <button
            type="button"
            className="blog__page-btn"
            onClick={() => setPage(current - 1)}
            disabled={current === 1}
            aria-label="前のページ"
          >
            ‹
          </button>
          {Array.from({ length: pageCount }, (_, index) => index + 1).map((number) => (
            <button
              type="button"
              key={number}
              className={`blog__page-btn${number === current ? ' is-active' : ''}`}
              onClick={() => setPage(number)}
              aria-current={number === current ? 'page' : undefined}
            >
              {number}
            </button>
          ))}
          <button
            type="button"
            className="blog__page-btn"
            onClick={() => setPage(current + 1)}
            disabled={current === pageCount}
            aria-label="次のページ"
          >
            ›
          </button>
        </div>
      )}
    </>
  )
}
