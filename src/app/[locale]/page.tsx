import { getTranslations } from 'next-intl/server'
import { Show } from '@clerk/nextjs'
import Link from 'next/link'
import HeroSection from '@/components/home/HeroSection'

const newsItems = [
  { date: '2026/04/18', tag: 'NEWS',  text: '「JOMOO ショールーム 東京・南青山」グランド OPEN のお知らせ' },
  { date: '2026/03/02', tag: 'PRESS', text: '新シリーズ「Stillness」がグッドデザイン賞を受賞いたしました' },
  { date: '2026/02/14', tag: 'EVENT', text: '建築・設計関係者向け内覧会のご案内 — 大阪・梅田会場' },
]

const products = [
  { key: 'smartToilet', slug: 'smart-toilet', label: '[ smart toilet ]', comingSoon: false },
  { key: 'washstand',   slug: 'washstand',    label: '[ washstand ]',    comingSoon: true  },
  { key: 'faucets',     slug: 'faucets',      label: '[ faucet ]',       comingSoon: false },
  { key: 'showerSet',   slug: 'shower-set',   label: '[ shower set ]',   comingSoon: false },
]

export default async function HomePage() {
  const t = await getTranslations('home')

  return (
    <main>
      {/* ── HERO ── */}
      <HeroSection title={t('heroTitle')} sub1={t('heroSub1')} sub2={t('heroSub2')} />

      {/* ── PRODUCTS ── */}
      <section className="section-wrap">
        <h2 style={{ fontSize: '32px', fontWeight: 700, letterSpacing: '0.02em', margin: 0 }}>
          {t('productsTitle')}
        </h2>
        <div style={{ height: '2px', background: 'var(--gold)', margin: '20px 0 48px' }} />

        <div className="jm-product-grid">
          {products.map(({ key, slug, label, comingSoon }) => (
            <Link
              key={key}
              href={`/products/${slug}`}
              style={{ display: 'flex', flexDirection: 'column', cursor: 'pointer' }}
            >
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  aspectRatio: '16/9',
                  background: 'var(--img-grey)',
                  overflow: 'hidden',
                  marginBottom: '24px',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background:
                      'linear-gradient(180deg,rgba(255,255,255,0.06),rgba(0,0,0,0.05)),repeating-linear-gradient(45deg,#c5bfb8 0px,#c5bfb8 18px,#bbb4ac 18px,#bbb4ac 36px)',
                  }}
                />
                <span
                  style={{
                    position: 'absolute',
                    bottom: '12px',
                    left: '16px',
                    fontFamily: 'ui-monospace,monospace',
                    fontSize: '10px',
                    color: 'rgba(255,255,255,0.75)',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                  }}
                >
                  {label}
                </span>
                {comingSoon && (
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'rgba(70,65,60,0.55)',
                      backdropFilter: 'blur(6px)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <div
                      style={{
                        background: 'rgba(255,255,255,0.92)',
                        padding: '14px 36px',
                        fontWeight: 700,
                        fontSize: '18px',
                        letterSpacing: '0.16em',
                        color: '#2a2a2a',
                      }}
                    >
                      {t('comingSoon')}
                    </div>
                  </div>
                )}
              </div>

              <h3 style={{ fontSize: '22px', fontWeight: 600, textAlign: 'center', margin: '4px 0 12px', letterSpacing: '0.04em' }}>
                {t(`${key}Name` as Parameters<typeof t>[0])}
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.85, margin: '0 0 18px' }}>
                {t(`${key}Desc` as Parameters<typeof t>[0])}
              </p>
              <div style={{ textAlign: 'center', fontSize: '13px', color: 'var(--link-blue)', letterSpacing: '0.06em', fontWeight: 500 }}>
                {t('learnMore')} →
              </div>
            </Link>
          ))}
        </div>

        <Link
          href="/products/smart-toilet"
          style={{
            marginTop: '64px',
            display: 'flex',
            width: '100%',
            background: 'var(--mid-grey)',
            color: '#fff',
            padding: '28px',
            textAlign: 'center',
            fontSize: '16px',
            letterSpacing: '0.12em',
            fontWeight: 500,
            alignItems: 'center',
            justifyContent: 'center',
            gap: '14px',
          }}
        >
          {t('productsCta')}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </Link>
      </section>

      {/* ── INFORMATION ── */}
      <section className="section-wrap" style={{ paddingTop: 0 }}>
        <h2 style={{ fontSize: '32px', fontWeight: 700, letterSpacing: '0.02em', margin: 0 }}>
          {t('infoTitle')}
        </h2>
        <div style={{ height: '2px', background: 'var(--gold)', margin: '20px 0 0' }} />

        <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {newsItems.map(item => (
            <li
              key={item.date + item.tag}
              style={{
                display: 'flex',
                alignItems: 'baseline',
                gap: '24px',
                padding: '18px 0',
                borderBottom: '1px solid var(--hairline)',
                flexWrap: 'wrap',
              }}
            >
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  background: 'var(--gold)',
                  flexShrink: 0,
                  transform: 'translateY(-3px)',
                  display: 'inline-block',
                }}
              />
              <span
                style={{
                  fontFamily: 'ui-monospace,monospace',
                  fontSize: '13px',
                  color: 'var(--text-muted)',
                  flexShrink: 0,
                  minWidth: '90px',
                  letterSpacing: '0.02em',
                }}
              >
                {item.date}
              </span>
              <span style={{ fontSize: '14px', color: 'var(--foreground)', flex: 1, minWidth: '180px' }}>
                <span
                  style={{
                    fontSize: '11px',
                    background: '#f2eedd',
                    color: 'var(--gold-soft)',
                    padding: '3px 10px',
                    marginRight: '12px',
                    letterSpacing: '0.06em',
                    fontWeight: 600,
                    display: 'inline-block',
                    marginBottom: '2px',
                  }}
                >
                  {item.tag}
                </span>
                {item.text}
              </span>
            </li>
          ))}
        </ul>
        <div style={{ marginTop: '36px', textAlign: 'center' }}>
          <a href="#" style={{ color: 'var(--link-blue)', fontSize: '14px', fontWeight: 500, letterSpacing: '0.04em' }}>
            {t('infoMore')} →
          </a>
        </div>
      </section>

      {/* ── MEMBER PORTAL ── */}
      <section className="section-wrap" style={{ paddingTop: 0 }}>
        <h2 style={{ fontSize: '32px', fontWeight: 700, letterSpacing: '0.02em', margin: 0 }}>
          {t('memberTitle')}
        </h2>
        <div style={{ height: '2px', background: 'var(--gold)', margin: '20px 0 48px' }} />

        <div className="jm-member-split">
          {/* Left — warranty card visual */}
          <div
            className="jm-member-art"
            style={{
              position: 'relative',
              background:
                'linear-gradient(180deg,rgba(0,0,0,0.06),rgba(0,0,0,0.2)),repeating-linear-gradient(135deg,#b8b3aa 0px,#b8b3aa 24px,#aea89e 24px,#aea89e 48px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '40px',
            }}
          >
            <div
              style={{
                width: '100%',
                maxWidth: '360px',
                aspectRatio: '1.586',
                background: 'linear-gradient(135deg,#1f1d1a 0%,#3a342a 100%)',
                color: '#fff',
                padding: '26px 28px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '0 24px 48px rgba(0,0,0,0.25)',
                transform: 'rotate(-3deg)',
                borderTop: '3px solid var(--gold)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'rgba(255,255,255,0.65)', textTransform: 'uppercase' }}>
                <span style={{ fontWeight: 900, fontSize: '18px', color: '#fff', letterSpacing: '0.12em' }}>JOMOO</span>
                <span style={{ color: 'var(--gold)' }}>e-Warranty</span>
              </div>
              <div style={{ fontFamily: 'ui-monospace,monospace', fontSize: '15px', letterSpacing: '0.18em', color: 'rgba(255,255,255,0.9)' }}>
                JM · 0418 · 2026 · 0001
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'rgba(255,255,255,0.7)' }}>
                <span style={{ fontSize: '12px', color: '#fff' }}>YAMADA TARO</span>
                <span>VALID UNTIL 2031.04</span>
              </div>
            </div>
          </div>

          {/* Right — content */}
          <div className="jm-member-body">
            <span style={{ fontFamily: 'ui-monospace,monospace', fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--gold-soft)' }}>
              {t('memberEyebrow')}
            </span>
            <h3 style={{ fontSize: '28px', fontWeight: 700, letterSpacing: '0.02em', margin: 0, lineHeight: 1.3, whiteSpace: 'pre-line' }}>
              {t('memberHeading')}
            </h3>
            <p style={{ fontSize: '14px', lineHeight: 1.95, color: 'var(--text-soft)', margin: 0, letterSpacing: '0.02em' }}>
              {t('memberBody')}
            </p>
            <ul style={{ listStyle: 'none', margin: '8px 0 0', padding: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {(['memberFeat1', 'memberFeat2', 'memberFeat3'] as const).map(key => (
                <li key={key} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', fontSize: '14px', lineHeight: 1.6 }}>
                  <span style={{ width: '18px', height: '2px', background: 'var(--gold)', flexShrink: 0, marginTop: '11px', display: 'inline-block' }} />
                  {t(key)}
                </li>
              ))}
            </ul>
            <div style={{ display: 'flex', gap: '14px', marginTop: '16px', flexWrap: 'wrap' }}>
              <Show when="signed-out">
                <Link href="/sign-in" style={{ padding: '14px 28px', fontSize: '14px', fontWeight: 600, letterSpacing: '0.1em', background: 'var(--foreground)', color: '#fff', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                  {t('logIn')}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
                </Link>
                <Link href="/sign-up" style={{ padding: '14px 28px', fontSize: '14px', fontWeight: 600, letterSpacing: '0.1em', background: 'transparent', color: 'var(--foreground)', border: '1px solid var(--foreground)', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                  {t('signUp')}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
                </Link>
              </Show>
              <Show when="signed-in">
                <Link href="/dashboard" style={{ padding: '14px 28px', fontSize: '14px', fontWeight: 600, letterSpacing: '0.1em', background: 'var(--foreground)', color: '#fff', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                  {t('memberTitle')}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
                </Link>
              </Show>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
