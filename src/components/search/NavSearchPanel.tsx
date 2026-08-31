/* eslint-disable @next/next/no-img-element */
'use client'

import { useEffect, useRef, useState } from 'react'

interface Hit {
  id: string
  title: string
  subtitle?: string
  href: string
  image: string | null
}

interface Results {
  query: string
  total: number
  products: Hit[]
  posts: Hit[]
}

const EMPTY: Results = { query: '', total: 0, products: [], posts: [] }

interface Props {
  open: boolean
  onClose: () => void
}

/**
 * The white panel that drops out of the nav. Results are fetched as you type
 * (debounced) and shown inline; the footer link hands the same query to
 * /search for the full list. Deliberately a plain <a> like the rest of the
 * chrome, so the nav's scroll observer is re-created on the new document.
 */
export default function NavSearchPanel({ open, onClose }: Props) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Results>(EMPTY)
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  useEffect(() => {
    const term = query.trim()
    if (!term) {
      setResults(EMPTY)
      setLoading(false)
      return
    }

    setLoading(true)
    const controller = new AbortController()
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(term)}`, {
          signal: controller.signal,
        })
        if (!res.ok) throw new Error('search failed')
        setResults(await res.json())
      } catch (error) {
        if ((error as Error).name !== 'AbortError') setResults({ ...EMPTY, query: term })
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }, 220)

    return () => {
      controller.abort()
      clearTimeout(timer)
    }
  }, [query])

  const term = query.trim()
  const hasHits = results.products.length > 0 || results.posts.length > 0

  return (
    <div
      className="nav__searchpanel"
      id="nav-search"
      hidden={!open}
      aria-hidden={!open}
    >
      <div className="nav__searchpanel-inner">
        <form
          action="/search"
          method="get"
          className="nav__searchpanel-form"
          role="search"
          onSubmit={(e) => {
            if (!term) e.preventDefault()
          }}
        >
          <img src="/images/search.svg" alt="" className="nav__searchpanel-icon" />
          <input
            ref={inputRef}
            name="q"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="商品名・キーワードで検索"
            autoComplete="off"
            aria-label="サイト内検索"
          />
          <button
            type="button"
            className="nav__searchpanel-close"
            onClick={onClose}
            aria-label="検索を閉じる"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </form>

        <div className="nav__searchpanel-results">
          {!term ? (
            <p className="nav__searchpanel-hint">
              商品情報やブログ記事を検索できます。
            </p>
          ) : loading ? (
            <p className="nav__searchpanel-hint">検索中…</p>
          ) : !hasHits ? (
            <p className="nav__searchpanel-hint">
              「{term}」に一致する結果は見つかりませんでした。
            </p>
          ) : (
            <div className="nav__searchpanel-cols">
              {results.products.length > 0 && (
                <section>
                  <h3>商品</h3>
                  <ul>
                    {results.products.map((hit) => (
                      <li key={hit.id}>
                        <a href={hit.href}>
                          <span className="nav__searchpanel-thumb">
                            {hit.image && <img src={hit.image} alt="" />}
                          </span>
                          <span className="nav__searchpanel-text">
                            <strong>{hit.title}</strong>
                            {hit.subtitle && <em>{hit.subtitle}</em>}
                          </span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {results.posts.length > 0 && (
                <section>
                  <h3>ブログ</h3>
                  <ul>
                    {results.posts.map((hit) => (
                      <li key={hit.id}>
                        <a href={hit.href}>
                          <span className="nav__searchpanel-thumb">
                            {hit.image && <img src={hit.image} alt="" />}
                          </span>
                          <span className="nav__searchpanel-text">
                            <strong>{hit.title}</strong>
                            {hit.subtitle && <em>{hit.subtitle}</em>}
                          </span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </div>
          )}
        </div>

        {term !== '' && hasHits && (
          <a
            className="nav__searchpanel-all"
            href={`/search?q=${encodeURIComponent(term)}`}
          >
            すべての検索結果を見る（{results.total}件）
          </a>
        )}
      </div>
    </div>
  )
}
