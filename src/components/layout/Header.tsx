import { Show, SignOutButton } from '@clerk/nextjs'
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import LocaleSwitcher from './LocaleSwitcher'

export default async function Header() {
  const t = await getTranslations('nav')

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-100 bg-white/90 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-6 px-4">
        {/* Logo */}
        <Link href="/" className="font-bold text-lg tracking-tight text-zinc-900 shrink-0">
          JoMoo
        </Link>

        {/* Primary nav */}
        <nav className="flex items-center gap-5 flex-1">
          <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors">
            {t('home')}
          </Link>
          <Show when="signed-in">
            <Link href="/dashboard" className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors">
              {t('dashboard')}
            </Link>
            <Link href="/register" className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors">
              {t('register')}
            </Link>
          </Show>
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-4 shrink-0">
          <LocaleSwitcher />

          <Show when="signed-out">
            <Link
              href="/sign-in"
              className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors"
            >
              {t('signIn')}
            </Link>
            <Link
              href="/sign-up"
              className="rounded-md bg-zinc-900 px-3.5 py-1.5 text-sm font-medium text-white hover:bg-zinc-700 transition-colors"
            >
              {t('signUp')}
            </Link>
          </Show>

          <Show when="signed-in">
            <SignOutButton redirectUrl="/">
              <button
                type="button"
                className="text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors"
              >
                {t('signOut')}
              </button>
            </SignOutButton>
          </Show>
        </div>
      </div>
    </header>
  )
}
