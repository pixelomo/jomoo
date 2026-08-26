'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import { Step2Schema, type Step2Data } from '@/types/registration'
import { MAX_SERIAL_LENGTH, maskSerialInput } from '@/lib/serialValidation'
import FormField, { inputClass } from '@/components/ui/FormField'

interface Props {
  defaultValues?: Partial<Step2Data>
  onSubmit: (data: Step2Data) => void
  onBack: () => void
}

type ValidationState = 'idle' | 'validating' | 'valid' | 'invalid' | 'duplicate' | 'blocked' | 'rateLimited'

export default function Step2SerialNumber({ defaultValues, onSubmit, onBack }: Props) {
  const series = defaultValues?.modelSeries
  const t = useTranslations('registration.step2')
  const tc = useTranslations('common')
  const tv = useTranslations('validation')

  /** Schema messages are catalogue keys like 'validation.serialFormat'. */
  const fieldError = (message?: string) =>
    message ? tv(message.replace(/^validation\./, '')) : undefined

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
        body: JSON.stringify({ serialNumber, modelSeries: series }),
      })
      // Without this a 429 reads as {} and the member is told their serial is
      // not registered, which is both wrong and the one message they cannot act on.
      if (res.status === 429) {
        setValidationState('rateLimited')
        return
      }
      const data: { valid: boolean; reason?: string } = await res.json()

      if (data.valid) {
        setValidationState('valid')
        setValue('serialNumberValid', true)
      } else {
        setValidationState(
          data.reason === 'already_registered'
            ? 'duplicate'
            : data.reason === 'revoked' || data.reason === 'abnormal'
              ? 'blocked'
              : 'invalid'
        )
        setValue('serialNumberValid', false)
      }
    } catch {
      setValidationState('invalid')
      setValue('serialNumberValid', false)
    }
  }

  // 'invalid' means the imported library does not have this number. Those may
  // still be submitted — they are flagged for staff instead, because a serial
  // can be genuine and simply belong to a batch nobody has imported yet.
  // A duplicate is a hard stop: that product already has a registration.
  const canProceed = validationState === 'valid' || validationState === 'invalid'

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <FormField
        label={t('serialNumber')}
        required
        hint={t('serialNumberHint')}
        error={fieldError(errors.serialNumber?.message)}
        htmlFor="serialNumber"
      >
        <div className="flex gap-2">
          <input
            id="serialNumber"
            type="text"
            className={inputClass}
            placeholder={t('serialNumberPlaceholder')}
            autoComplete="off"
            spellCheck={false}
            maxLength={MAX_SERIAL_LENGTH}
            {...register('serialNumber', {
              onChange: (e) => {
                const masked = maskSerialInput(e.target.value)
                if (masked !== e.target.value) setValue('serialNumber', masked)
                setValidationState('idle')
              },
            })}
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

      {validationState === 'duplicate' && (
        <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {t('duplicate')}
        </div>
      )}

      {/* Too many checks in a minute. Amber, not red: nothing is wrong with the
          number and waiting is all that is being asked. */}
      {validationState === 'rateLimited' && (
        <div className="rounded-md bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
          {t('rateLimited')}
        </div>
      )}

      {/* Withdrawn or flagged in the serial library. Not something the member
          can fix by retyping, so it sends them to the service line. */}
      {validationState === 'blocked' && (
        <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {t('blocked')}
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
