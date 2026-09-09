'use client'

import { useRef } from 'react'
import { useScrollReveal } from '@/components/company/useScrollReveal'

/**
 * The statement between the hero and the designers: three centred lines and
 * the blue rule the site uses to close a heading block.
 *
 * The line breaks are authored rather than left to the browser — the design
 * sets three balanced lines, and Japanese wraps anywhere, so an automatic
 * break lands mid-phrase. Below the breakpoint they collapse and the
 * paragraph is allowed to flow.
 */
export default function DesignerIntro() {
  const introRef = useRef<HTMLElement>(null)

  useScrollReveal(introRef, [{ selector: '.dz-intro__line', y: 28 }, { selector: '.dz-intro__rule', y: 16 }])

  return (
    <section className="dz-intro" ref={introRef} data-nav="light">
      <div className="dz-intro__inner">
        <p className="dz-intro__body">
          <span className="dz-intro__line">
            JOMOOは、世界を代表するデザインパートナーとの協業により、新たな価値を創造しています。
          </span>
          <span className="dz-intro__line">
            多彩な知見と創造力を融合し、機能性とデザイン性を兼ね備えた製品を開発。
          </span>
          <span className="dz-intro__line">暮らしを豊かにするデザインを追求し続けています。</span>
        </p>
        <span className="dz-intro__rule" aria-hidden="true" />
      </div>
    </section>
  )
}
