'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { renderTemplate } from '@/lib/emailRender'
import type { AdminTemplate } from '@/lib/emailTemplateDefs'

interface Props {
  /** Every template belonging to the notification that was clicked. */
  templates: AdminTemplate[]
  onClose: () => void
}

/**
 * Edits the wording of one automatic email.
 *
 * A notification such as 製品登録 covers several actual emails (received,
 * returned, approved), so the modal offers them as tabs rather than pretending
 * one body of text serves all three.
 */
export default function EmailTemplateModal({ templates, onClose }: Props) {
  const router = useRouter()
  const [activeId, setActiveId] = useState(templates[0].id)
  const active = templates.find((t) => t.id === activeId) ?? templates[0]

  const [draft, setDraft] = useState<Record<string, { subject: string; greeting: string; body: string }>>(
    () =>
      Object.fromEntries(
        templates.map((t) => [t.id, { subject: t.subject, greeting: t.greeting, body: t.body }])
      )
  )
  const [pane, setPane] = useState<'preview' | 'html'>('preview')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ tone: 'ok' | 'error'; text: string } | null>(null)

  const current = draft[active.id]

  const dirty = templates.some(
    (t) =>
      draft[t.id].subject !== t.subject ||
      draft[t.id].greeting !== t.greeting ||
      draft[t.id].body !== t.body
  )

  const update = (patch: Partial<{ subject: string; greeting: string; body: string }>) => {
    setMessage(null)
    setDraft((d) => ({ ...d, [active.id]: { ...d[active.id], ...patch } }))
  }

  // The preview runs the same renderer the send path uses, so what is on screen
  // is the email, not an approximation of it.
  const preview = useMemo(
    () =>
      renderTemplate(
        active,
        current,
        Object.fromEntries(active.variables.map((v) => [v.name, v.sample])),
        // The footer wordmark is served from this same origin in the admin,
        // so the preview shows the real image rather than a broken one.
        typeof window === 'undefined' ? '' : `${window.location.origin}/images/logo-email.png`
      ),
    [active, current]
  )

  async function save() {
    setSaving(true)
    setMessage(null)
    try {
      const changed = templates.filter(
        (t) =>
          draft[t.id].subject !== t.subject ||
          draft[t.id].greeting !== t.greeting ||
          draft[t.id].body !== t.body
      )

      for (const t of changed) {
        const res = await fetch('/api/admin/email-templates', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: t.id, ...draft[t.id] }),
        })
        const data = await res.json().catch(() => ({}))
        if (!res.ok) {
          setMessage({
            tone: 'error',
            text:
              data.error === 'unknown_variables'
                ? `${t.label}: no such variable — ${data.detail}. Use one of the tags listed below the body.`
                : `Could not save ${t.label}.`,
          })
          return
        }
      }

      setMessage({ tone: 'ok', text: 'Saved. New emails will use this wording.' })
      router.refresh()
    } catch {
      setMessage({ tone: 'error', text: 'Could not reach the server.' })
    } finally {
      setSaving(false)
    }
  }

  async function reset() {
    setSaving(true)
    setMessage(null)
    try {
      const res = await fetch('/api/admin/email-templates', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: active.id }),
      })
      if (!res.ok) {
        setMessage({ tone: 'error', text: 'Could not reset.' })
        return
      }
      setDraft((d) => ({
        ...d,
        [active.id]: {
          subject: active.defaultSubject,
          greeting: active.defaultGreeting,
          body: active.defaultBody,
        },
      }))
      setMessage({ tone: 'ok', text: 'Reset to the wording this site shipped with.' })
      router.refresh()
    } catch {
      setMessage({ tone: 'error', text: 'Could not reach the server.' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={overlay} onClick={() => !saving && onClose()}>
      <div style={dialog} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <header style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 16 }}>
          <div style={{ minWidth: 0 }}>
            <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: 'var(--ink)' }}>
              {active.label}
            </h2>
            <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--ink-3)', lineHeight: 1.5 }}>
              {active.description}
              {active.edited && active.updatedBy && (
                <> — edited by {active.updatedBy}</>
              )}
            </p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" style={closeButton}>×</button>
        </header>

        {templates.length > 1 && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
            {templates.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveId(t.id)}
                style={{
                  padding: '5px 12px',
                  borderRadius: 6,
                  fontSize: 12,
                  fontWeight: t.id === activeId ? 600 : 400,
                  color: t.id === activeId ? 'var(--accent)' : 'var(--ink-3)',
                  background: t.id === activeId ? 'var(--accent-soft, #eef4ff)' : 'transparent',
                  border: `1px solid ${t.id === activeId ? '#b3ceff' : 'var(--line)'}`,
                  cursor: 'pointer',
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        )}

        <div style={split}>
          <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <label>
              <span style={label}>Subject</span>
              <input
                value={current.subject}
                onChange={(e) => update({ subject: e.target.value })}
                style={input}
              />
            </label>

            {active.wrapper === 'standard' && (
              <label>
                <span style={label}>Greeting</span>
                <input
                  value={current.greeting}
                  onChange={(e) => update({ greeting: e.target.value })}
                  style={input}
                />
              </label>
            )}

            <label>
              <span style={label}>Body — one paragraph per line</span>
              <textarea
                value={current.body}
                onChange={(e) => update({ body: e.target.value })}
                rows={10}
                style={{ ...input, fontFamily: 'monospace', fontSize: 12, lineHeight: 1.7, resize: 'vertical' }}
              />
            </label>

            <div>
              <p style={{ ...label, marginBottom: 6 }}>Available tags — click to copy</p>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {active.variables.map((v) => (
                  <button
                    key={v.name}
                    type="button"
                    title={`${v.description} — e.g. ${v.sample}`}
                    onClick={() =>
                      navigator.clipboard?.writeText(v.raw ? `{{{${v.name}}}}` : `{{${v.name}}}`)
                    }
                    style={tag}
                  >
                    {v.raw ? `{{{${v.name}}}}` : `{{${v.name}}}`}
                    <span style={{ color: 'var(--ink-3)', fontWeight: 400, marginLeft: 6 }}>
                      {v.description}
                    </span>
                  </button>
                ))}
              </div>
              <p style={{ fontSize: 11, color: 'var(--ink-3)', margin: '8px 0 0', lineHeight: 1.6 }}>
                HTML is allowed in the body. The header, footer and layout are fixed, so a mistake
                in the wording cannot break the rest of the email.
              </p>
            </div>
          </div>

          {/* Updates as you type, so the wording is never saved unseen. */}
          <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              {(['preview', 'html'] as const).map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setPane(k)}
                  style={{
                    padding: '4px 11px',
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: pane === k ? 600 : 400,
                    color: pane === k ? 'var(--accent)' : 'var(--ink-3)',
                    background: pane === k ? 'var(--accent-soft, #eef4ff)' : 'transparent',
                    border: `1px solid ${pane === k ? '#b3ceff' : 'var(--line)'}`,
                    cursor: 'pointer',
                  }}
                >
                  {k === 'preview' ? 'Preview' : 'HTML'}
                </button>
              ))}
              <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--ink-3)' }}>
                example values shown
              </span>
            </div>

            <p style={{ fontSize: 12, color: 'var(--ink-3)', margin: '0 0 8px', wordBreak: 'break-word' }}>
              Subject: <strong style={{ color: 'var(--ink-2)' }}>{preview.subject}</strong>
            </p>

            {pane === 'preview' ? (
              <iframe
                // Sandboxed: the preview renders the admin's own HTML, and it
                // has no reason to run scripts or reach the page around it.
                sandbox=""
                srcDoc={preview.html}
                title={`${active.label} preview`}
                style={{
                  width: '100%',
                  flex: 1,
                  minHeight: 460,
                  border: '1px solid var(--line)',
                  borderRadius: 8,
                  background: '#f4f4f5',
                }}
              />
            ) : (
              <textarea
                readOnly
                value={preview.html}
                onFocus={(e) => e.currentTarget.select()}
                style={{
                  width: '100%',
                  flex: 1,
                  minHeight: 460,
                  padding: '10px 12px',
                  border: '1px solid var(--line)',
                  borderRadius: 8,
                  background: 'var(--bg-soft)',
                  fontFamily: 'monospace',
                  fontSize: 11,
                  lineHeight: 1.6,
                  color: 'var(--ink-2)',
                  resize: 'none',
                  boxSizing: 'border-box',
                }}
              />
            )}
          </div>
        </div>

        {message && (
          <p
            role="status"
            style={{
              fontSize: 13,
              margin: '16px 0 0',
              color: message.tone === 'ok' ? '#2e7d32' : 'var(--warn, #c62828)',
            }}
          >
            {message.text}
          </p>
        )}

        <footer style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 20 }}>
          <button
            type="button"
            onClick={reset}
            disabled={saving || !active.edited}
            title={active.edited ? undefined : 'This email has not been edited.'}
            style={{ ...quietButton, opacity: active.edited ? 1 : 0.5, cursor: active.edited ? 'pointer' : 'not-allowed' }}
          >
            Reset to default
          </button>
          <span style={{ flex: 1 }} />
          <button type="button" onClick={onClose} disabled={saving} style={quietButton}>
            Close
          </button>
          <button
            type="button"
            onClick={save}
            disabled={saving || !dirty}
            style={{
              padding: '9px 22px',
              border: 0,
              borderRadius: 8,
              background: 'var(--ink)',
              color: '#fff',
              fontSize: 13,
              fontWeight: 600,
              cursor: saving || !dirty ? 'not-allowed' : 'pointer',
              opacity: saving || !dirty ? 0.5 : 1,
            }}
          >
            {saving ? 'Saving…' : 'Save wording'}
          </button>
        </footer>
      </div>
    </div>
  )
}

