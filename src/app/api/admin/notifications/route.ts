import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getAdminSession } from '@/lib/admin-auth'
import { db } from '@/lib/db'
import { notificationSetting } from '@/lib/db/schema'
import { NOTIFICATIONS, allNotificationConfigs } from '@/lib/notifications'

const KEYS = NOTIFICATIONS.map((n) => n.key) as [string, ...string[]]

const UpdateSchema = z.object({
  settings: z.array(
    z.object({
      key: z.enum(KEYS),
      enabled: z.boolean(),
      /** Free text; split and validated below so a typo names itself. */
      ccAddresses: z.string().max(500).optional(),
    })
  ),
})

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function GET() {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return NextResponse.json({ settings: await allNotificationConfigs() })
}

export async function PATCH(req: Request) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = UpdateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid data' }, { status: 422 })
  }

  // A mistyped CC silently drops copies, so reject it rather than store it.
  for (const s of parsed.data.settings) {
    const bad = (s.ccAddresses ?? '')
      .split(/[,;\s]+/)
      .map((a) => a.trim())
      .filter(Boolean)
      .filter((a) => !EMAIL.test(a))
    if (bad.length) {
      return NextResponse.json(
        { error: 'invalid_email', detail: bad.join(', ') },
        { status: 422 }
      )
    }
  }

  for (const s of parsed.data.settings) {
    await db
      .insert(notificationSetting)
      .values({ key: s.key, enabled: s.enabled, ccAddresses: s.ccAddresses?.trim() || null })
      .onConflictDoUpdate({
        target: notificationSetting.key,
        set: {
          enabled: s.enabled,
          ccAddresses: s.ccAddresses?.trim() || null,
          updatedAt: new Date(),
        },
      })
  }

  return NextResponse.json({ success: true })
}
