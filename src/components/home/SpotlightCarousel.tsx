/* eslint-disable @next/next/no-img-element */
'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useFullyInView } from './useFullyInView'

type SlideMedia =
  | { type: 'video'; src: string; background?: string }
  | { type: 'image'; src: string; background?: string }
  | { type: 'loop'; srcs: readonly string[] }

type SpotlightSlide = {
  index: string
  title: string[]
  body: string[]
  media: SlideMedia
  playLabel?: string
  playTheme?: 'light' | 'dark'
}

/**
 * Six renders of the X40, ordered so the unit turns the same way at every step.
 *
 * Their measured lid offsets run -84°, +74°, +141°, +149° and then wrap round to
 * -148°, -140°, so playing them in this order is one continuous rotation that
 * meets itself at the end rather than snapping back. The closed pair leads,
 * which puts the single lid-open beat at the front of each turn.
 *
 * All six were normalised on the ceramic body — a vertical dimension, so it
 * holds still while the camera swings — and stood on a common floor line, so
 * the unit does not change size or hop as the frames cross over.
 */
const X40_TURNTABLE = [
  '/images/x40-3d/frame1.webp',
  '/images/x40-3d/frame2.webp',
  '/images/x40-3d/frame3.webp',
  '/images/x40-3d/frame4.webp',
  '/images/x40-3d/frame5.webp',
  '/images/x40-3d/frame6.webp',
] as const

/**
 * How long each render holds.
 *
 * Deliberately shorter than AUTOPLAY_MS: the carousel moves off this slide
 * every 3s, so a step slow enough to feel stately would only ever show one
 * frame. At 900ms a visitor sees three of the six go by per visit, and the
 * turntable picks up where it left off on the next pass instead of restarting
 * — so the rotation reads as continuous across visits. Hovering holds the
 * carousel, which lets the whole turn play out in one go.
 */
const LOOP_STEP_MS = 900

/**
 * Cross-fades the renders, and does nothing else — the frames share a floor
 * line and a body height, so the unit stays put and only the view of it
 * changes.
 *
 * Runs only while its own slide is the active one and the panel is actually on
 * screen — no point painting a rotation nobody is looking at.
 *
 * Its own observer, rather than the section's useFullyInView: that hook asks
 * for a whole screenful of the section, which is the right question for "should
 * the slides advance" and the wrong one here. This section is 927px tall in a
 * 913px window, so a screenful is only ever showing across about 14px of
 * scroll, and the product would have sat frozen the rest of the time while in
 * plain sight.
 */
function SpotlightLoop({
  srcs,
  alt,
  playing,
}: {
  srcs: readonly string[]
  alt: string
  playing: boolean
}) {
  // A monotonic counter rather than an index that wraps: the frame on show is
  // derived from it, so a re-render can never land on the wrong one.
  const [step, setStep] = useState(0)
  const [onScreen, setOnScreen] = useState(false)
  const hostRef = useRef<HTMLDivElement>(null)
  const active = step % srcs.length

  useEffect(() => {
    const host = hostRef.current
    if (!host) return

    const observer = new IntersectionObserver(
      ([entry]) => setOnScreen(entry.isIntersecting),
      { threshold: 0.25 }
    )
    observer.observe(host)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!playing || !onScreen) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const timer = window.setInterval(() => setStep((s) => s + 1), LOOP_STEP_MS)
    return () => window.clearInterval(timer)
  }, [playing, onScreen])

  return (
    <div className="spotlight__loop" ref={hostRef}>
      {srcs.map((src, index) => (
        <img
          key={src}
          className={`spotlight__loop-img${index === active ? ' is-active' : ''}`}
          src={src}
          alt={index === active ? alt : ''}
          aria-hidden={index === active ? undefined : true}
          draggable={false}
          decoding="async"
        />
      ))}
    </div>
  )
}

