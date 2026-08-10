import 'server-only'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { emailTemplate } from '@/lib/db/schema'
import {
  EMAIL_TEMPLATES,
  EMAIL_TEMPLATES_BY_ID,
  type AdminTemplate,
} from '@/lib/emailTemplateDefs'
import { renderTemplate, type RenderedEmail } from '@/lib/emailRender'

export {
  EMAIL_TEMPLATES,
  EMAIL_TEMPLATES_BY_ID,
  templatesForNotification,
} from '@/lib/emailTemplateDefs'
export type { EmailTemplateDef, TemplateVariable, AdminTemplate } from '@/lib/emailTemplateDefs'

/**
 * Reads whatever an admin has saved for this template, or null for "unedited".
 *
 * A database hiccup must never stop customer email going out, so a failed read
 * falls back to the shipped wording rather than throwing.
 */
async function templateOverride(id: string) {
  try {
    const [row] = await db
      .select()
      .from(emailTemplate)
      .where(eq(emailTemplate.id, id))
      .limit(1)
    return row ?? null
  } catch (err) {
    console.error(`[email-templates] could not read "${id}", using the default wording`, err)
    return null
  }
}

/** The one call the send functions in resend.ts make. */
export async function buildEmail(
  id: string,
  vars: Record<string, unknown>
): Promise<RenderedEmail> {
  const def = EMAIL_TEMPLATES_BY_ID[id]
  if (!def) throw new Error(`Unknown email template "${id}"`)

  const override = await templateOverride(id)

  return renderTemplate(
    def,
    {
      subject: override?.subject ?? def.subject,
      greeting: override?.greeting ?? def.greeting,
      body: override?.body ?? def.body,
    },
    vars
  )
}

/** Every template with its current wording, for the admin page. */
export async function allTemplates(): Promise<AdminTemplate[]> {
  let rows: (typeof emailTemplate.$inferSelect)[] = []
  try {
    rows = await db.select().from(emailTemplate)
  } catch (err) {
    console.error('[email-templates] could not read overrides', err)
  }
  const overrides = Object.fromEntries(rows.map((r) => [r.id, r]))

  return EMAIL_TEMPLATES.map((def) => {
    const override = overrides[def.id]
    return {
      id: def.id,
      notification: def.notification,
      label: def.label,
      description: def.description,
      wrapper: def.wrapper,
      subject: override?.subject ?? def.subject,
      greeting: override?.greeting ?? def.greeting,
      body: override?.body ?? def.body,
      defaultSubject: def.subject,
      defaultGreeting: def.greeting,
      defaultBody: def.body,
      variables: def.variables,
      edited: Boolean(override),
      updatedAt: override?.updatedAt?.toISOString() ?? null,
      updatedBy: override?.updatedBy ?? null,
    }
  })
}
