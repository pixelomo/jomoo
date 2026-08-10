'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import AccountField from '@/components/ui/AccountField'
import { COUNTRY_CODES, JP_PREFECTURES } from '@/data/jp-prefectures'
import {
  CorporateSignupSchema,
  GENDER_OPTIONS,
  IndividualSignupSchema,
  type CorporateSignupData,
  type IndividualSignupData,
  type MembershipType,
} from '@/types/membership-signup'

type Props = {
  membershipType: MembershipType
  defaultValues?: Partial<CorporateSignupData & IndividualSignupData>
  onSubmit: (data: CorporateSignupData | IndividualSignupData) => void
  onBack: () => void
  isSubmitting?: boolean
}

function resolveError(
  message: string | undefined,
  t: ReturnType<typeof useTranslations<'auth.membership'>>
) {
  if (!message) return undefined
  if (
    message === 'passwordMinLength' ||
    message === 'passwordComplexity' ||
    message === 'passwordMismatch' ||
    message === 'phoneDigitsOnly'
  ) {
    return t(`errors.${message}`)
  }
  return t('errors.required')
}

export default function SignUpStep2({
  membershipType,
  defaultValues,
  onSubmit,
  onBack,
  isSubmitting = false,
}: Props) {
  const t = useTranslations('auth.membership')
  const tc = useTranslations('common')
  const isCorporate = membershipType === 'corporate'

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CorporateSignupData | IndividualSignupData>({
    resolver: zodResolver(isCorporate ? CorporateSignupSchema : IndividualSignupSchema),
    defaultValues: {
      countryCode: '+81',
      ...defaultValues,
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <section className="account-form__section">
        <h2 className="account-form__legend">{t('memberInfo')}</h2>
        <p className="account-form__sectionnote">{t('emailRegistration')}</p>

      <AccountField
        label={t('email')}
        required
        htmlFor="email"
        error={resolveError(errors.email?.message, t)}
      >
        <input id="email" type="email" className="account-input" {...register('email')} />
      </AccountField>

      {isCorporate && (
        <>
          <AccountField label={t('companyName')} htmlFor="companyName">
            <input id="companyName" type="text" className="account-input" {...register('companyName')} />
          </AccountField>
          <AccountField label={t('companyNameKana')} htmlFor="companyNameKana">
            <input
              id="companyNameKana"
              type="text"
              className="account-input"
              {...register('companyNameKana')}
            />
          </AccountField>
        </>
      )}

      <div className="account-row account-row--two">
        <AccountField
          label={t('contactLastName')}
          required
          htmlFor="lastName"
          error={resolveError(errors.lastName?.message, t)}
        >
          <input id="lastName" type="text" className="account-input" {...register('lastName')} />
        </AccountField>
        <AccountField
          label={t('contactFirstName')}
          required
          htmlFor="firstName"
          error={resolveError(errors.firstName?.message, t)}
        >
          <input id="firstName" type="text" className="account-input" {...register('firstName')} />
        </AccountField>
      </div>

      <div className="account-row account-row--two">
        <AccountField
          label={t('lastNameKana')}
          required
          htmlFor="lastNameKana"
          error={resolveError(errors.lastNameKana?.message, t)}
        >
          <input id="lastNameKana" type="text" className="account-input" {...register('lastNameKana')} />
        </AccountField>
        <AccountField
          label={t('firstNameKana')}
          required
          htmlFor="firstNameKana"
          error={resolveError(errors.firstNameKana?.message, t)}
        >
          <input id="firstNameKana" type="text" className="account-input" {...register('firstNameKana')} />
        </AccountField>
      </div>

      {!isCorporate && (
        <div className="account-row account-row--two">
          <AccountField label={t('gender')} htmlFor="gender">
            <select id="gender" className="account-select" defaultValue="" {...register('gender')}>
              <option value="">{t('genderPlaceholder')}</option>
              {GENDER_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {t(`gender_${option}`)}
                </option>
              ))}
            </select>
          </AccountField>
          <AccountField label={t('dateOfBirth')} htmlFor="dateOfBirth">
            <input
              id="dateOfBirth"
              type="date"
              className="account-input"
              max={new Date().toISOString().split('T')[0]}
              {...register('dateOfBirth')}
            />
          </AccountField>
        </div>
      )}

      <p className="account-note">{t('phoneHint')}</p>

      <div className="account-row account-row--code">
        <AccountField
          label={t('countryCode')}
          required
          htmlFor="countryCode"
          error={resolveError(errors.countryCode?.message, t)}
        >
          <select id="countryCode" className="account-select" {...register('countryCode')}>
            {COUNTRY_CODES.map((code) => (
              <option key={code.value} value={code.value}>
                {code.label}
              </option>
            ))}
          </select>
        </AccountField>
        <AccountField
          label={t('phoneNumber')}
          required
          htmlFor="phoneNumber"
          error={resolveError(errors.phoneNumber?.message, t)}
        >
          <input
            id="phoneNumber"
            type="tel"
            inputMode="numeric"
            className="account-input"
            {...register('phoneNumber')}
          />
        </AccountField>
      </div>

      </section>

      <section className="account-form__section">
        <h2 className="account-form__legend">{t('address')}</h2>
        <AccountField
          label={t('postalCode')}
          required
          htmlFor="postalCode"
          error={resolveError(errors.postalCode?.message, t)}
        >
          <input id="postalCode" type="text" className="account-input" {...register('postalCode')} />
        </AccountField>

        <AccountField
          label={t('prefecture')}
          required
          htmlFor="prefecture"
          error={resolveError(errors.prefecture?.message, t)}
        >
          <select id="prefecture" className="account-select" defaultValue="" {...register('prefecture')}>
            <option value="">{t('prefecturePlaceholder')}</option>
            {JP_PREFECTURES.map((prefecture) => (
              <option key={prefecture} value={prefecture}>
                {prefecture}
              </option>
            ))}
          </select>
        </AccountField>

        <AccountField
          label={t('city')}
          required
          htmlFor="city"
          error={resolveError(errors.city?.message, t)}
          hint={t('cityHint')}
        >
          <input id="city" type="text" className="account-input" {...register('city')} />
        </AccountField>

        <AccountField
          label={t('streetAddress')}
          required
          htmlFor="streetAddress"
          error={resolveError(errors.streetAddress?.message, t)}
        >
          <input id="streetAddress" type="text" className="account-input" {...register('streetAddress')} />
        </AccountField>

        <AccountField label={t('building')} htmlFor="building">
        <input id="building" type="text" className="account-input" {...register('building')} />
        </AccountField>
      </section>

      <section className="account-form__section">
        <h2 className="account-form__legend">{t('password')}</h2>
        <AccountField
          label={t('password')}
          required
          htmlFor="password"
          error={resolveError(errors.password?.message, t)}
          note={
            <>
              {t('passwordHint1')}
              <br />
              {t('passwordHint2')}
            </>
          }
        >
          <input
            id="password"
            type="password"
            className="account-input"
            autoComplete="new-password"
            {...register('password')}
          />
        </AccountField>

        <AccountField
        label={t('confirmPassword')}
        required
        htmlFor="confirmPassword"
        error={resolveError(errors.confirmPassword?.message, t)}
      >
        <input
          id="confirmPassword"
          type="password"
          className="account-input"
          autoComplete="new-password"
          {...register('confirmPassword')}
        />
        </AccountField>
      </section>

      <div className="account-form__actions account-form__actions--pair">
        <button
          type="button"
          onClick={onBack}
          disabled={isSubmitting}
          className="member-btn member-btn--ghost"
        >
          {t('back')}
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="member-btn"
        >
          {isSubmitting ? tc('loading') : t('next')}
        </button>
      </div>
    </form>
  )
}
