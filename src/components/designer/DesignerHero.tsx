/* eslint-disable @next/next/no-img-element */
'use client'

import { Fragment, useRef } from 'react'
import { useScrollReveal } from '@/components/company/useScrollReveal'

/**
 * The opening frame: the sketch photograph held full-bleed, with the title
 * over the darkened left third.
 *
 * The image is a plain <img> rather than next/image so it can be marked
 * `fetchPriority="high"` and drawn from the first paint — it is the LCP of the
 * page and there is only one size of it.
 */
interface Props {
  image?: string
  eyebrow: string
  /** The title's lines, as the design breaks them. */
  title: string[]
}

export default function DesignerHero({ image, eyebrow, title }: Props) {
  const heroRef = useRef<HTMLElement>(null)

  useScrollReveal(heroRef, [
    { selector: '.dz-hero__eyebrow', y: 24 },
    { selector: '.dz-hero__title', y: 36 },
  ])

  return (
    <section className="dz-hero" ref={heroRef} aria-labelledby="dz-hero-title">
      {image && (
        <img
          className="dz-hero__media"
          src={image}
          alt=""
          fetchPriority="high"
          decoding="async"
        />
      )}
      <div className="dz-hero__scrim" aria-hidden="true" />

      <div className="dz-hero__inner">
        <p className="dz-hero__eyebrow">{eyebrow}</p>
        <h1 className="dz-hero__title" id="dz-hero-title">
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
