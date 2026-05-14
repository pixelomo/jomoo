import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Faucets & Fixtures' }

const models = [
  { slug: 'basin-p32758',    name: 'Basin Faucet P32758',        label: '[ basin P32758 ]'    },
  { slug: 'kitchen-33231',   name: 'Kitchen Faucet 33231',       label: '[ kitchen 33231 ]'   },
  { slug: 'pendant-square',  name: 'Pendant Set — Square Series', label: '[ pendant square ]'  },
  { slug: 'pendant-round',   name: 'Pendant Set — Round Series',  label: '[ pendant round ]'   },
]

export default async function FaucetsPage() {
  const t = await getTranslations('home')

  return (
    <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '96px 80px' }}>
      <h1 style={{ fontSize: '40px', fontWeight: 700, margin: '0 0 12px', letterSpacing: '0.02em' }}>
        {t('faucetsName')}
      </h1>
      <div style={{ height: '2px', background: 'var(--gold)', margin: '20px 0 48px' }} />
      <p style={{ fontSize: '16px', color: 'var(--text-soft)', lineHeight: 1.8, marginBottom: '64px', maxWidth: '600px' }}>
        {t('faucetsDesc')}
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '40px' }}>
        {models.map(m => (
          <Link
            key={m.slug}
            href={`/products/faucets/${m.slug}`}
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
            <h3 style={{ fontSize: '18px', fontWeight: 600, margin: '0 0 10px' }}>{m.name}</h3>
            <span style={{ fontSize: '13px', color: 'var(--link-blue)', fontWeight: 500, letterSpacing: '0.04em' }}>
              {t('learnMore')} →
            </span>
          </Link>
        ))}
      </div>
    </main>
  )
}
