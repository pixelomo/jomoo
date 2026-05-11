'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import StepIndicator from '@/components/ui/StepIndicator'
import Step1BasicInfo from './Step1BasicInfo'
import Step2SerialNumber from './Step2SerialNumber'
import Step3Attachments from './Step3Attachments'
import type { Step1Data, Step2Data, Step3Data } from '@/types/registration'

interface Props {
  models: { _id: string; name: string; modelCode: string }[]
}

type FormState = Partial<Step1Data & Step2Data & Step3Data>

export default function RegistrationForm({ models }: Props) {
  const t = useTranslations('registration')
  const router = useRouter()

  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState<FormState>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string>()
  const [done, setDone] = useState(false)

  const stepLabels = [t('steps.1'), t('steps.2'), t('steps.3')]

  const handleStep1 = (data: Step1Data) => {
    setFormData((prev) => ({ ...prev, ...data }))
    setStep(2)
  }

  const handleStep2 = (data: Step2Data) => {
    setFormData((prev) => ({ ...prev, ...data }))
    setStep(3)
  }

  const handleStep3 = async (data: Step3Data) => {
    const payload = { ...formData, ...data }
    setIsSubmitting(true)
    setSubmitError(undefined)

    try {
      const res = await fetch('/api/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const error: { error?: string } = await res.json()
        throw new Error(error.error ?? 'Submission failed')
      }

      setDone(true)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (done) {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 px-6 py-10 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
          <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-green-800 mb-2">{t('success.title')}</h2>
        <p className="text-sm text-green-700 mb-6">{t('success.message')}</p>
        <button
          onClick={() => router.push('/dashboard')}
          className="inline-flex items-center rounded-lg bg-green-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-green-800 transition-colors"
        >
          {t('success.backToDashboard')}
        </button>
      </div>
    )
  }

  return (
    <div>
      <StepIndicator currentStep={step} totalSteps={3} labels={stepLabels} />

      {submitError && (
        <div className="mb-4 rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {submitError}
        </div>
      )}

      {step === 1 && (
        <Step1BasicInfo
          defaultValues={formData}
          models={models}
          onSubmit={handleStep1}
        />
      )}

      {step === 2 && (
        <Step2SerialNumber
          defaultValues={formData}
          onSubmit={handleStep2}
          onBack={() => setStep(1)}
        />
      )}

      {step === 3 && (
        <Step3Attachments
          defaultValues={formData}
          onSubmit={handleStep3}
          onBack={() => setStep(2)}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  )
}
