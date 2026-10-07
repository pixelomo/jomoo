import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { cookies, headers } from 'next/headers'
import { Poppins } from 'next/font/google'
import type { Metadata } from 'next'
import JomooNav from '@/components/layout/JomooNav'
import JomooFooter from '@/components/layout/JomooFooter'
import CookieConsent from '@/components/consent/CookieConsent'
import Analytics from '@/components/consent/Analytics'
import { auth } from '@/lib/auth'
import { getLegalLinks, getSiteNavigation } from '@/lib/sanity'
import { CONSENT_COOKIE, parseConsent } from '@/lib/cookieConsent'
import { DEFAULT_TITLE, SITE_NAME, SITE_URL, pageMetadata } from '@/lib/seo'
import '../globals.css'
import '@/components/layout/jomoo-chrome.css'

const poppins = Poppins({
  variable: '--font-poppins',
  subsets: ['latin', 'latin-ext'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    template: '%s | JOMOO',
    default: DEFAULT_TITLE,
  },
  applicationName: SITE_NAME,
  keywords: ['JOMOO', 'JOMOO JAPAN', 'X40', 'X40-B', 'X40-C', 'スマートトイレ', '温水洗浄便座', 'スマートバスルーム', '水栓金具', 'シャワーセット'],
  formatDetection: { telephone: false, address: false, email: false },
  appleWebApp: { title: 'JOMOO', statusBarStyle: 'default' },
  // Every page sets its own; this is what a page without one shares as.
  // No path: a canonical or og:url here would be inherited by every page
  // that sets none, and tell crawlers each of them is the top page.
  ...pageMetadata({}),
}

// The site is Japanese-only and served without a locale prefix, so this layout
// owns <html>/<body> for the whole public tree. /studio and /admin sit outside
// it and provide their own document shell.
export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [session, messages, cookieStore, legalLinks, nav] = await Promise.all([
    auth.api.getSession({ headers: await headers() }),
    getMessages(),
    cookies(),
    // The footer's policy links are named by the client in Sanity; the footer
    // falls back to the shipped labels if this comes back empty.
    getLegalLinks(),
    // The header and footer links, edited in Sanity; each field falls back to
    // what shipped if the document lacks it or Sanity is unreachable.
    getSiteNavigation(),
  ])

  // Read here rather than in the banner: this layout is already dynamic, and a
  // server-rendered answer means the bar is either there from the first paint
  // or never appears — no flash of it on every navigation.
  const consent = parseConsent(cookieStore.get(CONSENT_COOKIE)?.value)

  return (
    <html lang="ja" className={`${poppins.variable} h-full antialiased`}>
      <body className={`${poppins.className} min-h-full flex flex-col bg-white text-zinc-900`}>
        <NextIntlClientProvider messages={messages}>
          <JomooNav isSignedIn={Boolean(session?.user)} nav={nav} />
          <div className="site-main">
            {children}
          </div>
          <JomooFooter legalLinks={legalLinks} nav={nav} />
          <CookieConsent initial={consent} />
          <Analytics />
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
