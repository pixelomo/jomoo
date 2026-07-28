/* eslint-disable @next/next/no-img-element */
'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

type GlobalSlide = {
  image: string
  title: string
  meta: string
}

type TrackSlide = GlobalSlide & { key: string }

const SLIDES: GlobalSlide[] = [
  {
    image: '/images/global1.jpeg',
    title: '北京国家体育场',
    meta: '中国・北京 | 世界的スポーツ施設',
  },
  {
    image: '/images/global2.jpeg',
    title: '北京大興国際空港',
    meta: '中国・北京 | 国際航空ハブ',
  },
  {
    image: '/images/global3.jpeg',
    title: '都市ランドマーク',
    meta: '世界各地 | ラグジュアリー施設',
  },
  {
    image: '/images/global4.jpeg',
    title: 'グラン・ホテル・デュ・キャップ・フェラ',
    meta: 'フランス・ニース | 五つ星ホテル',
  },
  {
    image: '/images/global5.jpeg',
    title: '紫禁城',
    meta: '中国・北京 | 世界遺産',
  },
]

const DRAG_THRESHOLD = 48
const SLIDE_COUNT = SLIDES.length
const AUTOPLAY_MS = 2000
const FIRST_REAL_INDEX = 2
const LAST_REAL_INDEX = FIRST_REAL_INDEX + SLIDE_COUNT - 1

const TRACK_TRANSITION = 'transform 0.55s cubic-bezier(0.22, 0.61, 0.36, 1)'

function toLogicalIndex(trackIndex: number) {
  if (trackIndex < FIRST_REAL_INDEX) {
    return trackIndex - FIRST_REAL_INDEX + SLIDE_COUNT
  }
  if (trackIndex > LAST_REAL_INDEX) {
    return trackIndex - LAST_REAL_INDEX - 1
  }
  return trackIndex - FIRST_REAL_INDEX
}

function normalizeTrackIndex(trackIndex: number) {
  if (trackIndex < FIRST_REAL_INDEX) {
    return trackIndex + SLIDE_COUNT
  }
  if (trackIndex > LAST_REAL_INDEX) {
    return trackIndex - SLIDE_COUNT
  }
  return trackIndex
}

function isBufferIndex(trackIndex: number) {
  return trackIndex < FIRST_REAL_INDEX || trackIndex > LAST_REAL_INDEX
}

