/* eslint-disable @next/next/no-img-element */
'use client'

import { useRef, type CSSProperties } from 'react'
import { useScrollReveal } from '@/components/company/useScrollReveal'

/**
 * Roughly how wide the name will set, in em, for bold uppercase Poppins.
 *
 * The stylesheet divides the target overflow width by this, so every name
 * bleeds off both edges by the same amount however long it is — which is what
 * the design does: the short name is set huge and the long one much smaller,
 * both running off the page. Measuring the text for real would mean a layout
 * pass and a resize observer for something only ever seen out of focus, so the
 * advance widths are approximated: caps are near enough uniform in this face,
 * and the space is the one character that is obviously not.
 */
function watermarkEm(text: string): number {
  return [...text].reduce((width, char) => width + (char === ' ' ? 0.26 : 0.72), 0)
}

interface Props {
  /** Which way round the band reads. 'left' puts the portrait on the left. */
  side: 'left' | 'right'
  /** Dark bands are the alternating rhythm of the page, not a per-person trait. */
  tone: 'light' | 'dark'
  /** The romanised name, set oversized behind the band. */
  watermark: string
  name: string
  role: string
  photo: string
  body: string
}

/**
 * One designer: portrait on one side, name/role/biography on the other, and
 * the romanised name set behind both at a size that runs off the page.
 *
 * The watermark is deliberately allowed to overflow rather than being fitted
 * to the viewport — the design clips it at both edges, and a size chosen in vw
 * keeps that proportion at every width instead of reflowing into something
 * that reads as a heading.
 *
 * It is aria-hidden: the same name is already announced by the heading beside
 * it, so a screen reader would otherwise hear it twice, once transliterated.
 */
export default function DesignerProfile({ side, tone, watermark, name, role, photo, body }: Props) {
  const sectionRef = useRef<HTMLElement>(null)

  useScrollReveal(sectionRef, [
    { selector: '.dz-profile__name', y: 32 },
    { selector: '.dz-profile__role', y: 28 },
    { selector: '.dz-profile__body', y: 24 },
    // Comes in from the side it sits on, so the two halves meet in the middle.
    { selector: '.dz-profile__photo', y: 0, x: side === 'left' ? -40 : 40 },
  ])

  return (
    <section
      className={`dz-profile dz-profile--${tone} dz-profile--${side}`}
      ref={sectionRef}
      // The nav flips to its dark type over the light bands only.
      data-nav={tone === 'light' ? 'light' : undefined}
      aria-label={name}
    >
      <span
        className="dz-profile__watermark"
        aria-hidden="true"
        style={{ '--dz-wm-em': watermarkEm(watermark) } as CSSProperties}
      >
        {watermark}
      </span>

      <div className="dz-profile__inner">
        <div className="dz-profile__media">
          <img className="dz-profile__photo" src={photo} alt={name} loading="lazy" decoding="async" />
        </div>

        <div className="dz-profile__text">
          <h2 className="dz-profile__name">{name}</h2>
          <p className="dz-profile__role">{role}</p>
          <p className="dz-profile__body">{body}</p>
        </div>
      </div>
    </section>
  )
}
