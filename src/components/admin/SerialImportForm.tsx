'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { SERIAL_STATUSES, SERIAL_STATUS_META, type SerialStatus } from '@/lib/serialStatus'
import { SERIAL_DIGITS_BY_SERIES } from '@/lib/serialValidation'

const SERIES = Object.keys(SERIAL_DIGITS_BY_SERIES)

interface Rejected {
  line: number
  value: string
  reason: string
}

interface Preview {
  valid: number
  rejected: Rejected[]
  rejectedTotal: number
  duplicatesInFile: number
}

interface Result {
  imported: number
  skipped: number
  rejected: Rejected[]
  rejectedTotal: number
  duplicatesInFile: number
}

export default function SerialImportForm() {
  const router = useRouter()
  const fileInput = useRef<HTMLInputElement>(null)
  const [content, setContent] = useState('')
  const [fileName, setFileName] = useState('')
  const [batch, setBatch] = useState('')
  const [series, setSeries] = useState('')
  const [modelName, setModelName] = useState('')
  const [status, setStatus] = useState<SerialStatus>('UNUSED')
  const [busy, setBusy] = useState(false)
  const [preview, setPreview] = useState<Preview | null>(null)
  const [result, setResult] = useState<Result | null>(null)
  const [error, setError] = useState('')

  const payload = () => ({ content, batch: batch || null, series: series || null, modelName: modelName || null, status })

  async function readFile(file: File) {
    setError('')
    // Read in the browser and post as text: one endpoint parses both a pasted
    // list and an uploaded file, so the two paths cannot drift apart.
    const text = await file.text()
    setContent(text)
    setFileName(file.name)
    setPreview(null)
    setResult(null)
    if (!batch) setBatch(file.name.replace(/\.[^.]+$/, ''))
  }

  async function send(dryRun: boolean) {
    if (!content.trim()) {
      setError('Paste some serial numbers or choose a file first.')
      return
    }
    setBusy(true)
    setError('')
    try {
      const res = await fetch('/api/admin/serials/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload(), dryRun }),
      })
      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        setError(
          res.status === 422
            ? 'That file could not be read. Check it is a CSV or a plain list of serial numbers.'
            : 'Import failed. Please try again.'
        )
        return
      }

      if (dryRun) {
        setPreview(data)
        setResult(null)
      } else {
        setResult(data)
        setPreview(null)
        router.refresh()
      }
    } catch {
      setError('Could not reach the server.')
    } finally {
      setBusy(false)
    }
  }

  function startOver() {
    setContent('')
    setFileName('')
    setPreview(null)
    setResult(null)
    setError('')
    if (fileInput.current) fileInput.current.value = ''
  }

  return (
    <div style={{ maxWidth: 760 }}>
      <section style={card}>
        <h2 style={cardTitle}>1. The serial numbers</h2>
        <p style={hint}>
          Either a plain list, one serial per line, or a CSV whose first column is the serial
          number. A header row naming the columns (<code>serial_number, series, model_name,
          status, note</code>) is used if present; anything else falls back to the defaults below.
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '14px 0' }}>
          <input
            ref={fileInput}
            type="file"
            accept=".csv,.txt,text/csv,text/plain"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) void readFile(file)
            }}
            style={{ fontSize: 13, color: 'var(--ink-2)' }}
          />
          {fileName && (
            <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>
              {fileName} — {content.split(/\r?\n/).filter((l) => l.trim()).length} lines
            </span>
          )}
        </div>

        <textarea
          value={content}
          onChange={(e) => {
            setContent(e.target.value)
            setPreview(null)
            setResult(null)
          }}
          rows={10}
          placeholder={'J0000000000000000001\nJ0000000000000000002\nJ0000000000000000003'}
          style={{
            ...input,
            fontFamily: 'monospace',
            fontSize: 12,
            lineHeight: 1.6,
            resize: 'vertical',
          }}
        />
      </section>

      <section style={card}>
        <h2 style={cardTitle}>2. Defaults for rows that do not say</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
          <Field label="Batch label" hint="Shown against every serial in this import.">
            <input
              value={batch}
              onChange={(e) => setBatch(e.target.value)}
              placeholder="Delivery note no."
              style={input}
            />
          </Field>
          <Field label="Series" hint="Decides how many digits a serial must have.">
            <select value={series} onChange={(e) => setSeries(e.target.value)} style={input}>
              <option value="">— Default (19 digits) —</option>
              {SERIES.map((s) => (
                <option key={s} value={s}>{s} ({SERIAL_DIGITS_BY_SERIES[s]} digits)</option>
              ))}
            </select>
          </Field>
          <Field label="Model name">
            <input value={modelName} onChange={(e) => setModelName(e.target.value)} style={input} />
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
      </section>

      {error && (
        <p role="alert" style={{ fontSize: 13, color: 'var(--warn, #c62828)', margin: '0 0 14px' }}>
          {error}
        </p>
      )}

      {preview && (
        <section style={{ ...card, borderColor: '#b3ceff', background: 'var(--accent-soft, #eef4ff)' }}>
          <h2 style={cardTitle}>Check before importing</h2>
          <ul style={list}>
            <li><strong>{preview.valid}</strong> serial{preview.valid === 1 ? '' : 's'} ready to import</li>
            {preview.duplicatesInFile > 0 && (
              <li>{preview.duplicatesInFile} repeated within the file — each will be imported once</li>
            )}
            {preview.rejectedTotal > 0 && (
              <li style={{ color: 'var(--warn, #c62828)' }}>
                {preview.rejectedTotal} row{preview.rejectedTotal === 1 ? '' : 's'} cannot be
                imported and will be skipped
              </li>
            )}
          </ul>
          <RejectedList rejected={preview.rejected} total={preview.rejectedTotal} />
          <p style={{ ...hint, marginTop: 12 }}>
            Serials already in the library are left exactly as they are — re-importing the same
            file is safe.
          </p>
        </section>
      )}

      {result && (
        <section style={{ ...card, borderColor: '#a5d6a7', background: '#f1f8f2' }}>
          <h2 style={cardTitle}>Import finished</h2>
          <ul style={list}>
            <li><strong>{result.imported}</strong> added to the library</li>
            {result.skipped > 0 && <li>{result.skipped} already in the library — left untouched</li>}
            {result.duplicatesInFile > 0 && <li>{result.duplicatesInFile} repeated within the file</li>}
            {result.rejectedTotal > 0 && (
              <li style={{ color: 'var(--warn, #c62828)' }}>{result.rejectedTotal} rejected</li>
            )}
          </ul>
          <RejectedList rejected={result.rejected} total={result.rejectedTotal} />
        </section>
      )}

      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        {!result && (
          <>
            <button type="button" onClick={() => send(true)} disabled={busy} style={quietButton}>
              {busy ? 'Checking…' : 'Check file'}
            </button>
            <button
              type="button"
              onClick={() => send(false)}
              disabled={busy || (preview !== null && preview.valid === 0)}
              style={primaryButton(busy)}
            >
              {busy ? 'Importing…' : preview ? `Import ${preview.valid}` : 'Import'}
            </button>
          </>
        )}
        {result && (
          <button type="button" onClick={startOver} style={primaryButton(false)}>
            Import another batch
          </button>
        )}
      </div>
    </div>
  )
}

