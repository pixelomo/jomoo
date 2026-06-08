import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { Bebas_Neue, Geist, Noto_Sans_JP } from 'next/font/google'
import { routing } from '@/i18n/routing'
import type { Metadata } from 'next'
import '../globals.css'

const bebasNeue = Bebas_Neue({
  variable: '--font-bebas',
  subsets: ['latin'],
  weight: '400',
  display: 'swap',
})

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const notoSansJP = Noto_Sans_JP({
  variable: '--font-noto-sans-jp',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '900'],
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
    <html lang={locale} className={`${bebasNeue.variable} ${geistSans.variable} ${notoSansJP.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-white text-zinc-900">
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
