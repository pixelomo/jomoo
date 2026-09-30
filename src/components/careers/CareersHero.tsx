/* eslint-disable @next/next/no-img-element */
'use client'

import { Fragment, useRef } from 'react'
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
interface Props {
  image?: string
  eyebrow: string
  /** The title's lines, as the editor broke them. */
  title: string[]
}

export default function CareersHero({ image, eyebrow, title }: Props) {
  const heroRef = useRef<HTMLElement>(null)

  useScrollReveal(heroRef, [
    { selector: '.cr-hero__eyebrow', y: 24 },
    { selector: '.cr-hero__title', y: 36 },
  ])

  return (
    <section className="cr-hero" ref={heroRef} aria-labelledby="cr-hero-title">
      {image && (
        <img className="cr-hero__media" src={image} alt="" fetchPriority="high" decoding="async" />
      )}
      <div className="cr-hero__scrim" aria-hidden="true" />

      <div className="cr-hero__inner">
        <p className="cr-hero__eyebrow">{eyebrow}</p>
        <h1 className="cr-hero__title" id="cr-hero-title">
          {title.map((line, i) => (
            <Fragment key={i}>
              {i > 0 && <br />}
              {line}
            </Fragment>
          ))}
        </h1>
      </div>
    </section>
  )
}
