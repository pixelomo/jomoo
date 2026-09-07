import StageVideo from './StageVideo'
import './company-profile.css'

/**
 * 会社情報. The page opens on one continuous video: it sits still under the nav
 * while the title panel and then the brand introduction scroll across it, so
 * the two panels read as one held shot rather than two sections.
 *
 * Sections beyond these two are still to come.
 */
export default function CompanyProfilePage() {
  return (
    <main className="cp">
      <section className="cp-stage" aria-labelledby="cp-hero-title">
        <div className="cp-stage__media">
          <StageVideo />
          <div className="cp-stage__scrim" />
        </div>

        <div className="cp-stage__panels">
          <div className="cp-panel cp-panel--hero">
            <h1 className="cp-hero__title" id="cp-hero-title">
              World of JOMOO
            </h1>
            <span className="cp-hero__cue" aria-hidden="true" />
          </div>

          <div className="cp-panel cp-panel--about">
            <div className="cp-about">
              <p className="cp-about__eyebrow">JOMOO BRAND</p>
              <h2 className="cp-about__title">JOMOOについて</h2>
              <div className="cp-about__body">
                <p>
                  1990年設立のJOMOOは、ユーザーにスマートキッチン&amp;バスルーム製品を提供する、グローバルなスマートバスルームブランドです。
                  <br />
                  研究開発から製造、販売、アフターサービスまでをワンストップで担う企業として20,000名を超える多様なチームと、120カ国に広がる市場ネットワークがあります。
                </p>
                <p>
                  JOMOOは「Start Your Smart Life」というコンセプトのもと世界有数のテクロノジー企業やヨーロッパの著名デザインスタジオとの継続的なパートナーシップを通じて、革新を推進し続けています。
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
