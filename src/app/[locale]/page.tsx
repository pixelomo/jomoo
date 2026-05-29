'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

/* ─── Scroll-reveal hook ─── */
function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.x40-reveal')
    const io = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('x40-revealed') }),
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    )
    els.forEach(el => io.observe(el))
    return () => io.disconnect()
  }, [])
}

/* ─── Stats counter ─── */
function StatCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [val, setVal] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      io.disconnect()
      let start = 0
      const step = target / 60
      const tick = () => {
        start += step
        if (start >= target) { setVal(target); return }
        setVal(Math.floor(start))
        requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    }, { threshold: 0.5 })
    io.observe(el)
    return () => io.disconnect()
  }, [target])
  return <span ref={ref}>{val}{suffix}</span>
}

const FEATURES = [
  { img: '/x40/auto-lid.jpg',             en: 'Auto Lid',           ja: '自動開蓋',     desc: 'Hands-free lid opens as you approach and closes when you leave.' },
  { img: '/x40/foot-sensor-flush.png',    en: 'Foot Flush',         ja: '脚感冲水',     desc: 'Wave your foot beneath the panel — no touch required.' },
  { img: '/x40/silent-flush.jpg',         en: '38 dB Flush',        ja: '静音冲',       desc: 'Ultra-quiet cyclone flush so quiet you barely notice it.' },
  { img: '/x40/seat-heating.jpg',         en: 'Heated Seat',        ja: '座温加热',     desc: 'Four-season adaptive temperature keeps you comfortable year-round.' },
  { img: '/x40/uv-sterilize.jpg',         en: 'UV Sterilization',   ja: 'UV除菌',       desc: 'UV light eliminates 99.9% of bacteria inside the bowl.' },
  { img: '/x40/platinum-deodorize.png',   en: 'Platinum Deodorize', ja: '铂金除臭',     desc: 'Platinum catalyst neutralizes odours before they escape.' },
  { img: '/x40/night-light.jpg',          en: 'Night Light',        ja: '光感夜灯',     desc: 'Ambient sensor dims on at night — gentle enough not to wake you.' },
  { img: '/x40/antibacterial-glaze.jpg',  en: 'Anti-bacterial',     ja: '釉面抗菌',     desc: 'Nano-glaze coating prevents 99% of bacterial adhesion.' },
  { img: '/x40/cyclone-flush.jpg',        en: 'Cyclone Flush',      ja: '旋风冲',       desc: 'Spiral water jets clean every surface in a single flush.' },
  { img: '/x40/auto-flush.jpg',           en: 'Auto Flush',         ja: '离座自冲',     desc: 'Seat sensor triggers an automatic flush the moment you stand.' },
  { img: '/x40/magic-bubble.jpg',         en: 'Magic Bubble',       ja: '旋转魔力泡',   desc: 'Pre-coating foam reduces sticking — less water, cleaner bowl.' },
  { img: '/x40/removable-nozzle.jpg',     en: 'Clean Nozzle',       ja: '喷嘴自洁',     desc: 'Detachable antibacterial nozzle for thorough manual cleaning.' },
]

const COMFORT = [
  { img: '/x40/rear-wash.png',         en: 'Rear Wash',         ja: '臀洗',     desc: 'Adjustable pressure and position for personalised cleansing.' },
  { img: '/x40/feminine-wash.png',     en: 'Feminine Wash',     ja: '妇洗',     desc: "Gentle, targeted stream designed for women's hygiene needs." },
  { img: '/x40/wide-wash.jpg',         en: 'Wide Wash',         ja: '宽幅强洗', desc: 'Oscillating wide-spray covers a broader area for superior clean.' },
  { img: '/x40/massage-wash.jpg',      en: 'Moving Massage',    ja: '移动按摩', desc: 'Pulsating massage mode for therapeutic relief and comfort.' },
  { img: '/x40/constipation-wash.png', en: 'Relief Wash',       ja: '助便强洗', desc: 'Targeted strong stream helps ease discomfort naturally.' },
  { img: '/x40/temp-sensing.jpg',      en: 'Warm Water',        ja: '四季温感', desc: 'Instant warm water — no cold-start wait, always the right temperature.' },
]

