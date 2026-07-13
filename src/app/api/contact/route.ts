import { NextResponse } from 'next/server'
import { ContactSchema } from '@/types/contact'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = ContactSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: 'invalid' }, { status: 400 })
    }

    const { sendContactInquiry } = await import('@/lib/resend')
    await sendContactInquiry(parsed.data)

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[contact]', err)
    return NextResponse.json({ error: 'send_failed' }, { status: 500 })
  }
}
