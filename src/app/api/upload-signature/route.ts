import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { generateUploadSignature } from '@/lib/cloudinary'

const RequestSchema = z.object({
  folder: z.enum(['warranty-cards', 'serial-numbers']),
})

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = RequestSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid folder' }, { status: 400 })
  }

  const signature = generateUploadSignature(`jomoo/${parsed.data.folder}`)
  return NextResponse.json(signature)
}
