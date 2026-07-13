/* eslint-disable @next/next/no-img-element */
'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

type SlideMedia =
  | { type: 'video'; src: string; background?: string }
  | { type: 'image'; src: string; background?: string }

type SpotlightSlide = {
  index: string
  title: string[]
  body: string[]
  media: SlideMedia
  playLabel?: string
  playTheme?: 'light' | 'dark'
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
    media: {
      type: 'video',
      src: '/images/x40.mov',
      background: '/images/blue-gradient.png',
    },
    playLabel: '3D VIEW',
    playTheme: 'light',
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
    title: ['360度旋回', '泡クッション'],
    body: [
      'ロボットアームが作動し、',
      '360°さまざまな角度から',
      'きめ細やかな泡を噴射することにより',
      'トイレを清潔に保ちます',
    ],
    media: { type: 'image', src: '/images/slide3.jpeg' },
  },
  {
    index: '03',
    title: ['フットセンサー', '洗浄'],
    body: [
      'フットセンサーによる',
      '便蓋・便座の自動開閉はもちろん、',
      'トイレ使用後の自動洗浄にも',
      '対応しており、快適な暮らしを支えます',
    ],
    media: { type: 'image', src: '/images/slide4.jpeg' },
  },
  {
    index: '04',
    title: ['ノズル', '自動垢除去'],
    body: [
      '革新的なノズル洗浄ニードルを',
      '採用しており使用前後に',
      '自動でスケールを除去。',
      '汚れずに詰まりや水流の乱れを防ぎ、',
      '快適な洗浄体験を実現',
    ],
    media: { type: 'image', src: '/images/slide5.jpeg' },
  },
]

const DRAG_THRESHOLD = 48

export default function SpotlightCarousel() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [dragOffset, setDragOffset] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [playingIndex, setPlayingIndex] = useState<number | null>(null)

  const viewportRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([])
  const dragRef = useRef({ startX: 0, startOffset: 0, moved: false })
  const stepRef = useRef(0)
  const centerOffsetRef = useRef(0)
  const [layoutVersion, setLayoutVersion] = useState(0)

  const slideCount = SLIDES.length

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

  const step = stepRef.current || 1
  const translateX = centerOffsetRef.current - activeIndex * step + dragOffset
  void layoutVersion

  return (
    <section className="spotlight" data-nav="light" aria-label="Smart toilet features">
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
                  {slide.media.background && (
                    <img
                      className="spotlight__media-bg"
                      src={slide.media.background}
                      alt=""
                    />
                  )}

                  {slide.media.type === 'video' ? (
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
                      onClick={() => toggleVideo(index)}
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
