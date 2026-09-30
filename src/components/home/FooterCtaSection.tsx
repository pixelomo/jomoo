import { Fragment } from 'react'
import { getSiteCta, imgUrl, lines, type SiteCtaCard } from '@/lib/sanity'
import './footer-cta.css'

function Card({
  card,
  modifier,
  href,
  external,
}: {
  card: SiteCtaCard
  modifier: 'catalog' | 'contact'
  href: string
  external?: boolean
}) {
  return (
    <a
      className={`footer-cta__card footer-cta__card--${modifier}`}
      href={href}
      {...(external && { target: '_blank', rel: 'noopener noreferrer' })}
    >
      <div
        className="footer-cta__media"
        style={card.image?.asset ? { backgroundImage: `url(${imgUrl(card.image, 1400)})` } : undefined}
        aria-hidden="true"
      />
      <div className="footer-cta__shade" aria-hidden="true" />
      <div className="footer-cta__content">
        <div className="footer-cta__eyebrow">{card.eyebrow}</div>
        <h2 className="footer-cta__title">
          {lines(card.title).map((line, i) => (
            <Fragment key={i}>
              {i > 0 && <br />}
              {line}
            </Fragment>
          ))}
        </h2>
        <span className="footer-cta__btn">
          {card.button}
          <span className="footer-cta__caret" aria-hidden="true">
            &gt;
          </span>
        </span>
      </div>
    </a>
  )
}

/**
 * The catalog and contact cards that close the top page, 会社情報 and the
 * product pages. They read the siteCta document themselves, so every page that
 * ends on them shows the same wording without passing it down.
 */
export default async function FooterCtaSection() {
  const data = await getSiteCta()
  if (!data) return null

  return (
    <section className="footer-cta" data-nav="light" aria-label="Catalog and contact">
      <div className="footer-cta__inner">
        {data.catalog && (
          <Card card={data.catalog} modifier="catalog" href={data.catalog.pdfUrl ?? '#'} external />
        )}
        {data.contact && <Card card={data.contact} modifier="contact" href="/contact-us" />}
      </div>
    </section>
  )
}
