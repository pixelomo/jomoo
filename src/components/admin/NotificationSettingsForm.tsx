'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import EmailTemplateModal from '@/components/admin/EmailTemplateModal'
import type { AdminTemplate } from '@/lib/emailTemplateDefs'

interface Row {
  key: string
  label: string
  description: string
  enabled: boolean
  ccAddresses: string
}

export default function NotificationSettingsForm({
  notifications,
  templates,
}: {
  notifications: Row[]
  /** Every editable email, grouped later by the notification it belongs to. */
  templates: AdminTemplate[]
}) {
  const router = useRouter()
  const [rows, setRows] = useState(notifications)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ tone: 'ok' | 'error'; text: string } | null>(null)
  /** Which emails the modal is showing, if any, and a stable key to reset it. */
  const [editing, setEditing] = useState<{ key: string; templates: AdminTemplate[] } | null>(null)

  const templatesFor = (key: string) => templates.filter((t) => t.notification === key)
  /** Emails that are always sent, so they have no on/off row of their own. */
  const unswitched = templates.filter((t) => !t.notification)

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
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer', flex: 1, minWidth: 0 }}>
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

              {templatesFor(row.key).length > 0 && (
                <button
                  type="button"
                  onClick={() => setEditing({ key: row.key, templates: templatesFor(row.key) })}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 6,
                    border: '1px solid var(--line)',
                    background: 'var(--paper)',
                    fontSize: 12,
                    fontWeight: 600,
                    color: 'var(--ink-2)',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                  }}
                >
                  Edit template
                  {templatesFor(row.key).some((t) => t.edited) && (
                    <span
                      title="This wording has been edited"
                      style={{
                        display: 'inline-block',
                        width: 6,
                        height: 6,
                        marginLeft: 7,
                        borderRadius: '50%',
                        background: 'var(--accent, #1565c0)',
                        verticalAlign: 'middle',
                      }}
                    />
                  )}
                </button>
              )}
            </div>

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

      {unswitched.length > 0 && (
        <section style={{ marginTop: 32 }}>
          <h2 style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)', margin: '0 0 4px' }}>
            Always sent
          </h2>
          <p style={{ fontSize: 12, color: 'var(--ink-3)', margin: '0 0 12px', lineHeight: 1.6 }}>
            These are part of signing in and cannot be switched off, but their wording can be
            changed.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {unswitched.map((t) => (
              <div
                key={t.id}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 12,
                  background: 'var(--paper)',
                  border: '1px solid var(--line)',
                  borderRadius: 10,
                  padding: '18px 20px',
                }}
              >
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: 'block', fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>
                    {t.label}
                  </span>
                  <span style={{ display: 'block', fontSize: 12, color: 'var(--ink-3)', marginTop: 2 }}>
                    {t.description}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => setEditing({ key: t.id, templates: [t] })}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 6,
                    border: '1px solid var(--line)',
                    background: 'var(--paper)',
                    fontSize: 12,
                    fontWeight: 600,
                    color: 'var(--ink-2)',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                  }}
                >
                  Edit template
                  {t.edited && (
                    <span
                      title="This wording has been edited"
                      style={{
                        display: 'inline-block',
                        width: 6,
                        height: 6,
                        marginLeft: 7,
                        borderRadius: '50%',
                        background: 'var(--accent, #1565c0)',
                        verticalAlign: 'middle',
                      }}
                    />
                  )}
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {editing && editing.templates.length > 0 && (
        <EmailTemplateModal
          // Keyed on what is being edited, so opening a different row rebuilds
          // the drafts rather than showing the previous email's text.
          key={editing.key}
          templates={editing.templates}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  )
}
