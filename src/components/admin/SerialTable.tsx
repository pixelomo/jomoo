'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { SERIAL_STATUSES, SERIAL_STATUS_META, type SerialStatus } from '@/lib/serialStatus'

export interface SerialRow {
  id: string
  serialNumber: string
  series: string | null
  modelName: string | null
  batch: string | null
  status: string
  registrationId: string | null
  boundUserName: string | null
  boundUserEmail: string | null
  boundAt: string | null
  createdAt: string | null
}

interface Props {
  rows: SerialRow[]
  permissions: { export: boolean; delete: boolean }
}

export default function SerialTable({ rows, permissions }: Props) {
  const router = useRouter()
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [status, setStatus] = useState<SerialStatus>('REVOKED')
  const [busy, setBusy] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [message, setMessage] = useState<{ tone: 'ok' | 'error'; text: string } | null>(null)

  const allSelected = rows.length > 0 && selected.size === rows.length
  const ids = useMemo(() => [...selected], [selected])

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(rows.map((r) => r.id)))
  }

  async function runBatch(body: Record<string, unknown>, describe: (data: never) => string) {
    setBusy(true)
    setMessage(null)
    try {
      const res = await fetch('/api/admin/serials/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...body, ids }),
      })
      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        setMessage({
          tone: 'error',
          text:
            res.status === 403
              ? 'Your role cannot delete serial numbers.'
              : 'Could not apply that. Please try again.',
        })
        return
      }

      setSelected(new Set())
      setMessage({ tone: 'ok', text: describe(data as never) })
      router.refresh()
    } catch {
      setMessage({ tone: 'error', text: 'Could not reach the server.' })
    } finally {
      setBusy(false)
      setConfirmDelete(false)
    }
  }

  return (
    <div>
      {/* Batch toolbar — only present once something is selected, so the table
          is not permanently topped by controls that do nothing. */}
      {selected.size > 0 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            flexWrap: 'wrap',
            padding: '12px 16px',
            marginBottom: 12,
            background: 'var(--accent-soft, #eef4ff)',
            border: '1px solid #b3ceff',
            borderRadius: 10,
          }}
        >
          <strong style={{ fontSize: 13, color: 'var(--ink)' }}>
            {selected.size} selected
          </strong>

          <span style={{ fontSize: 13, color: 'var(--ink-2)' }}>Set status to</span>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as SerialStatus)}
            style={{
              padding: '6px 10px',
              border: '1px solid var(--line)',
              borderRadius: 6,
              fontSize: 13,
              background: 'var(--paper)',
              color: 'var(--ink)',
            }}
          >
            {SERIAL_STATUSES.map((s) => (
              <option key={s} value={s}>{SERIAL_STATUS_META[s].label}</option>
            ))}
          </select>

          <button
            type="button"
            disabled={busy}
            onClick={() =>
              runBatch({ action: 'status', status }, (d: { updated: number }) =>
                d.updated
                  ? `${d.updated} serial${d.updated === 1 ? '' : 's'} set to ${SERIAL_STATUS_META[status].label}.`
                  : 'Nothing to change — they were already at that status.'
              )
            }
            style={primaryButton(busy)}
          >
            Apply
          </button>

          {permissions.delete && (
            <button
              type="button"
              disabled={busy}
              onClick={() => setConfirmDelete(true)}
              style={dangerButton(busy)}
            >
              Delete selected
            </button>
          )}

          <button
            type="button"
            onClick={() => setSelected(new Set())}
            style={{
              marginLeft: 'auto',
              background: 'transparent',
              border: 0,
              fontSize: 13,
              color: 'var(--ink-3)',
              cursor: 'pointer',
            }}
          >
            Clear
          </button>
        </div>
      )}

      {message && (
        <p
          role="status"
          style={{
            fontSize: 13,
            margin: '0 0 12px',
            color: message.tone === 'ok' ? '#2e7d32' : '#c62828',
          }}
        >
          {message.text}
        </p>
      )}

      <div
        style={{
          background: 'var(--paper)',
          border: '1px solid var(--line)',
          borderRadius: 10,
          overflowX: 'auto',
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--line)', background: 'var(--bg-soft)' }}>
              <th style={{ ...headCell, width: 36 }}>
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleAll}
                  aria-label="Select all on this page"
                  style={{ width: 15, height: 15 }}
                />
              </th>
              {['Serial Number', 'Model', 'Batch', 'Status', 'Registered by', 'Added', ''].map((h) => (
                <th key={h} style={headCell}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={8} style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--ink-3)' }}>
                  No serial numbers found
                </td>
              </tr>
            )}
            {rows.map((r) => (
              <tr
                key={r.id}
                style={{
                  borderBottom: '1px solid var(--line-2)',
                  background: selected.has(r.id) ? 'var(--bg-soft)' : 'transparent',
                }}
              >
                <td style={cell}>
                  <input
                    type="checkbox"
                    checked={selected.has(r.id)}
                    onChange={() => toggle(r.id)}
                    aria-label={`Select ${r.serialNumber}`}
                    style={{ width: 15, height: 15 }}
                  />
                </td>
                <td style={{ ...cell, fontFamily: 'monospace', fontSize: 12, color: 'var(--ink)' }}>
                  {r.serialNumber}
                </td>
                <td style={{ ...cell, color: 'var(--ink-2)' }}>
                  {r.modelName ?? '—'}
                  {r.series && (
                    <span style={{ display: 'block', fontSize: 11, color: 'var(--ink-3)' }}>{r.series}</span>
                  )}
                </td>
                <td style={{ ...cell, color: 'var(--ink-3)' }}>{r.batch ?? '—'}</td>
                <td style={cell}><Badge status={r.status} /></td>
                <td style={cell}>
                  {r.boundUserName ? (
                    <>
                      <span style={{ color: 'var(--ink-2)' }}>{r.boundUserName}</span>
                      <span style={{ display: 'block', fontSize: 11, color: 'var(--ink-3)' }}>
                        {r.boundUserEmail}
                      </span>
                    </>
                  ) : (
                    <span style={{ color: 'var(--ink-3)' }}>—</span>
                  )}
                </td>
                <td style={{ ...cell, color: 'var(--ink-3)', whiteSpace: 'nowrap' }}>
                  {r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-AU') : '—'}
                </td>
                <td style={cell}>
                  <Link
                    href={`/admin/serials/${r.id}`}
                    style={{ fontSize: 12, color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}
                  >
                    Details →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {confirmDelete && (
        <div style={overlay}>
          <div style={dialog}>
            <h3 style={{ margin: '0 0 12px', fontSize: 16, fontWeight: 700, color: 'var(--ink)' }}>
              Delete {selected.size} serial number{selected.size === 1 ? '' : 's'}?
            </h3>
            <p style={{ margin: '0 0 20px', fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.6 }}>
              They are removed from the library for good. The audit log keeps a record of what was
              deleted and by whom.
            </p>
            <p style={{ margin: '0 0 20px', fontSize: 13, color: 'var(--ink-3)', lineHeight: 1.6 }}>
              To withdraw a serial without losing its history, set it to{' '}
              <strong>Revoked</strong> instead.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="button" onClick={() => setConfirmDelete(false)} style={quietButton}>
                Cancel
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() =>
                  runBatch({ action: 'delete' }, (d: { deleted: number }) =>
                    `${d.deleted} serial${d.deleted === 1 ? '' : 's'} deleted.`
                  )
                }
                style={{ ...dangerButton(busy), flex: 1, borderRadius: 6 }}
              >
                {busy ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Badge({ status }: { status: string }) {
  const meta =
    SERIAL_STATUS_META[status as SerialStatus] ??
    { label: status, bg: 'var(--line-2)', color: 'var(--ink-3)', description: '' }
  return (
    <span
      title={meta.description}
      style={{
        display: 'inline-block',
        padding: '2px 8px',
        borderRadius: 20,
        fontSize: 11,
        fontWeight: 600,
        background: meta.bg,
        color: meta.color,
        whiteSpace: 'nowrap',
      }}
    >
      {meta.label}
    </span>
  )
}

const headCell: React.CSSProperties = {
  padding: '10px 16px',
  textAlign: 'left',
  fontWeight: 600,
  color: 'var(--ink-3)',
  fontSize: 12,
}

const cell: React.CSSProperties = { padding: '12px 16px', verticalAlign: 'top' }

const primaryButton = (busy: boolean): React.CSSProperties => ({
  padding: '6px 14px',
  borderRadius: 6,
  border: 0,
  background: 'var(--ink)',
  color: '#fff',
  fontSize: 13,
  fontWeight: 600,
  cursor: busy ? 'not-allowed' : 'pointer',
  opacity: busy ? 0.6 : 1,
})

const dangerButton = (busy: boolean): React.CSSProperties => ({
  padding: '6px 14px',
  borderRadius: 6,
  border: '1px solid var(--warn, #c62828)',
  background: 'transparent',
  color: 'var(--warn, #c62828)',
  fontSize: 13,
  fontWeight: 600,
  cursor: busy ? 'not-allowed' : 'pointer',
  opacity: busy ? 0.6 : 1,
})

const quietButton: React.CSSProperties = {
  flex: 1,
  padding: '9px 0',
  background: 'var(--bg-soft)',
  border: '1px solid var(--line)',
  borderRadius: 6,
  fontSize: 14,
  cursor: 'pointer',
  color: 'var(--ink-2)',
}

const overlay: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0,0,0,0.45)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 100,
  padding: 16,
}

const dialog: React.CSSProperties = {
  background: 'var(--paper)',
  borderRadius: 10,
  padding: 32,
  maxWidth: 440,
  width: '100%',
  boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
}