export default function GlobalProjectsSection() {
  const [trackIndex, setTrackIndex] = useState(FIRST_REAL_INDEX)
  const [dragOffset, setDragOffset] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [isSnapping, setIsSnapping] = useState(false)

  const viewportRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const trackIndexRef = useRef(trackIndex)
  const isDraggingRef = useRef(false)
  const isSnappingRef = useRef(false)
  const snapLockRef = useRef(false)
  const autoplayTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const dragRef = useRef({ startX: 0, startOffset: 0, moved: false })
  const stepRef = useRef(0)
  const centerOffsetRef = useRef(0)
  const [layoutVersion, setLayoutVersion] = useState(0)

  trackIndexRef.current = trackIndex
  isDraggingRef.current = isDragging

  const trackSlides = useMemo<TrackSlide[]>(
    () => [
      {
        ...SLIDES[(SLIDE_COUNT - 2 + SLIDE_COUNT) % SLIDE_COUNT],
        key: 'clone-prev-2',
      },
      {
        ...SLIDES[SLIDE_COUNT - 1],
        key: 'clone-prev-1',
      },
      ...SLIDES.map((slide, index) => ({ ...slide, key: `slide-${index}` })),
      {
        ...SLIDES[0],
        key: 'clone-next-1',
      },
      {
        ...SLIDES[1],
        key: 'clone-next-2',
      },
    ],
    []
  )

  const activeLogicalIndex = toLogicalIndex(trackIndex)

  const measureLayout = useCallback(() => {
    const viewport = viewportRef.current
    const track = trackRef.current
    const firstCard = track?.querySelector<HTMLElement>('.global-projects__card')
    if (!viewport || !track || !firstCard) return

    const styles = window.getComputedStyle(track)
    const gap = parseFloat(styles.columnGap || styles.gap || '0') || 0
    const cardWidth = firstCard.offsetWidth
    const viewportWidth = viewport.offsetWidth

    stepRef.current = cardWidth + gap
    centerOffsetRef.current = (viewportWidth - cardWidth) / 2
    setLayoutVersion((version) => version + 1)
  }, [])

  useEffect(() => {
    measureLayout()
    window.addEventListener('resize', measureLayout)
    return () => window.removeEventListener('resize', measureLayout)
  }, [measureLayout])

  const goTo = useCallback((logicalIndex: number) => {
    setTrackIndex(logicalIndex + FIRST_REAL_INDEX)
    setDragOffset(0)
  }, [])

  const prev = useCallback(() => {
    setTrackIndex((index) => index - 1)
    setDragOffset(0)
  }, [])

  const next = useCallback(() => {
    setTrackIndex((index) => index + 1)
    setDragOffset(0)
  }, [])

  const clearAutoplay = useCallback(() => {
    if (autoplayTimeoutRef.current) {
      clearTimeout(autoplayTimeoutRef.current)
      autoplayTimeoutRef.current = null
    }
  }, [])

  const scheduleAutoplay = useCallback(() => {
    clearAutoplay()
    autoplayTimeoutRef.current = setTimeout(() => {
      if (isDraggingRef.current) {
        scheduleAutoplay()
        return
      }

      if (isBufferIndex(trackIndexRef.current)) {
        scheduleAutoplay()
        return
      }

      next()
      scheduleAutoplay()
    }, AUTOPLAY_MS)
  }, [clearAutoplay, next])

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return

    scheduleAutoplay()
    return clearAutoplay
  }, [scheduleAutoplay, clearAutoplay])

  const handleManualNav = useCallback(
    (action: () => void) => {
      action()
      scheduleAutoplay()
    },
    [scheduleAutoplay]
  )

  const finishSnap = useCallback(() => {
    isSnappingRef.current = false
    snapLockRef.current = false
    setIsSnapping(false)
    scheduleAutoplay()
  }, [scheduleAutoplay])

  const snapToRealIndex = useCallback(
    (index: number) => {
      if (snapLockRef.current) return

      const normalized = normalizeTrackIndex(index)
      if (normalized === index) return

      snapLockRef.current = true
      isSnappingRef.current = true
      trackIndexRef.current = normalized
      setIsSnapping(true)
      setTrackIndex(normalized)
      setDragOffset(0)
    },
    []
  )

  useEffect(() => {
    if (!isSnapping) return

    let raf2 = 0
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        finishSnap()
      })
    })

    return () => {
      cancelAnimationFrame(raf1)
      if (raf2) cancelAnimationFrame(raf2)
    }
  }, [isSnapping, trackIndex, finishSnap])

  function handleTrackTransitionEnd(event: React.TransitionEvent<HTMLDivElement>) {
    if (event.target !== trackRef.current || event.propertyName !== 'transform') return
    if (isDraggingRef.current || isSnappingRef.current || snapLockRef.current) return

    const index = trackIndexRef.current
    if (isBufferIndex(index)) {
      snapToRealIndex(index)
    }
  }

  function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (event.button !== 0) return
    clearAutoplay()
    dragRef.current = { startX: event.clientX, startOffset: dragOffset, moved: false }
    setIsDragging(true)
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (!isDragging) return
    const delta = event.clientX - dragRef.current.startX
    if (Math.abs(delta) > 4) dragRef.current.moved = true
    setDragOffset(dragRef.current.startOffset + delta)
  }

  function finishDrag(event: React.PointerEvent<HTMLDivElement>) {
    if (!isDragging) return

    const delta = event.clientX - dragRef.current.startX
    setIsDragging(false)

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }

    if (Math.abs(delta) > DRAG_THRESHOLD) {
      if (delta < 0) handleManualNav(next)
      else handleManualNav(prev)
      return
    }

    setDragOffset(0)
    scheduleAutoplay()
  }

  const step = stepRef.current || 1
  const translateX = centerOffsetRef.current - trackIndex * step + dragOffset
  const trackTransition =
    isDragging || isSnapping || isSnappingRef.current ? 'none' : TRACK_TRANSITION
  void layoutVersion

  return (
    <section className="global-projects" data-nav="light" aria-label="Global projects">
      <div className="global-projects__header">
        <div className="feature__head reveal">
          <div className="feature__eyebrow">GLOBAL PROJECTS</div>
          <h2 className="feature__title">世界が認める品質</h2>
          <div className="feature__rule" aria-hidden="true" />
          <p className="feature__subtitle">
            多岐にわたるプロジェクトに最適なソリューションを提供。五つ星ホテルから国際的な競技会場、
            <br />
            世界的なランドマークまで、その実績は世界中で高く評価されています。
          </p>
        </div>
      </div>

      <div className="global-projects__frame">
        <div className="global-projects__stage">
          <button
            type="button"
            className="global-projects__nav global-projects__nav--prev"
            onClick={() => handleManualNav(prev)}
            aria-label="Previous slide"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>

          <div
            ref={viewportRef}
            className={`global-projects__viewport${isDragging ? ' is-dragging' : ''}`}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={finishDrag}
            onPointerCancel={finishDrag}
          >
            <div
              ref={trackRef}
              className={[
                'global-projects__track',
                isDragging && 'is-dragging',
                isSnapping && 'is-snapping',
              ]
                .filter(Boolean)
                .join(' ')}
              style={{
                transform: `translate3d(${translateX}px, 0, 0)`,
                transition: trackTransition,
              }}
              onTransitionEnd={handleTrackTransitionEnd}
            >
              {trackSlides.map((slide, index) => (
                <article
                  key={slide.key}
                  className={`global-projects__card${index === trackIndex ? ' is-active' : ''}`}
                  aria-hidden={index !== trackIndex}
                >
                  <div className="global-projects__media">
                    <img
                      className="global-projects__image"
                      src={slide.image}
                      alt={slide.title}
                      draggable={false}
                    />
                    <div className="global-projects__caption">
                      <h3 className="global-projects__caption-title">{slide.title}</h3>
                      <p className="global-projects__caption-meta">{slide.meta}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <button
            type="button"
            className="global-projects__nav global-projects__nav--next"
            onClick={() => handleManualNav(next)}
            aria-label="Next slide"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>

        <div className="spotlight__pagination" role="tablist" aria-label="Global project slides">
          {SLIDES.map((slide, index) => (
            <button
              key={slide.image}
              type="button"
              role="tab"
              aria-selected={index === activeLogicalIndex}
              aria-label={`Go to slide ${index + 1}`}
              className={`spotlight__pagination-line${index === activeLogicalIndex ? ' is-active' : ''}`}
              onClick={() => handleManualNav(() => goTo(index))}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
