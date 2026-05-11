import { useTranslations } from 'next-intl'
import Link from 'next/link'

export default function HomePage() {
  const t = useTranslations('nav')

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-24">
      <div className="max-w-2xl w-full text-center">
        <h1 className="text-4xl font-bold tracking-tight mb-4">JoMoo</h1>
        <p className="text-lg text-zinc-500 mb-10">
          产品登记与保修服务平台 / Product Registration &amp; Warranty Portal
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/register"
            className="inline-flex items-center justify-center rounded-lg bg-zinc-900 px-6 py-3 text-sm font-medium text-white hover:bg-zinc-700 transition-colors"
          >
            {t('register')}
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-lg border border-zinc-200 px-6 py-3 text-sm font-medium hover:bg-zinc-50 transition-colors"
          >
            {t('dashboard')}
          </Link>
        </div>
      </div>
    </main>
  )
}
