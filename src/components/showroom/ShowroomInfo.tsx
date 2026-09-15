'use client'

import { useRef } from 'react'
import ConsentedMap from '@/components/consent/ConsentedMap'
import { useScrollReveal } from '@/components/company/useScrollReveal'

/**
 * What Google is asked for. The printed address and the pin come off the same
 * string, so the map can never end up pointing somewhere the page does not say.
 * The building name is left out of the query — Google geocodes the lot number
 * cleanly and guesses at 福満ビル.
 */
const MAP_QUERY = '〒206-0042 東京都多摩市山王下1-12-12'

// z=16 is the framing the design draws — close enough to read the street the
// building is on, wide enough to show 多摩センター and the monorail beside it.
const MAP_EMBED = `https://www.google.com/maps?q=${encodeURIComponent(MAP_QUERY)}&hl=ja&z=16&output=embed`
const MAP_LINK = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(MAP_QUERY)}`

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
export default function ShowroomInfo() {
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
        JOMOOショールーム
      </h2>

      <dl className="sh-info__table">
        <Row label="運営">株式会社TRUST</Row>

        <Row label="住所">
          〒206-0042　東京都多摩市山王下1-12-12 福満ビル 101
        </Row>

        <Row label="TEL">準備中</Row>

        <Row label="営業時間">
          <span className="sh-info__line">平日：9:00〜18:00</span>
          <span className="sh-info__line">土日祝日：準備中</span>
          <span className="sh-info__line">※年末年始を除く</span>
        </Row>
      </dl>

      <div className="sh-info__map">
        <ConsentedMap src={MAP_EMBED} href={MAP_LINK} title="JOMOOショールームの地図" />
      </div>

      {/* The contact form already has a ショールーム予約 section; the flag ticks
          it on arrival so the visitor lands on the form already asking for what
          this button promised. */}
      <a className="sh-info__cta" href="/contact-us?showroom=1#showroom-reservation">
        ショールーム予約へ
      </a>
    </section>
  )
}
