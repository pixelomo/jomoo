'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

interface Rejected {
  line: number
  value: string
  reason: string
}

interface Result {
  imported: number
  skipped: number
  rejected: Rejected[]
  rejectedTotal: number
  duplicatesInFile: number
}

/**
 * Import straight from the toolbar: one click opens the file picker, and the
 * file is imported as soon as it is chosen.
 *
 * The batch label comes from the file name rather than a form field — the file
 * is almost always the delivery note, so asking for it again was a step that
 * only ever got the same answer.
 */
export default function SerialImportButton() {
  const router = useRouter()
  const input = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState<Result | null>(null)
  const [error, setError] = useState('')

  async function handleFile(file: File) {
    setBusy(true)
    setError('')
    setResult(null)
    try {
      const res = await fetch('/api/admin/serials/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: await file.text(),
          batch: file.name.replace(/\.[^.]+$/, ''),
        }),
      })
      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        setError(
          res.status === 422
            ? 'そのファイルを読み取れませんでした。CSV または製造番号の一覧をご確認ください。'
            : 'インポートに失敗しました。'
        )
        return
      }

      setResult(data)
      router.refresh()
    } catch {
      setError('サーバーに接続できませんでした。')
    } finally {
      setBusy(false)
      // Clear it, so choosing the same file twice still fires a change event.
      if (input.current) input.current.value = ''
    }
  }

  return (
    <>
      <input
        ref={input}
        type="file"
        accept=".csv,.txt,text/csv,text/plain"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) void handleFile(file)
        }}
      />

      <button
        type="button"
        onClick={() => input.current?.click()}
        disabled={busy}
        style={{
          padding: '9px 16px',
          borderRadius: 8,
          border: '1px solid var(--line)',
          background: 'var(--paper)',
          color: 'var(--ink-2)',
          fontSize: 13,
          fontWeight: 600,
          cursor: busy ? 'not-allowed' : 'pointer',
          opacity: busy ? 0.6 : 1,
          whiteSpace: 'nowrap',
        }}
      >
        {busy ? 'Importing…' : 'Import'}
      </button>

      {(result || error) && (
        <div style={overlay} onClick={() => !busy && (setResult(null), setError(''))}>
          <div style={dialog} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 14px', fontSize: 16, fontWeight: 700, color: 'var(--ink)' }}>
              {error ? 'Import failed' : 'Import finished'}
            </h3>

            {error ? (
              <p style={{ margin: 0, fontSize: 14, color: 'var(--warn, #c62828)', lineHeight: 1.6 }}>
                {error}
              </p>
            ) : (
              result && (
                <>
                  <ul style={{ margin: 0, paddingLeft: 18, fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.9 }}>
                    <li><strong>{result.imported}</strong> added to the library</li>
                    {result.skipped > 0 && <li>{result.skipped} already in the library — left untouched</li>}
                    {result.duplicatesInFile > 0 && (
                      <li>{result.duplicatesInFile} repeated within the file — imported once</li>
                    )}
                    {result.rejectedTotal > 0 && (
                      <li style={{ color: 'var(--warn, #c62828)' }}>
                        {result.rejectedTotal} row{result.rejectedTotal === 1 ? '' : 's'} rejected
                      </li>
                    )}
                  </ul>

                  {result.rejected.length > 0 && (
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, marginTop: 14 }}>
                      <tbody>
                        {result.rejected.map((r) => (
                          <tr key={`${r.line}-${r.value}`} style={{ borderBottom: '1px solid var(--line-2)' }}>
                            <td style={{ padding: '5px 8px', color: 'var(--ink-3)', width: 62 }}>Line {r.line}</td>
                            <td style={{ padding: '5px 8px', fontFamily: 'monospace', color: 'var(--ink-2)' }}>
                              {r.value.slice(0, 40)}
                            </td>
                            <td style={{ padding: '5px 8px', color: 'var(--warn, #c62828)' }}>{r.reason}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}

                  {result.rejectedTotal > result.rejected.length && (
                    <p style={{ margin: '8px 0 0', fontSize: 12, color: 'var(--ink-3)' }}>
                      …and {result.rejectedTotal - result.rejected.length} more.
                    </p>
                  )}
                </>
              )
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 22 }}>
              <button
                type="button"
                onClick={() => { setResult(null); setError('') }}
                style={{
                  padding: '9px 22px',
                  border: 0,
                  borderRadius: 8,
                  background: 'var(--ink)',
                  color: '#fff',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
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
  padding: 30,
  maxWidth: 520,
  width: '100%',
  maxHeight: '85vh',
  overflowY: 'auto',
  boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
}
