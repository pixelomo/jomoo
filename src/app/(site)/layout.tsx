import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { headers } from 'next/headers'
import { Poppins } from 'next/font/google'
import type { Metadata } from 'next'
import JomooNav from '@/components/layout/JomooNav'
import JomooFooter from '@/components/layout/JomooFooter'
import { auth } from '@/lib/auth'
import '../globals.css'
import '@/components/layout/jomoo-chrome.css'

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

// The site is Japanese-only and served without a locale prefix, so this layout
// owns <html>/<body> for the whole public tree. /studio and /admin sit outside
// it and provide their own document shell.
export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [session, messages] = await Promise.all([
    auth.api.getSession({ headers: await headers() }),
    getMessages(),
  ])

  return (
    <html lang="ja" className={`${poppins.variable} h-full antialiased`}>
      <body className={`${poppins.className} min-h-full flex flex-col bg-white text-zinc-900`}>
        <NextIntlClientProvider messages={messages}>
          <JomooNav isSignedIn={Boolean(session?.user)} />
          <div className="site-main">
            {children}
          </div>
          <JomooFooter />
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
