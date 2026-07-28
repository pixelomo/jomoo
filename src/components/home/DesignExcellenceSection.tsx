/* eslint-disable @next/next/no-img-element */
'use client'

const COL1_IMAGES = [
  '/images/design-col1-1.jpeg',
  '/images/design-col1-2.jpeg',
  '/images/design-col1-3.jpeg',
  '/images/design-col1-4.jpeg',
]

const COL2_IMAGES = [
  '/images/design-col2-1.jpeg',
  '/images/design-col2-2.jpeg',
  '/images/design-col2-3.jpeg',
]

function VerticalLane({
  images,
  direction,
}: {
  images: string[]
  direction: 'down' | 'up'
}) {
  const loop = [...images, ...images]

  return (
    <div className={`design-excellence__lane design-excellence__lane--${direction}`}>
      <div className={`design-excellence__track design-excellence__track--${direction}`}>
        {loop.map((src, index) => (
          <div key={`${src}-${index}`} className="design-excellence__card">
            <img src={src} alt="" loading="lazy" decoding="async" />
          </div>
        ))}
      </div>
    </div>
  )
}

export default function DesignExcellenceSection() {
  return (
    <section className="design-excellence" data-nav="light" id="design">
      <div className="design-excellence__inner">
        <div className="design-excellence__layout">
          <div className="design-excellence__carousels" aria-hidden="true">
            <VerticalLane images={COL1_IMAGES} direction="down" />
            <VerticalLane images={COL2_IMAGES} direction="up" />
          </div>

          <div className="design-excellence__content">
            <div className="design-excellence__eyebrow reveal">DESIGN EXCELLENCE</div>
            <h2 className="design-excellence__title reveal">
              世界の舞台で
              <br />
              評価された
              <br />
              デザインチーム
            </h2>
            <div className="design-excellence__rule reveal" aria-hidden="true" />
            <p className="design-excellence__subtitle reveal">
              欧州デザインチームによる創造力、
              <br />
              視覚的な美しいデザインや
              <br />
              最先端の科学技術や
              <br />
              工学的な機能に融合により、
              <br />
              多くの国際的なデザイン賞を受賞している
              <br />
              世界基準のデザイナーが製造しています。
            </p>
            <a className="design-excellence__link reveal" href="/inspiration">
              詳しく見る&gt;
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
