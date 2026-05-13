'use client'

import { useLocale } from 'next-intl'
import { usePathname, useRouter } from 'next/navigation'
import { useTransition } from 'react'

export default function LocaleSwitcher() {
  const locale = useLocale()
  const pathname = usePathname()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const toggle = () => {
    const next = locale === 'zh-CN' ? 'en' : 'zh-CN'
    // pathname from next/navigation includes the locale prefix e.g. /zh-CN/dashboard
    const newPath = pathname.replace(`/${locale}`, `/${next}`)
    startTransition(() => router.push(newPath))
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={isPending}
      className="text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors disabled:opacity-50"
    >
      {locale === 'zh-CN' ? 'EN' : '中文'}
    </button>
  )
}
