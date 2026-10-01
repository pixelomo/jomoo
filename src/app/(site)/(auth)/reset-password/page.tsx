'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { authClient } from '@/lib/auth-client'
import AccountField from '@/components/ui/AccountField'
import { passwordField } from '@/types/membership-signup'
import '@/components/dashboard/member-portal.css'

/**
 * Where the emailed link lands. Better Auth checks the token on the way through
 * and arrives here with ?token=… when it is good, or ?error=INVALID_TOKEN when
 * it is unknown or past its hour.
 */
function ResetPasswordForm() {
  const t = useTranslations('auth')
  const tm = useTranslations('auth.membership')
  const tc = useTranslations('common')
  const router = useRouter()
  const params = useSearchParams()

  const token = params.get('token')
  const invalid = !token || params.get('error') === 'INVALID_TOKEN'

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [fieldError, setFieldError] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [expired, setExpired] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // The same rules sign-up applies, so a reset cannot set a weaker password.
    const check = passwordField.safeParse(password)
    if (!check.success) {
      setFieldError(tm(`errors.${check.error.issues[0].message}` as 'errors.passwordMinLength'))
      return
    }
    if (password !== confirm) {
      setFieldError(t('passwordMismatch'))
      return
    }
    setFieldError(null)
    setLoading(true)

    const { error: err } = await authClient.resetPassword({ newPassword: password, token: token! })

    if (err) {
      setLoading(false)
      if (err.code === 'INVALID_TOKEN') setExpired(true)
      else setError(t('resetFailed'))
      return
    }

    router.push('/sign-in?reset=1')
  }

  if (invalid || expired) {
    return (
      <div className="account-form account-form--stacked">
        <h1 className="account-form__title">{t('resetTitle')}</h1>
        <p className="account-alert" role="alert">{t('resetInvalidToken')}</p>
        <div className="account-form__actions">
          <Link className="member-btn" href="/forgot-password">
            {t('requestNewLink')}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <form className="account-form account-form--stacked" onSubmit={handleSubmit}>
      <h1 className="account-form__title">{t('resetTitle')}</h1>
      <p className="account-form__intro">{t('resetDescription')}</p>

      {error && <p className="account-alert" role="alert">{error}</p>}

      <section className="account-form__section">
        <AccountField
          label={t('newPassword')}
          required
          htmlFor="reset-password"
          hint={
            <>
              {tm('passwordHint1')}
              <br />
              {tm('passwordHint2')}
            </>
          }
          error={fieldError ?? undefined}
        >
          <input
            id="reset-password"
            className="account-input"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoFocus
          />
        </AccountField>

        <AccountField label={t('confirmPassword')} required htmlFor="reset-confirm">
          <input
            id="reset-confirm"
            className="account-input"
            type="password"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
          />
        </AccountField>
      </section>

      <div className="account-form__actions">
        <button type="submit" className="member-btn" disabled={loading}>
          {loading ? tc('loading') : t('resetSubmit')}
        </button>
      </div>
    </form>
  )
}

export default function ResetPasswordPage() {
  const t = useTranslations('auth')

  return (
    <main className="member account-page account-page--narrow">
      <Suspense fallback={null}>
        <ResetPasswordForm />
      </Suspense>

      <p className="account-page__aside">
        <Link href="/sign-in">{t('backToSignIn')}</Link>
      </p>
    </main>
  )
}