function RejectedList({ rejected, total }: { rejected: Rejected[]; total: number }) {
  if (!rejected.length) return null
  return (
    <div style={{ marginTop: 12 }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
        <tbody>
          {rejected.map((r) => (
            <tr key={`${r.line}-${r.value}`} style={{ borderBottom: '1px solid var(--line-2)' }}>
              <td style={{ padding: '5px 8px', color: 'var(--ink-3)', width: 60 }}>Line {r.line}</td>
              <td style={{ padding: '5px 8px', fontFamily: 'monospace', color: 'var(--ink-2)' }}>
                {r.value.slice(0, 60)}
              </td>
              <td style={{ padding: '5px 8px', color: 'var(--warn, #c62828)' }}>{r.reason}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {total > rejected.length && (
        <p style={{ ...hint, marginTop: 8 }}>…and {total - rejected.length} more.</p>
      )}
    </div>
  )
}

function Field({ label, hint: fieldHint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label style={{ display: 'block' }}>
      <span style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--ink-2)', marginBottom: 4 }}>
        {label}
      </span>
      {children}
      {fieldHint && (
        <span style={{ display: 'block', fontSize: 11, color: 'var(--ink-3)', marginTop: 4 }}>
          {fieldHint}
        </span>
      )}
    </label>
  )
}

const card: React.CSSProperties = {
  background: 'var(--paper)',
  border: '1px solid var(--line)',
  borderRadius: 10,
  padding: '20px 22px',
  marginBottom: 16,
}

const cardTitle: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 600,
  color: 'var(--ink)',
  margin: '0 0 8px',
}

const hint: React.CSSProperties = {
  fontSize: 12,
  color: 'var(--ink-3)',
  lineHeight: 1.6,
  margin: 0,
}

const list: React.CSSProperties = {
  margin: '0',
  paddingLeft: 18,
  fontSize: 13,
  color: 'var(--ink-2)',
  lineHeight: 1.8,
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

const primaryButton = (busy: boolean): React.CSSProperties => ({
  padding: '10px 22px',
  border: 0,
  borderRadius: 8,
  background: 'var(--ink)',
  color: '#fff',
  fontSize: 13,
  fontWeight: 600,
  cursor: busy ? 'not-allowed' : 'pointer',
  opacity: busy ? 0.6 : 1,
})

const quietButton: React.CSSProperties = {
  padding: '10px 22px',
  border: '1px solid var(--line)',
  borderRadius: 8,
  background: 'var(--paper)',
  color: 'var(--ink-2)',
  fontSize: 13,
  fontWeight: 600,
  cursor: 'pointer',
}
