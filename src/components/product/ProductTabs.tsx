/* eslint-disable @next/next/no-img-element */
'use client'

import { Fragment, useEffect, useState } from 'react'
import ConsentedVideo from '@/components/consent/ConsentedVideo'

export interface FeatureCardView {
  /** One entry per rendered line. */
  title: string[]
  /** One entry per rendered line. */
  body: string[]
  image?: string
  alt: string
}

export interface StandardGroupView {
  title: string
  /** One entry per rendered line. */
  items: string[]
}

export interface SpecRowView {
  /** Consecutive rows sharing a subgroup render under one sub-heading. */
  subgroup?: string
  label: string
  value: string
}

export interface SpecGroupView {
  /** Optional — an untitled group renders as plain rows with no heading. */
  title?: string
  rows: SpecRowView[]
}

/** Renders a value's newlines as line breaks. */
function Lines({ text }: { text: string }) {
  const lines = text.split('\n')
  return (
    <>
      {lines.map((line, i) => (
        <Fragment key={i}>
          {i > 0 && <br />}
          {line}
        </Fragment>
      ))}
    </>
  )
}

export interface TypeCardView {
  /** Grey pill above the model name. */
  eyebrow: string
  /** Large model name, e.g. "X40-B". */
  name: string
  /** Full model code. */
  modelCode: string
  price: string
}

interface Props {
  features: FeatureCardView[]
  standard: StandardGroupView[]
  specs: SpecGroupView[]
  /** Footnote printed under the spec table. */
  specNote?: string
  /** Dimension drawing shown above the spec table. */
  specImage?: string
  /** Full-width YouTube (etc.) embed shown above おすすめ機能. */
  introVideoUrl?: string
  type: TypeCardView
}

const SECTIONS = [
  { id: 'features', label: 'おすすめ機能' },
  { id: 'specs',    label: '仕様' },
  { id: 'types',    label: 'タイプ・価格' },
] as const

type SectionId = (typeof SECTIONS)[number]['id']

const TYPE_LOOP = [
  '/images/x40loop1.png',
  '/images/x40loop2.png',
  '/images/x40loop3.png',
] as const

function TypeLoop({ alt }: { alt: string }) {
  const [active, setActive] = useState(0)

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) return

    const timer = window.setInterval(() => {
      setActive((index) => (index + 1) % TYPE_LOOP.length)
    }, 1500)

    return () => window.clearInterval(timer)
  }, [])

  return (
    <div className="pdp-type__loop">
      {TYPE_LOOP.map((src, index) => (
        <img
          key={src}
          className={`pdp-type__loop-img${index === active ? ' is-active' : ''}`}
          src={src}
          alt={index === active ? alt : ''}
          aria-hidden={index === active ? undefined : true}
        />
      ))}
    </div>
  )
}

