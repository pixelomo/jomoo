'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { authClient } from '@/lib/auth-client'
import AccountField from '@/components/ui/AccountField'
// Wears the member portal's form styling, so signing in and editing your
// details look like the same product.
import '@/components/dashboard/member-portal.css'

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
  const [needsVerification, setNeedsVerification] = useState(false)
  const [resendNotice, setResendNotice] = useState<string | null>(null)

  const handleCredentials = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setNeedsVerification(false)
    setResendNotice(null)

    const { data, error: err } = await authClient.signIn.email({ email, password })

    if (!err) {
      // twoFactorRedirect comes back as data (status 200), not as an error
      if ((data as { twoFactorRedirect?: boolean } | null)?.twoFactorRedirect) {
        setStep('totp')
        setLoading(false)
        return
      }
      router.push('/dashboard')
      router.refresh()
      return
    }

    if (err.code === 'TWO_FACTOR_REQUIRED') {
      setStep('totp')
      setLoading(false)
      return
    }

    // Distinct from a bad password — the account exists but is unconfirmed
    if (err.code === 'EMAIL_NOT_VERIFIED' || err.status === 403) {
      setNeedsVerification(true)
      setError(t('emailNotVerified'))
      setLoading(false)
      return
    }

    setError(t('invalidCredentials'))
    setLoading(false)
  }

  const handleResendVerification = async () => {
    setLoading(true)
    setResendNotice(null)

    // Not authClient.sendVerificationEmail: that route answers 200 even when
    // delivery fails, so a failed resend would report itself as sent.
    let ok = false
    try {
      const res = await fetch('/api/verification/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, callbackURL: '/dashboard' }),
      })
      ok = res.ok
    } catch {
      ok = false
    }

    setResendNotice(ok ? t('verificationResent') : t('verificationResendFailed'))
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

  return (
    <main className="member account-page account-page--narrow">
      {step === 'credentials' ? (
        <form className="account-form account-form--stacked" onSubmit={handleCredentials}>
          <h1 className="account-form__title">{t('signInTitle')}</h1>
          <p className="account-form__intro">{t('signInDescription')}</p>

          {error && <p className="account-alert" role="alert">{error}</p>}

          {needsVerification && (
            <div className="account-alert account-alert--notice">
              <button
                type="button"
                onClick={handleResendVerification}
                disabled={loading}
                className="account-linkbtn"
              >
                {t('resendVerification')}
              </button>
              {resendNotice && <p style={{ margin: '0.5rem 0 0' }}>{resendNotice}</p>}
            </div>
          )}

          <section className="account-form__section">
            <AccountField label={t('email')} required htmlFor="signin-email">
              <input
                id="signin-email"
                className="account-input"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />
            </AccountField>

            <AccountField label={t('password')} required htmlFor="signin-password">
              <input
                id="signin-password"
                className="account-input"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </AccountField>
          </section>

          <div className="account-form__actions">
            <button type="submit" className="member-btn" disabled={loading}>
              {loading ? tc('loading') : t('signInBtn')}
            </button>
          </div>
        </form>
      ) : (
        <form className="account-form account-form--stacked" onSubmit={handleTotp}>
          <h1 className="account-form__title">{t('signInTitle')}</h1>
          <p className="account-form__intro">{t('totpPrompt')}</p>

          {error && <p className="account-alert" role="alert">{error}</p>}

          <section className="account-form__section">
            <AccountField label={t('totpLabel')} required htmlFor="signin-totp">
              <input
                id="signin-totp"
                className="account-input"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={totp}
                onChange={(e) => setTotp(e.target.value.replace(/\D/g, ''))}
                required
                autoFocus
                placeholder="000000"
                style={{
                  fontFamily: 'monospace',
                  fontSize: '1.5rem',
                  letterSpacing: '0.3em',
                  textAlign: 'center',
                }}
              />
            </AccountField>
          </section>

          <div className="account-form__actions account-form__actions--pair">
            <button
              type="button"
              className="member-btn member-btn--ghost"
              onClick={() => {
                setStep('credentials')
                setTotp('')
                setError(null)
              }}
            >
              {tc('back')}
            </button>
            <button type="submit" className="member-btn" disabled={loading || totp.length < 6}>
              {loading ? tc('loading') : t('verifyBtn')}
            </button>
          </div>
        </form>
      )}

      <p className="account-page__aside">
        {t('noAccount')} <Link href="/sign-up">{t('signUpLink')}</Link>
      </p>
    </main>
  )
}
