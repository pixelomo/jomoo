/* eslint-disable @next/next/no-img-element */
'use client'

import { useRef, type CSSProperties } from 'react'
import { useScrollReveal } from '@/components/company/useScrollReveal'

/**
 * Poppins Bold advance widths for the characters a romanised name uses, in
 * thousandths of an em. Only the glyphs that actually appear are listed; the
 * fallback covers anything else.
 */
const ADVANCE: Record<string, number> = {
  A: 683, B: 683, C: 700, D: 727, E: 604, F: 585, G: 738, H: 745, I: 300,
  J: 512, K: 675, L: 570, M: 907, N: 764, O: 776, P: 668, Q: 776, R: 675,
  S: 616, T: 601, U: 733, V: 668, W: 986, X: 656, Y: 630, Z: 620, ' ': 260,
}

/** Tracking the stylesheet applies, which shortens the line a little. */
const TRACKING = -0.01

/**
 * How wide the name will set, in em.
 *
 * The stylesheet divides the target width by this, so every name spans the
 * screen whatever its length — which is what the design does: the short name
 * set huge, the long one much smaller, both running off both edges.
 *
 * The widths are a table rather than one average per letter: an average is
 * wrong by up to 15% on a name like MATTHIAS LEHNER, where the I, T, L and E
 * are far narrower than the M — enough to leave it visibly short of the edges
 * while a name of Ms and Os overshoots. Measuring the rendered text instead
 * would mean a layout read and a resize observer for something only ever seen
 * at 5% opacity behind a photograph.
 */
function watermarkEm(text: string): number {
  return [...text].reduce(
    (width, char) => width + (ADVANCE[char] ?? 700) / 1000 + TRACKING,
    0,
  )
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
