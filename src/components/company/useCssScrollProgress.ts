'use client'

import { useEffect, useRef, type RefObject } from 'react'

type Compute = (rect: DOMRect, viewport: number, navHeight: number) => number

/**
 * Writes how far the page has scrolled through an element into a CSS custom
 * property on that same element, clamped to 0–1, so the animation itself can
 * live in the stylesheet.
 *
 * `compute` maps the element's rect to that number — each caller measures a
 * different thing (a video's blur ramp, a rail's travel), and the shared part
 * is only the plumbing: a passive listener, one rAF per frame at most, and a
 * first run on mount so a page restored mid-scroll starts in the right place.
 */
export function useCssScrollProgress(
  ref: RefObject<HTMLElement | null>,
  property: string,
  compute: Compute,
) {
  // Held in a ref so an inline arrow at the call site does not re-subscribe on
  // every render. Seeded with the first `compute` so the mount measurement
  // below already has it, then kept current from an effect rather than during
  // render.
  const computeRef = useRef(compute)

  useEffect(() => {
    computeRef.current = compute
  })

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const navHeight =
      parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue('--nav-height'),
      ) || 0

    let frame = 0

    function measure() {
      frame = 0
      if (!element) return
      const raw = computeRef.current(
        element.getBoundingClientRect(),
        window.innerHeight,
        navHeight,
      )
      const progress = Number.isFinite(raw) ? Math.min(1, Math.max(0, raw)) : 0
      element.style.setProperty(property, progress.toFixed(4))
    }

    function schedule() {
      if (frame) return
      frame = requestAnimationFrame(measure)
    }

    measure()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)

    return () => {
      if (frame) cancelAnimationFrame(frame)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
    }
  }, [ref, property])
}
