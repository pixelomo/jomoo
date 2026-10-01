'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import DownloadButton from '@/components/admin/DownloadButton'
import CmsDraftNotice from '@/components/admin/CmsDraftNotice'
import { SERIES_ID_PATTERN } from '@/lib/seriesId'
import type { CatalogPlan, CreatedDraft } from '@/lib/catalogDrafts'

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
  drafts?: CreatedDraft[]
}

interface SeriesChoice {
  key: string
  seriesId: string
  name: string
  serials: number
  include: boolean
}

interface ModelChoice {
  model: string
  seriesKey: string | null
  serials: number
  include: boolean
}

interface Pending {
  content: string
  batch: string
  series: SeriesChoice[]
  models: ModelChoice[]
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

  const [pending, setPending] = useState<Pending | null>(null)

  const finish = () => {
    setBusy(false)
    // Clear it, so choosing the same file twice still fires a change event.
    if (input.current) input.current.value = ''
  }

  const failure = (status: number, code?: string) =>
    status === 422
      ? 'そのファイルを読み取れませんでした。「Template」からテンプレートを取得し、形式をご確認ください。'
      : code === 'CMS_UNAVAILABLE' || code === 'CMS_WRITE_FAILED'
        ? 'CMSに接続できなかったため、取り込みを中止しました。何も登録されていません。もう一度お試しください。'
        : 'インポートに失敗しました。'

  /**
   * A preview first: if the file names series or models the CMS does not have,
   * staff confirm them before anything is written. A file with nothing new goes
   * straight in, exactly as before.
   */
  async function handleFile(file: File) {
    setBusy(true)
    setError('')
    setResult(null)
    try {
      const content = await file.text()
      const batch = file.name.replace(/\.[^.]+$/, '')
      const res = await fetch('/api/admin/serials/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, batch, dryRun: true }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(failure(res.status, data.error))
        finish()
        return
      }

      const plan: CatalogPlan = data.plan ?? { newSeries: [], newModels: [] }
      if (plan.newSeries.length || plan.newModels.length) {
        setPending({
          content,
          batch,
          series: plan.newSeries.map((s) => ({ ...s, include: true })),
          models: plan.newModels.map((m) => ({ ...m, include: true })),
        })
        finish()
        return
      }

      await runImport(content, batch, null)
    } catch {
      setError('サーバーに接続できませんでした。')
      finish()
    }
  }

