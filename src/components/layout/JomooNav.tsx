/* eslint-disable @next/next/no-img-element */
/* The chrome deliberately uses plain <a> so each navigation is a full document
   load: the light/dark scroll observer below reads [data-nav="light"] once on
   mount, and client-side transitions would leave it watching the old page. */
/* eslint-disable @next/next/no-html-link-for-pages */
'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth-client'

interface Props {
  isSignedIn: boolean
}

const NAV_LINKS = [
  { href: '/products/smart-toilet', label: '商品情報' },
  { href: '/inspiration', label: 'インスピレーション' },
  { href: '/company-information', label: '会社情報' },
] as const

export default function JomooNav({ isSignedIn }: Props) {
  const router = useRouter()
  const navRef = useRef<HTMLElement>(null)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const nav = navRef.current
    if (!nav) return

    const lightSections = document.querySelectorAll('[data-nav="light"]')

    function updateNav() {
      if (!nav) return
      const navMid = nav.getBoundingClientRect().bottom - 20
      let isLight = false
      lightSections.forEach((section) => {
        const rect = section.getBoundingClientRect()
        if (rect.top < navMid && rect.bottom > navMid) isLight = true
      })
      nav.classList.toggle('is-light', isLight)
    }

    updateNav()
    window.addEventListener('scroll', updateNav, { passive: true })
    window.addEventListener('resize', updateNav)

    return () => {
      window.removeEventListener('scroll', updateNav)
      window.removeEventListener('resize', updateNav)
    }
  }, [])

  useEffect(() => {
    if (!menuOpen) return

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setMenuOpen(false)
    }

    function onResize() {
      if (window.innerWidth >= 1300) setMenuOpen(false)
    }

    document.addEventListener('keydown', onKeyDown)
    window.addEventListener('resize', onResize)

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('resize', onResize)
    }
  }, [menuOpen])

  function closeMenu() {
    setMenuOpen(false)
  }

  return (
    <nav
      className={`nav${menuOpen ? ' is-menu-open' : ''}`}
      ref={navRef}
    >
      <a href="/" className="nav__logo">
        <img src="/logo.svg" alt="JOMOO" />
      </a>

      <ul className="nav__menu">
        {NAV_LINKS.map((item) => (
          <li key={item.href}>
            <a href={item.href}>{item.label}</a>
          </li>
        ))}
      </ul>

      <div className="nav__end">
        <div className="nav__actions">
          <button type="button" className="nav__search" aria-label="検索">
            <img src="/images/search.svg" alt="" />
          </button>
          <a
            href="/contact-us"
            className="nav__btn nav__btn--white nav__btn--contact"
          >
            お問い合わせ
          </a>
          {isSignedIn ? (
            <>
              <a
                href="/dashboard"
                className="nav__btn nav__btn--black nav__btn--dashboard"
              >
                マイページ
              </a>
              <button
                type="button"
                className="nav__auth-icon nav__auth-icon--signout"
                aria-label="ログアウト"
                onClick={async () => {
                  await authClient.signOut()
                  router.push("/")
                  router.refresh()
                }}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <path d="M16 17l5-5-5-5" />
                  <path d="M21 12H9" />
                </svg>
              </button>
            </>
          ) : (
            <>
              <a
                href="/sign-up"
                className="nav__btn nav__btn--black nav__btn--signup"
              >
                パートナー登録
              </a>
              <a
                href="/sign-in"
                className="nav__auth-icon nav__auth-icon--signin"
                aria-label="ログイン"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                  <path d="M10 17l-5-5 5-5" />
                  <path d="M3 12h12" />
                </svg>
              </a>
            </>
          )}
        </div>

        <button
          type="button"
          className="nav__toggle"
          aria-label={menuOpen ? 'メニューを閉じる' : 'メニューを開く'}
          aria-expanded={menuOpen}
          aria-controls="nav-drawer"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            {menuOpen ? (
              <path d="M18 6L6 18M6 6l12 12" />
            ) : (
              <path d="M3 12h18M3 6h18M3 18h18" />
            )}
          </svg>
        </button>
      </div>

      <div className="nav__drawer" id="nav-drawer">
        <ul className="nav__drawer-menu">
          {NAV_LINKS.map((item) => (
            <li key={item.href}>
              <a href={item.href} onClick={closeMenu}>
                {item.label}
              </a>
            </li>
          ))}
        </ul>
        <div className="nav__drawer-actions">
          <a
            href="/contact-us"
            className="nav__drawer-btn nav__drawer-btn--contact"
            onClick={closeMenu}
          >
            お問い合わせ
          </a>
          {!isSignedIn ? (
            <a
              href="/sign-up"
              className="nav__drawer-btn nav__drawer-btn--signup"
              onClick={closeMenu}
            >
              パートナー登録
            </a>
          ) : (
            <a
              href="/dashboard"
              className="nav__drawer-btn"
              onClick={closeMenu}
            >
              マイページ
            </a>
          )}
        </div>
      </div>
    </nav>
  )
}
