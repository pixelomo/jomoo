import { getTranslations } from 'next-intl/server'
import Link from 'next/link'

export default async function NotFound() {
  const t = await getTranslations('notFound')

  return (
    <main>
      <div className="jm-sec-inner" style={{ paddingTop: 120, paddingBottom: 120, minHeight: '60vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ maxWidth: 560 }}>
          <span style={{ fontFamily: 'var(--font-poppins), sans-serif', fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-4)', display: 'block', marginBottom: 24 }}>
            [ ERROR · {t('code')} ]
          </span>
          <h1 style={{ fontSize: 'clamp(40px, 6vw, 72px)', fontWeight: 700, lineHeight: 1.05, letterSpacing: '-0.02em', color: 'var(--ink)', margin: '0 0 24px' }}>
            {t('heading')}
          </h1>
          <div style={{ width: 48, height: 3, background: 'var(--accent)', marginBottom: 32 }} />
          <p style={{ fontSize: 16, lineHeight: 1.8, color: 'var(--ink-2)', margin: '0 0 48px', maxWidth: 400 }}>
            {t('body')}
          </p>
          <Link
            href="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: 'var(--accent)',
              color: '#fff',
              fontSize: 13,
              fontWeight: 700,
              padding: '14px 24px',
              textDecoration: 'none',
              letterSpacing: '0.04em',
            }}
          >
            {t('cta')} →
          </Link>
        </div>
      </div>
    </main>
  )
}
