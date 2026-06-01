'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { authClient } from '@/lib/auth-client'

type Step = 'credentials' | 'totp'

export default function SignInPage() {
  const t = useTranslations('auth')
  const tc = useTranslations('common')
  const router = useRouter()

  const [step, setStep] = useState<Step>('credentials')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [totp, setTotp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCredentials = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error: err } = await authClient.signIn.email({ email, password })

    if (!err) {
      router.push('/dashboard')
      router.refresh()
      return
    }

    if (err.code === 'TWO_FACTOR_REQUIRED') {
      setStep('totp')
      setLoading(false)
      return
    }

    setError(t('invalidCredentials'))
    setLoading(false)
  }

  const handleTotp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error: err } = await authClient.twoFactor.verifyTotp({ code: totp })

    if (!err) {
      router.push('/dashboard')
      router.refresh()
      return
    }

    setError(t('invalidTotp'))
    setLoading(false)
  }

  const inputClass = 'w-full rounded-lg border border-zinc-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 transition'

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-24">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-zinc-900">{t('signInTitle')}</h1>
          <p className="text-sm text-zinc-500 mt-1">{t('signInDescription')}</p>
        </div>

        {step === 'credentials' ? (
          <form onSubmit={handleCredentials} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1.5">{t('email')}</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required autoFocus className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1.5">{t('password')}</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className={inputClass} />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button type="submit" disabled={loading} className="w-full rounded-lg bg-zinc-900 px-4 py-3 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 transition-colors">
              {loading ? tc('loading') : t('signInBtn')}
            </button>
          </form>
        ) : (
          <form onSubmit={handleTotp} className="space-y-4">
            <p className="text-sm text-zinc-600 text-center">{t('totpPrompt')}</p>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1.5">{t('totpLabel')}</label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={totp}
                onChange={e => setTotp(e.target.value.replace(/\D/g, ''))}
                required
                autoFocus
                className={`${inputClass} text-center font-mono tracking-[0.3em] text-lg`}
                placeholder="000000"
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button type="submit" disabled={loading || totp.length < 6} className="w-full rounded-lg bg-zinc-900 px-4 py-3 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 transition-colors">
              {loading ? tc('loading') : t('verifyBtn')}
            </button>
            <button type="button" onClick={() => { setStep('credentials'); setTotp(''); setError(null) }} className="w-full text-sm text-zinc-500 hover:text-zinc-700">
              ← {tc('back')}
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-zinc-500">
          {t('noAccount')}{' '}
          <Link href="/sign-up" className="font-medium text-zinc-900 underline underline-offset-2 hover:text-zinc-700">
            {t('signUpLink')}
          </Link>
        </p>
      </div>
    </main>
  )
}
