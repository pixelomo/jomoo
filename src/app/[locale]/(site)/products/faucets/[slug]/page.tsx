import { getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { PortableText } from '@portabletext/react'
import { getProductDetail, getProductSlugs, imgUrl, type ProductDetail } from '@/lib/sanity'
import ImageCarousel from '@/components/product/ImageCarousel'

type Params = Promise<{ locale: string; slug: string }>

export async function generateStaticParams() {
  const slugs = await getProductSlugs('faucets')
  const locales = ['zh-CN', 'en']
  return locales.flatMap(locale => slugs.map(slug => ({ locale, slug })))
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale, slug } = await params
  const product = await getProductDetail('faucets', slug)
  if (!product) return {}
  const name = locale === 'zh-CN' ? product.name.zhCN : product.name.en
  return {
    title: name,
    description: locale === 'zh-CN' ? product.tagline?.zhCN : product.tagline?.en,
  }
}

function SpecRow({ label, value }: { label: string; value?: string }) {
  if (!value) return null
  return (
    <tr>
      <td style={{ width: '40%', padding: '14px 20px', fontWeight: 500, fontSize: 13, letterSpacing: '0.04em', color: 'var(--ink-2)', borderBottom: '1px solid var(--line)', background: 'var(--bg-soft)', verticalAlign: 'top' }}>
        {label}
      </td>
      <td style={{ padding: '14px 20px', fontSize: 14, color: 'var(--ink)', borderBottom: '1px solid var(--line)', verticalAlign: 'top' }}>
        {value}
      </td>
    </tr>
  )
}

function VideoPlaceholder({ title, embedUrl }: { title: string; embedUrl?: string }) {
  if (embedUrl) {
    return (
      <div style={{ position: 'relative', width: '100%', paddingTop: '56.25%' }}>
        <iframe src={embedUrl} title={title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }} />
      </div>
    )
  }
  return (
    <div style={{ position: 'relative', width: '100%', paddingTop: '56.25%', background: '#0a0a0a' }}>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, color: 'rgba(255,255,255,0.35)' }}>
        <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><circle cx="12" cy="12" r="10" /><path d="M10 8l6 4-6 4V8z" fill="currentColor" /></svg>
        <span style={{ fontFamily: 'var(--font-poppins), sans-serif', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase' }}>[ feature video · coming soon ]</span>
        <span style={{ fontSize: 13, marginTop: -8 }}>{title}</span>
      </div>
    </div>
  )
}

