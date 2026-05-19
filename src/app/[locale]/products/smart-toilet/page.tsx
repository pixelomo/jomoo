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
    <main>
      <div className="jm-sec-inner" style={{ paddingTop: 80, paddingBottom: 80 }}>
        <div style={{ marginBottom: 48 }}>
          <h1 style={{ fontSize: 40, fontWeight: 700, margin: '0 0 12px', letterSpacing: '0.02em', color: 'var(--ink)', borderBottom: '3px solid var(--accent)', display: 'inline-block', paddingBottom: 10 }}>
            {t('smartToiletName')}
          </h1>
          <p style={{ fontSize: 16, color: 'var(--ink-2)', lineHeight: 1.8, marginTop: 24, maxWidth: 600 }}>
            {t('smartToiletDesc')}
          </p>
        </div>

        <div className="jm-listing-grid-3">
          {models.map(m => (
            <Link
              key={m.slug}
              href={`/products/smart-toilet/${m.slug}`}
              style={{ display: 'flex', flexDirection: 'column', textDecoration: 'none', border: '1px solid var(--line)', background: 'var(--paper)' }}
            >
              <div style={{ position: 'relative', width: '100%', aspectRatio: '4/3', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', inset: 0, background: 'repeating-linear-gradient(45deg,#dce4f5 0px,#dce4f5 18px,#c8d6f0 18px,#c8d6f0 36px)' }} />
                <span style={{ position: 'absolute', bottom: 10, left: 14, fontFamily: 'ui-monospace,monospace', fontSize: 10, color: 'rgba(255,255,255,0.85)', letterSpacing: '0.1em' }}>
                  {m.label}
                </span>
              </div>
              <div style={{ padding: '20px 20px 24px' }}>
                <h3 style={{ fontSize: 17, fontWeight: 600, margin: '0 0 10px', letterSpacing: '0.02em', color: 'var(--ink)' }}>{m.name}</h3>
                <span style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 600, letterSpacing: '0.04em' }}>
                  {t('learnMore')} →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  )
}
