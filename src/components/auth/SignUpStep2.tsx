'use client'

import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import SignUpField from './SignUpField'
import NextCaret from './NextCaret'
import { COUNTRY_CODES, JP_PREFECTURES } from '@/data/jp-prefectures'
import {
  CorporateSignupSchema,
  GENDER_OPTIONS,
  IndividualSignupSchema,
  type MembershipType,
  type SignupData,
} from '@/types/membership-signup'

type Props = {
  membershipType: MembershipType
  defaultValues?: SignupData
  onSubmit: (data: SignupData) => void
  onBack: () => void
  isSubmitting?: boolean
  submitError?: string | null
}

const CURRENT_YEAR = new Date().getFullYear()
const YEARS = Array.from({ length: 120 }, (_, i) => String(CURRENT_YEAR - i))
const MONTHS = Array.from({ length: 12 }, (_, i) => String(i + 1))
const DAYS = Array.from({ length: 31 }, (_, i) => String(i + 1))

/** The schemas carry a message only where the wording is specific; everything
 *  else is a missing required field. */
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
  submitError = null,
}: Props) {
  const t = useTranslations('auth.membership')
  const isCorporate = membershipType === 'corporate'

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupData>({
    resolver: zodResolver(
      isCorporate ? CorporateSignupSchema : IndividualSignupSchema
    ) as Resolver<SignupData>,
    defaultValues: {
      countryCode: '+81',
      ...defaultValues,
    },
  })

  const err = (field: keyof SignupData) => resolveError(errors[field]?.message as string, t)

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      {submitError && <div className="signup__alert">{submitError}</div>}

      <section className="signup__section">
        <h2 className="signup__legend">{t('memberInfo')}</h2>

        <SignUpField label={t('email')} required htmlFor="email" error={err('email')}>
          <input
            id="email"
            type="email"
            className="account-input"
            placeholder={t('emailPlaceholder')}
            autoComplete="email"
            {...register('email')}
          />
        </SignUpField>

        {isCorporate && (
          <>
            <SignUpField
              label={t('companyName')}
              required
              htmlFor="companyName"
              error={err('companyName')}
            >
              <input
                id="companyName"
                type="text"
                className="account-input"
                placeholder={t('companyNamePlaceholder')}
                {...register('companyName')}
              />
            </SignUpField>

            <SignUpField
              label={t('companyNameKana')}
              htmlFor="companyNameKana"
              error={err('companyNameKana')}
            >
              <input
                id="companyNameKana"
                type="text"
                className="account-input"
                placeholder={t('companyNameKanaPlaceholder')}
                {...register('companyNameKana')}
              />
            </SignUpField>
          </>
        )}

        <SignUpField
          label={isCorporate ? t('contactName') : t('name')}
          required
          htmlFor="lastName"
          error={err('lastName') ?? err('firstName')}
        >
          <div className="account-field__pair">
            <input
              id="lastName"
              type="text"
              className="account-input"
              placeholder={t('lastNamePlaceholder')}
              {...register('lastName')}
            />
            <input
              id="firstName"
              type="text"
              className="account-input"
              placeholder={t('firstNamePlaceholder')}
              {...register('firstName')}
            />
          </div>
        </SignUpField>

        <SignUpField
          label={isCorporate ? t('contactNameKana') : t('nameKana')}
          required
          htmlFor="lastNameKana"
          error={err('lastNameKana') ?? err('firstNameKana')}
        >
          <div className="account-field__pair">
            <input
              id="lastNameKana"
              type="text"
              className="account-input"
              placeholder={t('lastNameKanaPlaceholder')}
              {...register('lastNameKana')}
            />
            <input
              id="firstNameKana"
              type="text"
              className="account-input"
              placeholder={t('firstNameKanaPlaceholder')}
              {...register('firstNameKana')}
            />
          </div>
        </SignUpField>

        {!isCorporate && (
          <>
            {/* Drawn as a free-text box, but kept a fixed list so a stored
                value still displays in the dashboard and admin dropdowns,
                which only know these four. */}
            <SignUpField label={t('gender')} htmlFor="gender" error={err('gender')}>
              <select
                id="gender"
                className="account-select signup__select"
                defaultValue=""
                {...register('gender')}
              >
                <option value="">{t('selectPlaceholder')}</option>
                {GENDER_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {t(`gender_${option}`)}
                  </option>
                ))}
              </select>
            </SignUpField>

            <SignUpField label={t('dateOfBirth')} htmlFor="birthYear">
              <div className="signup__birth">
                <select
                  id="birthYear"
                  className="account-select"
                  defaultValue=""
                  {...register('birthYear')}
                >
                  <option value="">{t('selectPlaceholder')}</option>
                  {YEARS.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
                <span>{t('birthYear')}</span>

                <select
                  id="birthMonth"
                  className="account-select"
                  defaultValue=""
                  aria-label={t('birthMonth')}
                  {...register('birthMonth')}
                >
                  <option value="">–</option>
                  {MONTHS.map((month) => (
                    <option key={month} value={month}>
                      {month}
                    </option>
                  ))}
                </select>
                <span>{t('birthMonth')}</span>

                <select
                  id="birthDay"
                  className="account-select"
                  defaultValue=""
                  aria-label={t('birthDay')}
                  {...register('birthDay')}
                >
                  <option value="">–</option>
                  {DAYS.map((day) => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ))}
                </select>
                <span>{t('birthDay')}</span>
              </div>
            </SignUpField>

            <SignUpField
              label={t('phoneNumber')}
              required
              htmlFor="phoneNumber"
              error={err('countryCode') ?? err('phoneNumber')}
            >
              <div className="signup__phone">
                <select
                  id="countryCode"
                  className="account-select"
                  aria-label={t('countryCodePlaceholder')}
                  {...register('countryCode')}
                >
                  {COUNTRY_CODES.map((code) => (
                    <option key={code.value} value={code.value}>
                      {code.label}
                    </option>
                  ))}
                </select>
                <input
                  id="phoneNumber"
                  type="tel"
                  inputMode="numeric"
                  className="account-input"
                  placeholder={t('phoneNumberPlaceholder')}
                  autoComplete="tel-national"
                  {...register('phoneNumber')}
                />
              </div>
            </SignUpField>
          </>
        )}
      </section>

      <section className="signup__section">
        <h2 className="signup__legend">{t('addressSection')}</h2>

        <SignUpField
          label={t('postalCode')}
          required={isCorporate}
          htmlFor="postalCode"
          error={err('postalCode')}
        >
          <input
            id="postalCode"
            type="text"
            inputMode="numeric"
            className="account-input"
            placeholder={t('postalCodePlaceholder')}
            autoComplete="postal-code"
            {...register('postalCode')}
          />
        </SignUpField>

        <SignUpField
          label={t('prefecture')}
          required={isCorporate}
          htmlFor="prefecture"
          error={err('prefecture')}
        >
          <select
            id="prefecture"
            className="account-select signup__select"
            defaultValue=""
            {...register('prefecture')}
          >
            <option value="">{t('selectPlaceholder')}</option>
            {JP_PREFECTURES.map((prefecture) => (
              <option key={prefecture} value={prefecture}>
                {prefecture}
              </option>
            ))}
          </select>
        </SignUpField>

        <SignUpField
          label={t('city')}
          required={isCorporate}
          htmlFor="city"
          error={err('city')}
        >
          <input
            id="city"
            type="text"
            className="account-input"
            placeholder={t('cityPlaceholder')}
            {...register('city')}
          />
        </SignUpField>

        <SignUpField
          label={t('streetAddress')}
          required={isCorporate}
          htmlFor="streetAddress"
          error={err('streetAddress')}
        >
          <input
            id="streetAddress"
            type="text"
            className="account-input"
            placeholder={t('streetAddressPlaceholder')}
            {...register('streetAddress')}
          />
        </SignUpField>

        <SignUpField
          label={t('building')}
          required={isCorporate}
          htmlFor="building"
          error={err('building')}
        >
          <input
            id="building"
            type="text"
            className="account-input"
            placeholder={t('buildingPlaceholder')}
            {...register('building')}
          />
        </SignUpField>
      </section>

      <section className="signup__section">
        <h2 className="signup__legend">{t('passwordSection')}</h2>

        <SignUpField label={t('password')} required htmlFor="password" error={err('password')}>
          <input
            id="password"
            type="password"
            className="account-input"
            placeholder={t('passwordPlaceholder')}
            autoComplete="new-password"
            {...register('password')}
          />
        </SignUpField>

        <p className="signup__note">{t('passwordHint1')}</p>
        <p className="signup__note">{t('passwordHint2')}</p>

        <SignUpField
          label={t('confirmPassword')}
          required
          htmlFor="confirmPassword"
          error={err('confirmPassword')}
        >
          <input
            id="confirmPassword"
            type="password"
            className="account-input"
            placeholder={t('passwordPlaceholder')}
            autoComplete="new-password"
            {...register('confirmPassword')}
          />
        </SignUpField>
      </section>

      {/* The design shows 次へ alone, but without 戻る someone who picked the
          wrong 法人／個人 has no way back to step 1. */}
      <div className="signup__actions">
        <button type="button" className="signup__back" onClick={onBack} disabled={isSubmitting}>
          {t('back')}
        </button>
        <button type="submit" className="signup__next" disabled={isSubmitting}>
          <span>{t('next')}</span>
          <NextCaret />
        </button>
      </div>
    </form>
  )
}
