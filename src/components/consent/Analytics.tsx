'use client'

import { useEffect } from 'react'
import Script from 'next/script'
import { handleTrackedClick } from '@/lib/analytics'
import { useConsentFor } from './useConsent'

// Nothing is measured until someone sets this, and the 分析Cookie row is
// hidden from the consent panel while it is empty — a category that gates
// nothing should not be offered.
export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID ?? ''

/**
 * Google Analytics, loaded only once 分析Cookie has been agreed to. The scripts
 * are mounted rather than merely configured, so before consent nothing is
 * fetched from Google at all.
 */
export default function Analytics() {
  const consented = useConsentFor('analytics')
  const enabled = Boolean(GA_MEASUREMENT_ID) && consented

  // A loaded gtag stays loaded after consent is withdrawn and would go on
  // sending page views as the visitor navigates; this is Google's own off switch.
  useEffect(() => {
    if (!GA_MEASUREMENT_ID) return
    ;(window as unknown as Record<string, unknown>)[`ga-disable-${GA_MEASUREMENT_ID}`] = !consented
  }, [consented])

  // Capture phase, so the click is recorded before a link navigates away.
  useEffect(() => {
    if (!enabled) return
    document.addEventListener('click', handleTrackedClick, true)
    return () => document.removeEventListener('click', handleTrackedClick, true)
  }, [enabled])

  if (!enabled) return null

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_MEASUREMENT_ID}', { anonymize_ip: true });`}
      </Script>
    </>
  )
}
