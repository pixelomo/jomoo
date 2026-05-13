import { getTranslations } from 'next-intl/server'
import { Show } from '@clerk/nextjs'
import Link from 'next/link'

export default async function HomePage() {
  const t = await getTranslations('home')

  return (
    <main className="flex flex-col flex-1">
      {/* Hero */}
      <section className="flex flex-col items-center justify-center text-center px-4 py-28 bg-white">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-zinc-900 max-w-2xl">
          {t('headline')}
        </h1>
        <p className="mt-4 text-lg text-zinc-500 max-w-xl">
          {t('subheadline')}
        </p>
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <Show when="signed-out">
            <Link
              href="/sign-up"
              className="inline-flex items-center justify-center rounded-lg bg-zinc-900 px-6 py-3 text-sm font-medium text-white hover:bg-zinc-700 transition-colors"
            >
              {t('ctaRegister')}
            </Link>
            <Link
              href="/sign-in"
              className="inline-flex items-center justify-center rounded-lg border border-zinc-200 px-6 py-3 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
            >
              {t('ctaPortal')}
            </Link>
          </Show>
          <Show when="signed-in">
            <Link
              href="/register"
              className="inline-flex items-center justify-center rounded-lg bg-zinc-900 px-6 py-3 text-sm font-medium text-white hover:bg-zinc-700 transition-colors"
            >
              {t('ctaRegister')}
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center rounded-lg border border-zinc-200 px-6 py-3 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
            >
              {t('ctaPortal')}
            </Link>
          </Show>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-zinc-100 bg-zinc-50 px-4 py-20">
        <div className="mx-auto max-w-5xl grid grid-cols-1 sm:grid-cols-3 gap-10">
          <div>
            <div className="h-10 w-10 rounded-lg bg-zinc-200 mb-4" />
            <h3 className="font-semibold text-zinc-900">{t('feat1Title')}</h3>
            <p className="mt-1 text-sm text-zinc-500">{t('feat1Desc')}</p>
          </div>
          <div>
            <div className="h-10 w-10 rounded-lg bg-zinc-200 mb-4" />
            <h3 className="font-semibold text-zinc-900">{t('feat2Title')}</h3>
            <p className="mt-1 text-sm text-zinc-500">{t('feat2Desc')}</p>
          </div>
          <div>
            <div className="h-10 w-10 rounded-lg bg-zinc-200 mb-4" />
            <h3 className="font-semibold text-zinc-900">{t('feat3Title')}</h3>
            <p className="mt-1 text-sm text-zinc-500">{t('feat3Desc')}</p>
          </div>
        </div>
      </section>
    </main>
  )
}
