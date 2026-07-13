'use client'

import { useState, useEffect } from 'react'

interface Slide {
  src?: string
  thumb?: string
  alt?: string
  caption?: string
}

interface Props {
  slides: Slide[]
}

const THUMB_W = 72
const THUMB_H = 48
const THUMB_GAP = 6
// how many thumbnails are visible at once
const THUMB_VISIBLE = 5

export default function ImageCarousel({ slides }: Props) {
  const [idx, setIdx] = useState(0)
  const [thumbStart, setThumbStart] = useState(0)
  const total = slides.length || 1
  const normalised = slides.length ? slides : [{}]
  const current = normalised[idx]

  // Keep thumbStart window in sync whenever idx changes
  useEffect(() => {
    setThumbStart(s => {
      if (idx < s) return idx
      if (idx >= s + THUMB_VISIBLE) return idx - THUMB_VISIBLE + 1
      return s
    })
  }, [idx])

  const prev = () => setIdx(i => {
    const next = (i - 1 + total) % total
    // wrapping backwards to last slide: push window to show last THUMB_VISIBLE
    if (next === total - 1) setThumbStart(Math.max(0, total - THUMB_VISIBLE))
    return next
  })

  const next = () => setIdx(i => {
    const next = (i + 1) % total
    // wrapping forward to first slide: reset window to start
    if (next === 0) setThumbStart(0)
    return next
  })

  const goTo = (i: number) => {
    setIdx(i)
    // thumb window adjusts via the useEffect above
  }

  const thumbTranslate = thumbStart * (THUMB_W + THUMB_GAP)
  const stripWidth = total * THUMB_W + (total - 1) * THUMB_GAP

  return (
    <div style={{ width: '100%', userSelect: 'none', overflow: 'hidden' }}>
      {/* Main image — all slides stacked, opacity controls active one */}
      <div style={{ position: 'relative', width: '100%', aspectRatio: '4/3', background: '#f8f8f8', overflow: 'hidden' }}>
        {normalised.map((slide, i) =>
          slide.src ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={i}
              src={slide.src}
              alt={slide.alt ?? ''}
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                opacity: i === idx ? 1 : 0,
                transition: 'opacity 0.2s ease',
                pointerEvents: i === idx ? 'auto' : 'none',
              }}
            />
          ) : null
        )}

        {/* Placeholder — shown only when no images at all */}
        {!current.src && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, color: '#bbb' }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="M21 15l-5-5L5 21" />
            </svg>
            <span style={{ fontFamily: 'var(--font-poppins), sans-serif', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              [ product image · add in Sanity Studio ]
            </span>
          </div>
        )}

        {/* Caption overlay */}
        {current.caption && (
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent,rgba(0,0,0,0.5))', padding: '28px 20px 14px', color: '#fff', fontSize: 13, letterSpacing: '0.02em', pointerEvents: 'none' }}>
            {current.caption}
          </div>
        )}

        {/* Arrows */}
        {total > 1 && (
          <>
            <ArrowBtn direction="left"  onClick={prev} />
            <ArrowBtn direction="right" onClick={next} />
          </>
        )}
      </div>

      {/* Thumbnail strip — sliding window, no scrollbar, no overflow */}
      {total > 1 && (
        <div
          style={{
            marginTop: 10,
            overflow: 'hidden',
            width: '100%',
            height: THUMB_H,
          }}
        >
          <div
            style={{
              display: 'flex',
              gap: THUMB_GAP,
              width: stripWidth,
              transform: `translateX(-${thumbTranslate}px)`,
              transition: 'transform 0.3s ease',
            }}
          >
            {normalised.map((slide, i) => (
              <button
                key={i}
                type="button"
                onClick={() => goTo(i)}
                style={{
                  flexShrink: 0,
                  width: THUMB_W,
                  height: THUMB_H,
                  padding: 0,
                  overflow: 'hidden',
                  border: i === idx ? '2px solid var(--accent)' : '2px solid transparent',
                  background: '#f0f0f0',
                  cursor: 'pointer',
                }}
              >
                {(slide.thumb ?? slide.src) && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={slide.thumb ?? slide.src}
                    alt=""
                    style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#f8f8f8' }}
                  />
                )}
              </button>
            ))}
          </div>
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
      aria-label={direction === 'left' ? 'Previous' : 'Next'}
      style={{
        position: 'absolute',
        top: '50%',
        [direction]: 12,
        transform: 'translateY(-50%)',
        width: 40,
        height: 40,
        borderRadius: '50%',
        border: '1.5px solid rgba(255,255,255,0.8)',
        background: 'rgba(0,0,0,0.22)',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        backdropFilter: 'blur(4px)',
        zIndex: 2,
      }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
        <path d={direction === 'left' ? 'M15 18l-6-6 6-6' : 'M9 18l6-6-6-6'} />
      </svg>
    </button>
  )
}
