'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import { useScrollReveal } from './useScrollReveal'

const INTRO = [
  'JOMOOグループは、',
  'キッチン・バスルーム領域における複数の個性あるブランドを保有・展開しています。',
]

/**
 * A showroom facade, traced from the design screen.
 *
 * The other two stats reuse the homepage's icon set; this one has no asset in
 * it, so it is drawn here in the same hand — one weight of blue line, square
 * ends, no fill — rather than borrowed from a stat that means something else.
 */
function ShowroomIcon() {
  return (
    <svg viewBox="0 0 64 50" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      {/* Roof cap and the window grid: four floors, seven bays. */}
      <path d="M8.7 1.2h47.6" />
      <path d="M7.5 4.1h49M7.5 13.3h49M7.5 22.9h49M7.5 32.4h49" />
      <path d="M11.5 4.1v28.3M17.8 4.1v28.3M24 4.1v28.3M30.3 4.1v28.3M36.1 4.1v28.3M42.3 4.1v28.3M48.1 4.1v28.3M53.4 4.1v28.3" />
      {/* Ground floor: the band, its two pillars, and the entrance between them. */}
      <path d="M6.5 35.5h51.5" />
      <path d="M11.8 35.5v13.5M53.4 35.5v13.5" />
      <path d="M20.2 40h25v6.7" />
      <path d="M20.2 40v6.7M25.5 40v6.7M31.8 40v6.7M37.5 40v6.7M42.3 40v6.7" />
      <path d="M0.5 49h63" />
    </svg>
  )
}

interface Stat {
  label: string
  value: number
  suffix: string
  icon: ReactNode
}

const STATS: Stat[] = [
  { label: '高級ショールーム', value: 10000, suffix: '+', icon: <ShowroomIcon /> },
  {
    label: '展開国・地域数',
    value: 120,
    suffix: '+',
    // eslint-disable-next-line @next/next/no-img-element
    icon: <img src="/images/icon/icon_00001.png" alt="" />,
  },
  {
    label: '販売拠点数',
    value: 300000,
    suffix: '+',
    // eslint-disable-next-line @next/next/no-img-element
    icon: <img src="/images/icon/icon_00002.png" alt="" />,
  },
]

/**
 * One stat, counted up the way the homepage counts its own: the whole row is
 * the observer's target, so the three start together rather than each waiting
 * for its own turn, and the suffix arrives once the number has settled.
 *
 * The figure is in the markup as text as well, so it is there for a reader who
 * never runs the count — the effect only takes over once it is going to.
 */
function StatCard({ stat, index, rowRef }: { stat: Stat; index: number; rowRef: React.RefObject<HTMLElement | null> }) {
  const numRef = useRef<HTMLSpanElement>(null)
  const sufRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const row = rowRef.current
    const num = numRef.current
    if (!row || !num) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const suf = sufRef.current
    if (suf) suf.style.opacity = '0'
    num.textContent = '0'

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        observer.disconnect()
        void import('gsap').then(({ default: gsap }) => {
          const counter = { value: 0 }
          gsap.to(counter, {
            value: stat.value,
            duration: 2,
            delay: index * 0.08,
            ease: 'power2.out',
            onUpdate: () => {
              num.textContent = Math.round(counter.value).toLocaleString('ja-JP')
            },
            onComplete: () => {
              num.textContent = stat.value.toLocaleString('ja-JP')
              if (suf) suf.style.opacity = '1'
            },
          })
        })
      },
      { threshold: 0.3 },
    )

    observer.observe(row)
    return () => observer.disconnect()
  }, [stat.value, index, rowRef])

  return (
    <li className="cp-stat">
      <div className="cp-stat__top">
        <span className="cp-stat__icon">{stat.icon}</span>
        <span className="cp-stat__label">{stat.label}</span>
      </div>
      <p className="cp-stat__num">
        <span ref={numRef}>{stat.value.toLocaleString('ja-JP')}</span>
        <span className="cp-stat__suffix" ref={sufRef}>
          {stat.suffix}
        </span>
      </p>
    </li>
  )
}

/** グローバル展開 — the map, and the three figures under it. */
export default function GlobalPresenceSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const rowRef = useRef<HTMLUListElement>(null)

  useScrollReveal(sectionRef, [
    { selector: '.cp-global__head' },
    { selector: '.cp-global__map' },
    { selector: '.cp-stat', y: 40 },
  ])

  return (
    <section
      className="cp-global"
      ref={sectionRef}
      data-nav="light"
      aria-labelledby="cp-global-title"
    >
      <header className="cp-global__head">
        <p className="cp-eyebrow cp-eyebrow--display">GLOBAL PRESENCE</p>
        <h2 className="cp-section-title" id="cp-global-title">
          グローバル展開
        </h2>
        <span className="cp-rule" aria-hidden="true" />
        <div className="cp-lede">
          {INTRO.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
      </header>

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className="cp-global__map"
        src="/images/companyprofile/mapprof.jpg"
        alt="JOMOOの世界の拠点を示す地図。中国、UAE、ロシア、欧州、アメリカを中心に120を超える国と地域に展開しています。"
        width={2400}
        height={1479}
        loading="lazy"
      />

      <ul className="cp-stats" ref={rowRef}>
        {STATS.map((stat, i) => (
          <StatCard key={stat.label} stat={stat} index={i} rowRef={rowRef} />
        ))}
      </ul>
    </section>
  )
}
