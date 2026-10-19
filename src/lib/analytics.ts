// Custom Google Analytics events. Every call is a no-op unless 分析Cookie is
// agreed to right now and gtag has loaded (components/consent/Analytics.tsx),
// so callers never check consent themselves.

import { readConsentCookie } from '@/components/consent/useConsent'

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
  }
}

export type EventParams = Record<string, string | number | boolean | undefined>

export function track(event: string, params: EventParams = {}): void {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return
  // gtag outlives a withdrawal for the rest of the visit; the cookie does not.
  if (!readConsentCookie()?.analytics) return
  window.gtag('event', event, params)
}

// Member pages show names, addresses and serials in their links, so a click
// there reports where it went but not what the link said.
const PRIVATE_PATHS = ['/dashboard', '/account', '/warranty', '/register']

const isPrivatePage = () =>
  PRIVATE_PATHS.some((p) => window.location.pathname === p || window.location.pathname.startsWith(`${p}/`))

/** What a link or button says: its aria-label, its text, or its image's alt. */
function labelOf(el: HTMLElement): string {
  const text =
    el.getAttribute('aria-label') ||
    el.textContent?.replace(/\s+/g, ' ').trim() ||
    el.querySelector('img')?.getAttribute('alt') ||
    ''
  return text.slice(0, 100)
}

/**
 * Where on the page a click happened: the nearest `data-track-section`, else
 * the enclosing <section>'s aria-label or id, else `main`.
 */
function sectionOf(el: HTMLElement): string {
  const named = el.closest<HTMLElement>('[data-track-section]')
  if (named) return named.dataset.trackSection ?? ''
  const section = el.closest('section')
  return section?.getAttribute('aria-label') || section?.id || 'main'
}

/**
 * One listener for the whole site. Every link click is sent as `link_click`;
 * an element (or an ancestor) marked `data-track="name"` is sent as
 * `cta_click` with that name instead, which is how buttons get tracked —
 * a button without one is not. `data-track-item` adds which item it was
 * (a product, a slide).
 */
export function handleTrackedClick(event: MouseEvent): void {
  const target = event.target
  if (!(target instanceof Element)) return

  const el = target.closest<HTMLElement>('a[href], [data-track]')
  if (!el) return

  const named = el.closest<HTMLElement>('[data-track]')
  const href = el.getAttribute('href')
  const url = href ? new URL(href, window.location.href) : null
  const outbound = url ? url.origin !== window.location.origin : undefined

  track(named ? 'cta_click' : 'link_click', {
    cta_name: named?.dataset.track,
    item_name: named?.dataset.trackItem,
    section: sectionOf(el),
    link_url: url ? (outbound ? url.href : url.pathname + url.search + url.hash) : undefined,
    link_text: isPrivatePage() ? undefined : labelOf(el),
    outbound,
  })
}
