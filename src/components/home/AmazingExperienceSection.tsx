'use client'

import { useLayoutEffect, useRef } from 'react'
import Image from 'next/image'

// Positions corrected per design:
// toilet → center (original position is OK)
// vanity → top left, offset right a little
// faucet → top right, offset left a little
// shower → bottom right
const products = [
  {
    src: '/images/product-x40b-toilet.png',
    alt: 'X40-B Smart Toilet',
    pos: { left: '32%', top: '12%' },
    size: { width: 300, height: 400 },
    parallax: { from: 20, to: -15 },
    rotate: 0,
    delay: 0,
  },
  {
    src: '/images/product-vanity-unit.png',
    alt: 'Vanity Unit',
    pos: { left: '6%', top: '8%' },
    size: { width: 200, height: 260 },
    parallax: { from: 30, to: -10 },
    rotate: -3,
    delay: 100,
  },
  {
    src: '/images/product-faucet-chrome.png',
    alt: 'Chrome Faucet',
    pos: { right: '14%', top: '6%' },
    size: { width: 120, height: 260 },
    parallax: { from: 15, to: -25 },
    rotate: 4,
    delay: 200,
  },
  {
    src: '/images/product-shower-set-chrome.png',
    alt: 'Shower Set',
    pos: { right: '6%', top: '52%' },
    size: { width: 160, height: 300 },
    parallax: { from: 40, to: -5 },
    rotate: -5,
    delay: 300,
  },
]

export default function AmazingExperienceSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const productRefs = useRef<(HTMLDivElement | null)[]>([])

  useLayoutEffect(() => {
    let ctx: { revert: () => void } | null = null

    const observers: IntersectionObserver[] = []
    productRefs.current.forEach((el, i) => {
      if (!el) return
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) return
          setTimeout(() => {
            if (el) {
              el.style.opacity = '1'
              el.style.transition = 'opacity 0.7s ease'
            }
          }, products[i].delay)
          obs.disconnect()
        },
        { threshold: 0.05 }
      )
      obs.observe(el)
      observers.push(obs)
    })

    import('gsap').then(async ({ default: gsap }) => {
      const { ScrollTrigger } = await import('gsap/ScrollTrigger')
      gsap.registerPlugin(ScrollTrigger)

      ctx = gsap.context(() => {
        gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', () => {
          productRefs.current.forEach((el, i) => {
            if (!el) return
            gsap.fromTo(
              el,
              { yPercent: products[i].parallax.from },
              {
                yPercent: products[i].parallax.to,
                ease: 'none',
                scrollTrigger: {
                  trigger: sectionRef.current,
                  start: 'top bottom',
                  end: 'bottom top',
                  scrub: 1.5,
                },
              }
            )
          })
        })
      }, sectionRef)
    })

    return () => {
      observers.forEach(o => o.disconnect())
      ctx?.revert()
    }
  }, [])

  return (
    <section
      id="products"
      ref={sectionRef}
      style={{
        position: 'relative',
        minHeight: '130vh',
        overflow: 'hidden',
      }}
    >
      {/* Background */}
      <Image
        src="/images/bg-gradient-blue-white.jpg"
        alt=""
        fill
        style={{ objectFit: 'cover', zIndex: 0 }}
        aria-hidden
      />

      {/* Text block */}
      <div style={{
        position: 'relative',
        zIndex: 2,
        textAlign: 'center',
        paddingTop: 120,
        paddingBottom: 32,
      }}>
        <span style={{
          display: 'block',
          fontFamily: 'var(--font-noto-sans-jp, sans-serif)',
          fontWeight: 400,
          fontSize: 11,
          letterSpacing: '0.35em',
          color: '#0c328c',
          textTransform: 'uppercase',
          marginBottom: 16,
        }}>
          AMAZING EXPERIENCE
        </span>
        <h2 style={{
          fontFamily: 'var(--font-noto-sans-jp, sans-serif)',
          fontWeight: 300,
          fontSize: 'clamp(28px, 3.8vw, 52px)',
          color: 'var(--jomoo-black)',
          margin: '0 0 16px',
          lineHeight: 1.3,
        }}>
          「水まわり」に驚きを
        </h2>
        <p style={{
          fontFamily: 'var(--font-noto-sans-jp, sans-serif)',
          fontWeight: 300,
          fontSize: 13,
          color: '#3A3A3A',
          maxWidth: 400,
          margin: '0 auto',
          lineHeight: 1.9,
        }}>
          革新的なデザインと最先端技術が融合した、JOMOOのプレミアムバスルームコレクション。
          日常を、特別な体験へ。
        </p>
      </div>

      {/* Floating transparent product images */}
      {products.map((p, i) => (
        <div
          key={i}
          ref={el => { productRefs.current[i] = el }}
          style={{
            position: 'absolute',
            ...p.pos,
            width: p.size.width,
            height: p.size.height,
            rotate: `${p.rotate}deg`,
            pointerEvents: 'none',
            willChange: 'transform',
            opacity: 0,
            zIndex: 2,
          }}
        >
          <Image
            src={p.src}
            alt={p.alt}
            fill
            style={{
              objectFit: 'contain',
              filter: 'drop-shadow(0 24px 48px rgba(0,0,0,0.12))',
            }}
          />
        </div>
      ))}
    </section>
  )
}
