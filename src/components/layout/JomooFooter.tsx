/* eslint-disable @next/next/no-img-element */
/* Plain <a> throughout, to match JomooNav — see the note there. */
/* eslint-disable @next/next/no-html-link-for-pages */
'use client'

import { FaLinkedinIn } from 'react-icons/fa6'
import {
  SiFacebook,
  SiInstagram,
  SiWechat,
  SiX,
  SiYoutube,
} from 'react-icons/si'

const SOCIAL_LINKS = [
  { label: 'Facebook', href: '#', Icon: SiFacebook },
  { label: 'Instagram', href: '#', Icon: SiInstagram },
  { label: 'YouTube', href: '#', Icon: SiYoutube },
  { label: 'WeChat', href: '#', Icon: SiWechat },
  { label: 'LinkedIn', href: '#', Icon: FaLinkedinIn },
  { label: 'X', href: '#', Icon: SiX },
] as const

export default function JomooFooter() {
  const year = new Date().getFullYear()

  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__brand">
          <div className="footer__logo">
            <img src="/logo.svg" alt="JOMOO" />
          </div>
          <div className="footer__social">
            {SOCIAL_LINKS.map(({ label, href, Icon }) => (
              <a key={label} href={href} aria-label={label}>
                <Icon aria-hidden="true" />
              </a>
            ))}
          </div>
        </div>

        <div className="footer__cols">
          <div className="footer__col">
            <h4>製品情報</h4>
            <ul>
              <li><a href="/products/smart-toilet">スマートトイレ</a></li>
              <li><a href="/products/washstand">洗面化粧台</a></li>
              <li><a href="/products/faucets">水栓金具</a></li>
              <li><a href="/products/shower-set">シャワーセット</a></li>
            </ul>
          </div>

          <div className="footer__col">
            <h4>お問い合わせ</h4>
            <ul>
              <li><a href="/contact-us">お客様相談窓口</a></li>
              <li><a href="#">アフターサービス</a></li>
              <li><a href="#">Q&amp;A</a></li>
              <li><a href="#">施工動画&amp;チュートリアル</a></li>
            </ul>
          </div>

          <div className="footer__col">
            <h4>インスピレーション</h4>
            <ul>
              <li><a href="/inspiration">デザインストーリー</a></li>
              <li><a href="/inspiration">プロジェクトショーケース</a></li>
            </ul>
          </div>

          <div className="footer__col">
            <h4>会社概要</h4>
            <ul>
              <li><a href="/company-information">会社紹介</a></li>
              <li><a href="#">ニュース＆ブログ</a></li>
              <li className="footer__li--gap">
                <a href="/register" className="footer__link--bold">
                  製品登録
                </a>
              </li>
              <li className="footer__li--gap">
                <a href="#" className="footer__link--bold">
                  コスト計算
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <hr className="footer__divider" />

      <div className="footer__bottom">
        <span>© {year} JOMOO KITCHEN &amp; BATH CO., LTD. All Rights Reserved.</span>
        <span className="footer__legal">
          <a href="#">プライバシーポリシー</a>
          <a href="#">利用規約</a>
          <a href="#">サイトマップ</a>
        </span>
      </div>
    </footer>
  )
}
