'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { SERIAL_STATUSES, SERIAL_STATUS_META, type SerialStatus } from '@/lib/serialStatus'
import { MAX_SERIAL_LENGTH, MIN_SERIAL_LENGTH, maskSerialInput } from '@/lib/serialValidation'
import { SERIES_ID_PATTERN, slugify } from '@/lib/seriesId'
import type { CreatedDraft } from '@/lib/catalogDrafts'
import CmsDraftNotice from '@/components/admin/CmsDraftNotice'

/** The series in the CMS, drafts included, for the dropdown. */
export interface SeriesOption {
  seriesId: string
  name: string
  published: boolean
}

/** Chosen in the series select to start a series the CMS does not have yet. */
const NEW_SERIES = '__new__'

/** Adds one serial by hand — for the ones that arrive by phone, not by file. */
export default function SerialAddButton({ seriesOptions }: { seriesOptions: SeriesOption[] }) {
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
  const [newSeriesName, setNewSeriesName] = useState('')
  const [newSeriesId, setNewSeriesId] = useState('')
  /** Once staff type an id themselves, the name stops overwriting it. */
  const [idEdited, setIdEdited] = useState(false)
  const [createProduct, setCreateProduct] = useState(true)
  const [drafts, setDrafts] = useState<CreatedDraft[]>([])

  const addingSeries = series === NEW_SERIES

  function reset() {
    setSerialNumber('')
    setModelName('')
    setNote('')
    setError('')
    setSeries('')
    setNewSeriesName('')
    setNewSeriesId('')
    setIdEdited(false)
  }

  function close() {
    setOpen(false)
    setDrafts([])
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (addingSeries && !SERIES_ID_PATTERN.test(newSeriesId)) {
      setError('Series ID: lowercase letters, digits and hyphens only (e.g. bath-tub).')
      return
    }
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/admin/serials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serialNumber,
          series: addingSeries ? null : series || null,
          newSeries: addingSeries ? { seriesId: newSeriesId, name: newSeriesName } : null,
          createProduct: Boolean(modelName.trim()) && createProduct,
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
              ? `That does not look like a serial number — expected ${MIN_SERIAL_LENGTH}–${MAX_SERIAL_LENGTH} letters and digits.`
              : body.error === 'CMS_WRITE_FAILED'
                ? 'The CMS could not create the draft series/product. Nothing was added — please try again.'
                : 'Could not add it. Please check the details and try again.'
        )
        return
      }

      reset()
      router.refresh()
      // Drafts were started in the CMS: keep the dialog open on the reminder
      // to publish them, rather than closing on what looks like a finished job.
      const created: CreatedDraft[] = body.drafts ?? []
      if (created.length) setDrafts(created)
      else setOpen(false)
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
        <div style={overlay} onClick={() => !saving && close()}>
          <div style={dialog} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 20px', fontSize: 16, fontWeight: 700, color: 'var(--ink)' }}>
              {drafts.length ? 'Serial added' : 'Add a serial number'}
            </h3>

            {drafts.length > 0 ? (
              <>
                <CmsDraftNotice drafts={drafts} />
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
                  <button type="button" onClick={close} style={{ ...quietButton, flex: 'none', padding: '9px 22px' }}>
                    Close
                  </button>
                </div>
              </>
            ) : (
            <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <Field label="Serial number">
                <input
                  value={serialNumber}
                  // Masked as it is typed so a symbol or a 21st character simply
                  // cannot be entered, rather than failing on submit.
                  onChange={(e) => setSerialNumber(maskSerialInput(e.target.value))}
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
                    {seriesOptions.map((s) => (
                      <option key={s.seriesId} value={s.seriesId}>
                        {s.name} ({s.seriesId}){s.published ? '' : ' — 下書き'}
                      </option>
                    ))}
                    <option value={NEW_SERIES}>＋ 新しいシリーズ / New series…</option>
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

              {addingSeries && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <Field label="シリーズ名 / Series name">
                    <input
                      value={newSeriesName}
                      onChange={(e) => {
                        setNewSeriesName(e.target.value)
                        if (!idEdited) setNewSeriesId(slugify(e.target.value))
                      }}
                      placeholder="浴槽"
                      required
                      style={input}
                    />
                  </Field>
                  <Field label="Series ID (URL)">
                    <input
                      value={newSeriesId}
                      onChange={(e) => {
                        setIdEdited(true)
                        setNewSeriesId(e.target.value.toLowerCase())
                      }}
                      placeholder="bath-tub"
                      required
                      style={{ ...input, fontFamily: 'monospace' }}
                    />
                  </Field>
                  <p style={{ gridColumn: '1 / -1', margin: '-6px 0 0', fontSize: 12, color: 'var(--ink-3)' }}>
                    /products/{newSeriesId || '…'} — created as a draft series page in the CMS.
                  </p>
                </div>
              )}

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

              {modelName.trim() && (
                <label style={{ display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: 13, color: 'var(--ink-2)' }}>
                  <input
                    type="checkbox"
                    checked={createProduct}
                    onChange={(e) => setCreateProduct(e.target.checked)}
                    style={{ marginTop: 3 }}
                  />
                  <span>この型番がCMSにない場合、下書きの製品を作成する / Create a draft product if the CMS has no such model</span>
                </label>
              )}

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
                  onClick={close}
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
            )}
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
