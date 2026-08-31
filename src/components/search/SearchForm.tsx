'use client'

import { useState } from 'react'

/** The /search page's own field — the nav panel has its own, in JomooNav. */
export default function SearchForm({ defaultValue }: { defaultValue: string }) {
  const [value, setValue] = useState(defaultValue)

  return (
    <form action="/search" method="get" className="searchpage__form" role="search">
      <label className="sr-only" htmlFor="searchpage-q">
        検索キーワード
      </label>
      <input
        id="searchpage-q"
        name="q"
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="商品名・キーワードで検索"
        autoComplete="off"
      />
      <button type="submit">検索</button>
    </form>
  )
}
