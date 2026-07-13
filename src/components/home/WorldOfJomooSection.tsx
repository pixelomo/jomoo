'use client'

import { useLayoutEffect, useRef } from 'react'
import Image from 'next/image'

export default function WorldOfJomooSection() {
  const sectionRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    let ctx: { revert: () => void } | null = null

    import('gsap').then(async ({ default: gsap }) => {
      const { ScrollTrigger } = await import('gsap/ScrollTrigger')
      gsap.registerPlugin(ScrollTrigger)

      ctx = gsap.context(() => {
        gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', () => {
          // Subtle reveal animations on image wrappers
          const imgs = sectionRef.current?.querySelectorAll<HTMLElement>('.woj-img')
          if (!imgs) return
          imgs.forEach((img, i) => {
            gsap.from(img, {
              opacity: 0,
              y: 24,
              duration: 0.9,
              delay: i * 0.12,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: sectionRef.current,
                start: 'top 80%',
                toggleActions: 'play none none none',
              },
            })
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
      style={{ background: '#111110', padding: '100px 60px 80px' }}
    >
      {/* Section header */}
      <div style={{ maxWidth: 1320, margin: '0 auto 56px' }}>
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
          THE WORLD OF JOMOO
        </span>
        <h2 style={{
          fontFamily: 'var(--font-poppins, sans-serif)',
          fontWeight: 300,
          fontSize: 'clamp(28px, 3.5vw, 48px)',
          color: '#fff',
          lineHeight: 1.3,
          margin: '0 0 16px',
        }}>
          美しさと快適さの世界を<br />あなたに
        </h2>
        <p style={{
          fontFamily: 'var(--font-poppins, sans-serif)',
          fontWeight: 300,
          fontSize: 13,
          color: 'var(--jomoo-grey)',
          maxWidth: 440,
          lineHeight: 1.9,
          margin: 0,
        }}>
          私たちJOMOOは、水まわり空間の可能性を追求し続けています。
        </p>
      </div>

      {/* Image mosaic — left large + right column of 3 */}
      <div style={{
        maxWidth: 1320,
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: '1.6fr 1fr',
        gridTemplateRows: 'auto',
        gap: 8,
        alignItems: 'stretch',
      }}>
        {/* Left — large feature image */}
        <div
          className="woj-img"
          style={{
            position: 'relative',
            gridRow: '1 / 4',
            minHeight: 560,
            overflow: 'hidden',
          }}
        >
          <Image
            src="/images/lifestyle-bathroom-luxury-collection.jpg"
            alt="Luxury bathroom collection"
            fill
            style={{ objectFit: 'cover' }}
            priority
          />
        </div>

        {/* Right top */}
        <div
          className="woj-img"
          style={{ position: 'relative', height: 260, overflow: 'hidden' }}
        >
          <Image
            src="/images/product-x40c-toilet-lid-screen.jpg"
            alt="X40-C smart toilet lid display"
            fill
            style={{ objectFit: 'cover' }}
          />
        </div>

        {/* Right middle */}
        <div
          className="woj-img"
          style={{ position: 'relative', height: 260, overflow: 'hidden' }}
        >
          <Image
            src="/images/lifestyle-bathroom-marble-wide.jpg"
            alt="Marble bathroom wide view"
            fill
            style={{ objectFit: 'cover' }}
          />
        </div>

        {/* Right bottom */}
        <div
          className="woj-img"
          style={{ position: 'relative', height: 260, overflow: 'hidden' }}
        >
          <Image
            src="/images/lifestyle-shower-dark-dramatic.jpg"
            alt="Dramatic shower scene"
            fill
            style={{ objectFit: 'cover' }}
          />
        </div>
      </div>
    </section>
  )
}
