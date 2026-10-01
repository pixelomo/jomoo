import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getAdminSession } from '@/lib/admin-auth'
import { SERIAL_STATUSES, importSerials, parseSerialImport } from '@/lib/serialLibrary'
import {
  SERIES_ID_PATTERN,
  createCatalogDrafts,
  findSeries,
  loadCatalog,
  planCatalog,
  type CreatedDraft,
} from '@/lib/catalogDrafts'

const ImportSchema = z.object({
  /** Pasted text or the contents of an uploaded CSV — parsed identically. */
  content: z.string().min(1).max(5_000_000),
  batch: z.string().max(120).nullish(),
  series: z.string().max(64).nullish(),
  modelName: z.string().max(200).nullish(),
  status: z.enum(SERIAL_STATUSES).default('UNUSED'),
  /** Parse and report without writing anything, for the preview step. */
  dryRun: z.boolean().default(false),
  /**
   * The new series and models staff confirmed after the preview. Each series
   * is keyed by the value written in the file, so its rows can be filed under
   * the id staff chose; each model becomes a draft product.
   */
  catalog: z
    .object({
      series: z
        .array(
          z.object({
            key: z.string().min(1).max(64),
            seriesId: z.string().regex(SERIES_ID_PATTERN).max(60),
            name: z.string().trim().min(1).max(100),
          })
        )
        .max(50),
      products: z
        .array(z.object({ model: z.string().trim().min(1).max(200), seriesKey: z.string().max(64).nullish() }))
        .max(500),
    })
    .optional(),
})

export async function POST(req: Request) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = ImportSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 422 })
  }

  const { content, batch, series, modelName, status, dryRun, catalog: decision } = parsed.data
  const result = parseSerialImport(content, { series, modelName, status })

  let catalog
  try {
    catalog = await loadCatalog()
  } catch (err) {
    console.error('[serial-import] could not read the CMS catalog', err)
    return NextResponse.json({ error: 'CMS_UNAVAILABLE' }, { status: 502 })
  }

  if (dryRun) {
    return NextResponse.json({
      dryRun: true,
      valid: result.rows.length,
      // Only a sample: a bad 50,000-line file would otherwise send back a
      // response bigger than the file itself.
      preview: result.rows.slice(0, 20),
      rejected: result.rejected.slice(0, 50),
      rejectedTotal: result.rejected.length,
      duplicatesInFile: result.duplicatesInFile.length,
      // Series and models the CMS has not heard of, for staff to confirm.
      plan: planCatalog(catalog, result.rows),
    })
  }

  // What each series cell in the file now means: the id staff chose for a new
  // one, the id of an existing one written by its name, or — for a value staff
  // chose not to create — the cell as written.
  const chosen = new Map((decision?.series ?? []).map((s) => [s.key, s.seriesId]))
  const resolveSeries = (key: string | null | undefined) =>
    key?.trim() ? chosen.get(key.trim()) ?? findSeries(catalog, key)?.seriesId ?? key.trim() : null

  // Drafts before serials: if the CMS refuses the write, nothing is half done
  // and the same file can simply be imported again.
  let drafts: CreatedDraft[] = []
  if (decision && (decision.series.length || decision.products.length)) {
    try {
      drafts = await createCatalogDrafts(catalog, {
        series: decision.series.map(({ seriesId, name }) => ({ seriesId, name })),
        products: decision.products.map((p) => ({ model: p.model, seriesId: resolveSeries(p.seriesKey) })),
      })
    } catch (err) {
      console.error('[serial-import] could not create CMS drafts', err)
      return NextResponse.json({ error: 'CMS_WRITE_FAILED' }, { status: 502 })
    }
  }

  result.rows = result.rows.map((row) => ({ ...row, series: resolveSeries(row.series) }))
  const outcome = await importSerials(result, { batch, operator: session.username })

  return NextResponse.json({
    imported: outcome.imported,
    skipped: outcome.skipped,
    rejected: outcome.rejected.slice(0, 50),
    rejectedTotal: outcome.rejected.length,
    duplicatesInFile: outcome.duplicatesInFile.length,
    batchId: outcome.batchId,
    drafts,
  })
}
