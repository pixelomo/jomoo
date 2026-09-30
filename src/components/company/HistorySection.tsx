'use client'

import { useRef } from 'react'
import { useCssScrollProgress } from './useCssScrollProgress'
import { useScrollReveal } from './useScrollReveal'

/** The rail's clearance above and below, as a fraction of the viewport.
 *  Mirrors --cp-rail-gap in the stylesheet. */
const RAIL_GAP = 0.1

export interface Era {
  key: string
  from: string
  to: string
  /** Which half of timelinebg.jpg tints the era, if any. */
  tint?: 'top' | 'bottom'
  eyebrow: string
  subtitle: string
  images: { src: string; alt: string; width: number; height: number }[]
  /** Each event keeps the line structure it was written with. */
  entries: { key: string; year: string; lines: string[] }[]
}

interface Props {
  eyebrow: string
  title: string
  eras: Era[]
}

/**
 * JOMOOの歩み — the timeline, one grid per era.
 *
 * Within an era the two columns are grid rows rather than two independent
 * stacks: the era title sits alone on the first row, and the subtitle and the
 * year list share the second, which is what keeps the years starting level with
 * the subtitle without anyone having to guess the height of the title above it.
 *
 * One rail runs the length of all four eras, so the dot reads as progress
 * through the whole timeline rather than through whichever era is in view.
 */
export default function HistorySection({ eyebrow, title, eras }: Props) {
  const sectionRef = useRef<HTMLElement>(null)
  const bodyRef = useRef<HTMLDivElement>(null)

  // The rail is pinned RAIL_GAP below the nav and stops the same distance short
  // of the foot of the screen, so the dot's travel is the distance between the
  // body entering that window and its end reaching the bottom of it. The floor is a guard for a timeline
  // shorter than the rail itself, which would otherwise leave nothing to move
  // through and the dot sitting dead at the top.
  useCssScrollProgress(bodyRef, '--cp-rail', (rect, viewport, navHeight) => {
    const gap = viewport * RAIL_GAP
    const top = navHeight + gap
    // Matches the min() the stylesheet caps the line with, so the dot's travel
    // is measured against the line actually drawn.
    const rail = Math.min(viewport - navHeight - gap * 2, rect.height)
    const travel = Math.max(rect.height - rail, viewport * 0.5)
    return (top - rect.top) / travel
  })

  useScrollReveal(
    sectionRef,
    [
      { selector: '.cp-era__head' },
      { selector: '.cp-era__subtitle' },
      { selector: '.cp-era__frame', x: -32 },
      { selector: '.cp-entry', y: 36 },
    ],
    [{ selector: '.cp-era__image' }],
  )

  return (
    <section
      className="cp-history"
      ref={sectionRef}
      data-nav="light"
      aria-labelledby="cp-history-title"
    >
      <header className="cp-history__head">
        <p className="cp-eyebrow">{eyebrow}</p>
        <h2 className="cp-history__title" id="cp-history-title">
          {title}
        </h2>
      </header>

      <div className="cp-history__body" ref={bodyRef}>
        <div className="cp-history__rail" aria-hidden="true">
          <span className="cp-history__rail-line">
            <span className="cp-history__dot" />
          </span>
        </div>

        <div className="cp-history__eras">
          {eras.map((era) => (
            <article
              className={`cp-era${era.tint ? ` cp-era--tint cp-era--tint-${era.tint}` : ''}`}
              key={era.key}
            >
              <div className="cp-era__head">
                <h3 className="cp-era__years">
                  {era.from}
                  {era.to && <span className="cp-era__years-to">-{era.to}</span>}
                </h3>
                <p className="cp-eyebrow cp-era__eyebrow">{era.eyebrow}</p>
              </div>

              <div className="cp-era__aside">
                <h4 className="cp-era__subtitle">{era.subtitle}</h4>
                {era.images.map((image) => (
                  <figure
                    className="cp-era__frame"
                    key={image.src}
                    style={{ aspectRatio: `${image.width} / ${image.height}` }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      className="cp-era__image"
                      src={image.src}
                      alt={image.alt}
                      width={image.width}
                      height={image.height}
                      loading="lazy"
                    />
                  </figure>
                ))}
              </div>

              <ol className="cp-era__entries">
                {era.entries.map((entry) => (
                  <li key={entry.key} className="cp-entry">
                    <p className="cp-entry__year">{entry.year}</p>
                    <p className="cp-entry__event">
                      {entry.lines.map((line, i) => (
                        <span className="cp-entry__line" key={i}>
                          {line}
                        </span>
                      ))}
                    </p>
                  </li>
                ))}
              </ol>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
