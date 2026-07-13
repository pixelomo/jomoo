'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import FormField, { inputClass } from '@/components/ui/FormField'
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-zinc-900">{t('memberInfo')}</h2>
        <p className="mt-1 text-sm text-zinc-500">{t('emailRegistration')}</p>
      </div>

      <FormField
        label={t('email')}
        required
        requiredBadge
        htmlFor="email"
        error={resolveError(errors.email?.message, t)}
      >
        <input id="email" type="email" className={inputClass} {...register('email')} />
      </FormField>

      {isCorporate && (
        <>
          <FormField label={t('companyName')} htmlFor="companyName">
            <input id="companyName" type="text" className={inputClass} {...register('companyName')} />
          </FormField>
          <FormField label={t('companyNameKana')} htmlFor="companyNameKana">
            <input
              id="companyNameKana"
              type="text"
              className={inputClass}
              {...register('companyNameKana')}
            />
          </FormField>
        </>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField
          label={t('contactLastName')}
          required
          requiredBadge
          htmlFor="lastName"
          error={resolveError(errors.lastName?.message, t)}
        >
          <input id="lastName" type="text" className={inputClass} {...register('lastName')} />
        </FormField>
        <FormField
          label={t('contactFirstName')}
          required
          requiredBadge
          htmlFor="firstName"
          error={resolveError(errors.firstName?.message, t)}
        >
          <input id="firstName" type="text" className={inputClass} {...register('firstName')} />
        </FormField>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField
          label={t('lastNameKana')}
          required
          requiredBadge
          htmlFor="lastNameKana"
          error={resolveError(errors.lastNameKana?.message, t)}
        >
          <input id="lastNameKana" type="text" className={inputClass} {...register('lastNameKana')} />
        </FormField>
        <FormField
          label={t('firstNameKana')}
          required
          requiredBadge
          htmlFor="firstNameKana"
          error={resolveError(errors.firstNameKana?.message, t)}
        >
          <input id="firstNameKana" type="text" className={inputClass} {...register('firstNameKana')} />
        </FormField>
      </div>

      {!isCorporate && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label={t('gender')} htmlFor="gender">
            <select id="gender" className={inputClass} defaultValue="" {...register('gender')}>
              <option value="">{t('genderPlaceholder')}</option>
              {GENDER_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {t(`gender_${option}`)}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label={t('dateOfBirth')} htmlFor="dateOfBirth">
            <input
              id="dateOfBirth"
              type="date"
              className={inputClass}
              max={new Date().toISOString().split('T')[0]}
              {...register('dateOfBirth')}
            />
          </FormField>
        </div>
      )}

      <p className="text-xs text-zinc-500">{t('phoneHint')}</p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-[8rem_1fr]">
        <FormField
          label={t('countryCode')}
          required
          requiredBadge
          htmlFor="countryCode"
          error={resolveError(errors.countryCode?.message, t)}
        >
          <select id="countryCode" className={inputClass} {...register('countryCode')}>
            {COUNTRY_CODES.map((code) => (
              <option key={code.value} value={code.value}>
                {code.label}
              </option>
            ))}
          </select>
        </FormField>
        <FormField
          label={t('phoneNumber')}
          required
          requiredBadge
          htmlFor="phoneNumber"
          error={resolveError(errors.phoneNumber?.message, t)}
        >
          <input
            id="phoneNumber"
            type="tel"
            inputMode="numeric"
            className={inputClass}
            {...register('phoneNumber')}
          />
        </FormField>
      </div>

      <div>
        <h3 className="mb-4 text-sm font-semibold text-zinc-900">{t('address')}</h3>
        <div className="space-y-4">
          <FormField
            label={t('postalCode')}
            required
            requiredBadge
            htmlFor="postalCode"
            error={resolveError(errors.postalCode?.message, t)}
          >
            <input id="postalCode" type="text" className={inputClass} {...register('postalCode')} />
          </FormField>

          <FormField
            label={t('prefecture')}
            required
            requiredBadge
            htmlFor="prefecture"
            error={resolveError(errors.prefecture?.message, t)}
          >
            <select id="prefecture" className={inputClass} defaultValue="" {...register('prefecture')}>
              <option value="">{t('prefecturePlaceholder')}</option>
              {JP_PREFECTURES.map((prefecture) => (
                <option key={prefecture} value={prefecture}>
                  {prefecture}
                </option>
              ))}
            </select>
          </FormField>

          <FormField
            label={t('city')}
            required
            requiredBadge
            htmlFor="city"
            error={resolveError(errors.city?.message, t)}
            hint={t('cityHint')}
          >
            <input id="city" type="text" className={inputClass} {...register('city')} />
          </FormField>

          <FormField
            label={t('streetAddress')}
            required
            requiredBadge
            htmlFor="streetAddress"
            error={resolveError(errors.streetAddress?.message, t)}
          >
            <input id="streetAddress" type="text" className={inputClass} {...register('streetAddress')} />
          </FormField>

          <FormField label={t('building')} htmlFor="building">
            <input id="building" type="text" className={inputClass} {...register('building')} />
          </FormField>
        </div>
      </div>

      <div className="space-y-1.5">
        <FormField
          label={t('password')}
          required
          requiredBadge
          htmlFor="password"
          error={resolveError(errors.password?.message, t)}
        >
          <input
            id="password"
            type="password"
            className={inputClass}
            autoComplete="new-password"
            {...register('password')}
          />
        </FormField>
        <p className="text-xs text-zinc-500">{t('passwordHint1')}</p>
        <p className="text-xs text-zinc-500">{t('passwordHint2')}</p>
      </div>

      <FormField
        label={t('confirmPassword')}
        required
        requiredBadge
        htmlFor="confirmPassword"
        error={resolveError(errors.confirmPassword?.message, t)}
      >
        <input
          id="confirmPassword"
          type="password"
          className={inputClass}
          autoComplete="new-password"
          {...register('confirmPassword')}
        />
      </FormField>

      <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row">
        <button
          type="button"
          onClick={onBack}
          disabled={isSubmitting}
          className="inline-flex flex-1 items-center justify-center rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors disabled:opacity-50"
        >
          {t('back')}
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex flex-1 items-center justify-center rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-700 transition-colors disabled:opacity-50"
        >
          {isSubmitting ? tc('loading') : t('next')}
        </button>
      </div>
    </form>
  )
}
