/* eslint-disable @next/next/no-img-element */
'use client'

import { useEffect, useRef, useState } from 'react'
import SpotlightCarousel from './SpotlightCarousel'
import './jomoo-homepage.css'

const HERO_SLIDES = [
  { type: 'video' as const, src: '/images/01.mov' },
  { type: 'video' as const, src: '/images/02.mp4' },
  { type: 'image' as const, src: '/images/03.png' },
]

const HERO_SLIDE_MS = 6000

export default function JomooHomepage() {
  const expandRef = useRef<HTMLElement>(null)
  const statsGridRef = useRef<HTMLDivElement>(null)
  const heroVideoRefs = useRef<(HTMLVideoElement | null)[]>([])
  const [heroSlide, setHeroSlide] = useState(0)

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return

    const interval = window.setInterval(() => {
      setHeroSlide((index) => (index + 1) % HERO_SLIDES.length)
    }, HERO_SLIDE_MS)

    return () => window.clearInterval(interval)
  }, [])

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    heroVideoRefs.current.forEach((video, index) => {
      if (!video) return

      if (prefersReducedMotion) {
        video.pause()
        return
      }

      if (index === heroSlide && HERO_SLIDES[index].type === 'video') {
        video.muted = true
        video.playsInline = true
        video.currentTime = 0
        void video.play().catch(() => {})
        return
      }

      video.pause()
    })
  }, [heroSlide])

  function handleHeroVideoReady(index: number) {
    if (index !== heroSlide) return
    const video = heroVideoRefs.current[index]
    if (!video) return
    video.muted = true
    void video.play().catch(() => {})
  }

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const reveals = document.querySelectorAll('.reveal')
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('is-in')
            io.unobserve(e.target)
          }
        })
      },
      { threshold: 0.05, rootMargin: '0px 0px -40px 0px' }
    )
    reveals.forEach((el) => io.observe(el))

    const parallaxEls = Array.from(document.querySelectorAll('[data-parallax]')) as HTMLElement[]

    function applyParallax() {
      if (prefersReducedMotion) return
      const vh = window.innerHeight
      parallaxEls.forEach((el) => {
        const rect = el.getBoundingClientRect()
        const elH = rect.height || 1
        const span = vh + elH
        const p = (vh - rect.top) / span
        const t = Math.max(-0.3, Math.min(1.3, p)) - 0.5
        const speed = parseFloat(el.dataset.parallax ?? '0.15')
        const drift = parseFloat(el.dataset.drift ?? '0')
        const ty = -t * speed * 220
        const tx = Math.sin(t * Math.PI) * drift
        el.style.transform = `translate3d(${tx.toFixed(2)}px, ${ty.toFixed(2)}px, 0)`
      })
    }

    const expand = expandRef.current

    let ticking = false
    function onScroll() {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        applyParallax()
        ticking = false
      })
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    onScroll()

    const statsGrid = statsGridRef.current
    const gsapCleanups: Array<() => void> = []

    function setStatFinalValues() {
      document.querySelectorAll('.stat[data-target]').forEach((stat) => {
        const numEl = stat.querySelector('.stat__val') as HTMLElement | null
        const sufEl = stat.querySelector('.stat__suf') as HTMLElement | null
        const target = parseFloat((stat as HTMLElement).dataset.target || '0')
        if (numEl) numEl.textContent = Math.round(target).toLocaleString('ja-JP')
        if (sufEl) {
          sufEl.style.opacity = '1'
          sufEl.style.transform = 'scale(1)'
        }
      })
    }

    if (statsGrid) {
      if (prefersReducedMotion) {
        setStatFinalValues()
      }
    }

    if (!prefersReducedMotion) {
      import('gsap').then(({ default: gsap }) => {
        import('gsap/ScrollTrigger').then(({ ScrollTrigger }) => {
          gsap.registerPlugin(ScrollTrigger)

          const worldImages = gsap.utils.toArray<HTMLElement>(
            '.world__photo, .world__figure--bathroom'
          )

          worldImages.forEach((el) => {
            const tween = gsap.fromTo(
              el,
              { opacity: 0, y: 48 },
              {
                opacity: 1,
                y: 0,
                ease: 'power1.out',
                scrollTrigger: {
                  trigger: el,
                  start: 'top 92%',
                  end: 'top 58%',
                  scrub: 0.8,
                },
              }
            )

            gsapCleanups.push(() => {
              tween.scrollTrigger?.kill()
              tween.kill()
            })
          })

          const expandLabel = document.querySelector('.expand__label') as HTMLElement | null
          if (expandLabel && expand) {
            const labelTween = gsap.fromTo(
              expandLabel,
              { opacity: 0, y: 96 },
              {
                opacity: 1,
                y: 0,
                ease: 'power1.out',
                scrollTrigger: {
                  trigger: expand,
                  start: 'top top+=128',
                  end: 'top top',
                  scrub: 0.8,
                  invalidateOnRefresh: true,
                },
              }
            )

            gsapCleanups.push(() => {
              labelTween.scrollTrigger?.kill()
              labelTween.kill()
            })

            ScrollTrigger.refresh()
          }

          if (statsGrid) {
            document.querySelectorAll('.stat[data-target]').forEach((stat, i) => {
              const numEl = stat.querySelector('.stat__val') as HTMLElement | null
              const sufEl = stat.querySelector('.stat__suf') as HTMLElement | null
              const target = parseFloat((stat as HTMLElement).dataset.target || '0')
              const obj = { v: 0 }
              const trigger = ScrollTrigger.create({
                trigger: statsGrid,
                start: 'top 88%',
                once: true,
                onEnter: () => {
                  gsap.to(obj, {
                    v: target,
                    duration: 2,
                    delay: i * 0.07,
                    ease: 'power2.out',
                    onUpdate: () => {
                      if (numEl) numEl.textContent = Math.round(obj.v).toLocaleString('ja-JP')
                    },
                    onComplete: () => {
                      if (sufEl) {
                        gsap.fromTo(
                          sufEl,
                          { opacity: 0, scale: 0.4 },
                          { opacity: 1, scale: 1, duration: 0.35, ease: 'back.out(2)' }
                        )
                      }
                    },
                  })
                },
              })
              gsapCleanups.push(() => trigger.kill())
            })
          }
        })
      })
    }

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      io.disconnect()
      gsapCleanups.forEach((fn) => fn())
    }
  }, [])

  return (
    <div>

      {/* HERO */}
      <header
        className={['hero', heroSlide === 1 && 'hero--control']
          .filter(Boolean)
          .join(' ')}
      >
        <div className="hero__carousel" aria-hidden="true">
          {HERO_SLIDES.map((slide, index) => {
            const isActive = index === heroSlide

            if (slide.type === 'video') {
              return (
                <div
                  key={slide.src}
                  className={`hero__slide${isActive ? ' is-active' : ''}`}
                >
                  <video
                    ref={(el) => {
                      heroVideoRefs.current[index] = el
                    }}
                    src={slide.src}
                    autoPlay={isActive}
                    muted
                    playsInline
                    loop
                    preload={isActive ? 'auto' : 'metadata'}
                    onLoadedData={() => handleHeroVideoReady(index)}
                    onCanPlay={() => handleHeroVideoReady(index)}
                  />
                </div>
              )
            }

            return (
              <div
                key={slide.src}
                className={`hero__slide${isActive ? ' is-active' : ''}`}
              >
                <img src={slide.src} alt="" />
              </div>
            )
          })}
        </div>
        <div className="site-container">
          <div
            className={[
              'hero__content',
              heroSlide === 1 && 'hero__content--control',
              heroSlide === 2 && 'hero__content--hidden',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {heroSlide === 0 && (
              <>
                <p className="hero__eyebrow">SMART TOILET</p>
                <h1 className="hero__title hero__title--logo">
                  <img src="/images/x40.svg" alt="X40" />
                </h1>
                <p className="hero__subtitle">超静音スマートトイレ</p>
                <p className="hero__tagline">
                  静けさが、<br />
                  暮らしを変える。
                </p>
                <div className="hero__awards">
                  <img
                    className="hero__award"
                    src="/images/award1.png"
                    alt="スマートトイレ / 販売台数 世界NO.1"
                  />
                  <img
                    className="hero__award"
                    src="/images/award2.png"
                    alt="iF デザインアワード / バスルーム業界受賞数 世界NO.1"
                  />
                </div>
              </>
            )}

            {heroSlide === 1 && (
              <>
                <p className="hero__eyebrow">SMART CONTROL</p>
                <h1 className="hero__title hero__title--jp">
                  水を、<br />
                  思いのままに。
                </h1>
                <p className="hero__tagline hero__tagline--control">
                  スマートテクロノジーの活用により<br />
                  暮らしに、快適さや利便性を<br />
                  与えます。
                </p>
              </>
            )}
          </div>
        </div>
      </header>

      {/* WORLD OF JOMOO */}
      <section className="world world--animate" id="world" data-nav="light">
        <div className="site-container">
          <div className="world__stage">
            <div className="world__upper">
              <div className="world__intro">
                <div className="world__eyebrow">THE WORLD OF JOMOO</div>
                <h2 className="world__title">
                  使うたび、<br />
                  優しさに包まれる<br />
                  極上の体験を
                </h2>
                <div className="world__rule" aria-hidden="true" />
                <div className="world__body">
                  <p>
                    JOMOOは創業以来、<br />
                    グローバル展開を続け<br />
                    スマートバスブランドの<br />
                    トップメーカーとして<br />
                    世界中のユーザーに<br />
                    &ldquo;快適な暮らし&rdquo;を届けています。
                  </p>
                </div>
              </div>

              <div className="world__photos">
                <figure className="world__photo world__photo--hero">
                  <img src="/images/world1.jpg" alt="" />
                </figure>
                <figure className="world__photo world__photo--forest">
                  <img src="/images/world2.jpg" alt="" />
                </figure>
                <figure className="world__photo world__photo--shower">
                  <img src="/images/world3.jpg" alt="" />
                </figure>
              </div>
            </div>

            <div className="world__lower">
              <figure className="world__figure world__figure--bathroom">
                <img src="/images/world4.jpg" alt="" />
              </figure>
              <p className="world__body world__body--secondary">
                欧州の名門デザインスタジオや<br />
                世界有数のテクノロジー企業との<br />
                連携による技術革新で<br />
                「スマートな暮らしの実現」を<br />
                目指しています。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SMART TOILET SCROLL-EXPAND */}
      <section className="expand expand--animate" ref={expandRef}>
        <div className="expand__stage">
          <img className="expand__media" src="/images/smart.jpg" alt="Smart toilet in luxury interior" />
          <div className="expand__shade" />
          <div className="expand__label">SMART TOILET</div>
        </div>
      </section>

      <SpotlightCarousel />

      {/* FEATURE ROW */}
      <section className="feature" data-nav="light" id="feature">
        <div className="feature__inner">
          <div className="feature__head">
            <div className="reveal reveal--left">
              <div className="feature__eyebrow">SMART TOILET</div>
              <h2 className="feature__title">
                スマートトイレの<br />
                キャッチコピー<br />
                キャッチコピー
              </h2>
            </div>
            <div className="feature__body reveal reveal--right">
              <p>
                スマートトイレの説明スマートトイレの説明スマートトイレの説明スマートトイレの説明
                スマートトイレの説明スマートトイレの説明スマートトイレの説明スマートトイレの
              </p>
              <p style={{ marginTop: '16px' }}>
                スマートトイレの説明スマートトイレの説明スマートトイレの説明
                スマートトイレの説明スマートトイレの説明スマートトイレの説明スマートトイレの
              </p>
            </div>
          </div>

          <div className="feature__grid">
            <div className="feature__card reveal">
              <img className="feature__img" src="/images/world-col2.jpg" alt="Smart toilet by city view" />
              <div className="feature__sku">SMART TOILET</div>
              <div className="feature__name">X40-C</div>
              <p className="feature__desc">
                設置しているセンサーに反応して、
                自動で蓋が開閉したり、洗浄します。
              </p>
              <a href="#" className="feature__more">View More</a>
            </div>
            <div className="feature__card reveal">
              <img className="feature__img" src="/images/world-col3.jpg" alt="Smart toilet ocean view" />
              <div className="feature__sku">SMART TOILET</div>
              <div className="feature__name">X40-B</div>
              <p className="feature__desc">
                設置しているセンサーに反応して、
                自動で蓋が開閉したり、洗浄します。
              </p>
              <a href="#" className="feature__more">View More</a>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="stats" data-nav="light">
        <div className="stats__inner">
          <div className="stats__head">
            <div className="reveal reveal--left">
              <div className="feature__eyebrow">GLOBAL PRESENCE</div>
              <h2 className="stats__title">世界が認める品質</h2>
            </div>
            <div className="stats__body reveal reveal--right">
              <p>
                JOMOOは世界120以上の国と地域で展開し、
                数々の国際的なデザイン賞を受賞しています。
                積み重ねてきた技術と品質が、
                世界中の暮らしに選ばれています。
              </p>
            </div>
          </div>

          <div className="stats__grid" ref={statsGridRef}>
            <div className="stat reveal" data-target="120">
              <div className="stat__icon">
                <svg viewBox="0 0 24 24"><path d="M3 21V9l9-6 9 6v12" /><path d="M9 21v-7h6v7" /></svg>
              </div>
              <div className="stat__num">
                <span className="stat__val">0</span>
                <span className="stat__suf">+</span>
              </div>
              <div className="stat__label">展開国・地域数</div>
            </div>
            <div className="stat reveal" data-target="300000">
              <div className="stat__icon">
                <svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></svg>
              </div>
              <div className="stat__num">
                <span className="stat__val">0</span>
                <span className="stat__suf">+</span>
              </div>
              <div className="stat__label">販売拠点数</div>
            </div>
            <div className="stat reveal" data-target="16">
              <div className="stat__icon">
                <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" /></svg>
              </div>
              <div className="stat__num">
                <span className="stat__val">0</span>
              </div>
              <div className="stat__label">グローバル研究開発センター</div>
            </div>
            <div className="stat reveal" data-target="15">
              <div className="stat__icon">
                <svg viewBox="0 0 24 24"><path d="M12 3 4 7v7a8 8 0 0 0 16 0V7Z" /></svg>
              </div>
              <div className="stat__num">
                <span className="stat__val">0</span>
                <span className="stat__suf">+</span>
              </div>
              <div className="stat__label">ハイエンドスマートファクトリー</div>
            </div>
            <div className="stat reveal" data-target="350">
              <div className="stat__icon">
                <svg viewBox="0 0 24 24"><path d="M3 12h4l3-9 4 18 3-9h4" /></svg>
              </div>
              <div className="stat__num">
                <span className="stat__val">0</span>
                <span className="stat__suf">+</span>
              </div>
              <div className="stat__label">国際デザイン賞受賞数</div>
            </div>
            <div className="stat reveal" data-target="20000">
              <div className="stat__icon">
                <svg viewBox="0 0 24 24"><rect x="3" y="6" width="18" height="13" rx="2" /><path d="M8 6V4h8v2" /></svg>
              </div>
              <div className="stat__num">
                <span className="stat__val">0</span>
                <span className="stat__suf">+</span>
              </div>
              <div className="stat__label">特許取得数</div>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}
