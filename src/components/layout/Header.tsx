import { Show, SignOutButton } from '@clerk/nextjs'
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import LocaleSwitcher from './LocaleSwitcher'
import MobileMenu from './MobileMenu'

export default async function Header() {
  const t = await getTranslations('nav')

  return (
    <>
      {/* ── Utility bar (hidden on mobile via CSS) ── */}
      <div className="jm-utility">
        <div className="jm-utility-inner">
          <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
            {[t('audienceIndividual'), t('audiencePro'), t('audienceCorp'), t('audienceInvestor'), t('audienceCareers')].map((label, i) => (
              <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 16 }}>
                {i > 0 && <span style={{ width: 4, height: 4, background: 'var(--ink-4)', borderRadius: '50%', display: 'inline-block' }} />}
                <a href="#" style={{ color: 'inherit', fontSize: 12 }}>{label}</a>
              </span>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
            <a href="#" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--ink-2)', textDecoration: 'none' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <path d="M3 8l9 6 9-6" /><rect x="3" y="5" width="18" height="14" rx="1" />
              </svg>
              {t('catalog')}
            </a>
            <span style={{ width: 1, height: 12, background: 'var(--line)', display: 'inline-block' }} />
            <Show when="signed-out">
              <Link href="/sign-in" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--ink-2)', textDecoration: 'none' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
                </svg>
                {t('signIn')}
              </Link>
              <span style={{ width: 1, height: 12, background: 'var(--line)', display: 'inline-block' }} />
              <Link href="/sign-up" style={{ fontSize: 12, color: 'var(--ink-2)', textDecoration: 'none' }}>
                {t('signUp')}
              </Link>
              <span style={{ width: 1, height: 12, background: 'var(--line)', display: 'inline-block' }} />
            </Show>
            <Show when="signed-in">
              <Link href="/dashboard" style={{ fontSize: 12, color: 'var(--ink-2)', textDecoration: 'none' }}>
                {t('dashboard')}
              </Link>
              <span style={{ width: 1, height: 12, background: 'var(--line)', display: 'inline-block' }} />
              <SignOutButton redirectUrl="/">
                <button type="button" style={{ fontSize: 12, color: 'var(--ink-3)', background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}>
                  {t('signOut')}
                </button>
              </SignOutButton>
              <span style={{ width: 1, height: 12, background: 'var(--line)', display: 'inline-block' }} />
            </Show>
            <div style={{ display: 'inline-flex', gap: 8, fontSize: 11, letterSpacing: '0.04em' }}>
              <LocaleSwitcher />
            </div>
          </div>
        </div>
      </div>

      {/* ── Main header (sticky) ── */}
      <header className="jm-site-header">
        <div className="jm-header-inner">
          {/* Logo */}
          <Link href="/" style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexShrink: 0, textDecoration: 'none' }}>
            <span style={{ fontFamily: 'ui-monospace,monospace', fontWeight: 800, fontSize: 24, letterSpacing: '0.02em', lineHeight: 1, color: 'var(--ink)' }}>
              JOMOO<span style={{ color: 'var(--accent)' }}>.</span>
            </span>
          </Link>

          {/* Primary nav */}
          <nav className="jm-header-nav" style={{ display: 'flex', gap: 28, fontSize: 14, fontWeight: 500, flex: 1 }}>
            <Link href="/products/smart-toilet" style={{ position: 'relative', padding: '14px 0', display: 'inline-flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap', color: 'var(--ink)', textDecoration: 'none' }}>
              {t('products')}
            </Link>
            <a href="#" style={{ position: 'relative', padding: '14px 0', display: 'inline-flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap', color: 'var(--ink)', textDecoration: 'none' }}>
              {t('spaces')}
            </a>
            <a href="#" style={{ position: 'relative', padding: '14px 0', display: 'inline-flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap', color: 'var(--ink)', textDecoration: 'none' }}>
              {t('technology')}
            </a>
            <a href="#" style={{ position: 'relative', padding: '14px 0', display: 'inline-flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap', color: 'var(--ink)', textDecoration: 'none' }}>
              {t('style')}
            </a>
            <a href="#" style={{ position: 'relative', padding: '14px 0', display: 'inline-flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap', color: 'var(--ink)', textDecoration: 'none' }}>
              {t('showroom')}
            </a>
            <a href="#" style={{ position: 'relative', padding: '14px 0', display: 'inline-flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap', color: 'var(--ink)', textDecoration: 'none' }}>
              {t('support')}
            </a>
            <a href="#" style={{ position: 'relative', padding: '14px 0', display: 'inline-flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap', color: 'var(--ink)', textDecoration: 'none' }}>
              {t('brand')}
            </a>
          </nav>

          {/* Search */}
          <div className="jm-header-search" style={{ flex: '0 0 220px', position: 'relative' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-3)' }}>
              <circle cx="11" cy="11" r="6" /><path d="m20 20-4-4" />
            </svg>
            <input
              type="search"
              placeholder={t('searchPlaceholder')}
              style={{ width: '100%', border: '1px solid var(--line)', background: 'var(--bg-soft)', padding: '10px 14px 10px 34px', fontFamily: 'inherit', fontSize: 13, outline: 'none' }}
            />
          </div>

          {/* CTA */}
          <Link href="/register" className="jm-header-cta" style={{ background: 'var(--accent)', color: '#fff', fontSize: 13, fontWeight: 700, padding: '12px 18px', alignItems: 'center', gap: 8, textDecoration: 'none', whiteSpace: 'nowrap', marginLeft: 8 }}>
            {t('consultation')} →
          </Link>

          {/* Mobile hamburger */}
          <MobileMenu
            productsLabel={t('products')}
            spacesLabel={t('spaces')}
            technologyLabel={t('technology')}
            styleLabel={t('style')}
            showroomLabel={t('showroom')}
            supportLabel={t('support')}
            brandLabel={t('brand')}
            registerLabel={t('register')}
            signInLabel={t('signIn')}
            signUpLabel={t('signUp')}
            dashboardLabel={t('dashboard')}
            signOutLabel={t('signOut')}
            consultationLabel={t('consultation')}
          />
        </div>
      </header>
    </>
  )
}
