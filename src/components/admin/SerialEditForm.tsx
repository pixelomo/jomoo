'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { SERIAL_STATUSES, SERIAL_STATUS_META, type SerialStatus } from '@/lib/serialStatus'
import { SERIAL_DIGITS_BY_SERIES } from '@/lib/serialValidation'

const SERIES = Object.keys(SERIAL_DIGITS_BY_SERIES)

interface Props {
  id: string
  serialNumber: string
  initial: {
    series: string | null
    modelName: string | null
    batch: string | null
    status: string
    note: string | null
  }
  permissions: { delete: boolean }
}

export default function SerialEditForm({ id, serialNumber, initial, permissions }: Props) {
  const router = useRouter()
  const [series, setSeries] = useState(initial.series ?? '')
  const [modelName, setModelName] = useState(initial.modelName ?? '')
  const [batch, setBatch] = useState(initial.batch ?? '')
  const [status, setStatus] = useState<SerialStatus>(initial.status as SerialStatus)
  const [note, setNote] = useState(initial.note ?? '')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ tone: 'ok' | 'error'; text: string } | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const leavingBound = initial.status === 'BOUND' && status !== 'BOUND'

  async function save(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setMessage(null)
    try {
      const res = await fetch(`/api/admin/serials/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          series: series || null,
          modelName: modelName || null,
          batch: batch || null,
          status,
          note: note || null,
        }),
      })
      const body = await res.json().catch(() => ({}))

      if (!res.ok) {
        setMessage({ tone: 'error', text: 'Could not save. Please try again.' })
        return
      }

      setMessage({
        tone: 'ok',
        text: body.changed ? 'Saved — the change is in the audit log.' : 'Nothing changed.',
      })
      router.refresh()
    } catch {
      setMessage({ tone: 'error', text: 'Could not reach the server.' })
    } finally {
      setSaving(false)
    }
  }

  async function remove() {
    setDeleting(true)
    try {
      const res = await fetch(`/api/admin/serials/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        setMessage({
          tone: 'error',
          text: res.status === 403 ? 'Your role cannot delete serial numbers.' : 'Delete failed.',
        })
        setDeleting(false)
        setConfirmDelete(false)
        return
      }
      router.push('/admin/serials')
      router.refresh()
    } catch {
      setMessage({ tone: 'error', text: 'Could not reach the server.' })
      setDeleting(false)
    }
  }

  return (
    <div style={{ background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 10, padding: 24 }}>
      <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)', margin: '0 0 20px' }}>
        Edit
      </h2>

      <form onSubmit={save} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Field label="Status">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as SerialStatus)}
            style={input}
          >
            {SERIAL_STATUSES.map((s) => (
              <option key={s} value={s}>{SERIAL_STATUS_META[s].label}</option>
            ))}
          </select>
          <span style={{ display: 'block', fontSize: 11, color: 'var(--ink-3)', marginTop: 4 }}>
            {SERIAL_STATUS_META[status]?.description}
          </span>
        </Field>

        {leavingBound && (
          <p
            style={{
              margin: 0,
              padding: '10px 12px',
              background: '#fff8e1',
              border: '1px solid #ffe082',
              borderRadius: 6,
              fontSize: 12,
              color: '#8d6e00',
              lineHeight: 1.5,
            }}
          >
            Moving this off <strong>Bound</strong> also releases it from its registration, so the
            product can be registered again. The registration itself is not touched.
          </p>
        )}

        <Field label="Series">
          <select value={series} onChange={(e) => setSeries(e.target.value)} style={input}>
            <option value="">— Not specified —</option>
            {SERIES.map((s) => (
              <option key={s} value={s}>{s} ({SERIAL_DIGITS_BY_SERIES[s]} digits)</option>
            ))}
          </select>
        </Field>

        <Field label="Model name">
          <input value={modelName} onChange={(e) => setModelName(e.target.value)} style={input} />
        </Field>

        <Field label="Batch">
          <input value={batch} onChange={(e) => setBatch(e.target.value)} style={input} />
        </Field>

        <Field label="Note">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            placeholder="Why it was revoked, what looked abnormal…"
            style={{ ...input, resize: 'vertical' }}
          />
        </Field>

        {message && (
          <p
            role="status"
            style={{ fontSize: 13, margin: 0, color: message.tone === 'ok' ? '#2e7d32' : 'var(--warn, #c62828)' }}
          >
            {message.text}
          </p>
        )}

        <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
          <button
            type="submit"
            disabled={saving}
            style={{
              flex: 1,
              padding: '9px 0',
              background: saving ? 'var(--ink-3)' : 'var(--ink)',
              color: '#fff',
              border: 0,
              borderRadius: 6,
              fontSize: 14,
              fontWeight: 600,
              cursor: saving ? 'not-allowed' : 'pointer',
            }}
          >
            {saving ? 'Saving…' : 'Save changes'}
          </button>
          {permissions.delete && (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              style={{
                padding: '9px 16px',
                background: 'transparent',
                color: 'var(--warn, #c62828)',
                border: '1px solid var(--warn, #c62828)',
                borderRadius: 6,
                fontSize: 14,
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              Delete
            </button>
          )}
        </div>
      </form>

      {confirmDelete && (
        <div style={overlay}>
          <div style={dialog}>
            <h3 style={{ margin: '0 0 12px', fontSize: 16, fontWeight: 700, color: 'var(--ink)' }}>
              Delete this serial number?
            </h3>
            <p style={{ margin: '0 0 16px', fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.6 }}>
              <code style={{ fontFamily: 'monospace' }}>{serialNumber}</code> is removed from the
              library for good. The audit log keeps a record of the deletion.
            </p>
            <p style={{ margin: '0 0 24px', fontSize: 13, color: 'var(--ink-3)', lineHeight: 1.6 }}>
              To withdraw it while keeping its history, set the status to <strong>Revoked</strong>
              {' '}instead.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="button" onClick={() => setConfirmDelete(false)} style={quietButton}>
                Cancel
              </button>
              <button
                type="button"
                onClick={remove}
                disabled={deleting}
                style={{
                  flex: 1,
                  padding: '9px 0',
                  background: 'var(--warn, #c62828)',
                  color: '#fff',
                  border: 0,
                  borderRadius: 6,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: deleting ? 'not-allowed' : 'pointer',
                }}
              >
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: 'block' }}>
      <span style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--ink-2)', marginBottom: 4 }}>
        {label}
      </span>
      {children}
    </label>
  )
}

const input: React.CSSProperties = {
  padding: '9px 12px',
  border: '1px solid var(--line)',
  borderRadius: 6,
  fontSize: 14,
  color: 'var(--ink)',
  background: 'var(--paper)',
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box',
}

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
