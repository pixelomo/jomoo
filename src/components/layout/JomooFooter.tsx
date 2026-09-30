/* eslint-disable @next/next/no-img-element */
/* Plain <a> throughout, to match JomooNav — see the note there. */
/* eslint-disable @next/next/no-html-link-for-pages */
'use client'

import { FaLinkedinIn } from 'react-icons/fa6'
import { openConsentSettings } from '@/components/consent/useConsent'
import { SiFacebook, SiInstagram, SiX, SiYoutube } from 'react-icons/si'
import type { SiteNav, SocialPlatform } from './siteLinks'

/** Each platform the Studio offers, with its mark. */
const SOCIAL_ICONS: Record<SocialPlatform, { label: string; Icon: typeof SiX }> = {
  facebook: { label: 'Facebook', Icon: SiFacebook },
  instagram: { label: 'Instagram', Icon: SiInstagram },
  youtube: { label: 'YouTube', Icon: SiYoutube },
  linkedin: { label: 'LinkedIn', Icon: FaLinkedinIn },
  x: { label: 'X', Icon: SiX },
}

/* The legal row's wording comes from Sanity, so renaming a document in the
   Studio renames the link to it. These are the labels the documents shipped
   with, used in slug order — and used verbatim if Sanity cannot be reached,
   since a footer that quietly loses its policy links is worse than a stale
   label. */
const LEGAL_FALLBACK = [
  { slug: 'privacy-policy', label: 'プライバシーポリシー' },
  { slug: 'terms-of-use', label: 'ご利用条件' },
] as const

export type LegalLink = { slug: string; label: string }

function orderLegalLinks(links: LegalLink[]): LegalLink[] {
  return LEGAL_FALLBACK.map(
    (fallback) => links.find((link) => link.slug === fallback.slug) ?? fallback
  )
}

export default function JomooFooter({
  legalLinks = [],
  nav,
}: {
  legalLinks?: LegalLink[]
  /** The columns, social links and copyright, edited in Sanity. */
  nav: Pick<SiteNav, 'footerColumns' | 'social' | 'copyright'>
}) {
  const year = new Date().getFullYear()
  const legal = orderLegalLinks(legalLinks)

  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__brand">
          <div className="footer__logo">
            <img src="/logo.svg" alt="JOMOO" />
          </div>
          <div className="footer__social">
            {nav.social.map(({ platform, url }) => {
              const icon = SOCIAL_ICONS[platform]
              if (!icon) return null
              return (
                <a key={url} href={url} aria-label={icon.label} target="_blank" rel="noopener noreferrer">
                  <icon.Icon aria-hidden="true" />
                </a>
              )
            })}
          </div>
        </div>

        {/* インスピレーション is hidden until its pages are built: adding that
            column back means taking .footer__cols back to four tracks too. */}
        <div className="footer__cols">
          {nav.footerColumns.map((column) => (
            <div className="footer__col" key={column.heading}>
              {/* A heading with a link is the link itself, rather than a label
                  over a link of the same name. */}
              <h4>
                {column.headingHref ? <a href={column.headingHref}>{column.heading}</a> : column.heading}
              </h4>
              <ul>
                {(column.links ?? []).map((link) =>
                  link.emphasis ? (
                    <li className="footer__li--gap" key={link.href}>
                      <a href={link.href} className="footer__link--bold">
                        {link.label}
                      </a>
                    </li>
                  ) : (
                    <li key={link.href}>
                      <a href={link.href}>{link.label}</a>
                    </li>
                  )
                )}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <hr className="footer__divider" />

      <div className="footer__bottom">
        <span>© {year} {nav.copyright}</span>
        <span className="footer__legal">
          {legal.map((link) => (
            <a href={`/${link.slug}`} key={link.slug}>
              {link.label}
            </a>
          ))}
          {/* Withdrawing consent has to be as easy as giving it, so the banner
              is reachable from every page rather than only on the first visit. */}
          <button type="button" className="footer__legal-btn" onClick={openConsentSettings}>
            Cookie設定
          </button>
          {/* The generated sitemap — scripts/generate-route-manifest.mjs keeps it
              in step with the pages that exist, so this no longer needs a list
              of its own. */}
          <a href="/sitemap.xml">サイトマップ</a>
        </span>
      </div>
    </footer>
  )
}
