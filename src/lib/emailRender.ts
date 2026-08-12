/**
 * Turning a template into the email that gets sent.
 *
 * Pure — no database, no `server-only` — so the admin edit modal renders its
 * preview with exactly the code that will send the real thing. A preview built
 * by a second implementation is a preview that eventually lies.
 */

import type { EmailTemplateDef } from '@/lib/emailTemplateDefs'

/**
 * Anything a customer typed ends up inside an HTML email, so it has to be
 * escaped — otherwise a contact form message can inject markup into the mail
 * staff read. The template author's own HTML is deliberately left alone; only
 * someone signed into the admin portal can edit a template.
 */
export function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/**
 * Fills {{name}} and {{{rawHtml}}}.
 *
 * Triple braces first: the double-brace pattern also matches a triple-brace
 * placeholder, so doing them the other way round would escape the very
 * fragment that asked not to be.
 *
 * A placeholder with no matching value becomes empty rather than being left
 * showing its own braces — a customer seeing "{{modelName}}" in their inbox is
 * worse than a gap, and a mistyped variable name then fails visibly in the
 * preview instead of shipping template syntax.
 */
export function fillTemplate(text: string, vars: Record<string, unknown>): string {
  return text
    .replace(/\{\{\{\s*(\w+)\s*\}\}\}/g, (_m, key: string) => String(vars[key] ?? ''))
    .replace(/\{\{\s*(\w+)\s*\}\}/g, (_m, key: string) => escapeHtml(vars[key]))
}

/**
 * The same substitution for the subject line, which is plain text rather than
 * HTML — escaping there would show a customer called "Smith & Co" their own
 * name as "Smith &amp; Co" in their inbox.
 */
export function fillPlain(text: string, vars: Record<string, unknown>): string {
  return text.replace(/\{\{\{?\s*(\w+)\s*\}?\}\}/g, (_m, key: string) => String(vars[key] ?? ''))
}


/**
 * Shared footer: the wordmark and the copyright line, on every email.
 *
 * A hosted PNG rather than the SVG the site uses — Gmail strips SVG, and it
 * strips data: URIs too, so the only thing that renders everywhere is an image
 * served over https. `logoUrl` is absolute for the same reason: an email has no
 * origin to resolve a relative path against.
 *
 * Clients that block remote images will show the alt text, which is why it is
 * the brand name and not "logo".
 */
function footerHtml(logoUrl: string, padding: string): string {
  return `<div style="padding:${padding};border-top:1px solid #e4e4e7;text-align:center">
      <img src="${logoUrl}" alt="JOMOO" width="116" height="24" style="display:inline-block;width:116px;height:24px;border:0;outline:none;text-decoration:none" />
      <p style="margin:12px 0 0;font-size:12px;color:#a1a1aa;line-height:1.6">${COPYRIGHT}</p>
    </div>`
}

/** Fixed rather than built from the current year — this is the client's wording. */
const COPYRIGHT = '\u00a9 2026 JOMOO KITCHEN &amp; BATH CO., LTD. All Rights Reserved.'

/** Where the wordmark is served from when a caller does not say. */
export const DEFAULT_EMAIL_LOGO = '/images/logo-email.png'

/** The JOMOO member email — one column, greeting, paragraphs, footer. */
function standardWrapper(greeting: string, body: string, logoUrl: string): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f4f4f5;margin:0;padding:32px 16px">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:8px;overflow:hidden;border:1px solid #e4e4e7">
    <div style="background:#18181b;padding:20px 28px">
      <p style="margin:0;color:#fff;font-size:18px;font-weight:700;letter-spacing:0.05em">JOMOO</p>
    </div>
    <div style="padding:28px 28px 8px">
      <p style="margin:0 0 16px;font-size:15px;color:#18181b">${greeting}</p>
      <div style="font-size:14px;color:#3f3f46;line-height:1.6">${body}</div>
    </div>
    <div style="padding:16px 28px 0;margin-top:8px">
      <p style="margin:0;font-size:12px;color:#a1a1aa">JOMOO Member Services — このメールに返信しないでください</p>
    </div>
    ${footerHtml(logoUrl, '20px 28px 24px')}
  </div>
</body>
</html>`
}

/** The wider internal one, for the enquiry table staff read. */
function contactWrapper(body: string, logoUrl: string): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f4f4f5;margin:0;padding:32px 16px">
  <div style="max-width:640px;margin:0 auto;background:#fff;border-radius:8px;overflow:hidden;border:1px solid #e4e4e7">
    <div style="background:#18181b;padding:20px 28px">
      <p style="margin:0;color:#fff;font-size:18px;font-weight:700;letter-spacing:0.05em">JOMOO お問い合わせ</p>
    </div>
    <div style="padding:24px 28px 16px">
      <table style="width:100%;border-collapse:collapse">${body}</table>
    </div>
    ${footerHtml(logoUrl, '20px 28px 24px')}
  </div>
</body>
</html>`
}

export interface RenderedEmail {
  subject: string
  html: string
}

export interface TemplateContent {
  subject: string
  greeting?: string | null
  body: string
}

/**
 * The wrapper is not editable: an admin changes the words, not the layout, so
 * one unclosed tag cannot take the whole email apart.
 */
export function renderTemplate(
  def: Pick<EmailTemplateDef, 'wrapper'>,
  content: TemplateContent,
  vars: Record<string, unknown>,
  /** Absolute URL of the footer wordmark. The admin preview passes its own
   *  origin; the send path passes the public site's. */
  logoUrl: string = DEFAULT_EMAIL_LOGO
): RenderedEmail {
  const subject = fillPlain(content.subject, vars)

  const paragraphs = content.body
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => fillTemplate(line, vars))

  if (def.wrapper === 'contact') {
    // The enquiry table is one raw fragment, not a run of paragraphs.
    return { subject, html: contactWrapper(paragraphs.join(''), logoUrl) }
  }

  return {
    subject,
    html: standardWrapper(
      fillTemplate(content.greeting ?? '', vars),
      paragraphs.map((p) => `<p style="margin:0 0 12px">${p}</p>`).join(''),
      logoUrl
    ),
  }
}

/** Fills a template with each variable's sample value, for the preview. */
export function sampleVars(def: EmailTemplateDef): Record<string, unknown> {
  return Object.fromEntries(def.variables.map((v) => [v.name, v.sample]))
}
