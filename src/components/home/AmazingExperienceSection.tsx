'use client'

import { useLayoutEffect, useRef } from 'react'
import Image from 'next/image'

const products = [
  {
    src: '/images/product-x40b-toilet-white-bg.jpg',
    alt: 'X40-B Smart Toilet',
    style: { left: '8%', top: '30%', width: 260, height: 260 },
    parallax: { from: 30, to: -20 },
    rotate: -4,
    delay: 0,
  },
  {
    src: '/images/product-faucet-chrome-black-bg.jpg',
    alt: 'Chrome Faucet',
    style: { left: '38%', top: '18%', width: 180, height: 280 },
    parallax: { from: 15, to: -30 },
    rotate: 6,
    delay: 150,
  },
  {
    src: '/images/product-shower-set-chrome-bg.jpg',
    alt: 'Shower Set',
    style: { right: '12%', top: '25%', width: 200, height: 340 },
    parallax: { from: 40, to: -10 },
    rotate: -8,
    delay: 300,
  },
  {
    src: '/images/product-vanity-unit-black-bg.jpg',
    alt: 'Vanity Unit',
    style: { left: '62%', top: '55%', width: 200, height: 200 },
    parallax: { from: 20, to: -40 },
    rotate: 3,
    delay: 450,
  },
]

export default function AmazingExperienceSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const productRefs = useRef<(HTMLDivElement | null)[]>([])

  useLayoutEffect(() => {
    let ctx: { revert: () => void } | null = null

    // IntersectionObserver for fade-in
    const observers: IntersectionObserver[] = []
    productRefs.current.forEach((el, i) => {
      if (!el) return
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              if (el) {
                el.style.opacity = '1'
                el.style.transition = 'opacity 0.7s ease'
              }
            }, products[i].delay)
            obs.disconnect()
          }
        },
        { threshold: 0.1 }
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
        minHeight: '140vh',
        overflow: 'hidden',
      }}
    >
      {/* Background image */}
      <Image
        src="/images/bg-gradient-blue-white.jpg"
        alt=""
        fill
        style={{ objectFit: 'cover', zIndex: 0 }}
        aria-hidden
      />

      {/* Text */}
      <div style={{
        position: 'relative',
        zIndex: 2,
        textAlign: 'center',
        paddingTop: 120,
      }}>
        <span style={{
          display: 'block',
          fontFamily: 'var(--font-cormorant, serif)',
          fontWeight: 300,
          fontSize: 11,
          letterSpacing: '0.4em',
          color: 'var(--jomoo-grey)',
          textTransform: 'uppercase',
          marginBottom: 20,
        }}>
          AMAZING EXPERIENCE
        </span>
        <h2 style={{
          fontFamily: 'var(--font-noto-sans-jp, sans-serif)',
          fontWeight: 300,
          fontSize: 'clamp(32px, 4.5vw, 64px)',
          color: 'var(--jomoo-black)',
          margin: 0,
          lineHeight: 1.3,
        }}>
          「水まわり」に驚きを
        </h2>
      </div>

      {/* Floating product images */}
      {products.map((p, i) => (
        <div
          key={i}
          ref={el => { productRefs.current[i] = el }}
          style={{
            position: 'absolute',
            ...(p.style.left !== undefined ? { left: p.style.left } : {}),
            ...(p.style.right !== undefined ? { right: p.style.right } : {}),
            top: p.style.top,
            width: p.style.width,
            height: p.style.height,
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
              filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.15))',
            }}
          />
        </div>
      ))}
    </section>
  )
}
