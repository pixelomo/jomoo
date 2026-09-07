'use client'

import { useRef } from 'react'
import { useCssScrollProgress } from './useCssScrollProgress'

/** The rail's sticky window, as a fraction of the viewport. Mirrors the CSS. */
const RAIL_HEIGHT = 0.9
const RAIL_INSET = 0.05

const FOUNDING_YEARS = [
  { year: '1990', event: 'JOMOO創業' },
  { year: '1991', event: 'シャワースプレー用の除じん（ホコリ除去）システムを開発' },
  { year: '1993', event: '中国発のセラミックカートリッジ水栓を発売' },
  { year: '1999', event: 'センサー水栓を開発' },
] as const

/**
 * JOMOOの歩み — the first era of the timeline.
 *
 * The two columns are grid rows rather than two independent stacks: the era
 * title sits alone on the first row, and 創業 and the year list share the
 * second, which is what keeps the right column starting level with 創業 
 * without anyone having to guess the height of the title above it.
 */
export default function HistorySection() {
  const bodyRef = useRef<HTMLDivElement>(null)

  // The rail is pinned RAIL_INSET below the nav and stands RAIL_HEIGHT tall, so
  // the dot's travel is the distance between the body entering that window and
  // its end reaching the bottom of it.
  //
  // With every era in place the block is several screens tall and that is the
  // whole story. While there is only the one it is shorter than the rail
  // itself, which leaves the subtraction negative and the dot sitting dead at
  // the top — hence the floor, so it still reads as a progress marker until the
  // rest of the timeline lands.
  useCssScrollProgress(bodyRef, '--cp-rail', (rect, viewport, navHeight) => {
    const top = navHeight + viewport * RAIL_INSET
    // Matches the min() the stylesheet caps the line with, so the dot's travel
    // is measured against the line actually drawn.
    const rail = Math.min(viewport * RAIL_HEIGHT, rect.height)
    const travel = Math.max(rect.height - rail, viewport * 0.5)
    return (top - rect.top) / travel
  })

  return (
    <section className="cp-history" data-nav="light" aria-labelledby="cp-history-title">
      <header className="cp-history__head">
        <p className="cp-eyebrow">OUR HISTORY</p>
        <h2 className="cp-history__title" id="cp-history-title">
          JOMOOの歩み
        </h2>
      </header>

      <div className="cp-history__body" ref={bodyRef}>
        <div className="cp-history__rail" aria-hidden="true">
          <span className="cp-history__rail-line">
            <span className="cp-history__dot" />
          </span>
        </div>

        <div className="cp-era__head">
          <h3 className="cp-era__years">
            1990<span className="cp-era__years-to">-1999</span>
          </h3>
          <p className="cp-eyebrow">THE FOUNDING YEARS</p>
        </div>

        <div className="cp-era__aside">
          <h4 className="cp-era__subtitle">創業</h4>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="cp-era__image"
            src="/images/companyprofile/founding.jpg"
            alt="創業当時のJOMOO"
            width={660}
            height={450}
            loading="lazy"
          />
        </div>

        <ol className="cp-era__entries">
          {FOUNDING_YEARS.map((entry) => (
            <li key={entry.year} className="cp-entry">
              <p className="cp-entry__year">{entry.year}</p>
              <p className="cp-entry__event">{entry.event}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
