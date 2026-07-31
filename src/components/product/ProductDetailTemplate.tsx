/* eslint-disable @next/next/no-img-element */
import Link from 'next/link'
import { PortableText } from '@portabletext/react'
import {
  getProductsInSeries,
  getSeriesPage,
  imgUrl,
  type AssetRef,
  type ProductDetail,
  type SeriesPageData,
} from '@/lib/sanity'
import FooterCtaSection from '@/components/home/FooterCtaSection'
import ProductTabs, {
  type FeatureCardView,
  type SpecGroupView,
} from './ProductTabs'
// The related grid and footer CTA reuse the homepage's feature__*/footer-cta__*
// rules, so this route needs that stylesheet. Imported first, so anything below
// can override it.
import '@/components/home/jomoo-homepage.css'
import './product-detail.css'

interface Props {
  product: ProductDetail
}

const FALLBACK_HERO = '/images/placeholder-hero-scene.jpg'

/**
 * Poster frame behind the 3D viewer until it loads. Shared by every product:
 * it stands in for the model, so it is interface chrome rather than the
 * product photography that lives in Sanity.
 */
const MODEL_PLACEHOLDER = '/images/3Dplaceholder.jpg'

function url(asset?: AssetRef, width = 900): string | undefined {
  return asset ? imgUrl(asset, width) : undefined
}

/** Sanity stores multi-line copy as one string; the template renders per line. */
function lines(text?: string): string[] {
  return text ? text.split('\n').filter(Boolean) : []
}

/**
 * Falls back to the series defaults, then to the product name, so a product that
 * has not had its hero filled in still renders something sensible.
 */
function resolveHero(product: ProductDetail, series: SeriesPageData | null) {
  const defaults = series?.productDefaults
  const suffix = defaults?.nameSuffix

  const strippedName =
    suffix && product.name.endsWith(suffix)
      ? product.name.slice(0, -suffix.length).trim() || product.name
      : product.name

  return {
    eyebrow: product.hero?.eyebrow || defaults?.heroEyebrow || product.series.replace(/-/g, ' ').toUpperCase(),
    title: product.hero?.title || strippedName,
    catch: lines(product.hero?.catchphrase || defaults?.heroCatchphrase),
    image:
      url(product.hero?.image?.asset, 1800) ??
      url(defaults?.heroImage?.asset, 1800) ??
      url(product.images?.[0]?.asset, 1800) ??
      FALLBACK_HERO,
  }
}

