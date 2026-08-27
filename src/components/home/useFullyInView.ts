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
 */
export function useFullyInView(ref: RefObject<HTMLElement | null>) {
  const [inView, setInView] = useState(false)
  const inViewRef = useRef(false)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        const wanted = Math.min(entry.boundingClientRect.height, window.innerHeight)
        const visible = entry.intersectionRect.height >= wanted - 1
        inViewRef.current = visible
        setInView(visible)
      },
      // The crossing point on a tall section falls between coarse thresholds,
      // so the callback runs often and works out the answer itself.
      { threshold: Array.from({ length: 21 }, (_, i) => i / 20) }
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [ref])

  // The ref is for callbacks that outlive the render they were created in —
  // a rescheduling timeout reads the current answer rather than a captured one.
  return { inView, inViewRef }
}
