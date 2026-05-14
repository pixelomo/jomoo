import { getTranslations } from 'next-intl/server'
import Link from 'next/link'

export default async function Footer() {
  const t = await getTranslations('footer')
  const year = new Date().getFullYear()

  return (
    <footer style={{ background: 'var(--footer-grey)', color: '#fff' }}>
      {/* Social row */}
      <div className="jm-footer-top">
        <span style={{ fontSize: '14px', fontWeight: 600, letterSpacing: '0.08em', flexShrink: 0 }}>
          {t('social')}
        </span>
        <div style={{ display: 'flex', gap: '4px', background: 'var(--footer-grey-dark)', padding: '6px' }}>
          <SocialBtn label="Facebook">
            <path d="M13 22v-8h3l.5-4H13V7.5c0-1.2.4-2 2-2H17V2.2C16.6 2.2 15.4 2 14 2c-3 0-5 1.8-5 5.2V10H6v4h3v8h4z" />
          </SocialBtn>
          <SocialBtn label="Instagram" stroke>
            <rect x="3" y="3" width="18" height="18" rx="5" />
            <circle cx="12" cy="12" r="4" />
            <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
          </SocialBtn>
          <SocialBtn label="YouTube">
            <path d="M22 7.5c-.2-1.7-.9-2.4-2.5-2.6C17.7 4.6 12 4.6 12 4.6s-5.7 0-7.5.3C2.9 5.1 2.2 5.8 2 7.5 1.7 9.3 1.7 12 1.7 12s0 2.7.3 4.5c.2 1.7.9 2.4 2.5 2.6 1.8.3 7.5.3 7.5.3s5.7 0 7.5-.3c1.6-.2 2.3-.9 2.5-2.6.3-1.8.3-4.5.3-4.5s0-2.7-.3-4.5zM10 15.5v-7l6 3.5-6 3.5z" />
          </SocialBtn>
          <SocialBtn label="X">
            <path d="M18.2 3h3.3l-7.2 8.2L23 21h-6.7l-5.2-6.8L5.1 21H1.8l7.7-8.8L1.3 3h6.9l4.7 6.2L18.2 3zm-1.2 16h1.8L7.1 4.9H5.2L17 19z" />
          </SocialBtn>
          <SocialBtn label="LinkedIn">
            <path d="M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2zM8.3 18H5.7V9.6h2.6V18zM7 8.4a1.5 1.5 0 110-3 1.5 1.5 0 010 3zM18.3 18h-2.6v-4.4c0-1.1-.4-1.8-1.4-1.8s-1.5.6-1.7 1.2c-.1.2-.1.5-.1.8V18h-2.6V9.6h2.6v1.2c.4-.5 1-1.4 2.5-1.4 1.9 0 3.3 1.2 3.3 3.8V18z" />
          </SocialBtn>
        </div>
      </div>

      {/* Link columns */}
      <div className="jm-footer-mid">
        <FooterCol heading={t('colProducts')}>
          <FooterLink href="/products/smart-toilet">{t('smartToilet')}</FooterLink>
          <FooterLink href="/products/washstand">{t('washstand')}</FooterLink>
          <FooterLink href="/products/faucets">{t('faucets')}</FooterLink>
          <FooterLink href="/products/shower-set">{t('showerSet')}</FooterLink>
        </FooterCol>
        <FooterCol heading={t('colInspiration')}>
          <FooterLink href="#">{t('designStory')}</FooterLink>
          <FooterLink href="#">{t('projectShowcase')}</FooterLink>
        </FooterCol>
        <FooterCol heading={t('colCompany')}>
          <FooterLink href="#">{t('companyInfo')}</FooterLink>
          <FooterLink href="#">{t('news')}</FooterLink>
        </FooterCol>
        <FooterCol heading={t('colContact')}>
          <FooterLink href="#">{t('customerService')}</FooterLink>
          <FooterLink href="#">{t('afterService')}</FooterLink>
          <FooterLink href="#">{t('installVideos')}</FooterLink>
        </FooterCol>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <Link href="/register" style={{ fontSize: '13px', fontWeight: 700, color: '#fff', borderBottom: '1px solid var(--gold)', paddingBottom: '4px', letterSpacing: '0.06em', alignSelf: 'flex-end' }}>
            {t('productRegistration')}
          </Link>
          <a href="#" style={{ fontSize: '13px', fontWeight: 700, color: '#fff', borderBottom: '1px solid var(--gold)', paddingBottom: '4px', letterSpacing: '0.06em', alignSelf: 'flex-end' }}>
            {t('costCalc')}
          </a>
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{ background: 'var(--footer-grey-dark)', color: 'rgba(255,255,255,0.6)' }}>
        <div className="jm-footer-bottom-inner">
          <div>© {year} JOMOO KITCHEN &amp; BATH CO., LTD. {t('rights')}</div>
          <div style={{ textAlign: 'center' }}>{t('icp')}</div>
          <div style={{ textAlign: 'right', display: 'flex', gap: '16px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
            <a href="#" style={{ color: 'rgba(255,255,255,0.6)' }}>{t('privacy')}</a>
            <a href="#" style={{ color: 'rgba(255,255,255,0.6)' }}>{t('legal')}</a>
            <a href="#" style={{ color: 'rgba(255,255,255,0.6)' }}>{t('cookies')}</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

function SocialBtn({ label, children, stroke }: { label: string; children: React.ReactNode; stroke?: boolean }) {
  return (
    <button type="button" aria-label={label}
      style={{ width: '36px', height: '36px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.85)', background: 'transparent', border: 'none', cursor: 'pointer' }}>
      <svg width="17" height="17" viewBox="0 0 24 24"
        fill={stroke ? 'none' : 'currentColor'}
        stroke={stroke ? 'currentColor' : undefined}
        strokeWidth={stroke ? 1.8 : undefined}>
        {children}
      </svg>
    </button>
  )
}

function FooterCol({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 style={{ fontSize: '14px', fontWeight: 700, margin: '0 0 18px', letterSpacing: '0.04em', color: '#fff' }}>{heading}</h4>
      <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '11px' }}>{children}</ul>
    </div>
  )
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link href={href} style={{ color: 'rgba(255,255,255,0.75)', fontSize: '13px' }}>{children}</Link>
    </li>
  )
}
