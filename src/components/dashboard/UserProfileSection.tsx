'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { authClient } from '@/lib/auth-client'
import { TWO_FACTOR_ENABLED } from '@/lib/auth-features'
import QRCode from 'react-qr-code'
import type { Gender } from '@/types/database'
import './member-portal.css'

interface UserProps {
  email: string
  name: string
  gender: string | null
  dateOfBirth: string | null
  phoneNumber: string | null
  postalCode: string | null
  /** Composed by the caller from prefecture / city / street / building. */
  address: string | null
  twoFactorEnabled: boolean
}

const GENDER_OPTIONS: Gender[] = ['male', 'female', 'other', 'prefer_not_to_say']
type EditableField = 'name' | 'gender' | 'dateOfBirth' | 'phoneNumber' | 'postalCode' | 'address'

/** 1990-01-31 → 1990年1月31日 */
function formatBirthDate(value: string | null): string | null {
  if (!value) return null
  const [y, m, d] = value.split('-').map(Number)
  if (!y || !m || !d) return value
  return `${y}年${m}月${d}日`
}
type TwoFAStep = 'idle' | 'password' | 'qr' | 'verify' | 'backup' | 'done'

export default function UserProfileSection({ user }: { user: UserProps }) {
  const t = useTranslations('dashboard.profile')
  const tc = useTranslations('common')
  const router = useRouter()
  const [, startTransition] = useTransition()

  // ── Profile editing ───────────────────────────────────────────────────────
  const [editing, setEditing] = useState(false)
  const blank = {
    name: user.name,
    gender: user.gender ?? '',
    dateOfBirth: user.dateOfBirth ?? '',
    phoneNumber: user.phoneNumber ?? '',
    postalCode: user.postalCode ?? '',
    address: user.address ?? '',
  }
  const [values, setValues] = useState(blank)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  // One 編集する button opens the whole card, so every field saves together.
  const save = async () => {
    setSaving(true)
    setSaveError(null)
    const body = Object.fromEntries(
      (Object.keys(blank) as EditableField[]).map((k) => [k, values[k] === '' ? null : values[k]])
    )
    const res = await fetch('/api/user', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (!res.ok) { setSaveError(t('saveError')); setSaving(false); return }
    setEditing(false)
    setSaving(false)
    startTransition(() => router.refresh())
  }

  const cancel = () => {
    setValues(blank)
    setEditing(false)
    setSaveError(null)
  }

  // ── Delete account ────────────────────────────────────────────────────────
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const deleteAccount = async () => {
    setDeleting(true)
    setDeleteError(null)
    const res = await fetch('/api/user', { method: 'DELETE' })
    if (!res.ok) { setDeleteError(t('deleteAccountError')); setDeleting(false); return }
    await authClient.signOut()
    router.push('/')
  }

  // ── 2FA setup ─────────────────────────────────────────────────────────────
  const [tfaStep, setTfaStep] = useState<TwoFAStep>('idle')
  const [tfaPassword, setTfaPassword] = useState('')
  const [tfaUri, setTfaUri] = useState('')
  const [tfaBackupCodes, setTfaBackupCodes] = useState<string[]>([])
  const [tfaCode, setTfaCode] = useState('')
  const [tfaError, setTfaError] = useState<string | null>(null)
  const [tfaLoading, setTfaLoading] = useState(false)

  const startEnable2FA = async (e: React.FormEvent) => {
    e.preventDefault()
    setTfaLoading(true)
    setTfaError(null)
    const { data, error } = await authClient.twoFactor.enable({ password: tfaPassword })
    if (error) {
      console.error('[2FA enable error]', error)
      const msg = error.code === 'INVALID_PASSWORD'
        ? t('twoFactorPasswordError')
        : `Error: ${error.message ?? error.code ?? 'Unknown error'}`
      setTfaError(msg)
      setTfaLoading(false)
      return
    }
    if (!data) {
      setTfaError('No data returned from server')
      setTfaLoading(false)
      return
    }
    setTfaUri(data.totpURI)
    setTfaBackupCodes(data.backupCodes)
    setTfaStep('qr')
    setTfaLoading(false)
  }

  const disable2FA = async () => {
    setTfaLoading(true)
    setTfaError(null)
    const { error } = await authClient.twoFactor.disable({ password: tfaPassword })
    if (error) { setTfaError(t('twoFactorPasswordError')); setTfaLoading(false); return }
    setTfaStep('idle')
    setTfaPassword('')
    setTfaLoading(false)
    startTransition(() => router.refresh())
  }

  const inputClass = 'rounded-md border border-zinc-200 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900'

  const genderLabel = user.gender ? t(`gender_${user.gender}`) : null

  return (
    <section>
      <div className="member-profile-card">
        <div className="member-profile-card__head">
          <h2 className="member-profile-card__title">お客様の基本情報</h2>
          <Link className="member-edit-pill" href="/account">
            編集する
          </Link>
        </div>

        {/* Email is the sign-in identity, so it is shown but never editable here. */}
        <ProfileField label={t('email')} value={user.email} />

        <ProfileField label={t('name')} value={user.name} editing={editing}>
          <input type="text" value={values.name} onChange={e => setValues(v => ({ ...v, name: e.target.value }))} />
        </ProfileField>

        <ProfileField label={t('gender')} value={genderLabel} editing={editing}>
          <select value={values.gender} onChange={e => setValues(v => ({ ...v, gender: e.target.value }))}>
            <option value="">{t('notSet')}</option>
            {GENDER_OPTIONS.map(g => <option key={g} value={g}>{t(`gender_${g}`)}</option>)}
          </select>
        </ProfileField>

        <ProfileField label={t('dateOfBirth')} value={formatBirthDate(user.dateOfBirth)} editing={editing}>
          <input type="date" value={values.dateOfBirth} onChange={e => setValues(v => ({ ...v, dateOfBirth: e.target.value }))} />
        </ProfileField>

        <ProfileField label={t('phoneNumber')} value={user.phoneNumber} editing={editing}>
          <input type="tel" inputMode="tel" value={values.phoneNumber} onChange={e => setValues(v => ({ ...v, phoneNumber: e.target.value }))} />
        </ProfileField>

        <ProfileField label={t('postalCode')} value={user.postalCode} editing={editing}>
          <input type="text" inputMode="numeric" value={values.postalCode} onChange={e => setValues(v => ({ ...v, postalCode: e.target.value }))} />
        </ProfileField>

        <ProfileField label={t('address')} value={user.address} editing={editing}>
          <input type="text" value={values.address} onChange={e => setValues(v => ({ ...v, address: e.target.value }))} />
        </ProfileField>

        {editing && (
          <div className="member-profile-card__actions">
            <button type="button" className="member-edit-pill" onClick={save} disabled={saving}>
              {saving ? '…' : tc('save')}
            </button>
            <button type="button" className="member-edit-pill member-edit-pill--ghost" onClick={cancel} disabled={saving}>
              {tc('cancel')}
            </button>
          </div>
        )}
      </div>
      {saveError && <p className="mt-2 text-sm text-red-600">{saveError}</p>}

      {/* ── Two-Factor Authentication ────────────────────────────────────────── */}
      {/* Hidden while the plugin is off: the endpoints it calls do not exist. */}
      {TWO_FACTOR_ENABLED && (
      <div className="mt-8 rounded-xl border border-zinc-100 bg-white p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-semibold text-zinc-900">{t('twoFactor')}</h3>
            <p className="text-xs text-zinc-500 mt-0.5">
              {user.twoFactorEnabled ? t('twoFactorEnabled') : t('twoFactorDisabled')}
            </p>
          </div>
          {user.twoFactorEnabled ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-full px-2.5 py-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              {t('active')}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 bg-zinc-50 border border-zinc-200 rounded-full px-2.5 py-0.5">
              {t('inactive')}
            </span>
          )}
        </div>

        {/* Not enabled — show enable flow */}
        {!user.twoFactorEnabled && tfaStep === 'idle' && (
          <button type="button" onClick={() => setTfaStep('password')} className="text-sm font-medium text-zinc-900 underline underline-offset-2 hover:text-zinc-700">
            {t('enable2FA')} →
          </button>
        )}

        {/* Step: enter password to enable */}
        {!user.twoFactorEnabled && tfaStep === 'password' && (
          <form onSubmit={startEnable2FA} className="flex items-center gap-2 mt-2 flex-wrap">
            <input type="password" placeholder={t('enterPassword')} value={tfaPassword} onChange={e => setTfaPassword(e.target.value)} required className={`${inputClass} flex-1 min-w-48`} />
            <button type="submit" disabled={tfaLoading} className="rounded px-3 py-1.5 text-xs font-medium bg-zinc-900 text-white hover:bg-zinc-700 disabled:opacity-50 transition-colors">
              {tfaLoading ? '...' : tc('confirm')}
            </button>
            <button type="button" onClick={() => { setTfaStep('idle'); setTfaPassword('') }} className="rounded px-3 py-1.5 text-xs border border-zinc-200 hover:bg-zinc-50">
              {tc('cancel')}
            </button>
            {tfaError && <p className="w-full text-xs text-red-600 mt-1">{tfaError}</p>}
          </form>
        )}

        {/* Step: show QR code */}
        {tfaStep === 'qr' && (
          <div className="mt-3 space-y-4">
            <p className="text-xs text-zinc-600">{t('scanQr')}</p>
            <div className="bg-white border border-zinc-200 rounded-lg p-4 inline-block">
              <QRCode value={tfaUri} size={160} />
            </div>
            <p className="text-xs text-zinc-400 break-all font-mono">{tfaUri}</p>
            <button type="button" onClick={() => setTfaStep('backup')} className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 transition-colors">
              {t('scannedNext')} →
            </button>
          </div>
        )}

        {/* Step: save backup codes */}
        {tfaStep === 'backup' && (
          <div className="mt-3 space-y-3">
            <p className="text-xs font-medium text-zinc-700">{t('saveBackupCodes')}</p>
            <div className="rounded-lg bg-zinc-50 border border-zinc-200 p-4 grid grid-cols-2 gap-2">
              {tfaBackupCodes.map(code => (
                <code key={code} className="text-xs font-mono text-zinc-700">{code}</code>
              ))}
            </div>
            <button type="button" onClick={() => { setTfaStep('done'); startTransition(() => router.refresh()) }} className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 transition-colors">
              {t('savedNext')} →
            </button>
          </div>
        )}

        {tfaStep === 'done' && (
          <p className="text-sm text-green-700 mt-2">{t('twoFactorSetupDone')}</p>
        )}

        {/* Enabled — show disable flow */}
        {user.twoFactorEnabled && tfaStep === 'idle' && (
          <button type="button" onClick={() => setTfaStep('password')} className="text-sm text-red-500 hover:text-red-700 underline underline-offset-2">
            {t('disable2FA')}
          </button>
        )}
        {user.twoFactorEnabled && tfaStep === 'password' && (
          <form onSubmit={e => { e.preventDefault(); disable2FA() }} className="flex items-center gap-2 mt-2 flex-wrap">
            <input type="password" placeholder={t('enterPassword')} value={tfaPassword} onChange={e => setTfaPassword(e.target.value)} required className={`${inputClass} flex-1 min-w-48`} />
            <button type="submit" disabled={tfaLoading} className="rounded px-3 py-1.5 text-xs font-medium bg-red-600 text-white hover:bg-red-700 disabled:opacity-50">
              {tfaLoading ? '...' : t('disable2FA')}
            </button>
            <button type="button" onClick={() => { setTfaStep('idle'); setTfaPassword('') }} className="rounded px-3 py-1.5 text-xs border border-zinc-200 hover:bg-zinc-50">
              {tc('cancel')}
            </button>
            {tfaError && <p className="w-full text-xs text-red-600 mt-1">{tfaError}</p>}
          </form>
        )}
      </div>
      )}

      {/* ── Delete account ───────────────────────────────────────────────────── */}
      <button
        type="button"
        className="member-delete"
        onClick={() => { setShowDeleteModal(true); setDeleteConfirm(''); setDeleteError(null) }}
      >
        {t('deleteAccount')}
      </button>

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
            <h3 className="text-base font-semibold text-zinc-900 mb-2">{t('deleteAccount')}</h3>
            <p className="text-sm text-zinc-500 mb-4">{t('deleteAccountWarning')}</p>
            <p className="text-xs text-zinc-500 mb-1">{t('deleteAccountConfirmPrompt')}</p>
            <input type="text" value={deleteConfirm} onChange={e => setDeleteConfirm(e.target.value)} className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-red-400" autoFocus />
            {deleteError && <p className="text-sm text-red-600 mb-3">{deleteError}</p>}
            <div className="flex gap-2 justify-end">
              <button type="button" onClick={() => setShowDeleteModal(false)} disabled={deleting} className="rounded px-3 py-1.5 text-sm border border-zinc-200 hover:bg-zinc-50 disabled:opacity-50 transition-colors">
                {tc('cancel')}
              </button>
              <button type="button" onClick={deleteAccount} disabled={deleteConfirm !== 'DELETE' || deleting} className="rounded px-3 py-1.5 text-sm bg-red-600 text-white hover:bg-red-700 disabled:opacity-40 transition-colors">
                {deleting ? '...' : t('deleteAccountConfirm')}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

function ProfileField({
  label,
  value,
  editing,
  children,
}: {
  label: string
  value: string | null
  /** Absent for read-only fields such as the email address. */
  editing?: boolean
  children?: React.ReactNode
}) {
  const t = useTranslations('dashboard.profile')
  return (
    <div className="member-field">
      <span className="member-field__label">{label}</span>
      <div className="member-field__value">
        {editing && children ? (
          children
        ) : value ? (
          value
        ) : (
          <span className="member-field__unset">{t('notSet')}</span>
        )}
      </div>
    </div>
  )
}
