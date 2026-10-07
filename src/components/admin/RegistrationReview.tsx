'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Decision = 'REGISTERED_WITH_WARRANTY' | 'REGISTERED_NO_WARRANTY' | 'RETURNED'

const DECISIONS: { value: Decision; label: string; color: string; confirm: string }[] = [
  {
    value: 'REGISTERED_WITH_WARRANTY',
    label: 'Approve — issue warranty',
    color: '#166534',
    confirm: 'Approve and issue the warranty card? The member is emailed a link to it.',
  },
  {
    value: 'REGISTERED_NO_WARRANTY',
    label: 'Approve — no warranty',
    color: '#b45309',
    confirm: 'Register the product without a warranty card? The member is emailed the result.',
  },
  {
    value: 'RETURNED',
    label: 'Return for correction',
    color: '#b91c1c',
    confirm: 'Return this registration? The member is emailed the reason and asked to correct it.',
  },
]

/**
 * The reviewer's decision on a registration the serial library could not
 * confirm. Each outcome emails the member (lib/registrationReview.ts).
 */
export default function RegistrationReview({
  registrationId,
  status,
  previousNote,
}: {
  registrationId: string
  status: string
  /** The reason given when it was last returned, if it was. */
  previousNote?: string | null
}) {
  const router = useRouter()
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState<Decision | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function decide(d: (typeof DECISIONS)[number]) {
    if (d.value === 'RETURNED' && !note.trim()) {
      setError('Write the reason first — the member is shown it and asked to correct it.')
      return
    }
    if (!confirm(d.confirm)) return

    setBusy(d.value)
    setError(null)
    const res = await fetch(`/api/admin/registrations/${registrationId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ decision: d.value, note }),
    }).catch(() => null)
    setBusy(null)

    if (!res?.ok) {
      const body = await res?.json().catch(() => null)
      setError(
        body?.error === 'ALREADY_REVIEWED'
          ? 'Someone has already reviewed this registration. Reload to see the result.'
          : 'Could not save the decision. Try again.'
      )
      return
    }
    const { emailed } = await res.json()
    if (!emailed) setError('Saved, but the email to the member was not sent (switched off or failed).')
    router.refresh()
  }

  return (
    <div style={{ background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 10, padding: 20 }}>
      <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)', margin: '0 0 6px' }}>Review</h2>
      <p style={{ fontSize: 13, color: 'var(--ink-3)', margin: '0 0 14px' }}>
        {status === 'RETURNED'
          ? 'Returned to the member for correction. It comes back as Pending once they edit it.'
          : previousNote
            ? 'Resubmitted after being returned. Check the corrections, then decide.'
            : 'The serial library could not confirm this registration. Check the photos, then decide.'}{' '}
        The member is emailed the result.
      </p>

      {previousNote && (
        <p style={{ fontSize: 13, color: 'var(--ink-2)', margin: '0 0 14px', padding: '10px 12px', background: 'var(--bg-soft)', borderRadius: 6, whiteSpace: 'pre-wrap' }}>
          <strong style={{ display: 'block', fontSize: 12, color: 'var(--ink-3)', marginBottom: 4 }}>Reason given when returned</strong>
          {previousNote}
        </p>
      )}

      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--ink-3)', marginBottom: 6 }}>
        Note to the member (required to return; shown in the email and on マイページ)
      </label>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        rows={3}
        maxLength={1000}
        placeholder="例：保証書の写真が不鮮明なため、製造番号を確認できませんでした。"
        style={{ width: '100%', boxSizing: 'border-box', padding: '8px 10px', fontSize: 13, border: '1px solid var(--line)', borderRadius: 6, fontFamily: 'inherit', resize: 'vertical' }}
      />

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
        {DECISIONS.map((d) => (
          <button
            key={d.value}
            type="button"
            disabled={busy !== null}
            onClick={() => decide(d)}
            style={{
              padding: '7px 12px',
              borderRadius: 6,
              border: `1px solid ${d.color}`,
              background: d.value === 'REGISTERED_WITH_WARRANTY' ? d.color : 'var(--paper)',
              color: d.value === 'REGISTERED_WITH_WARRANTY' ? '#fff' : d.color,
              fontSize: 12,
              fontWeight: 600,
              cursor: busy ? 'wait' : 'pointer',
              opacity: busy && busy !== d.value ? 0.5 : 1,
            }}
          >
            {busy === d.value ? 'Saving…' : d.label}
          </button>
        ))}
      </div>

      {error && <p style={{ color: '#b91c1c', fontSize: 13, margin: '10px 0 0' }}>{error}</p>}
    </div>
  )
}
