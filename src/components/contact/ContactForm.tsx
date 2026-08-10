'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import SignUpField from '@/components/auth/SignUpField'
import NextCaret from '@/components/auth/NextCaret'
import ContactStepIndicator from './ContactStepIndicator'
import { COUNTRY_CODES } from '@/data/jp-prefectures'
import {
  CONTACT_CATEGORIES,
  ContactSchema,
  type ContactCategory,
  type ContactData,
} from '@/types/contact'
// Same stylesheet as 会員登録: the enquiry form and the sign-up form are the
// same design, so they share the chrome rather than each having their own.
import '@/components/dashboard/member-portal.css'

const SUBMIT_ERROR_MESSAGE = '送信に失敗しました。しばらくしてから再度お試しください。'

function resolveError(message: string | undefined) {
  if (!message) return undefined
  if (message === 'phoneDigitsOnly') return '半角数字ハイフンなしで入力ください'
  if (message === 'showroomDateRequired') return 'ショールーム予約の日時を入力してください'
  return '必須項目です'
}

export default function ContactForm() {
  const [step, setStep] = useState(1)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const stepLabels = ['お問い合わせ', '送信完了']

  // ?category=fault preselects the dropdown, so links like the dashboard's
  // WEB修理依頼 button land the visitor on the right department already chosen.
  const searchParams = useSearchParams()
  const requested = searchParams.get('category')
  const presetCategory = CONTACT_CATEGORIES.some((c) => c.id === requested)
    ? (requested as ContactCategory)
    : undefined

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ContactData>({
    resolver: zodResolver(ContactSchema),
    defaultValues: {
      countryCode: '+81',
      showroomReservation: false,
      ...(presetCategory && { category: presetCategory }),
    },
  })

  const showroomReservation = watch('showroomReservation')

  const onSubmit = async (data: ContactData) => {
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        throw new Error('send_failed')
      }

      setStep(2)
    } catch {
      setSubmitError(SUBMIT_ERROR_MESSAGE)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="signup">
      <header className="signup__header">
        <h1 className="signup__title">お問い合わせ</h1>
        {step === 1 && (
          <p className="signup__subtitle">下記項目をご入力のうえ、お問い合わせください。</p>
        )}
      </header>

      <ContactStepIndicator currentStep={step} labels={stepLabels} />

      {step === 1 ? (
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="signup__card">
            {/* 「ご用件」 rather than 「お問い合わせ内容」: the legend would
                otherwise repeat the label of the field directly beneath it. */}
            <section className="signup__section">
              <h2 className="signup__legend">ご用件</h2>

              <SignUpField
                label="お問い合わせ種別"
                required
                htmlFor="category"
                error={resolveError(errors.category?.message)}
              >
                <select
                  id="category"
                  className="account-select signup__select"
                  defaultValue={presetCategory ?? ''}
                  {...register('category')}
                >
                  <option value="" disabled>
                    選択してください
                  </option>
                  {CONTACT_CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
                <p className="signup__note">内容に応じた担当部署へお繋ぎします。</p>
              </SignUpField>

              <SignUpField
                label="お問い合わせ内容"
                required
                htmlFor="message"
                error={resolveError(errors.message?.message)}
              >
                <textarea id="message" rows={6} className="account-input" {...register('message')} />
              </SignUpField>
            </section>

            <section className="signup__section">
              <h2 className="signup__legend">お客様情報</h2>

              <SignUpField label="姓" required htmlFor="lastName" error={resolveError(errors.lastName?.message)}>
                <input id="lastName" type="text" className="account-input" {...register('lastName')} />
              </SignUpField>

              <SignUpField label="名" required htmlFor="firstName" error={resolveError(errors.firstName?.message)}>
                <input id="firstName" type="text" className="account-input" {...register('firstName')} />
              </SignUpField>

              <SignUpField label="会社名" htmlFor="companyName">
                <input id="companyName" type="text" className="account-input" {...register('companyName')} />
                <p className="signup__note">※法人の場合のみご記入ください。</p>
              </SignUpField>

              <SignUpField
                label="メールアドレス"
                required
                htmlFor="email"
                error={resolveError(errors.email?.message)}
              >
                <input id="email" type="email" className="account-input" {...register('email')} />
              </SignUpField>

              <SignUpField
                label="会社電話番号"
                htmlFor="phoneNumber"
                error={resolveError(errors.phoneNumber?.message)}
              >
                <div className="signup__phone">
                  <select
                    id="countryCode"
                    className="account-select"
                    aria-label="国番号"
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
                    {...register('phoneNumber')}
                  />
                </div>
                <p className="signup__note">※法人の場合のみご記入ください。</p>
              </SignUpField>
            </section>

            <section className="signup__section">
              <h2 className="signup__legend">ショールーム予約</h2>

              <SignUpField label="ご予約" htmlFor="showroomReservation">
                <label className="signup__check">
                  <input
                    id="showroomReservation"
                    type="checkbox"
                    {...register('showroomReservation')}
                  />
                  ショールーム予約を希望する
                </label>
              </SignUpField>

              {showroomReservation && (
                <SignUpField
                  label="日時"
                  required
                  htmlFor="preferredDateTime"
                  error={resolveError(errors.preferredDateTime?.message)}
                >
                  <input
                    id="preferredDateTime"
                    type="datetime-local"
                    className="account-input signup__select"
                    {...register('preferredDateTime')}
                  />
                </SignUpField>
              )}
            </section>
          </div>

          {/* Sits directly above 次へ, where it is on screen when it appears. */}
          {submitError && (
            <p className="signup__alert" role="alert">
              {submitError}
            </p>
          )}

          <div className="signup__actions">
            <button type="submit" className="signup__next" disabled={isSubmitting}>
              <span>{isSubmitting ? '送信中…' : '次へ'}</span>
              <NextCaret />
            </button>
          </div>
        </form>
      ) : (
        <div className="signup__complete">
          <p>お問い合わせありがとうございます。</p>
          <p>送信完了しました。</p>
        </div>
      )}
    </div>
  )
}
