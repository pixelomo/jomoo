import './warranty-document.css'

/**
 * The 保証規定 and club sections that follow the certificate.
 *
 * Static legal copy, so it is a server component — and it is hidden when the
 * certificate is printed, since only the certificate itself is the document.
 *
 * The source text arrived with its lines interleaved by the PDF extraction;
 * clauses have been reassembled into reading order without changing wording.
 */

const EXCLUSIONS: [string, string][] = [
  [
    '1）',
    '設置・使用・お手入れの不備：不適切な使用、施工説明書に従わない設置、指定外電源の使用、無許可または不適切なメンテナンス・改造、日常の清掃・お手入れの不備、設置場所の移動、製品説明書の設置条件に適合しないことにより生じた故障または損傷。および建物の変形など、製品自体以外の問題に起因する故障および損傷。',
  ],
  [
    '2）',
    '本来の用途以外での使用（車両、船舶、使用頻度が極めて高い商業用途など）に起因する故障および損傷、または無許可の修理（JOMOO認定サービス担当者以外による分解修理、純正部品以外を使用した修理）による損傷。',
  ],
  [
    '3）',
    '人為的・偶発的な損傷：砂、汚れた手、輸送などによる機械的損傷（傷、ひび割れなど）、または異物の内部混入による損傷。',
  ],
  [
    '4）',
    '自然災害・環境条件・公共の事象など：地震、火災、水害、落雷、その他の天災、公害、異常電圧、大気汚染、ガス汚染、小動物の行為および環境条件（凍害、カビ、異常電圧、異常水圧、動物・昆虫など）、戦争、暴動、犯罪などの不法行為に起因する故障および損傷。',
  ],
  [
    '5）',
    '水質・水圧および電源の問題：水圧の変動、水質不良など、水道法に定める飲用水の水質基準に適合しない水（温泉水、中水、井戸水など）の使用、配管の腐食、水垢の堆積、水道管内の異物、指定外電源（電圧・周波数）の使用に起因する故障および損傷。',
  ],
  ['6）', '配管への異物（泥・砂など）の流入、水垢や配管の詰まりに起因する故障。'],
  [
    '7）',
    '製品部品の経年使用による外観上の変化（変色、もらい錆など）や使用に伴う自然摩耗、および消耗品（電池、フィルター、発泡剤、パッキンの劣化など）。',
  ],
  [
    '8）',
    '保証書の有効期限切れ、保証書を提示できない場合、または本保証書が正しく記入されていない場合、記載内容が無断で変更された場合。',
  ],
  ['9）', '展示用商品、中古品は本保証の対象外です。'],
  [
    '10）',
    '上記のいずれかの事由に起因する付随的損害（家具、床、壁面などその他の財産への損害や人身傷害）は、当社の無料保証および賠償責任の対象外です。',
  ],
]

export default function WarrantyTerms() {
  return (
    <>
      <section className="warranty-section">
        <div className="warranty-section__inner warranty-terms">
          <h2 className="warranty-section__title">無料修理規定（保証規定）について</h2>

          <ol>
            <li>
              取扱説明書に従った正常なご使用状態で、保証期間内に故障が発生した場合は、無料で修理いたします。
            </li>
            <li>
              無料修理をご希望の場合は、販売店またはJOMOOサービスホットラインにご連絡のうえ、修理をご予約ください。修理の際は本保証書のご提示が必要です。
            </li>
            <li>
              保証期間は、本保証書に記載の引き渡し／販売日から開始します。保証書の記載内容に不備、改ざん、空欄、紛失などがある場合は、
              <ol>
                <li>
                  <span>1）</span>
                  購入時のレシート・領収書などをご提示いただける場合は、販売日を基準に保証いたします。
                </li>
                <li>
                  <span>2）</span>
                  ご購入の販売店に再発行をご依頼ください。
                </li>
              </ol>
            </li>
          </ol>

          <ol>
            <li>本保証書は日本国内でのみ有効です。</li>
            <li>
              保証期間内であっても、以下の場合は修理費用を申し受けます（免責事項）。
              <ol>
                {EXCLUSIONS.map(([marker, text]) => (
                  <li key={marker}>
                    <span>{marker}</span>
                    {text}
                  </li>
                ))}
              </ol>
            </li>
          </ol>

          <p className="warranty-terms__closing">
            本保証書は、本書に記載の保証期間および条件に基づく無料修理をお約束するものであり、お客様の法律上の権利を制限するものではありません。保証などに関してご不明な点がある場合は、ご購入の販売店またはJOMOOサービスホットラインまでお問い合わせください。
          </p>
        </div>
      </section>

      <section className="warranty-section warranty-section--grey">
        <div className="warranty-section__inner warranty-terms warranty-club">
          <h2 className="warranty-section__title">JOMOO倶楽部会員ご登録のお願い</h2>

          <span className="warranty-club__cta">3年間の延長保証特典付き</span>

          <p className="warranty-section__lead">
            お客様に安全・安心してJOMOOスマートトイレをご使用いただくため、ご購入後はJOMOOクラブ会員へのご登録をお願いいたします。
            <br />
            ※登録手続きはとても簡単で、Web登録のみの受付となります。
          </p>

          <p className="warranty-section__lead">
            製品の引き渡し／ご購入から3か月以内に、JOMOO日本公式サイト www.jomoo.com
            にて製品登録を行ってください。住宅用途でご使用の製品は3年間、住宅用途以外でご使用の製品は1年間の無料延長保証をお受けいただけます。
            引き渡し／ご購入日から3か月を過ぎて製品登録を行った場合は、無料延長保証をお受けいただけません。
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
