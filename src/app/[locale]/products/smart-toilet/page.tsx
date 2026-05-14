import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Smart Toilet' }

const models = [
  { slug: 'xp40-basic',  name: 'XP40 Basic Set',         label: '[ XP40 Basic ]'  },
  { slug: 'xp40-pro',    name: 'XP40 Pro Upgrade Set',   label: '[ XP40 Pro ]'    },
  { slug: 'neorest-nx',  name: 'NeoRest NX / Washlet',   label: '[ NeoRest NX ]'  },
]

export default async function SmartToiletPage() {
  const t = await getTranslations('home')

  return (
    <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '96px 80px' }}>
      <h1 style={{ fontSize: '40px', fontWeight: 700, margin: '0 0 12px', letterSpacing: '0.02em' }}>
        {t('smartToiletName')}
      </h1>
      <div style={{ height: '2px', background: 'var(--gold)', margin: '20px 0 48px' }} />
      <p style={{ fontSize: '16px', color: 'var(--text-soft)', lineHeight: 1.8, marginBottom: '64px', maxWidth: '600px' }}>
        {t('smartToiletDesc')}
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '40px' }}>
        {models.map(m => (
          <Link
            key={m.slug}
            href={`/products/smart-toilet/${m.slug}`}
            style={{ display: 'flex', flexDirection: 'column', cursor: 'pointer' }}
          >
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
            <h3 style={{ fontSize: '18px', fontWeight: 600, margin: '0 0 10px', letterSpacing: '0.02em' }}>{m.name}</h3>
            <span style={{ fontSize: '13px', color: 'var(--link-blue)', fontWeight: 500, letterSpacing: '0.04em' }}>
              {t('learnMore')} →
            </span>
          </Link>
        ))}
      </div>
    </main>
  )
}
