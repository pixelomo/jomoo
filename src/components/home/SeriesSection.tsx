'use client'

import { useState } from 'react'

interface SeriesCard {
  img: string
  catPill: string
  code: string
  title: string
  desc: string
  price: string
  tab: string
}

interface Props {
  sectionNum: string
  sectionTitle: string
  moreLabel: string
  moreHref: string
  tabs: string[]
  cards: SeriesCard[]
}

export default function SeriesSection({ sectionNum, sectionTitle, moreLabel, moreHref, tabs, cards }: Props) {
  const [activeTab, setActiveTab] = useState(tabs[0])

  const visibleCards = activeTab === tabs[0]
    ? cards
    : cards.filter(c => c.tab === activeTab)

  return (
    <section className="jm-sec" style={{ background: 'var(--bg-soft)' }}>
      <div className="jm-sec-inner">
        {/* Section head */}
        <div className="jm-sec-head">
          <div>
            <div style={{ fontFamily: 'var(--font-poppins), sans-serif', fontSize: 12, letterSpacing: '0.1em', color: 'var(--ink-3)', fontWeight: 600, marginBottom: 14 }}>
              {sectionNum}
            </div>
            <h2 style={{ fontSize: 28, fontWeight: 700, lineHeight: 1.4, letterSpacing: '0.01em', paddingBottom: 14, borderBottom: '4px solid var(--accent)', display: 'inline-block' }}>
              {sectionTitle}
            </h2>
          </div>
          <a href={moreHref} style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)', display: 'inline-flex', gap: 8, alignItems: 'center', padding: '10px 18px', border: '1px solid var(--line)' }}>
            {moreLabel} →
          </a>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--line)', marginBottom: 32 }}>
          {tabs.map(tab => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '14px 24px',
                fontSize: 14, fontWeight: tab === activeTab ? 700 : 500,
                background: 'transparent', border: 0, cursor: 'pointer',
                color: tab === activeTab ? 'var(--ink)' : 'var(--ink-3)',
                borderBottom: tab === activeTab ? '3px solid var(--accent)' : '3px solid transparent',
                marginBottom: -1,
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Cards */}
        <div className="jm-series-rail">
          {visibleCards.map((card, i) => (
            <article key={i} style={{ background: 'var(--paper)', border: '1px solid var(--line)' }}>
              <div style={{ aspectRatio: '1/1', position: 'relative', background: '#f5f5f5', overflow: 'hidden' }}>
                <div style={{
                  position: 'absolute', inset: 0,
                  background: i % 2 === 0
                    ? 'repeating-linear-gradient(45deg,rgba(0,0,0,0.04) 0 1px,transparent 1px 16px),linear-gradient(180deg,#d8d3c6 0%,#b8b1a0 100%)'
                    : 'repeating-linear-gradient(45deg,rgba(0,0,0,0.03) 0 1px,transparent 1px 16px),linear-gradient(180deg,#efece4 0%,#d6d1c5 100%)',
                  display: 'flex', alignItems: 'flex-end', padding: 12,
                }}>
                  <span style={{ fontFamily: 'var(--font-poppins), sans-serif', fontSize: 10, letterSpacing: '0.08em', opacity: 0.7, color: i % 2 === 0 ? '#cfd3d8' : '#4a4a4a' }}>
                    {card.img}
                  </span>
                </div>
              </div>
              <div style={{ padding: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: 10, letterSpacing: '0.05em', color: 'var(--accent)', padding: '3px 8px', background: 'var(--accent-soft)', fontWeight: 600 }}>
                    {card.catPill}
                  </span>
                  <span style={{ fontFamily: 'var(--font-poppins), sans-serif', fontSize: 11, color: 'var(--ink-3)', letterSpacing: '0.04em' }}>
                    {card.code}
                  </span>
                </div>
                <h4 style={{ fontSize: 15, fontWeight: 700, lineHeight: 1.5, marginBottom: 6 }}>{card.title}</h4>
                <p style={{ fontSize: 12, color: 'var(--ink-2)', lineHeight: 1.7 }}>{card.desc}</p>
                <div style={{ borderTop: '1px solid var(--line)', marginTop: 12, paddingTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 15, fontWeight: 700 }}>{card.price}</span>
                  <a href="#" style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 600 }}>→</a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
