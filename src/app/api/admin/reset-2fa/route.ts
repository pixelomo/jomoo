// TEMPORARY — delete this file after use
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { user, twoFactor } from '@/lib/db/schema'

export async function POST(req: Request) {
  const secret = req.headers.get('x-admin-secret')
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Reset twoFactorEnabled for all users and delete orphaned twoFactor records
  await db.update(user).set({ twoFactorEnabled: false })
  await db.delete(twoFactor)

  return NextResponse.json({ ok: true, message: 'All users reset to twoFactorEnabled: false' })
}
