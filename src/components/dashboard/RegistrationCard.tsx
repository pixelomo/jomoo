'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations, useLocale } from 'next-intl'
import Image from 'next/image'
import Link from 'next/link'
import type { DbProductRegistration } from '@/types/database'
import { PROVINCES } from '@/data/provinces'

interface Props {
  registration: DbProductRegistration
}

const MUTABLE_STATUSES = ['PENDING', 'RETURNED']

const STATUS_COLOURS: Record<string, string> = {
  PENDING: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  RETURNED: 'bg-red-50 text-red-700 border-red-200',
  REGISTERED_NO_WARRANTY: 'bg-green-50 text-green-700 border-green-200',
  REGISTERED_WITH_WARRANTY: 'bg-blue-50 text-blue-700 border-blue-200',
}

export default function RegistrationCard({ registration: initial }: Props) {
  const t = useTranslations('dashboard')
  const tr = useTranslations('registration.step1')
  const tc = useTranslations('common')
  const locale = useLocale()
  const router = useRouter()
  const [, startTransition] = useTransition()

  const reg = initial
  const canMutate = MUTABLE_STATUSES.includes(reg.status)

  const [showEdit, setShowEdit] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [lightbox, setLightbox] = useState<string | null>(null)

  const handleDelete = async () => {
    setDeleting(true)
    try {
      const res = await fetch(`/api/registrations/${reg.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Delete failed')
      startTransition(() => router.refresh())
    } catch {
      setDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  return (
    <>
      <div className="rounded-xl border border-zinc-100 bg-white p-5 space-y-4">
        {/* Header row */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-semibold text-zinc-900">{reg.modelName}</p>
            <p className="text-sm text-zinc-500 mt-0.5">
              {tr('installationDate')}: {reg.installationDate}
            </p>
            <p className="text-sm text-zinc-500">
              {reg.installationAddressState
                ? PROVINCES.find((p) => p.value === reg.installationAddressState)?.[
                    locale === 'zh-CN' ? 'labelZh' : 'labelEn'
                  ] ?? reg.installationAddressState
                : null}
              {reg.installationAddressDetail ? `, ${reg.installationAddressDetail}` : null}
            </p>
          </div>
          <span
            className={`shrink-0 inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${STATUS_COLOURS[reg.status] ?? 'bg-zinc-50 text-zinc-600 border-zinc-200'}`}
          >
            {t(`status.${reg.status}`)}
          </span>
        </div>

        {/* Image thumbnails */}
        {(reg.warrantyCardUrl || reg.serialNumberImageUrl) && (
          <div className="flex gap-3">
            {reg.warrantyCardUrl && (
              <Thumbnail
                url={reg.warrantyCardUrl}
                label={t('warrantyCardPhoto')}
                onClick={() => setLightbox(reg.warrantyCardUrl!)}
              />
            )}
            {reg.serialNumberImageUrl && (
              <Thumbnail
                url={reg.serialNumberImageUrl}
                label={t('serialNumberPhoto')}
                onClick={() => setLightbox(reg.serialNumberImageUrl!)}
              />
            )}
          </div>
        )}

        {/* Action row */}
        <div className="flex items-center gap-3 pt-1 border-t border-zinc-50">
          {reg.status === 'REGISTERED_WITH_WARRANTY' && (
            <Link
              href={`/warranty/${reg.id}`}
              className="text-sm font-medium text-zinc-900 underline-offset-4 hover:underline"
            >
              {t('viewWarranty')}
            </Link>
          )}
          {canMutate && (
            <>
              <button
                type="button"
                onClick={() => setShowEdit(true)}
                className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors"
              >
                {t('editRegistration')}
              </button>
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="text-sm font-medium text-red-500 hover:text-red-700 transition-colors"
              >
                {t('deleteRegistration')}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setLightbox(null)}
        >
          <div className="relative max-w-3xl w-full max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={lightbox} alt="" className="w-full h-full object-contain rounded-lg" />
            <button
              onClick={() => setLightbox(null)}
              className="absolute top-2 right-2 rounded-full bg-black/50 p-1.5 text-white hover:bg-black/70"
            >
              <XIcon />
            </button>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {showDeleteConfirm && (
        <Modal onClose={() => !deleting && setShowDeleteConfirm(false)}>
          <p className="text-sm text-zinc-700 mb-6">{t('confirmDelete')}</p>
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(false)}
              disabled={deleting}
              className="rounded-lg border border-zinc-200 px-4 py-2 text-sm hover:bg-zinc-50 disabled:opacity-50 transition-colors"
            >
              {tc('cancel')}
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
            >
              {deleting ? tc('loading') : t('deleteRegistration')}
            </button>
          </div>
        </Modal>
      )}

      {/* Edit modal */}
      {showEdit && (
        <EditModal
          registration={reg}
          onClose={() => setShowEdit(false)}
          onSaved={() => {
            setShowEdit(false)
            startTransition(() => router.refresh())
          }}
        />
      )}
    </>
  )
}

function Thumbnail({ url, label, onClick }: { url: string; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative w-20 h-16 rounded-lg overflow-hidden border border-zinc-200 bg-zinc-50 shrink-0"
      title={label}
    >
      <Image
        src={url}
        alt={label}
        fill
        className="object-cover group-hover:opacity-80 transition-opacity"
        sizes="80px"
      />
      <span className="absolute bottom-0 inset-x-0 bg-black/40 text-white text-[10px] px-1 py-0.5 truncate">
        {label}
      </span>
    </button>
  )
}

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-700"
        >
          <XIcon />
        </button>
        {children}
      </div>
    </div>
  )
}

function EditModal({
  registration,
  onClose,
  onSaved,
}: {
  registration: DbProductRegistration
  onClose: () => void
  onSaved: () => void
}) {
  const t = useTranslations('dashboard')
  const tr = useTranslations('registration.step1')
  const tc = useTranslations('common')
  const locale = useLocale()

  const [fields, setFields] = useState({
    installation_date: registration.installationDate ?? '',
    installation_address_state: registration.installationAddressState ?? '',
    installation_address_detail: registration.installationAddressDetail ?? '',
    contact_person: registration.contactPerson ?? '',
    phone_number: registration.phoneNumber ?? '',
    purchase_date: registration.purchaseDate ?? '',
    dealer_name: registration.dealerName ?? '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const set = (key: keyof typeof fields) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setFields((f) => ({ ...f, [key]: e.target.value }))

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    try {
      const body = {
        ...fields,
        phone_number: fields.phone_number || null,
        purchase_date: fields.purchase_date || null,
        dealer_name: fields.dealer_name || null,
      }
      const res = await fetch(`/api/registrations/${registration.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error('Save failed')
      onSaved()
    } catch {
      setError(tc('error'))
    } finally {
      setSaving(false)
    }
  }

  const inputClass = 'w-full rounded-md border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900'

  return (
    <Modal onClose={onClose}>
      <h3 className="font-semibold text-zinc-900 mb-4">{t('editTitle')}</h3>
      <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
        <label className="block">
          <span className="text-xs text-zinc-500 mb-1 block">{tr('installationDate')}</span>
          <input type="date" value={fields.installation_date} onChange={set('installation_date')} className={inputClass} />
        </label>
        <label className="block">
          <span className="text-xs text-zinc-500 mb-1 block">{tr('installationAddressState')}</span>
          <select value={fields.installation_address_state} onChange={set('installation_address_state')} className={inputClass}>
            <option value="">{tr('installationAddressStatePlaceholder')}</option>
            {PROVINCES.map((p) => (
              <option key={p.value} value={p.value}>
                {locale === 'zh-CN' ? p.labelZh : p.labelEn}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-xs text-zinc-500 mb-1 block">{tr('installationAddressDetail')}</span>
          <input type="text" value={fields.installation_address_detail} onChange={set('installation_address_detail')} className={inputClass} />
        </label>
        <label className="block">
          <span className="text-xs text-zinc-500 mb-1 block">{tr('contactPerson')}</span>
          <input type="text" value={fields.contact_person} onChange={set('contact_person')} className={inputClass} />
        </label>
        <label className="block">
          <span className="text-xs text-zinc-500 mb-1 block">{tr('phoneNumber')}</span>
          <input type="tel" value={fields.phone_number} onChange={set('phone_number')} className={inputClass} />
        </label>
        <label className="block">
          <span className="text-xs text-zinc-500 mb-1 block">{tr('purchaseDate')}</span>
          <input type="date" value={fields.purchase_date} onChange={set('purchase_date')} className={inputClass} />
        </label>
        <label className="block">
          <span className="text-xs text-zinc-500 mb-1 block">{tr('dealerName')}</span>
          <input type="text" value={fields.dealer_name} onChange={set('dealer_name')} className={inputClass} />
        </label>
      </div>
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      <div className="flex gap-3 justify-end mt-5">
        <button
          type="button"
          onClick={onClose}
          disabled={saving}
          className="rounded-lg border border-zinc-200 px-4 py-2 text-sm hover:bg-zinc-50 disabled:opacity-50 transition-colors"
        >
          {tc('cancel')}
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 transition-colors"
        >
          {saving ? tc('loading') : tc('save')}
        </button>
      </div>
    </Modal>
  )
}

function XIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
}
