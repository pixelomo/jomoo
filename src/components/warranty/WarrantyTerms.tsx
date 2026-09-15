import RepairTerms from './RepairTerms'
import './warranty-document.css'

/**
 * The 保証規定 and club sections that follow the certificate.
 *
 * Static legal copy, so it is a server component — and it is hidden when the
 * certificate is printed, since only the certificate itself is the document.
 *
 * The free-repair terms themselves live in RepairTerms, which /after-sales
 * renders too.
 */
export default function WarrantyTerms() {
  return (
    <>
      <RepairTerms />

      <section className="warranty-section warranty-section--grey">
        <div className="warranty-section__inner warranty-terms warranty-club">
          <h2 className="warranty-section__title warranty-section__title--center">
            JOMOO倶楽部会員ご登録のお願い
          </h2>

          <span className="warranty-club__cta">3年間の延長保証特典付き</span>

          <p className="warranty-section__lead">
            お客様に安全・安心してJOMOOスマートトイレをご使用いただくため、ご購入後はJOMOOクラブ会員へのご登録をお願いいたします。
            <br />
            ※登録手続きはとても簡単で、Web登録のみの受付となります。
          </p>

          <p className="warranty-section__lead">
            製品の引き渡し/ご購入から3か月以内に、JOMOO日本公式サイトwww.jomoo.comにて製品登録を行ってください。住宅用途でご使用の製品は3年間、住宅用途以外でご使用の製品は1年間の無料延長保証をお受けいただけます。
            引き渡し/ご購入日から3か月を過ぎて製品登録を行った場合は、無料延長保証をお受けいただけません。
          </p>

          <p className="warranty-section__lead">
            ※会員登録の前に、メールアドレスなどの個人情報をご準備ください。
            <br />
            ※製品登録の際は、本保証書、製造番号、型番などの情報をご準備ください。
          </p>

          <h3>ご登録いただいた個人情報の利用目的について</h3>
          <ol>
            <li>
              メールなどによるお客様への情報のご提供（製品の安全に関する重要なお知らせ、当社の商品・サービスに関する情報などを含む）。
            </li>
            <li>アンケートをお送りし、製品およびサービスに対するお客様の満足度を調査するため。</li>
          </ol>

          <h3>延長保証に関する注意事項</h3>
          <ol>
            <li>
              製品登録により、延長保証期間は設置日から2年が経過した日の翌日から起算されます（設置日から2年以内の保証は本保証書に基づきます）。
            </li>
            <li>
              延長保証期間内に、取扱説明書の注意事項に従った正常なご使用状態で故障が発生した場合は、販売店またはJOMOOサービスホットラインにご連絡のうえ、無料修理をご予約ください。
            </li>
          </ol>
        </div>
      </section>

      <section className="warranty-maker">
        <div className="warranty-maker__inner">
          製造元：
          <br />
          JOMOO Kitchen &amp; Bath Co., Ltd.（九牧厨卫股份有限公司）
          <br />
          所在地：***
          <br />
          郵便番号：***
        </div>
      </section>
    </>
  )
}
