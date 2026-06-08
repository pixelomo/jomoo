import Image from 'next/image'

const columns = [
  {
    heading: '製品情報',
    links: ['スマートトイレ', '洗面化粧台', '水栓金具', 'シャワーセット'],
  },
  {
    heading: 'インスピレーション',
    links: ['デザインストーリー', 'プロジェクトショーケース'],
  },
  {
    heading: '会社概要',
    links: ['会社紹介', 'ニュース&ブログ'],
  },
  {
    heading: 'お問い合わせ',
    links: ['お客様相談窓口', 'アフターサービスQ&A', '施行動画&チュートリアル', '製品登録', 'コスト計算'],
  },
]

export default function MarketingFooter() {
  return (
    <footer id="contact" style={{ background: '#0A0A0A', padding: '80px 80px 0' }}>
      {/* Link grid */}
      <div style={{
        maxWidth: 1280,
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 48,
        paddingBottom: 60,
      }}>
        {columns.map(col => (
          <div key={col.heading}>
            <p style={{
              fontFamily: 'var(--font-noto-sans-jp, sans-serif)',
              fontWeight: 500,
              fontSize: 13,
              color: '#fff',
              letterSpacing: '0.1em',
              margin: '0 0 20px',
            }}>
              {col.heading}
            </p>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {col.links.map(link => (
                <li key={link}>
                  <a
                    href="#"
                    style={{
                      fontFamily: 'var(--font-noto-sans-jp, sans-serif)',
                      fontWeight: 300,
                      fontSize: 13,
                      color: 'var(--jomoo-grey)',
                      lineHeight: 2.4,
                      display: 'block',
                      transition: 'color 0.2s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'var(--jomoo-grey)')}
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div style={{
        borderTop: '1px solid #1E1E1E',
        maxWidth: 1280,
        margin: '0 auto',
        paddingTop: 28,
        paddingBottom: 28,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 16,
      }}>
        <Image src="/logo.png" alt="JOMOO" width={90} height={18} style={{ objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
        <p style={{
          fontFamily: 'var(--font-noto-sans-jp, sans-serif)',
          fontWeight: 300,
          fontSize: 11,
          color: 'var(--jomoo-grey)',
          margin: 0,
        }}>
          © JOMOO KITCHEN &amp; BATH CO., LTD. All Rights Reserved.
        </p>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          {(['プライバシーポリシー', '利用規約', 'サイトマップ'] as const).map((link, i) => (
            <span key={link} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              {i > 0 && <span style={{ color: '#3A3A3A', fontSize: 11 }}>|</span>}
              <a
                href="#"
                style={{
                  fontFamily: 'var(--font-noto-sans-jp, sans-serif)',
                  fontWeight: 300,
                  fontSize: 11,
                  color: 'var(--jomoo-grey)',
                  transition: 'color 0.2s',
                }}
                onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--jomoo-grey)')}
              >
                {link}
              </a>
            </span>
          ))}
        </div>
      </div>
    </footer>
  )
}
