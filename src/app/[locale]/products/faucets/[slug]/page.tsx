import { getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { PortableText } from '@portabletext/react'
import { getProductDetail, getProductSlugs, urlFor, type ProductDetail } from '@/lib/sanity'
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
      <td style={{ width: '40%', padding: '14px 20px', fontWeight: 500, fontSize: '13px', letterSpacing: '0.04em', color: 'var(--text-soft)', borderBottom: '1px solid var(--hairline)', background: '#fafaf9', verticalAlign: 'top' }}>
        {label}
      </td>
      <td style={{ padding: '14px 20px', fontSize: '14px', color: 'var(--foreground)', borderBottom: '1px solid var(--hairline)', verticalAlign: 'top' }}>
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
    <div style={{ position: 'relative', width: '100%', paddingTop: '56.25%', background: '#1a1a1a' }}>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', color: 'rgba(255,255,255,0.4)' }}>
        <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><circle cx="12" cy="12" r="10" /><path d="M10 8l6 4-6 4V8z" fill="currentColor" /></svg>
        <span style={{ fontFamily: 'ui-monospace,monospace', fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase' }}>[ feature video · coming soon ]</span>
        <span style={{ fontSize: '13px', marginTop: '-8px' }}>{title}</span>
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
    dimensions:       { zhCN: 'サイズ (W×D×H)',    en: 'Dimensions (W×D×H)'   },
    material:         { zhCN: '素材',              en: 'Material'              },
    power:            { zhCN: '流量',              en: 'Flow Rate'             },
    drainageMethod:   { zhCN: 'カートリッジ',      en: 'Cartridge'             },
    waterConsumption: { zhCN: '接続規格',          en: 'Connection Size'       },
    weight:           { zhCN: '重量',              en: 'Weight'                },
    color:            { zhCN: 'カラー',            en: 'Available Finishes'    },
    certification:    { zhCN: '認証',              en: 'Certifications'        },
  }

  const slides = (product.images ?? []).map(img => ({
    src:     img.asset ? urlFor(img.asset).width(1600).url() : undefined,
    alt:     img.alt ?? name,
    caption: img.caption,
  }))

  return (
    <main>
      <div className="section-wrap" style={{ paddingTop: '24px', paddingBottom: 0, fontSize: '13px', color: 'var(--text-muted)', display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
        <Link href="/" style={{ color: 'var(--text-muted)' }}>Home</Link>
        <span>/</span>
        <Link href="/products/faucets" style={{ color: 'var(--text-muted)' }}>{t('faucetsName')}</Link>
        <span>/</span>
        <span style={{ color: 'var(--foreground)', fontWeight: 500 }}>{name}</span>
      </div>

      <div className="section-wrap jm-detail-grid" style={{ paddingTop: '40px' }}>
        <div className="jm-detail-carousel">
          <ImageCarousel slides={slides} />
        </div>

        <div>
          <p style={{ fontFamily: 'ui-monospace,monospace', fontSize: '12px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--gold-soft)', margin: '0 0 10px' }}>
            {product.modelCode}
          </p>
          <h1 style={{ fontSize: '34px', fontWeight: 700, letterSpacing: '0.02em', margin: '0 0 12px', lineHeight: 1.25, color: 'var(--foreground)' }}>
            {name}
          </h1>
          {tagline && (
            <p style={{ fontSize: '16px', color: 'var(--text-soft)', lineHeight: 1.7, margin: '0 0 32px', letterSpacing: '0.02em' }}>{tagline}</p>
          )}
          <div style={{ height: '2px', background: 'var(--gold)', margin: '0 0 32px' }} />

          {product.features && product.features.length > 0 && (
            <div style={{ marginBottom: '36px' }}>
              <h2 style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--text-muted)', margin: '0 0 16px' }}>Features</h2>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {product.features.map((f, i) => (
                  <li key={i} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                    <span style={{ width: '18px', height: '2px', background: 'var(--gold)', flexShrink: 0, marginTop: '11px', display: 'inline-block' }} />
                    <div>
                      <p style={{ fontWeight: 600, fontSize: '14px', margin: '0 0 2px', color: 'var(--foreground)' }}>{isZh ? f.title.zhCN : f.title.en}</p>
                      <p style={{ fontSize: '13px', color: 'var(--text-soft)', margin: 0, lineHeight: 1.6 }}>{isZh ? f.description.zhCN : f.description.en}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div style={{ display: 'flex', gap: '12px', marginBottom: '40px', flexWrap: 'wrap' }}>
            <Link href="/register" style={{ flex: 1, padding: '16px 24px', background: 'var(--foreground)', color: '#fff', fontWeight: 600, fontSize: '14px', letterSpacing: '0.1em', textAlign: 'center', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              製品を登録する
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
            </Link>
            <a href="#" style={{ padding: '16px 24px', border: '1px solid var(--foreground)', color: 'var(--foreground)', fontWeight: 600, fontSize: '14px', letterSpacing: '0.1em', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              お問い合わせ
            </a>
          </div>
        </div>
      </div>

      {description && (
        <section style={{ background: '#f6f4ef', padding: '80px 0' }}>
          <div className="section-wrap" style={{ maxWidth: '760px', paddingTop: 0, paddingBottom: 0 }}>
            <h2 style={{ fontSize: '26px', fontWeight: 700, margin: '0 0 24px', letterSpacing: '0.02em' }}>製品について</h2>
            <div style={{ fontSize: '15px', lineHeight: 2, color: 'var(--foreground)', letterSpacing: '0.03em' }}>
              <PortableText value={description as Parameters<typeof PortableText>[0]['value']} />
            </div>
          </div>
        </section>
      )}

      {product.featureVideos && product.featureVideos.length > 0 && (
        <section className="section-wrap" style={{ paddingBottom: 0 }}>
          <h2 style={{ fontSize: '26px', fontWeight: 700, margin: '0 0 8px', letterSpacing: '0.02em' }}>Feature Videos</h2>
          <div style={{ height: '2px', background: 'var(--gold)', margin: '16px 0 40px' }} />
          <div style={{ display: 'grid', gridTemplateColumns: product.featureVideos.length > 1 ? '1fr 1fr' : '1fr', gap: '32px' }}>
            {product.featureVideos.map((v, i) => (
              <div key={i}>
                <VideoPlaceholder title={isZh ? v.title.zhCN : v.title.en} embedUrl={v.embedUrl} />
                <p style={{ marginTop: '12px', fontSize: '14px', fontWeight: 500, color: 'var(--foreground)' }}>{isZh ? v.title.zhCN : v.title.en}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="section-wrap">
        <h2 style={{ fontSize: '26px', fontWeight: 700, margin: '0 0 8px', letterSpacing: '0.02em' }}>Specifications</h2>
        <div style={{ height: '2px', background: 'var(--gold)', margin: '16px 0 32px' }} />
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
          <div style={{ padding: '40px', background: '#f6f4ef', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px', fontFamily: 'ui-monospace,monospace', letterSpacing: '0.08em' }}>
            [ specifications · add in Sanity Studio ]
          </div>
        )}
      </section>
    </main>
  )
}
