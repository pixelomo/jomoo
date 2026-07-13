'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'

const stats = [
  { value: 120,    suffix: '+', label: '展開国・地域数' },
  { value: 300000, suffix: '+', label: '販売拠点数' },
  { value: 16,     suffix: '',  label: 'グローバル研究開発センター' },
  { value: 15,     suffix: '+', label: 'ハイエンドスマートファクトリー' },
  { value: 350,    suffix: '+', label: '国際デザイン賞受賞数' },
  { value: 20000,  suffix: '+', label: '特許取得数' },
]

function StatCell({ stat, index, gridRef }: {
  stat: typeof stats[0]
  index: number
  gridRef: React.RefObject<HTMLDivElement | null>
}) {
  const numRef = useRef<HTMLSpanElement>(null)
  const suffixRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const grid = gridRef.current
    const numEl = numRef.current
    const suffixEl = suffixRef.current
    if (!grid || !numEl) return

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        import('gsap').then(({ default: gsap }) => {
          const obj = { val: 0 }
          gsap.to(obj, {
            val: stat.value,
            duration: 2.0,
            delay: index * 0.08,
            ease: 'power2.out',
            onUpdate: () => {
              if (numEl) {
                numEl.textContent = Math.round(obj.val).toLocaleString('ja-JP')
              }
            },
            onComplete: () => {
              if (suffixEl && stat.suffix) {
                suffixEl.style.opacity = '1'
                suffixEl.style.transform = 'scale(1)'
              }
            },
          })
        })
        obs.disconnect()
      },
      { threshold: 0.3 }
    )
    obs.observe(grid)
    return () => obs.disconnect()
  }, [stat.value, stat.suffix, index, gridRef])

  const col = index % 3

  return (
    <div style={{
      padding: '48px 36px',
      borderRight: col < 2 ? '1px solid rgba(255,255,255,0.12)' : undefined,
      borderBottom: index < 3 ? '1px solid rgba(255,255,255,0.12)' : undefined,
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'baseline',
        gap: 4,
        lineHeight: 1,
        marginBottom: 10,
      }}>
        <span
          ref={numRef}
          style={{
            fontFamily: 'var(--font-poppins, sans-serif)',
            fontWeight: 300,
            fontSize: 'clamp(44px, 5.5vw, 72px)',
            color: '#fff',
            letterSpacing: '-0.01em',
          }}
        >
          0
        </span>
        {stat.suffix && (
          <span
            ref={suffixRef}
            style={{
              fontFamily: 'var(--font-poppins, sans-serif)',
              fontWeight: 300,
              fontSize: 'clamp(28px, 3.5vw, 48px)',
              color: 'var(--jomoo-accent)',
              opacity: 0,
              transform: 'scale(0.8)',
              transition: 'opacity 0.3s ease, transform 0.3s ease',
            }}
          >
            {stat.suffix}
          </span>
        )}
      </div>
      <p style={{
        fontFamily: 'var(--font-poppins, sans-serif)',
        fontWeight: 300,
        fontSize: 12,
        color: 'rgba(255,255,255,0.55)',
        letterSpacing: '0.05em',
        margin: 0,
        lineHeight: 1.6,
      }}>
        {stat.label}
      </p>
    </div>
  )
}

export default function GlobalStatsSection() {
  const gridRef = useRef<HTMLDivElement>(null)

  return (
    <section
      id="about"
      style={{
        background: '#111110',
        padding: '120px 80px 100px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* World map dots — white dots on dark bg at low opacity */}
      <div style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0,
        overflow: 'hidden',
      }}>
        <Image
          src="/images/bg-world-map-dots-dark.jpg"
          alt=""
          fill
          style={{ objectFit: 'cover', opacity: 0.12 }}
          aria-hidden
        />
      </div>

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 1280, margin: '0 auto' }}>
        {/* Headline */}
        <div style={{ textAlign: 'center', marginBottom: 80 }}>
          <span style={{
            display: 'block',
            fontFamily: 'var(--font-poppins, sans-serif)',
            fontWeight: 400,
            fontSize: 11,
            letterSpacing: '0.35em',
            color: '#0c328c',
            textTransform: 'uppercase',
            marginBottom: 16,
          }}>
            GLOBAL PRESENCE
          </span>
          <h2 style={{
            fontFamily: 'var(--font-poppins, sans-serif)',
            fontWeight: 300,
            fontSize: 'clamp(26px, 3.2vw, 44px)',
            color: '#fff',
            margin: '0 0 20px',
          }}>
            世界が認める品質
          </h2>
          <p style={{
            fontFamily: 'var(--font-poppins, sans-serif)',
            fontWeight: 300,
            fontSize: 13,
            color: 'rgba(255,255,255,0.55)',
            maxWidth: 520,
            margin: '0 auto',
            lineHeight: 1.9,
          }}>
            JOMOOは世界120以上の国と地域で展開し、数々の国際的なデザイン賞を受賞しています。
            積み重ねてきた技術と品質が、世界中の暮らしに選ばれています。
          </p>
        </div>

        {/* Stats grid */}
        <div
          ref={gridRef}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            border: '1px solid rgba(255,255,255,0.12)',
          }}
        >
          {stats.map((stat, i) => (
            <StatCell key={i} stat={stat} index={i} gridRef={gridRef} />
          ))}
        </div>
      </div>
    </section>
  )
}
