'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Row {
  key: string
  label: string
  description: string
  enabled: boolean
  ccAddresses: string
}

export default function NotificationSettingsForm({ notifications }: { notifications: Row[] }) {
  const router = useRouter()
  const [rows, setRows] = useState(notifications)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ tone: 'ok' | 'error'; text: string } | null>(null)

  const update = (key: string, patch: Partial<Row>) =>
    setRows((r) => r.map((row) => (row.key === key ? { ...row, ...patch } : row)))

  const save = async () => {
    setSaving(true)
    setMessage(null)
    const res = await fetch('/api/admin/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        settings: rows.map((r) => ({
          key: r.key,
          enabled: r.enabled,
          ccAddresses: r.ccAddresses,
        })),
      }),
    })
    const body = await res.json().catch(() => ({}))
    setSaving(false)

    if (!res.ok) {
      setMessage({
        tone: 'error',
        text:
          body.error === 'invalid_email'
            ? `Not a valid email address: ${body.detail}`
            : 'Could not save. Please try again.',
      })
      return
    }

    setMessage({ tone: 'ok', text: 'Saved.' })
    router.refresh()
  }

  return (
    <div style={{ maxWidth: 760 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {rows.map((row) => (
          <div
            key={row.key}
            style={{
              background: 'var(--paper)',
              border: '1px solid var(--line)',
              borderRadius: 10,
              padding: '18px 20px',
              opacity: row.enabled ? 1 : 0.6,
            }}
          >
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={row.enabled}
                onChange={(e) => update(row.key, { enabled: e.target.checked })}
                style={{ marginTop: 3, width: 16, height: 16, flexShrink: 0 }}
              />
              <span>
                <span style={{ display: 'block', fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>
                  {row.label}
                </span>
                <span style={{ display: 'block', fontSize: 12, color: 'var(--ink-3)', marginTop: 2 }}>
                  {row.description}
                </span>
              </span>
            </label>

            <div style={{ marginTop: 14, paddingLeft: 28 }}>
              <label
                htmlFor={`cc-${row.key}`}
                style={{ display: 'block', fontSize: 12, color: 'var(--ink-3)', marginBottom: 5 }}
              >
                CC operational staff — separate several with commas
              </label>
              <input
                id={`cc-${row.key}`}
                type="text"
                value={row.ccAddresses}
                onChange={(e) => update(row.key, { ccAddresses: e.target.value })}
                placeholder="ops@jomoogroup.com"
                disabled={!row.enabled}
                style={{
                  width: '100%',
                  padding: '8px 11px',
                  border: '1px solid var(--line)',
                  borderRadius: 6,
                  fontSize: 13,
                  color: 'var(--ink)',
                  background: row.enabled ? 'var(--paper)' : 'var(--bg-soft)',
                }}
              />
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 22 }}>
        <button
          type="button"
          onClick={save}
          disabled={saving}
          style={{
            padding: '10px 22px',
            border: 0,
            borderRadius: 8,
            background: 'var(--ink)',
            color: '#fff',
            fontSize: 13,
            fontWeight: 600,
            cursor: saving ? 'not-allowed' : 'pointer',
            opacity: saving ? 0.6 : 1,
          }}
        >
          {saving ? 'Saving…' : 'Save changes'}
        </button>
        {message && (
          <span
            role="status"
            style={{ fontSize: 13, color: message.tone === 'ok' ? '#2e7d32' : '#c62828' }}
          >
            {message.text}
          </span>
        )}
      </div>
    </div>
  )
}
