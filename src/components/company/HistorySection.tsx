'use client'

import { useRef } from 'react'
import { useCssScrollProgress } from './useCssScrollProgress'
import { useScrollReveal } from './useScrollReveal'

/** The rail's sticky window, as a fraction of the viewport. Mirrors the CSS. */
const RAIL_HEIGHT = 0.9
const RAIL_INSET = 0.05

interface Era {
  from: string
  to: string
  /** Which half of timelinebg.jpg tints the era, if any. */
  tint?: 'top' | 'bottom'
  eyebrow: string
  subtitle: string
  images: { src: string; alt: string; width: number; height: number }[]
  /** Each event keeps the line structure it was designed with. */
  entries: { year: string; lines: string[] }[]
}

const ERAS: Era[] = [
  {
    from: '1990',
    to: '1999',
    eyebrow: 'THE FOUNDING YEARS',
    subtitle: '創業',
    images: [
      {
        src: '/images/companyprofile/founding.jpg',
        alt: '創業当時のJOMOO',
        width: 660,
        height: 450,
      },
    ],
    entries: [
      { year: '1990', lines: ['JOMOO創業'] },
      { year: '1991', lines: ['シャワースプレー用の除じん（ホコリ除去）システムを開発'] },
      { year: '1993', lines: ['中国発のセラミックカートリッジ水栓を発売'] },
      { year: '1999', lines: ['センサー水栓を開発'] },
    ],
  },
  {
    from: '2000',
    to: '2009',
    tint: 'top',
    eyebrow: 'THE EXPANSION YEARS',
    subtitle: '本格展開期',
    images: [
      {
        src: '/images/companyprofile/expansion.jpg',
        alt: 'JOMOOのショールーム',
        width: 2000,
        height: 1125,
      },
    ],
    entries: [
      { year: '2006', lines: ['セラミック製品を発売、', '衛生陶器製品を発売'] },
      { year: '2007', lines: ['国際的なキッチン・バス金物の標準策定者に'] },
      { year: '2008', lines: ['バスルーム製品ライン全体を新たに展開'] },
    ],
  },
  {
    from: '2010',
    to: '2019',
    eyebrow: 'THE INNOVATION YEARS',
    subtitle: 'イノベーション期',
    images: [
      {
        src: '/images/companyprofile/innovation.jpg',
        alt: 'JOMOO groupのオフィス',
        width: 2000,
        height: 1500,
      },
    ],
    entries: [
      { year: '2010', lines: ['初のスマートトイレを発売'] },
      { year: '2016', lines: ['「中国ハイエンドバスルーム業界リーディングブランド」に選出'] },
      {
        year: '2017',
        lines: [
          'グローバル・スマートホーム戦略を開始し、',
          'JOMOO欧州オペレーションセンターを設立',
        ],
      },
    ],
  },
  {
    from: '2020',
    to: 'NOW',
    tint: 'bottom',
    eyebrow: 'THE SMART LIVING ERA',
    subtitle: 'テクノロジー期',
    images: [
      {
        src: '/images/companyprofile/smart1.jpg',
        alt: 'JOMOOのスマートショールーム',
        width: 2400,
        height: 1599,
      },
      {
        src: '/images/companyprofile/smart2.jpg',
        alt: 'JOMOOの本社キャンパス',
        width: 2000,
        height: 1125,
      },
    ],
    entries: [
      { year: '2020', lines: ['故宮・万里の長城・ポタラ宮など世界的文化遺産へ導入'] },
      { year: '2021', lines: ['THG ParisとPoggenpohlを買収'] },
      { year: '2022', lines: ['「中国トップインテリジェントバスルームブランド」に選出'] },
      { year: '2023', lines: ['世界初の「環境配慮型ダークファクトリー」を実現'] },
      {
        year: '2024',
        lines: [
          '国連開発計画（UNDP）と共同で国際トイレフォーラムを開催',
          '10月にJOMOO日本研究開発センターを設立',
        ],
      },
      {
        year: '2025',
        lines: [
          'スペインのCasa Decorアートデザイン展に出展。',
          'ゲイツ財団と共同で「汚物ゼロ・無水トイレ」プロジェクトを世界発表',
        ],
      },
      {
        year: '2026',
        lines: [
          'JOMOOが正式に日本市場へ参入。',
          '東京に初の直営ショールームをオープンし、',
          'スマートトイレを同時発売、',
          '世界市場での確固たる地位を確立し、',
          'バス&キッチン領域を代表するブランドへ',
        ],
      },
    ],
  },
]

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
export default function HistorySection() {
  const sectionRef = useRef<HTMLElement>(null)
  const bodyRef = useRef<HTMLDivElement>(null)

  // The rail is pinned RAIL_INSET below the nav and stands RAIL_HEIGHT tall, so
  // the dot's travel is the distance between the body entering that window and
  // its end reaching the bottom of it. The floor is a guard for a timeline
  // shorter than the rail itself, which would otherwise leave nothing to move
  // through and the dot sitting dead at the top.
  useCssScrollProgress(bodyRef, '--cp-rail', (rect, viewport, navHeight) => {
    const top = navHeight + viewport * RAIL_INSET
    const rail = Math.min(viewport * RAIL_HEIGHT, rect.height)
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

        <div className="cp-history__eras">
          {ERAS.map((era) => (
            <article
              className={`cp-era${era.tint ? ` cp-era--tint cp-era--tint-${era.tint}` : ''}`}
              key={era.from}
            >
              <div className="cp-era__head">
                <h3 className="cp-era__years">
                  {era.from}
                  <span className="cp-era__years-to">-{era.to}</span>
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
                  <li key={entry.year} className="cp-entry">
                    <p className="cp-entry__year">{entry.year}</p>
                    <p className="cp-entry__event">
                      {entry.lines.map((line) => (
                        <span className="cp-entry__line" key={line}>
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
