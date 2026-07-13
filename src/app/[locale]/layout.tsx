import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { Poppins } from 'next/font/google'
import { routing } from '@/i18n/routing'
import type { Metadata } from 'next'
import '../globals.css'

const poppins = Poppins({
  variable: '--font-poppins',
  subsets: ['latin', 'latin-ext'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    template: '%s | JOMOO',
    default: 'JOMOO X40 — インテリジェントトイレ | スマートウォシュレット',
  },
  description: 'JOMOO X40 インテリジェントトイレ。UV除菌・プラチナ触媒・サイクロン洗浄・奥行き640mm超コンパクト設計。最先端スマートウォシュレットで快適なバスルーム体験を。',
  keywords: ['JOMOO', 'X40', 'インテリジェントトイレ', 'スマートトイレ', 'ウォシュレット', 'UV除菌', 'スマートバスルーム', '温水洗浄便座', 'JOMOO JAPAN', 'smart toilet'],
  openGraph: {
    title: 'JOMOO X40 — インテリジェントトイレ',
    description: 'UV除菌・プラチナ触媒・サイクロン洗浄・640mm超コンパクト設計のインテリジェントトイレ',
    siteName: 'JOMOO JAPAN',
    locale: 'ja_JP',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'JOMOO X40 — インテリジェントトイレ',
    description: 'UV除菌・プラチナ触媒・サイクロン洗浄・640mm超コンパクト設計',
  },
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound()
  }

  const messages = await getMessages()

  return (
    <html lang={locale} className={`${poppins.variable} h-full antialiased`}>
      <body className={`${poppins.className} min-h-full flex flex-col bg-white text-zinc-900`}>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
