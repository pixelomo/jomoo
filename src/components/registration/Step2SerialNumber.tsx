'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import { Step2Schema, type Step2Data } from '@/types/registration'
import FormField, { inputClass } from '@/components/ui/FormField'

interface Props {
  defaultValues?: Partial<Step2Data>
  onSubmit: (data: Step2Data) => void
  onBack: () => void
}

type ValidationState = 'idle' | 'validating' | 'valid' | 'invalid'

export default function Step2SerialNumber({ defaultValues, onSubmit, onBack }: Props) {
  const t = useTranslations('registration.step2')
  const tc = useTranslations('common')

  const [validationState, setValidationState] = useState<ValidationState>('idle')

  const {
    register,
    handleSubmit,
    getValues,
    setValue,
    formState: { errors },
  } = useForm<Step2Data>({
    resolver: zodResolver(Step2Schema),
    defaultValues,
  })

  const handleValidate = async () => {
    const serialNumber = getValues('serialNumber')
    if (!serialNumber.trim()) return

    setValidationState('validating')

    try {
      const res = await fetch('/api/serial-validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serialNumber }),
      })
      const data: { valid: boolean } = await res.json()

      if (data.valid) {
        setValidationState('valid')
        setValue('serialNumberValid', true)
      } else {
        setValidationState('invalid')
        setValue('serialNumberValid', false)
      }
    } catch {
      setValidationState('invalid')
      setValue('serialNumberValid', false)
    }
  }

  // Users may proceed whether valid or invalid; invalid submissions are
  // flagged as "Abnormal Serial Number" for reviewer attention.
  const canProceed = validationState === 'valid' || validationState === 'invalid'

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <FormField
        label={t('serialNumber')}
        required
        hint={t('serialNumberHint')}
        error={errors.serialNumber?.message ? tc('required') : undefined}
        htmlFor="serialNumber"
      >
        <div className="flex gap-2">
          <input
            id="serialNumber"
            type="text"
            className={inputClass}
            placeholder={t('serialNumberPlaceholder')}
            {...register('serialNumber')}
          />
          <button
            type="button"
            onClick={handleValidate}
            disabled={validationState === 'validating'}
            className="shrink-0 rounded-md border border-zinc-200 px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50 transition-colors whitespace-nowrap"
          >
            {validationState === 'validating' ? t('validating') : t('validate')}
          </button>
        </div>
      </FormField>

      {validationState === 'valid' && (
        <div className="flex items-center gap-2 rounded-md bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          {t('valid')}
        </div>
      )}

      {validationState === 'invalid' && (
        <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {t('invalid')}
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 rounded-lg border border-zinc-200 px-4 py-2.5 text-sm font-medium hover:bg-zinc-50 transition-colors"
        >
          {tc('back')}
        </button>
        <button
          type="submit"
          disabled={!canProceed}
          className="flex-1 rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {tc('next')}
        </button>
      </div>
    </form>
  )
}
