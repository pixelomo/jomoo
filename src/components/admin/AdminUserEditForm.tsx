'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  userId: string
  initial: {
    name: string
    email: string
    gender: string | null
    dateOfBirth: string | null
  }
}

export default function AdminUserEditForm({ userId, initial }: Props) {
  const router = useRouter()
  const [name, setName] = useState(initial.name)
  const [email, setEmail] = useState(initial.email)
  const [gender, setGender] = useState(initial.gender ?? '')
  const [dob, setDob] = useState(initial.dateOfBirth ?? '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [showDelete, setShowDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setSaved(false)
    setError('')
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name || undefined,
          email: email || undefined,
          gender: gender || null,
          dateOfBirth: dob || null,
        }),
      })
      if (!res.ok) { setError('Failed to save.'); return }
      setSaved(true)
      router.refresh()
    } catch {
      setError('Something went wrong.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    setDeleting(true)
    try {
      await fetch(`/api/admin/users/${userId}`, { method: 'DELETE' })
      router.push('/admin/users')
      router.refresh()
    } catch {
      setError('Delete failed.')
      setDeleting(false)
    }
  }

  const inputStyle: React.CSSProperties = {
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

  const labelStyle: React.CSSProperties = {
    fontSize: 13,
    fontWeight: 500,
    color: 'var(--ink-2)',
    marginBottom: 4,
    display: 'block',
  }

  return (
    <div style={{ background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 10, padding: '24px' }}>
      <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)', margin: '0 0 20px' }}>Edit Account</h2>
      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <label style={labelStyle}>Name</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Gender</label>
          <select value={gender} onChange={e => setGender(e.target.value)} style={{ ...inputStyle }}>
            <option value="">— Not specified —</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
            <option value="prefer_not_to_say">Prefer not to say</option>
          </select>
        </div>
        <div>
          <label style={labelStyle}>Date of Birth</label>
          <input type="date" value={dob} onChange={e => setDob(e.target.value)} style={inputStyle} />
        </div>

        {error && <p style={{ fontSize: 13, color: 'var(--warn)', margin: 0 }}>{error}</p>}
        {saved && <p style={{ fontSize: 13, color: '#2e7d32', margin: 0 }}>Saved successfully.</p>}

        <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
          <button
            type="submit"
            disabled={saving}
            style={{
              flex: 1,
              padding: '9px 0',
              background: saving ? 'var(--ink-3)' : 'var(--ink)',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              fontSize: 14,
              fontWeight: 600,
              cursor: saving ? 'not-allowed' : 'pointer',
            }}
          >
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
          <button
            type="button"
            onClick={() => setShowDelete(true)}
            style={{
              padding: '9px 16px',
              background: 'transparent',
              color: 'var(--warn)',
              border: '1px solid var(--warn)',
              borderRadius: 6,
              fontSize: 14,
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Delete
          </button>
        </div>
      </form>

      {/* Delete confirm */}
      {showDelete && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100,
        }}>
          <div style={{
            background: 'var(--paper)', borderRadius: 10, padding: '32px',
            maxWidth: 400, width: '100%', boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
          }}>
            <h3 style={{ margin: '0 0 12px', fontSize: 16, fontWeight: 700, color: 'var(--ink)' }}>Delete account?</h3>
            <p style={{ margin: '0 0 24px', fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.6 }}>
              This will permanently delete the user and all their registrations and warranty records.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => setShowDelete(false)}
                style={{ flex: 1, padding: '9px 0', background: 'var(--bg-soft)', border: '1px solid var(--line)', borderRadius: 6, fontSize: 14, cursor: 'pointer', color: 'var(--ink-2)' }}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                style={{ flex: 1, padding: '9px 0', background: 'var(--warn)', color: '#fff', border: 'none', borderRadius: 6, fontSize: 14, fontWeight: 600, cursor: deleting ? 'not-allowed' : 'pointer' }}
              >
                {deleting ? 'Deleting…' : 'Delete account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
