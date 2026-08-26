import { NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/lib/auth'
import { readTextFromImage } from '@/lib/cloudinary'
import { extractSerialCandidates, type SerialCandidate } from '@/lib/serialOcr'
import { findKnownSerials } from '@/lib/serialLibrary'

const RequestSchema = z.object({
  publicId: z.string().min(1).max(300),
  /** Recorded by the form; the read no longer depends on the product line. */
  modelSeries: z.string().max(64).nullish(),
})

/** Uploads land here; anything else is not ours to read. */
const ALLOWED_PREFIX = 'jomoo/serial-numbers/'

/** Enough for a chooser; the rest are noise off the label. */
const MAX_CANDIDATES = 5

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

  const { publicId } = parsed.data

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

  const read = extractSerialCandidates(outcome.text)

  // The shape of a run only says which readings are worth offering. Whether one
  // is a real serial is a question for the library, and a confirmed hit goes to
  // the top — that is the number the member should be shown first.
  const known = await findKnownSerials(read.map((c) => c.serialNumber))
  const candidates: SerialCandidate[] = read
    .map((c) => (known.has(c.serialNumber) ? { ...c, confidence: 'known' as const } : c))
    .sort((a, b) => Number(b.confidence === 'known') - Number(a.confidence === 'known'))

  return NextResponse.json({
    status: candidates.length ? 'ok' : 'no_serial',
    candidates: candidates.slice(0, MAX_CANDIDATES),
  })
}
