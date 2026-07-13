/* eslint-disable @next/next/no-img-element */
'use client'

import { useLocale } from 'next-intl'

export default function JomooFooter() {
  const locale = useLocale()

  return (
    <footer className="footer">
      <div className="footer__inner">
        <div>
          <div className="footer__logo">
            <img src="/logo.svg" alt="JOMOO" />
          </div>
          <div className="footer__tag">水まわりを、美しく。</div>
        </div>
        <div className="footer__cols">
          <div className="footer__col">
            <h4>製品情報</h4>
            <ul>
              <li><a href={`/${locale}/products/smart-toilet`}>スマートトイレ</a></li>
              <li><a href={`/${locale}/products/washstand`}>洗面化粧台</a></li>
              <li><a href={`/${locale}/products/faucets`}>水栓金具</a></li>
              <li><a href={`/${locale}/products/shower-set`}>シャワーセット</a></li>
            </ul>
          </div>
          <div className="footer__col">
            <h4>お問い合わせ</h4>
            <ul>
              <li><a href={`/${locale}/contact-us`}>お客様相談窓口</a></li>
              <li><a href="#">アフターサービスQ&amp;A</a></li>
              <li><a href="#">施工動画&amp;チュートリアル</a></li>
            </ul>
          </div>
          <div className="footer__col">
            <h4>インスピレーション</h4>
            <ul>
              <li><a href={`/${locale}/inspiration`}>デザインストーリー</a></li>
              <li><a href={`/${locale}/inspiration`}>プロジェクトショーケース</a></li>
            </ul>
          </div>
          <div className="footer__col">
            <h4>会社概要</h4>
            <ul>
              <li><a href={`/${locale}/company-information`}>会社紹介</a></li>
              <li><a href="#">ニュース&amp;ブログ</a></li>
              <li><a href={`/${locale}/register`}>製品登録</a></li>
              <li><a href="#">コスト計算</a></li>
            </ul>
          </div>
        </div>
      </div>
      <div className="footer__bottom">
        <span>© 2026 JOMOO KITCHEN &amp; BATH CO., LTD. All Rights Reserved.</span>
        <span className="footer__legal">
          <a href="#">プライバシーポリシー</a>
          <a href="#">利用規約</a>
          <a href="#">サイトマップ</a>
        </span>
      </div>
    </footer>
  )
}
