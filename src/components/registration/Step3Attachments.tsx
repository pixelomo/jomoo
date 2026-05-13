'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import { Step3Schema, type Step3Data } from '@/types/registration'
import FormField from '@/components/ui/FormField'

interface Props {
  defaultValues?: Partial<Step3Data>
  onSubmit: (data: Step3Data) => void
  onBack: () => void
  isSubmitting: boolean
}

type UploadState = 'idle' | 'uploading' | 'done' | 'error'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/heic', 'image/heif']

async function uploadToCloudinary(
  file: File,
  folder: 'warranty-cards' | 'serial-numbers'
): Promise<string> {
  // Get signed upload params from our API
  const sigRes = await fetch('/api/upload-signature', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ folder }),
  })
  if (!sigRes.ok) throw new Error('Failed to get upload signature')

  const { timestamp, signature, apiKey, cloudName, folder: uploadFolder } = await sigRes.json()

  const formData = new FormData()
  formData.append('file', file)
  formData.append('api_key', apiKey)
  formData.append('timestamp', String(timestamp))
  formData.append('signature', signature)
  formData.append('folder', uploadFolder)

  const uploadRes = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: 'POST', body: formData }
  )
  if (!uploadRes.ok) {
    const errorBody = await uploadRes.text().catch(() => '(unreadable)')
    console.error('[Cloudinary] upload failed', uploadRes.status, errorBody)
    throw new Error('Cloudinary upload failed')
  }

  const result = await uploadRes.json()
  return result.secure_url as string
}

function FileUploadField({
  label,
  hint,
  folder,
  onUploaded,
  error,
}: {
  label: string
  hint: string
  folder: 'warranty-cards' | 'serial-numbers'
  onUploaded: (url: string) => void
  error?: string
}) {
  const t = useTranslations('registration.step3')
  const tv = useTranslations('validation')
  const [state, setState] = useState<UploadState>('idle')
  const [preview, setPreview] = useState<string>()
  const [fileError, setFileError] = useState<string>()

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setFileError(undefined)

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setFileError(tv('invalidFileType'))
      return
    }
    if (file.size > MAX_FILE_SIZE) {
      setFileError(tv('fileTooLarge'))
      return
    }

    setPreview(URL.createObjectURL(file))
    setState('uploading')

    try {
      const url = await uploadToCloudinary(file, folder)
      onUploaded(url)
      setState('done')
    } catch {
      setState('error')
    }
  }

  return (
    <FormField label={label} required hint={hint} error={error ?? fileError}>
      <label
        className={[
          'flex flex-col items-center justify-center w-full rounded-lg border-2 border-dashed cursor-pointer transition-colors px-4 py-8',
          state === 'done'
            ? 'border-green-300 bg-green-50'
            : state === 'error'
              ? 'border-red-300 bg-red-50'
              : 'border-zinc-200 hover:border-zinc-300 bg-zinc-50',
        ].join(' ')}
      >
        {preview && state !== 'error' ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="preview" className="max-h-40 object-contain rounded" />
        ) : (
          <div className="text-center">
            <svg className="mx-auto mb-2 w-8 h-8 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-sm text-zinc-500">{t('clickToUpload')}</p>
            <p className="text-xs text-zinc-400 mt-1">{t('fileTypes')}</p>
          </div>
        )}

        {state === 'uploading' && (
          <p className="mt-2 text-sm text-zinc-500">{t('uploading')}</p>
        )}
        {state === 'done' && (
          <p className="mt-2 text-sm text-green-600">{t('uploadSuccess')}</p>
        )}
        {state === 'error' && (
          <p className="mt-2 text-sm text-red-600">{t('uploadError')}</p>
        )}

        <input
          type="file"
          accept="image/jpeg,image/png,image/heic,image/heif"
          className="sr-only"
          onChange={handleChange}
        />
      </label>
    </FormField>
  )
}

export default function Step3Attachments({ defaultValues, onSubmit, onBack, isSubmitting }: Props) {
  const tc = useTranslations('common')
  const t = useTranslations('registration.step3')

  const {
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<Step3Data>({
    resolver: zodResolver(Step3Schema),
    defaultValues,
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <FileUploadField
        label={t('warrantyCard')}
        hint={t('warrantyCardHint')}
        folder="warranty-cards"
        onUploaded={(url) => setValue('warrantyCardUrl', url, { shouldValidate: true })}
        error={errors.warrantyCardUrl?.message ? tc('required') : undefined}
      />

      <FileUploadField
        label={t('serialNumberImage')}
        hint={t('serialNumberImageHint')}
        folder="serial-numbers"
        onUploaded={(url) => setValue('serialNumberImageUrl', url, { shouldValidate: true })}
        error={errors.serialNumberImageUrl?.message ? tc('required') : undefined}
      />

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onBack}
          disabled={isSubmitting}
          className="flex-1 rounded-lg border border-zinc-200 px-4 py-2.5 text-sm font-medium hover:bg-zinc-50 disabled:opacity-50 transition-colors"
        >
          {tc('back')}
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 transition-colors"
        >
          {isSubmitting ? tc('loading') : tc('submit')}
        </button>
      </div>
    </form>
  )
}
