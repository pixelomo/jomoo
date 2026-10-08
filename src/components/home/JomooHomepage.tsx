/* eslint-disable @next/next/no-img-element */
'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import Lines from '@/components/Lines'
import SpotlightCarousel, { type SpotlightSlide } from './SpotlightCarousel'
import GlobalProjectsSection, { type GlobalSlide } from './GlobalProjectsSection'
import DesignExcellenceSection, { type LaneImage } from './DesignExcellenceSection'
import './jomoo-homepage.css'

/** One product card in the lineup — the same card the series page draws. */
export interface LineupCard {
  key: string
  /** Absent for a 近日発売 product: the card is not a link. */
  href?: string
  pill: string
  name: string
  image: string
  hover?: string
  tagline: string[]
  desc: string
}

/**
 * Everything the client edits on the top page, from the homePage document,
 * resolved on the server to plain strings, line arrays and URLs.
 */
export interface HomeContent {
  heroProduct: {
    image?: string
    eyebrow: string
    logo?: string
    logoAlt: string
    subtitle: string
    tagline: string[]
    awards: { src: string; alt: string }[]
    footnotes: string[]
  }
  heroVideo: { src?: string; eyebrow: string; title: string[]; tagline: string[] }
  heroBrand: { background?: string; foreground?: string; note: string }
  world: {
    eyebrow: string
    title: string[]
    /** Each paragraph as its lines. */
    body: string[][]
    closing: string[]
    main?: string
    forest?: string
    shower?: string
    bathroom?: string
  }
  expand: { image?: string; alt: string; label: string }
  spotlight: SpotlightSlide[]
  lineup: { eyebrow: string; title: string; subtitle: string[]; cards: LineupCard[] }
  projects: { eyebrow: string; title: string; subtitle: string[]; cta: string; slides: GlobalSlide[] }
  stats: { key: string; label: string[]; softBreak: boolean; value: number; suffix: string; icon?: string }[]
  awardLogos: string[]
  design: {
    eyebrow: string
    title: string[]
    subtitle: string[]
    button: string
    lane1: LaneImage[]
    lane2: LaneImage[]
  }
}

const HERO_SLIDE_MS = 6000

/**
 * How far the counter moves per tick: a tenth of the figure's leading digit's
 * place, so 300,000 climbs in 10,000s, 410 in 10s and 16 in 1s — the same
 * cadence the hand-picked steps had, for whatever figure the client enters.
 */
function getStatStep(target: number) {
  if (target < 100) return 1
  return 10 ** (Math.floor(Math.log10(target)) - 1)
}

