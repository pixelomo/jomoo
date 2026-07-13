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
    <div className="flex flex-col gap-1 border-b border-zinc-100 pb-4 last:border-b-0 last:pb-0 sm:flex-row sm:gap-4">
      <dt className="w-36 shrink-0 text-sm font-medium text-zinc-500">{label}</dt>
      <dd className="text-sm text-zinc-900 whitespace-pre-line break-words">{value}</dd>
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
    <div className="space-y-8">
      <div className="text-center">
        <p className="text-lg font-medium text-zinc-900">{t('completeThanks')}</p>
        <p className="mt-2 text-sm text-zinc-600">{t('completeClosing')}</p>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-6">
        <h2 className="mb-5 text-base font-semibold text-zinc-900">{t('reviewTitle')}</h2>
        <dl className="space-y-4">
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
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex flex-col-reverse gap-3 sm:flex-row">
        <button
          type="button"
          onClick={onEdit}
          disabled={isSubmitting}
          className="inline-flex flex-1 items-center justify-center rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors disabled:opacity-50"
        >
          {t('editInfo')}
        </button>
        <button
          type="button"
          onClick={onContinue}
          disabled={isSubmitting}
          className="inline-flex flex-1 items-center justify-center rounded-lg bg-zinc-900 px-4 py-3 text-sm font-medium text-white hover:bg-zinc-700 transition-colors disabled:opacity-50"
        >
          {isSubmitting ? tc('loading') : t('goToDashboard')}
        </button>
      </div>
    </div>
  )
}
