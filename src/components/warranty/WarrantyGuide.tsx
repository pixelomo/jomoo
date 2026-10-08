import Link from 'next/link'
import { PortableText, type PortableTextComponents } from '@portabletext/react'
import type { AfterSalesPageData } from '@/lib/sanity'
import './repair-terms.css'

/**
 * 保証のご案内 — the sections of /after-sales (製品保証期間, 延長保証規定, …),
 * edited under アフターサービス in the Studio.
 *
 * Laid out like the 無料修理規定 it replaced on this page: a row of buttons,
 * one per section, each jumping to it. The body is Portable Text so editors can
 * link a phrase (ログイン → /sign-in) or drop a button where the copy calls
 * for one.
 */

/** Site paths go through next/link; anything else (tel:, https:) is a plain anchor. */
function SmartLink({ href, className, children }: { href: string; className?: string; children: React.ReactNode }) {
  return href.startsWith('/') ? (
    <Link href={href} className={className}>
      {children}
    </Link>
  ) : (
    <a href={href} className={className}>
      {children}
    </a>
  )
}

const components: PortableTextComponents = {
  block: {
    normal: ({ children }) => <p className="warranty-guide__text">{children}</p>,
  },
  marks: {
    link: ({ value, children }) =>
      value?.href ? (
        <SmartLink href={value.href} className="warranty-guide__link">
          {children}
        </SmartLink>
      ) : (
        <>{children}</>
      ),
  },
  types: {
    linkButton: ({ value }: { value: { label?: string; href?: string } }) =>
      value.href && value.label ? (
        <p className="warranty-guide__action">
          <SmartLink href={value.href} className="warranty-guide__button">
            {value.label}
          </SmartLink>
        </p>
      ) : null,
  },
}

export default function WarrantyGuide({ sections }: { sections: NonNullable<AfterSalesPageData['guideSections']> }) {
  const anchored = sections.map((section, i) => ({ ...section, anchor: `warranty-guide-${i + 1}` }))
  const titled = anchored.filter((s) => s.title)

  return (
    <section className="warranty-section">
      <div className="warranty-section__inner warranty-terms">
        {titled.length > 1 && (
          <nav className="warranty-terms__nav" aria-label="製品の保証の目次">
            {titled.map((section, i) => (
              <a key={section._key} className="warranty-terms__nav-link" href={`#${section.anchor}`}>
                <span className="warranty-terms__nav-num">{String(i + 1).padStart(2, '0')}</span>
                {section.title}
              </a>
            ))}
          </nav>
        )}

        {anchored.map((section) => (
          <section
            key={section._key}
            id={section.anchor}
            className="warranty-terms__section warranty-guide__section"
            aria-labelledby={section.title ? `${section.anchor}-title` : undefined}
          >
            {section.title && (
              <h2 id={`${section.anchor}-title`} className="warranty-terms__heading">
                {section.title}
              </h2>
            )}
            <PortableText
              value={(section.body ?? []) as Parameters<typeof PortableText>[0]['value']}
              components={components}
            />
          </section>
        ))}
      </div>
    </section>
  )
}
