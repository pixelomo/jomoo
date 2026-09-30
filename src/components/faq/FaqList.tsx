import { Fragment } from 'react'
import { lines, type FaqPageData } from '@/lib/sanity'
import './faq.css'

/**
 * よくあるご質問.
 *
 * Content is the faqPage document in Sanity; each answer's lines are its
 * paragraphs.
 *
 * Native <details>/<summary> rather than a scripted accordion: this is dozens
 * of questions of reference copy, and it should open, be searchable in the
 * browser's own find, and print without waiting on hydration. Nothing here
 * needs state, so nothing here is a client component.
 */
export default function FaqList({ data }: { data: FaqPageData }) {
  const categories = data.categories ?? []

  return (
    <main className="faq">
      <div className="faq__inner">
        <div className="faq__intro">
          <p className="faq__eyebrow">{data.eyebrow}</p>
          <h1 className="faq__title">{data.title}</h1>
          <p className="faq__lead">
            {lines(data.lead).map((line, i) => (
              <Fragment key={i}>
                {i > 0 && <br />}
                {line}
              </Fragment>
            ))}
          </p>
          <div className="faq__rule" aria-hidden="true" />
        </div>

        <nav aria-label="カテゴリー">
          <ul className="faq__nav">
            {categories.map((category) => (
              <li key={category._key}>
                <a href={`#${category.anchor}`}>{category.label}</a>
              </li>
            ))}
          </ul>
        </nav>

        {categories.map((category) => (
          <section
            className="faq__group"
            key={category._key}
            id={category.anchor}
            aria-labelledby={`${category.anchor}-title`}
          >
            <h2 className="faq__group-title" id={`${category.anchor}-title`}>
              {category.label}
            </h2>
            <p className="faq__count">{category.items?.length ?? 0}件</p>

            {(category.items ?? []).map((item) => (
              <details className="faq__item" key={item._key}>
                <summary className="faq__q">
                  {item.q}
                  <span className="faq__marker" aria-hidden="true" />
                </summary>
                <div className="faq__a">
                  {lines(item.a).map((paragraph, line) => (
                    <p key={line}>{paragraph}</p>
                  ))}
                </div>
              </details>
            ))}
          </section>
        ))}

        <div className="faq__more">
          <p>
            解決しない場合は、
            <a href="/contact-us">お客様相談窓口</a>
            までお気軽にお問い合わせください。
            <br />
            保証の範囲については
            <a href="/after-sales">アフターサービス</a>
            をご覧ください。
          </p>
        </div>
      </div>
    </main>
  )
}
