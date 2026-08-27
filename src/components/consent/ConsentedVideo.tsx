'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { openConsentSettings, useConsentFor } from './useConsent'

const IFRAME_ALLOW =
  'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'

/**
 * YouTube's own domain is swapped for its privacy-enhanced one, which holds off
 * on cookies until playback actually starts. Used for the one-off "load this
 * video" click, where the visitor has agreed to this embed and nothing more.
 */
function privacyEnhanced(url: string): string {
  return url.replace('//www.youtube.com/', '//www.youtube-nocookie.com/')
}

/**
 * A YouTube embed that waits for consent. YouTube sets its own cookies the
 * moment the frame loads, so until 外部メディア is allowed the frame is not
 * requested at all — the visitor gets a placeholder offering to load this one
 * video, or to open the cookie settings.
 *
 * Renders the placeholder on the server and on the first client render, because
 * the cookie is only readable in the browser and hydration has to match.
 */
export default function ConsentedVideo({ src, title }: { src: string; title: string }) {
  const t = useTranslations('cookies')
  const consented = useConsentFor('media')
  const [loadedOnce, setLoadedOnce] = useState(false)

  if (consented || loadedOnce) {
    return (
      <iframe
        src={consented ? src : privacyEnhanced(src)}
        title={title}
        allow={IFRAME_ALLOW}
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
      />
    )
  }

  return (
    <div className="cc-video">
      <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <path d="M10 8l6 4-6 4V8z" fill="currentColor" />
      </svg>
      <p className="cc-video__text">{t('videoBlocked')}</p>
      <div className="cc-video__actions">
        <button type="button" className="cc-video__btn" onClick={() => setLoadedOnce(true)}>
          {t('videoLoadOnce')}
        </button>
        <button type="button" className="cc-video__btn cc-video__btn--ghost" onClick={openConsentSettings}>
          {t('videoOpenSettings')}
        </button>
      </div>
    </div>
  )
}
