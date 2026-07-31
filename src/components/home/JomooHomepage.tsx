/* eslint-disable @next/next/no-img-element */
'use client'

import { useEffect, useRef, useState } from 'react'
import SpotlightCarousel from './SpotlightCarousel'
import GlobalProjectsSection from './GlobalProjectsSection'
import DesignExcellenceSection from './DesignExcellenceSection'
import FooterCtaSection from './FooterCtaSection'
import './jomoo-homepage.css'

const HERO_SLIDES = [
  { type: 'image' as const, src: '/images/hero1.jpg' },
  { type: 'video' as const, src: '/images/02.mp4' },
  { type: 'image' as const, src: '/images/03.png' },
]

const HERO_SLIDE_MS = 6000
const HERO_NARROW_MAX_WIDTH = 700

function getHeroSlideCount(viewportWidth: number) {
  return viewportWidth <= HERO_NARROW_MAX_WIDTH ? 2 : HERO_SLIDES.length
}

function getStatStep(target: number) {
  if (target === 300000) return 10000
  if (target === 20000) return 1000
  if (target === 15 || target === 16) return 1
  if (target === 120 || target === 350) return 10
  return 1
}

const DESIGN_LOGOS = Array.from({ length: 7 }, (_, i) =>
  `/images/icon/jomoo_design_logo_${String(i + 1).padStart(5, '0')}.png`
)

