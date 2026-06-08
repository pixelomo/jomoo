'use client'

import { useLayoutEffect, useRef } from 'react'
import Image from 'next/image'

export default function SmartToiletCinematicSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    let ctx: { revert: () => void } | null = null

    import('gsap').then(async ({ default: gsap }) => {
      const { ScrollTrigger } = await import('gsap/ScrollTrigger')
      gsap.registerPlugin(ScrollTrigger)

      ctx = gsap.context(() => {
        gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', () => {
          gsap.to(imageRef.current, {
            yPercent: -10,
            ease: 'none',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top bottom',
              end: 'bottom top',
              scrub: true,
            },
          })
        })
      }, sectionRef)
    })

    return () => ctx?.revert()
  }, [])

  return (
    <section ref={sectionRef} style={{
      position: 'relative',
      height: '70vh',
      overflow: 'hidden',
      borderTop: '1px solid rgba(255,255,255,0.08)',
      borderBottom: '1px solid rgba(255,255,255,0.08)',
    }}>
      <div ref={imageRef} style={{
        position: 'absolute',
        inset: 0,
        height: '120%',
        top: '-10%',
        willChange: 'transform',
      }}>
        <Image
          src="/images/lifestyle-toilet-dark-city-view.jpg"
          alt="Smart toilet with city view at night"
          fill
          style={{ objectFit: 'cover' }}
        />
      </div>
    </section>
  )
}