export default function ProductTabs({
  features,
  standard,
  specs,
  specNote,
  specImage,
  introVideoUrl,
  type,
}: Props) {
  const [active, setActive] = useState<SectionId>('features')

  // Highlight whichever section the reader is currently in
  useEffect(() => {
    const panels = SECTIONS.map(section => document.getElementById(`pdp-panel-${section.id}`))

    function updateActive() {
      // A section counts as current once its top passes a third of the viewport
      const line = window.innerHeight / 3
      let current: SectionId = SECTIONS[0].id
      panels.forEach((panel, i) => {
        if (panel && panel.getBoundingClientRect().top <= line) current = SECTIONS[i].id
      })
      setActive(current)
    }

    updateActive()
    window.addEventListener('scroll', updateActive, { passive: true })
    window.addEventListener('resize', updateActive)

    return () => {
      window.removeEventListener('scroll', updateActive)
      window.removeEventListener('resize', updateActive)
    }
  }, [])

  return (
    <section className="pdp-tabs">
      <nav className="pdp-tabs__nav" aria-label="製品情報">
        {SECTIONS.map(section => (
          <a
            key={section.id}
            href={`#pdp-panel-${section.id}`}
            className={`pdp-tabs__tab${section.id === active ? ' is-active' : ''}`}
            aria-current={section.id === active ? 'true' : undefined}
          >
            {section.label}
          </a>
        ))}
      </nav>

      <div className="site-container">
        {/* おすすめ機能 */}
        <section className="pdp-tabs__panel" id="pdp-panel-features">
          {introVideoUrl && (
            <div className="pdp-tabs__intro-video">
              <div className="pdp-video__frame">
                <ConsentedVideo src={introVideoUrl} title="製品紹介動画" />
              </div>
            </div>
          )}
          <h2 className="pdp-title pdp-title--center">{SECTIONS[0].label}</h2>
          <div className="pdp-rule pdp-rule--center" aria-hidden="true" />

          {features.length > 0 ? (
            <div className="pdp-fcards">
              {features.map((feature, i) => (
                <article key={i} className="pdp-fcard">
                  <div className="pdp-fcard__media">
                    {feature.image ? (
                      <img src={feature.image} alt={feature.alt} />
                    ) : (
                      <div className="pdp-fcard__media-empty" aria-hidden="true" />
                    )}
                  </div>
                  <div className="pdp-fcard__content">
                    <p className="pdp-fcard__index">{String(i + 1).padStart(2, '0')}</p>
                    <h3 className="pdp-fcard__title">
                      {feature.title.map((line, j) => (
                        <span key={line}>
                          {j > 0 && <br />}
                          {line}
                        </span>
                      ))}
                    </h3>
                    <div className="pdp-fcard__rule" aria-hidden="true" />
                    <p className="pdp-fcard__body">
                      {feature.body.map((line, j) => (
                        <span key={line}>
                          {j > 0 && <br />}
                          {line}
                        </span>
                      ))}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="pdp-tabs__empty">[ features · add in Sanity Studio ]</p>
          )}

          {standard.length > 0 && (
            <section className="pdp-std">
              <h3 className="pdp-title pdp-title--center">標準機能</h3>
              <div className="pdp-rule pdp-rule--center" aria-hidden="true" />
              <div className="pdp-std__list">
                {standard.map((group, i) => {
                  const mid = Math.ceil(group.items.length / 2)
                  const cols = [group.items.slice(0, mid), group.items.slice(mid)]

                  return (
                    <Fragment key={group.title}>
                      {i > 0 && <hr className="pdp-std__rule" />}
                      <div className="pdp-std__row">
                        <h4 className="pdp-std__title">{group.title}</h4>
                        {cols.map((items, col) => (
                          <ul key={col} className="pdp-std__col">
                            {items.map(item => (
                              <li key={item}>{item}</li>
                            ))}
                          </ul>
                        ))}
                      </div>
                    </Fragment>
                  )
                })}
              </div>
            </section>
          )}
        </section>

        {/* 仕様 */}
        <section className="pdp-tabs__panel" id="pdp-panel-specs">
          <h2 className="pdp-title pdp-title--center">{SECTIONS[1].label}</h2>
          <div className="pdp-rule pdp-rule--center" aria-hidden="true" />

          {specImage && (
            <img className="pdp-specs__diagram" src={specImage} alt="寸法図" />
          )}
          {specs.length > 0 ? (
            <>
              <table className="pdp-specs__table">
                {specs.map((group, gi) => (
                  <tbody key={gi}>
                    {group.title && (
                      <tr className="pdp-specs__grouprow">
                        <th colSpan={2} scope="colgroup" className="pdp-specs__group">
                          {group.title}
                        </th>
                      </tr>
                    )}
                    {group.rows.map((row, ri) => (
                      <Fragment key={ri}>
                        {row.subgroup && row.subgroup !== group.rows[ri - 1]?.subgroup && (
                          <tr className="pdp-specs__subrow">
                            <th colSpan={2} scope="rowgroup" className="pdp-specs__subgroup">
                              {row.subgroup}
                            </th>
                          </tr>
                        )}
                        <tr>
                          <th scope="row" className="pdp-specs__label">{row.label}</th>
                          <td className="pdp-specs__value"><Lines text={row.value} /></td>
                        </tr>
                      </Fragment>
                    ))}
                  </tbody>
                ))}
              </table>
              {specNote && (
                <p className="pdp-specs__note"><Lines text={specNote} /></p>
              )}
            </>
          ) : (
            <p className="pdp-tabs__empty">[ specifications · add in Sanity Studio ]</p>
          )}
        </section>

        {/* タイプ・価格 */}
        <section className="pdp-tabs__panel" id="pdp-panel-types">
          <h2 className="pdp-title pdp-title--center">{SECTIONS[2].label}</h2>
          <div className="pdp-rule pdp-rule--center" aria-hidden="true" />

          <article className="pdp-type">
            <div className="pdp-type__media">
              <TypeLoop alt={type.name} />
            </div>

            <div className="pdp-type__content">
              <span className="pdp-type__pill">{type.eyebrow}</span>
              <h3 className="pdp-type__name">{type.name}</h3>
              <p className="pdp-type__model">{type.modelCode}</p>
              <div className="pdp-rule" aria-hidden="true" />
              <p className="pdp-type__price">{type.price}</p>
            </div>
          </article>
        </section>
      </div>
    </section>
  )
}
