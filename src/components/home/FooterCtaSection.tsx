'use client'

export default function FooterCtaSection() {
  return (
    <section className="footer-cta" data-nav="light" aria-label="Catalog and contact">
      <div className="footer-cta__inner">
        <a
          className="footer-cta__card footer-cta__card--catalog"
          href="/images/brochure.pdf"
          target="_blank"
          rel="noopener noreferrer"
        >
          <div
            className="footer-cta__media"
            style={{ backgroundImage: 'url(/images/footer-catalog.jpeg)' }}
            aria-hidden="true"
          />
          <div className="footer-cta__shade" aria-hidden="true" />
          <div className="footer-cta__content">
            <div className="footer-cta__eyebrow">CATALOG</div>
            <h2 className="footer-cta__title">
              カタログ
              <br />
              ダウンロード
            </h2>
            <span className="footer-cta__btn">
              カタログを見る
              <span className="footer-cta__caret" aria-hidden="true">
                &gt;
              </span>
            </span>
          </div>
        </a>

        <a className="footer-cta__card footer-cta__card--contact" href="/contact-us">
          <div
            className="footer-cta__media"
            style={{ backgroundImage: 'url(/images/footer-contact.jpeg)' }}
            aria-hidden="true"
          />
          <div className="footer-cta__shade" aria-hidden="true" />
          <div className="footer-cta__content">
            <div className="footer-cta__eyebrow">CONTACT</div>
            <h2 className="footer-cta__title">
              お問合せ・
              <br />
              パートナーシップ相談
            </h2>
            <span className="footer-cta__btn">
              お問い合わせフォームへ
              <span className="footer-cta__caret" aria-hidden="true">
                &gt;
              </span>
            </span>
          </div>
        </a>
      </div>
    </section>
  )
}
