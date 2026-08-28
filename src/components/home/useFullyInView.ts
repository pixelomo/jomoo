'use client'

import { useEffect, useRef, useState, type RefObject } from 'react'

/**
 * True once the element is properly in front of the reader, false again when it
 * leaves.
 *
 * The home page carousels start advancing on their own, and used to do it from
 * the moment they mounted — so anyone scrolling down arrived at the last slide
 * with the first ones already gone. Autoplay hangs off this instead.
 *
 * "Fully in view" is whichever is smaller: the whole element, or a screenful of
 * it. A section taller than the window can never report 100% visible, so asking
 * IntersectionObserver for a threshold of 1 would arm it never.
 *
 * The answer is measured from the live rect rather than read off the
 * IntersectionObserver entry. An observer only reports at the thresholds it was
 * given, and on a tall section the crossing we care about falls between two of
 * them: the projects strip is 1363px in a 900px window, so the ratio tops out
 * at 0.66 and the last callback arrives at 0.65 — 886px of the 899px needed.
 * Autoplay stayed off for good. The observer is now only a gate that says when
 * the element is worth measuring at all.
 */
export function useFullyInView(ref: RefObject<HTMLElement | null>) {
  const [inView, setInView] = useState(false)
  const inViewRef = useRef(false)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    let frame = 0

    const apply = (visible: boolean) => {
      if (visible === inViewRef.current) return
      inViewRef.current = visible
      setInView(visible)
    }

    const measure = () => {
      frame = 0
      const rect = element.getBoundingClientRect()
      const viewport = window.innerHeight
      const shown = Math.min(rect.bottom, viewport) - Math.max(rect.top, 0)
      const wanted = Math.min(rect.height, viewport)
      apply(shown >= wanted - 1)
    }

    // Coalesce the scroll stream into one measurement per frame — this reads
    // layout, so it must not run per scroll event.
    const schedule = () => {
      if (frame) return
      frame = requestAnimationFrame(measure)
    }

    let listening = false

    const listen = (on: boolean) => {
      if (on === listening) return
      listening = on
      if (on) {
        window.addEventListener('scroll', schedule, { passive: true })
        window.addEventListener('resize', schedule)
      } else {
        window.removeEventListener('scroll', schedule)
        window.removeEventListener('resize', schedule)
      }
    }

    // Only measure while the section is somewhere on screen; the rest of the
    // page's scrolling costs nothing.
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          listen(true)
          measure()
        } else {
          listen(false)
          apply(false)
        }
      },
      { threshold: 0 }
    )

    observer.observe(element)

    return () => {
      observer.disconnect()
      listen(false)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [ref])

  // The ref is for callbacks that outlive the render they were created in —
  // a rescheduling timeout reads the current answer rather than a captured one.
  return { inView, inViewRef }
}
