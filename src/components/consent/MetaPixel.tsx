'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import Script from 'next/script'
import { useConsentFor } from './useConsent'

// The pixel belongs to JOMOO's own Meta business account; nothing loads, and
// the 広告Cookie row is hidden from the consent panel, while this is empty.
export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID ?? ''

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void
  }
}

/**
 * The Meta pixel, loaded only once 広告Cookie has been agreed to. Like
 * Analytics, the script is mounted rather than configured, so before consent
 * nothing is fetched from Meta at all.
 */
export default function MetaPixel() {
  const consented = useConsentFor('marketing')
  const enabled = Boolean(META_PIXEL_ID) && consented
  const pathname = usePathname()
  const lastPath = useRef<string | null>(null)

  // fbevents.js stays loaded after consent is withdrawn; revoke is Meta's own
  // off switch, grant turns it back on if they agree again in the same visit.
  useEffect(() => {
    window.fbq?.('consent', consented ? 'grant' : 'revoke')
  }, [consented])

  // The init script sends the first PageView; client-side navigations do not
  // reload it, so each later route change sends its own.
  useEffect(() => {
    if (!enabled) return
    if (lastPath.current !== null && lastPath.current !== pathname) window.fbq?.('track', 'PageView')
    lastPath.current = pathname
  }, [enabled, pathname])

  if (!enabled) return null

  return (
    <Script id="meta-pixel" strategy="afterInteractive">
      {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('consent','grant');
fbq('init','${META_PIXEL_ID}');
fbq('track','PageView');`}
    </Script>
  )
}
