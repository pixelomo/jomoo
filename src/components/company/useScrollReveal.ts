'use client'

import { useEffect, type RefObject } from 'react'

interface Reveal {
  /** Selector, resolved inside the scope element. */
  selector: string
  /** How far below its resting place the element starts, in px. */
  y?: number
  /** Sideways offset, in px — negative comes in from the left. */
  x?: number
}

interface Parallax {
  selector: string
  /** Drift across the whole pass, as a percentage of the element's height. */
  shift?: number
  /** Held at this scale so the drift never exposes an edge. */
  scale?: number
}

/**
 * The homepage's scroll choreography, applied to a scope: a rise and fade as
 * each element crosses the lower third of the screen, and an optional slower
 * drift, scrubbed against the scrollbar, for anything sitting inside a frame.
 *
 * Both run in either direction — the rise winds back when its element leaves
 * upwards, the drift follows the scrollbar by nature — so a section scrolled
 * past and returned to plays again rather than sitting there already finished.
 *
 * The reveal's resting state is what the stylesheet paints. The start state is
 * applied from here rather than in CSS, so a viewer whose browser never runs
 * this — GSAP failed to load, motion is turned down — sees the finished layout
 * instead of a section that stays invisible.
 */
export function useScrollReveal(
  scopeRef: RefObject<HTMLElement | null>,
  reveals: Reveal[],
  parallax: Parallax[] = [],
) {
  useEffect(() => {
    const scope = scopeRef.current
    if (!scope) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let cancelled = false
    const cleanups: (() => void)[] = []

    void (async () => {
      const { default: gsap } = await import('gsap')
      const { ScrollTrigger } = await import('gsap/ScrollTrigger')
      if (cancelled) return
      gsap.registerPlugin(ScrollTrigger)

      const ctx = gsap.context(() => {
        reveals.forEach(({ selector, y = 48, x = 0 }) => {
          gsap.utils.toArray<HTMLElement>(selector).forEach((el, i) => {
            gsap.fromTo(
              el,
              { opacity: 0, y, x },
              {
                opacity: 1,
                y: 0,
                x: 0,
                duration: 0.9,
                // Elements in a row share a trigger point, so they would
                // otherwise all arrive on the same frame.
                delay: (i % 3) * 0.09,
                ease: 'power2.out',
                scrollTrigger: {
                  trigger: el,
                  start: 'top 88%',
                  // Played through on entry rather than scrubbed against the
                  // scrollbar. A scrub needs its end point to be reachable, and
                  // the last row of anything sitting near the foot of the page
                  // never gets there — the page runs out of scroll first and
                  // they stay half faded in. This always finishes.
                  //
                  // It also winds back when the element leaves upwards, so
                  // scrolling back over a section and down again plays it
                  // again rather than showing it already done.
                  toggleActions: 'play none none reverse',
                },
              },
            )
          })
        })

        parallax.forEach(({ selector, shift = 5, scale = 1.14 }) => {
          gsap.utils.toArray<HTMLElement>(selector).forEach((el) => {
            gsap.fromTo(
              el,
              { yPercent: -shift, scale },
              {
                yPercent: shift,
                scale,
                ease: 'none',
                scrollTrigger: {
                  // The frame, not the image: the image is oversized and would
                  // start its pass before the frame had reached the screen.
                  trigger: el.parentElement ?? el,
                  start: 'top bottom',
                  end: 'bottom top',
                  scrub: true,
                },
              },
            )
          })
        })
      }, scope)

      cleanups.push(() => ctx.revert())
    })()

    return () => {
      cancelled = true
      cleanups.forEach((fn) => fn())
    }
    // The descriptors are written as literals at the call sites and never
    // change between renders; re-subscribing on every render would thrash the
    // ScrollTriggers for nothing.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scopeRef])
}
