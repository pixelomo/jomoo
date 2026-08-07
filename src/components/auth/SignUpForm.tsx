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
  buildDateOfBirth,
  buildDisplayName,
  type MembershipType,
  type SignupData,
} from '@/types/membership-signup'
import '@/components/dashboard/member-portal.css'

/** A field left blank is omitted from the payload rather than sent as an empty
 *  string, so the column keeps its NULL rather than storing "". */
function optional(value: string | undefined) {
  return value && value.trim() !== '' ? value.trim() : undefined
}

export default function SignUpForm() {
  const t = useTranslations('auth')
  const tm = useTranslations('auth.membership')

  const [step, setStep] = useState(1)
  const [membershipType, setMembershipType] = useState<MembershipType | undefined>()
  const [formData, setFormData] = useState<SignupData>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const stepLabels = [tm('steps.type'), tm('steps.info'), tm('steps.complete')]

  const handleTypeSubmit = (type: MembershipType) => {
    setMembershipType(type)
    setError(null)
    setStep(2)
  }

  /** Step 2's 次へ is the point of no return: it creates the account and moves
   *  to 登録完了. There is no review screen between the two. */
  const handleRegister = async (data: SignupData) => {
    if (!membershipType || !data.email || !data.password) return

    setFormData(data)
    setIsSubmitting(true)
    setError(null)

    try {
      const { error: err } = await authClient.signUp.email({
        name: buildDisplayName(membershipType, data),
        email: data.email,
        password: data.password,
        gender: optional(data.gender),
        dateOfBirth: buildDateOfBirth(data),
        phoneNumber: optional(
          data.phoneNumber ? `${data.countryCode ?? ''}${data.phoneNumber}` : undefined
        ),
        companyName: optional(data.companyName),
        companyNameKana: optional(data.companyNameKana),
        lastName: optional(data.lastName),
        firstName: optional(data.firstName),
        lastNameKana: optional(data.lastNameKana),
        firstNameKana: optional(data.firstNameKana),
        postalCode: optional(data.postalCode),
        prefecture: optional(data.prefecture),
        city: optional(data.city),
        streetAddress: optional(data.streetAddress),
        building: optional(data.building),
      })

      if (err) {
        // Match the duplicate on its code or its wording only. 422 is what
        // better-auth answers for *any* creation failure — FAILED_TO_CREATE_USER
        // included — so treating the status alone as a duplicate told members
        // their address was taken when the real fault was at our end.
        const alreadyExists =
          err.code === 'USER_ALREADY_EXISTS' ||
          /already exists|already registered/i.test(err.message ?? '')

        setError(alreadyExists ? t('emailTaken') : t('signUpFailed'))
        console.error('[sign-up] failed', {
          code: err.code,
          status: err.status,
          message: err.message,
        })
        setIsSubmitting(false)
        return
      }

      // No verification mail is sent from here. Sign-up is deliberately the
      // shortest path the client could have — when EMAIL_VERIFICATION_REQUIRED
      // is off, better-auth signs the member straight in, and when it is on the
      // sign-in page is what tells them to confirm and offers the resend.
      setStep(3)
    } catch {
      setError(t('signUpFailed'))
    }

    setIsSubmitting(false)
  }

  const isComplete = step === 3

  return (
    <div className="signup">
      <header className="signup__header">
        <h1 className="signup__title">{tm('title')}</h1>
        <p className="signup__subtitle">{tm('subtitle')}</p>
      </header>

      <MembershipStepIndicator
        currentStep={step}
        labels={stepLabels}
        activeStatus={tm('stepStatusActive')}
        completeStatus={tm('stepStatusComplete')}
      />

      {isComplete ? (
        <SignUpStep3 />
      ) : (
        <>
          <div className="signup__card">
            {step === 1 && <SignUpStep1 value={membershipType} onSubmit={handleTypeSubmit} />}

            {step === 2 && membershipType && (
              <SignUpStep2
                membershipType={membershipType}
                defaultValues={formData}
                onSubmit={handleRegister}
                onBack={() => {
                  setError(null)
                  setStep(1)
                }}
                isSubmitting={isSubmitting}
                submitError={error}
              />
            )}
          </div>

          <p className="signup__signin">
            {t('hasAccount')} <Link href="/sign-in">{t('signInLink')}</Link>
          </p>
        </>
      )}
    </div>
  )
}
