'use client'

import { useEffect, useRef } from 'react'
import { useCssScrollProgress } from './useCssScrollProgress'

const REDUCED_MOTION = '(prefers-reduced-motion: reduce)'

/**
 * The opening of 会社情報: one video with two panels scrolling across it.
 *
 * The media layer sticks under the nav for the height of the stage, so the
 * title and the brand introduction read as a single held shot. The video pulls
 * into focus behind the title and blurs off as the introduction arrives —
 * `--cp-focus` runs 0→1 across that first panel and the stylesheet does the
 * rest.
 */
export default function BrandStage() {
  const stageRef = useRef<HTMLElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  // The stage is exactly two panels tall and its top sits at the nav line when
  // unscrolled, so half its height is one panel's worth of travel.
  useCssScrollProgress(stageRef, '--cp-focus', (rect, _viewport, navHeight) => {
    const panel = rect.height / 2
    return panel > 0 ? (navHeight - rect.top) / panel : 0
  })

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const query = window.matchMedia(REDUCED_MOTION)

    function sync() {
      if (!video) return
      if (query.matches) {
        video.pause()
        video.currentTime = 0
      } else {
        // Safari rejects the promise when the tab is hidden; it retries on the
        // next visibility change of its own accord, so this is left to it.
        void video.play().catch(() => {})
      }
    }

    sync()
    query.addEventListener('change', sync)
    return () => query.removeEventListener('change', sync)
  }, [])

  return (
    <section className="cp-stage" ref={stageRef} aria-labelledby="cp-hero-title">
      <div className="cp-stage__media">
        {/*
          `autoPlay` is deliberately absent: a video that fills the screen for
          two panels is exactly what "reduce motion" is asking about, so play is
          called from the effect above only when the viewer has not asked for
          less of it. Everyone else gets the poster — a still of the same
          footage, so the panels read the same either way.
        */}
        <video
          ref={videoRef}
          className="cp-stage__video"
          src="/images/companyprofile/profile.mp4"
          poster="/images/companyprofile/profile-poster.jpg"
          muted
          loop
          playsInline
          preload="auto"
          aria-hidden="true"
          tabIndex={-1}
        />
        <div className="cp-stage__scrim" />
      </div>

      <div className="cp-stage__panels">
        <div className="cp-panel cp-panel--hero">
          <h1 className="cp-hero__title" id="cp-hero-title">
            Welcome to JOMOO
          </h1>
        </div>

        <div className="cp-panel cp-panel--about">
          <div className="cp-about">
            <p className="cp-about__eyebrow">JOMOO BRAND</p>
            <h2 className="cp-about__title">JOMOOについて</h2>
            <span className="cp-about__rule" aria-hidden="true" />
            <div className="cp-about__body">
              <p>
                1990年設立のJOMOOは、ユーザーにスマートキッチン&amp;バスルーム製品を提供する、グローバルなスマートバスルームブランドです。
                <br />
                研究開発から製造、販売、アフターサービスまでをワンストップで担う企業として20,000名を超える多様なチームと、120カ国に広がる市場ネットワークがあります。
              </p>
              <p>
                JOMOOは「Start Your Smart Life」というコンセプトのもと世界有数のテクロノジー企業やヨーロッパの著名デザインスタジオとの継続的なパートナーシップを通じて、革新を推進し続けています。
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
