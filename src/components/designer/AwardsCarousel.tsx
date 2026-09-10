/* eslint-disable @next/next/no-img-element */
'use client'

import { useEffect, useRef, useState } from 'react'
import { useScrollReveal } from '@/components/company/useScrollReveal'

/**
 * The same seven award marks the homepage sets in its logo row, in the order
 * the design lays them out. Named here rather than generated from the index:
 * on the homepage they are one decorative strip, but this section is *about*
 * them, so each one carries the award it stands for.
 */
const AWARD_LOGOS = [
  'iF DESIGN AWARD',
  'reddot winner — best of the best',
  'GOOD DESIGN',
  'GOLD AWARD 2023',
  'GERMAN DESIGN AWARD',
  'GERMAN INNOVATION AWARD',
  'ICONIC AWARDS 2025',
].map((name, i) => ({
  name,
  src: `/images/icon/jomoo_design_logo_${String(i + 1).padStart(5, '0')}.png`,
}))

/** Pixels per second the strip travels when nothing is holding it. */
const SPEED = 150
/** How long after a touch or a wheel before the drift picks up again. */
const RESUME_DELAY = 2200

/**
 * 受賞歴 — the award marks, larger than the homepage's row and moving on their
 * own.
 *
 * The strip is a real horizontally scrollable element rather than a transformed
 * track, so it can still be dragged, flicked or wheeled through; the drift is
 * applied by advancing scrollLeft. The list is rendered twice and the position
 * wraps at the halfway mark, which makes the loop seamless in both directions
 * without the copy ever being announced twice — the duplicate is aria-hidden.
 *
 * The rule underneath runs the length of one loop, so it reaches its end at the
 * moment the first mark returns to where it started — no part-filled reset —
 * and stays honest whether the strip is drifting or being dragged.
 */
