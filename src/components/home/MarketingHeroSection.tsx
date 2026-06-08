'use client'

import { useLayoutEffect, useRef } from 'react'

export default function MarketingHeroSection() {
  const heroRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  useLayoutEffect(() => {
    let ctx: { revert: () => void } | null = null

    import('gsap').then(async ({ default: gsap }) => {
      const { ScrollTrigger } = await import('gsap/ScrollTrigger')
      gsap.registerPlugin(ScrollTrigger)

      ctx = gsap.context(() => {
        gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', () => {
          ScrollTrigger.create({
            trigger: heroRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: true,
            onUpdate: (self) => {
              const video = videoRef.current
              if (video && video.readyState >= 2) {
                video.currentTime = self.progress * video.duration
              }
            },
          })
        })
      }, heroRef)
    })

    return () => ctx?.revert()
  }, [])

  return (
    <div
      id="jm-hero"
      ref={heroRef}
      style={{ position: 'relative', width: '100%', height: '100vh', background: '#0A0A0A', overflow: 'hidden' }}
    >
      <video
        ref={videoRef}
        muted
        playsInline
        preload="auto"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          opacity: 0.85,
        }}
      >
        <source src="/videos/hero.webm" type="video/webm" />
        <source src="/videos/hero.mp4" type="video/mp4" />
      </video>

      {/* Headline */}
      <div style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: '18%',
        textAlign: 'center',
        animation: 'jm-hero-fade-in 1.2s ease 0.5s both',
        zIndex: 2,
      }}>
        <p style={{
          fontFamily: 'var(--font-noto-sans-jp, sans-serif)',
          fontWeight: 300,
          fontSize: 'clamp(24px, 3.5vw, 52px)',
          color: '#fff',
          letterSpacing: '0.05em',
          textShadow: '0 2px 40px rgba(0,0,0,0.4)',
          margin: 0,
        }}>
          美しい水まわりが、暮らしを変える。
        </p>
      </div>

      {/* Bottom gradient bleed into next dark section */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 200,
        background: 'linear-gradient(to bottom, transparent, #0A0A0A)',
        zIndex: 2,
        pointerEvents: 'none',
      }} />
    </div>
  )
}
