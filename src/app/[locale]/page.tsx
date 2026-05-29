'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'

const FRAME_COUNT = 145
const FRAME_SPEED = 1.0
const IMAGE_SCALE = 0.88
const TOTAL_FRAMES_PATH = (i: number) =>
  `/x40/frames/frame_${String(i).padStart(4, '0')}.webp`

export default function X40Page() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const heroTextRef = useRef<HTMLDivElement>(null)
  const canvasWrapRef = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const loaderRef = useRef<HTMLDivElement>(null)
  const loaderBarRef = useRef<HTMLDivElement>(null)
  const loaderPctRef = useRef<HTMLSpanElement>(null)
  const navRef = useRef<HTMLElement>(null)

  useEffect(() => {
    /* ── Guards ── */
    const canvas = canvasRef.current
    const heroText = heroTextRef.current
    const canvasWrap = canvasWrapRef.current
    const overlay = overlayRef.current
    const loader = loaderRef.current
    const loaderBar = loaderBarRef.current
    const loaderPct = loaderPctRef.current
    const nav = navRef.current
    if (!canvas || !canvasWrap || !overlay || !loader || !nav) return

    const ctx = canvas.getContext('2d')!
    const frames: HTMLImageElement[] = []
    let currentFrame = 0
    let rafPending = false
    let bgColor = '#000000'

    /* ── DPR-aware canvas resize ── */
    function resizeCanvas() {
      if (!canvas) return
      const dpr = window.devicePixelRatio || 1
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
      canvas.style.width = window.innerWidth + 'px'
      canvas.style.height = window.innerHeight + 'px'
      ctx.scale(dpr, dpr)
      drawFrame(currentFrame)
    }

    /* ── Sample bg colour from frame corners ── */
    function sampleBgColor(img: HTMLImageElement) {
      try {
        const tmp = document.createElement('canvas')
        tmp.width = 4; tmp.height = 4
        const tc = tmp.getContext('2d')!
        tc.drawImage(img, 0, 0, 4, 4)
        const d = tc.getImageData(0, 0, 1, 1).data
        bgColor = `rgb(${d[0]},${d[1]},${d[2]})`
      } catch { bgColor = '#000' }
    }

    /* ── Draw a frame ── */
    function drawFrame(index: number) {
      const img = frames[index]
      if (!img?.complete || !img.naturalWidth) return
      const cw = window.innerWidth
      const ch = window.innerHeight
      const iw = img.naturalWidth
      const ih = img.naturalHeight
      const scale = Math.max(cw / iw, ch / ih) * IMAGE_SCALE
      const dw = iw * scale
      const dh = ih * scale
      const dx = (cw - dw) / 2
      const dy = (ch - dh) / 2
      ctx.fillStyle = bgColor
      ctx.fillRect(0, 0, cw, ch)
      ctx.drawImage(img, dx, dy, dw, dh)
    }

    /* ── Frame preloader ── */
    function loadFrame(i: number): Promise<void> {
      return new Promise(resolve => {
        const img = new window.Image()
        img.onload = () => { frames[i] = img; resolve() }
        img.onerror = () => resolve()
        img.src = TOTAL_FRAMES_PATH(i + 1)
      })
    }

    async function preloadFrames() {
      // Phase 1: first 10 frames fast
      await Promise.all(Array.from({ length: 10 }, (_, i) => loadFrame(i)))
      sampleBgColor(frames[0])
      drawFrame(0)
      if (loader) loader.style.opacity = '0'
      setTimeout(() => { if (loader) loader.style.display = 'none' }, 600)

      // Phase 2: rest in background
      let loaded = 10
      const remaining = Array.from({ length: FRAME_COUNT - 10 }, (_, i) => i + 10)
      for (const i of remaining) {
        await loadFrame(i)
        loaded++
        if (i % 20 === 0 && frames[i]) sampleBgColor(frames[i])
        const pct = Math.round((loaded / FRAME_COUNT) * 100)
        if (loaderBar) loaderBar.style.width = pct + '%'
        if (loaderPct) loaderPct.textContent = pct + '%'
      }
    }

    /* ── Lazy load GSAP + Lenis ── */
    let cleanup: (() => void) | undefined

    Promise.all([
      import('gsap'),
      import('gsap/ScrollTrigger'),
      import('lenis'),
    ]).then(([gsapMod, stMod, lenisMod]) => {
      const gsap = gsapMod.default || gsapMod.gsap
      const { ScrollTrigger } = stMod
      const Lenis = lenisMod.default

      gsap.registerPlugin(ScrollTrigger)

      /* Lenis smooth scroll */
      const lenis = new Lenis({
        duration: 1.2,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
      } as ConstructorParameters<typeof Lenis>[0])
      lenis.on('scroll', ScrollTrigger.update)
      gsap.ticker.add((time: number) => lenis.raf(time * 1000))
      gsap.ticker.lagSmoothing(0)

      /* Nav scroll detect */
      ScrollTrigger.create({
        trigger: document.body,
        start: 'top -60px',
        onEnter: () => nav.classList.add('x40-nav--scrolled'),
        onLeaveBack: () => nav.classList.remove('x40-nav--scrolled'),
      })

      const scrollEl = document.getElementById('x40-scroll')!

      /* ── Hero text fade-out ── */
      ScrollTrigger.create({
        trigger: scrollEl,
        start: 'top top',
        end: 'bottom bottom',
        scrub: true,
        onUpdate: (self) => {
          if (heroText) {
            heroText.style.opacity = String(Math.max(0, 1 - self.progress * 12))
          }
        },
      })

      /* ── Frame scroll binding ── */
      ScrollTrigger.create({
        trigger: scrollEl,
        start: 'top top',
        end: 'bottom bottom',
        scrub: true,
        onUpdate: (self) => {
          const accelerated = Math.min(self.progress * FRAME_SPEED, 1)
          const idx = Math.min(Math.floor(accelerated * FRAME_COUNT), FRAME_COUNT - 1)
          if (idx !== currentFrame) {
            currentFrame = idx
            if (!rafPending) {
              rafPending = true
              requestAnimationFrame(() => {
                drawFrame(currentFrame)
                rafPending = false
              })
            }
          }
        },
      })

      /* ── Dark overlay for stats section ── */
      const OVERLAY_ENTER = 0.54
      const OVERLAY_LEAVE = 0.67
      const FADE = 0.03
      ScrollTrigger.create({
        trigger: scrollEl,
        start: 'top top',
        end: 'bottom bottom',
        scrub: true,
        onUpdate: (self) => {
          const p = self.progress
          let op = 0
          if (p >= OVERLAY_ENTER - FADE && p < OVERLAY_ENTER)
            op = (p - (OVERLAY_ENTER - FADE)) / FADE
          else if (p >= OVERLAY_ENTER && p <= OVERLAY_LEAVE)
            op = 0.9
          else if (p > OVERLAY_LEAVE && p <= OVERLAY_LEAVE + FADE)
            op = 0.9 * (1 - (p - OVERLAY_LEAVE) / FADE)
          overlay.style.opacity = String(op)
        },
      })

      /* ── Section animations ── */
      const sections = document.querySelectorAll<HTMLElement>('.scroll-section[data-enter]')
      sections.forEach(section => {
        const enter = parseFloat(section.dataset.enter!) / 100
        const leave = parseFloat(section.dataset.leave!) / 100
        const animType = section.dataset.animation || 'fade-up'
        const persist = section.dataset.persist === 'true'

        const children = Array.from(
          section.querySelectorAll<HTMLElement>(
            '.section-label, .section-heading, .section-body, .section-note, .cta-btn, .stat'
          )
        )

        const tl = gsap.timeline({ paused: true })
        const dur = 0.9
        const stag = 0.12

        switch (animType) {
          case 'fade-up':
            tl.from(children, { y: 50, opacity: 0, stagger: stag, duration: dur, ease: 'power3.out' })
            break
          case 'slide-left':
            tl.from(children, { x: -80, opacity: 0, stagger: stag, duration: dur, ease: 'power3.out' })
            break
          case 'slide-right':
            tl.from(children, { x: 80, opacity: 0, stagger: stag, duration: dur, ease: 'power3.out' })
            break
          case 'scale-up':
            tl.from(children, { scale: 0.85, opacity: 0, stagger: stag, duration: 1.0, ease: 'power2.out' })
            break
          case 'rotate-in':
            tl.from(children, { y: 40, rotation: 3, opacity: 0, stagger: 0.1, duration: dur, ease: 'power3.out' })
            break
          case 'stagger-up':
            tl.from(children, { y: 60, opacity: 0, stagger: 0.15, duration: 0.8, ease: 'power3.out' })
            break
          case 'clip-reveal':
            tl.from(children, { clipPath: 'inset(100% 0 0 0)', opacity: 0, stagger: 0.15, duration: 1.2, ease: 'power4.inOut' })
            break
        }

        let played = false

        ScrollTrigger.create({
          trigger: scrollEl,
          start: 'top top',
          end: 'bottom bottom',
          scrub: false,
          onUpdate: (self) => {
            const p = self.progress
            const mid = (enter + leave) / 2
            const range = (leave - enter) / 2
            const dist = Math.abs(p - mid)
            const visible = dist < range

            if (visible && !played) {
              played = true
              tl.play()
            } else if (!visible && played && !persist) {
              played = false
              tl.reverse()
            }
          },
        })
      })

      /* ── Counter animations ── */
      document.querySelectorAll<HTMLElement>('.stat-number').forEach(el => {
        const target = parseFloat(el.dataset.value || '0')
        const decimals = parseInt(el.dataset.decimals || '0')
        gsap.from(el, {
          textContent: 0,
          duration: 2.2,
          ease: 'power1.out',
          snap: { textContent: decimals === 0 ? 1 : 0.01 },
          scrollTrigger: {
            trigger: el.closest('.scroll-section'),
            start: 'top 70%',
            toggleActions: 'play none none reverse',
          },
        })
      })

      /* ── Marquee ── */
      const marqueeWrap = document.querySelector<HTMLElement>('.marquee-wrap')
      const marqueeText = document.querySelector<HTMLElement>('.marquee-text')
      if (marqueeWrap && marqueeText) {
        gsap.to(marqueeText, {
          xPercent: -28,
          ease: 'none',
          scrollTrigger: {
            trigger: scrollEl,
            start: 'top top',
            end: 'bottom bottom',
            scrub: true,
          },
        })

        const MENTER = 0.76
        const MLEAVE = 0.88
        ScrollTrigger.create({
          trigger: scrollEl,
          start: 'top top',
          end: 'bottom bottom',
          scrub: true,
          onUpdate: (self) => {
            const p = self.progress
            let op = 0
            if (p >= MENTER && p < MENTER + 0.03) op = (p - MENTER) / 0.03
            else if (p >= MENTER + 0.03 && p <= MLEAVE - 0.03) op = 1
            else if (p > MLEAVE - 0.03 && p <= MLEAVE) op = 1 - (p - (MLEAVE - 0.03)) / 0.03
            marqueeWrap.style.opacity = String(op)
          },
        })
      }

      cleanup = () => {
        lenis.destroy()
        ScrollTrigger.killAll()
      }
    })

    /* ── Resize handler ── */
    window.addEventListener('resize', resizeCanvas)
    resizeCanvas()
    preloadFrames()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      cleanup?.()
    }
  }, [])

  return (
    <div className="x40-page">

      {/* ── Loader ── */}
      <div id="x40-loader" ref={loaderRef}>
        <div className="x40-loader-brand">
          <Image src="/logo.png" alt="JOMOO" width={120} height={36} style={{ objectFit: 'contain', opacity: 0.8 }} priority />
          <span>X40</span>
        </div>
        <div className="x40-loader-track">
          <div className="x40-loader-bar" ref={loaderBarRef} />
        </div>
        <span className="x40-loader-pct" ref={loaderPctRef}>0%</span>
      </div>

      {/* ── Fixed canvas wrap ── */}
      <div id="x40-canvas-wrap" ref={canvasWrapRef}>
        <canvas id="x40-canvas" ref={canvasRef} />
      </div>

      {/* ── Dark overlay (stats section) ── */}
      <div id="x40-dark-overlay" ref={overlayRef} />

      {/* ── Fixed nav ── */}
      <nav className="x40-nav" ref={navRef}>
        <div className="x40-nav-inner">
          <Link href="/" className="x40-logo-link">
            <Image src="/logo.png" alt="JOMOO" width={110} height={32} style={{ objectFit: 'contain' }} priority />
          </Link>
          <div className="x40-nav-links">
            {(['Features', 'Technology', 'Hygiene', 'Comfort'] as const).map(l => (
              <a key={l} href="#x40-scroll">{l}</a>
            ))}
            <Link href="/products/smart-toilet" className="x40-nav-cta">All Products →</Link>
          </div>
        </div>
      </nav>

      {/* ── Fixed hero text overlay (fades out on scroll) ── */}
      <div id="x40-hero-text" ref={heroTextRef}>
        <span className="section-label" style={{ marginBottom: 24 }}>001 / JOMOO JAPAN</span>
        <h1 className="x40-hero-title">X40</h1>
        <p className="x40-hero-tagline">The Intelligent Toilet.<br />Redefined.</p>
        <div className="x40-hero-scroll-hint">
          <span>scroll</span>
          <svg width="18" height="28" viewBox="0 0 18 28" fill="none">
            <rect x="1" y="1" width="16" height="26" rx="8" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
            <circle className="x40-scroll-dot-circle" cx="9" cy="9" r="2.5" fill="rgba(255,255,255,0.7)" />
          </svg>
        </div>
      </div>

      {/* ══════════════════════════════════
          SCROLL CONTAINER — 900vh
          Canvas shows through beneath
      ══════════════════════════════════ */}
      <div id="x40-scroll" style={{ position: 'relative', height: '900vh', zIndex: 3 }}>

        {/* 0–18%: pure video reveal, no text */}

        {/* Section 1 — Design (18–32%) */}
        <section
          className="scroll-section align-left"
          data-enter="18" data-leave="32" data-animation="slide-left"
          style={{ top: '25%', transform: 'translateY(-50%)' }}
        >
          <div className="section-inner">
            <span className="section-label">002 / Design</span>
            <h2 className="section-heading">640mm.<br />Every millimetre<br />earned.</h2>
            <p className="section-body">
              At just 640 mm deep, the X40 fits where conventional smart toilets
              cannot. Seamless nano-glaze repels stains and bacteria — beautiful
              on day one, still pristine on day one thousand.
            </p>
          </div>
        </section>

        {/* Section 2 — Flush (30–44%) */}
        <section
          className="scroll-section align-right"
          data-enter="30" data-leave="44" data-animation="slide-right"
          style={{ top: '37%', transform: 'translateY(-50%)' }}
        >
          <div className="section-inner">
            <span className="section-label">003 / Flush</span>
            <h2 className="section-heading">38 dB.<br />You&apos;ll never<br />hear it.</h2>
            <p className="section-body">
              Cyclone spiral jets scour the entire bowl in 3.8 L — 87 % less water
              than a conventional flush. The result is mathematically cleaner,
              measurably quieter.
            </p>
          </div>
        </section>

        {/* Section 3 — Hygiene (42–56%) */}
        <section
          className="scroll-section align-left"
          data-enter="42" data-leave="56" data-animation="scale-up"
          style={{ top: '49%', transform: 'translateY(-50%)' }}
        >
          <div className="section-inner">
            <span className="section-label">004 / Hygiene</span>
            <h2 className="section-heading">UV&nbsp;+&nbsp;Platinum.<br />99.9 % bacteria‑free.</h2>
            <p className="section-body">
              Built-in UV sterilises the bowl before and after each use. A platinum
              catalyst converts odour molecules into harmless water vapour — no
              chemicals, no sprays, no compromise.
            </p>
          </div>
        </section>

        {/* Section 4 — Stats (54–67%, dark overlay) */}
        <section
          className="scroll-section section-stats"
          data-enter="54" data-leave="67" data-animation="stagger-up"
          style={{ top: '60.5%', transform: 'translateY(-50%)' }}
        >
          <div className="stats-grid">
            {[
              { value: 640,  suffix: 'mm', label: 'Ultra-Compact Depth' },
              { value: 38,   suffix: 'dB', label: 'Max Flush Noise' },
              { value: 99,   suffix: '%',  label: 'Bacteria Eliminated' },
              { value: 26,   suffix: '',   label: 'Intelligent Features' },
            ].map(({ value, suffix, label }) => (
              <div key={label} className="stat">
                <div className="stat-row">
                  <span className="stat-number" data-value={value} data-decimals="0">{value}</span>
                  <span className="stat-suffix">{suffix}</span>
                </div>
                <span className="stat-label">{label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Section 5 — Comfort (65–78%) */}
        <section
          className="scroll-section align-right"
          data-enter="65" data-leave="78" data-animation="clip-reveal"
          style={{ top: '71.5%', transform: 'translateY(-50%)' }}
        >
          <div className="section-inner">
            <span className="section-label">006 / Comfort</span>
            <h2 className="section-heading">Six wash modes.<br />One ritual.</h2>
            <p className="section-body">
              Rear, feminine, wide, massage, relief — each adjustable in pressure,
              temperature, and position. The heated seat adapts to four seasons.
              Warm water is always instant.
            </p>
          </div>
        </section>

        {/* Section 6 — Marquee (76–88%) */}
        <div
          className="marquee-wrap scroll-section"
          style={{ top: '82%', transform: 'translateY(-50%)', width: '100%', opacity: 0 }}
        >
          <div className="marquee-text">
            INTELLIGENT&nbsp;·&nbsp;HYGIENIC&nbsp;·&nbsp;SILENT&nbsp;·&nbsp;PRECISE&nbsp;·&nbsp;INTELLIGENT&nbsp;·&nbsp;HYGIENIC&nbsp;·&nbsp;SILENT&nbsp;·&nbsp;PRECISE&nbsp;·&nbsp;INTELLIGENT&nbsp;·
          </div>
        </div>

        {/* Section 7 — CTA (86–100%, persists) */}
        <section
          className="scroll-section section-cta"
          data-enter="86" data-leave="100" data-animation="fade-up" data-persist="true"
          style={{ top: '93%', transform: 'translateY(-50%)' }}
        >
          <div className="cta-inner">
            <span className="section-label">008 / Experience</span>
            <h2 className="section-heading cta-heading">Discover<br />the X40.</h2>
            <p className="section-body section-note">
              Visit a JOMOO showroom or speak with a specialist to find your configuration.
            </p>
            <div className="cta-actions">
              <Link href="/products/smart-toilet" className="cta-btn cta-btn--white">View All Models →</Link>
              <a href="#" className="cta-btn cta-btn--ghost">Find a Showroom</a>
            </div>
          </div>
          <div className="cta-footer-bar">
            <Image src="/logo.png" alt="JOMOO" width={90} height={26} style={{ objectFit: 'contain', opacity: 0.5 }} />
            <div className="cta-footer-links">
              <Link href="/products/smart-toilet">Products</Link>
              <a href="#">Showrooms</a>
              <a href="#">Support</a>
              <Link href="/register">Register</Link>
            </div>
            <p>© {new Date().getFullYear()} JOMOO JAPAN 株式会社</p>
          </div>
        </section>

      </div>{/* end #x40-scroll */}
    </div>
  )
}
