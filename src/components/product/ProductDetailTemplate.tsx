/* eslint-disable @next/next/no-img-element */
import Link from 'next/link'
import { PortableText } from '@portabletext/react'
import { getProductsInSeries, imgUrl, type ProductDetail } from '@/lib/sanity'
import {
  getCardArt,
  getFeatureCopy,
  getHeroContent,
  getModelSrc,
  getPrice,
  getSpecImage,
  getStandardGroups,
  getStillAlias,
} from '@/lib/product-content'
import FooterCtaSection from '@/components/home/FooterCtaSection'
import ProductTabs, { type FeatureCardView, type SpecRowView } from './ProductTabs'
// The related grid and footer CTA reuse the homepage's feature__*/footer-cta__*
// rules, so this route needs that stylesheet. Imported first, so anything below
// can override it.
import '@/components/home/jomoo-homepage.css'
import './product-detail.css'

interface Props {
  product: ProductDetail
  /** Label for the series step of the breadcrumb, e.g. スマートトイレ. */
  seriesLabel: string
  /** Series listing route, e.g. /products/smart-toilet. */
  seriesHref: string
}

const SPEC_LABELS: Record<string, string> = {
  dimensions:       '外形寸法 (W×D×H)',
  material:         '素材',
  power:            '電源',
  drainageMethod:   '排水方式',
  waterConsumption: '洗浄水量',
  weight:           '重量',
  color:            'カラー',
  certification:    '認証',
}

function imgUrlOrUndefined(asset?: { _ref: string }): string | undefined {
  return asset ? imgUrl(asset, 900) : undefined
}

export default async function ProductDetailTemplate({
  product,
  seriesLabel,
  seriesHref,
}: Props) {
  const name        = product.name
  const description = product.longDescription

  // Exclude GIFs — no animation survives the Sanity CDN WebP pipeline
  const featureImgs = (product.featureImages ?? []).filter(fi => !fi.asset?._ref?.endsWith('-gif'))

  const hero = getHeroContent(
    product.series,
    product.slug.current,
    product.name,
    imgUrlOrUndefined(product.images?.[0]?.asset)
  )

  // Hand-written copy is the whole list when it exists; Sanity covers the rest.
  const featureCopy = getFeatureCopy(product.slug.current)
  const featureCards: FeatureCardView[] = featureCopy.length
    ? featureCopy.map((copy, i) => ({
        title: copy.title,
        body: copy.body,
        image: copy.image ?? imgUrlOrUndefined(featureImgs[i]?.asset),
        alt: copy.title.join(''),
      }))
    : (product.features ?? []).map((f, i) => {
        const title = f.title
        return {
          title: [title],
          body: [f.description],
          image: imgUrlOrUndefined(featureImgs[i]?.asset),
          alt: title || name,
        }
      })

  // Everything else in the series, as homepage-style lineup cards
  const siblings = (await getProductsInSeries(product.series)).filter(
    p => p.slug !== product.slug.current
  )
  const related = siblings.flatMap(p => {
    const art = getCardArt(p.slug, imgUrlOrUndefined(p.thumbnail))
    if (!art) return []
    const summary = getHeroContent(product.series, p.slug, p.name)
    return [{
      slug: p.slug,
      href: `${seriesHref}/${p.slug}`,
      eyebrow: summary.eyebrow,
      name: summary.title,
      desc: p.tagline ?? '',
      art,
    }]
  })

  // The 3D card's resting still, optionally borrowed from a sibling
  const stillAlias = getStillAlias(product.slug.current)
  const still = imgUrlOrUndefined(
    (stillAlias && siblings.find(p => p.slug === stillAlias)?.thumbnail) ||
      product.images?.[0]?.asset
  )

  const specRows: SpecRowView[] = [
    ...Object.entries(product.specTable ?? {}).flatMap(([key, value]) =>
      SPEC_LABELS[key] && value
        ? [{ label: SPEC_LABELS[key], value }]
        : []
    ),
    ...(product.specs ?? []).flatMap(spec =>
      spec.value ? [{ label: spec.label, value: spec.value }] : []
    ),
  ]

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
        standard={getStandardGroups(product.slug.current)}
        specs={specRows}
        specImage={getSpecImage(product.slug.current)}
        type={{
          eyebrow: hero.eyebrow,
          name: hero.title,
          modelCode: product.modelCode,
          price: getPrice(product.slug.current),
          model: getModelSrc(product.slug.current),
          still,
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
              {product.featureVideos.map((v, i) => {
                const title = v.title
                return (
                  <div key={i} className="pdp-card">
                    <div className="pdp-video__frame">
                      {v.embedUrl ? (
                        <iframe
                          src={v.embedUrl}
                          title={title}
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
                    <p className="pdp-video__caption">{title}</p>
                  </div>
                )
              })}
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
