import { getTranslations } from 'next-intl/server'
import Link from 'next/link'

export default async function Footer() {
  const t = await getTranslations('footer')
  const year = new Date().getFullYear()

  return (
    <footer className="jm-footer-new">
      <div className="jm-footer-top-new">
        {/* Brand column */}
        <div>
          <div style={{ fontFamily: 'ui-monospace,monospace', fontWeight: 800, fontSize: 28, letterSpacing: '0.02em', color: 'var(--ink)' }}>
            JOMOO<span style={{ color: 'var(--accent)' }}>.</span>
          </div>
          <div style={{ fontSize: 12, lineHeight: 1.9, color: 'var(--ink-2)', marginTop: 16 }}>
            <b style={{ fontWeight: 700, color: 'var(--ink)' }}>{t('companyName')}</b><br />
            〒107-0061 東京都港区北青山3-6-1<br />
            青山パークタワー 14F<br />
            TEL: 03-1234-5678（代表）<br />
            {t('businessHours')}
          </div>
          {/* Newsletter */}
          <div style={{ marginTop: 20, border: '1px solid var(--line)', padding: '3px 3px 3px 12px', display: 'flex', gap: 6, alignItems: 'center', maxWidth: 320 }}>
            <input type="email" placeholder={t('newsletterPlaceholder')} style={{ flex: 1, border: 0, background: 'transparent', outline: 'none', fontFamily: 'inherit', fontSize: 12, padding: '9px 0' }} />
            <button type="button" style={{ border: 0, background: 'var(--ink)', color: '#fff', padding: '9px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
              {t('newsletterBtn')}
            </button>
          </div>
        </div>

        {/* Products */}
        <FooterCol heading={t('colProducts')}>
          <FooterLink href="/products/smart-toilet">{t('smartToilet')}</FooterLink>
          <FooterLink href="/products/faucets">{t('faucets')}</FooterLink>
          <FooterLink href="/products/shower-set">{t('showerSet')}</FooterLink>
          <FooterLink href="/products/washstand">{t('washstand')}</FooterLink>
          <FooterLink href="#">{t('kitchen')}</FooterLink>
          <FooterLink href="#">{t('accessories')}</FooterLink>
        </FooterCol>

        {/* Support */}
        <FooterCol heading={t('colSupport')}>
          <FooterLink href="#">{t('findInstaller')}</FooterLink>
          <FooterLink href="#">{t('repairRequest')}</FooterLink>
          <FooterLink href="#">{t('manuals')}</FooterLink>
          <FooterLink href="#">{t('cadData')}</FooterLink>
          <FooterLink href="#">{t('faq')}</FooterLink>
          <FooterLink href="#">{t('contact')}</FooterLink>
        </FooterCol>

        {/* Brand */}
        <FooterCol heading={t('colBrand')}>
          <FooterLink href="#">{t('companyInfo')}</FooterLink>
          <FooterLink href="#">{t('news')}</FooterLink>
          <FooterLink href="#">{t('designStory')}</FooterLink>
          <FooterLink href="#">{t('sustainability')}</FooterLink>
          <FooterLink href="#">{t('careers')}</FooterLink>
        </FooterCol>

        {/* Other */}
        <FooterCol heading={t('colOther')}>
          <FooterLink href="#">{t('showroomList')}</FooterLink>
          <FooterLink href="#">{t('catalog')}</FooterLink>
          <FooterLink href="/register">{t('productRegistration')}</FooterLink>
          <FooterLink href="#">{t('proPortal')}</FooterLink>
          <FooterLink href="#">{t('siteMap')}</FooterLink>
        </FooterCol>
      </div>

      {/* Mid: social */}
      <div style={{ maxWidth: 1440, margin: '0 auto', padding: '24px 40px', borderBottom: '1px solid var(--line)', display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          {([
            { label: 'Instagram', path: <><rect x="3" y="3" width="18" height="18" rx="4" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r={0.6} fill="currentColor" stroke="none" /></> },
            { label: 'YouTube',   path: <><rect x="2" y="6" width="20" height="12" rx="3" /><path d="m10 9 5 3-5 3z" fill="currentColor" stroke="none" /></> },
            { label: 'X',         path: <path d="M4 4l16 16M20 4 4 20" /> },
            { label: 'LINE',      path: <path d="M3 10c0-4 4-7 9-7s9 3 9 7-4 7-9 7c-1 0-2 0-3-.2L4 19l.8-3.5C3.7 14 3 12 3 10z" /> },
          ]).map(({ label, path }) => (
            <a key={label} href="#" aria-label={label} style={{ width: 36, height: 36, border: '1px solid var(--line)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-2)' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                {path}
              </svg>
            </a>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{ maxWidth: 1440, margin: '0 auto', padding: '20px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11, color: 'var(--ink-3)', letterSpacing: '0.02em', flexWrap: 'wrap', gap: 12 }}>
        <div>© {year} JOMOO JAPAN 株式会社 — {t('rights')}</div>
        <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap' }}>
          <a href="#" style={{ color: 'inherit' }}>{t('privacy')}</a>
          <a href="#" style={{ color: 'inherit' }}>{t('legal')}</a>
          <a href="#" style={{ color: 'inherit' }}>{t('cookies')}</a>
          <a href="#" style={{ color: 'inherit' }}>{t('siteMap')}</a>
        </div>
      </div>
    </footer>
  )
}

function FooterCol({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <div>
      <h6 style={{ fontSize: 12, letterSpacing: '0.04em', color: 'var(--ink)', fontWeight: 700, marginBottom: 14, paddingBottom: 10, borderBottom: '1px solid var(--line)' }}>
        {heading}
      </h6>
      <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>{children}</ul>
    </div>
  )
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link href={href} style={{ fontSize: 12, color: 'var(--ink-2)', textDecoration: 'none' }}>{children}</Link>
    </li>
  )
}