export default function JomooHomepage() {
  const expandRef = useRef<HTMLElement>(null)
  const statsGridRef = useRef<HTMLDivElement>(null)
  const heroVideoRefs = useRef<(HTMLVideoElement | null)[]>([])
  const [heroSlide, setHeroSlide] = useState(0)
  const [heroSlideCount, setHeroSlideCount] = useState(HERO_SLIDES.length)

  useEffect(() => {
    function updateHeroSlideCount() {
      setHeroSlideCount(getHeroSlideCount(window.innerWidth))
    }

    updateHeroSlideCount()
    window.addEventListener('resize', updateHeroSlideCount)
    return () => window.removeEventListener('resize', updateHeroSlideCount)
  }, [])

  useEffect(() => {
    setHeroSlide((index) => (index >= heroSlideCount ? 0 : index))
  }, [heroSlideCount])

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return

    const interval = window.setInterval(() => {
      setHeroSlide((index) => (index + 1) % heroSlideCount)
    }, HERO_SLIDE_MS)

    return () => window.clearInterval(interval)
  }, [heroSlideCount])

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
        const numEl = stat.querySelector('.stat__val-num') as HTMLElement | null
        const sufEl = stat.querySelector('.stat__suf') as HTMLElement | null
        const target = parseFloat((stat as HTMLElement).dataset.target || '0')
        if (numEl) numEl.textContent = Math.round(target).toLocaleString('ja-JP')
        if (sufEl) {
          sufEl.style.opacity = '1'
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

          const featureCards = gsap.utils.toArray<HTMLElement>('.feature__card')

          featureCards.forEach((el) => {
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

          const statCards = gsap.utils.toArray<HTMLElement>('.stat')

          statCards.forEach((el) => {
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
            const stats = Array.from(
              document.querySelectorAll<HTMLElement>('.stat[data-target]')
            )
            const statAnimations = stats.map(() => ({
              obj: { n: 0 },
              tween: null as gsap.core.Tween | null,
            }))

            function resetStats() {
              stats.forEach((stat, i) => {
                const numEl = stat.querySelector('.stat__val-num') as HTMLElement | null
                const sufEl = stat.querySelector('.stat__suf') as HTMLElement | null
                const anim = statAnimations[i]

                anim.tween?.kill()
                anim.tween = null
                anim.obj.n = 0

                if (numEl) numEl.textContent = '0'
                if (sufEl) {
                  gsap.killTweensOf(sufEl)
                  gsap.set(sufEl, { opacity: 0 })
                }
              })
            }

            function playStats() {
              stats.forEach((stat, i) => {
                const numEl = stat.querySelector('.stat__val-num') as HTMLElement | null
                const sufEl = stat.querySelector('.stat__suf') as HTMLElement | null
                const target = parseFloat(stat.dataset.target || '0')
                const step = getStatStep(target)
                const totalSteps = target / step
                const anim = statAnimations[i]

                anim.tween?.kill()
                anim.obj.n = 0
                if (numEl) numEl.textContent = '0'
                if (sufEl) {
                  gsap.killTweensOf(sufEl)
                  gsap.set(sufEl, { opacity: 0 })
                }

                anim.tween = gsap.to(anim.obj, {
                  n: totalSteps,
                  duration: 3.5,
                  delay: i * 0.1,
                  ease: 'power1.inOut',
                  onUpdate: () => {
                    if (!numEl) return
                    const value = Math.min(target, Math.round(anim.obj.n) * step)
                    numEl.textContent = value.toLocaleString('ja-JP')
                  },
                  onComplete: () => {
                    if (numEl) numEl.textContent = target.toLocaleString('ja-JP')
                    if (sufEl) {
                      gsap.fromTo(
                        sufEl,
                        { opacity: 0 },
                        { opacity: 1, duration: 0.35, ease: 'power2.out' }
                      )
                    }
                  },
                })
              })
            }

            const trigger = ScrollTrigger.create({
              trigger: statsGrid,
              start: 'top 88%',
              onEnter: playStats,
              onLeaveBack: resetStats,
            })

            gsapCleanups.push(() => {
              trigger.kill()
              statAnimations.forEach((anim) => anim.tween?.kill())
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
            const slideClassName = [
              'hero__slide',
              isActive && 'is-active',
              index === 2 && 'hero__slide--wide-only',
            ]
              .filter(Boolean)
              .join(' ')

            if (slide.type === 'video') {
              return (
                <div key={slide.src} className={slideClassName}>
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
              <div key={slide.src} className={slideClassName}>
                {/* The first slide is the hero's largest paint — fetch it ahead
                    of the queue rather than letting it wait behind the video. */}
                <img
                  src={slide.src}
                  alt=""
                  fetchPriority={index === 0 ? 'high' : undefined}
                />
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
                  日常の、<br />
                  その先へ。
                </h2>
                <div className="world__rule" aria-hidden="true" />
                <div className="world__body">
                  <p>
                    JOMOOは、世界で培った<br />
                    テクノロジーとデザインで、<br />
                    心地よいバスルーム空間を<br />
                    創造します。
                  </p>
                </div>
                <p className="world__body world__body--secondary world__body--secondary-intro">
                  スマートトイレから広がる、<br />
                  新しい暮らしの体験を<br />
                  お届けします。
                </p>
              </div>

              <div className="world__photos">
                <figure className="world__photo world__photo--hero">
                  <img src="/images/world1.jpg" alt="" />
                </figure>
                <figure className="world__photo world__photo--forest">
                  <img src="/images/world2n.jpg" alt="" />
                </figure>
                <figure className="world__photo world__photo--shower">
                  <img src="/images/world3n.jpg" alt="" />
                </figure>
              </div>
            </div>

            <div className="world__lower">
              <figure className="world__figure world__figure--bathroom">
                <img src="/images/world4.jpg" alt="" />
              </figure>
              <p className="world__body world__body--secondary world__body--secondary-lower">
                スマートトイレから広がる、<br />
                新しい暮らしの体験を<br />
                お届けします。
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
      <section className="feature feature--animate" data-nav="light" id="feature">
        <div className="feature__inner">
          <div className="feature__head reveal">
            <div className="feature__eyebrow">SMART TOILET LINEUP</div>
            <h2 className="feature__title">あなたの空間に、最適な一台を。</h2>
            <div className="feature__rule" aria-hidden="true" />
            <p className="feature__subtitle">
              ライフスタイルや空間に合わせて選べる、
              <br />
              JOMOOのスマートトイレラインナップ。
            </p>
          </div>

          <div className="feature__grid">
            <a
              href="/products/smart-toilet/x40-b"
              className="feature__card"
              aria-label="X40-B の詳細を見る"
            >
              <div className="feature__media">
                <img
                  className="feature__img feature__img--default"
                  src="/images/X-40-B.jpeg"
                  alt="JOMOO X40-B smart toilet"
                />
                <img
                  className="feature__img feature__img--hover"
                  src="/images/X40-hover.jpeg"
                  alt=""
                  aria-hidden="true"
                />
              </div>
              <div className="feature__content">
                <span className="feature__pill">SMART TOILET</span>
                <h3 className="feature__name">X40-B</h3>
                <p className="feature__desc">
                  設置しているセンサーに反応して、
                  自動で蓋が開閉したり、洗浄します。
                </p>
                <span className="feature__more">詳しく見る&gt;</span>
              </div>
            </a>
            <a
              href="/products/smart-toilet/x40-c"
              className="feature__card"
              aria-label="X40-C の詳細を見る"
            >
              <div className="feature__media">
                <img
                  className="feature__img feature__img--default"
                  src="/images/X-40-C.jpeg"
                  alt="JOMOO X40-C smart toilet"
                />
                <img
                  className="feature__img feature__img--hover"
                  src="/images/X40-hover.jpeg"
                  alt=""
                  aria-hidden="true"
                />
              </div>
              <div className="feature__content">
                <span className="feature__pill">SMART TOILET</span>
                <h3 className="feature__name">X40-C</h3>
                <p className="feature__desc">
                  世界で多くの賞を獲得したデザインチームによる革新的なデザインです。
                </p>
                <span className="feature__more">詳しく見る&gt;</span>
              </div>
            </a>
          </div>
        </div>
      </section>

      <GlobalProjectsSection />

      {/* STATS */}
      <section className="stats stats--animate" data-nav="light">
        <div className="stats__inner">
          <div className="stats__grid" ref={statsGridRef}>
            <div className="stat" data-target="120">
              <div className="stat__top">
                <div className="stat__icon">
                  <img src="/images/icon/icon_00001.png" alt="" />
                </div>
                <div className="stat__label">展開国・地域数</div>
              </div>
              <div className="stat__num">
                <span className="stat__val">
                  <span className="stat__val-num">0</span>
                  <span className="stat__suf">+</span>
                </span>
              </div>
            </div>
            <div className="stat" data-target="300000">
              <div className="stat__top">
                <div className="stat__icon">
                  <img src="/images/icon/icon_00002.png" alt="" />
                </div>
                <div className="stat__label">販売拠点数</div>
              </div>
              <div className="stat__num">
                <span className="stat__val">
                  <span className="stat__val-num">0</span>
                  <span className="stat__suf">+</span>
                </span>
              </div>
            </div>
            <div className="stat" data-target="350">
              <div className="stat__top">
                <div className="stat__icon">
                  <img src="/images/icon/icon_00003.png" alt="" />
                </div>
                <div className="stat__label">
                  国際デザイン賞
                  <br />
                  受賞数
                </div>
              </div>
              <div className="stat__num">
                <span className="stat__val">
                  <span className="stat__val-num">0</span>
                  <span className="stat__suf">+</span>
                </span>
              </div>
            </div>
            <div className="stat" data-target="16">
              <div className="stat__top">
                <div className="stat__icon">
                  <img src="/images/icon/icon_00004.png" alt="" />
                </div>
                <div className="stat__label">
                  グローバル研究
                  <br />
                  開発センター
                </div>
              </div>
              <div className="stat__num">
                <span className="stat__val">
                  <span className="stat__val-num">0</span>
                </span>
              </div>
            </div>
            <div className="stat" data-target="15">
              <div className="stat__top">
                <div className="stat__icon">
                  <img src="/images/icon/icon_00005.png" alt="" />
                </div>
                <div className="stat__label">ハイエンドスマートファクトリー</div>
              </div>
              <div className="stat__num">
                <span className="stat__val">
                  <span className="stat__val-num">0</span>
                </span>
              </div>
            </div>
            <div className="stat" data-target="20000">
              <div className="stat__top">
                <div className="stat__icon">
                  <img src="/images/icon/icon_00006.png" alt="" />
                </div>
                <div className="stat__label">特許取得数</div>
              </div>
              <div className="stat__num">
                <span className="stat__val">
                  <span className="stat__val-num">0</span>
                  <span className="stat__suf">+</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="design-logos" data-nav="light" aria-label="Design awards">
        <div className="design-logos__inner">
          <div className="design-logos__card">
            {DESIGN_LOGOS.map((src, index) => (
              <div key={src} className="design-logos__segment">
                <div className="design-logos__item">
                  <img src={src} alt="" />
                </div>
                {index < DESIGN_LOGOS.length - 1 ? (
                  <span className="design-logos__divider" aria-hidden="true" />
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </section>

      <DesignExcellenceSection />

      <FooterCtaSection />

    </div>
  )
}