export default async function ProductDetailTemplate({ product }: Props) {
  const [series, siblingsAll] = await Promise.all([
    getSeriesPage(product.series),
    getProductsInSeries(product.series),
  ])

  const seriesHref = `/products/${product.series}`
  const seriesLabel = series?.name ?? product.series

  const hero = resolveHero(product, series)
  const description = product.longDescription

  const featureCards: FeatureCardView[] = (product.featureCards ?? []).map(card => {
    const title = lines(card.title)
    return {
      title,
      body: lines(card.body),
      image: url(card.image?.asset),
      alt: title.join('') || product.name,
    }
  })

  // Everything else in the series, as homepage-style lineup cards
  const siblings = siblingsAll.filter(p => p.slug !== product.slug.current)
  const related = siblings.flatMap(p => {
    const image = url(p.card?.image?.asset) ?? url(p.thumbnail)
    if (!image) return []
    return [{
      slug: p.slug,
      href: `${seriesHref}/${p.slug}`,
      eyebrow: p.heroEyebrow || hero.eyebrow,
      name: p.heroTitle || p.name,
      desc: p.card?.description ?? p.tagline ?? '',
      art: { image, hover: url(p.card?.hoverImage?.asset) },
    }]
  })

  const specGroups: SpecGroupView[] = (product.specGroups ?? []).flatMap(group => {
    const rows = (group.rows ?? []).filter(row => row.label && row.value)
    return rows.length ? [{ title: group.title, rows }] : []
  })

  return (
    <main className="pdp">
      {/* HERO — full-bleed lifestyle image, model name on the right */}
      <header className="pdp-hero">
        <img className="pdp-hero__media" src={hero.image} alt="" />
        <div className="pdp-hero__scrim" aria-hidden="true" />
        <div className="site-container pdp-hero__inner">
          <div className="pdp-hero__content">
            <p className="pdp-hero__eyebrow">{hero.eyebrow}</p>
            <h1 className="pdp-hero__title">{hero.title}</h1>
            {hero.catch.length > 0 && (
              <p className="pdp-hero__catch">
                {hero.catch.map((line, i) => (
                  <span key={line}>
                    {i > 0 && <br />}
                    {line}
                  </span>
                ))}
              </p>
            )}
          </div>
        </div>
      </header>

      <div className="site-container">
        <nav className="pdp-crumbs" aria-label="パンくずリスト">
          <Link href="/">ホーム</Link>
          <span aria-hidden="true">/</span>
          <Link href={seriesHref}>{seriesLabel}</Link>
          <span aria-hidden="true">/</span>
          <span className="pdp-crumbs__current">{hero.title}</span>
        </nav>
      </div>

      <ProductTabs
        features={featureCards}
        standard={product.standardGroups ?? []}
        specs={specGroups}
        specNote={product.specNote}
        specImage={url(product.specImage?.asset, 1400)}
        type={{
          eyebrow: hero.eyebrow,
          name: hero.title,
          modelCode: product.modelCode,
          price: product.price ?? '',
          model: product.model3dUrl,
          still: MODEL_PLACEHOLDER,
        }}
      />

      {/* ABOUT */}
      {description && (
        <section className="pdp-section pdp-about">
          <div className="site-container">
            <div className="pdp-eyebrow">ABOUT</div>
            <h2 className="pdp-title">製品について</h2>
            <div className="pdp-rule" aria-hidden="true" />
            <div className="pdp-card pdp-about__card">
              <div className="pdp-body">
                <PortableText value={description as Parameters<typeof PortableText>[0]['value']} />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* FEATURE VIDEOS */}
      {product.featureVideos && product.featureVideos.length > 0 && (
        <section className="pdp-section pdp-videos">
          <div className="site-container">
            <div className="pdp-eyebrow">MOVIE</div>
            <h2 className="pdp-title">特長動画</h2>
            <div className="pdp-rule" aria-hidden="true" />
            <div
              className={`pdp-videos__grid${
                product.featureVideos.length === 1 ? ' pdp-videos__grid--single' : ''
              }`}
            >
              {product.featureVideos.map((v, i) => (
                <div key={i} className="pdp-card">
                  <div className="pdp-video__frame">
                    {v.embedUrl ? (
                      <iframe
                        src={v.embedUrl}
                        title={v.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : (
                      <div className="pdp-video__empty">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" aria-hidden="true">
                          <circle cx="12" cy="12" r="10" />
                          <path d="M10 8l6 4-6 4V8z" fill="currentColor" />
                        </svg>
                        <span>[ feature video · coming soon ]</span>
                      </div>
                    )}
                  </div>
                  <p className="pdp-video__caption">{v.title}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* RELATED PRODUCTS — homepage lineup card */}
      {related.length > 0 && (
        <section className="pdp-section pdp-related">
          <div className="site-container">
            <h2 className="pdp-title pdp-title--center">関連商品</h2>
            <div className="pdp-rule pdp-rule--center" aria-hidden="true" />
            <div
              className={`feature__grid${
                related.length === 1 ? ' pdp-related__grid--single' : ''
              }`}
            >
              {related.map(item => (
                <a
                  key={item.slug}
                  href={item.href}
                  className="feature__card"
                  aria-label={`${item.name} の詳細を見る`}
                >
                  <div className="feature__media">
                    <img
                      className="feature__img feature__img--default"
                      src={item.art.image}
                      alt={`JOMOO ${item.name}`}
                    />
                    {item.art.hover && (
                      <img
                        className="feature__img feature__img--hover"
                        src={item.art.hover}
                        alt=""
                        aria-hidden="true"
                      />
                    )}
                  </div>
                  <div className="feature__content">
                    <span className="feature__pill">{item.eyebrow}</span>
                    <h3 className="feature__name">{item.name}</h3>
                    {item.desc && <p className="feature__desc">{item.desc}</p>}
                    <span className="feature__more">詳しく見る&gt;</span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      <FooterCtaSection />
    </main>
  )
}
