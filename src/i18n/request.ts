import { getRequestConfig } from 'next-intl/server'

// The site ships in Japanese only and has no locale segment in its URLs, so
// next-intl runs without routing: one fixed locale, one message catalogue.
// Re-introducing a second language means adding routing back here and wrapping
// the app tree in a [locale] segment again.
export const LOCALE = 'ja'

export default getRequestConfig(async () => ({
  locale: LOCALE,
  messages: (await import(`../messages/${LOCALE}.json`)).default,
}))
