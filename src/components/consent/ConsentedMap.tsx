'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { openConsentSettings, useConsentFor } from './useConsent'

/**
 * A Google Maps embed that waits for consent, on the same terms as
 * `ConsentedVideo`: Google sets its own cookies the moment the frame loads, so
 * until 外部メディア is allowed the frame is not requested at all. The
 * placeholder offers to load this one map, to open the cookie settings, or to
 * leave for Google Maps in a new tab — that last one needs no consent from us
 * at all, so an address is never unreachable because of an answer about
 * cookies.
 *
 * Renders the placeholder on the server and on the first client render, because
 * the cookie is only readable in the browser and hydration has to match.
 */
export default function ConsentedMap({
  src,
  href,
  title,
}: {
  /** The embed URL, loaded in the frame. */
  src: string
  /** The same place on maps.google.com, for the new tab. */
  href: string
  title: string
}) {
  const t = useTranslations('cookies')
  const consented = useConsentFor('media')
  const [loadedOnce, setLoadedOnce] = useState(false)

  if (consented || loadedOnce) {
    return (
      <iframe
        src={src}
        title={title}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
      />
    )
  }

  return (
    <div className="cc-map">
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden="true">
        <path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11z" />
        <circle cx="12" cy="10" r="2.6" />
      </svg>
      <p className="cc-map__text">{t('mapBlocked')}</p>
      <div className="cc-map__actions">
        <button type="button" className="cc-map__btn" onClick={() => setLoadedOnce(true)}>
          {t('mapLoadOnce')}
        </button>
        <a className="cc-map__btn" href={href} target="_blank" rel="noopener noreferrer">
          {t('mapOpenExternal')}
        </a>
        <button type="button" className="cc-map__btn cc-map__btn--ghost" onClick={openConsentSettings}>
          {t('embedOpenSettings')}
        </button>
      </div>
    </div>
  )
}
