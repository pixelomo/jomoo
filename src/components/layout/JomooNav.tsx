/* eslint-disable @next/next/no-img-element */
'use client'

import { useEffect, useRef } from 'react'
import { useLocale } from 'next-intl'
import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth-client'

interface Props {
  isSignedIn: boolean
}

export default function JomooNav({ isSignedIn }: Props) {
  const locale = useLocale()
  const router = useRouter()
  const navRef = useRef<HTMLElement>(null)

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

  return (
    <nav className="nav" ref={navRef}>
      <a href={`/${locale}`} className="nav__logo">
        <img src="/logo.svg" alt="JOMOO" />
      </a>
      <ul className="nav__menu">
        <li><a href={`/${locale}/products/smart-toilet`}>商品情報</a></li>
        <li><a href={`/${locale}/inspiration`}>インスピレーション</a></li>
        <li><a href={`/${locale}/company-information`}>会社情報</a></li>
      </ul>
      <div className="nav__actions">
        <button type="button" className="nav__search" aria-label="検索">
          <img src="/images/search.svg" alt="" />
        </button>
        <a href={`/${locale}/contact-us`} className="nav__btn nav__btn--white">お問い合わせ</a>
        {isSignedIn ? (
          <>
            <a href={`/${locale}/dashboard`} className="nav__btn nav__btn--black">マイページ</a>
            <button
              type="button"
              className="nav__auth-icon"
              aria-label="ログアウト"
              onClick={async () => {
                await authClient.signOut()
                router.push(`/${locale}`)
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
            <a href={`/${locale}/sign-up`} className="nav__btn nav__btn--black">パートナー登録</a>
            <a href={`/${locale}/sign-in`} className="nav__auth-icon" aria-label="ログイン">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                <path d="M10 17l-5-5 5-5" />
                <path d="M3 12h12" />
              </svg>
            </a>
          </>
        )}
      </div>
    </nav>
  )
}
