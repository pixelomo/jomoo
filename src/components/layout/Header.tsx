import { Show, SignOutButton } from '@clerk/nextjs'
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import LocaleSwitcher from './LocaleSwitcher'
import MobileMenu from './MobileMenu'

export default async function Header() {
  const t = await getTranslations('nav')

  return (
    <header className="jm-nav">
      <div className="jm-nav-inner">
        {/* Logo */}
        <Link href="/" className="jm-logo">JOMOO</Link>

        {/* Center nav — hidden on mobile, shown via MobileMenu */}
        <nav className="jm-nav-center">
          <Link href="/products/smart-toilet" className="jm-nav-link">{t('products')}</Link>
          <Link href="/register" className="jm-nav-link">{t('register')}</Link>
        </nav>

        {/* Right side */}
        <div className="jm-nav-right">
          {/* Language switcher with globe icon */}
          <div style={{ display: 'flex', alignItems: 'center', color: '#fff' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"
              style={{ marginRight: '5px', opacity: 0.75, flexShrink: 0 }}>
              <circle cx="12" cy="12" r="9" />
              <path d="M3 12h18M12 3c2.5 3 2.5 15 0 18M12 3c-2.5 3-2.5 15 0 18" />
            </svg>
            <LocaleSwitcher />
          </div>

          {/* Auth — desktop */}
          <Show when="signed-out">
            <Link href="/sign-in" style={{ color: '#fff', fontSize: '13px', fontWeight: 500, opacity: 0.85 }}>
              {t('signIn')}
            </Link>
            <Link href="/sign-up" style={{
              color: '#fff', fontSize: '13px', fontWeight: 600, letterSpacing: '0.08em',
              border: '1px solid rgba(255,255,255,0.6)', padding: '7px 18px',
            }}>
              {t('signUp')}
            </Link>
          </Show>

          <Show when="signed-in">
            <Link href="/dashboard" style={{ color: '#fff', fontSize: '13px', fontWeight: 500, opacity: 0.85 }}>
              {t('dashboard')}
            </Link>
            <SignOutButton redirectUrl="/">
              <button type="button" style={{ color: '#fff', fontSize: '13px', opacity: 0.65, background: 'transparent', border: 'none', cursor: 'pointer' }}>
                {t('signOut')}
              </button>
            </SignOutButton>
          </Show>

          {/* Hamburger — mobile only (rendered as client component) */}
          <MobileMenu
            productsLabel={t('products')}
            registerLabel={t('register')}
            signInLabel={t('signIn')}
            signUpLabel={t('signUp')}
            dashboardLabel={t('dashboard')}
            signOutLabel={t('signOut')}
          />
        </div>
      </div>
    </header>
  )
}
