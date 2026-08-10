import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getAdminSession } from '@/lib/admin-auth'
import { SERIAL_STATUSES, importSerials, parseSerialImport } from '@/lib/serialLibrary'

const ImportSchema = z.object({
  /** Pasted text or the contents of an uploaded CSV — parsed identically. */
  content: z.string().min(1).max(5_000_000),
  batch: z.string().max(120).nullish(),
  series: z.string().max(64).nullish(),
  modelName: z.string().max(200).nullish(),
  status: z.enum(SERIAL_STATUSES).default('UNUSED'),
  /** Parse and report without writing anything, for the preview step. */
  dryRun: z.boolean().default(false),
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

  const { content, batch, series, modelName, status, dryRun } = parsed.data
  const result = parseSerialImport(content, { series, modelName, status })

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
    })
  }

  const outcome = await importSerials(result, { batch, operator: session.username })

  return NextResponse.json({
    imported: outcome.imported,
    skipped: outcome.skipped,
    rejected: outcome.rejected.slice(0, 50),
    rejectedTotal: outcome.rejected.length,
    duplicatesInFile: outcome.duplicatesInFile.length,
    batchId: outcome.batchId,
  })
}
