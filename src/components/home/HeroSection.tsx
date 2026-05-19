'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

export interface HeroSlide {
  badge: string
  title: string
  lead: string
  btn1Label: string
  btn1Href: string
  btn2Label: string
  btn2Href: string
  bg: 'dark' | 'blue' | 'light'
}

const bgStyles: Record<HeroSlide['bg'], React.CSSProperties> = {
  dark: {
    background:
      'repeating-linear-gradient(45deg,rgba(255,255,255,0.04) 0 1px,transparent 1px 16px),linear-gradient(180deg,#2a2f36 0%,#15181d 100%)',
  },
  blue: {
    background:
      'repeating-linear-gradient(45deg,rgba(255,255,255,0.05) 0 1px,transparent 1px 16px),linear-gradient(180deg,#2452c7 0%,#0a2a82 100%)',
  },
  light: {
    background:
      'repeating-linear-gradient(45deg,rgba(0,0,0,0.04) 0 1px,transparent 1px 16px),linear-gradient(180deg,#efece4 0%,#d6d1c5 100%)',
  },
}

interface Props {
  slides: HeroSlide[]
}

export default function HeroSection({ slides }: Props) {
  const [idx, setIdx] = useState(0)

  const go = useCallback((n: number) => {
    setIdx((n + slides.length) % slides.length)
  }, [slides.length])

  useEffect(() => {
    const timer = setInterval(() => go(idx + 1), 7000)
    return () => clearInterval(timer)
  }, [idx, go])

  const slide = slides[idx]

  return (
    <div style={{ background: 'var(--bg-soft)', borderBottom: '1px solid var(--line)' }}>
      <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '24px 40px' }}>
        <div style={{ position: 'relative', height: '580px', overflow: 'hidden', background: '#000' }}>
          {/* Slide backgrounds */}
          {slides.map((s, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                inset: 0,
                opacity: i === idx ? 1 : 0,
                transition: 'opacity 0.7s ease',
                ...bgStyles[s.bg],
              }}
            >
              {/* gradient overlay */}
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(180deg,rgba(0,0,0,0) 30%,rgba(0,0,0,0.55) 100%)',
              }} />
            </div>
          ))}

          {/* Content overlay */}
          <div style={{
            position: 'absolute', left: 40, right: 40, bottom: 60,
            color: '#fff', zIndex: 2,
          }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              fontSize: 12, fontWeight: 700, letterSpacing: '0.08em',
              padding: '5px 10px', background: 'var(--accent)', marginBottom: 20,
            }}>
              {slide.badge}
            </span>
            <h1 style={{
              fontSize: 48, lineHeight: 1.25, fontWeight: 700,
              letterSpacing: '0.01em', margin: '0 0 16px', maxWidth: 680,
            }}>
              {slide.title}
            </h1>
            <p style={{
              fontSize: 14, lineHeight: 1.9, maxWidth: 500,
              opacity: 0.92, margin: '0 0 24px',
            }}>
              {slide.lead}
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <Link href={slide.btn1Href} style={{
                fontSize: 13, fontWeight: 700, padding: '12px 22px',
                display: 'inline-flex', alignItems: 'center', gap: 10,
                background: '#fff', color: 'var(--ink)',
              }}>
                {slide.btn1Label} →
              </Link>
              <Link href={slide.btn2Href} style={{
                fontSize: 13, fontWeight: 700, padding: '12px 22px',
                display: 'inline-flex', alignItems: 'center', gap: 10,
                background: 'transparent', color: '#fff',
                border: '1px solid rgba(255,255,255,0.6)',
              }}>
                {slide.btn2Label}
              </Link>
            </div>
          </div>

          {/* Dots + counter */}
          <div style={{
            position: 'absolute', left: 40, right: 40, bottom: 20,
            zIndex: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            color: '#fff',
          }}>
            <div style={{ display: 'flex', gap: 8 }}>
              {slides.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`Slide ${i + 1}`}
                  onClick={() => { setIdx(i) }}
                  style={{
                    width: 32, height: 3, border: 0, padding: 0, cursor: 'pointer',
                    background: i === idx ? '#fff' : 'rgba(255,255,255,0.35)',
                  }}
                />
              ))}
            </div>
            <span style={{ fontFamily: 'ui-monospace,monospace', fontSize: 11, letterSpacing: '0.08em', opacity: 0.85 }}>
              <b style={{ fontWeight: 700 }}>{String(idx + 1).padStart(2, '0')}</b> / {String(slides.length).padStart(2, '0')}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