  async function runImport(content: string, batch: string, choices: Pending | null) {
    setBusy(true)
    try {
      const res = await fetch('/api/admin/serials/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          batch,
          ...(choices && {
            catalog: {
              series: choices.series
                .filter((s) => s.include)
                .map(({ key, seriesId, name }) => ({ key, seriesId, name: name.trim() })),
              products: choices.models
                .filter((m) => m.include)
                .map(({ model, seriesKey }) => ({ model, seriesKey })),
            },
          }),
        }),
      })
      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        setError(failure(res.status, data.error))
        return
      }

      setPending(null)
      setResult(data)
      router.refresh()
    } catch {
      setError('サーバーに接続できませんでした。')
    } finally {
      finish()
    }
  }

  const pendingProblem = pending?.series.find(
    (s) => s.include && (!s.name.trim() || !SERIES_ID_PATTERN.test(s.seriesId))
  )
  const duplicateId = pending?.series
    .filter((s) => s.include)
    .find((s, i, all) => all.findIndex((o) => o.seriesId === s.seriesId) !== i)

  const updateSeries = (key: string, patch: Partial<SeriesChoice>) =>
    setPending((p) => p && { ...p, series: p.series.map((s) => (s.key === key ? { ...s, ...patch } : s)) })
  const updateModel = (index: number, include: boolean) =>
    setPending((p) => p && { ...p, models: p.models.map((m, i) => (i === index ? { ...m, include } : m)) })

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

      {/* Next to Import rather than tucked into a help page — the moment
          staff need the blank form is the moment they reach for Import. */}
      <DownloadButton href="/api/admin/serials/template" label="Template" variant="outline" />
      {/* Test data, so the import can be tried before a real delivery note is
          put through it. Every serial in it says SAMPLE. */}
      <DownloadButton href="/api/admin/serials/sample" label="Sample data" variant="outline" />

      <button
        type="button"
        onClick={() => input.current?.click()}
        disabled={busy}
        style={{
          ...outlineButton,
          cursor: busy ? 'not-allowed' : 'pointer',
          opacity: busy ? 0.6 : 1,
        }}
      >
        {busy ? 'Importing…' : 'Import'}
      </button>

      {pending && !error && (
        <div style={overlay}>
          <div style={{ ...dialog, maxWidth: 640 }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 8px', fontSize: 16, fontWeight: 700, color: 'var(--ink)' }}>
              新しいシリーズ・製品が見つかりました
            </h3>
            <p style={{ margin: '0 0 16px', fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.6 }}>
              このファイルには、CMSにまだないシリーズまたは型番が含まれています。チェックしたものはCMSに
              <strong>下書き</strong>として作成されます。CMSで公開するまで、サイトには表示されません。
              <br />
              <span style={{ color: 'var(--ink-3)' }}>
                Checked items are created as drafts in the CMS and stay off the site until published there.
              </span>
            </p>

            {pending.series.length > 0 && (
              <section style={{ marginBottom: 18 }}>
                <p style={sectionTitle}>新しいシリーズ / New series</p>
                {pending.series.map((s) => (
                  <div key={s.key} style={choiceRow}>
                    <label style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 13 }}>
                      <input
                        type="checkbox"
                        checked={s.include}
                        onChange={(e) => updateSeries(s.key, { include: e.target.checked })}
                      />
                      <span>
                        ファイル上の値：<strong>{s.key}</strong>（{s.serials}件）
                      </span>
                    </label>
                    {s.include && (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 8 }}>
                        <label style={smallField}>
                          シリーズ名 / Name
                          <input
                            value={s.name}
                            onChange={(e) => updateSeries(s.key, { name: e.target.value })}
                            placeholder="浴槽"
                            style={textInput}
                          />
                        </label>
                        <label style={smallField}>
                          Series ID（URL）
                          <input
                            value={s.seriesId}
                            onChange={(e) => updateSeries(s.key, { seriesId: e.target.value.toLowerCase() })}
                            placeholder="bath-tub"
                            style={{ ...textInput, fontFamily: 'monospace' }}
                          />
                        </label>
                        <span style={{ gridColumn: '1 / -1', fontSize: 12, color: 'var(--ink-3)' }}>
                          公開後のURL：/products/{s.seriesId || '…'}
                        </span>
                      </div>
                    )}
                    {!s.include && (
                      <p style={{ margin: '6px 0 0', fontSize: 12, color: 'var(--ink-3)' }}>
                        作成しない場合、製造番号のシリーズには「{s.key}」がそのまま記録されます。
                      </p>
                    )}
                  </div>
                ))}
              </section>
            )}

            {pending.models.length > 0 && (
              <section>
                <p style={sectionTitle}>新しい型番（下書き製品を作成） / New models</p>
                {pending.models.map((m, i) => (
                  <label key={`${m.model}-${m.seriesKey}`} style={{ ...choiceRow, display: 'flex', gap: 8, alignItems: 'center', fontSize: 13 }}>
                    <input type="checkbox" checked={m.include} onChange={(e) => updateModel(i, e.target.checked)} />
                    <span>
                      <strong>{m.model}</strong>
                      {m.seriesKey && <span style={{ color: 'var(--ink-3)' }}>（シリーズ：{m.seriesKey}）</span>}
                      <span style={{ color: 'var(--ink-3)' }}>　{m.serials}件</span>
                    </span>
                  </label>
                ))}
              </section>
            )}

            {(pendingProblem || duplicateId) && (
              <p style={{ margin: '12px 0 0', fontSize: 13, color: 'var(--warn, #c62828)' }}>
                {duplicateId
                  ? `Series ID「${duplicateId.seriesId}」が重複しています。`
                  : 'シリーズ名を入力し、Series ID は半角英小文字・数字・ハイフンで入力してください（例：bath-tub）。'}
              </p>
            )}

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 22 }}>
              <button type="button" onClick={() => setPending(null)} disabled={busy} style={outlineButton}>
                キャンセル
              </button>
              <button
                type="button"
                disabled={busy || Boolean(pendingProblem || duplicateId)}
                onClick={() => void runImport(pending.content, pending.batch, pending)}
                style={{
                  ...primaryButton,
                  opacity: busy || pendingProblem || duplicateId ? 0.5 : 1,
                  cursor: busy || pendingProblem || duplicateId ? 'not-allowed' : 'pointer',
                }}
              >
                {busy ? '取り込み中…' : '取り込む / Import'}
              </button>
            </div>
          </div>
        </div>
      )}

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

                  <CmsDraftNotice drafts={result.drafts ?? []} />

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

const outlineButton: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
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

const primaryButton: React.CSSProperties = {
  padding: '9px 22px',
  border: 0,
  borderRadius: 8,
  background: 'var(--ink)',
  color: '#fff',
  fontSize: 13,
  fontWeight: 600,
}

const sectionTitle: React.CSSProperties = {
  margin: '0 0 8px',
  fontSize: 12,
  fontWeight: 700,
  color: 'var(--ink-2)',
  letterSpacing: '0.02em',
}

const choiceRow: React.CSSProperties = {
  padding: '10px 12px',
  border: '1px solid var(--line)',
  borderRadius: 8,
  marginBottom: 8,
}

const smallField: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
  fontSize: 12,
  color: 'var(--ink-2)',
}

const textInput: React.CSSProperties = {
  padding: '7px 10px',
  border: '1px solid var(--line)',
  borderRadius: 6,
  fontSize: 13,
  color: 'var(--ink)',
  background: 'var(--paper)',
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
