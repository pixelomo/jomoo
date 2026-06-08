/* eslint-disable @next/next/no-img-element */
'use client'

import { useLayoutEffect, useRef } from 'react'
import './jomoo-homepage.css'

export default function JomooHomepage() {
  const navRef = useRef<HTMLElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const expandTextRef = useRef<HTMLDivElement>(null)
  const expandFrameRef = useRef<HTMLDivElement>(null)
  const statsGridRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    let ctx: { revert: () => void } | null = null

    const init = async () => {
      const { default: gsap } = await import('gsap')
      const { ScrollTrigger } = await import('gsap/ScrollTrigger')
      gsap.registerPlugin(ScrollTrigger)

      // Try to play the video
      const video = videoRef.current
      if (video) {
        video.play().catch(() => {/* autoplay blocked, no action needed */})
      }

      ctx = gsap.context(() => {
        // ── Nav scroll state ──────────────────────────────
        const nav = navRef.current
        if (nav) {
          ScrollTrigger.create({
            trigger: '.hp-hero',
            start: 'bottom top+=84',
            onEnter: () => nav.classList.add('scrolled'),
            onLeaveBack: () => nav.classList.remove('scrolled'),
          })
        }

        gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', () => {
          // ── Hero video scrub ───────────────────────────
          if (video) {
            const scrubVideo = () => {
              const dur = video.duration || 6
              gsap.to(video, {
                currentTime: dur,
                ease: 'none',
                scrollTrigger: {
                  trigger: '.hp-hero',
                  start: 'top top',
                  end: 'bottom top',
                  scrub: true,
                },
              })
            }
            if (video.readyState >= 1) {
              scrubVideo()
            } else {
              video.addEventListener('loadedmetadata', scrubVideo, { once: true })
            }
            // Dim slightly on scroll
            gsap.to(video, {
              opacity: 0.5,
              ease: 'none',
              scrollTrigger: {
                trigger: '.hp-hero',
                start: 'top top',
                end: 'bottom top',
                scrub: true,
              },
            })
          }

          // ── Hero headline fades out ──────────────────
          gsap.to('.hp-hero-headline', {
            y: -50, opacity: 0, ease: 'none',
            scrollTrigger: { trigger: '.hp-hero', start: 'top top', end: 'bottom top', scrub: true },
          })

          // ── World: scattered images fade in ──────────
          gsap.from('.hp-world-img', {
            opacity: 0, y: 30, stagger: 0.18, duration: 0.9, ease: 'power2.out',
            scrollTrigger: { trigger: '.hp-world', start: 'top 90%', once: true },
          })

          // ── Amazing: float parallax (punchy range) ───
          document.querySelectorAll('.hp-float').forEach((el) => {
            const from = parseFloat((el as HTMLElement).dataset.from || '0')
            const to = parseFloat((el as HTMLElement).dataset.to || '0')
            gsap.fromTo(el, { yPercent: from }, {
              yPercent: to, ease: 'none',
              scrollTrigger: {
                trigger: '.hp-amazing',
                start: 'top bottom',
                end: 'bottom top',
                scrub: 0.6,
              },
            })
          })
          gsap.to('.hp-float', {
            opacity: 1, duration: 0.8, stagger: 0.12, ease: 'power2.out',
            scrollTrigger: { trigger: '.hp-amazing', start: 'top 65%', once: true },
          })

          // ── Expand: CSS sticky + GSAP dimensions ──────
          const expandText = expandTextRef.current
          const expandFrame = expandFrameRef.current
          if (expandText && expandFrame) {
            const expandTl = gsap.timeline({
              scrollTrigger: {
                trigger: '.hp-expand',
                start: 'top top',
                end: 'bottom bottom',
                scrub: 1,
              },
            })
            expandTl
              .to(expandText, { opacity: 0, y: -20, duration: 0.25, ease: 'none' }, 0)
              .fromTo(expandFrame,
                { width: 960, height: 540, borderRadius: 14 },
                { width: () => window.innerWidth, height: () => window.innerHeight, borderRadius: 0, ease: 'none', duration: 1 },
                0
              )
          }

          // ── Cards: reveal + parallax ───────────────────
          document.querySelectorAll('.hp-card').forEach((card) => {
            const img = card.querySelector('.hp-card-img img') as HTMLElement | null
            const meta = card.querySelector('.hp-card-meta') as HTMLElement | null
            if (img && meta) {
              gsap.timeline({ scrollTrigger: { trigger: card, start: 'top 78%', once: true } })
                .to(img, { scale: 1, opacity: 1, duration: 0.9, ease: 'cubic-bezier(0.25,0.46,0.45,0.94)' })
                .to(meta, { y: 0, opacity: 1, duration: 0.7, ease: 'power2.out' }, 0.2)
              gsap.fromTo(img, { yPercent: -4 }, {
                yPercent: 4, ease: 'none',
                scrollTrigger: { trigger: card, start: 'top bottom', end: 'bottom top', scrub: true },
              })
            }
          })

          // ── Stats: count up ────────────────────────────
          const statsGrid = statsGridRef.current
          if (statsGrid) {
            document.querySelectorAll('.hp-stat').forEach((stat, i) => {
              const numEl = stat.querySelector('.hp-val') as HTMLElement | null
              const sufEl = stat.querySelector('.hp-suf') as HTMLElement | null
              const target = parseFloat((stat as HTMLElement).dataset.target || '0')
              const obj = { v: 0 }
              ScrollTrigger.create({
                trigger: statsGrid,
                start: 'top 72%',
                once: true,
                onEnter: () => {
                  gsap.to(obj, {
                    v: target, duration: 2, delay: i * 0.08, ease: 'power2.out',
                    onUpdate: () => {
                      if (numEl) numEl.textContent = Math.round(obj.v).toLocaleString('ja-JP')
                    },
                    onComplete: () => {
                      if (sufEl) {
                        gsap.fromTo(sufEl,
                          { opacity: 0, scale: 0.4 },
                          { opacity: 1, scale: 1, duration: 0.4, ease: 'back.out(2)' }
                        )
                      }
                    },
                  })
                },
              })
            })
          }
        })
      })
    }

    init()
    return () => ctx?.revert()
  }, [])

  return (
    <div className="jomoo-hp">
      {/* ── HEADER ─────────────────────────────────────── */}
      <header className="hp-nav" id="hp-nav" ref={navRef}>
        <div className="hp-nav-inner">
          <div className="hp-logo">JOMOO</div>
          <nav>
            <ul className="hp-nav-links">
              <li><a href="#hp-products">商品情報</a></li>
              <li><a href="#hp-inspiration">インスピレーション</a></li>
              <li><a href="#hp-about">会社情報</a></li>
              <li><a href="#hp-contact">お問い合わせ</a></li>
            </ul>
          </nav>
          <div className="hp-nav-icons">
            <button aria-label="言語">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
                <circle cx="12" cy="12" r="9" />
                <path d="M3 12h18M12 3c2.5 2.6 2.5 15.4 0 18M12 3c-2.5 2.6-2.5 15.4 0 18" />
              </svg>
            </button>
            <button aria-label="検索">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* ── HERO + WORLD wrapper (video stays sticky) ─── */}
      <div className="hp-hero-world-wrapper">
        {/* ── HERO ──────────────────────────────────────── */}
        <section className="hp-hero" id="hp-top">
          <div className="hp-hero-media">
            <video
              ref={videoRef}
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
            >
              <source src="/videos/hero.webm" type="video/webm" />
              <source src="/videos/hero.mp4" type="video/mp4" />
            </video>
          </div>
          <h1 className="hp-hero-headline">美しい水まわりが、暮らしを変える。</h1>
          <div className="hp-scroll-cue" />
        </section>

        {/* ── WORLD OF JOMOO ──────────────────────────── */}
        <section className="hp-world" id="hp-inspiration">
          <div className="hp-world-sticky">
            {/* Scattered images — fade in over hero video */}
            <div className="hp-world-img hp-world-img-1">
              <img src="/images/product-x40c-toilet-lid-screen.jpg" alt="X40-C smart toilet" />
            </div>
            <div className="hp-world-img hp-world-img-2">
              <img src="/images/lifestyle-bathroom-luxury-collection.jpg" alt="Luxury bathroom" />
            </div>
            <div className="hp-world-img hp-world-img-3">
              <img src="/images/lifestyle-shower-dark-dramatic.jpg" alt="Dramatic shower" />
            </div>
            <div className="hp-world-img hp-world-img-4">
              <img src="/images/lifestyle-bathroom-marble-wide.jpg" alt="Marble bathroom" />
            </div>

            {/* Text overlay — bottom left */}
            <div className="hp-world-overlay">
              <span className="hp-eyebrow">THE WORLD OF JOMOO</span>
              <h2>美しさと<br />快適さの世界を<br />あなたに</h2>
              <p>私たちJOMOOは、水まわり空間の可能性を追求し続けています。先進技術と洗練されたデザインを融合させ、一人ひとりの暮らしに新しい快適さと心地よさを届けること。それがJOMOOの考えるものづくりです。</p>
              <p>その想いは、製品単体ではなく、空間全体の心地よさへとつながっています。毎日使う場所だからこそ、より美しく、より快適に。JOMOOは新しい暮らしの価値を提案します。</p>
            </div>
          </div>
        </section>
      </div>

      {/* ── AMAZING EXPERIENCE ──────────────────────────── */}
      <section className="hp-amazing" id="hp-products">
        {/* Floating transparent PNG cut-outs
            vanity:  top-left, above toilet, offset right
            toilet:  left side, primary product
            faucet:  top-right, offset left from edge
            shower:  bottom-right
        */}
        <div className="hp-float" data-from="30" data-to="-55"
          style={{ left: '18%', top: '5%', width: 190, height: 190, transform: 'rotate(3deg)' }}>
          <img src="/images/product-vanity-unit.png" alt="Vanity unit" />
        </div>
        <div className="hp-float" data-from="40" data-to="-25"
          style={{ left: '6%', top: '35%', width: 270, height: 270, transform: 'rotate(-4deg)' }}>
          <img src="/images/product-x40b-toilet.png" alt="X40-B toilet" />
        </div>
        <div className="hp-float" data-from="20" data-to="-55"
          style={{ right: '16%', top: '4%', width: 165, height: 265, transform: 'rotate(6deg)' }}>
          <img src="/images/product-faucet-chrome.png" alt="Chrome faucet" />
        </div>
        <div className="hp-float" data-from="50" data-to="-10"
          style={{ right: '6%', top: '52%', width: 210, height: 350, transform: 'rotate(-8deg)' }}>
          <img src="/images/product-shower-set-chrome.png" alt="Shower set" />
        </div>

        <div className="hp-amazing-head">
          <div className="col">
            <span className="hp-eyebrow">AMAZING EXPERIENCE</span>
            <h2>「水まわり」に<br />驚きを</h2>
            <p>JOMOOは幅広い製品カテゴリーを通じて、住空間全体をトータルでデザインしています。機能性だけでなく、空間としての美しさまで追求した製品群が、新しいライフスタイルを提案します。</p>
          </div>
        </div>
      </section>

      {/* ── SMART TOILET — expand on scroll ─────────────── */}
      <section className="hp-expand">
        <div className="hp-expand-sticky">
          <div className="hp-expand-frame" ref={expandFrameRef}>
            <img src="/images/lifestyle-toilet-luxury-warmlit.jpg" alt="Luxury warm-lit bathroom" />
            <div className="hp-expand-text" ref={expandTextRef}>
              <span>SMART</span>
              <span>TOILET</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── PRODUCT CARDS ───────────────────────────────── */}
      <section className="hp-products">
        <div className="hp-products-inner">
          <div className="hp-products-head">
            <div>
              <span className="hp-eyebrow">SMART TOILET</span>
              <h2>スマートトイレの<br />キャッチコピー<br />キャッチコピー</h2>
            </div>
            <div className="body">スマートトイレの説明スマートトイレの説明スマートトイレの説明スマートトイレの説明スマートトイレの説明スマートトイレの説明スマートトイレの説明スマートトイレの。</div>
          </div>

          <div className="hp-cards">
            <article className="hp-card">
              <div className="hp-card-img">
                <img src="/images/lifestyle-toilet-ocean-dramatic.jpg" alt="JOMOO X40-B smart toilet" />
              </div>
              <div className="hp-card-meta">
                <span className="hp-eyebrow">SMART TOILET</span>
                <h3>X40-B</h3>
                <p>設置しているセンサーに反応して、自動で蓋が開閉したり、洗浄します。</p>
                <a className="hp-more" href="#">View More <span>→</span></a>
              </div>
            </article>
            <article className="hp-card">
              <div className="hp-card-img">
                <img src="/images/product-x40c-toilet-lid-screen.jpg" alt="JOMOO X40-C smart toilet" />
              </div>
              <div className="hp-card-meta">
                <span className="hp-eyebrow">SMART TOILET</span>
                <h3>X40-C</h3>
                <p>設置しているセンサーに反応して、自動で蓋が開閉したり、洗浄します。</p>
                <a className="hp-more" href="#">View More <span>→</span></a>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* ── GLOBAL STATS ─────────────────────────────────── */}
      <section className="hp-stats" id="hp-about">
        <div className="hp-stats-map">
          <img src="/images/bg-world-map-dots-dark.jpg" alt="" aria-hidden="true" />
        </div>
        <div className="hp-stats-inner">
          <div className="hp-stats-head">
            <div>
              <span className="hp-eyebrow">GLOBAL PRESENCE</span>
              <h2>世界が認める品質</h2>
            </div>
            <p>JOMOOは世界120以上の国と地域で展開し、数々の国際的なデザイン賞を受賞しています。積み重ねてきた技術と品質が、世界中の暮らしに選ばれています。</p>
          </div>

          <div className="hp-stats-grid" ref={statsGridRef}>
            <div className="hp-stat" data-target="120">
              <div className="hp-ico">
                <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.6 2.7 2.6 15.3 0 18M12 3c-2.6 2.7-2.6 15.3 0 18" /></svg>
              </div>
              <div className="hp-num"><span className="hp-val">0</span><span className="hp-suf">+</span></div>
              <div className="hp-lbl">展開国・地域数</div>
            </div>
            <div className="hp-stat" data-target="300000">
              <div className="hp-ico">
                <svg viewBox="0 0 24 24"><path d="M12 21s7-6.4 7-11a7 7 0 1 0-14 0c0 4.6 7 11 7 11Z" /><circle cx="12" cy="10" r="2.4" /></svg>
              </div>
              <div className="hp-num"><span className="hp-val">0</span><span className="hp-suf">+</span></div>
              <div className="hp-lbl">販売拠点数</div>
            </div>
            <div className="hp-stat" data-target="16">
              <div className="hp-ico">
                <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="6" /><path d="m20 20-4.5-4.5" /></svg>
              </div>
              <div className="hp-num"><span className="hp-val">0</span></div>
              <div className="hp-lbl">グローバル研究開発センター</div>
            </div>
            <div className="hp-stat" data-target="15">
              <div className="hp-ico">
                <svg viewBox="0 0 24 24"><path d="M4 20h16M6 20V9l5-3 2 3M13 20V12l5-2v10" /></svg>
              </div>
              <div className="hp-num"><span className="hp-val">0</span><span className="hp-suf">+</span></div>
              <div className="hp-lbl">ハイエンドスマートファクトリー</div>
            </div>
            <div className="hp-stat" data-target="350">
              <div className="hp-ico">
                <svg viewBox="0 0 24 24"><circle cx="12" cy="9" r="5" /><path d="m9 13-2 8 5-3 5 3-2-8" /></svg>
              </div>
              <div className="hp-num"><span className="hp-val">0</span><span className="hp-suf">+</span></div>
              <div className="hp-lbl">国際デザイン賞受賞数</div>
            </div>
            <div className="hp-stat" data-target="20000">
              <div className="hp-ico">
                <svg viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="13" rx="1.5" /><path d="M8 21l4-2 4 2M8 9h8M8 12h5" /></svg>
              </div>
              <div className="hp-num"><span className="hp-val">0</span><span className="hp-suf">+</span></div>
              <div className="hp-lbl">特許取得数</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────── */}
      <footer className="hp-footer" id="hp-contact">
        <div className="hp-footer-inner">
          <div className="hp-footer-top">
            <div className="hp-footer-brand">
              <div className="hp-logo">JOMOO</div>
              <div className="hp-socials">
                <a aria-label="Facebook" href="#">
                  <svg viewBox="0 0 24 24"><path d="M14 9h3V6h-3c-2 0-3 1-3 3v2H9v3h2v7h3v-7h2.2l.8-3H14V9.3c0-.2.1-.3.4-.3Z" /></svg>
                </a>
                <a aria-label="Instagram" href="#">
                  <svg viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="4" fill="none" stroke="currentColor" strokeWidth="1.6" /><circle cx="12" cy="12" r="3.4" fill="none" stroke="currentColor" strokeWidth="1.6" /><circle cx="16.5" cy="7.5" r="1" /></svg>
                </a>
                <a aria-label="YouTube" href="#">
                  <svg viewBox="0 0 24 24"><rect x="3" y="6" width="18" height="12" rx="3" /><path d="M10 9.5v5l4.5-2.5z" fill="#0A0A0A" /></svg>
                </a>
                <a aria-label="WeChat" href="#">
                  <svg viewBox="0 0 24 24"><ellipse cx="9.5" cy="9.5" rx="6" ry="5" /><ellipse cx="16" cy="15" rx="5" ry="4.2" fill="#0A0A0A" stroke="currentColor" strokeWidth="1.4" /></svg>
                </a>
                <a aria-label="LinkedIn" href="#">
                  <svg viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="2" /><path d="M8 10v7M8 7v.5M12 17v-4a2 2 0 0 1 4 0v4" fill="none" stroke="#0A0A0A" strokeWidth="1.6" /></svg>
                </a>
                <a aria-label="X" href="#">
                  <svg viewBox="0 0 24 24"><path d="M5 5l14 14M19 5 5 19" stroke="currentColor" strokeWidth="1.8" fill="none" /></svg>
                </a>
              </div>
            </div>
            <div className="hp-footer-cols">
              <div className="hp-footer-col">
                <h4>製品情報</h4>
                <ul>
                  <li><a href="#">スマートトイレ</a></li>
                  <li><a href="#">洗面化粧台</a></li>
                  <li><a href="#">水栓金具</a></li>
                  <li><a href="#">シャワーセット</a></li>
                </ul>
              </div>
              <div className="hp-footer-col">
                <h4>お問い合わせ</h4>
                <ul>
                  <li><a href="#">お客様相談窓口</a></li>
                  <li><a href="#">アフターサービスQ&amp;A</a></li>
                  <li><a href="#">施行動画&amp;チュートリアル</a></li>
                </ul>
              </div>
              <div className="hp-footer-col">
                <h4>インスピレーション</h4>
                <ul>
                  <li><a href="#">デザインストーリー</a></li>
                  <li><a href="#">プロジェクトショーケース</a></li>
                </ul>
              </div>
              <div className="hp-footer-col">
                <h4>会社概要</h4>
                <ul>
                  <li><a href="#">会社紹介</a></li>
                  <li><a href="#">ニュース&amp;ブログ</a></li>
                </ul>
              </div>
              <div className="hp-footer-col">
                <h4>その他</h4>
                <ul>
                  <li><a href="#">製品登録</a></li>
                  <li><a href="#">コスト計算</a></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="hp-footer-bottom">
            <div className="copy">© 2024 JOMOO KITCHEN &amp; BATH CO., LTD. All Rights Reserved.</div>
            <div className="hp-footer-legal">
              <a href="#">プライバシーポリシー</a>
              <a href="#">利用規約</a>
              <a href="#">サイトマップ</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
