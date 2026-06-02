import { getLocale } from 'next-intl/server'
import Link from 'next/link'
import { getSeriesPage, getProductsInSeries, imgUrl } from '@/lib/sanity'

interface Props {
  series: string
}

export default async function SeriesPage({ series }: Props) {
  const [locale, seriesData, products] = await Promise.all([
    getLocale(),
    getSeriesPage(series),
    getProductsInSeries(series),
  ])

  const title = seriesData?.name
    ? (locale === 'zh-CN' ? seriesData.name.zhCN : seriesData.name.en)
    : series
  const description = seriesData?.description
    ? (locale === 'zh-CN' ? seriesData.description.zhCN : seriesData.description.en)
    : null

  const learnMore = locale === 'zh-CN' ? '詳細を見る' : 'Learn more'

  return (
    <main>
      <div className="jm-sec-inner" style={{ paddingTop: 80, paddingBottom: 80 }}>
        <div style={{ marginBottom: 48 }}>
          <h1 style={{ fontSize: 40, fontWeight: 700, margin: '0 0 12px', letterSpacing: '0.02em', color: 'var(--ink)', borderBottom: '3px solid var(--accent)', display: 'inline-block', paddingBottom: 10 }}>
            {title}
          </h1>
          {description && (
            <p style={{ fontSize: 16, color: 'var(--ink-2)', lineHeight: 1.8, marginTop: 24, maxWidth: 600 }}>
              {description}
            </p>
          )}
        </div>

        {products.length === 0 ? (
          <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--ink-4)', fontFamily: 'ui-monospace,monospace', fontSize: 12, letterSpacing: '0.1em' }}>
            [ no products published in Sanity for this series ]
          </div>
        ) : (
          <div className="jm-listing-grid-3">
            {products.map(p => {
              const name = locale === 'zh-CN' ? p.name.zhCN : p.name.en
              const tagline = p.tagline ? (locale === 'zh-CN' ? p.tagline.zhCN : p.tagline.en) : null
              const thumbnailUrl = p.thumbnail ? imgUrl(p.thumbnail, 800) : null

              return (
                <Link
                  key={p.slug}
                  href={`/products/${series}/${p.slug}`}
                  style={{ display: 'flex', flexDirection: 'column', textDecoration: 'none', border: '1px solid var(--line)', background: 'var(--paper)' }}
                >
                  <div style={{ position: 'relative', width: '100%', aspectRatio: '4/3', overflow: 'hidden', background: '#f8f8f8' }}>
                    {thumbnailUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={thumbnailUrl}
                        alt={name}
                        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <>
                        <div style={{ position: 'absolute', inset: 0, background: 'repeating-linear-gradient(45deg,#dce4f5 0px,#dce4f5 18px,#c8d6f0 18px,#c8d6f0 36px)' }} />
                        <span style={{ position: 'absolute', bottom: 10, left: 14, fontFamily: 'ui-monospace,monospace', fontSize: 10, color: 'rgba(255,255,255,0.85)', letterSpacing: '0.1em' }}>
                          [ {p.modelCode} ]
                        </span>
                      </>
                    )}
                  </div>
                  <div style={{ padding: '20px 20px 24px' }}>
                    <h3 style={{ fontSize: 17, fontWeight: 600, margin: '0 0 8px', letterSpacing: '0.02em', color: 'var(--ink)' }}>
                      {name}
                    </h3>
                    {tagline && (
                      <p style={{ fontSize: 13, color: 'var(--ink-3)', margin: '0 0 12px', lineHeight: 1.6 }}>
                        {tagline}
                      </p>
                    )}
                    <span style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 600, letterSpacing: '0.04em' }}>
                      {learnMore} →
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
