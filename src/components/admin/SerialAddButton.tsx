'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { SERIAL_STATUSES, SERIAL_STATUS_META, type SerialStatus } from '@/lib/serialStatus'
import { SERIAL_DIGITS_BY_SERIES, maskSerialInput } from '@/lib/serialValidation'

const SERIES = Object.keys(SERIAL_DIGITS_BY_SERIES)

/** Adds one serial by hand — for the ones that arrive by phone, not by file. */
export default function SerialAddButton() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [serialNumber, setSerialNumber] = useState('')
  const [series, setSeries] = useState('')
  const [modelName, setModelName] = useState('')
  const [batch, setBatch] = useState('')
  const [status, setStatus] = useState<SerialStatus>('UNUSED')
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function reset() {
    setSerialNumber('')
    setModelName('')
    setNote('')
    setError('')
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/admin/serials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serialNumber,
          series: series || null,
          modelName: modelName || null,
          batch: batch || null,
          status,
          note: note || null,
        }),
      })
      const body = await res.json().catch(() => ({}))

      if (!res.ok) {
        setError(
          body.error === 'SERIAL_EXISTS'
            ? 'That serial number is already in the library.'
            : body.error === 'INVALID_FORMAT'
              ? `Not a valid serial for that series — expected J followed by ${
                  SERIAL_DIGITS_BY_SERIES[series] ?? 19
                } digits.`
              : 'Could not add it. Please check the details and try again.'
        )
        return
      }

      reset()
      setOpen(false)
      router.refresh()
    } catch {
      setError('Could not reach the server.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} style={outlineButton}>
        + Add serial
      </button>

      {open && (
        <div style={overlay} onClick={() => !saving && setOpen(false)}>
          <div style={dialog} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 20px', fontSize: 16, fontWeight: 700, color: 'var(--ink)' }}>
              Add a serial number
            </h3>

            <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <Field label="Serial number">
                <input
                  value={serialNumber}
                  // Masked as it is typed so a symbol or a 21st character simply
                  // cannot be entered, rather than failing on submit.
                  onChange={(e) => setSerialNumber(maskSerialInput(e.target.value, series || null))}
                  placeholder="J0000000000000000000"
                  required
                  autoFocus
                  style={{ ...input, fontFamily: 'monospace' }}
                />
              </Field>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Field label="Series">
                  <select value={series} onChange={(e) => setSeries(e.target.value)} style={input}>
                    <option value="">— Not specified —</option>
                    {SERIES.map((s) => (
                      <option key={s} value={s}>
                        {s} ({SERIAL_DIGITS_BY_SERIES[s]} digits)
                      </option>
                    ))}
                  </select>
                </Field>
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
                </Field>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Field label="Model name">
                  <input value={modelName} onChange={(e) => setModelName(e.target.value)} style={input} />
                </Field>
                <Field label="Batch">
                  <input
                    value={batch}
                    onChange={(e) => setBatch(e.target.value)}
                    placeholder="Delivery note no."
                    style={input}
                  />
                </Field>
              </div>

              <Field label="Note">
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={2}
                  style={{ ...input, resize: 'vertical' }}
                />
              </Field>

              {error && <p style={{ fontSize: 13, color: 'var(--warn, #c62828)', margin: 0 }}>{error}</p>}

              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  disabled={saving}
                  style={quietButton}
                >
                  Cancel
                </button>
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
                  {saving ? 'Adding…' : 'Add serial'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
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

const outlineButton: React.CSSProperties = {
  padding: '9px 16px',
  borderRadius: 8,
  border: '1px solid var(--line)',
  background: 'var(--paper)',
  color: 'var(--ink-2)',
  fontSize: 13,
  fontWeight: 600,
  cursor: 'pointer',
  whiteSpace: 'nowrap',
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
  maxWidth: 520,
  width: '100%',
  maxHeight: '90vh',
  overflowY: 'auto',
  boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
}
