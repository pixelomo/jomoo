/* eslint-disable @next/next/no-img-element */
'use client'

import Lines from '@/components/Lines'

export interface LaneImage {
  src: string
  /** Cut-outs with a transparent background need design-colbg behind them. */
  onBackdrop?: boolean
}

function VerticalLane({
  images,
  direction,
}: {
  images: LaneImage[]
  direction: 'down' | 'up'
}) {
  const loop = [...images, ...images]

  return (
    <div className={`design-excellence__lane design-excellence__lane--${direction}`}>
      <div className={`design-excellence__track design-excellence__track--${direction}`}>
        {loop.map((image, index) => (
          <div
            key={index}
            className={`design-excellence__card${
              image.onBackdrop ? ' design-excellence__card--backdrop' : ''
            }`}
          >
            <img src={image.src} alt="" loading="lazy" decoding="async" />
          </div>
        ))}
      </div>
    </div>
  )
}

interface Props {
  eyebrow: string
  title: string[]
  subtitle: string[]
  button: string
  /** The left column, drifting down. */
  lane1: LaneImage[]
  /** The right column, drifting up. */
  lane2: LaneImage[]
}

export default function DesignExcellenceSection({ eyebrow, title, subtitle, button, lane1, lane2 }: Props) {
  return (
    <section className="design-excellence" data-nav="light" id="design">
      <div className="design-excellence__inner">
        <div className="design-excellence__layout">
          <div className="design-excellence__carousels" aria-hidden="true">
            <VerticalLane images={lane1} direction="down" />
            <VerticalLane images={lane2} direction="up" />
          </div>

          <div className="design-excellence__content">
            <div className="design-excellence__eyebrow reveal">{eyebrow}</div>
            <h2 className="design-excellence__title reveal">
              <Lines lines={title} />
            </h2>
            <div className="design-excellence__rule reveal" aria-hidden="true" />
            <p className="design-excellence__subtitle reveal">
              <Lines lines={subtitle} />
            </p>
            {/* The section names the designers without naming them, so it ends
                on the way through to the page that does. */}
            <a className="design-excellence__btn reveal" href="/designer">
              {button}
              <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path d="M4 12h15M13 6l6 6-6 6" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
