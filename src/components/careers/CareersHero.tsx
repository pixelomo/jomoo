/* eslint-disable @next/next/no-img-element */
'use client'

import { useRef } from 'react'
import { useScrollReveal } from '@/components/company/useScrollReveal'

/**
 * The opening frame. The design composes four photographs into one picture —
 * the showroom, two office scenes and the portrait down the right — so this is
 * a single image rather than a grid, and the title is laid over its darkened
 * left third.
 *
 * A plain <img> rather than next/image, as on the designer page: it is the
 * page's LCP, there is only one size of it, and `fetchPriority="high"` means it
 * is requested with the document rather than after hydration.
 */
export default function CareersHero() {
  const heroRef = useRef<HTMLElement>(null)

  useScrollReveal(heroRef, [
    { selector: '.cr-hero__eyebrow', y: 24 },
    { selector: '.cr-hero__title', y: 36 },
  ])

  return (
    <section className="cr-hero" ref={heroRef} aria-labelledby="cr-hero-title">
      <img
        className="cr-hero__media"
        src="/images/career/hero.webp"
        alt=""
        fetchPriority="high"
        decoding="async"
      />
      <div className="cr-hero__scrim" aria-hidden="true" />

      <div className="cr-hero__inner">
        <p className="cr-hero__eyebrow">Careers at JOMOO</p>
        <h1 className="cr-hero__title" id="cr-hero-title">
          JOMOOで
          <br />
          キャリアを築く
        </h1>
      </div>
    </section>
  )
}
