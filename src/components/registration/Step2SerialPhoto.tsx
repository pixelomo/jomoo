'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { Step2Schema, type Step2Data } from '@/types/registration'
import { MAX_SERIAL_LENGTH, maskSerialInput } from '@/lib/serialValidation'
import FormField, { inputClass } from '@/components/ui/FormField'
import type { SerialCandidate } from '@/lib/serialOcr'

interface Props {
  defaultValues?: Partial<Step2Data>
  onSubmit: (data: Step2Data & { serialNumberImageUrl?: string }) => void
  onBack: () => void
}

type Phase = 'capture' | 'reading' | 'confirm'
type ValidationState = 'idle' | 'validating' | 'valid' | 'invalid' | 'duplicate' | 'blocked'

const MAX_FILE_SIZE = 10 * 1024 * 1024

interface Upload {
  url: string
  publicId: string
}

async function uploadSerialPhoto(file: File): Promise<Upload> {
  const sigRes = await fetch('/api/upload-signature', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ folder: 'serial-numbers' }),
  })
  if (!sigRes.ok) throw new Error('signature')

  const { timestamp, signature, apiKey, cloudName, folder } = await sigRes.json()

  const form = new FormData()
  form.append('file', file)
  form.append('api_key', apiKey)
  form.append('timestamp', String(timestamp))
  form.append('signature', signature)
  form.append('folder', folder)

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: form,
  })
  if (!res.ok) throw new Error('upload')

  const result = await res.json()
  return { url: result.secure_url as string, publicId: result.public_id as string }
}

/**
 * Photograph-first serial entry, offered at /register?auto=true.
 *
 * The photograph is taken before anything is typed, read by OCR, and the number
 * it produces is put in front of the member to check. Deliberately never
 * automatic: the field stays editable, and the same 照合 call as the typed flow
 * decides whether the serial is real. OCR is a way to save typing twenty digits
 * off a label on a bathroom floor, not a source of truth.
 */
