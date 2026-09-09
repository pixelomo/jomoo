/* eslint-disable @next/next/no-img-element */
'use client'

import { useRef } from 'react'
import { useScrollReveal } from '@/components/company/useScrollReveal'

/**
 * The opening frame: the sketch photograph held full-bleed, with the title
 * over the darkened left third.
 *
 * The image is a plain <img> rather than next/image so it can be marked
 * `fetchPriority="high"` and drawn from the first paint — it is the LCP of the
 * page and there is only one size of it.
 */
export default function DesignerHero() {
  const heroRef = useRef<HTMLElement>(null)

  useScrollReveal(heroRef, [
    { selector: '.dz-hero__eyebrow', y: 24 },
    { selector: '.dz-hero__title', y: 36 },
  ])

  return (
    <section className="dz-hero" ref={heroRef} aria-labelledby="dz-hero-title">
      <img
        className="dz-hero__media"
        src="/images/designer/herosketch.webp"
        alt=""
        fetchPriority="high"
        decoding="async"
      />
      <div className="dz-hero__scrim" aria-hidden="true" />

      <div className="dz-hero__inner">
        <p className="dz-hero__eyebrow">Designing the future</p>
        <h1 className="dz-hero__title" id="dz-hero-title">
          世界をリードする
          <br />
          デザインとの共創
        </h1>
      </div>
    </section>
  )
}
