'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'

export default function MarketingHeader() {
  const headerRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const header = headerRef.current
    if (!header) return

    const heroEl = document.getElementById('jm-hero')
    if (!heroEl) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          header.classList.remove('jmh--scrolled')
        } else {
          header.classList.add('jmh--scrolled')
        }
      },
      { threshold: 0, rootMargin: '-1px 0px 0px 0px' }
    )
    observer.observe(heroEl)
    return () => observer.disconnect()
  }, [])

  return (
    <header ref={headerRef} style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 100,
      transition: 'background 0.4s ease, backdrop-filter 0.4s ease',
    }} className="jmh-root">
      <style>{`
        .jmh-root {
          background: transparent;
        }
        .jmh-root.jmh--scrolled {
          background: rgba(10,10,10,0.88);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
        }
        .jmh-inner {
          max-width: 1440px;
          margin: 0 auto;
          padding: 0 48px;
          height: 68px;
          display: flex;
          align-items: center;
        }
        .jmh-logo {
          font-family: var(--font-noto-sans-jp, sans-serif);
          font-size: 20px;
          font-weight: 400;
          letter-spacing: 0.15em;
          color: #fff;
          text-transform: uppercase;
          flex-shrink: 0;
        }
        .jmh-nav {
          display: flex;
          align-items: center;
          gap: 40px;
          margin: 0 auto;
        }
        .jmh-nav-link {
          position: relative;
          font-family: var(--font-noto-sans-jp, sans-serif);
          font-size: 13px;
          font-weight: 400;
          letter-spacing: 0.1em;
          color: #fff;
          text-decoration: none;
        }
        .jmh-nav-link::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          right: 0;
          height: 1px;
          background: #fff;
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.25s ease;
        }
        .jmh-nav-link:hover::after { transform: scaleX(1); }
        .jmh-icons {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-left: auto;
        }
        .jmh-icon-btn {
          background: transparent;
          border: none;
          cursor: pointer;
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 4px;
        }
        @media (max-width: 767px) {
          .jmh-nav { display: none; }
          .jmh-inner { padding: 0 20px; }
        }
      `}</style>
      <div className="jmh-inner">
        <span className="jmh-logo">JOMOO</span>
        <nav className="jmh-nav">
          {(['商品情報', 'インスピレーション', '会社情報', 'お問い合わせ'] as const).map(link => (
            <a key={link} href="#" className="jmh-nav-link">{link}</a>
          ))}
        </nav>
        <div className="jmh-icons">
          <button className="jmh-icon-btn" aria-label="Search">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <circle cx="7.5" cy="7.5" r="5.5" />
              <line x1="12" y1="12" x2="16" y2="16" />
            </svg>
          </button>
          <button className="jmh-icon-btn" aria-label="Menu">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <line x1="2" y1="5" x2="16" y2="5" />
              <line x1="2" y1="9" x2="16" y2="9" />
              <line x1="2" y1="13" x2="16" y2="13" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  )
}
