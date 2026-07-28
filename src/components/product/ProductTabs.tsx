/* eslint-disable @next/next/no-img-element */
'use client'

import { useEffect, useState } from 'react'
import SpotlightModelViewer from '@/components/home/SpotlightModelViewer'

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
  label: string
  value: string
}

export interface TypeCardView {
  /** Grey pill above the model name. */
  eyebrow: string
  /** Large model name, e.g. "X40-B". */
  name: string
  /** Full model code. */
  modelCode: string
  price: string
  /** glTF source for the 3D viewer. */
  model?: string
  /** Product still shown until the 3D viewer is opened. */
  still?: string
}

interface Props {
  features: FeatureCardView[]
  standard: StandardGroupView[]
  specs: SpecRowView[]
  /** Dimension drawing shown above the spec table. */
  specImage?: string
  type: TypeCardView
}

const SECTIONS = [
  { id: 'features', label: 'おすすめ機能' },
  { id: 'specs',    label: '仕様' },
  { id: 'types',    label: 'タイプ・価格' },
] as const

type SectionId = (typeof SECTIONS)[number]['id']

export default function ProductTabs({ features, standard, specs, specImage, type }: Props) {
  const [active, setActive] = useState<SectionId>('features')
  const [modelOn, setModelOn] = useState(false)

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
              <div className="pdp-std__grid">
                {standard.map(group => (
                  <div key={group.title} className="pdp-std__card">
                    <h4 className="pdp-std__title">{group.title}</h4>
                    <ul className="pdp-std__list">
                      {group.items.map(item => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ))}
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
            <table className="pdp-specs__table">
              <tbody>
                {specs.map((spec, i) => (
                  <tr key={i}>
                    <th scope="row" className="pdp-specs__label">{spec.label}</th>
                    <td className="pdp-specs__value">{spec.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
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
              {!modelOn && type.still && (
                <img className="pdp-type__still" src={type.still} alt={type.name} />
              )}
              {type.model && (
                <SpotlightModelViewer
                  src={type.model}
                  active={modelOn}
                  playLabel="3D VIEW"
                  playTheme="light"
                  onActivate={() => setModelOn(true)}
                  onDeactivate={() => setModelOn(false)}
                />
              )}
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
