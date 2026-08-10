'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
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
// Wears the member portal's form styling, so signing up and editing your
// details look like the same product.
import '@/components/dashboard/member-portal.css'

type FormData = Partial<CorporateSignupData & IndividualSignupData>

export default function SignUpForm() {
  const t = useTranslations('auth')
  const tm = useTranslations('auth.membership')
  const router = useRouter()

  const [step, setStep] = useState(1)
  const [verificationSent, setVerificationSent] = useState(false)
  // The account exists but the verification mail could not be delivered — the
  // member must not be told to go looking for it.
  const [sendFailed, setSendFailed] = useState(false)
  const [isResending, setIsResending] = useState(false)
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

  /** Resolves false when the mail did not leave, so we can say so. */
  const sendVerification = async (email: string) => {
    try {
      const res = await fetch('/api/verification/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, callbackURL: '/dashboard' }),
      })
      return res.ok
    } catch {
      return false
    }
  }

  const handleRetrySend = async () => {
    if (!formData.email) return
    setIsResending(true)
    setSendFailed(!(await sendVerification(formData.email)))
    setIsResending(false)
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
      const { data, error: err } = await authClient.signUp.email(payload)

      if (!err) {
        // A token means better-auth signed them in, which it only does when
        // verification is not required — straight to the dashboard. Otherwise
        // token is null and they must confirm the address first.
        if (data?.token) {
          router.push('/dashboard')
          router.refresh()
          return
        }

        // The account is created either way; only the mail can still fail.
        const delivered = await sendVerification(formData.email)
        setVerificationSent(true)
        setSendFailed(!delivered)
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
    <div className="member account-page">
      <div className="account-form">
        <h1 className="account-form__title">{tm('title')}</h1>

        <MembershipStepIndicator currentStep={step} labels={stepLabels} />

        {error && step !== 3 && (
          <p className="account-alert" role="alert">
            {error}
          </p>
        )}

        {verificationSent && sendFailed ? (
          <div className="account-outcome">
            <h2 className="account-outcome__title">{t('verificationSendFailedTitle')}</h2>
            <p className="account-outcome__body">
              {t('verificationSendFailedBody', { email: formData.email ?? '' })}
            </p>
            <div className="account-form__actions">
              <button
                type="button"
                onClick={handleRetrySend}
                disabled={isResending}
                className="member-btn"
              >
                {isResending ? t('verificationSending') : t('resendVerification')}
              </button>
            </div>
          </div>
        ) : verificationSent ? (
          <div className="account-outcome">
            <h2 className="account-outcome__title">確認メールを送信しました</h2>
            <p className="account-outcome__body">
              <strong>{formData.email}</strong> 宛にメールをお送りしました。
              <br />
              メール内のボタンからメールアドレスをご確認ください。
            </p>
            <p className="account-outcome__note">
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
          </>
        )}
      </div>

      {step < 3 && !verificationSent && (
        <p className="account-page__aside">
          {t('hasAccount')} <Link href="/sign-in">{t('signInLink')}</Link>
        </p>
      )}
    </div>
  )
}
