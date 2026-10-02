'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import DownloadButton from '@/components/admin/DownloadButton'
import { PARTNER_STATUS_LABELS, type PartnerStatus } from '@/lib/memberProfile'

export interface PartnerTableRow {
  id: string
  name: string
  email: string
  companyName: string | null
  companyNameKana: string | null
  phoneNumber: string | null
  postalCode: string | null
  prefecture: string | null
  city: string | null
  streetAddress: string | null
  building: string | null
  partnerStatus: string | null
  partnerReviewedAt: string | null
  partnerReviewedBy: string | null
  branchId: string | null
  branchName: string | null
  createdAt: string
}

const STATUS_STYLE: Record<PartnerStatus, React.CSSProperties> = {
  pending: { color: '#92400e', background: '#fffbeb' },
  approved: { color: '#166534', background: '#f0fdf4' },
  rejected: { color: '#991b1b', background: '#fef2f2' },
}

/**
 * The partner list, with approve / reject per row and, across ticked rows,
 * a batch approve and a batch CSV download.
 */
export default function PartnerTable({
  partners,
  exportQuery,
  canExport,
  filtered,
}: {
  partners: PartnerTableRow[]
  /** The page's own filters, so 'Download all' matches what is listed. */
  exportQuery: string
  canExport: boolean
  filtered: boolean
}) {
  const router = useRouter()
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const allSelected = partners.length > 0 && partners.every((p) => selected.has(p.id))

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  async function review(ids: string[], decision: 'approved' | 'rejected') {
    const verb = decision === 'approved' ? 'Approve' : 'Reject'
    const who = ids.length === 1
      ? partners.find((p) => p.id === ids[0])?.companyName ?? 'this applicant'
      : `${ids.length} applicants`
    if (!confirm(`${verb} ${who}? The member is emailed the result.`)) return

    setBusy(ids.length === 1 ? ids[0] : 'batch')
    setError(null)
    const failed: string[] = []
    for (const id of ids) {
      const res = await fetch(`/api/admin/partners/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision }),
      }).catch(() => null)
      if (!res?.ok) failed.push(id)
    }
    setBusy(null)
    if (failed.length) setError(`${failed.length} could not be updated. Try again.`)
    setSelected(new Set())
    router.refresh()
  }

  const selectedIds = [...selected].filter((id) => partners.some((p) => p.id === id))
  const allHref = `/api/admin/export/partners${exportQuery ? `?${exportQuery}` : ''}`
  const selectedHref = `/api/admin/export/partners?ids=${selectedIds.join(',')}`

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginTop: 16 }}>
        <span style={{ fontSize: 13, color: 'var(--ink-3)', marginRight: 'auto' }}>
          {selectedIds.length ? `${selectedIds.length} selected` : 'Tick rows to act on several at once'}
        </span>
        {selectedIds.length > 0 && (
          <>
            <button
              type="button"
              disabled={busy !== null}
              onClick={() => review(selectedIds, 'approved')}
              style={actionBtn('#166534')}
            >
              Approve selected
            </button>
            {canExport && <DownloadButton href={selectedHref} label="Download selected" variant="outline" />}
          </>
        )}
        {canExport && (
          <DownloadButton href={allHref} label={filtered ? 'Download filtered CSV' : 'Download all CSV'} />
        )}
      </div>

      {error && <p style={{ color: '#b91c1c', fontSize: 13, margin: '10px 0 0' }}>{error}</p>}

      <div style={{
        background: 'var(--paper)',
        border: '1px solid var(--line)',
        borderRadius: 10,
        overflowX: 'auto',
        marginTop: 12,
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--line)', background: 'var(--bg-soft)' }}>
              <th style={{ ...th, width: 36 }}>
                <input
                  type="checkbox"
                  aria-label="Select all"
                  checked={allSelected}
                  onChange={() => setSelected(allSelected ? new Set() : new Set(partners.map((p) => p.id)))}
                />
              </th>
              {['Status', 'Company', 'Contact', 'Address', 'Applied', 'Review', ''].map((h) => (
                <th key={h} style={th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {partners.length === 0 && (
              <tr>
                <td colSpan={8} style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--ink-3)' }}>
                  {filtered ? 'No partners match' : 'No パートナー applications yet'}
                </td>
              </tr>
            )}
            {partners.map((p) => {
              const status = (p.partnerStatus ?? 'pending') as PartnerStatus
              const address = [
                p.postalCode && `〒${p.postalCode}`,
                p.prefecture,
                p.city,
                p.streetAddress,
                p.building,
              ].filter(Boolean).join(' ')
              return (
                <tr key={p.id} style={{ borderBottom: '1px solid var(--line-2)', verticalAlign: 'top' }}>
                  <td style={td}>
                    <input
                      type="checkbox"
                      aria-label={`Select ${p.companyName ?? p.email}`}
                      checked={selected.has(p.id)}
                      onChange={() => toggle(p.id)}
                    />
                  </td>
                  <td style={td}>
                    <span style={{ ...badge, ...STATUS_STYLE[status] }}>{PARTNER_STATUS_LABELS[status]}</span>
                  </td>
                  <td style={{ ...td, minWidth: 180 }}>
                    <div style={{ fontWeight: 600, color: 'var(--ink)' }}>{p.companyName ?? '—'}</div>
                    {p.companyNameKana && <div style={sub}>{p.companyNameKana}</div>}
                    {p.branchId && (
                      <Link href={`/admin/dealers/${p.branchId}`} style={{ ...sub, color: 'var(--accent)', textDecoration: 'none' }}>
                        販売店: {p.branchName ?? 'view'} →
                      </Link>
                    )}
                  </td>
                  <td style={{ ...td, minWidth: 180 }}>
                    <div style={{ color: 'var(--ink)' }}>{p.name}</div>
                    <div style={sub}>{p.email}</div>
                    {p.phoneNumber && <div style={sub}>{p.phoneNumber}</div>}
                  </td>
                  <td style={{ ...td, minWidth: 200, color: 'var(--ink-2)' }}>{address || '—'}</td>
                  <td style={{ ...td, whiteSpace: 'nowrap', color: 'var(--ink-3)' }}>
                    {new Date(p.createdAt).toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo', dateStyle: 'short', timeStyle: 'short' })}
                  </td>
                  <td style={{ ...td, whiteSpace: 'nowrap', color: 'var(--ink-3)' }}>
                    {p.partnerReviewedAt
                      ? <>
                          {new Date(p.partnerReviewedAt).toLocaleDateString('ja-JP', { timeZone: 'Asia/Tokyo' })}
                          {p.partnerReviewedBy && <div style={sub}>{p.partnerReviewedBy}</div>}
                        </>
                      : '—'}
                  </td>
                  <td style={{ ...td, whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      {status !== 'approved' && (
                        <button type="button" disabled={busy !== null} onClick={() => review([p.id], 'approved')} style={actionBtn('#166534')}>
                          Approve
                        </button>
                      )}
                      {status !== 'rejected' && (
                        <button type="button" disabled={busy !== null} onClick={() => review([p.id], 'rejected')} style={actionBtn('#b91c1c', true)}>
                          {status === 'approved' ? 'Revoke' : 'Reject'}
                        </button>
                      )}
                      <Link href={`/admin/users/${p.id}`} style={{ fontSize: 12, fontWeight: 500, color: 'var(--accent)', textDecoration: 'none' }}>
                        View →
                      </Link>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </>
  )
}

const th: React.CSSProperties = {
  padding: '10px 16px',
  textAlign: 'left',
  fontWeight: 600,
  color: 'var(--ink-3)',
  fontSize: 12,
}
const td: React.CSSProperties = { padding: '12px 16px' }
const sub: React.CSSProperties = { fontSize: 12, color: 'var(--ink-3)', marginTop: 2, display: 'block' }
const badge: React.CSSProperties = {
  display: 'inline-block',
  padding: '3px 9px',
  borderRadius: 999,
  fontSize: 11,
  fontWeight: 600,
  whiteSpace: 'nowrap',
}

function actionBtn(color: string, outline = false): React.CSSProperties {
  return {
    padding: '6px 12px',
    borderRadius: 6,
    border: `1px solid ${color}`,
    background: outline ? 'var(--paper)' : color,
    color: outline ? color : '#fff',
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
  }
}
