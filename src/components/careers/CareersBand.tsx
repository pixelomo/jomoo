/* eslint-disable @next/next/no-img-element */
'use client'

import { useRef } from 'react'
import { useScrollReveal } from '@/components/company/useScrollReveal'

interface Props {
  /** Which side the photograph sits on. The bands alternate down the page. */
  side: 'left' | 'right'
  /**
   * Whether the band carries the soft wash behind it. The design puts it under
   * the first and third bands only; the second and fourth are bare white, so
   * the four read as two pairs rather than one repeating stripe.
   */
  wash?: boolean
  title: string
  body: string
  photo: string
  /** Describes the photograph — these are scene-setting, not illustrative. */
  alt: string
}

/**
 * One of the four bands: a photograph held against the outer edge of the page,
 * and the heading and copy on the other side under a small blue dot.
 *
 * The card is flush to the viewport edge with only its inner corners rounded,
 * which is what the design draws — a rounded rectangle floating in the middle
 * of the band would sit very differently.
 */
export default function CareersBand({ side, wash = false, title, body, photo, alt }: Props) {
  const bandRef = useRef<HTMLElement>(null)

  useScrollReveal(bandRef, [
    { selector: '.cr-band__dot', y: 16 },
    { selector: '.cr-band__title', y: 32 },
    { selector: '.cr-band__body', y: 24 },
    // Arrives from the edge it is anchored to, so the two halves meet.
    { selector: '.cr-band__photo', y: 0, x: side === 'left' ? -40 : 40 },
  ])

  return (
    <section
      className={`cr-band cr-band--${side}${wash ? ' cr-band--wash' : ''}`}
      ref={bandRef}
      aria-labelledby={`cr-band-${title}`}
      data-nav="light"
    >
      <div className="cr-band__inner">
        <div className="cr-band__media">
          <img className="cr-band__photo" src={photo} alt={alt} loading="lazy" decoding="async" />
        </div>

        <div className="cr-band__text">
          <span className="cr-band__dot" aria-hidden="true" />
          <h2 className="cr-band__title" id={`cr-band-${title}`}>
            {title}
          </h2>
          <p className="cr-band__body">{body}</p>
        </div>
      </div>
    </section>
  )
}
