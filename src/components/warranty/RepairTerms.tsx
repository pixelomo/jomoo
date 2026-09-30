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
 * async server component: both pages that print it fetch it themselves. Each
 * group is its own numbered list, restarting at 1, as the source copy has it.
 * A sub-clause's marker, when it has one, is set in bold as its heading; one
 * without carries its number inside the sentence, unemphasised.
 */
export default async function RepairTerms() {
  const data = await getAfterSalesPage()
  if (!data?.termGroups?.length) return null

  return (
    <section className="warranty-section">
      <div className="warranty-section__inner warranty-terms">
        {data.termsTitle && <h2 className="warranty-section__title">{data.termsTitle}</h2>}

        {data.termGroups.map((group) => (
          <ol key={group._key}>
            {(group.clauses ?? []).map((clause) => (
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
        ))}

        {data.termsClosing && <p className="warranty-terms__closing">{data.termsClosing}</p>}
      </div>
    </section>
  )
}
