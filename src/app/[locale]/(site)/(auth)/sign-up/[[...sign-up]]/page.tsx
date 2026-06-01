'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { authClient } from '@/lib/auth-client'

export default function SignUpPage() {
  const t = useTranslations('auth')
  const tc = useTranslations('common')
  const router = useRouter()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirm) { setError(t('passwordMismatch')); return }
    if (password.length < 8) { setError(t('passwordTooShort')); return }

    setLoading(true)
    setError(null)

    const { error: err } = await authClient.signUp.email({ name, email, password })

    if (!err) {
      router.push('/dashboard')
      router.refresh()
      return
    }

    if (err.code === 'USER_ALREADY_EXISTS') {
      setError(t('emailTaken'))
    } else {
      setError(tc('error'))
    }
    setLoading(false)
  }

  const inputClass = 'w-full rounded-lg border border-zinc-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 transition'

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-24">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-zinc-900">{t('signUpTitle')}</h1>
          <p className="text-sm text-zinc-500 mt-1">{t('signUpDescription')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1.5">{t('displayName')}</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} required autoFocus className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1.5">{t('email')}</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1.5">{t('password')}</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={8} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1.5">{t('confirmPassword')}</label>
            <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required className={inputClass} />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button type="submit" disabled={loading} className="w-full rounded-lg bg-zinc-900 px-4 py-3 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 transition-colors">
            {loading ? tc('loading') : t('signUpBtn')}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-500">
          {t('hasAccount')}{' '}
          <Link href="/sign-in" className="font-medium text-zinc-900 underline underline-offset-2 hover:text-zinc-700">
            {t('signInLink')}
          </Link>
        </p>
      </div>
    </main>
  )
}
