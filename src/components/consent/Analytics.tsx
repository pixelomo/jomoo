'use client'

import Script from 'next/script'
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
  if (!GA_MEASUREMENT_ID || !consented) return null

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
