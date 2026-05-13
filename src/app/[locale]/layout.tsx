import { ClerkProvider } from '@clerk/nextjs'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { Geist } from 'next/font/google'
import { routing } from '@/i18n/routing'
import type { Metadata } from 'next'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import '../globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: {
    template: '%s | JoMoo',
    default: 'JoMoo',
  },
  description: '产品登记与保修服务 / Product Registration & Warranty',
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
    <html lang={locale} className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-white text-zinc-900">
        <ClerkProvider>
          <NextIntlClientProvider messages={messages}>
            <Header />
            <div className="flex flex-col flex-1">
              {children}
            </div>
            <Footer />
          </NextIntlClientProvider>
        </ClerkProvider>
      </body>
    </html>
  )
}
