'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'

function ProductCard({
  imageSrc,
  imageAlt,
  imageContain,
  label,
  model,
  description,
  delay,
}: {
  imageSrc: string
  imageAlt: string
  imageContain?: boolean
  label: string
  model: string
  description: string
  delay: number
}) {
  const cardRef = useRef<HTMLDivElement>(null)
  const imgWrapRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const card = cardRef.current
    const imgWrap = imgWrapRef.current
    const text = textRef.current
    if (!card || !imgWrap || !text) return

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        imgWrap.style.transition = 'transform 0.9s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.9s ease'
        imgWrap.style.transform = 'scale(1)'
        imgWrap.style.opacity = '1'
        setTimeout(() => {
          text.style.transition = 'transform 0.7s ease, opacity 0.7s ease'
          text.style.transform = 'translateY(0)'
          text.style.opacity = '1'
        }, 200 + delay)
        obs.disconnect()
      },
      { threshold: 0.2 }
    )
    obs.observe(card)
    return () => obs.disconnect()
  }, [delay])

  return (
    <div ref={cardRef} style={{ width: 'calc(50% - 24px)' }}>
      <div
        ref={imgWrapRef}
        style={{
          width: '100%',
          aspectRatio: '4/5',
          overflow: 'hidden',
          borderRadius: 4,
          background: imageContain ? '#0A0A0A' : undefined,
          transform: 'scale(1.06)',
          opacity: 0,
          willChange: 'transform, opacity',
        }}
      >
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
          <Image
            src={imageSrc}
            alt={imageAlt}
            fill
            style={{
              objectFit: imageContain ? 'contain' : 'cover',
              padding: imageContain ? 40 : 0,
            }}
          />
        </div>
      </div>
      <div
        ref={textRef}
        style={{
          marginTop: 24,
          transform: 'translateY(20px)',
          opacity: 0,
        }}
      >
        <span style={{
          display: 'block',
          fontFamily: 'var(--font-cormorant, serif)',
          fontWeight: 300,
          fontSize: 10,
          letterSpacing: '0.3em',
          color: 'var(--jomoo-grey)',
          textTransform: 'uppercase',
          marginBottom: 16,
        }}>
          {label}
        </span>
        <h3 style={{
          fontFamily: 'var(--font-noto-sans-jp, sans-serif)',
          fontWeight: 300,
          fontSize: 28,
          color: 'var(--jomoo-black)',
          margin: '0 0 12px',
        }}>
          {model}
        </h3>
        <p style={{
          fontFamily: 'var(--font-noto-sans-jp, sans-serif)',
          fontWeight: 300,
          fontSize: 14,
          color: 'var(--jomoo-grey)',
          lineHeight: 1.8,
          margin: '0 0 20px',
        }}>
          {description}
        </p>
        <a href="#" style={{
          fontFamily: 'var(--font-noto-sans-jp, sans-serif)',
          fontSize: 12,
          letterSpacing: '0.2em',
          color: 'var(--jomoo-black)',
          borderBottom: '1px solid var(--jomoo-black)',
          paddingBottom: 2,
        }}>
          View More →
        </a>
      </div>
    </div>
  )
}

export default function ProductCardsSection() {
  return (
    <section style={{
      background: 'var(--jomoo-warm-white)',
      padding: '120px 80px',
    }}>
      <div style={{
        display: 'flex',
        gap: 48,
        maxWidth: 1280,
        margin: '0 auto',
        flexWrap: 'wrap',
      }}>
        <ProductCard
          imageSrc="/images/product-x40b-toilet-white-bg.jpg"
          imageAlt="JOMOO X40-B smart toilet"
          imageContain
          label="SMART TOILET"
          model="X40-B"
          description="センサーに反応して、自動で蓋が開閉したり、洗浄します。"
          delay={0}
        />
        <ProductCard
          imageSrc="/images/lifestyle-toilet-ocean-dramatic.jpg"
          imageAlt="JOMOO X40-C ocean view"
          label="SMART TOILET"
          model="X40-C"
          description="スマートトイレの説明スマートトイレの説明スマートトイレの説明"
          delay={150}
        />
      </div>
    </section>
  )
}
