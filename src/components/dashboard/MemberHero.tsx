/* eslint-disable @next/next/no-img-element */
import './member-portal.css'

/**
 * Slim banner shared by every member-portal view — the dashboard, product
 * registration and the warranty card — so they read as one section of the site.
 *
 * The scrim sits between the photograph and the title: the artwork is light in
 * places and white type would otherwise drop out.
 */
export default function MemberHero({ title = 'マイページ' }: { title?: string }) {
  return (
    <header className="member-hero">
      <img className="member-hero__media" src="/images/mypage.jpg" alt="" />
      <div className="member-hero__scrim" aria-hidden="true" />
      <h1 className="member-hero__title">{title}</h1>
    </header>
  )
}
