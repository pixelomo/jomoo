'use client'

import { useMemo, useSyncExternalStore } from 'react'
import {
  CONSENT_COOKIE,
  CONSENT_MAX_AGE,
  OPTIONAL_CATEGORIES,
  parseConsent,
  serializeConsent,
  type Consent,
  type ConsentCategory,
} from '@/lib/cookieConsent'

// Anything that reacts to a consent change listens for this rather than
// reloading the page: the banner sits in the layout, the things it gates
// (an embed, a tag) sit anywhere below it.
const CHANGE_EVENT = 'jomoo:consent-change'

// The footer's Cookie設定 link raises this; the banner is what listens.
const OPEN_EVENT = 'jomoo:consent-open'

/** The stored value, unparsed. A string, so it is a stable store snapshot. */
function readRawCookie(): string {
  if (typeof document === 'undefined') return ''
  const match = document.cookie.match(new RegExp(`(?:^|; )${CONSENT_COOKIE}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : ''
}

/** The server, and the hydrating client, always see "no answer yet". */
function readServerSnapshot(): string {
  return ''
}

function subscribe(onStoreChange: () => void): () => void {
  window.addEventListener(CHANGE_EVENT, onStoreChange)
  return () => window.removeEventListener(CHANGE_EVENT, onStoreChange)
}

export function readConsentCookie(): Consent | null {
  return parseConsent(readRawCookie())
}

// What we can clear ourselves when a category is switched off. YouTube's
// cookies belong to youtube.com and are beyond our reach — refusing 外部メディア
// keeps the embed from loading in the first place, which is the part we control.
const CATEGORY_COOKIES: Record<ConsentCategory, string[]> = {
  analytics: ['_ga', '_gid', '_gat'],
  media: [],
}

/** Expire every cookie whose name starts with one of these. */
function forgetCookies(prefixes: string[]): void {
  if (prefixes.length === 0) return

  const host = window.location.hostname
  // A cookie is only removable through the domain it was set on, and gtag
  // writes to the dot-prefixed one — so try each.
  const domains = ['', `; domain=${host}`, `; domain=.${host}`]

  for (const pair of document.cookie.split('; ')) {
    const name = pair.split('=')[0]
    if (!prefixes.some((prefix) => name.startsWith(prefix))) continue
    for (const domain of domains) {
      document.cookie = `${name}=; path=/; max-age=0${domain}`
    }
  }
}

export function saveConsent(consent: Consent): void {
  // Lax, not None: nothing here is needed in a cross-site frame, and Lax
  // survives the ordinary click-through from a search result or a mail.
  // Secure only over https so the cookie still works on localhost.
  const secure = window.location.protocol === 'https:' ? '; Secure' : ''
  document.cookie =
    `${CONSENT_COOKIE}=${serializeConsent(consent)}; path=/; max-age=${CONSENT_MAX_AGE}; SameSite=Lax${secure}`

  // Saying no has to undo, not just stop: anything already dropped by a
  // category that was just switched off goes with it.
  for (const category of OPTIONAL_CATEGORIES) {
    if (!consent[category]) forgetCookies(CATEGORY_COOKIES[category])
  }

  window.dispatchEvent(new Event(CHANGE_EVENT))
}

export function openConsentSettings(): void {
  window.dispatchEvent(new Event(OPEN_EVENT))
}

export function onConsentOpen(listener: () => void): () => void {
  window.addEventListener(OPEN_EVENT, listener)
  return () => window.removeEventListener(OPEN_EVENT, listener)
}

/**
 * The current answer, or `null` while it is unknown — which is what the server
 * and the hydrating client always see, since the cookie is only readable once
 * we are in the browser. Gated content must render its blocked state for
 * `null`, or hydration will not match.
 */
export function useConsent(): Consent | null {
  const raw = useSyncExternalStore(subscribe, readRawCookie, readServerSnapshot)
  // The snapshot is the cookie string; the object is derived, so that each read
  // does not hand React a new object and spin.
  return useMemo(() => parseConsent(raw), [raw])
}

/** Convenience for the common "may I load this?" question. */
export function useConsentFor(category: ConsentCategory): boolean {
  return useConsent()?.[category] ?? false
}
