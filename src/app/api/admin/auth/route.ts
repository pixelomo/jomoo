import { NextResponse } from 'next/server'
import {
  authenticateAdmin,
  signAdminToken,
  ADMIN_COOKIE,
  adminCookieOptions,
} from '@/lib/admin-auth'

export async function POST(req: Request) {
  let body: { username?: string; password?: string }
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const session = authenticateAdmin(body.username ?? '', body.password ?? '')
  if (!session) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  }

  const token = await signAdminToken(session)
  const res = NextResponse.json({ success: true, role: session.role })
  res.cookies.set(ADMIN_COOKIE, token, adminCookieOptions())
  return res
}

export async function DELETE() {
  const res = NextResponse.json({ success: true })
  res.cookies.set(ADMIN_COOKIE, '', { maxAge: 0, path: '/' })
  return res
}
