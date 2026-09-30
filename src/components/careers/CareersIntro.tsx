'use client'

import { useRef } from 'react'
import { useScrollReveal } from '@/components/company/useScrollReveal'

/**
 * The statement between the hero and the bands: centred lines on
 * white and the blue rule the site uses to close a heading block.
 *
 * As on the designer page the breaks are authored in the Studio, because the design sets one
 * sentence per line and Japanese wraps anywhere — left to the browser a break
 * lands mid-phrase. Below the breakpoint they collapse and the paragraph flows.
 */
export default function CareersIntro({ lines }: { lines: string[] }) {
  const introRef = useRef<HTMLElement>(null)

  useScrollReveal(introRef, [
    { selector: '.cr-intro__line', y: 28 },
    { selector: '.cr-intro__rule', y: 16 },
  ])

  return (
    <section className="cr-intro" ref={introRef} data-nav="light">
      <div className="cr-intro__inner">
        <p className="cr-intro__body">
          {lines.map((line, i) => (
            <span className="cr-intro__line" key={i}>
              {line}
            </span>
          ))}
        </p>
        <span className="cr-intro__rule" aria-hidden="true" />
      </div>
    </section>
  )
}
