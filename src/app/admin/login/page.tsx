'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })

      if (!res.ok) {
        setError(
          res.status === 401
            ? 'Invalid username or password.'
            : 'Could not sign in right now. Please try again.'
        )
        setLoading(false)
        return
      }

      // Stay busy until the dashboard actually renders. replace() resolves as
      // soon as the navigation *starts*, and /admin is a server component that
      // queries the database, so clearing `loading` here would put the button
      // back to "Sign in" for the seconds before the new page arrives.
      // replace() rather than push() so Back does not return to this form.
      router.replace('/admin')
    } catch {
      setError('Could not reach the server. Please check your connection and try again.')
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-soft)',
      fontFamily: 'var(--font-poppins, sans-serif)',
    }}>
      <div style={{
        background: 'var(--paper)',
        border: '1px solid var(--line)',
        borderRadius: 12,
        padding: '48px 40px',
        width: '100%',
        maxWidth: 400,
      }}>
        <div style={{ marginBottom: 32 }}>
          <p style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 8 }}>
            Admin Portal
          </p>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--ink)', margin: 0 }}>JOMOO</h1>
        </div>

        <form onSubmit={handleSubmit} aria-busy={loading} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label htmlFor="admin-username" style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink-2)' }}>Username</label>
            <input
              id="admin-username"
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              disabled={loading}
              autoComplete="username"
              style={{
                padding: '10px 12px',
                border: '1px solid var(--line)',
                borderRadius: 6,
                fontSize: 14,
                color: 'var(--ink)',
                background: 'var(--paper)',
                outline: 'none',
                opacity: loading ? 0.6 : 1,
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label htmlFor="admin-password" style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink-2)' }}>Password</label>
            <input
              id="admin-password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              disabled={loading}
              autoComplete="current-password"
              style={{
                padding: '10px 12px',
                border: '1px solid var(--line)',
                borderRadius: 6,
                fontSize: 14,
                color: 'var(--ink)',
                background: 'var(--paper)',
                outline: 'none',
                opacity: loading ? 0.6 : 1,
              }}
            />
          </div>

          {error && (
            <p role="alert" style={{ fontSize: 13, color: 'var(--warn)', margin: 0 }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: 8,
              padding: '11px 0',
              background: loading ? 'var(--ink-3)' : 'var(--ink)',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              fontSize: 14,
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background 0.15s',
            }}
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}
