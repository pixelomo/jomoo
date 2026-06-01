import { NextResponse } from 'next/server'

// Clerk has been replaced with Better Auth. This endpoint is no longer used.
export async function POST() {
  return NextResponse.json({ message: 'Deprecated' }, { status: 410 })
}