export default function X40LandingPage() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  useReveal()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="x40-page">

      {/* ═══════════ FIXED NAV ═══════════ */}
      <nav className={`x40-nav${scrolled ? ' x40-nav--scrolled' : ''}`}>
        <div className="x40-nav-inner">
          <Link href="/" className="x40-logo-link">
            <Image src="/logo.png" alt="JOMOO" width={120} height={36} style={{ objectFit: 'contain' }} priority />
          </Link>

          <div className={`x40-nav-links${menuOpen ? ' x40-nav-links--open' : ''}`}>
            {[['#features', 'Features'], ['#technology', 'Technology'], ['#comfort', 'Comfort'], ['#specs', 'Specs']].map(([href, label]) => (
              <a key={href} href={href} onClick={() => setMenuOpen(false)}>{label}</a>
            ))}
            <Link href="/products/smart-toilet" className="x40-nav-cta" onClick={() => setMenuOpen(false)}>
              View All Products →
            </Link>
          </div>

          <button className="x40-hamburger" onClick={() => setMenuOpen(v => !v)} aria-label="Menu">
            <span /><span /><span />
          </button>
        </div>
      </nav>

      {/* ═══════════ HERO ═══════════ */}
      <section className="x40-hero">
        <video
          className="x40-hero-video"
          autoPlay muted loop playsInline
          poster="/x40/product-main.jpg"
        >
          <source src="/x40/x40.mp4" type="video/mp4" />
        </video>
        <div className="x40-hero-overlay" />
        <div className="x40-hero-content x40-animate-up">
          <p className="x40-hero-eyebrow">JOMOO — Introducing</p>
          <h1 className="x40-hero-title">X40</h1>
          <p className="x40-hero-lead">The intelligent smart toilet.<br />Redefined for modern living.</p>
          <div className="x40-hero-actions">
            <a href="#features" className="x40-btn x40-btn--white">Explore Features</a>
            <Link href="/products/smart-toilet" className="x40-btn x40-btn--ghost">View Products</Link>
          </div>
        </div>
        <div className="x40-scroll-indicator">
          <span />
        </div>
      </section>

      {/* ═══════════ TAGLINE ═══════════ */}
      <section className="x40-tagline x40-reveal">
        <p className="x40-tagline-text">
          "Every detail engineered<br />for the moments that matter."
        </p>
        <p className="x40-tagline-sub">
          The X40 combines 26 intelligent features with a 640 mm compact footprint —
          bringing luxury, hygiene, and silent performance to any bathroom.
        </p>
      </section>

      {/* ═══════════ STATS STRIP ═══════════ */}
      <section className="x40-stats" id="specs">
        {[
          { num: 640,  suffix: 'mm', label: 'Ultra-Compact Depth' },
          { num: 38,   suffix: 'dB', label: 'Maximum Flush Noise' },
          { num: 26,   suffix: '',   label: 'Intelligent Features' },
          { num: 99,   suffix: '%',  label: 'Bacteria Eliminated' },
        ].map(({ num, suffix, label }, i) => (
          <div key={label} className={`x40-stat x40-reveal`} style={{ transitionDelay: `${i * 0.1}s` }}>
            <div className="x40-stat-num">
              <StatCounter target={num} suffix={suffix} />
            </div>
            <div className="x40-stat-label">{label}</div>
          </div>
        ))}
      </section>

      {/* ═══════════ PRODUCT HERO SHOT ═══════════ */}
      <section className="x40-product-shot x40-reveal">
        <div className="x40-product-shot-inner">
          <div className="x40-product-shot-text">
            <span className="x40-eyebrow">Design</span>
            <h2 className="x40-section-title">Crafted for space.<br />Built for beauty.</h2>
            <p className="x40-body-text">
              At just 640 mm deep, the X40 fits where conventional smart toilets cannot.
              The seamless glaze surface repels stains and bacteria — a product that looks
              as pristine on day 1,000 as it did on day one.
            </p>
            <div className="x40-product-feat-row">
              <div>
                <img src="/x40/compact-640.gif" alt="640mm compact" style={{ width: 80, height: 'auto', opacity: 0.85 }} />
                <span>640mm footprint</span>
              </div>
              <div>
                <img src="/x40/seamless-interior.png" alt="Seamless interior" style={{ width: 80, height: 'auto', opacity: 0.85 }} />
                <span>Nano-glaze bowl</span>
              </div>
              <div>
                <img src="/x40/soft-close-lid.png" alt="Soft close" style={{ width: 80, height: 'auto', opacity: 0.85 }} />
                <span>Soft-close lid</span>
              </div>
            </div>
          </div>
          <div className="x40-product-shot-img">
            <Image
              src="/x40/product-alt.png"
              alt="JOMOO X40 Smart Toilet"
              width={600}
              height={700}
              style={{ width: '100%', height: 'auto', objectFit: 'contain' }}
            />
          </div>
        </div>
      </section>

      {/* ═══════════ FEATURE BENTO GRID ═══════════ */}
      <section className="x40-features" id="features">
        <div className="x40-sec-inner">
          <div className="x40-sec-header x40-reveal">
            <span className="x40-eyebrow">Intelligence</span>
            <h2 className="x40-section-title">26 features.<br />One seamless experience.</h2>
          </div>

          <div className="x40-bento">
            {FEATURES.map(({ img, en, ja, desc }, i) => (
              <div
                key={en}
                className="x40-bento-card x40-reveal"
                style={{ transitionDelay: `${(i % 4) * 0.08}s` }}
              >
                <div className="x40-bento-img-wrap">
                  <img src={img} alt={en} />
                </div>
                <div className="x40-bento-body">
                  <div className="x40-bento-labels">
                    <span className="x40-bento-en">{en}</span>
                    <span className="x40-bento-ja">{ja}</span>
                  </div>
                  <p className="x40-bento-desc">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ TECHNOLOGY DEEP-DIVE ═══════════ */}
      <section className="x40-tech" id="technology">
        <div className="x40-sec-inner">
          <div className="x40-sec-header x40-reveal">
            <span className="x40-eyebrow">Technology</span>
            <h2 className="x40-section-title">Engineered to<br />outlast expectation.</h2>
          </div>

          {/* Row 1: Cyclone flush */}
          <div className="x40-tech-row x40-reveal">
            <div className="x40-tech-img-col">
              <img src="/x40/cyclone-flush.jpg" alt="Cyclone Flush" />
            </div>
            <div className="x40-tech-text-col">
              <span className="x40-eyebrow">Flush System</span>
              <h3>Cyclone Flush Technology</h3>
              <p>
                Spiral water jets scour the entire inner surface in a single 3.8 L flush.
                The result: a mathematically cleaner bowl using 87% less water than a conventional toilet.
              </p>
              <div className="x40-tech-stats">
                <div><strong>3.8<small>L</small></strong><span>Per flush</span></div>
                <div><strong>38<small>dB</small></strong><span>Maximum noise</span></div>
                <div><strong>87<small>%</small></strong><span>Water saved</span></div>
              </div>
            </div>
          </div>

          {/* Row 2: UV + Platinum (reversed) */}
          <div className="x40-tech-row x40-tech-row--rev x40-reveal">
            <div className="x40-tech-img-col">
              <img src="/x40/uv-sterilize.jpg" alt="UV Sterilization" />
            </div>
            <div className="x40-tech-text-col">
              <span className="x40-eyebrow">Hygiene System</span>
              <h3>UV + Platinum Protection</h3>
              <p>
                A built-in UV lamp sterilises the bowl before and after each use.
                The platinum catalyst deodoriser converts odour molecules into harmless
                water vapour — no sprays, no chemicals, no compromise.
              </p>
              <div className="x40-tech-stats">
                <div><strong>99.9<small>%</small></strong><span>Bacteria eliminated</span></div>
                <div><strong>0<small>s</small></strong><span>Reaction time</span></div>
                <div><strong>24<small>h</small></strong><span>Active protection</span></div>
              </div>
            </div>
          </div>

          {/* Row 3: Auto lid + foot sensor */}
          <div className="x40-tech-row x40-reveal">
            <div className="x40-tech-img-col">
              <img src="/x40/auto-lid.jpg" alt="Auto Lid" />
            </div>
            <div className="x40-tech-text-col">
              <span className="x40-eyebrow">Smart Sensing</span>
              <h3>Touch-Free Automation</h3>
              <p>
                Proximity sensors open the lid as you approach and close it when you leave.
                The foot-activated flush panel means your hands never touch the toilet.
                Power-outage mode ensures manual flush always works.
              </p>
              <ul className="x40-check-list">
                {['Auto-open lid on approach', 'Foot-sensor flush + lid toggle', 'Auto-flush on departure', 'Emergency flush during power outage'].map(f => (
                  <li key={f}><span className="x40-check">✓</span>{f}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ COMFORT GRID ═══════════ */}
      <section className="x40-comfort" id="comfort">
        <div className="x40-sec-inner">
          <div className="x40-sec-header x40-reveal">
            <span className="x40-eyebrow">Personal Care</span>
            <h2 className="x40-section-title">Comfort,<br />precisely calibrated.</h2>
            <p className="x40-sec-sub">
              Six wash modes — each adjustable in pressure, temperature, and position —
              adapt to every member of the household.
            </p>
          </div>

          <div className="x40-comfort-grid">
            {COMFORT.map(({ img, en, ja, desc }, i) => (
              <div key={en} className="x40-comfort-card x40-reveal" style={{ transitionDelay: `${(i % 3) * 0.1}s` }}>
                <div className="x40-comfort-img">
                  <img src={img} alt={en} />
                </div>
                <div className="x40-comfort-body">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <strong>{en}</strong>
                    <span style={{ fontSize: 12, color: '#666', fontFamily: 'ui-monospace,monospace' }}>{ja}</span>
                  </div>
                  <p>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ POWER-OUTAGE / MISC ═══════════ */}
      <section className="x40-misc x40-reveal">
        <div className="x40-sec-inner">
          <div className="x40-misc-grid">
            {[
              { img: '/x40/power-outage-flush.jpg', title: 'Power-Outage Flush', body: 'A dedicated manual flush valve keeps the toilet functional even during a blackout.' },
              { img: '/x40/auto-descale.jpg',       title: 'Auto Descaling',     body: 'Automated needle descaling dissolves limescale deposits inside the nozzle.' },
              { img: '/x40/nozzle-clean.png',       title: 'Self-Clean Nozzle',  body: 'The nozzle pre-rinses itself before and after every use without prompting.' },
              { img: '/x40/antibacterial.jpg',      title: 'Dual Antibacterial', body: 'Both the seat ring and spray nozzle are treated with antibacterial coating.' },
            ].map(({ img, title, body }, i) => (
              <div key={title} className="x40-misc-card x40-reveal" style={{ transitionDelay: `${i * 0.1}s` }}>
                <div className="x40-misc-img"><img src={img} alt={title} /></div>
                <strong>{title}</strong>
                <p>{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ CTA ═══════════ */}
      <section className="x40-cta">
        <div className="x40-cta-bg" />
        <div className="x40-cta-content x40-reveal">
          <span className="x40-eyebrow" style={{ color: 'rgba(255,255,255,0.6)' }}>JOMOO X40</span>
          <h2 className="x40-cta-title">Experience it<br />in person.</h2>
          <p className="x40-cta-body">
            Visit a JOMOO showroom to see the X40 in a live environment,
            or speak with a specialist to find the right configuration for your space.
          </p>
          <div className="x40-cta-actions">
            <Link href="/products/smart-toilet" className="x40-btn x40-btn--white">Explore All Models</Link>
            <a href="#" className="x40-btn x40-btn--ghost">Find a Showroom</a>
          </div>
        </div>
        <div className="x40-cta-img x40-reveal">
          <Image
            src="/x40/product-main.jpg"
            alt="JOMOO X40"
            width={520}
            height={620}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
      </section>

      {/* ═══════════ FOOTER ═══════════ */}
      <footer className="x40-footer">
        <div className="x40-footer-inner">
          <Image src="/logo.png" alt="JOMOO" width={100} height={30} style={{ objectFit: 'contain', opacity: 0.7 }} />
          <div className="x40-footer-links">
            <Link href="/products/smart-toilet">Products</Link>
            <a href="#">Showrooms</a>
            <a href="#">Support</a>
            <Link href="/register">Register</Link>
          </div>
          <p className="x40-footer-copy">© {new Date().getFullYear()} JOMOO JAPAN 株式会社. All rights reserved.</p>
        </div>
      </footer>

    </div>
  )
}
