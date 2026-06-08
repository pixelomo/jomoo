'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'

const FRAME_COUNT = 240        // 10s @ 24fps
const FRAME_SPEED = 1.0        // linear 1:1 mapping of frames across the full scroll
const IMAGE_SCALE = 1.0   // true cover — no padded black band at top/bottom
const BATCH = 20               // lazy-load images in batches of 20
const pad = (i: number) => String(i).padStart(4, '0')
const FRAME_PATH = (i: number) => `/x40/frames/frame_${pad(i)}.webp`

export default function X40Page() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const heroTextRef = useRef<HTMLDivElement>(null)
  const canvasWrapRef = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const loaderRef = useRef<HTMLDivElement>(null)
  const loaderContentRef = useRef<HTMLDivElement>(null)
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
    const loaderContent = loaderContentRef.current
    const frames: HTMLImageElement[] = []      // single forward set, scrubbed both ways
    let currentFrame = 0
    let rafPending = false
    let bgColor = '#000000'
    let loadedCount = 0

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

    /* ── Resolve the image for a given index. Scrubbing the single forward set
          backwards is exactly the reverse playback, so no second set is needed.
          Falls back to the nearest loaded neighbour so the canvas never blanks. ── */
    function pickImage(index: number): HTMLImageElement | undefined {
      const ready = (img?: HTMLImageElement) => img?.complete && img.naturalWidth > 0
      if (ready(frames[index])) return frames[index]
      for (let d = 1; d < FRAME_COUNT; d++) {
        if (ready(frames[index - d])) return frames[index - d]
        if (ready(frames[index + d])) return frames[index + d]
      }
      return undefined
    }

    /* ── Draw a frame ──
          Desktop: cover (fills viewport).
          Mobile (<768px): contain + ~2.5rem black padding so the whole frame
          is visible small, rather than cropping to a central vertical strip. ── */
    function drawFrame(index: number) {
      const img = pickImage(index)
      if (!img) return
      const cw = window.innerWidth
      const ch = window.innerHeight
      const iw = img.naturalWidth
      const ih = img.naturalHeight
      let scale: number
      if (cw < 768) {
        const pad = 40 // ~2.5rem of black padding around the frame
        const availW = Math.max(1, cw - pad * 2)
        const availH = Math.max(1, ch - pad * 2)
        scale = Math.min(availW / iw, availH / ih)
      } else {
        scale = Math.max(cw / iw, ch / ih) * IMAGE_SCALE
      }
      const dw = iw * scale
      const dh = ih * scale
      const dx = (cw - dw) / 2
      const dy = (ch - dh) / 2
      ctx.fillStyle = cw < 768 ? '#000' : bgColor
      ctx.fillRect(0, 0, cw, ch)
      ctx.drawImage(img, dx, dy, dw, dh)
    }

    /* ── Single image loader ── */
    function loadImage(i: number): Promise<void> {
      return new Promise(resolve => {
        if (frames[i]) return resolve()
        const img = new window.Image()
        img.onload = () => { frames[i] = img; resolve() }
        img.onerror = () => resolve()
        img.src = FRAME_PATH(i + 1)
      })
    }

    /* ── Batch loader (20 frames per batch), idempotent ── */
    const batches = new Set<number>()
    function loadBatch(b: number): Promise<void> {
      if (b < 0 || b * BATCH >= FRAME_COUNT || batches.has(b)) return Promise.resolve()
      batches.add(b)
      const start = b * BATCH
      const end = Math.min(start + BATCH, FRAME_COUNT)
      const proms: Promise<void>[] = []
      for (let i = start; i < end; i++) proms.push(loadImage(i))
      return Promise.all(proms).then(() => {
        loadedCount = batches.size * BATCH
        const pct = Math.min(100, Math.round((loadedCount / FRAME_COUNT) * 100))
        if (loaderBar) loaderBar.style.width = pct + '%'
        if (loaderPct) loaderPct.textContent = pct + '%'
      })
    }

    /* ── Reveal the site with an expanding see-through circular hole ── */
    function revealSite() {
      if (loaderContent) loaderContent.style.opacity = '0'
      const start = performance.now()
      const dur = 1100
      const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
      function step(now: number) {
        if (!loader) return
        const t = Math.min((now - start) / dur, 1)
        const hole = ease(t) * 160          // transparent hole grows 0% → 160%
        const edge = hole + 6
        const mask = `radial-gradient(circle at 50% 50%, transparent ${hole}%, #000 ${edge}%)`
        loader.style.webkitMaskImage = mask
        loader.style.maskImage = mask
        if (t < 1) requestAnimationFrame(step)
        else loader.style.display = 'none'
      }
      requestAnimationFrame(step)
    }

    /* ── Initial load: draw frame 0 fast, then preload ALL frames (in batches
          of 20) before revealing — eliminates scroll stutter in both directions. ── */
    async function preloadFrames() {
      const totalBatches = Math.ceil(FRAME_COUNT / BATCH)
      await loadBatch(0)
      if (frames[0]) sampleBgColor(frames[0])
      drawFrame(0)
      for (let b = 1; b < totalBatches; b++) {
        await loadBatch(b)
      }
      revealSite()
    }

    /* ── Keep batches around `index` warm (covers fast scrolling either way) ── */
    function ensureLoaded(index: number) {
      const b = Math.floor(index / BATCH)
      loadBatch(b - 1)
      loadBatch(b)
      loadBatch(b + 1)
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

      /* ── Frame scroll binding (direction-aware + lazy batch loading) ── */
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
            ensureLoaded(idx)
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
        const dur = 0.5
        const stag = 0.07

        switch (animType) {
          case 'fade-up':
            tl.from(children, { y: 36, opacity: 0, stagger: stag, duration: dur, ease: 'power3.out' })
            break
          case 'slide-left':
            tl.from(children, { x: -60, opacity: 0, stagger: stag, duration: dur, ease: 'power3.out' })
            break
          case 'slide-right':
            tl.from(children, { x: 60, opacity: 0, stagger: stag, duration: dur, ease: 'power3.out' })
            break
          case 'scale-up':
            tl.from(children, { scale: 0.9, opacity: 0, stagger: stag, duration: dur, ease: 'power2.out' })
            break
          case 'rotate-in':
            tl.from(children, { y: 30, rotation: 2, opacity: 0, stagger: stag, duration: dur, ease: 'power3.out' })
            break
          case 'stagger-up':
            tl.from(children, { y: 40, opacity: 0, stagger: stag, duration: dur, ease: 'power3.out' })
            break
          case 'clip-reveal':
            tl.from(children, { clipPath: 'inset(100% 0 0 0)', opacity: 0, stagger: stag, duration: 0.6, ease: 'power3.inOut' })
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

        const MENTER = 0.78
        const MLEAVE = 0.89
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

      {/* ── Loader (spinner + expanding see-through hole reveal) ── */}
      <div id="x40-loader" ref={loaderRef}>
        <div className="x40-loader-content" ref={loaderContentRef}>
          <div className="x40-loader-spinner" />
          <div className="x40-loader-brand">
            <Image src="/logo.png" alt="JOMOO" width={120} height={36} style={{ objectFit: 'contain', opacity: 0.8 }} priority />
            <span>X40</span>
          </div>
          <div className="x40-loader-track">
            <div className="x40-loader-bar" ref={loaderBarRef} />
          </div>
          <span className="x40-loader-pct" ref={loaderPctRef}>0%</span>
        </div>
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
            {(['機能', 'テクノロジー', '衛生', 'コンフォート'] as const).map(l => (
              <a key={l} href="#x40-scroll">{l}</a>
            ))}
            <Link href="/products/smart-toilet" className="x40-nav-cta">全製品を見る →</Link>
          </div>
        </div>
      </nav>

      {/* ── Fixed hero text overlay (fades out on scroll) ── */}
      <div id="x40-hero-text" ref={heroTextRef}>
        <h1 className="x40-hero-title">X40</h1>
        <p className="x40-hero-tagline">インテリジェント・トイレ。<br />再定義。</p>
        <div className="x40-hero-scroll-hint">
          <span>スクロール</span>
          <svg width="18" height="28" viewBox="0 0 18 28" fill="none">
            <rect x="1" y="1" width="16" height="26" rx="8" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
            <circle className="x40-scroll-dot-circle" cx="9" cy="9" r="2.5" fill="rgba(255,255,255,0.7)" />
          </svg>
        </div>
      </div>

      {/* ══════════════════════════════════
          SCROLL CONTAINER — 1500vh
          (proportional to 10s video: 900vh × 10/6 = 1500vh)
          FRAME_SPEED 1.0 → frame index maps 1:1 across scroll, so each
          section is paced to what is happening on screen at that moment.
      ══════════════════════════════════ */}
      <div id="x40-scroll" style={{ position: 'relative', height: '1500vh', zIndex: 3 }}>

        {/* 0–10% (0–1s): pure reveal — the lid begins to rise */}

        {/* Section 1 — Auto-open lid · 0–2s lid rising open (11–22%) */}
        <section
          className="scroll-section align-left"
          data-enter="11" data-leave="22" data-animation="slide-left"
          style={{ top: '16%', transform: 'translateY(-50%)' }}
        >
          <div className="section-inner">
            <span className="section-label">002 / オートオープン</span>
            <h2 className="section-heading">近づくと、ふたが、<br />静かに開く。</h2>
            <p className="section-body">
              人感センサーがあなたを検知し、ふたと便座がなめらかに、自動で開きます。
              触れることなく迎え入れる——X40の体験は、この一瞬から始まります。
            </p>
          </div>
        </section>

        {/* Section 2 — Heated seat · 2–5s warm amber glow (24–37%) */}
        <section
          className="scroll-section align-right"
          data-enter="24" data-leave="37" data-animation="slide-right"
          style={{ top: '30%', transform: 'translateY(-50%)' }}
        >
          <div className="section-inner">
            <span className="section-label">003 / 温感シート</span>
            <h2 className="section-heading">座る前から、<br />ぬくもりが灯っている。</h2>
            <p className="section-body">
              便座のリムから広がる、ほのかな温かみ。四季に応じて温度を自動で整える温熱シートが、
              どんな朝も、どんな夜も、心地よく迎えます。
            </p>
          </div>
        </section>

        {/* Section 3 — Bidet precision · 3–5s nozzle extends (39–49%) */}
        <section
          className="scroll-section align-left"
          data-enter="39" data-leave="49" data-animation="scale-up"
          style={{ top: '44%', transform: 'translateY(-50%)' }}
        >
          <div className="section-inner">
            <span className="section-label">004 / 精密洗浄</span>
            <h2 className="section-heading">ノズルが伸び、<br />狙いを定める。</h2>
            <p className="section-body">
              クロム仕上げのビデノズルが、リムの奥から静かに前進。水圧・水温・位置はすべて個別に調整でき、
              清潔さを思いのままにコントロールします。
            </p>
          </div>
        </section>

        {/* Section 4 — Cyclone flush · 5–7s vortex flush (51–67%) */}
        <section
          className="scroll-section align-right"
          data-enter="51" data-leave="67" data-animation="clip-reveal"
          style={{ top: '59%', transform: 'translateY(-50%)' }}
        >
          <div className="section-inner">
            <span className="section-label">005 / サイクロン洗浄</span>
            <h2 className="section-heading">澄んだ水が、<br />渦を巻き消えてゆく。</h2>
            <p className="section-body">
              クリスタルブルーの水流が螺旋を描き、わずか3.8Lで便器全体を洗い流します。
              38dBの静けさのまま、汚れも、音も、残しません。
            </p>
          </div>
        </section>

        {/* Stats · 7–8s camera pulls back to the product (70–80%) — content unchanged */}
        <section
          className="scroll-section section-stats"
          data-enter="70" data-leave="80" data-animation="stagger-up"
          style={{ top: '75%', transform: 'translateY(-50%)' }}
        >
          <div className="stats-grid">
            {[
              { value: 640,  suffix: 'mm', label: '超コンパクト設計' },
              { value: 38,   suffix: 'dB', label: '最大洗浄音' },
              { value: 99,   suffix: '%',  label: '除菌率' },
              { value: 26,   suffix: '',   label: 'スマート機能' },
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

        {/* Marquee · 8–9s (78–89%) */}
        <div
          className="marquee-wrap scroll-section"
          style={{ top: '84%', transform: 'translateY(-50%)', width: '100%', opacity: 0 }}
        >
          <div className="marquee-text">
            インテリジェント&nbsp;·&nbsp;清潔&nbsp;·&nbsp;静音&nbsp;·&nbsp;精密&nbsp;·&nbsp;インテリジェント&nbsp;·&nbsp;清潔&nbsp;·&nbsp;静音&nbsp;·&nbsp;精密&nbsp;·&nbsp;インテリジェント&nbsp;·&nbsp;清潔&nbsp;·&nbsp;静音&nbsp;·&nbsp;
          </div>
        </div>

        {/* CTA · 9–10s lid closes, the product sits immaculate (89–100%, persists) */}
        <section
          className="scroll-section section-cta"
          data-enter="89" data-leave="100" data-animation="fade-up" data-persist="true"
          style={{ top: 'auto', bottom: 0, height: '100vh', width: '100%' }}
        >
          <div className="cta-inner">
            <span className="section-label">006 / 体験</span>
            <h2 className="section-heading cta-heading">ふたが閉じ、<br />すべてが整う。</h2>
            <p className="section-body section-note">
              一連の動作を終え、X40は静かに佇む。この洗練された体験を、あなた自身の毎日へ。
              JOMOOショールームで、最適な一台をご提案します。
            </p>
            <div className="cta-actions">
              <Link href="/products/smart-toilet" className="cta-btn cta-btn--white">全モデルを見る →</Link>
              <a href="#" className="cta-btn cta-btn--ghost">ショールームを探す</a>
            </div>
          </div>
          <div className="cta-footer-bar">
            <Image src="/logo.png" alt="JOMOO" width={90} height={26} style={{ objectFit: 'contain', opacity: 0.5 }} />
            <div className="cta-footer-links">
              <Link href="/products/smart-toilet">製品</Link>
              <a href="#">ショールーム</a>
              <a href="#">サポート</a>
              <Link href="/register">製品登録</Link>
            </div>
            <p>© {new Date().getFullYear()} JOMOO JAPAN 株式会社</p>
          </div>
        </section>

      </div>{/* end #x40-scroll */}
    </div>
  )
}
