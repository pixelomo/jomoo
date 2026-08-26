'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { MAX_SERIAL_LENGTH, maskSerialInput } from '@/lib/serialValidation'

export default function VerifyPage() {
  const t = useTranslations('verify')
  const tc = useTranslations('common')

  const [serialNumber, setSerialNumber] = useState('')
  const [checking, setChecking] = useState(false)
  const [result, setResult] = useState<{ valid: boolean; reason?: string } | null>(null)
  const [error, setError] = useState<'error' | 'rateLimited' | null>(null)

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    const sn = serialNumber.trim()
    if (!sn) return

    setChecking(true)
    setResult(null)
    setError(null)

    try {
      const res = await fetch(`/api/serial-validate?sn=${encodeURIComponent(sn)}`)
      // 429 is the only failure worth its own wording — "try again later" is
      // something the visitor can act on, where a generic error is not.
      if (res.status === 429) {
        setError('rateLimited')
        return
      }
      if (!res.ok) throw new Error('Request failed')
      const data: { valid: boolean; reason?: string } = await res.json()
      setResult(data)
    } catch {
      setError('error')
    } finally {
      setChecking(false)
    }
  }

  return (
    <main className="flex-1 px-4 py-16 max-w-lg mx-auto w-full">
      <div className="mb-10">
        <h1 className="text-2xl font-bold text-zinc-900">{t('title')}</h1>
        <p className="text-zinc-500 mt-2">{t('subtitle')}</p>
      </div>

      <form onSubmit={handleVerify} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1.5" htmlFor="sn">
            {t('inputLabel')}
          </label>
          <input
            id="sn"
            type="text"
            value={serialNumber}
            onChange={(e) => { setSerialNumber(maskSerialInput(e.target.value)); setResult(null) }}
            placeholder={t('inputPlaceholder')}
            className="w-full rounded-lg border border-zinc-200 px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-zinc-900 transition"
            autoComplete="off"
            spellCheck={false}
            maxLength={MAX_SERIAL_LENGTH}
          />
          <p className="mt-1.5 text-xs text-zinc-400">{t('hint')}</p>
        </div>

        <button
          type="submit"
          disabled={checking || !serialNumber.trim()}
          className="w-full rounded-lg bg-zinc-900 px-4 py-3 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 transition-colors"
        >
          {checking ? t('checking') : t('button')}
        </button>
      </form>

      {error === 'rateLimited' && (
        <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 px-5 py-4">
          <p className="font-semibold text-sm text-amber-900">{t('rateLimitedTitle')}</p>
          <p className="mt-1 text-sm text-amber-800">{t('rateLimitedDesc')}</p>
        </div>
      )}

      {error === 'error' && (
        <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-5 py-4">
          <p className="text-sm text-red-700">{tc('error')}</p>
        </div>
      )}

      {result !== null && (() => {
        // 'verified' is the only answer that means the number was found in the
        // serial library. 'library_empty' means there is nothing to check it
        // against yet — saying "this is genuine" on that basis would not be true.
        const confirmed = result.valid && result.reason === 'verified'
        const formatOnly = result.valid && !confirmed
        const badFormat = !result.valid && result.reason === 'invalid_format'
        const tone = confirmed
          ? { border: 'border-green-200', bg: 'bg-green-50', dot: 'bg-green-100', icon: 'text-green-600', title: 'text-green-800', body: 'text-green-700' }
          : formatOnly
            ? { border: 'border-amber-200', bg: 'bg-amber-50', dot: 'bg-amber-100', icon: 'text-amber-600', title: 'text-amber-900', body: 'text-amber-800' }
            : { border: 'border-red-200', bg: 'bg-red-50', dot: 'bg-red-100', icon: 'text-red-600', title: 'text-red-800', body: 'text-red-700' }

        return (
          <div className={`mt-6 rounded-lg border px-5 py-5 flex items-start gap-4 ${tone.border} ${tone.bg}`}>
            <div className={`mt-0.5 shrink-0 flex h-8 w-8 items-center justify-center rounded-full ${tone.dot}`}>
              <svg className={`w-4 h-4 ${tone.icon}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
                {confirmed ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                ) : formatOnly ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                )}
              </svg>
            </div>
            <div>
              <p className={`font-semibold text-sm ${tone.title}`}>
                {confirmed
                  ? t('validTitle')
                  : formatOnly
                    ? t('formatOnlyTitle')
                    : badFormat
                      ? t('formatErrorTitle')
                      : t('invalidTitle')}
              </p>
              <p className={`mt-1 text-sm ${tone.body}`}>
                {confirmed
                  ? t('validDesc')
                  : formatOnly
                    ? t('formatOnlyDesc')
                    : badFormat
                      ? t('formatErrorDesc')
                      : t('invalidDesc')}
              </p>
            </div>
          </div>
        )
      })()}

    </main>
  )
}
