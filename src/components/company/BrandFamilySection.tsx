'use client'

import { useRef } from 'react'
import { useScrollReveal } from './useScrollReveal'

export interface Brand {
  key: string
  name: string
  photo: string
  logo: string
  /**
   * Height the logo is drawn at, in px. Each logo has its own rather than one
   * shared value: the wordmarks are different shapes — JOMOO is a single line,
   * THG carries PARIS beneath it, poggenpohl is stacked over two — and the
   * design sizes them optically. Every file is cropped to its ink, so the
   * heights are the wordmarks' own and the logos share a left edge with the
   * copy. Every logo sits in a box as tall as the tallest one, so the copy
   * under it starts on the same line in every card.
   */
  logoHeight: number
  /** What the logo itself reads, when that is not the brand's name. */
  logoAlt?: string
  lines: string[]
}

interface Props {
  eyebrow: string
  title: string
  intro: string[]
  brands: Brand[]
}

/** ブランドファミリー — the group's brands, three to a row. */
export default function BrandFamilySection({ eyebrow, title, intro, brands }: Props) {
  const sectionRef = useRef<HTMLElement>(null)

  useScrollReveal(
    sectionRef,
    [
      { selector: '.cp-brands__head' },
      { selector: '.cp-brand', y: 40 },
    ],
    [{ selector: '.cp-brand__photo' }],
  )

  return (
    <section
      className="cp-brands"
      ref={sectionRef}
      data-nav="light"
      aria-labelledby="cp-brands-title"
    >
      <header className="cp-brands__head">
        <p className="cp-eyebrow cp-eyebrow--display">{eyebrow}</p>
        <h2 className="cp-section-title" id="cp-brands-title">
          {title}
        </h2>
        <span className="cp-rule" aria-hidden="true" />
        <div className="cp-lede">
          {intro.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
      </header>

      <ul className="cp-brands__grid">
        {brands.map((brand) => (
          <li className="cp-brand" key={brand.key}>
            <figure className="cp-brand__frame">
              {brand.photo && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  className="cp-brand__photo"
                  src={brand.photo}
                  alt={`${brand.name}の製品`}
                  loading="lazy"
                />
              )}
            </figure>
            <div className="cp-brand__body">
              <div className="cp-brand__logo">
                {brand.logo && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={brand.logo}
                    alt={brand.logoAlt ?? brand.name}
                    loading="lazy"
                    style={{ height: `${brand.logoHeight}px` }}
                  />
                )}
              </div>
              <p className="cp-brand__copy">
                {brand.lines.map((line, i) => (
                  <span className="cp-brand__line" key={i}>
                    {line}
                  </span>
                ))}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
