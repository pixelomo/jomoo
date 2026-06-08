'use client'

import { useLayoutEffect, useRef } from 'react'
import Image from 'next/image'

const images = [
  { src: '/images/product-x40c-toilet-lid-screen.jpg', alt: 'X40-C smart toilet lid display' },
  { src: '/images/lifestyle-bathroom-luxury-collection.jpg', alt: 'Luxury bathroom collection' },
  { src: '/images/lifestyle-bathroom-marble-wide.jpg', alt: 'Marble bathroom wide view' },
  { src: '/images/lifestyle-shower-dark-dramatic.jpg', alt: 'Dramatic shower scene' },
]

export default function WorldOfJomooSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const imageRefs = useRef<(HTMLDivElement | null)[]>([])
  const scrollIndicatorRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    let ctx: { revert: () => void } | null = null

    import('gsap').then(async ({ default: gsap }) => {
      const { ScrollTrigger } = await import('gsap/ScrollTrigger')
      gsap.registerPlugin(ScrollTrigger)

      ctx = gsap.context(() => {
        gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', () => {
          ScrollTrigger.create({
            trigger: sectionRef.current,
            start: 'top top',
            end: 'bottom bottom',
            scrub: true,
            onUpdate: (self) => {
              const p = self.progress
              const fadeWindow = 0.07
              const segments = [
                { start: 0,    end: 0.25 },
                { start: 0.25, end: 0.50 },
                { start: 0.50, end: 0.75 },
                { start: 0.75, end: 1.00 },
              ]

              imageRefs.current.forEach((img, i) => {
                if (!img) return
                const { start, end } = segments[i]
                let opacity = 0
                if (p >= start + fadeWindow && p < end - fadeWindow) {
                  opacity = 1
                } else if (p >= start && p < start + fadeWindow) {
                  opacity = (p - start) / fadeWindow
                } else if (p >= end - fadeWindow && p < end) {
                  opacity = 1 - ((p - (end - fadeWindow)) / fadeWindow)
                }
                gsap.set(img, { opacity })
              })

              // Fade out scroll indicator
              if (scrollIndicatorRef.current) {
                gsap.set(scrollIndicatorRef.current, { opacity: p > 0.05 ? 0 : 0.4 })
              }
            },
          })
        })
      }, sectionRef)
    })

    return () => ctx?.revert()
  }, [])

  return (
    <section
      id="inspiration"
      ref={sectionRef}
      style={{ position: 'relative', height: '400vh', background: '#111110' }}
    >
      {/* Sticky viewport */}
      <div style={{
        position: 'sticky',
        top: 0,
        height: '100vh',
        overflow: 'hidden',
      }}>
        {/* Image layers */}
        {images.map((img, i) => (
          <div
            key={i}
            ref={el => { imageRefs.current[i] = el }}
            style={{
              position: 'absolute',
              inset: 0,
              opacity: i === 0 ? 1 : 0,
            }}
          >
            <Image
              src={img.src}
              alt={img.alt}
              fill
              style={{ objectFit: 'cover' }}
              priority={i === 0}
            />
          </div>
        ))}

        {/* Left vignette */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to right, rgba(10,10,10,0.7) 0%, transparent 60%)',
          width: '50%',
          pointerEvents: 'none',
          zIndex: 2,
        }} />

        {/* Text overlay */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          padding: '0 0 60px 80px',
          zIndex: 3,
        }}>
          <span style={{
            display: 'block',
            fontFamily: 'var(--font-cormorant, serif)',
            fontWeight: 300,
            fontSize: 11,
            letterSpacing: '0.3em',
            color: 'var(--jomoo-accent)',
            textTransform: 'uppercase',
            marginBottom: 16,
          }}>
            JOMOO
          </span>
          <h2 style={{
            fontFamily: 'var(--font-noto-sans-jp, sans-serif)',
            fontWeight: 300,
            fontSize: 'clamp(28px, 4vw, 56px)',
            color: '#fff',
            lineHeight: 1.3,
            margin: '0 0 20px',
          }}>
            美しさと<br />快適さの世界を<br />あなたに
          </h2>
          <p style={{
            fontFamily: 'var(--font-noto-sans-jp, sans-serif)',
            fontWeight: 300,
            fontSize: 14,
            color: 'var(--jomoo-grey)',
            maxWidth: 380,
            lineHeight: 1.8,
            margin: 0,
          }}>
            私たちJOMOOは、水まわり空間の可能性を追求し続けています。
          </p>
        </div>

        {/* Scroll indicator */}
        <div
          ref={scrollIndicatorRef}
          style={{
            position: 'absolute',
            bottom: 32,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 3,
            opacity: 0.4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <div
            className="jm-scroll-indicator-line"
            style={{
              width: 1,
              height: 40,
              background: '#fff',
              transformOrigin: 'top',
            }}
          />
        </div>
      </div>
    </section>
  )
}
