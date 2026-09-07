'use client'

import { useEffect, useRef } from 'react'

const REDUCED_MOTION = '(prefers-reduced-motion: reduce)'

/**
 * The looping backdrop behind the hero and the about panel.
 *
 * `autoPlay` is deliberately not set: a video that fills the screen for two
 * panels is exactly what "reduce motion" is asking about, so playback is
 * started from here only when the viewer has not asked for less of it, and
 * everyone else gets the poster frame — a still of the same footage, so the
 * panels read the same either way.
 */
export default function StageVideo() {
  const ref = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = ref.current
    if (!video) return

    const query = window.matchMedia(REDUCED_MOTION)

    function sync() {
      if (!video) return
      if (query.matches) {
        video.pause()
        video.currentTime = 0
      } else {
        // Safari rejects the promise when the tab is hidden; it retries on the
        // next visibility change of its own accord, so the failure is ignored.
        void video.play().catch(() => {})
      }
    }

    sync()
    query.addEventListener('change', sync)
    return () => query.removeEventListener('change', sync)
  }, [])

  return (
    <video
      ref={ref}
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
  )
}
