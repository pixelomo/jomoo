'use client'

import { useRef } from 'react'
import { useScrollReveal } from './useScrollReveal'

interface Brand {
  name: string
  photo: string
  logo: string
  /** Height the logo is drawn at, in px — see the note on the array below. */
  logoHeight: number
  lines: string[]
}

/**
 * The six brands, in the order the design lays them out.
 *
 * Each logo has its own height rather than one shared value: the wordmarks are
 * different shapes — JOMOO is a single line, THG carries PARIS beneath it,
 * poggenpohl is stacked over two — and the design sizes them optically, so the
 * heights here are the ones measured off it rather than a rule.
 */
const BRANDS: Brand[] = [
  {
    name: 'JOMOO',
    photo: '/images/companyprofile/brand1.jpg',
    logo: '/images/companyprofile/brandlogo1.png',
    logoHeight: 74,
    lines: ['先進技術と洗練された', 'デザインを融合した、', '高機能バスルームブランド。'],
  },
  {
    name: 'THG PARIS',
    photo: '/images/companyprofile/brand2.jpg',
    logo: '/images/companyprofile/brandlogo2.png',
    logoHeight: 116,
    lines: ['パリの美意識が息づく、', 'ラグジュアリーな', '水まわりブランド。'],
  },
  {
    name: 'poggenpohl',
    photo: '/images/companyprofile/brand3.jpg',
    logo: '/images/companyprofile/brandlogo3.png',
    logoHeight: 101,
    lines: ['130年以上の歴史を誇る、', 'ドイツ発のプレミアム', 'キッチンブランド。'],
  },
  {
    name: '小牧卫浴',
    photo: '/images/companyprofile/brand4.jpg',
    logo: '/images/companyprofile/brandlogo4.png',
    logoHeight: 76,
    lines: ['先進技術を搭載した、', 'ハイエンドスマート', 'シャワーブランド。'],
  },
  {
    name: 'URBAIN THG',
    photo: '/images/companyprofile/brand5.jpg',
    logo: '/images/companyprofile/brandlogo5.png',
    logoHeight: 51,
    lines: ['パリの美意識が息づく、', 'ラグジュアリーな', '水まわりブランド。'],
  },
  {
    name: 'Goldreif poggenpohl',
    photo: '/images/companyprofile/brand6.jpg',
    logo: '/images/companyprofile/brandlogo6.png',
    logoHeight: 68,
    lines: ['上質なキャビネットと', 'ワードローブを展開する、', 'ハイエンド収納ブランド。'],
  },
]

const INTRO = [
  '世界とつながり、日々の暮らしのすぐそばに。',
  'JOMOOの歩みは世界各地に広がり、様々な市場へと発展を続けています。',
  '世界で培ってきた技術、デザイン、サービスの知見を、',
  'それぞれの土地の暮らしに寄り添った水まわりソリューションへと高めています。',
]

/** ブランドファミリー — the group's six brands, three to a row. */
export default function BrandFamilySection() {
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
        <p className="cp-eyebrow cp-eyebrow--display">BRAND FAMILY</p>
        <h2 className="cp-section-title" id="cp-brands-title">
          ブランドファミリー
        </h2>
        <span className="cp-brands__rule" aria-hidden="true" />
        <div className="cp-brands__intro">
          {INTRO.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
      </header>

      <ul className="cp-brands__grid">
        {BRANDS.map((brand) => (
          <li className="cp-brand" key={brand.name}>
            <figure className="cp-brand__frame">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className="cp-brand__photo"
                src={brand.photo}
                alt={`${brand.name}の製品`}
                loading="lazy"
              />
            </figure>
            <div className="cp-brand__body">
              <div
                className="cp-brand__logo"
                style={{ height: `${brand.logoHeight}px` }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={brand.logo} alt={brand.name} loading="lazy" />
              </div>
              <p className="cp-brand__copy">
                {brand.lines.map((line) => (
                  <span className="cp-brand__line" key={line}>
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