const SLIDES: SpotlightSlide[] = [
  {
    index: 'SMART TOILET',
    title: ['やさしい繋がり'],
    body: [
      'JOMOO製品は人と空間をつなぐ、',
      'やさしい存在。静けさと清潔さ、',
      '使うたび自然と広がる安心感。',
      '機能だけではなく、',
      '心地よく穏やかな毎日を支えます。',
    ],
    media: { type: 'loop', srcs: X40_TURNTABLE },
  },
  {
    index: '01',
    title: ['超静音', 'スマートトイレ'],
    body: [
      'バスルームの静寂を妨げない',
      'パワフルかつ圧倒的に静かな洗浄。',
      'タッチ不要で、スマートなレスポンス。',
      'ソフトな水流により、心地良い温度で、',
      'スパのような洗浄体験ができます。',
    ],
    media: { type: 'video', src: '/images/slide2.mov' },
    playLabel: 'VIEW',
    playTheme: 'dark',
  },
  {
    index: '02',
    title: ['クリーンボットアーム泡洗浄'],
    body: [
      'ロボットアームが作動し、',
      '360°さまざまな角度から',
      'きめ細やかな泡を噴射することにより',
      'トイレを清潔に保ちます',
    ],
    media: { type: 'image', src: '/images/feature1.jpg' },
  },
  {
    index: '03',
    title: ['足元センサー', '洗浄'],
    body: [
      '足元センサーによる',
      '便蓋・便座の自動開閉はもちろん、',
      'トイレ使用後の自動洗浄にも',
      '対応しており、快適な暮らしを支えます',
    ],
    media: { type: 'image', src: '/images/slide4.jpeg' },
  },
  {
    index: '04',
    title: ['ノズルUV除菌'],
    body: [
      '除菌率99％の長期的な効果で交差感染を防ぎ、',
      '家族全員が安全・安心に使用できます',
    ],
    media: { type: 'image', src: '/images/slide5.jpeg' },
  },
]

const DRAG_THRESHOLD = 48
const AUTOPLAY_MS = 3000

