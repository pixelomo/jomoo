'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'

export default function VerifyPage() {
  const t = useTranslations('verify')

  const [serialNumber, setSerialNumber] = useState('')
  const [checking, setChecking] = useState(false)
  const [result, setResult] = useState<{ valid: boolean } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    const sn = serialNumber.trim()
    if (!sn) return

    setChecking(true)
    setResult(null)
    setError(null)

    try {
      const res = await fetch(`/api/serial-validate?sn=${encodeURIComponent(sn)}`)
      if (!res.ok) throw new Error('Request failed')
      const data: { valid: boolean } = await res.json()
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
            onChange={(e) => { setSerialNumber(e.target.value); setResult(null) }}
            placeholder={t('inputPlaceholder')}
            className="w-full rounded-lg border border-zinc-200 px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-zinc-900 transition"
            autoComplete="off"
            spellCheck={false}
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

      {error && (
        <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-5 py-4">
          <p className="text-sm text-red-700">出错了，请重试。</p>
        </div>
      )}

      {result !== null && (
        <div
          className={[
            'mt-6 rounded-lg border px-5 py-5 flex items-start gap-4',
            result.valid
              ? 'border-green-200 bg-green-50'
              : 'border-red-200 bg-red-50',
          ].join(' ')}
        >
          <div
            className={[
              'mt-0.5 shrink-0 flex h-8 w-8 items-center justify-center rounded-full',
              result.valid ? 'bg-green-100' : 'bg-red-100',
            ].join(' ')}
          >
            {result.valid ? (
              <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
          </div>
          <div>
            <p className={['font-semibold text-sm', result.valid ? 'text-green-800' : 'text-red-800'].join(' ')}>
              {result.valid ? t('validTitle') : t('invalidTitle')}
            </p>
            <p className={['mt-1 text-sm', result.valid ? 'text-green-700' : 'text-red-700'].join(' ')}>
              {result.valid ? t('validDesc') : t('invalidDesc')}
            </p>
          </div>
        </div>
      )}
    </main>
  )
}
