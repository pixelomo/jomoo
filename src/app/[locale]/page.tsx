import { getTranslations } from 'next-intl/server'
import { Show } from '@clerk/nextjs'
import Link from 'next/link'
import HeroSection from '@/components/home/HeroSection'
import SeriesSection from '@/components/home/SeriesSection'
import type { HeroSlide } from '@/components/home/HeroSection'

const newsItems = [
  { date: '2026.05.08', tag: '重要', tagWarn: true, text: 'システムメンテナンス実施のお知らせ (5月20日 2:00〜6:00)' },
  { date: '2026.05.08', tag: '新製品', tagWarn: false, text: '新シリーズ「澄(SUMI)」全国12ショールームで展示開始のお知らせ' },
  { date: '2026.04.22', tag: 'イベント', tagWarn: false, text: '建築家・井上彩氏を招いたトークイベントを青山店にて開催します' },
  { date: '2026.04.05', tag: 'プレス', tagWarn: false, text: 'JOMOO Japan、グッドデザイン賞2026に4製品が選出されました' },
  { date: '2026.03.18', tag: 'サポート', tagWarn: false, text: 'ゴールデンウィーク期間中のお問い合わせ窓口営業について' },
  { date: '2026.03.02', tag: '新製品', tagWarn: false, text: 'センサー水栓「霞(KASUMI)」シリーズにマットブラック仕上げを追加' },
]

