/* The header and footer links. They are edited in Sanity (ヘッダー・フッター);
   what is here is what shipped, used field by field when the document is
   missing a field or Sanity cannot be reached — the chrome is on every page,
   and a site that loses its menu is worse than one showing a stale label. */

export type SiteLink = { href: string; label: string }

/**
 * Pages taken off the site for now: their route 404s, and every header and
 * footer link to them — from Sanity or from DEFAULT_NAV — is dropped. Q&A is
 * hidden at the client's request until its content is ready; take it out of
 * this list to bring the page and its links back.
 */
export const HIDDEN_ROUTES: readonly string[] = ['/faq']

export const isHiddenRoute = (href: string) =>
  HIDDEN_ROUTES.some((route) => href === route || href.startsWith(`${route}#`) || href.startsWith(`${route}/`))

export type NavItem = SiteLink & { children?: SiteLink[] }

export type FooterLink = SiteLink & {
  /** Bold, with a gap above — how 製品登録 is set apart. */
  emphasis?: boolean
}

export type FooterColumn = {
  heading: string
  /** When set, the heading is itself the link. */
  headingHref?: string
  links: FooterLink[]
}

export type SocialPlatform = 'facebook' | 'instagram' | 'youtube' | 'linkedin' | 'x'

export type SiteNav = {
  menu: NavItem[]
  contactLabel: string
  /** The client's global site — the language switch beside the search glyph. */
  globalSite: string
  footerColumns: FooterColumn[]
  social: { platform: SocialPlatform; url: string }[]
  copyright: string
}

const COMPANY_SUB_LINKS: SiteLink[] = [
  { href: '/showroom', label: 'ショールーム' },
  { href: '/global-projects', label: 'グローバルプロジェクト' },
  { href: '/designer', label: 'デザイナー' },
  { href: '/careers', label: '採用情報' },
]

export const DEFAULT_NAV: SiteNav = {
  menu: [
    { href: '/products/smart-toilet', label: '商品情報' },
    { href: '/company-information', label: '会社情報', children: COMPANY_SUB_LINKS },
    { href: '/blog', label: 'ブログ' },
  ],
  contactLabel: 'お問い合わせ',
  globalSite: 'https://jomoo.com/',
  footerColumns: [
    {
      heading: '商品情報',
      links: [{ href: '/products/smart-toilet', label: 'スマートトイレ' }],
    },
    {
      heading: 'お問い合わせ',
      links: [
        { href: '/contact-us', label: 'お問い合わせ' },
        { href: '/after-sales', label: '製品の保証' },
        { href: '/faq', label: 'Q&A' },
      ],
    },
    {
      heading: '会社情報',
      headingHref: '/company-information',
      links: [
        ...COMPANY_SUB_LINKS,
        { href: '/blog', label: 'ブログ' },
        { href: '/register', label: '製品登録', emphasis: true },
      ],
    },
  ],
  // The group's international accounts. WeChat is deliberately absent: the
  // client asked for it to come off the Japanese site.
  social: [
    { platform: 'facebook', url: 'https://www.facebook.com/jomoointernational' },
    { platform: 'instagram', url: 'https://www.instagram.com/jomoointer/' },
    { platform: 'youtube', url: 'https://www.youtube.com/@JOMOOJapan' },
    { platform: 'linkedin', url: 'https://www.linkedin.com/company/jomoo-group/' },
    { platform: 'x', url: 'https://x.com/Jomoointer' },
  ],
  copyright: 'JOMOO KITCHEN & BATH CO., LTD. All Rights Reserved.',
}