export default function AwardsCarousel() {
  const sectionRef = useRef<HTMLElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const barRef = useRef<HTMLSpanElement>(null)
  const [copies, setCopies] = useState(2)

  /**
   * Two copies are only enough while a copy is wider than the rail. Past that,
   * scrollLeft's own ceiling — content less rail — sits below one copy's width,
   * so the position clamps before the wrap and the strip sits dead at the end
   * of the last copy: on a 2560px screen that was eight seconds of nothing
   * moving. One copy beyond what the rail can show puts the ceiling back above
   * the loop, whatever the screen.
   */
  useEffect(() => {
    const track = trackRef.current
    if (!track) return

    function fit() {
      const run = track!.querySelector<HTMLElement>('.dz-awards__run')
      const width = run?.getBoundingClientRect().width
      if (!width) return
      setCopies(Math.max(2, Math.ceil(track!.clientWidth / width) + 1))
    }

    fit()
    const observer = new ResizeObserver(fit)
    observer.observe(track)
    return () => observer.disconnect()
  }, [])

  useScrollReveal(sectionRef, [
    { selector: '.dz-awards__eyebrow', y: 24 },
    { selector: '.dz-awards__title', y: 30 },
    { selector: '.dz-awards__rule', y: 16 },
  ])

  useEffect(() => {
    const track = trackRef.current
    const bar = barRef.current
    if (!track) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')

    let frame = 0
    let last = 0
    let heldUntil = 0
    let hovering = false

    // The drift is well under a pixel per frame, and scrollLeft is quantised to
    // whole pixels — reading it back as the running total would round every
    // step away to nothing and the strip would never move. So the position is
    // kept here as a float and only written out; `written` is what the element
    // gave back last time, which is how a scroll the viewer made is told apart
    // from the one we just made ourselves.
    let pos = 0
    let written = 0

    // One logo's worth of rail — the slim indicator the design draws. A true
    // scrollbar thumb (rail ÷ content) would be over 80% of the rule here,
    // because one copy of the strip barely overflows the screen, and a thumb
    // that size nudging back and forth tells the viewer nothing.
    const thumb = 1 / AWARD_LOGOS.length

    function paintBar(half: number) {
      if (!bar || half <= 0) return
      const progress = (((pos % half) + half) % half) / half
      bar.style.setProperty('--dz-bar-size', `${thumb * 100}%`)
      bar.style.setProperty('--dz-bar-at', `${progress * (1 - thumb) * 100}%`)
    }

    // The loop's period is the distance from one copy to the next, measured off
    // the runs themselves rather than taken as scrollWidth / 2. Those agree only
    // while the track has no column gap — with one, half of it falls between the
    // copies and scrollWidth / 2 lands short of a whole copy, so every wrap
    // shunts the strip back by that much and the cards visibly jump. offsetLeft
    // is unaffected by scrolling, so this stays right whatever the spacing.
    function period() {
      const runs = track!.querySelectorAll<HTMLElement>('.dz-awards__run')
      if (runs.length < 2) return track!.scrollWidth / 2
      return runs[1].offsetLeft - runs[0].offsetLeft
    }

    function step(now: number) {
      frame = requestAnimationFrame(step)
      if (!track) return

      const half = period()
      const dt = last ? Math.min((now - last) / 1000, 0.05) : 0
      last = now
      if (half <= 0) return

      // Anything more than rounding means the viewer moved it — a drag, a
      // flick, a wheel, or the browser restoring a position. Take theirs.
      if (Math.abs(track.scrollLeft - written) > 1) pos = track.scrollLeft

      if (!hovering && now > heldUntil && !reduced.matches) pos += SPEED * dt

      // Wrapping applies however the position was reached, so a flick past the
      // seam lands back in the first copy rather than stopping at the end of
      // the second.
      pos = ((pos % half) + half) % half

      track.scrollLeft = pos
      written = track.scrollLeft

      paintBar(half)
    }

    function hold() {
      heldUntil = performance.now() + RESUME_DELAY
    }
    function enter() {
      hovering = true
    }
    function leave() {
      hovering = false
    }

    track.addEventListener('pointerenter', enter)
    track.addEventListener('pointerleave', leave)
    track.addEventListener('focusin', enter)
    track.addEventListener('focusout', leave)
    track.addEventListener('wheel', hold, { passive: true })
    track.addEventListener('touchstart', hold, { passive: true })
    track.addEventListener('touchmove', hold, { passive: true })

    frame = requestAnimationFrame(step)

    return () => {
      cancelAnimationFrame(frame)
      track.removeEventListener('pointerenter', enter)
      track.removeEventListener('pointerleave', leave)
      track.removeEventListener('focusin', enter)
      track.removeEventListener('focusout', leave)
      track.removeEventListener('wheel', hold)
      track.removeEventListener('touchstart', hold)
      track.removeEventListener('touchmove', hold)
    }
  }, [copies])

  return (
    <section className="dz-awards" ref={sectionRef} data-nav="light" aria-labelledby="dz-awards-title">
      <div className="dz-awards__head">
        <p className="dz-awards__eyebrow">Design awards</p>
        <h2 className="dz-awards__title" id="dz-awards-title">
          受賞歴
        </h2>
        <span className="dz-awards__rule" aria-hidden="true" />
      </div>

      <div className="dz-awards__track" ref={trackRef} tabIndex={0} role="group" aria-label="受賞歴のロゴ">
        {Array.from({ length: copies }, (_, copy) => (
          <div className="dz-awards__run" key={copy} aria-hidden={copy > 0 ? true : undefined}>
            {AWARD_LOGOS.map((logo) => (
              <div className="dz-awards__card" key={logo.src}>
                <img
                  src={logo.src}
                  alt={copy === 0 ? logo.name : ''}
                  loading="lazy"
                  decoding="async"
                />
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="dz-awards__bar" aria-hidden="true">
        <span className="dz-awards__bar-fill" ref={barRef} />
      </div>
    </section>
  )
}
