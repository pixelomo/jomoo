'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import Link from 'next/link'
import type { DbProductRegistration } from '@/types/database'
import { JP_PREFECTURES } from '@/data/jp-prefectures'
// The row wears the portal's own chrome, so it carries the stylesheet itself
// rather than relying on MemberTabs having been rendered first.
import './member-portal.css'

interface Props {
  registration: DbProductRegistration
  /** From warranty_records; absent until the registration has been approved. */
  warrantyExpiry?: string | null
}

/**
 * Dates come off two different column types: a date column arrives as a plain
 * YYYY-MM-DD string, a timestamp as a Date. The string form is read part by
 * part rather than through Date, or a render on a UTC host shows the day
 * before; the Date form is stated in JST, the only clock this site keeps.
 */
const JP_DATE = new Intl.DateTimeFormat('ja-JP', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  timeZone: 'Asia/Tokyo',
})

function formatDate(value: string | Date | null | undefined): string | null {
  if (!value) return null
  if (value instanceof Date) return JP_DATE.format(value)
  const [y, m, d] = value.split('T')[0].split('-').map(Number)
  return y && m && d ? `${y}年${m}月${d}日` : value
}

const MUTABLE_STATUSES = ['PENDING', 'RETURNED']

const STATUS_MODIFIER: Record<string, string> = {
  PENDING: 'pending',
  RETURNED: 'returned',
  REGISTERED_NO_WARRANTY: 'registered',
  REGISTERED_WITH_WARRANTY: 'warranty',
}

export default function RegistrationCard({ registration: initial, warrantyExpiry }: Props) {
  const t = useTranslations('dashboard')
  const tr = useTranslations('registration.step1')
  const tc = useTranslations('common')
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
      <article className="member-product">
        <div className="member-product__body">
          <div className="member-product__head">
            <h3 className="member-product__name">{reg.modelName}</h3>
            <span
              className={`member-product__status member-product__status--${
                STATUS_MODIFIER[reg.status] ?? 'pending'
              }`}
            >
              {t(`status.${reg.status}`)}
            </span>
          </div>

          <dl className="member-product__meta">
            <dt>{t('registeredAt')}</dt>
            <dd>{formatDate(reg.submittedAt) ?? '—'}</dd>

            <dt>{t('warrantyPeriod')}</dt>
            <dd>
              {warrantyExpiry && reg.installationDate
                ? `${formatDate(reg.installationDate)} 〜 ${formatDate(warrantyExpiry)}`
                : t('warrantyNotIssued')}
            </dd>

            <dt>{tr('purchaseDate')}</dt>
            <dd>{formatDate(reg.purchaseDate) ?? '—'}</dd>

            <dt>{tr('installationDate')}</dt>
            <dd>{formatDate(reg.installationDate) ?? '—'}</dd>

            <dt>{tr('dealerName')}</dt>
            <dd>{reg.dealerName || '—'}</dd>

            <dt>{tr('installationAddressState')}</dt>
            <dd>
              {[reg.installationAddressState, reg.installationAddressDetail]
                .filter(Boolean)
                .join(' ') || '—'}
            </dd>

            <dt>{t('serialNumber')}</dt>
            <dd style={{ fontFamily: 'monospace' }}>{reg.serialNumber || '—'}</dd>
          </dl>

          {(reg.warrantyCardUrl || reg.serialNumberImageUrl) && (
            <div className="member-product__thumbs">
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

          <div className="member-product__actions">
            {reg.status === 'REGISTERED_WITH_WARRANTY' && (
              <Link href={`/warranty/${reg.id}`} className="member-product__action">
                {t('viewWarranty')}
              </Link>
            )}
            {canMutate && (
              <>
                <button
                  type="button"
                  onClick={() => setShowEdit(true)}
                  className="member-product__action member-product__action--ghost"
                >
                  {t('editRegistration')}
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="member-product__action member-product__action--danger"
                >
                  {t('deleteRegistration')}
                </button>
              </>
            )}
          </div>
        </div>
      </article>

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
    <button type="button" onClick={onClick} className="member-product__thumb" title={label}>
      <Image src={url} alt={label} fill sizes="96px" />
      <span className="member-product__thumb-label">{label}</span>
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
            {JP_PREFECTURES.map((p) => (
              <option key={p} value={p}>
                {p}
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
