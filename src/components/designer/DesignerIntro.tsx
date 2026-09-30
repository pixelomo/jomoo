'use client'

import { useRef } from 'react'
import { useScrollReveal } from '@/components/company/useScrollReveal'

/**
 * The statement between the hero and the designers: three centred lines and
 * the blue rule the site uses to close a heading block.
 *
 * The line breaks are authored in the Studio rather than left to the browser —
 * the design sets balanced lines, and Japanese wraps anywhere, so an automatic
 * break lands mid-phrase. Below the breakpoint they collapse and the
 * paragraph is allowed to flow.
 */
export default function DesignerIntro({ lines }: { lines: string[] }) {
  const introRef = useRef<HTMLElement>(null)

  useScrollReveal(introRef, [{ selector: '.dz-intro__line', y: 28 }, { selector: '.dz-intro__rule', y: 16 }])

  return (
    <section className="dz-intro" ref={introRef} data-nav="light">
      <div className="dz-intro__inner">
        <p className="dz-intro__body">
          {lines.map((line, i) => (
            <span className="dz-intro__line" key={i}>
              {line}
            </span>
          ))}
        </p>
        <span className="dz-intro__rule" aria-hidden="true" />
      </div>
    </section>
  )
}
