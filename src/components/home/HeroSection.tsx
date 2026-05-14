'use client'

import { useState, useEffect } from 'react'

const palettes: [string, string][] = [
  ['#c5bfb8', '#beb8b1'],
  ['#a8a399', '#9c978d'],
  ['#cbc4ba', '#bdb5a8'],
  ['#9ea29d', '#929691'],
]

interface Props {
  title: string
  sub1: string
  sub2: string
}

export default function HeroSection({ title, sub1, sub2 }: Props) {
  const [idx, setIdx] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % palettes.length), 6500)
    return () => clearInterval(t)
  }, [])

  const [a, b] = palettes[idx]
  const bgStyle = {
    background: `linear-gradient(135deg,rgba(0,0,0,0.18) 0%,rgba(0,0,0,0) 55%),repeating-linear-gradient(45deg,${a} 0px,${a} 22px,${b} 22px,${b} 44px)`,
  }

  return (
    <section className="jm-hero">
      {/* animated background */}
      <div
        style={{ position: 'absolute', inset: 0, transition: 'background 1.2s ease', ...bgStyle }}
      />

      {/* hero content */}
      <div className="jm-hero-content">
        <div style={{ maxWidth: '540px', color: '#fff' }}>
          <h1
            className="jm-hero-title"
            style={{
              fontFamily: 'var(--font-noto-serif-jp, serif)',
              fontWeight: 600,
              lineHeight: 1.1,
              letterSpacing: '0.04em',
              margin: '0 0 28px 0',
              textShadow: '0 2px 24px rgba(0,0,0,0.25)',
            }}
          >
            {title}
          </h1>
          <p
            style={{
              fontSize: '16px',
              fontWeight: 400,
              lineHeight: 1.9,
              letterSpacing: '0.04em',
              margin: 0,
              textShadow: '0 1px 12px rgba(0,0,0,0.2)',
            }}
          >
            <span style={{ display: 'block' }}>{sub1}</span>
            <span style={{ display: 'block' }}>{sub2}</span>
          </p>
        </div>
      </div>

      {/* next arrow */}
      <button
        type="button"
        aria-label="Next slide"
        onClick={() => setIdx(i => (i + 1) % palettes.length)}
        style={{
          position: 'absolute',
          right: '20px',
          top: '50%',
          transform: 'translateY(-50%)',
          width: '52px',
          height: '52px',
          borderRadius: '50%',
          border: '1.5px solid rgba(255,255,255,0.9)',
          background: 'rgba(255,255,255,0.06)',
          color: '#fff',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          backdropFilter: 'blur(2px)',
        }}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M9 6l6 6-6 6" />
        </svg>
      </button>

      {/* dots */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          transform: 'translateX(-50%)',
          bottom: '28px',
          display: 'flex',
          gap: '10px',
          zIndex: 2,
        }}
      >
        {palettes.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Slide ${i + 1}`}
            onClick={() => setIdx(i)}
            style={{
              width: '28px',
              height: '2px',
              background: i === idx ? '#fff' : 'rgba(255,255,255,0.4)',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              transition: 'background 0.2s',
            }}
          />
        ))}
      </div>
    </section>
  )
}
