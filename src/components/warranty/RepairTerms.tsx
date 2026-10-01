import { getAfterSalesPage } from '@/lib/sanity'
import './repair-terms.css'

/**
 * 無料修理規定（保証規定）— the free-repair terms.
 *
 * Shared, and deliberately so: they close the warranty certificate and they are
 * the whole of /after-sales. Legal copy that exists twice drifts, and a clause
 * corrected in one place while the other keeps the old wording is worse than
 * either version on its own.
 *
 * Wording is the client's, edited under アフターサービス in the Studio.
 */

/**
 * The terms come from the afterSalesPage document in Sanity, so this is an
 * async server component: both pages that print it fetch it themselves.
 *
 * The policy is split into sections, each with its own heading and a button in
 * the row above that jumps to it. Each section is its own numbered list,
 * restarting at 1; a section of a single clause drops the number, since "1." on
 * its own counts nothing. A sub-clause's marker, when it has one, is set in bold
 * as its heading; one without carries its number inside the sentence.
 */
export default async function RepairTerms() {
  const data = await getAfterSalesPage()
  if (!data?.termGroups?.length) return null

  const sections = data.termGroups.map((group, i) => ({ ...group, anchor: `warranty-terms-${i + 1}` }))
  const titled = sections.filter((s) => s.title)

  return (
    <section className="warranty-section">
      <div className="warranty-section__inner warranty-terms">
        {data.termsTitle && <h2 className="warranty-section__title">{data.termsTitle}</h2>}

        {titled.length > 1 && (
          <nav className="warranty-terms__nav" aria-label="保証規定の目次">
            {titled.map((section, i) => (
              <a key={section._key} className="warranty-terms__nav-link" href={`#${section.anchor}`}>
                <span className="warranty-terms__nav-num">{String(i + 1).padStart(2, '0')}</span>
                {section.title}
              </a>
            ))}
          </nav>
        )}

        {sections.map((section) => {
          const clauses = section.clauses ?? []
          return (
            <section
              key={section._key}
              id={section.anchor}
              className="warranty-terms__section"
              aria-labelledby={section.title ? `${section.anchor}-title` : undefined}
            >
              {section.title && (
                <h3 id={`${section.anchor}-title`} className="warranty-terms__heading">
                  {section.title}
                </h3>
              )}
              <ol className={clauses.length === 1 ? 'warranty-terms__single' : undefined}>
                {clauses.map((clause) => (
                  <li key={clause._key}>
                    {clause.text}
                    {clause.subClauses?.length ? (
                      <ol className={clause.spaced ? 'warranty-terms__sub--gap' : undefined}>
                        {clause.subClauses.map((sub) => (
                          <li key={sub._key}>
                            {sub.marker && <span className="warranty-terms__marker">{sub.marker}</span>}
                            {sub.text}
                          </li>
                        ))}
                      </ol>
                    ) : null}
                  </li>
                ))}
              </ol>
            </section>
          )
        })}

        {data.termsClosing && <p className="warranty-terms__closing">{data.termsClosing}</p>}
      </div>
    </section>
  )
}
