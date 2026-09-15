import { FAQ_CATEGORIES } from '@/data/faq'
import './faq.css'

/**
 * よくあるご質問.
 *
 * Native <details>/<summary> rather than a scripted accordion: this is 85
 * questions of reference copy, and it should open, be searchable in the
 * browser's own find, and print without waiting on hydration. Nothing here
 * needs state, so nothing here is a client component.
 */
export default function FaqList() {
  return (
    <main className="faq">
      <div className="faq__inner">
        <div className="faq__intro">
          <p className="faq__eyebrow">FAQ</p>
          <h1 className="faq__title">よくあるご質問</h1>
          <p className="faq__lead">
            製品の仕様やお手入れについて、よくいただくご質問をまとめました。
            <br />
            お探しの内容が見つからない場合は、お客様相談窓口までお問い合わせください。
          </p>
          <div className="faq__rule" aria-hidden="true" />
        </div>

        <nav aria-label="カテゴリー">
          <ul className="faq__nav">
            {FAQ_CATEGORIES.map((category) => (
              <li key={category.id}>
                <a href={`#${category.id}`}>{category.label}</a>
              </li>
            ))}
          </ul>
        </nav>

        {FAQ_CATEGORIES.map((category) => (
          <section
            className="faq__group"
            key={category.id}
            id={category.id}
            aria-labelledby={`${category.id}-title`}
          >
            <h2 className="faq__group-title" id={`${category.id}-title`}>
              {category.label}
            </h2>
            <p className="faq__count">{category.items.length}件</p>

            {/* Index keys: the list is static and ordered, and the text is not
                unique — the nozzle answer repeats its first step verbatim under
                both 清掃 and 取り外し, which keyed by content collided. */}
            {category.items.map((item, index) => (
              <details className="faq__item" key={`${category.id}-${index}`}>
                <summary className="faq__q">
                  {item.q}
                  <span className="faq__marker" aria-hidden="true" />
                </summary>
                <div className="faq__a">
                  {item.a.map((paragraph, line) => (
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