export default function JomooHomepage({
  content,
  closing,
}: {
  content: HomeContent
  /** The catalog and contact cards — a server component, so passed in. */
  closing: ReactNode
}) {
  const { heroProduct, heroVideo, heroBrand, world, expand, lineup, stats } = content

  /**
   * The third slide is two layers rather than one flattened image: the scene
   * fills the frame like any other slide, while the GLOBAL No.1 lockup sits
   * over it at full width so it scales with the window instead of being
   * cropped by object-fit: cover. That is what lets it run on a phone, where
   * the flattened version had to be hidden.
   */
  const heroSlides = [
    { type: 'image' as const, src: heroProduct.image },
    { type: 'video' as const, src: heroVideo.src },
    { type: 'split' as const, src: heroBrand.background, fg: heroBrand.foreground },
  ]

  const expandRef = useRef<HTMLElement>(null)
  const statsGridRef = useRef<HTMLDivElement>(null)
  const heroVideoRefs = useRef<(HTMLVideoElement | null)[]>([])
  const [heroSlide, setHeroSlide] = useState(0)
  const heroSlideCount = heroSlides.length

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return

    // Re-armed on every change, including a pagination click, so a slide the
    // reader picks gets its full turn instead of whatever was left on the clock.
    const interval = window.setInterval(() => {
      setHeroSlide((index) => (index + 1) % heroSlideCount)
    }, HERO_SLIDE_MS)

    return () => window.clearInterval(interval)
  }, [heroSlideCount, heroSlide])

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    heroVideoRefs.current.forEach((video, index) => {
      if (!video) return

      if (prefersReducedMotion) {
        video.pause()
        return
      }

      if (index === heroSlide && index === 1) {
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
            // The bathroom figure is tall and sits low in the section, so it
            // reaches any threshold measured from the top of the viewport late.
            // It gets the same rise-and-fade as everything else, started the
            // moment its top crosses the bottom of the screen and finished
            // quickly after.
            const isBathroom = el.classList.contains('world__figure--bathroom')
            const tween = gsap.fromTo(
              el,
              { opacity: 0, y: 48 },
              {
                opacity: 1,
                y: 0,
                ease: 'power1.out',
                scrollTrigger: {
                  trigger: el,
                  start: isBathroom ? 'top bottom' : 'top 92%',
                  end: isBathroom ? 'top 80%' : 'top 58%',
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
          {heroSlides.map((slide, index) => {
            const isActive = index === heroSlide
            const slideClassName = ['hero__slide', isActive && 'is-active']
              .filter(Boolean)
              .join(' ')

            if (slide.type === 'video') {
              return (
                <div key={index} className={slideClassName}>
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

            if (slide.type === 'split') {
              return (
                <div key={index} className={`${slideClassName} hero__slide--split`}>
                  <img className="hero__slide-bg" src={slide.src} alt="" />
                  <img className="hero__slide-fg" src={slide.fg} alt="" />
                </div>
              )
            }

            return (
              <div key={index} className={slideClassName}>
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
                <p className="hero__eyebrow">{heroProduct.eyebrow}</p>
                <h1 className="hero__title hero__title--logo">
                  {heroProduct.logo ? (
                    <img src={heroProduct.logo} alt={heroProduct.logoAlt} />
                  ) : (
                    heroProduct.logoAlt
                  )}
                </h1>
                <p className="hero__subtitle">{heroProduct.subtitle}</p>
                <p className="hero__tagline">
                  <Lines lines={heroProduct.tagline} />
                </p>
                <div className="hero__awards">
                  {heroProduct.awards.map((award, i) => (
                    <img className="hero__award" src={award.src} alt={award.alt} key={i} />
                  ))}
                </div>
                <p className="hero__footnotes">
                  <Lines lines={heroProduct.footnotes} />
                </p>
              </>
            )}

            {heroSlide === 1 && (
              <>
                <p className="hero__eyebrow">{heroVideo.eyebrow}</p>
                <h1 className="hero__title hero__title--jp">
                  <Lines lines={heroVideo.title} />
                </h1>
                <p className="hero__tagline hero__tagline--control">
                  <Lines lines={heroVideo.tagline} />
                </p>
              </>
            )}
          </div>
        </div>

        {heroSlide === 2 && (
          <p className="hero__slide-note">{heroBrand.note}</p>
        )}

        <div className="hero__pagination" role="tablist" aria-label="ヒーロースライド">
          {Array.from({ length: heroSlideCount }, (_, index) => (
            <button
              key={index}
              type="button"
              role="tab"
              aria-selected={index === heroSlide}
              aria-label={`スライド ${index + 1} を表示`}
              className={`hero__pagination-line${index === heroSlide ? ' is-active' : ''}`}
              onClick={() => setHeroSlide(index)}
            />
          ))}
        </div>
      </header>

      {/* WORLD OF JOMOO */}
      <section className="world world--animate" id="world" data-nav="light">
        <div className="site-container">
          <div className="world__stage">
            <div className="world__upper">
              <div className="world__intro">
                <div className="world__eyebrow">{world.eyebrow}</div>
                <h2 className="world__title">
                  <Lines lines={world.title} />
                </h2>
                <div className="world__rule" aria-hidden="true" />
                <div className="world__body">
                  {world.body.map((paragraph, i) => (
                    <p key={i}>
                      <Lines lines={paragraph} />
                    </p>
                  ))}
                </div>
                <p className="world__body world__body--secondary world__body--secondary-intro">
                  <Lines lines={world.closing} />
                </p>
              </div>

              <div className="world__photos">
                <figure className="world__photo world__photo--hero">
                  {world.main && <img src={world.main} alt="" />}
                </figure>
                <figure className="world__photo world__photo--forest">
                  {world.forest && <img src={world.forest} alt="" />}
                </figure>
                <figure className="world__photo world__photo--shower">
                  {world.shower && <img src={world.shower} alt="" />}
                </figure>
              </div>
            </div>

            <div className="world__lower">
              <figure className="world__figure world__figure--bathroom">
                {world.bathroom && <img src={world.bathroom} alt="" />}
              </figure>
              <p className="world__body world__body--secondary world__body--secondary-lower">
                <Lines lines={world.closing} />
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SMART TOILET SCROLL-EXPAND */}
      <section className="expand expand--animate" ref={expandRef}>
        <div className="expand__stage">
          {expand.image && <img className="expand__media" src={expand.image} alt={expand.alt} />}
          <div className="expand__label">{expand.label}</div>
        </div>
      </section>

      <SpotlightCarousel slides={content.spotlight} />

      {/* FEATURE ROW */}
      <section className="feature feature--animate" data-nav="light" id="feature">
        <div className="feature__inner">
          <div className="feature__head reveal">
            <div className="feature__eyebrow">{lineup.eyebrow}</div>
            <h2 className="feature__title">{lineup.title}</h2>
            <div className="feature__rule" aria-hidden="true" />
            <p className="feature__subtitle">
              <Lines lines={lineup.subtitle} />
            </p>
          </div>

          {/* The cards are the products' own 一覧カード in Sanity — the same
              ones /products/smart-toilet draws. Change one, change both. */}
          <div className="feature__grid">
            {lineup.cards.map((card) => {
              const Card = card.href ? 'a' : 'div'
              return (
              <Card
                key={card.key}
                href={card.href}
                className="feature__card"
                aria-label={card.href ? `${card.name} の詳細を見る` : undefined}
              >
                <div className="feature__media">
                  <img
                    className="feature__img feature__img--default"
                    src={card.image}
                    alt={`JOMOO ${card.name} smart toilet`}
                  />
                  {card.hover && (
                    <img
                      className="feature__img feature__img--hover"
                      src={card.hover}
                      alt=""
                      aria-hidden="true"
                    />
                  )}
                </div>
                <div className="feature__content">
                  <span className="feature__pill">{card.pill}</span>
                  <h3 className="feature__name">{card.name}</h3>
                  {card.tagline.length > 0 && (
                    <p className="feature__tagline">
                      <Lines lines={card.tagline} />
                    </p>
                  )}
                  {card.desc && <p className="feature__desc">{card.desc}</p>}
                  {card.href && <span className="feature__more">詳しく見る&gt;</span>}
                </div>
              </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* One backdrop runs behind projects, stats and the award logos */}
      <div className="global-band">
      <GlobalProjectsSection {...content.projects} />

      {/* STATS */}
      <section className="stats stats--animate" data-nav="light">
        <div className="stats__inner">
          <div className="stats__grid" ref={statsGridRef}>
            {stats.map((stat) => (
              <div className="stat" data-target={stat.value} key={stat.key}>
                <div className="stat__top">
                  <div className="stat__icon">{stat.icon && <img src={stat.icon} alt="" />}</div>
                  {/* A soft break is two inline-blocks rather than a hard <br>:
                      they wrap as units, so the line breaks between them where
                      there is room, and still falls back to breaking inside a
                      part on a column too narrow for either. */}
                  <div className="stat__label">
                    {stat.softBreak ? (
                      stat.label.map((part, i) => (
                        <span className="stat__label-part" key={i}>
                          {part}
                        </span>
                      ))
                    ) : (
                      <Lines lines={stat.label} />
                    )}
                  </div>
                </div>
                <div className="stat__num">
                  <span className="stat__val">
                    <span className="stat__val-num">0</span>
                    {stat.suffix && <span className="stat__suf">{stat.suffix}</span>}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="design-logos" data-nav="light" aria-label="Design awards">
        <div className="design-logos__inner">
          <div className="design-logos__card">
            {content.awardLogos.map((src, index) => (
              <div key={index} className="design-logos__segment">
                <div className="design-logos__item">
                  <img src={src} alt="" />
                </div>
                {index < content.awardLogos.length - 1 ? (
                  <span className="design-logos__divider" aria-hidden="true" />
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </section>
      </div>

      <DesignExcellenceSection {...content.design} />

      {closing}

    </div>
  )
}
