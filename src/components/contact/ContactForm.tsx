'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import FormField, { inputClass } from '@/components/ui/FormField'
import { COUNTRY_CODES } from '@/data/jp-prefectures'
import { ContactSchema, type ContactData } from '@/types/contact'
import ContactStepIndicator from './ContactStepIndicator'

const SUBMIT_ERROR_MESSAGE =
  '送信に失敗しました。しばらくしてから再度お試しください。'

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
    <div className="w-full max-w-2xl">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-zinc-900">お問い合わせ</h1>
        {step === 1 && (
          <p className="mt-2 text-sm text-zinc-600">
            下記項目をご入力のうえ、お問い合わせください。
          </p>
        )}
      </div>

      <ContactStepIndicator currentStep={step} labels={stepLabels} />

      {submitError && step === 1 && (
        <div className="mb-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {submitError}
        </div>
      )}

      {step === 1 && (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-sm font-semibold text-zinc-900">名前</h2>
              <span className="shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#73a4c7] bg-[#73a4c7]/12">
                必須
              </span>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField label="姓" required requiredBadge htmlFor="lastName" error={resolveError(errors.lastName?.message)}>
                <input id="lastName" type="text" className={inputClass} {...register('lastName')} />
              </FormField>
              <FormField label="名" required requiredBadge htmlFor="firstName" error={resolveError(errors.firstName?.message)}>
                <input id="firstName" type="text" className={inputClass} {...register('firstName')} />
              </FormField>
            </div>
          </div>

          <FormField label="会社名" htmlFor="companyName" hint="※法人の場合のみご記入ください。">
            <input id="companyName" type="text" className={inputClass} {...register('companyName')} />
          </FormField>

          <FormField
            label="メールアドレス"
            required
            requiredBadge
            htmlFor="email"
            error={resolveError(errors.email?.message)}
          >
            <input id="email" type="email" className={inputClass} {...register('email')} />
          </FormField>

          <div>
            <div className="mb-4">
              <h2 className="text-sm font-semibold text-zinc-900">会社電話番号</h2>
              <p className="mt-1 text-xs text-zinc-500">※法人の場合のみご記入ください。</p>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-[8rem_1fr]">
              <FormField label="国番号" htmlFor="countryCode">
                <select id="countryCode" className={inputClass} {...register('countryCode')}>
                  {COUNTRY_CODES.map((code) => (
                    <option key={code.value} value={code.value}>
                      {code.label}
                    </option>
                  ))}
                </select>
              </FormField>
              <FormField
                label="電話番号"
                htmlFor="phoneNumber"
                error={resolveError(errors.phoneNumber?.message)}
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
          </div>

          <FormField
            label="お問い合わせ内容"
            required
            requiredBadge
            htmlFor="message"
            error={resolveError(errors.message?.message)}
          >
            <textarea id="message" rows={5} className={inputClass} {...register('message')} />
          </FormField>

          <label className="flex items-center gap-3 text-sm text-zinc-700">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-zinc-300"
              {...register('showroomReservation')}
            />
            ショールーム予約
          </label>

          {showroomReservation && (
            <FormField
              label="日時"
              required
              requiredBadge
              htmlFor="preferredDateTime"
              error={resolveError(errors.preferredDateTime?.message)}
            >
              <input
                id="preferredDateTime"
                type="datetime-local"
                className={inputClass}
                {...register('preferredDateTime')}
              />
            </FormField>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-lg bg-zinc-900 px-4 py-3 text-sm font-medium text-white hover:bg-zinc-700 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? '送信中...' : '次へ'}
            </button>
          </div>
        </form>
      )}

      {step === 2 && (
        <div className="rounded-xl border border-[#73a4c7]/25 bg-[#73a4c7]/5 px-6 py-12 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#73a4c7]/15">
            <svg
              className="h-6 w-6 text-[#73a4c7]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-zinc-900">お問い合わせありがとうございます！</h2>
          <p className="mt-2 text-sm text-zinc-600">送信完了しました。</p>
        </div>
      )}
    </div>
  )
}
