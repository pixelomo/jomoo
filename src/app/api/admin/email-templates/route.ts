import { NextResponse } from 'next/server'
import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { getAdminSession } from '@/lib/admin-auth'
import { db } from '@/lib/db'
import { emailTemplate } from '@/lib/db/schema'
import { allTemplates, EMAIL_TEMPLATES_BY_ID } from '@/lib/emailTemplates'

const SaveSchema = z.object({
  id: z.string().min(1),
  subject: z.string().min(1).max(300),
  greeting: z.string().max(300).optional(),
  body: z.string().min(1).max(20_000),
})

const ResetSchema = z.object({ id: z.string().min(1) })

export async function GET() {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return NextResponse.json({ templates: await allTemplates() })
}

export async function PUT(req: Request) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = SaveSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 422 })
  }

  const def = EMAIL_TEMPLATES_BY_ID[parsed.data.id]
  if (!def) return NextResponse.json({ error: 'Unknown template' }, { status: 404 })

  // A placeholder this template has no value for renders as nothing, so a typo
  // would silently delete a sentence's subject. Named back rather than saved.
  const known = new Set(def.variables.map((v) => v.name))
  const unknown = [
    ...new Set(
      [...`${parsed.data.subject}\n${parsed.data.greeting ?? ''}\n${parsed.data.body}`.matchAll(
        /\{\{\{?\s*(\w+)\s*\}?\}\}/g
      )].map((m) => m[1])
    ),
  ].filter((name) => !known.has(name))

  if (unknown.length) {
    return NextResponse.json(
      { error: 'unknown_variables', detail: unknown.join(', ') },
      { status: 422 }
    )
  }

  await db
    .insert(emailTemplate)
    .values({
      id: parsed.data.id,
      subject: parsed.data.subject,
      greeting: parsed.data.greeting ?? null,
      body: parsed.data.body,
      updatedBy: session.username,
    })
    .onConflictDoUpdate({
      target: emailTemplate.id,
      set: {
        subject: parsed.data.subject,
        greeting: parsed.data.greeting ?? null,
        body: parsed.data.body,
        updatedBy: session.username,
        updatedAt: new Date(),
      },
    })

  return NextResponse.json({ success: true })
}

/**
 * Reset is a delete: with no row stored the send path falls back to the wording
 * in emailTemplateDefs.ts, so a template that has never been edited keeps
 * benefiting from any improvement shipped later.
 */
export async function DELETE(req: Request) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = ResetSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed' }, { status: 422 })
  }

  await db.delete(emailTemplate).where(eq(emailTemplate.id, parsed.data.id))
  return NextResponse.json({ success: true })
}
