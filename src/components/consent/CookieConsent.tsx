'use client'

import { useEffect, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import {
  DECLINE_ALL,
  OPTIONAL_CATEGORIES,
  type Consent,
  type ConsentCategory,
} from '@/lib/cookieConsent'
import { onConsentOpen, readConsentCookie, saveConsent } from './useConsent'
import { GA_MEASUREMENT_ID } from './Analytics'
import './cookie-consent.css'

// The cookies each row is answering for, shown in the details panel so the
// choice is about something concrete rather than a category name.
const COOKIE_NAMES: Record<'necessary' | ConsentCategory, string> = {
  necessary: 'better-auth.session_token, jomoo_consent',
  analytics: '_ga, _gid, _gat',
  media: 'youtube.com / google.com',
}

// Only ask about what the site actually uses. Analytics appears once a
// measurement id is configured; until then there is nothing to consent to, and
// すべて許可 must not quietly grant it in advance.
const OFFERED = OPTIONAL_CATEGORIES.filter(
  (category) => category !== 'analytics' || GA_MEASUREMENT_ID !== ''
)

function acceptEverythingOffered(): Consent {
  const consent = { ...DECLINE_ALL }
  for (const category of OFFERED) consent[category] = true
  return consent
}

export default function CookieConsent({ initial }: { initial: Consent | null }) {
  const t = useTranslations('cookies')

  // No answer on file means the banner is up from the first paint — the server
  // read the same cookie, so this matches on hydration and never flashes.
  const [open, setOpen] = useState(initial === null)
  const [showDetails, setShowDetails] = useState(false)
  const [draft, setDraft] = useState<Consent>(initial ?? DECLINE_ALL)
  const panelRef = useRef<HTMLElement>(null)
  const decided = useRef(initial !== null)

  // The footer's クッキー設定 link reopens this, with the saved answer loaded.
  useEffect(
    () =>
      onConsentOpen(() => {
        // Re-read rather than trusting local state: the answer may have been
        // changed in another tab since this one loaded.
        setDraft(readConsentCookie() ?? DECLINE_ALL)
        setShowDetails(true)
        setOpen(true)
        // Let the panel paint before moving focus into it.
        requestAnimationFrame(() => panelRef.current?.focus())
      }),
    []
  )

  // Escape closes the panel only for someone who has already answered —
  // otherwise it would read as a silent refusal we never recorded.
  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && decided.current) setOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open])

  if (!open) return null

  const commit = (consent: Consent) => {
    saveConsent(consent)
    decided.current = true
    setDraft(consent)
    setOpen(false)
    setShowDetails(false)
  }

  return (
    <section
      className="cc"
      role="dialog"
      aria-labelledby="cc-title"
      aria-describedby="cc-body"
      tabIndex={-1}
      ref={panelRef}
    >
      <div className="cc__inner">
        <div className="cc__text">
          <h2 className="cc__title" id="cc-title">{t('title')}</h2>
          <p className="cc__body" id="cc-body">{t('body')}</p>
        </div>

        <div className="cc__actions">
          <button
            type="button"
            className="cc__btn cc__btn--ghost"
            onClick={() => setShowDetails((v) => !v)}
            aria-expanded={showDetails}
            aria-controls="cc-details"
          >
            {t('settings')}
          </button>
          <button
            type="button"
            className="cc__btn cc__btn--outline"
            onClick={() => commit(DECLINE_ALL)}
          >
            {t('necessaryOnly')}
          </button>
          <button
            type="button"
            className="cc__btn cc__btn--solid"
            onClick={() => commit(acceptEverythingOffered())}
          >
            {t('acceptAll')}
          </button>
        </div>
      </div>

      {showDetails && (
        <div className="cc__details" id="cc-details">
          <ul className="cc__list">
            <li className="cc__row">
              <label className="cc__row-head">
                <input type="checkbox" checked disabled aria-describedby="cc-necessary-desc" />
                <span className="cc__row-name">{t('necessaryTitle')}</span>
                <span className="cc__row-always">{t('alwaysOn')}</span>
              </label>
              <p className="cc__row-desc" id="cc-necessary-desc">{t('necessaryDesc')}</p>
              <p className="cc__row-cookies">{COOKIE_NAMES.necessary}</p>
            </li>

            {OFFERED.map((category) => (
              <li className="cc__row" key={category}>
                <label className="cc__row-head">
                  <input
                    type="checkbox"
                    checked={draft[category]}
                    onChange={(event) =>
                      setDraft((current) => ({ ...current, [category]: event.target.checked }))
                    }
                    aria-describedby={`cc-${category}-desc`}
                  />
                  <span className="cc__row-name">{t(`${category}Title`)}</span>
                </label>
                <p className="cc__row-desc" id={`cc-${category}-desc`}>{t(`${category}Desc`)}</p>
                <p className="cc__row-cookies">{COOKIE_NAMES[category]}</p>
              </li>
            ))}
          </ul>

          <div className="cc__details-actions">
            <button type="button" className="cc__btn cc__btn--solid" onClick={() => commit(draft)}>
              {t('save')}
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