export default function Step2SerialPhoto({ defaultValues, onSubmit, onBack }: Props) {
  const series = defaultValues?.modelSeries
  const t = useTranslations('registration.step2')
  const ta = useTranslations('registration.auto')
  const tc = useTranslations('common')
  const fileInput = useRef<HTMLInputElement>(null)

  const [phase, setPhase] = useState<Phase>('capture')
  const [upload, setUpload] = useState<Upload | null>(null)
  const [candidates, setCandidates] = useState<SerialCandidate[]>([])
  const [serial, setSerial] = useState(defaultValues?.serialNumber ?? '')
  const [notice, setNotice] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [validationState, setValidationState] = useState<ValidationState>('idle')

  async function handleFile(file: File) {
    setError(null)
    setNotice(null)

    if (file.size > MAX_FILE_SIZE) {
      setError(ta('tooLarge'))
      return
    }

    setPhase('reading')
    let uploaded: Upload
    try {
      uploaded = await uploadSerialPhoto(file)
      setUpload(uploaded)
    } catch {
      setError(ta('uploadFailed'))
      setPhase('capture')
      return
    }

    // The photo is saved either way — a failed read only costs the prefill.
    try {
      const res = await fetch('/api/serial-ocr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publicId: uploaded.publicId, modelSeries: series ?? null }),
      })
      const data: { status: string; candidates: SerialCandidate[] } = await res.json()

      setCandidates(data.candidates ?? [])
      if (data.candidates?.length) {
        setSerial(data.candidates[0].serialNumber)
        setNotice(data.candidates[0].confidence === 'known' ? ta('readClean') : ta('readCorrected'))
      } else {
        setNotice(data.status === 'unavailable' ? ta('readUnavailable') : ta('readNothing'))
      }
    } catch {
      setNotice(ta('readNothing'))
    }

    setValidationState('idle')
    setPhase('confirm')
  }

  const handleValidate = async () => {
    if (!serial.trim()) return
    setValidationState('validating')
    try {
      const res = await fetch('/api/serial-validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serialNumber: serial, modelSeries: series }),
      })
      const data: { valid: boolean; reason?: string } = await res.json()
      setValidationState(
        data.valid
          ? 'valid'
          : data.reason === 'already_registered'
            ? 'duplicate'
            : data.reason === 'revoked' || data.reason === 'abnormal'
              ? 'blocked'
              : 'invalid'
      )
    } catch {
      setValidationState('invalid')
    }
  }

  const canProceed = validationState === 'valid' || validationState === 'invalid'

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const parsed = Step2Schema.safeParse({
      serialNumber: serial,
      serialNumberValid: validationState === 'valid',
      modelSeries: series,
    })
    if (!parsed.success) {
      setError(t('invalid'))
      return
    }
    // Carries the photograph forward so step 3 does not ask for it twice.
    onSubmit({ ...parsed.data, serialNumberImageUrl: upload?.url })
  }

  if (phase !== 'confirm') {
    return (
      <div className="space-y-6">
        <div className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 px-6 py-10 text-center">
          <p className="text-sm font-medium text-zinc-900">{ta('capturePrompt')}</p>
          <p className="mt-1.5 text-xs text-zinc-500">{ta('captureHint')}</p>

          <input
            ref={fileInput}
            type="file"
            accept="image/*"
            // Opens the camera directly on a phone, the file picker elsewhere.
            capture="environment"
            hidden
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) void handleFile(file)
              e.target.value = ''
            }}
          />

          <button
            type="button"
            onClick={() => fileInput.current?.click()}
            disabled={phase === 'reading'}
            className="mt-5 rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 transition-colors"
          >
            {phase === 'reading' ? ta('reading') : ta('takePhoto')}
          </button>
        </div>

        {error && (
          <p className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onBack}
            className="flex-1 rounded-lg border border-zinc-200 px-4 py-2.5 text-sm font-medium hover:bg-zinc-50 transition-colors"
          >
            {tc('back')}
          </button>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {upload && (
        <div className="relative h-44 w-full overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50">
          <Image src={upload.url} alt={t('serialNumber')} fill className="object-contain" sizes="640px" />
        </div>
      )}

      {notice && (
        <p className="rounded-md bg-[#73a4c7]/10 border border-[#73a4c7]/30 px-4 py-3 text-sm text-zinc-700">
          {notice}
        </p>
      )}

      <FormField
        label={t('serialNumber')}
        required
        hint={ta('checkHint')}
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
            value={serial}
            onChange={(e) => {
              setSerial(maskSerialInput(e.target.value))
              setValidationState('idle')
            }}
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

      {/* When the read was ambiguous, the other readings are one tap away
          rather than something to retype. */}
      {candidates.length > 1 && (
        <div className="space-y-2">
          <p className="text-xs text-zinc-500">{ta('otherReadings')}</p>
          <div className="flex flex-wrap gap-2">
            {candidates.slice(1).map((c) => (
              <button
                key={c.serialNumber}
                type="button"
                onClick={() => {
                  setSerial(c.serialNumber)
                  setValidationState('idle')
                }}
                className="rounded-full border border-zinc-200 px-3 py-1 font-mono text-xs text-zinc-700 hover:bg-zinc-50"
              >
                {c.serialNumber}
              </button>
            ))}
          </div>
        </div>
      )}

      {validationState === 'valid' && (
        <p className="rounded-md bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
          {t('valid')}
        </p>
      )}
      {validationState === 'invalid' && (
        <p className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {t('invalid')}
        </p>
      )}
      {validationState === 'duplicate' && (
        <p className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {t('duplicate')}
        </p>
      )}
      {validationState === 'blocked' && (
        <p className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {t('blocked')}
        </p>
      )}
      {error && (
        <p className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="flex flex-wrap gap-3 pt-2">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 rounded-lg border border-zinc-200 px-4 py-2.5 text-sm font-medium hover:bg-zinc-50 transition-colors"
        >
          {tc('back')}
        </button>
        <button
          type="button"
          onClick={() => {
            setPhase('capture')
            setCandidates([])
            setNotice(null)
          }}
          className="flex-1 rounded-lg border border-zinc-200 px-4 py-2.5 text-sm font-medium hover:bg-zinc-50 transition-colors"
        >
          {ta('retake')}
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
