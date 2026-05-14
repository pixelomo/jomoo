'use client'

import { useState } from 'react'

interface Slide {
  src?: string
  alt?: string
  caption?: string
}

interface Props {
  slides: Slide[]
}

const placeholder = (i: number) => ({
  bg: [
    ['#c5bfb8', '#beb8b1'],
    ['#b8b3aa', '#aea89e'],
    ['#cbc4ba', '#bdb5a8'],
    ['#9ea29d', '#929691'],
  ][i % 4],
})

export default function ImageCarousel({ slides }: Props) {
  const [idx, setIdx] = useState(0)
  const total = slides.length || 1
  const normalised = slides.length ? slides : [{}]

  const prev = () => setIdx(i => (i - 1 + total) % total)
  const next = () => setIdx(i => (i + 1) % total)

  const current = normalised[idx]
  const { bg } = placeholder(idx)

  return (
    <div style={{ position: 'relative', width: '100%', userSelect: 'none' }}>
      {/* Main image */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '16/9',
          background: current.src ? '#000' : `repeating-linear-gradient(45deg,${bg[0]} 0px,${bg[0]} 22px,${bg[1]} 22px,${bg[1]} 44px)`,
          overflow: 'hidden',
        }}
      >
        {current.src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={current.src}
            alt={current.alt ?? ''}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
            }}
          >
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="M21 15l-5-5L5 21" />
            </svg>
            <span style={{ fontFamily: 'ui-monospace,monospace', fontSize: '11px', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              [ product image {idx + 1} · 2400×1350 ]
            </span>
          </div>
        )}

        {/* Caption */}
        {current.caption && (
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              background: 'linear-gradient(transparent,rgba(0,0,0,0.55))',
              padding: '32px 24px 16px',
              color: '#fff',
              fontSize: '13px',
              letterSpacing: '0.02em',
            }}
          >
            {current.caption}
          </div>
        )}

        {/* Prev / Next arrows */}
        {total > 1 && (
          <>
            <ArrowBtn direction="left" onClick={prev} />
            <ArrowBtn direction="right" onClick={next} />
          </>
        )}
      </div>

      {/* Thumbnail strip */}
      {total > 1 && (
        <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
          {normalised.map((slide, i) => {
            const { bg: tbg } = placeholder(i)
            return (
              <button
                key={i}
                type="button"
                onClick={() => setIdx(i)}
                style={{
                  flex: '0 0 80px',
                  height: '52px',
                  background: slide.src
                    ? '#000'
                    : `repeating-linear-gradient(45deg,${tbg[0]} 0px,${tbg[0]} 10px,${tbg[1]} 10px,${tbg[1]} 20px)`,
                  border: i === idx ? '2px solid var(--gold)' : '2px solid transparent',
                  cursor: 'pointer',
                  padding: 0,
                  overflow: 'hidden',
                  position: 'relative',
                }}
              >
                {slide.src && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={slide.src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                )}
              </button>
            )
          })}
        </div>
      )}

      {/* Dot indicators */}
      {total > 1 && (
        <div style={{ display: 'flex', gap: '8px', marginTop: '16px', justifyContent: 'center' }}>
          {normalised.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIdx(i)}
              style={{
                width: i === idx ? '28px' : '8px',
                height: '2px',
                background: i === idx ? 'var(--gold)' : '#ccc',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function ArrowBtn({ direction, onClick }: { direction: 'left' | 'right'; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={direction === 'left' ? 'Previous image' : 'Next image'}
      style={{
        position: 'absolute',
        top: '50%',
        [direction]: '16px',
        transform: 'translateY(-50%)',
        width: '44px',
        height: '44px',
        borderRadius: '50%',
        border: '1.5px solid rgba(255,255,255,0.7)',
        background: 'rgba(0,0,0,0.25)',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        backdropFilter: 'blur(4px)',
        zIndex: 2,
      }}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d={direction === 'left' ? 'M15 18l-6-6 6-6' : 'M9 18l6-6-6-6'} />
      </svg>
    </button>
  )
}