const label: React.CSSProperties = {
  display: 'block',
  fontSize: 13,
  fontWeight: 500,
  color: 'var(--ink-2)',
  marginBottom: 4,
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

const tag: React.CSSProperties = {
  padding: '4px 10px',
  borderRadius: 6,
  border: '1px solid var(--line)',
  background: 'var(--bg-soft)',
  fontSize: 11,
  fontFamily: 'monospace',
  fontWeight: 600,
  color: 'var(--ink-2)',
  cursor: 'pointer',
}

const quietButton: React.CSSProperties = {
  padding: '9px 18px',
  background: 'var(--bg-soft)',
  border: '1px solid var(--line)',
  borderRadius: 8,
  fontSize: 13,
  fontWeight: 600,
  cursor: 'pointer',
  color: 'var(--ink-2)',
}

const closeButton: React.CSSProperties = {
  marginLeft: 'auto',
  background: 'transparent',
  border: 0,
  fontSize: 24,
  lineHeight: 1,
  color: 'var(--ink-3)',
  cursor: 'pointer',
  padding: 0,
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

/* Editor and preview side by side; stacked once there is no room for two. */
const split: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
  gap: 24,
  alignItems: 'start',
}

const dialog: React.CSSProperties = {
  background: 'var(--paper)',
  borderRadius: 12,
  padding: 28,
  maxWidth: 1120,
  width: '100%',
  maxHeight: '92vh',
  overflowY: 'auto',
  boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
}
