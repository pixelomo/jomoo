import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Washstand' }

const models = [
  { slug: 'ayzm24005-custom', name: 'AYZM24005 Custom',   label: '[ AYZM24005 ]'   },
  { slug: 'new-economic',     name: 'New Economic Set',    label: '[ Economic Set ]' },
]

export default async function WashstandPage() {
  const t = await getTranslations('home')

  return (
    <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '96px 80px' }}>
      <h1 style={{ fontSize: '40px', fontWeight: 700, margin: '0 0 12px', letterSpacing: '0.02em' }}>
        {t('washstandName')}
      </h1>
      <div style={{ height: '2px', background: 'var(--gold)', margin: '20px 0 48px' }} />

      {/* Coming Soon banner */}
      <div
        style={{
          background: '#f6f4ef',
          border: '1px solid var(--hairline)',
          padding: '40px',
          textAlign: 'center',
          marginBottom: '64px',
        }}
      >
        <p style={{ fontSize: '28px', fontWeight: 700, letterSpacing: '0.12em', margin: '0 0 12px' }}>
          {t('comingSoon')}
        </p>
        <p style={{ fontSize: '15px', color: 'var(--text-soft)', margin: 0 }}>{t('washstandDesc')}</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '40px', opacity: 0.4 }}>
        {models.map(m => (
          <div key={m.slug} style={{ display: 'flex', flexDirection: 'column' }}>
            <div
              style={{
                position: 'relative',
                width: '100%',
                aspectRatio: '4/3',
                background: 'var(--img-grey)',
                marginBottom: '20px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'repeating-linear-gradient(45deg,#c5bfb8 0px,#c5bfb8 18px,#bbb4ac 18px,#bbb4ac 36px)',
                }}
              />
              <span style={{ position: 'absolute', bottom: '10px', left: '14px', fontFamily: 'ui-monospace,monospace', fontSize: '10px', color: 'rgba(255,255,255,0.75)', letterSpacing: '0.1em' }}>
                {m.label}
              </span>
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 600, margin: '0 0 10px' }}>{m.name}</h3>
          </div>
        ))}
      </div>
    </main>
  )
}
