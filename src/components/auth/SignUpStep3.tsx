'use client'

import { useTranslations } from 'next-intl'
import type {
  CorporateSignupData,
  IndividualSignupData,
  MembershipType,
} from '@/types/membership-signup'

type ReviewData = Partial<CorporateSignupData & IndividualSignupData>

interface Props {
  membershipType: MembershipType
  formData: ReviewData
  onEdit: () => void
  onContinue: () => void
  isSubmitting?: boolean
  error?: string | null
}

function ReviewRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null

  return (
    <div className="member-field">
      <span className="member-field__label">{label}</span>
      <span className="member-field__value" style={{ whiteSpace: 'pre-line' }}>
        {value}
      </span>
    </div>
  )
}

export default function SignUpStep3({
  membershipType,
  formData,
  onEdit,
  onContinue,
  isSubmitting = false,
  error = null,
}: Props) {
  const t = useTranslations('auth.membership')
  const tc = useTranslations('common')

  const isCorporate = membershipType === 'corporate'
  const fullName = [formData.lastName, formData.firstName].filter(Boolean).join(' ')
  const fullNameKana = [formData.lastNameKana, formData.firstNameKana].filter(Boolean).join(' ')
  const phone =
    formData.countryCode && formData.phoneNumber
      ? `${formData.countryCode} ${formData.phoneNumber}`
      : undefined

  const addressLines = [
    formData.postalCode ? `〒${formData.postalCode}` : null,
    [formData.prefecture, formData.city].filter(Boolean).join(' '),
    formData.streetAddress,
    formData.building,
  ]
    .filter(Boolean)
    .join('\n')

  const genderLabel =
    formData.gender && typeof formData.gender === 'string'
      ? t(`gender_${formData.gender}`)
      : undefined

  return (
    <div>
      <div className="account-outcome">
        <h2 className="account-outcome__title">{t('completeThanks')}</h2>
        <p className="account-outcome__body">{t('completeClosing')}</p>
      </div>

      <section className="account-form__section">
        <h2 className="account-form__legend">{t('reviewTitle')}</h2>
        <dl>
          <ReviewRow
            label={t('reviewType')}
            value={isCorporate ? t('corporate') : t('individual')}
          />
          {isCorporate && (
            <>
              <ReviewRow label={t('companyName')} value={formData.companyName} />
              <ReviewRow label={t('companyNameKana')} value={formData.companyNameKana} />
            </>
          )}
          <ReviewRow label={t('reviewName')} value={fullName} />
          <ReviewRow label={t('reviewNameKana')} value={fullNameKana} />
          {!isCorporate && (
            <>
              <ReviewRow label={t('gender')} value={genderLabel} />
              <ReviewRow label={t('dateOfBirth')} value={formData.dateOfBirth} />
            </>
          )}
          <ReviewRow label={t('reviewEmail')} value={formData.email} />
          <ReviewRow label={t('phoneNumber')} value={phone} />
          <ReviewRow label={t('address')} value={addressLines || undefined} />
        </dl>
      </section>

      {error && (
        <p className="account-alert" role="alert">
          {error}
        </p>
      )}

      <div className="account-form__actions account-form__actions--pair">
        <button
          type="button"
          onClick={onEdit}
          disabled={isSubmitting}
          className="member-btn member-btn--ghost"
        >
          {t('editInfo')}
        </button>
        <button
          type="button"
          onClick={onContinue}
          disabled={isSubmitting}
          className="member-btn"
        >
          {isSubmitting ? tc('loading') : t('goToDashboard')}
        </button>
      </div>
    </div>
  )
}