export default async function HomePage() {
  const t = await getTranslations('home')

  const slides: HeroSlide[] = [
    {
      badge: t('heroBadge1'),
      title: t('heroTitle1'),
      lead: t('heroLead1'),
      btn1Label: t('heroBtn1'),
      btn1Href: '/products/smart-toilet',
      btn2Label: t('heroBtn2'),
      btn2Href: '#',
      bg: 'dark',
    },
    {
      badge: t('heroBadge2'),
      title: t('heroTitle2'),
      lead: t('heroLead2'),
      btn1Label: t('heroBtn3'),
      btn1Href: '/products/smart-toilet',
      btn2Label: t('heroBtn4'),
      btn2Href: '#',
      bg: 'blue',
    },
    {
      badge: t('heroBadge3'),
      title: t('heroTitle3'),
      lead: t('heroLead3'),
      btn1Label: t('heroBtn5'),
      btn1Href: '#',
      btn2Label: t('heroBtn6'),
      btn2Href: '#',
      bg: 'light',
    },
  ]

  const seriesTabs = [
    t('seriesTabAll'), t('seriesTabToilet'), t('seriesTabFaucet'),
    t('seriesTabShower'), t('seriesTabWash'), t('seriesTabNew'),
  ]

  const seriesCards = [
    { img: 'SUMI Z-7600', catPill: t('seriesTabToilet') + ' · スマート', code: 'Z-7600', title: '澄 / SUMI シリーズ', desc: '最小奥行640mm。狭小空間にも美しく収まる、フラッグシップ・スマートトイレ。', price: '¥328,000〜', tab: t('seriesTabToilet') },
    { img: 'KASUMI F-3201', catPill: t('seriesTabFaucet') + ' · センサー', code: 'F-3201', title: '霞 / KASUMI', desc: '手の動きを読むタッチレス水栓。4色展開。', price: '¥86,000〜', tab: t('seriesTabFaucet') },
    { img: 'RIN S-8804', catPill: t('seriesTabShower') + ' · システム', code: 'S-8804', title: '凛 / RIN レインシャワー', desc: '300mm幅オーバーヘッド + 3モード手元。サーモスタット式。', price: '¥152,000〜', tab: t('seriesTabShower') },
    { img: 'HAKU B-2401', catPill: t('seriesTabWash') + ' · カウンター', code: 'B-2401', title: '白 / HAKU カウンター', desc: 'マットセラミック仕上げ。1200/1500/1800mm幅。', price: '¥218,000〜', tab: t('seriesTabWash') },
  ]

  return (
    <main>
      {/* ── HERO ── */}
      <HeroSection slides={slides} />

      {/* ── QUICK SHORTCUTS ── */}
      <div className="jm-shortcuts">
        <div className="jm-sc-inner">
          {[
            { icon: 'grid', label: t('shortcutsProducts'), sub: 'PRODUCTS', href: '/products/smart-toilet' },
            { icon: 'home', label: t('shortcutsShowroom'), sub: 'SHOWROOM', href: '#' },
            { icon: 'doc', label: t('shortcutsCatalog'), sub: 'CATALOG', href: '#' },
            { icon: 'clock', label: t('shortcutsSupport'), sub: 'SUPPORT', href: '#' },
            { icon: 'file', label: t('shortcutsDownload'), sub: 'DOWNLOAD', href: '#' },
            { icon: 'refresh', label: t('shortcutsInstaller'), sub: 'INSTALLER', href: '#' },
          ].map(({ icon, label, sub, href }) => (
            <Link key={sub} href={href} className="jm-sc" style={{ textDecoration: 'none', color: 'var(--ink)' }}>
              <span style={{ width: 36, height: 36, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'var(--accent-soft)', color: 'var(--accent)', flexShrink: 0 }}>
                <ShortcutIcon type={icon} />
              </span>
              <span style={{ display: 'flex', flexDirection: 'column', gap: 2, lineHeight: 1.3 }}>
                {label}
                <small style={{ fontFamily: 'ui-monospace,monospace', fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.06em' }}>{sub}</small>
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* ── PRODUCT CATEGORIES ── */}
      <section className="jm-sec">
        <div className="jm-sec-inner">
          <div className="jm-sec-head">
            <div>
              <div style={{ fontFamily: 'ui-monospace,monospace', fontSize: 12, letterSpacing: '0.1em', color: 'var(--ink-3)', fontWeight: 600, marginBottom: 14 }}>
                01 / {t('catSectionNum')}
              </div>
              <h2 style={{ fontSize: 28, fontWeight: 700, lineHeight: 1.4, letterSpacing: '0.01em', paddingBottom: 14, borderBottom: '4px solid var(--accent)', display: 'inline-block', marginBottom: 12 }}>
                {t('catSectionTitle')}
              </h2>
              <p style={{ fontSize: 14, color: 'var(--ink-3)', marginTop: 12 }}>{t('catSectionSub')}</p>
            </div>
            <Link href="/products/smart-toilet" style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)', display: 'inline-flex', gap: 8, alignItems: 'center', padding: '10px 18px', border: '1px solid var(--line)', textDecoration: 'none', whiteSpace: 'nowrap' }}>
              {t('catMore')} →
            </Link>
          </div>

          <div className="jm-cats">
            {([
              { slug: 'smart-toilet', num: 'CATEGORY 01', count: t('cat1Count'), title: t('cat1Title'), desc: t('cat1Desc'), subs: [t('cat1Sub1'), t('cat1Sub2'), t('cat1Sub3'), t('cat1Sub4')], bg: 'dark' as const },
              { slug: 'faucets',      num: 'CATEGORY 02', count: t('cat2Count'), title: t('cat2Title'), desc: t('cat2Desc'), subs: [t('cat2Sub1'), t('cat2Sub2'), t('cat2Sub3'), t('cat2Sub4')], bg: 'light' as const },
              { slug: 'shower-set',  num: 'CATEGORY 03', count: t('cat3Count'), title: t('cat3Title'), desc: t('cat3Desc'), subs: [t('cat3Sub1'), t('cat3Sub2'), t('cat3Sub3'), t('cat3Sub4')], bg: 'dark' as const },
              { slug: 'washstand',   num: 'CATEGORY 04', count: t('cat4Count'), title: t('cat4Title'), desc: t('cat4Desc'), subs: [t('cat4Sub1'), t('cat4Sub2'), t('cat4Sub3'), t('cat4Sub4')], bg: 'light' as const },
            ] as const).map(({ slug, num, count, title, desc, subs, bg }) => (
              <Link key={slug} href={`/products/${slug}`} style={{ display: 'flex', flexDirection: 'column', background: 'var(--paper)', border: '1px solid var(--line)', textDecoration: 'none', color: 'var(--ink)' }}>
                <div style={{ position: 'relative', aspectRatio: '4/3', background: '#f5f5f5', overflow: 'hidden' }}>
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: bg === 'dark'
                      ? 'repeating-linear-gradient(45deg,rgba(0,0,0,0.04) 0 1px,transparent 1px 16px),linear-gradient(180deg,#d8d3c6 0%,#b8b1a0 100%)'
                      : 'repeating-linear-gradient(45deg,rgba(0,0,0,0.03) 0 1px,transparent 1px 16px),linear-gradient(180deg,#efece4 0%,#d6d1c5 100%)',
                    display: 'flex', alignItems: 'flex-end', padding: 12,
                  }}>
                    <span style={{ fontFamily: 'ui-monospace,monospace', fontSize: 10, letterSpacing: '0.08em', opacity: 0.7, color: bg === 'dark' ? '#cfd3d8' : '#4a4a4a' }}>
                      {title}
                    </span>
                  </div>
                </div>
                <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: 'ui-monospace,monospace', fontSize: 11, letterSpacing: '0.06em', color: 'var(--ink-3)' }}>
                    <span style={{ color: 'var(--accent)', fontWeight: 700 }}>{num}</span>
                    <span>{count}</span>
                  </div>
                  <div style={{ fontSize: 20, fontWeight: 700, lineHeight: 1.4 }}>{title}</div>
                  <p style={{ fontSize: 12, lineHeight: 1.85, color: 'var(--ink-2)' }}>{desc}</p>
                  <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
                    {subs.map(s => (
                      <li key={s} style={{ fontSize: 11, padding: '4px 9px', background: 'var(--bg-soft)', color: 'var(--ink-2)', border: '1px solid var(--line)' }}>{s}</li>
                    ))}
                  </ul>
                  <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 14, borderTop: '1px solid var(--line)', fontSize: 13, fontWeight: 700 }}>
                    {t('catLink')} →
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── BROWSE BY SPACE ── */}
      <section className="jm-sec" style={{ background: 'var(--bg-soft)' }}>
        <div className="jm-sec-inner">
          <div className="jm-sec-head">
            <div>
              <div style={{ fontFamily: 'ui-monospace,monospace', fontSize: 12, letterSpacing: '0.1em', color: 'var(--ink-3)', fontWeight: 600, marginBottom: 14 }}>
                02 / {t('spaceSectionNum')}
              </div>
              <h2 style={{ fontSize: 28, fontWeight: 700, lineHeight: 1.4, paddingBottom: 14, borderBottom: '4px solid var(--accent)', display: 'inline-block', marginBottom: 12 }}>
                {t('spaceSectionTitle')}
              </h2>
              <p style={{ fontSize: 14, color: 'var(--ink-3)', marginTop: 12 }}>{t('spaceSectionSub')}</p>
            </div>
            <a href="#" style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)', display: 'inline-flex', gap: 8, alignItems: 'center', padding: '10px 18px', border: '1px solid var(--line)', textDecoration: 'none', whiteSpace: 'nowrap' }}>
              {t('spaceMore')} →
            </a>
          </div>

          <div className="jm-spaces">
            {([
              { label: t('space1'), en: 'BATHROOM',    bg: 'linear-gradient(180deg,#e8e6e0 0%,#cdc8bd 100%)' },
              { label: t('space2'), en: 'POWDER ROOM', bg: 'linear-gradient(180deg,#d6dde5 0%,#afbcc9 100%)' },
              { label: t('space3'), en: 'TOILET',      bg: 'linear-gradient(180deg,#ddd4cb 0%,#c0b3a4 100%)' },
              { label: t('space4'), en: 'KITCHEN',     bg: 'linear-gradient(180deg,#ced3d8 0%,#a0a8b0 100%)' },
              { label: t('space5'), en: 'PUBLIC',      bg: 'linear-gradient(180deg,#e3dcd0 0%,#c6bba8 100%)' },
            ]).map(({ label, en, bg }) => (
              <a key={en} href="#" style={{ background: 'var(--paper)', border: '1px solid var(--line)', aspectRatio: '4/5', position: 'relative', overflow: 'hidden', display: 'block', textDecoration: 'none' }}>
                <div style={{ position: 'absolute', inset: 0, background: bg }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,transparent 50%,rgba(0,0,0,0.55) 100%)' }} />
                <div style={{ position: 'absolute', left: 16, right: 16, bottom: 16, color: '#fff', zIndex: 2 }}>
                  <div style={{ fontFamily: 'ui-monospace,monospace', fontSize: 11, letterSpacing: '0.1em', opacity: 0.8 }}>{en}</div>
                  <div style={{ fontSize: 18, fontWeight: 700, marginTop: 4, display: 'flex', alignItems: 'center', gap: 8 }}>{label} →</div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── TECHNOLOGY ── */}
      <section className="jm-sec">
        <div className="jm-sec-inner">
          <div className="jm-sec-head">
            <div>
              <div style={{ fontFamily: 'ui-monospace,monospace', fontSize: 12, letterSpacing: '0.1em', color: 'var(--ink-3)', fontWeight: 600, marginBottom: 14 }}>
                03 / {t('techSectionNum')}
              </div>
              <h2 style={{ fontSize: 28, fontWeight: 700, lineHeight: 1.4, paddingBottom: 14, borderBottom: '4px solid var(--accent)', display: 'inline-block', marginBottom: 12 }}>
                {t('techSectionTitle')}
              </h2>
              <p style={{ fontSize: 14, color: 'var(--ink-3)', marginTop: 12 }}>{t('techSectionSub')}</p>
            </div>
            <a href="#" style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)', display: 'inline-flex', gap: 8, alignItems: 'center', padding: '10px 18px', border: '1px solid var(--line)', textDecoration: 'none', whiteSpace: 'nowrap' }}>
              {t('techMore')} →
            </a>
          </div>

          {/* Tech story 1 */}
          <div className="jm-tech-grid">
            <TechVisual dark specs={[['SAMPLE', 'NG-04 / CERAMIC'], ['SURFACE', 'Ra 0.04 μm'], ['ANGLE', '105°']]} caption="断面図 · ナノガラスコーティング" />
            <TechBody
              badge={t('tech1Badge')}
              title={t('tech1Title')}
              lead={t('tech1Lead')}
              stats={[
                { num: '87', unit: '%', label: t('tech1Stat1Label') },
                { num: '3.8', unit: 'L', label: t('tech1Stat2Label') },
                { num: '30', unit: t('tech1Stat3Unit'), label: t('tech1Stat3Label') },
              ]}
              feats={[t('tech1Feat1'), t('tech1Feat2'), t('tech1Feat3')]}
            />
          </div>

          {/* Tech story 2 (reversed) */}
          <div className="jm-tech-grid reverse">
            <TechVisual specs={[['NOISE', '42 dB MAX'], ['PRESSURE', '0.05 MPa MIN'], ['CYCLE', '2.4 s']]} caption="マクロ写真 · 給水ノズル" />
            <TechBody
              badge={t('tech2Badge')}
              title={t('tech2Title')}
              lead={t('tech2Lead')}
              stats={[
                { num: '42', unit: 'dB', label: t('tech2Stat1Label') },
                { num: '0.05', unit: 'MPa', label: t('tech2Stat2Label') },
                { num: '5', unit: t('tech2Stat3Unit'), label: t('tech2Stat3Label') },
              ]}
              feats={[t('tech2Feat1'), t('tech2Feat2'), t('tech2Feat3')]}
            />
          </div>
        </div>
      </section>

      {/* ── FEATURE BANNERS ── */}
      <section className="jm-sec" style={{ background: 'var(--bg-soft)' }}>
        <div className="jm-sec-inner">
          <div className="jm-sec-head">
            <div>
              <div style={{ fontFamily: 'ui-monospace,monospace', fontSize: 12, letterSpacing: '0.1em', color: 'var(--ink-3)', fontWeight: 600, marginBottom: 14 }}>
                04 / {t('featSectionNum')}
              </div>
              <h2 style={{ fontSize: 28, fontWeight: 700, lineHeight: 1.4, paddingBottom: 14, borderBottom: '4px solid var(--accent)', display: 'inline-block' }}>
                {t('featSectionTitle')}
              </h2>
            </div>
            <a href="#" style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)', display: 'inline-flex', gap: 8, alignItems: 'center', padding: '10px 18px', border: '1px solid var(--line)', textDecoration: 'none', whiteSpace: 'nowrap' }}>
              {t('featMore')} →
            </a>
          </div>

          <div className="jm-pickup-grid">
            {([
              { tag: t('feat1Tag'), title: t('feat1Title'), bg: 'linear-gradient(180deg,#2a2f36 0%,#15181d 100%)' },
              { tag: t('feat2Tag'), title: t('feat2Title'), bg: 'linear-gradient(180deg,#2452c7 0%,#0a2a82 100%)' },
              { tag: t('feat3Tag'), title: t('feat3Title'), bg: 'linear-gradient(180deg,#d8d3c6 0%,#b8b1a0 100%)' },
            ]).map(({ tag, title, bg }) => (
              <a key={tag} href="#" style={{ aspectRatio: '16/9', background: 'var(--bg-soft)', border: '1px solid var(--line)', position: 'relative', overflow: 'hidden', display: 'flex', textDecoration: 'none' }}>
                <div style={{ position: 'absolute', inset: 0, background: bg }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,rgba(0,0,0,0) 40%,rgba(0,0,0,0.65) 100%)' }} />
                <div style={{ position: 'relative', zIndex: 2, padding: 24, color: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', width: '100%' }}>
                  <span style={{ fontFamily: 'ui-monospace,monospace', fontSize: 10, letterSpacing: '0.08em', background: 'rgba(255,255,255,0.18)', padding: '3px 8px', alignSelf: 'flex-start' }}>
                    {tag}
                  </span>
                  <div>
                    <h4 style={{ fontSize: 20, fontWeight: 700, lineHeight: 1.4, marginBottom: 8 }}>{title}</h4>
                    <span style={{ fontFamily: 'ui-monospace,monospace', fontSize: 13, alignSelf: 'flex-end' }}>{t('featRead')} →</span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── SERIES LINEUP (client — tabs) ── */}
      <SeriesSection
        sectionNum={`05 / ${t('seriesSectionNum')}`}
        sectionTitle={t('seriesSectionTitle')}
        moreLabel={t('seriesMore')}
        moreHref="#"
        tabs={seriesTabs}
        cards={seriesCards}
      />

      {/* ── STAT STRIP ── */}
      <section style={{ background: 'var(--ink)', color: 'var(--paper)', padding: '80px 0', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 80% 10%,rgba(0,70,229,0.3),transparent 50%),radial-gradient(circle at 10% 90%,rgba(0,70,229,0.18),transparent 50%)', pointerEvents: 'none' }} />
        <div className="jm-sec-inner" style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ fontFamily: 'ui-monospace,monospace', fontSize: 12, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.5)', fontWeight: 600, marginBottom: 14 }}>
            06 / NUMBERS · {t('statSectionNum')}
          </div>
          <h2 style={{ fontSize: 32, fontWeight: 700, lineHeight: 1.4, maxWidth: 900, paddingBottom: 14, borderBottom: '4px solid var(--accent)', display: 'inline-block', marginBottom: 56 }}>
            {t('statSectionTitle')}
          </h2>
          <div className="jm-strip-stats">
            {([
              { num: t('stat1Num'), unit: t('stat1Unit'), label: t('stat1Label') },
              { num: t('stat2Num'), unit: t('stat2Unit'), label: t('stat2Label') },
              { num: t('stat3Num'), unit: t('stat3Unit'), label: t('stat3Label') },
              { num: t('stat4Num'), unit: t('stat4Unit'), label: t('stat4Label') },
            ]).map(({ num, unit, label }) => (
              <div key={label}>
                <div style={{ fontFamily: 'ui-monospace,monospace', fontSize: 52, fontWeight: 700, display: 'flex', alignItems: 'baseline', gap: 4, letterSpacing: '-0.02em' }}>
                  {num}
                  <small style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}>{unit}</small>
                </div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 8, lineHeight: 1.6 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── NEWS ── */}
      <section className="jm-sec">
        <div className="jm-sec-inner">
          <div className="jm-news-grid">
            {/* Sidebar */}
            <aside>
              <div style={{ fontFamily: 'ui-monospace,monospace', fontSize: 12, letterSpacing: '0.1em', color: 'var(--ink-3)', fontWeight: 600, marginBottom: 14 }}>
                07 / {t('newsSectionNum')}
              </div>
              <h2 style={{ fontSize: 26, fontWeight: 700, paddingBottom: 14, borderBottom: '4px solid var(--accent)', display: 'inline-block', marginBottom: 32 }}>
                {t('newsSectionTitle')}
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {[
                  { label: t('newsFilterAll'), count: '24', active: true },
                  { label: t('newsFilterNew'), count: '9', active: false },
                  { label: t('newsFilterEvent'), count: '6', active: false },
                  { label: t('newsFilterPress'), count: '5', active: false },
                  { label: t('newsFilterSupport'), count: '4', active: false },
                ].map(({ label, count, active }) => (
                  <a key={label} href="#" style={{ padding: '14px 0', borderTop: '1px solid var(--line)', fontSize: 13, display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: active ? 'var(--accent)' : 'var(--ink)', fontWeight: active ? 700 : 400, textDecoration: 'none' }}>
                    <span>{label}</span>
                    <span style={{ fontFamily: 'ui-monospace,monospace', fontSize: 11, color: 'var(--ink-3)', letterSpacing: '0.04em' }}>{count}</span>
                  </a>
                ))}
              </div>
            </aside>

            {/* News list */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {newsItems.map(item => (
                <a key={item.date + item.text} href="#" style={{ padding: '18px 0', borderTop: '1px solid var(--line)', display: 'grid', gridTemplateColumns: '100px 90px 1fr 20px', gap: 20, alignItems: 'center', textDecoration: 'none', color: 'var(--ink)' }}>
                  <span style={{ fontFamily: 'ui-monospace,monospace', fontSize: 12, color: 'var(--ink-3)', letterSpacing: '0.04em' }}>{item.date}</span>
                  <span style={{ fontSize: 10, letterSpacing: '0.05em', color: item.tagWarn ? 'var(--warn)' : 'var(--accent)', padding: '3px 8px', background: item.tagWarn ? 'var(--warn-soft)' : 'var(--accent-soft)', justifySelf: 'start', fontWeight: 600 }}>
                    {item.tag}
                  </span>
                  <h5 style={{ fontSize: 14, fontWeight: 500, lineHeight: 1.6, margin: 0 }}>{item.text}</h5>
                  <span style={{ color: 'var(--ink-3)', justifySelf: 'end' }}>→</span>
                </a>
              ))}
              <div style={{ borderTop: '1px solid var(--line)' }} />
              <div style={{ marginTop: 24 }}>
                <a href="#" style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent)', textDecoration: 'none' }}>{t('newsMore')} →</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PRO PORTAL ── */}
      <section style={{ background: 'var(--ink)', color: 'var(--paper)', padding: '0' }}>
        <div className="jm-sec-inner" style={{ padding: '60px 40px' }}>
          <div className="jm-pro-grid">
            <div>
              <div style={{ fontFamily: 'ui-monospace,monospace', fontSize: 11, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.6)' }}>
                {t('proLabel')}
              </div>
              <h3 style={{ fontSize: 30, fontWeight: 700, margin: '12px 0 16px', lineHeight: 1.4, paddingBottom: 14, borderBottom: '4px solid var(--accent)', display: 'inline-block' }}>
                {t('proTitle')}
              </h3>
              <p style={{ fontSize: 14, lineHeight: 1.9, color: 'rgba(255,255,255,0.85)', maxWidth: 460 }}>{t('proLead')}</p>
              <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
                <Show when="signed-out">
                  <Link href="/sign-in" style={{ background: 'var(--paper)', color: 'var(--ink)', padding: '12px 22px', fontSize: 13, fontWeight: 700, display: 'inline-flex', gap: 10, alignItems: 'center', textDecoration: 'none' }}>
                    {t('proLogin')} →
                  </Link>
                  <Link href="/sign-up" style={{ background: 'transparent', color: '#fff', border: '1px solid rgba(255,255,255,0.4)', padding: '12px 22px', fontSize: 13, fontWeight: 700, display: 'inline-flex', gap: 10, alignItems: 'center', textDecoration: 'none' }}>
                    {t('proRegister')}
                  </Link>
                </Show>
                <Show when="signed-in">
                  <Link href="/dashboard" style={{ background: 'var(--paper)', color: 'var(--ink)', padding: '12px 22px', fontSize: 13, fontWeight: 700, display: 'inline-flex', gap: 10, alignItems: 'center', textDecoration: 'none' }}>
                    {t('memberTitle')} →
                  </Link>
                </Show>
              </div>
            </div>
            <div className="jm-pro-feat">
              {([
                { title: t('pro1Title'), desc: t('pro1Desc') },
                { title: t('pro2Title'), desc: t('pro2Desc') },
                { title: t('pro3Title'), desc: t('pro3Desc') },
                { title: t('pro4Title'), desc: t('pro4Desc') },
              ]).map(({ title, desc }) => (
                <a key={title} href="#" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', padding: 18, display: 'flex', flexDirection: 'column', gap: 6, textDecoration: 'none', color: '#fff' }}>
                  <span style={{ fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>{title} <span style={{ marginLeft: 'auto', fontWeight: 400 }}>→</span></span>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>{desc}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

/* ── Small helper components ── */

function ShortcutIcon({ type }: { type: string }) {
  const paths: Record<string, React.ReactNode> = {
    grid: <><rect x="4" y="4" width="16" height="16" rx="1" /><path d="M4 9h16M9 4v16" /></>,
    home: <><path d="M3 12 12 4l9 8" /><path d="M5 11v9h14v-9" /></>,
    doc:  <><path d="M4 7h16M4 12h16M4 17h10" /></>,
    clock:<><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    file: <><rect x="4" y="2" width="12" height="20" rx="1" /><path d="M8 7h8M8 11h8M8 15h5" /></>,
    refresh:<><path d="M21 12a9 9 0 1 1-9-9" /><path d="m15 3 6 3-3 6" /></>,
  }
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      {paths[type]}
    </svg>
  )
}

function TechVisual({ dark, specs, caption }: { dark?: boolean; specs: [string, string][]; caption: string }) {
  return (
    <div style={{ aspectRatio: '5/6', position: 'relative', background: dark ? 'linear-gradient(180deg,#2a2f36 0%,#15181d 100%)' : 'linear-gradient(180deg,#efece4 0%,#d6d1c5 100%)', overflow: 'hidden' }}>
      {/* Corner brackets */}
      {(['tl','tr','bl','br'] as const).map(c => (
        <div key={c} style={{
          position: 'absolute', width: 16, height: 16, zIndex: 3,
          ...(c[0] === 't' ? { top: 6 } : { bottom: 6 }),
          ...(c[1] === 'l' ? { left: 6 } : { right: 6 }),
          border: '1px solid rgba(255,255,255,0.6)',
          borderRight: c[1] === 'l' ? 'none' : '1px solid rgba(255,255,255,0.6)',
          borderLeft: c[1] === 'r' ? 'none' : '1px solid rgba(255,255,255,0.6)',
          borderBottom: c[0] === 't' ? 'none' : '1px solid rgba(255,255,255,0.6)',
          borderTop: c[0] === 'b' ? 'none' : '1px solid rgba(255,255,255,0.6)',
        }} />
      ))}
      {/* Data overlay */}
      <div style={{ position: 'absolute', left: 16, top: 16, fontFamily: 'ui-monospace,monospace', fontSize: 10, color: '#fff', background: 'rgba(0,0,0,0.7)', padding: '8px 10px', letterSpacing: '0.06em', lineHeight: 1.7, zIndex: 3 }}>
        {specs.map(([label, val]) => (
          <div key={label} style={{ display: 'flex', gap: 16, justifyContent: 'space-between' }}>
            <span style={{ color: 'rgba(255,255,255,0.6)' }}>{label}</span>
            <span>{val}</span>
          </div>
        ))}
      </div>
      {/* Caption */}
      <div style={{ position: 'absolute', bottom: 16, left: 16, fontFamily: 'ui-monospace,monospace', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '3px 8px', border: '1px solid currentColor', opacity: 0.7, color: dark ? '#cfd3d8' : '#4a4a4a' }}>
        {caption}
      </div>
    </div>
  )
}

function TechBody({ badge, title, lead, stats, feats }: {
  badge: string; title: string; lead: string;
  stats: { num: string; unit: string; label: string }[];
  feats: string[];
}) {
  return (
    <div style={{ paddingRight: 24 }}>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: 'ui-monospace,monospace', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', padding: '5px 10px', background: 'var(--accent-soft)', color: 'var(--accent)' }}>
        ● {badge}
      </span>
      <h3 style={{ fontSize: 26, fontWeight: 700, lineHeight: 1.4, margin: '16px 0', paddingBottom: 14, borderBottom: '4px solid var(--accent)', display: 'inline-block' }}>
        {title}
      </h3>
      <p style={{ fontSize: 14, lineHeight: 2, color: 'var(--ink-2)', marginTop: 8 }}>{lead}</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20, marginTop: 32, paddingTop: 24, borderTop: '1px solid var(--line)' }}>
        {stats.map(({ num, unit, label }) => (
          <div key={label}>
            <div style={{ fontFamily: 'ui-monospace,monospace', fontSize: 32, fontWeight: 700, color: 'var(--accent)', display: 'flex', alignItems: 'baseline', gap: 4, letterSpacing: '-0.02em' }}>
              {num}<small style={{ fontSize: 14, color: 'var(--ink-2)', fontWeight: 500 }}>{unit}</small>
            </div>
            <div style={{ fontSize: 12, letterSpacing: '0.04em', color: 'var(--ink-3)', marginTop: 4 }}>{label}</div>
          </div>
        ))}
      </div>
      <ul style={{ listStyle: 'none', margin: '24px 0 0', padding: 0, display: 'flex', flexDirection: 'column' }}>
        {feats.map(feat => (
          <li key={feat} style={{ padding: '12px 0', borderTop: '1px solid var(--line)', display: 'grid', gridTemplateColumns: '24px 1fr', gap: 12, fontSize: 13, lineHeight: 1.7 }}>
            <span style={{ width: 18, height: 18, background: 'var(--accent)', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, marginTop: 1 }}>✓</span>
            <span>{feat}</span>
          </li>
        ))}
        <li style={{ borderTop: '1px solid var(--line)' }} />
      </ul>
    </div>
  )
}
