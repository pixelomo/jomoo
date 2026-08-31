import type { Metadata } from 'next'
import Link from 'next/link'
import { search } from '@/lib/search'
import { imgUrl } from '@/lib/sanity'
import SearchForm from '@/components/search/SearchForm'
import '@/components/search/search.css'

export const metadata: Metadata = {
  title: '検索',
  description: 'JOMOO の商品情報とブログ記事を検索できます。',
  robots: { index: false },
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q = '' } = await searchParams
  const results = await search(q)

  return (
    <main className="flex-1 searchpage">
      <div className="searchpage__container">
        <nav className="searchpage__crumbs" aria-label="パンくずリスト">
          <Link href="/">ホーム</Link>
          <span className="searchpage__crumbs-sep" aria-hidden="true">
            /
          </span>
          <span className="searchpage__crumbs-current">検索</span>
        </nav>

        <h1 className="searchpage__title">検索</h1>
        <SearchForm defaultValue={results.query} />

        {results.query === '' ? (
          <p className="searchpage__empty">
            商品名やキーワードを入力してください。
          </p>
        ) : results.total === 0 ? (
          <p className="searchpage__empty">
            「{results.query}」に一致する結果は見つかりませんでした。
          </p>
        ) : (
          <>
            <p className="searchpage__count">
              「{results.query}」の検索結果：{results.total}件
            </p>

            {results.products.length > 0 && (
              <section className="searchpage__section">
                <h2 className="searchpage__heading">
                  商品 <span>{results.products.length}</span>
                </h2>
                <ul className="searchpage__list">
                  {results.products.map((hit) => (
                    <li key={hit.id}>
                      <Link href={hit.href} className="searchpage__hit">
                        <span
                          className={`searchpage__thumb${
                            hit.thumbnail ? ' has-image' : ''
                          }`}
                        >
                          {hit.thumbnail && (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img src={imgUrl(hit.thumbnail, 480)} alt="" />
                          )}
                        </span>
                        <span className="searchpage__hit-body">
                          <span className="searchpage__hit-title">{hit.title}</span>
                          {hit.subtitle && (
                            <span className="searchpage__hit-sub">{hit.subtitle}</span>
                          )}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {results.posts.length > 0 && (
              <section className="searchpage__section">
                <h2 className="searchpage__heading">
                  ブログ <span>{results.posts.length}</span>
                </h2>
                <ul className="searchpage__list">
                  {results.posts.map((hit) => (
                    <li key={hit.id}>
                      <Link href={hit.href} className="searchpage__hit">
                        <span
                          className={`searchpage__thumb${hit.cover ? ' has-image' : ''}`}
                        >
                          {hit.cover && (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img src={hit.cover} alt="" />
                          )}
                        </span>
                        <span className="searchpage__hit-body">
                          <span className="searchpage__hit-date">
                            {formatDate(hit.date)}
                          </span>
                          <span className="searchpage__hit-title">{hit.title}</span>
                          {hit.subtitle && (
                            <span className="searchpage__hit-sub">{hit.subtitle}</span>
                          )}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </>
        )}
      </div>
    </main>
  )
}
