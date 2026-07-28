'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { authClient } from '@/lib/auth-client'
import MembershipStepIndicator from './MembershipStepIndicator'
import SignUpStep1 from './SignUpStep1'
import SignUpStep2 from './SignUpStep2'
import SignUpStep3 from './SignUpStep3'
import {
  buildDisplayName,
  type CorporateSignupData,
  type IndividualSignupData,
  type MembershipType,
} from '@/types/membership-signup'

type FormData = Partial<CorporateSignupData & IndividualSignupData>

export default function SignUpForm() {
  const t = useTranslations('auth')
  const tm = useTranslations('auth.membership')

  const [step, setStep] = useState(1)
  const [verificationSent, setVerificationSent] = useState(false)
  const [membershipType, setMembershipType] = useState<MembershipType | undefined>()
  const [formData, setFormData] = useState<FormData>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const stepLabels = [tm('steps.type'), tm('steps.info'), tm('steps.complete')]

  const handleTypeSelect = (type: MembershipType) => {
    setMembershipType(type)
    setError(null)
    setStep(2)
  }

  const handleStep2 = (data: CorporateSignupData | IndividualSignupData) => {
    setFormData(data)
    setError(null)
    setStep(3)
  }

  const handleComplete = async () => {
    if (!membershipType || !formData.email || !formData.password) return

    setIsSubmitting(true)
    setError(null)

    const name = buildDisplayName(
      membershipType,
      formData as CorporateSignupData | IndividualSignupData
    )

    const payload: {
      name: string
      email: string
      password: string
      gender?: string
      dateOfBirth?: string
    } = {
      name,
      email: formData.email,
      password: formData.password,
    }

    if (membershipType === 'individual') {
      const individual = formData as IndividualSignupData
      if (individual.gender) payload.gender = individual.gender
      if (individual.dateOfBirth) payload.dateOfBirth = individual.dateOfBirth
    }

    try {
      const { error: err } = await authClient.signUp.email(payload)

      if (!err) {
        // requireEmailVerification is on, so no session exists yet — the member
        // has to click the link in the verification email before signing in.
        setVerificationSent(true)
        setIsSubmitting(false)
        return
      }

      // better-auth reports a duplicate address under a few different shapes
      // depending on where it is caught, so match on the message too rather
      // than falling through to the generic failure text.
      const alreadyExists =
        err.code === 'USER_ALREADY_EXISTS' ||
        err.status === 422 ||
        /already exists|already registered/i.test(err.message ?? '')

      setError(alreadyExists ? t('emailTaken') : t('signUpFailed'))
      console.error('[sign-up] failed', { code: err.code, status: err.status, message: err.message })
    } catch {
      setError(t('signUpFailed'))
    }

    setIsSubmitting(false)
  }

  return (
    <div className="w-full max-w-2xl">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-zinc-900">{tm('title')}</h1>
      </div>

      <MembershipStepIndicator currentStep={step} labels={stepLabels} />

      {error && step !== 3 && (
        <div className="mb-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {verificationSent ? (
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
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-zinc-900">確認メールを送信しました</h2>
          <p className="mt-2 text-sm text-zinc-600">
            <span className="font-medium text-zinc-900">{formData.email}</span>{' '}
            宛にメールをお送りしました。
            <br />
            メール内のボタンからメールアドレスをご確認ください。
          </p>
          <p className="mt-4 text-xs text-zinc-500">
            メールが届かない場合は、迷惑メールフォルダをご確認ください。
          </p>
        </div>
      ) : (
        <>
      {step === 1 && <SignUpStep1 value={membershipType} onSelect={handleTypeSelect} />}

      {step === 2 && membershipType && (
        <SignUpStep2
          membershipType={membershipType}
          defaultValues={formData}
          onSubmit={handleStep2}
          onBack={() => setStep(1)}
        />
      )}

      {step === 3 && membershipType && formData.email && (
        <SignUpStep3
          membershipType={membershipType}
          formData={formData}
          onEdit={() => {
            setError(null)
            setStep(2)
          }}
          onContinue={handleComplete}
          isSubmitting={isSubmitting}
          error={error}
        />
      )}

      {step < 3 && (
        <p className="mt-8 text-center text-sm text-zinc-500">
          {t('hasAccount')}{' '}
          <Link
            href="/sign-in"
            className="font-medium text-zinc-900 underline underline-offset-2 hover:text-zinc-700"
          >
            {t('signInLink')}
          </Link>
        </p>
      )}
        </>
      )}
    </div>
  )
}
