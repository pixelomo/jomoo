/* eslint-disable @next/next/no-img-element */
import { getSeriesPage, getProductsInSeries, imgUrl } from '@/lib/sanity'
import { getCardArt, getHeroContent, getSeriesLineup } from '@/lib/product-content'
import FooterCtaSection from '@/components/home/FooterCtaSection'
// Reuses the homepage feature grid and footer CTA, so this route needs that
// stylesheet.
import '@/components/home/jomoo-homepage.css'

interface Props {
  series: string
}

export default async function SeriesPage({ series }: Props) {
  const [seriesData, products] = await Promise.all([
    getSeriesPage(series),
    getProductsInSeries(series),
  ])

  const seriesName = seriesData?.name ?? series
  const seriesDesc = seriesData?.description

  const lineup = getSeriesLineup(series, seriesName, seriesDesc)

  const cards = products.flatMap(p => {
    const art = getCardArt(p.slug, p.thumbnail ? imgUrl(p.thumbnail, 900) : undefined)
    if (!art) return []
    const summary = getHeroContent(series, p.slug, p.name)
    return [{
      slug: p.slug,
      href: `/products/${series}/${p.slug}`,
      eyebrow: summary.eyebrow,
      name: summary.title,
      desc: art.desc ?? p.tagline ?? '',
      art,
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
              {cards.map(card => (
                <a
                  key={card.slug}
                  href={card.href}
                  className="feature__card"
                  aria-label={`${card.name} の詳細を見る`}
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
                    {card.desc && <p className="feature__desc">{card.desc}</p>}
                    <span className="feature__more">詳しく見る&gt;</span>
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <p
              style={{
                padding: '4rem 0',
                textAlign: 'center',
                fontFamily: 'var(--font-en)',
                fontSize: '1rem',
                textTransform: 'uppercase',
                color: '#6e6e73',
              }}
            >
              [ no products published in Sanity for this series ]
            </p>
          )}
        </div>
      </section>

      <FooterCtaSection />
    </main>
  )
}
