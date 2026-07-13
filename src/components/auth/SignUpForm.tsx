'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
  const router = useRouter()

  const [step, setStep] = useState(1)
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
        router.push('/dashboard')
        router.refresh()
        return
      }

      if (err.code === 'USER_ALREADY_EXISTS') {
        setError(t('emailTaken'))
      } else {
        setError(t('signUpFailed'))
      }
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
    </div>
  )
}
