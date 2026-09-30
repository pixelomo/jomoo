'use client'

import { useRef } from 'react'
import ConsentedMap from '@/components/consent/ConsentedMap'
import { useScrollReveal } from '@/components/company/useScrollReveal'

// z=16 is the framing the design draws — close enough to read the street the
// building is on, wide enough to show 多摩センター and the monorail beside it.
const mapEmbed = (query: string) =>
  `https://www.google.com/maps?q=${encodeURIComponent(query)}&hl=ja&z=16&output=embed`
const mapLink = (query: string) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`

/**
 * One row of the table: the label on the left, one or more lines of value in
 * the column beside it. The rule between rows comes from the row below, so the
 * table has no line above the first or below the last — which is how the design
 * draws it.
 */
function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="sh-info__row">
      <dt className="sh-info__label">{label}</dt>
      <dd className="sh-info__value">{children}</dd>
    </div>
  )
}

/**
 * 東京ショールーム — who runs it, where it is, and the way through to booking a
 * visit.
 *
 * The map is a Google embed rather than a picture of one, so it pans and zooms
 * and hands the visitor over to their own maps app; it goes through
 * `ConsentedMap` for the same reason the product videos go through
 * `ConsentedVideo` — Google sets cookies the moment the frame loads.
 */
interface Props {
  title: string
  /** Each value as its lines — a value of several lines stacks them. */
  rows: { key: string; label: string; lines: string[] }[]
  /**
   * What Google is asked for — kept apart from the printed address because
   * Google geocodes the lot number cleanly and guesses at a building name.
   */
  mapQuery?: string
  ctaLabel: string
}

export default function ShowroomInfo({ title, rows, mapQuery, ctaLabel }: Props) {
  const infoRef = useRef<HTMLElement>(null)

  useScrollReveal(infoRef, [
    { selector: '.sh-info__title', y: 32 },
    { selector: '.sh-info__row', y: 24 },
    { selector: '.sh-info__map', y: 40 },
    { selector: '.sh-info__cta', y: 24 },
  ])

  return (
    <section className="sh-info" ref={infoRef} data-nav="light" aria-labelledby="sh-info-title">
      <h2 className="sh-info__title" id="sh-info-title">
        {title}
      </h2>

      <dl className="sh-info__table">
        {rows.map((row) => (
          <Row label={row.label} key={row.key}>
            {row.lines.length > 1
              ? row.lines.map((line, i) => (
                  <span className="sh-info__line" key={i}>
                    {line}
                  </span>
                ))
              : row.lines[0]}
          </Row>
        ))}
      </dl>

      {mapQuery && (
        <div className="sh-info__map">
          <ConsentedMap src={mapEmbed(mapQuery)} href={mapLink(mapQuery)} title={`${title}の地図`} />
        </div>
      )}

      {/* The contact form already has a ショールーム予約 section; the flag ticks
          it on arrival so the visitor lands on the form already asking for what
          this button promised. No #hash — that dropped the visitor at the
          bottom of the form, past the fields they still have to fill in. */}
      <a className="sh-info__cta" href="/contact-us?showroom=1">
        {ctaLabel}
      </a>
    </section>
  )
}
