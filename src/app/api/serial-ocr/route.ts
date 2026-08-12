import { NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/lib/auth'
import { readTextFromImage } from '@/lib/cloudinary'
import { extractSerialCandidates } from '@/lib/serialOcr'
import { hasValidSerialFormat } from '@/lib/serialValidation'

const RequestSchema = z.object({
  publicId: z.string().min(1).max(300),
  /** Sanity series of the chosen model; picks the expected digit count. */
  modelSeries: z.string().max(64).nullish(),
})

/** Uploads land here; anything else is not ours to read. */
const ALLOWED_PREFIX = 'jomoo/serial-numbers/'

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: req.headers })
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = RequestSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 422 })
  }

  const { publicId, modelSeries } = parsed.data

  // Without this, any signed-in member could bill us for OCR on arbitrary
  // assets in the account by passing someone else's public id.
  if (!publicId.startsWith(ALLOWED_PREFIX) || publicId.includes('..')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const outcome = await readTextFromImage(publicId)

  if (outcome.status === 'unavailable') {
    // 200, not an error: the member types the number instead, which is the
    // normal flow anyway. A 500 here would look like the upload had failed.
    return NextResponse.json({ status: 'unavailable', candidates: [] })
  }

  if (outcome.status === 'no_text') {
    return NextResponse.json({ status: 'no_text', candidates: [] })
  }

  const candidates = extractSerialCandidates(outcome.text, modelSeries).filter((c) =>
    // Belt and braces — the extractor builds to the series' length, and this
    // re-checks against the same rule the registration itself will apply.
    hasValidSerialFormat(c.serialNumber, modelSeries)
  )

  return NextResponse.json({
    status: candidates.length ? 'ok' : 'no_serial',
    // A handful is plenty for a chooser; the rest are noise from the label.
    candidates: candidates.slice(0, 5),
  })
}