export default async function FaucetsDetailPage({ params }: { params: Params }) {
  const { locale, slug } = await params
  const t = await getTranslations('home')

  const product: ProductDetail | null = await getProductDetail('faucets', slug)
  if (!product) notFound()

  const isZh = locale === 'zh-CN'
  const name        = isZh ? product.name.zhCN        : product.name.en
  const tagline     = isZh ? product.tagline?.zhCN    : product.tagline?.en
  const description = isZh ? product.longDescription?.zhCN : product.longDescription?.en

  const specLabels: Record<string, { zhCN: string; en: string }> = {
    dimensions:       { zhCN: 'サイズ (W×D×H)', en: 'Dimensions (W×D×H)'  },
    material:         { zhCN: '素材',            en: 'Material'            },
    power:            { zhCN: '流量',            en: 'Flow Rate'           },
    drainageMethod:   { zhCN: 'カートリッジ',    en: 'Cartridge'           },
    waterConsumption: { zhCN: '接続規格',        en: 'Connection Size'     },
    weight:           { zhCN: '重量',            en: 'Weight'              },
    color:            { zhCN: 'カラー',          en: 'Available Finishes'  },
    certification:    { zhCN: '認証',            en: 'Certifications'      },
  }

  const slides = (product.images ?? []).map(img => ({
    src:   img.asset ? imgUrl(img.asset, 1600) : undefined,
    thumb: img.asset ? imgUrl(img.asset, 240)  : undefined,
    alt:     img.alt ?? name,
    caption: img.caption,
  }))

  return (
    <main>
      {/* Breadcrumb */}
      <div className="jm-sec-inner" style={{ paddingTop: 24, paddingBottom: 0, fontSize: 13, color: 'var(--ink-3)', display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <Link href="/" style={{ color: 'var(--ink-3)', textDecoration: 'none' }}>ホーム</Link>
        <span>/</span>
        <Link href="/products/faucets" style={{ color: 'var(--ink-3)', textDecoration: 'none' }}>{t('faucetsName')}</Link>
        <span>/</span>
        <span style={{ color: 'var(--ink)', fontWeight: 500 }}>{name}</span>
      </div>

      {/* Main grid */}
      <div className="section-wrap jm-detail-grid" style={{ paddingTop: 40 }}>
        <div className="jm-detail-carousel">
          <ImageCarousel slides={slides} />
        </div>

        <div>
          <p style={{ fontFamily: 'var(--font-poppins), sans-serif', fontSize: 12, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--accent)', margin: '0 0 10px' }}>
            {product.modelCode}
          </p>
          <h1 style={{ fontSize: 34, fontWeight: 700, letterSpacing: '0.02em', margin: '0 0 12px', lineHeight: 1.25, color: 'var(--ink)' }}>
            {name}
          </h1>
          {tagline && (
            <p style={{ fontSize: 16, color: 'var(--ink-2)', lineHeight: 1.7, margin: '0 0 28px', letterSpacing: '0.02em' }}>{tagline}</p>
          )}
          <div style={{ height: 3, background: 'var(--accent)', margin: '0 0 32px', width: 48 }} />

          {product.features && product.features.length > 0 && (
            <div style={{ marginBottom: 36 }}>
              <h2 style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--ink-3)', margin: '0 0 16px' }}>特長</h2>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {product.features.map((f, i) => (
                  <li key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                    <span style={{ width: 18, height: 2, background: 'var(--accent)', flexShrink: 0, marginTop: 11, display: 'inline-block' }} />
                    <div>
                      <p style={{ fontWeight: 600, fontSize: 14, margin: '0 0 2px', color: 'var(--ink)' }}>{isZh ? f.title.zhCN : f.title.en}</p>
                      <p style={{ fontSize: 13, color: 'var(--ink-2)', margin: 0, lineHeight: 1.6 }}>{isZh ? f.description.zhCN : f.description.en}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div style={{ display: 'flex', gap: 12, marginBottom: 40, flexWrap: 'wrap' }}>
            <Link href="/register" style={{ flex: 1, padding: '16px 24px', background: 'var(--accent)', color: '#fff', fontWeight: 600, fontSize: 14, letterSpacing: '0.06em', textAlign: 'center', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, textDecoration: 'none' }}>
              製品を登録する
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
            </Link>
            <a href="#" style={{ padding: '16px 24px', border: '1px solid var(--ink)', color: 'var(--ink)', fontWeight: 600, fontSize: 14, letterSpacing: '0.06em', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, textDecoration: 'none' }}>
              お問い合わせ
            </a>
          </div>
        </div>
      </div>

      {/* Long description */}
      {description && (
        <section style={{ background: 'var(--bg-soft)', padding: '80px 0' }}>
          <div className="section-wrap" style={{ maxWidth: 760, paddingTop: 0, paddingBottom: 0 }}>
            <h2 style={{ fontSize: 26, fontWeight: 700, margin: '0 0 8px', letterSpacing: '0.02em', color: 'var(--ink)' }}>製品について</h2>
            <div style={{ height: 3, background: 'var(--accent)', width: 40, margin: '0 0 32px' }} />
            <div style={{ fontSize: 15, lineHeight: 2, color: 'var(--ink)', letterSpacing: '0.03em' }}>
              <PortableText value={description as Parameters<typeof PortableText>[0]['value']} />
            </div>
          </div>
        </section>
      )}

      {/* Feature videos */}
      {product.featureVideos && product.featureVideos.length > 0 && (
        <section className="section-wrap" style={{ paddingBottom: 0 }}>
          <h2 style={{ fontSize: 26, fontWeight: 700, margin: '0 0 8px', letterSpacing: '0.02em', color: 'var(--ink)' }}>特長動画</h2>
          <div style={{ height: 3, background: 'var(--accent)', width: 40, margin: '0 0 40px' }} />
          <div style={{ display: 'grid', gridTemplateColumns: product.featureVideos.length > 1 ? '1fr 1fr' : '1fr', gap: 32 }}>
            {product.featureVideos.map((v, i) => (
              <div key={i}>
                <VideoPlaceholder title={isZh ? v.title.zhCN : v.title.en} embedUrl={v.embedUrl} />
                <p style={{ marginTop: 12, fontSize: 14, fontWeight: 500, color: 'var(--ink)' }}>{isZh ? v.title.zhCN : v.title.en}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Spec table */}
      <section className="section-wrap">
        <h2 style={{ fontSize: 26, fontWeight: 700, margin: '0 0 8px', letterSpacing: '0.02em', color: 'var(--ink)' }}>仕様</h2>
        <div style={{ height: 3, background: 'var(--accent)', width: 40, margin: '0 0 32px' }} />
        <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
          <tbody>
            {product.specTable && Object.entries(product.specTable).map(([key, val]) => {
              const label = specLabels[key]
              if (!label || !val) return null
              return <SpecRow key={key} label={isZh ? label.zhCN : label.en} value={val} />
            })}
            {product.specs?.map((spec, i) => (
              <SpecRow key={`custom-${i}`} label={isZh ? spec.label.zhCN : spec.label.en} value={spec.value} />
            ))}
          </tbody>
        </table>
        {(!product.specTable && !product.specs?.length) && (
          <div style={{ padding: 40, background: 'var(--bg-soft)', textAlign: 'center', color: 'var(--ink-3)', fontSize: 14, fontFamily: 'var(--font-poppins), sans-serif', letterSpacing: '0.08em', border: '1px solid var(--line)' }}>
            [ specifications · add in Sanity Studio ]
          </div>
        )}
      </section>
    </main>
  )
}
