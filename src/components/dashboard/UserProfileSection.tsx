'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { authClient } from '@/lib/auth-client'
import QRCode from 'react-qr-code'
import type { Gender } from '@/types/database'

interface UserProps {
  email: string
  name: string
  gender: string | null
  dateOfBirth: string | null
  twoFactorEnabled: boolean
}

const GENDER_OPTIONS: Gender[] = ['male', 'female', 'other', 'prefer_not_to_say']
type EditableField = 'name' | 'gender' | 'dateOfBirth'
type TwoFAStep = 'idle' | 'password' | 'qr' | 'verify' | 'backup' | 'done'

export default function UserProfileSection({ user }: { user: UserProps }) {
  const t = useTranslations('dashboard.profile')
  const tc = useTranslations('common')
  const router = useRouter()
  const [, startTransition] = useTransition()

  // ── Profile editing ───────────────────────────────────────────────────────
  const [editing, setEditing] = useState<EditableField | null>(null)
  const [values, setValues] = useState({ name: user.name, gender: user.gender ?? '', dateOfBirth: user.dateOfBirth ?? '' })
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const save = async (field: EditableField) => {
    setSaving(true)
    setSaveError(null)
    const body: Record<string, string | null> = { [field]: values[field] === '' ? null : values[field] }
    const res = await fetch('/api/user', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    if (!res.ok) { setSaveError(t('saveError')); setSaving(false); return }
    setEditing(null)
    setSaving(false)
    startTransition(() => router.refresh())
  }

  const cancel = () => {
    setValues({ name: user.name, gender: user.gender ?? '', dateOfBirth: user.dateOfBirth ?? '' })
    setEditing(null)
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

  return (
    <section className="mb-10">
      <h2 className="text-lg font-semibold mb-4">{t('title')}</h2>
      <div className="rounded-xl border border-zinc-100 bg-white divide-y divide-zinc-100">

        {/* Email — read-only */}
        <ProfileRow label={t('email')}>
          <span className="text-zinc-700">{user.email}</span>
        </ProfileRow>

        {/* Display name */}
        <ProfileRow label={t('name')} onEdit={editing !== 'name' ? () => { setSaveError(null); setEditing('name') } : undefined}>
          {editing === 'name' ? (
            <InlineInput value={values.name} onChange={v => setValues(s => ({ ...s, name: v }))} onSave={() => save('name')} onCancel={cancel} saving={saving} type="text" />
          ) : (
            <span className="text-zinc-700">{user.name || <Unset label={t('notSet')} />}</span>
          )}
        </ProfileRow>

        {/* Gender */}
        <ProfileRow label={t('gender')} onEdit={editing !== 'gender' ? () => { setSaveError(null); setEditing('gender') } : undefined}>
          {editing === 'gender' ? (
            <div className="flex items-center gap-2 flex-wrap">
              <select value={values.gender} onChange={e => setValues(s => ({ ...s, gender: e.target.value }))} className={inputClass}>
                <option value="">{t('notSet')}</option>
                {GENDER_OPTIONS.map(g => <option key={g} value={g}>{t(`gender_${g}`)}</option>)}
              </select>
              <SaveCancelButtons onSave={() => save('gender')} onCancel={cancel} saving={saving} />
            </div>
          ) : (
            <span className="text-zinc-700">{user.gender ? t(`gender_${user.gender}`) : <Unset label={t('notSet')} />}</span>
          )}
        </ProfileRow>

        {/* Date of birth */}
        <ProfileRow label={t('dateOfBirth')} onEdit={editing !== 'dateOfBirth' ? () => { setSaveError(null); setEditing('dateOfBirth') } : undefined}>
          {editing === 'dateOfBirth' ? (
            <InlineInput value={values.dateOfBirth} onChange={v => setValues(s => ({ ...s, dateOfBirth: v }))} onSave={() => save('dateOfBirth')} onCancel={cancel} saving={saving} type="date" />
          ) : (
            <span className="text-zinc-700">{user.dateOfBirth ?? <Unset label={t('notSet')} />}</span>
          )}
        </ProfileRow>

      </div>
      {saveError && <p className="mt-2 text-sm text-red-600">{saveError}</p>}

      {/* ── Two-Factor Authentication ────────────────────────────────────────── */}
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

      {/* ── Delete account ───────────────────────────────────────────────────── */}
      <div className="mt-8 pt-6 border-t border-zinc-100">
        <button type="button" onClick={() => { setShowDeleteModal(true); setDeleteConfirm(''); setDeleteError(null) }} className="text-sm text-red-500 hover:text-red-700 transition-colors underline underline-offset-2">
          {t('deleteAccount')}
        </button>
      </div>

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

function ProfileRow({ label, children, onEdit }: { label: string; children: React.ReactNode; onEdit?: () => void }) {
  return (
    <div className="flex items-center gap-4 px-5 py-3.5">
      <span className="w-36 shrink-0 text-sm text-zinc-500">{label}</span>
      <div className="flex-1 text-sm">{children}</div>
      {onEdit && (
        <button type="button" onClick={onEdit} className="shrink-0 text-zinc-400 hover:text-zinc-700 transition-colors" aria-label="Edit">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
          </svg>
        </button>
      )}
    </div>
  )
}

function InlineInput({ value, onChange, onSave, onCancel, saving, type }: { value: string; onChange: (v: string) => void; onSave: () => void; onCancel: () => void; saving: boolean; type: string }) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <input type={type} value={value} onChange={e => onChange(e.target.value)} className="rounded-md border border-zinc-200 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900" autoFocus onKeyDown={e => { if (e.key === 'Enter') onSave(); if (e.key === 'Escape') onCancel() }} />
      <SaveCancelButtons onSave={onSave} onCancel={onCancel} saving={saving} />
    </div>
  )
}

function SaveCancelButtons({ onSave, onCancel, saving }: { onSave: () => void; onCancel: () => void; saving: boolean }) {
  const t = useTranslations('common')
  return (
    <div className="flex gap-1.5">
      <button type="button" onClick={onSave} disabled={saving} className="rounded px-2.5 py-1 text-xs font-medium bg-zinc-900 text-white hover:bg-zinc-700 disabled:opacity-50 transition-colors">{t('save')}</button>
      <button type="button" onClick={onCancel} disabled={saving} className="rounded px-2.5 py-1 text-xs font-medium border border-zinc-200 hover:bg-zinc-50 disabled:opacity-50 transition-colors">{t('cancel')}</button>
    </div>
  )
}

function Unset({ label }: { label: string }) {
  return <span className="text-zinc-400 italic">{label}</span>
}
