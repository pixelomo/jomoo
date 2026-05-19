'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useClerk } from '@clerk/nextjs'
import type { DbUser, Gender } from '@/types/database'

interface Props {
  user: Pick<DbUser, 'email' | 'nickname' | 'gender' | 'date_of_birth'>
}

type EditableField = 'nickname' | 'gender' | 'date_of_birth'

const GENDER_OPTIONS: Gender[] = ['male', 'female', 'other', 'prefer_not_to_say']

export default function UserProfileSection({ user }: Props) {
  const t = useTranslations('dashboard.profile')
  const tc = useTranslations('common')
  const router = useRouter()
  const { signOut } = useClerk()
  const [, startTransition] = useTransition()
  const [editing, setEditing] = useState<EditableField | null>(null)
  const [values, setValues] = useState({
    nickname: user.nickname ?? '',
    gender: user.gender ?? '',
    date_of_birth: user.date_of_birth ?? '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const deleteAccount = async () => {
    setDeleting(true)
    setDeleteError(null)
    try {
      const res = await fetch('/api/user', { method: 'DELETE' })
      if (!res.ok) throw new Error()
      await signOut({ redirectUrl: '/' })
    } catch {
      setDeleteError(t('deleteAccountError'))
      setDeleting(false)
    }
  }

  const startEdit = (field: EditableField) => {
    setError(null)
    setEditing(field)
  }

  const cancel = () => {
    setValues({
      nickname: user.nickname ?? '',
      gender: user.gender ?? '',
      date_of_birth: user.date_of_birth ?? '',
    })
    setEditing(null)
    setError(null)
  }

  const save = async (field: EditableField) => {
    setSaving(true)
    setError(null)
    try {
      const body: Record<string, string | null> = {
        [field]: values[field] === '' ? null : values[field],
      }
      const res = await fetch('/api/user', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error('Save failed')
      setEditing(null)
      startTransition(() => router.refresh())
    } catch {
      setError(t('saveError'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="mb-10">
      <h2 className="text-lg font-semibold mb-4">{t('title')}</h2>
      <div className="rounded-xl border border-zinc-100 bg-white divide-y divide-zinc-100">
        {/* Email - read only */}
        <ProfileRow label={t('email')}>
          <span className="text-zinc-700">{user.email}</span>
        </ProfileRow>

        {/* Nickname */}
        <ProfileRow
          label={t('nickname')}
          onEdit={editing !== 'nickname' ? () => startEdit('nickname') : undefined}
        >
          {editing === 'nickname' ? (
            <InlineInput
              value={values.nickname}
              onChange={(v) => setValues((s) => ({ ...s, nickname: v }))}
              onSave={() => save('nickname')}
              onCancel={cancel}
              saving={saving}
              type="text"
            />
          ) : (
            <span className="text-zinc-700">{user.nickname ?? <Unset label={t('notSet')} />}</span>
          )}
        </ProfileRow>

        {/* Gender */}
        <ProfileRow
          label={t('gender')}
          onEdit={editing !== 'gender' ? () => startEdit('gender') : undefined}
        >
          {editing === 'gender' ? (
            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={values.gender}
                onChange={(e) => setValues((s) => ({ ...s, gender: e.target.value }))}
                className="rounded-md border border-zinc-200 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
              >
                <option value="">{t('notSet')}</option>
                {GENDER_OPTIONS.map((g) => (
                  <option key={g} value={g}>{t(`gender_${g}`)}</option>
                ))}
              </select>
              <SaveCancelButtons onSave={() => save('gender')} onCancel={cancel} saving={saving} />
            </div>
          ) : (
            <span className="text-zinc-700">
              {user.gender ? t(`gender_${user.gender}`) : <Unset label={t('notSet')} />}
            </span>
          )}
        </ProfileRow>

        {/* Date of birth */}
        <ProfileRow
          label={t('dateOfBirth')}
          onEdit={editing !== 'date_of_birth' ? () => startEdit('date_of_birth') : undefined}
        >
          {editing === 'date_of_birth' ? (
            <InlineInput
              value={values.date_of_birth}
              onChange={(v) => setValues((s) => ({ ...s, date_of_birth: v }))}
              onSave={() => save('date_of_birth')}
              onCancel={cancel}
              saving={saving}
              type="date"
            />
          ) : (
            <span className="text-zinc-700">
              {user.date_of_birth ?? <Unset label={t('notSet')} />}
            </span>
          )}
        </ProfileRow>
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      <div className="mt-8 pt-6 border-t border-zinc-100">
        <button
          type="button"
          onClick={() => { setShowDeleteModal(true); setDeleteConfirm(''); setDeleteError(null) }}
          className="text-sm text-red-500 hover:text-red-700 transition-colors underline underline-offset-2"
        >
          {t('deleteAccount')}
        </button>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
            <h3 className="text-base font-semibold text-zinc-900 mb-2">{t('deleteAccount')}</h3>
            <p className="text-sm text-zinc-500 mb-4">{t('deleteAccountWarning')}</p>
            <p className="text-xs text-zinc-500 mb-1">{t('deleteAccountConfirmPrompt')}</p>
            <input
              type="text"
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-red-400"
              autoFocus
            />
            {deleteError && <p className="text-sm text-red-600 mb-3">{deleteError}</p>}
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
                className="rounded px-3 py-1.5 text-sm border border-zinc-200 hover:bg-zinc-50 disabled:opacity-50 transition-colors"
              >
                {tc('cancel')}
              </button>
              <button
                type="button"
                onClick={deleteAccount}
                disabled={deleteConfirm !== 'DELETE' || deleting}
                className="rounded px-3 py-1.5 text-sm bg-red-600 text-white hover:bg-red-700 disabled:opacity-40 transition-colors"
              >
                {deleting ? '...' : t('deleteAccountConfirm')}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

function ProfileRow({
  label,
  children,
  onEdit,
}: {
  label: string
  children: React.ReactNode
  onEdit?: () => void
}) {
  return (
    <div className="flex items-center gap-4 px-5 py-3.5">
      <span className="w-36 shrink-0 text-sm text-zinc-500">{label}</span>
      <div className="flex-1 text-sm">{children}</div>
      {onEdit && (
        <button
          type="button"
          onClick={onEdit}
          className="shrink-0 text-zinc-400 hover:text-zinc-700 transition-colors"
          aria-label="Edit"
        >
          <PencilIcon />
        </button>
      )}
    </div>
  )
}

function InlineInput({
  value,
  onChange,
  onSave,
  onCancel,
  saving,
  type,
}: {
  value: string
  onChange: (v: string) => void
  onSave: () => void
  onCancel: () => void
  saving: boolean
  type: string
}) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-md border border-zinc-200 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
        autoFocus
        onKeyDown={(e) => {
          if (e.key === 'Enter') onSave()
          if (e.key === 'Escape') onCancel()
        }}
      />
      <SaveCancelButtons onSave={onSave} onCancel={onCancel} saving={saving} />
    </div>
  )
}

function SaveCancelButtons({
  onSave,
  onCancel,
  saving,
}: {
  onSave: () => void
  onCancel: () => void
  saving: boolean
}) {
  const t = useTranslations('common')
  return (
    <div className="flex gap-1.5">
      <button
        type="button"
        onClick={onSave}
        disabled={saving}
        className="rounded px-2.5 py-1 text-xs font-medium bg-zinc-900 text-white hover:bg-zinc-700 disabled:opacity-50 transition-colors"
      >
        {t('save')}
      </button>
      <button
        type="button"
        onClick={onCancel}
        disabled={saving}
        className="rounded px-2.5 py-1 text-xs font-medium border border-zinc-200 hover:bg-zinc-50 disabled:opacity-50 transition-colors"
      >
        {t('cancel')}
      </button>
    </div>
  )
}

function Unset({ label }: { label: string }) {
  return <span className="text-zinc-400 italic">{label}</span>
}

function PencilIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
    </svg>
  )
}
