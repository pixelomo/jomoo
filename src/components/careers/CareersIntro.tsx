'use client'

import { useRef } from 'react'
import { useScrollReveal } from '@/components/company/useScrollReveal'

/**
 * The statement between the hero and the four bands: three centred lines on
 * white and the blue rule the site uses to close a heading block.
 *
 * As on the designer page the breaks are authored, because the design sets one
 * sentence per line and Japanese wraps anywhere — left to the browser a break
 * lands mid-phrase. Below the breakpoint they collapse and the paragraph flows.
 */
export default function CareersIntro() {
  const introRef = useRef<HTMLElement>(null)

  useScrollReveal(introRef, [
    { selector: '.cr-intro__line', y: 28 },
    { selector: '.cr-intro__rule', y: 16 },
  ])

  return (
    <section className="cr-intro" ref={introRef} data-nav="light">
      <div className="cr-intro__inner">
        <p className="cr-intro__body">
          <span className="cr-intro__line">
            JOMOOは、社員一人ひとりの挑戦と成長が、会社の未来をつくると信じています。
          </span>
          <span className="cr-intro__line">
            お互いに支え合いながら新しい価値を創造し、ともに成長していく環境があります。
          </span>
          <span className="cr-intro__line">
            私たちの想いに共感し、未来を切り拓く仲間をお待ちしています。
          </span>
        </p>
        <span className="cr-intro__rule" aria-hidden="true" />
      </div>
    </section>
  )
}
