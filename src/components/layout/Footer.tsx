import { getTranslations } from 'next-intl/server'
import Link from 'next/link'

export default async function Footer() {
  const t = await getTranslations('footer')
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-zinc-100 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          {/* Brand */}
          <div>
            <p className="font-bold text-zinc-900">JoMoo</p>
            <p className="text-sm text-zinc-400 mt-0.5">{t('tagline')}</p>
          </div>

          {/* Links */}
          <nav className="flex flex-wrap gap-x-6 gap-y-2">
            <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors">
              {t('home')}
            </Link>
            <Link href="/dashboard" className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors">
              {t('portal')}
            </Link>
            <Link href="/register" className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors">
              {t('register')}
            </Link>
          </nav>
        </div>

        <div className="mt-8 border-t border-zinc-100 pt-6">
          <p className="text-xs text-zinc-400">
            © {year} JoMoo. {t('rights')}
          </p>
        </div>
      </div>
    </footer>
  )
}
