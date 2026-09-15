/* eslint-disable @next/next/no-img-element */
'use client'

import { useRef } from 'react'
import { useScrollReveal } from '@/components/company/useScrollReveal'

/**
 * The opening frame: the showroom render, shown whole. The picture is 16:9 and
 * the design draws the band at 16:9, so nothing is cropped — the title sits over
 * the shower enclosure on its shadowed left side.
 *
 * A plain <img> rather than next/image, as on the careers and designer pages:
 * it is the page's LCP, there is only one size of it, and `fetchPriority="high"`
 * means it is requested with the document rather than after hydration.
 */
export default function ShowroomHero() {
  const heroRef = useRef<HTMLElement>(null)

  useScrollReveal(heroRef, [
    { selector: '.sh-hero__eyebrow', y: 24 },
    { selector: '.sh-hero__title', y: 36 },
  ])

  return (
    <section className="sh-hero" ref={heroRef} aria-labelledby="sh-hero-title">
      <img
        className="sh-hero__media"
        src="/images/showroom/hero.webp"
        alt=""
        fetchPriority="high"
        decoding="async"
      />
      <div className="sh-hero__scrim" aria-hidden="true" />

      <div className="sh-hero__inner">
        <p className="sh-hero__eyebrow">SHOWROOM</p>
        <h1 className="sh-hero__title" id="sh-hero-title">
          ショールーム
        </h1>
      </div>
    </section>
  )
}
