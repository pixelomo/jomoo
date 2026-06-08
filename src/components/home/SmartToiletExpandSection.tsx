'use client'

import { useLayoutEffect, useRef } from 'react'
import Image from 'next/image'

export default function SmartToiletExpandSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const imageWrapperRef = useRef<HTMLDivElement>(null)
  const labelRef = useRef<HTMLParagraphElement>(null)

  useLayoutEffect(() => {
    let ctx: { revert: () => void } | null = null

    import('gsap').then(async ({ default: gsap }) => {
      const { ScrollTrigger } = await import('gsap/ScrollTrigger')
      gsap.registerPlugin(ScrollTrigger)

      ctx = gsap.context(() => {
        gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', () => {
          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top top',
              end: 'bottom bottom',
              scrub: 1,
              pin: containerRef.current,
              pinSpacing: false,
            },
          })

          tl.fromTo(
            imageWrapperRef.current,
            { width: '960px', borderRadius: '12px' },
            { width: '100vw', borderRadius: '0px', ease: 'none' }
          )

          tl.to(
            labelRef.current,
            { opacity: 0, ease: 'none' },
            0
          )
        })
      }, sectionRef)
    })

    return () => ctx?.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      style={{
        height: '200vh',
        background: 'var(--jomoo-warm-white)',
      }}
    >
      <div
        ref={containerRef}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          width: '100%',
        }}
      >
        <p
          ref={labelRef}
          style={{
            fontFamily: 'var(--font-cormorant, serif)',
            fontWeight: 300,
            fontSize: 11,
            letterSpacing: '0.35em',
            color: 'var(--jomoo-grey)',
            textTransform: 'uppercase',
            marginBottom: 24,
            textAlign: 'center',
          }}
        >
          SMART TOILET
        </p>

        <div
          ref={imageWrapperRef}
          style={{
            width: '960px',
            maxWidth: '100vw',
            borderRadius: 12,
            overflow: 'hidden',
          }}
        >
          <div style={{ position: 'relative', width: '100%', height: 560 }}>
            <Image
              src="/images/lifestyle-toilet-luxury-warmlit.jpg"
              alt="Luxury warmly lit smart toilet bathroom"
              fill
              style={{ objectFit: 'cover' }}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
