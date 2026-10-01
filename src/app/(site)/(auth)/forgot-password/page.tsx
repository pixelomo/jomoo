'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { authClient } from '@/lib/auth-client'
import AccountField from '@/components/ui/AccountField'
import '@/components/dashboard/member-portal.css'

/**
 * パスワードの再設定 — asks for the address and has Better Auth mail a link to
 * /reset-password. The answer is the same whether or not the address has an
 * account, so the form cannot be used to find out who is a member.
 */
export default function ForgotPasswordPage() {
  const t = useTranslations('auth')
  const tc = useTranslations('common')

  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error: err } = await authClient.requestPasswordReset({
      email,
      redirectTo: '/reset-password',
    })

    setLoading(false)
    if (err) {
      setError(t('forgotFailed'))
      return
    }
    setSent(true)
  }

  return (
    <main className="member account-page account-page--narrow">
      <form className="account-form account-form--stacked" onSubmit={handleSubmit}>
        <h1 className="account-form__title">{t('forgotTitle')}</h1>
        <p className="account-form__intro">{t('forgotDescription')}</p>

        {error && <p className="account-alert" role="alert">{error}</p>}

        {sent ? (
          <p className="account-alert account-alert--done" role="status">
            {t('forgotSent')}
          </p>
        ) : (
          <>
            <section className="account-form__section">
              <AccountField label={t('email')} required htmlFor="forgot-email">
                <input
                  id="forgot-email"
                  className="account-input"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                />
              </AccountField>
            </section>

            <div className="account-form__actions">
              <button type="submit" className="member-btn" disabled={loading}>
                {loading ? tc('loading') : t('forgotSubmit')}
              </button>
            </div>
          </>
        )}
      </form>

      <p className="account-page__aside">
        <Link href="/sign-in">{t('backToSignIn')}</Link>
      </p>
    </main>
  )
}