export default function SpotlightCarousel() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [dragOffset, setDragOffset] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [playingIndex, setPlayingIndex] = useState<number | null>(null)
  /** Set while the reader is hovering or tabbing through the carousel. */
  const [paused, setPaused] = useState(false)

  const sectionRef = useRef<HTMLElement>(null)
  const viewportRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([])
  const dragRef = useRef({ startX: 0, startOffset: 0, moved: false })
  const stepRef = useRef(0)
  const centerOffsetRef = useRef(0)
  const [layoutVersion, setLayoutVersion] = useState(0)

  const slideCount = SLIDES.length

  // Autoplay used to start the moment the component mounted, so the carousel
  // had run to the last slide before anyone scrolled far enough to see it.
  const { inView } = useFullyInView(sectionRef)

  const measureLayout = useCallback(() => {
    const viewport = viewportRef.current
    const track = trackRef.current
    const firstCard = track?.querySelector<HTMLElement>('.spotlight__card')
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

  useEffect(() => {
    videoRefs.current.forEach((video, index) => {
      if (!video) return
      if (index !== activeIndex || playingIndex !== index) {
        video.pause()
      }
    })
  }, [activeIndex, playingIndex])

  // Advances on its own, but never over the top of someone using it: dragging,
  // a playing video, hover and keyboard focus all hold it. Re-armed whenever the
  // slide changes, so a manual move gets a full interval rather than the
  // remainder of the previous one.
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (!inView || isDragging || paused || playingIndex !== null) return

    const timer = window.setInterval(() => {
      setActiveIndex((index) => (index + 1) % slideCount)
      setDragOffset(0)
    }, AUTOPLAY_MS)

    return () => window.clearInterval(timer)
  }, [inView, isDragging, paused, playingIndex, slideCount, activeIndex])

  const goTo = useCallback(
    (index: number) => {
      const next = Math.max(0, Math.min(slideCount - 1, index))
      setActiveIndex(next)
      setPlayingIndex(null)
      setDragOffset(0)
    },
    [slideCount]
  )

  const prev = useCallback(() => goTo(activeIndex - 1), [activeIndex, goTo])
  const next = useCallback(() => goTo(activeIndex + 1), [activeIndex, goTo])

  function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (event.button !== 0) return
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
      if (delta < 0) next()
      else prev()
      return
    }

    setDragOffset(0)
  }

  function toggleVideo(index: number) {
    const video = videoRefs.current[index]
    if (!video) return

    if (playingIndex === index && !video.paused) {
      video.pause()
      setPlayingIndex(null)
      return
    }

    setActiveIndex(index)
    setPlayingIndex(index)
    video.muted = true
    void video.play().catch(() => {})
  }

  function toggleMedia(index: number) {
    const slide = SLIDES[index]
    if (slide.media.type === 'video') {
      toggleVideo(index)
    }
  }

  const step = stepRef.current || 1
  const translateX = centerOffsetRef.current - activeIndex * step + dragOffset
  void layoutVersion

  return (
    <section ref={sectionRef} className="spotlight" data-nav="light" aria-label="Smart toilet features">
      <div className="site-container spotlight__frame">
        <div className="spotlight__stage">
          <button
            type="button"
            className="spotlight__nav spotlight__nav--prev"
            onClick={prev}
            disabled={activeIndex === 0}
            aria-label="Previous slide"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>

          <div
            ref={viewportRef}
            className={`spotlight__viewport${isDragging ? ' is-dragging' : ''}`}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={finishDrag}
            onPointerCancel={finishDrag}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onFocusCapture={() => setPaused(true)}
            onBlurCapture={() => setPaused(false)}
          >
          <div
            ref={trackRef}
            className={`spotlight__track${isDragging ? ' is-dragging' : ''}`}
            style={{ transform: `translate3d(${translateX}px, 0, 0)` }}
          >
            {SLIDES.map((slide, index) => (
              <article
                key={slide.index}
                className={`spotlight__card${index === activeIndex ? ' is-active' : ''}`}
                aria-hidden={index !== activeIndex}
              >
                <div className="spotlight__media">
                  {'background' in slide.media && slide.media.background && (
                    <img
                      className="spotlight__media-bg"
                      src={slide.media.background}
                      alt=""
                    />
                  )}

                  {slide.media.type === 'loop' ? (
                    <SpotlightLoop
                      srcs={slide.media.srcs}
                      alt=""
                      playing={index === activeIndex}
                    />
                  ) : slide.media.type === 'video' ? (
                    <video
                      ref={(el) => {
                        videoRefs.current[index] = el
                      }}
                      className="spotlight__media-el"
                      src={slide.media.src}
                      muted
                      playsInline
                      preload="metadata"
                      loop
                    />
                  ) : (
                    <img
                      className="spotlight__media-el"
                      src={slide.media.src}
                      alt=""
                    />
                  )}

                  {slide.playLabel && slide.media.type === 'video' && (
                    <button
                      type="button"
                      className={[
                        'spotlight__play',
                        slide.playTheme === 'light' && 'spotlight__play--light',
                        slide.playTheme === 'dark' && 'spotlight__play--dark',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                      onPointerDown={(event) => event.stopPropagation()}
                      onClick={() => toggleMedia(index)}
                      aria-label={
                        playingIndex === index ? 'Pause video' : 'Play video'
                      }
                    >
                      <span className="spotlight__play-icon" aria-hidden="true">
                        {playingIndex === index ? (
                          <svg viewBox="0 0 24 24">
                            <path d="M8 6h3v12H8zM13 6h3v12h-3z" />
                          </svg>
                        ) : (
                          <svg viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        )}
                      </span>
                      <span className="spotlight__play-label">{slide.playLabel}</span>
                    </button>
                  )}

                  {slide.playLabel && slide.media.type === 'image' && (
                    <div className="spotlight__play spotlight__play--static">
                      <span className="spotlight__play-icon" aria-hidden="true">
                        <svg viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </span>
                      <span className="spotlight__play-label">{slide.playLabel}</span>
                    </div>
                  )}
                </div>

                <div className="spotlight__content">
                  <p
                    className={`spotlight__index${slide.index === 'SMART TOILET' ? ' spotlight__index--label' : ''}`}
                  >
                    {slide.index}
                  </p>
                  <h3 className="spotlight__title">
                    {slide.title.map((line) => (
                      <span key={line}>{line}</span>
                    ))}
                  </h3>
                  <div className="spotlight__rule" aria-hidden="true" />
                  <div className="spotlight__body">
                    {slide.body.map((line) => (
                      <p key={line}>{line}</p>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
          </div>

          <button
            type="button"
            className="spotlight__nav spotlight__nav--next"
            onClick={next}
            disabled={activeIndex === slideCount - 1}
            aria-label="Next slide"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>

        <div className="spotlight__pagination" role="tablist" aria-label="Carousel slides">
          {SLIDES.map((slide, index) => (
            <button
              key={slide.index}
              type="button"
              role="tab"
              aria-selected={index === activeIndex}
              aria-label={`Go to slide ${index + 1}`}
              className={`spotlight__pagination-line${index === activeIndex ? ' is-active' : ''}`}
              onClick={() => goTo(index)}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
