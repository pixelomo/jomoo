/* The site's own sections, shared by JomooNav and JomooFooter so the header and
   footer cannot drift apart — the client asked for one name per concept, and
   the labels here are the pages' own titles. */

export type SiteLink = { href: string; label: string }

export const PRODUCTS_LINK: SiteLink = { href: '/products/smart-toilet', label: '商品情報' }

export const COMPANY_LINK: SiteLink = { href: '/company-information', label: '会社情報' }

/** Under 会社情報 — the header's dropdown and the footer's column. */
export const COMPANY_SUB_LINKS: readonly SiteLink[] = [
  { href: '/showroom', label: 'ショールーム' },
  { href: '/global-projects', label: 'グローバルプロジェクト' },
  { href: '/designer', label: 'デザイナー' },
  { href: '/careers', label: '採用情報' },
]

export const BLOG_LINK: SiteLink = { href: '/blog', label: 'ブログ' }

/** The smart toilet is the only category linked for now; the rest return here
    when their pages are ready. */
export const PRODUCT_CATEGORY_LINKS: readonly SiteLink[] = [
  { href: '/products/smart-toilet', label: 'スマートトイレ' },
]
