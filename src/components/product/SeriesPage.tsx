/* eslint-disable @next/next/no-img-element */
import { COMING_SOON_LABEL, getSeriesPage, getProductsInSeries, imgUrl, type AssetRef } from '@/lib/sanity'
import FooterCtaSection from '@/components/home/FooterCtaSection'
// Reuses the homepage feature grid and footer CTA, so this route needs that
// stylesheet.
import '@/components/home/jomoo-homepage.css'

interface Props {
  series: string
}

const url = (asset?: AssetRef, width = 900) => (asset ? imgUrl(asset, width) : undefined)

export default async function SeriesPage({ series }: Props) {
  const [seriesData, products] = await Promise.all([
    getSeriesPage(series),
    getProductsInSeries(series),
  ])

  const fallbackEyebrow =
    seriesData?.productDefaults?.heroEyebrow ?? series.replace(/-/g, ' ').toUpperCase()

  const lineup = {
    eyebrow: seriesData?.lineup?.eyebrow || `${fallbackEyebrow} LINEUP`,
    title: seriesData?.lineup?.title || seriesData?.name || series,
    subtitle: (seriesData?.lineup?.subtitle || seriesData?.description || '')
      .split('\n')
      .filter(Boolean),
  }

  const cards = products.flatMap(p => {
    const image = url(p.card?.image?.asset) ?? url(p.thumbnail)
    if (!image) return []
    return [{
      slug: p.slug,
      // A 近日発売 product has no page yet, so its card is not a link.
      href: p.comingSoon ? undefined : `/products/${series}/${p.slug}`,
      eyebrow: p.heroEyebrow || fallbackEyebrow,
      name: p.heroTitle || p.name,
      tagline: p.comingSoon ? [] : (p.card?.tagline ?? '').split('\n').filter(Boolean),
      desc: p.comingSoon ? COMING_SOON_LABEL : p.card?.description ?? p.tagline ?? '',
      art: { image, hover: url(p.card?.hoverImage?.asset) },
    }]
  })

  return (
    <main>
      <section className="feature" data-nav="light">
        <div className="feature__inner">
          <div className="feature__head">
            <div className="feature__eyebrow">{lineup.eyebrow}</div>
            <h1 className="feature__title">{lineup.title}</h1>
            <div className="feature__rule" aria-hidden="true" />
            {lineup.subtitle.length > 0 && (
              <p className="feature__subtitle">
                {lineup.subtitle.map((line, i) => (
                  <span key={line}>
                    {i > 0 && <br />}
                    {line}
                  </span>
                ))}
              </p>
            )}
          </div>

          {cards.length > 0 ? (
            <div className="feature__grid">
              {cards.map(card => {
                const Card = card.href ? 'a' : 'div'
                return (
                <Card
                  key={card.slug}
                  href={card.href}
                  className="feature__card"
                  aria-label={card.href ? `${card.name} の詳細を見る` : undefined}
                >
                  <div className="feature__media">
                    <img
                      className="feature__img feature__img--default"
                      src={card.art.image}
                      alt={`JOMOO ${card.name}`}
                    />
                    {card.art.hover && (
                      <img
                        className="feature__img feature__img--hover"
                        src={card.art.hover}
                        alt=""
                        aria-hidden="true"
                      />
                    )}
                  </div>
                  <div className="feature__content">
                    <span className="feature__pill">{card.eyebrow}</span>
                    <h2 className="feature__name">{card.name}</h2>
                    {card.tagline.length > 0 && (
                      <p className="feature__tagline">
                        {card.tagline.map((line, i) => (
                          <span key={line}>
                            {i > 0 && <br />}
                            {line}
                          </span>
                        ))}
                      </p>
                    )}
                    {card.desc && <p className="feature__desc">{card.desc}</p>}
                    {card.href && <span className="feature__more">詳しく見る&gt;</span>}
                  </div>
                </Card>
                )
              })}
            </div>
          ) : (
            <p style={{ padding: '2rem 0 4rem', textAlign: 'center' }}>
              <a className="global-projects__cta" href="/contact-us">
                製品についてお問い合わせ
                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <path d="M4 12h15M13 6l6 6-6 6" />
                </svg>
              </a>
            </p>
          )}
        </div>
      </section>

      <FooterCtaSection />
    </main>
  )
}
