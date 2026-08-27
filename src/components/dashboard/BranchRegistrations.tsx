import { getTranslations } from 'next-intl/server'
import RegistrationCard from './RegistrationCard'
import type { BranchCustomerGroup } from '@/lib/branchRegistrations'
import './member-portal.css'

interface Props {
  branchName: string | null
  /** False when the account was created before branches existed, or its 会社名
   *  was blank — there is nothing to list and nothing the member can do about
   *  it, so the panel says who to ask. */
  hasBranch: boolean
  groups: BranchCustomerGroup[]
}

/**
 * What a 法人 member sees that a 個人 member does not: every product registered
 * against their branch, whoever filed it, split by customer.
 *
 * The cards are read-only. A dealer is being shown a customer's registration so
 * they can service it — the customer stays the only person who can change it,
 * which is what /api/registrations/[id] already enforces.
 */
export default async function BranchRegistrations({ branchName, hasBranch, groups }: Props) {
  const t = await getTranslations('dashboard')

  const productCount = groups.reduce((total, group) => total + group.registrations.length, 0)

  return (
    <section className={`member-card${groups.length ? ' member-card--list' : ''}`}>
      <h2 className="member-card__title">{t('branchTitle')}</h2>
      {branchName && <p className="member-branch__name">{branchName}</p>}

      {!hasBranch ? (
        <p className="member-card__body">{t('branchNoBranch')}</p>
      ) : groups.length === 0 ? (
        <p className="member-card__body">{t('branchEmpty')}</p>
      ) : (
        <>
          <p className="member-branch__summary">
            {t('branchCustomerCount', { customers: groups.length, products: productCount })}
          </p>

          <div className="member-branch__groups">
            {groups.map((group) => (
              <div key={group.userId} className="member-branch__group">
                <div className="member-branch__customer">
                  <h3 className="member-branch__customer-name">
                    {group.customerName ?? t('branchUnnamedCustomer')}
                  </h3>
                  <span className="member-branch__customer-meta">
                    {group.email} ・ {t('branchCount', { count: group.registrations.length })}
                  </span>
                </div>

                <div className="member-products">
                  {group.registrations.map(({ registration, warrantyExpiry }) => (
                    <RegistrationCard
                      key={registration.id}
                      registration={registration}
                      warrantyExpiry={warrantyExpiry}
                      readOnly
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  )
}
