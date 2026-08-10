import { Resend } from 'resend'
import {
  categoryEmail,
  categoryLabel,
  type ContactCategory,
  type ContactData,
} from '@/types/contact'
import { notificationConfig, type NotificationKey } from '@/lib/notifications'
import { buildEmail } from '@/lib/emailTemplates'

/**
 * Everything a visitor typed goes into an HTML email, so it has to be escaped —
 * otherwise a contact form message can inject markup into the mail staff read.
 */
function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function isResendConfigured() {
  return Boolean(process.env.RESEND_API_KEY?.trim() && process.env.RESEND_FROM_EMAIL?.trim())
}

function contactDevFallbackEnabled() {
  return (
    process.env.NODE_ENV === 'development' &&
    process.env.CONTACT_DEV_FALLBACK !== 'false'
  )
}

function getResend() {
  const key = process.env.RESEND_API_KEY
  if (!key) throw new Error('RESEND_API_KEY is not set')
  return new Resend(key)
}

function from() {
  const addr = process.env.RESEND_FROM_EMAIL
  if (!addr) throw new Error('RESEND_FROM_EMAIL is not set')
  return addr
}

function appUrl() {
  return (process.env.NEXT_PUBLIC_APP_URL ?? '').replace(/\/$/, '')
}

/**
 * Routes to the department that owns the selected category.
 *
 * The address in types/contact.ts is the source of truth; a CONTACT_TO_<ID>
 * environment variable overrides it so a department can be redirected without
 * a deploy. CONTACT_TO_EMAIL is the last resort and should never be reached —
 * every category ships with an address.
 */
export function contactAddressFor(category: ContactCategory) {
  if (process.env.NODE_ENV === 'development' && process.env.CONTACT_DEV_TO_EMAIL?.trim()) {
    return process.env.CONTACT_DEV_TO_EMAIL.trim()
  }

  const override = process.env[`CONTACT_TO_${category.toUpperCase()}`]?.trim()
  const address = override || categoryEmail(category) || process.env.CONTACT_TO_EMAIL?.trim()

  if (!address) throw new Error(`No contact address configured for category "${category}"`)
  return address
}

async function deliverEmail({
  to,
  subject,
  html,
  replyTo,
  devLabel,
  devSummary,
  notification,
}: {
  to: string | string[]
  subject: string
  html: string
  replyTo?: string
  devLabel: string
  devSummary: Record<string, unknown>
  /** Looked up so admins can switch it off or copy operational staff. */
  notification?: NotificationKey
}) {
  let cc: string[] = []
  if (notification) {
    const config = await notificationConfig(notification)
    if (!config.enabled) {
      console.info(`[email] ${devLabel} skipped — switched off in the admin portal`)
      return { skipped: true as const }
    }
    cc = config.cc
  }

  if (!isResendConfigured()) {
    if (contactDevFallbackEnabled()) {
      console.info(`[email:dev-fallback] ${devLabel}`, { to, replyTo, ...devSummary })
      return { devFallback: true as const }
    }
    throw new Error('EMAIL_SEND_FAILED')
  }

  const { data, error } = await getResend().emails.send({
    from: from(),
    to,
    ...(cc.length && { cc }),
    replyTo,
    subject,
    html,
  })

  if (error) {
    if (contactDevFallbackEnabled()) {
      console.error(`[email:dev-fallback] Resend error for ${devLabel}:`, error)
      console.info(`[email:dev-fallback] Payload`, { to, replyTo, ...devSummary })
      return { devFallback: true as const }
    }
    throw new Error('EMAIL_SEND_FAILED')
  }

  if (process.env.NODE_ENV === 'development') {
    console.info(`[email] sent ${devLabel}`, { id: data?.id, to, from: from() })
  }

  return { id: data?.id }
}

// ─────────────────────────────────────────────
// Contact form inquiry
// ─────────────────────────────────────────────
export async function sendContactInquiry({
  category,
  lastName,
  firstName,
  companyName,
  email,
  countryCode,
  phoneNumber,
  message,
  showroomReservation,
  preferredDateTime,
}: {
  category: ContactCategory
  lastName: string
  firstName: string
  companyName?: string
  email: string
  countryCode?: string
  phoneNumber?: string
  message: string
  showroomReservation: boolean
  preferredDateTime?: string
}) {
  const fullName = `${lastName} ${firstName}`
  const phone =
    countryCode && phoneNumber ? `${countryCode} ${phoneNumber}` : phoneNumber || '—'
  const showroom = showroomReservation
    ? preferredDateTime
      ? `はい（${preferredDateTime}）`
      : 'はい'
    : 'いいえ'

  const label = categoryLabel(category)

  const rows = [
    ['お問い合わせ種別', label],
    ['お名前', fullName],
    ['会社名', companyName || '—'],
    ['メールアドレス', email],
    ['会社電話番号', phone],
    ['ショールーム予約', showroom],
    ['お問い合わせ内容', message],
  ]

  // Built here rather than in the template so the cells stay escaped whatever
  // an admin does to the wording around them.
  const detailsTable = rows
    .map(
      ([label, value]) => `
        <tr>
          <td style="padding:10px 12px;border-bottom:1px solid #f4f4f5;font-size:13px;color:#71717a;vertical-align:top;width:140px">${escapeHtml(label)}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #f4f4f5;font-size:14px;color:#18181b;white-space:pre-wrap">${escapeHtml(value)}</td>
        </tr>`
    )
    .join('')

  await deliverEmail({
    to: contactAddressFor(category),
    replyTo: email,
    notification: 'contact_staff',
    devLabel: `contact inquiry (${category})`,
    devSummary: {
      category,
      fullName,
      companyName,
      email,
      phone,
      showroom,
      message,
    },
    ...(await buildEmail('contact_staff', {
      name: fullName,
      categoryLabel: label,
      detailsTable,
    })),
  })
}

// ─────────────────────────────────────────────
// Email verification (click-to-verify, required before first sign-in)
// ─────────────────────────────────────────────
export async function sendVerificationEmail({
  to,
  name,
  url,
}: {
  to: string
  name: string
  url: string
}) {
  await deliverEmail({
    to,
    devLabel: 'email verification',
    devSummary: { name, url },
    ...(await buildEmail('email_verification', { name, url })),
  })
}

// ─────────────────────────────────────────────
// Member sign-up confirmation (fires once, on account creation)
// ─────────────────────────────────────────────
export async function sendMemberWelcome({
  to,
  name,
}: {
  to: string
  name: string
}) {
  const signInUrl = `${appUrl()}/sign-in`
  const dashboardUrl = `${appUrl()}/dashboard`

  await deliverEmail({
    to,
    notification: 'welcome',
    devLabel: 'member welcome',
    devSummary: { name },
    ...(await buildEmail('welcome', { name, dashboardUrl, signInUrl })),
  })
}

// ─────────────────────────────────────────────
// Registration received (serial unverified / PENDING review)
// ─────────────────────────────────────────────
export async function sendRegistrationConfirmation({
  to,
  name,
  modelName,
  registrationId,
}: {
  to: string
  name: string
  modelName: string
  registrationId: string
}) {
  const dashboardUrl = `${appUrl()}/dashboard`

  await deliverEmail({
    to,
    notification: 'registration',
    devLabel: 'registration received',
    devSummary: { modelName, registrationId },
    ...(await buildEmail('registration_received', {
      name,
      modelName,
      registrationId,
      dashboardUrl,
    })),
  })
}

// ─────────────────────────────────────────────
// Warranty card auto-generated (serial verified, instant approval)
// ─────────────────────────────────────────────
export async function sendWarrantyIssuedEmail({
  to,
  name,
  modelName,
  registrationId,
  expiryDate,
}: {
  to: string
  name: string
  modelName: string
  registrationId: string
  expiryDate: string
}) {
  const warrantyUrl = `${appUrl()}/warranty/${registrationId}`
  const formattedExpiry = new Date(expiryDate).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  await deliverEmail({
    to,
    notification: 'warranty',
    devLabel: 'warranty issued',
    devSummary: { modelName, registrationId, formattedExpiry },
    ...(await buildEmail('warranty_issued', {
      name,
      modelName,
      expiryDate: formattedExpiry,
      warrantyUrl,
    })),
  })
}

// ─────────────────────────────────────────────
// Admin review outcome (RETURNED / REGISTERED_NO_WARRANTY / REGISTERED_WITH_WARRANTY)
// ─────────────────────────────────────────────
export async function sendReviewStatusUpdate({
  to,
  name,
  status,
  registrationId,
}: {
  to: string
  name: string
  status: 'RETURNED' | 'REGISTERED_NO_WARRANTY' | 'REGISTERED_WITH_WARRANTY'
  registrationId?: string
}) {
  const dashboardUrl = `${appUrl()}/dashboard`

  const templateFor: Record<typeof status, string> = {
    RETURNED: 'review_returned',
    REGISTERED_NO_WARRANTY: 'review_no_warranty',
    REGISTERED_WITH_WARRANTY: 'review_with_warranty',
  }

  await deliverEmail({
    to,
    notification: 'registration',
    devLabel: `review outcome (${status})`,
    devSummary: { status, registrationId },
    ...(await buildEmail(templateFor[status], {
      name,
      dashboardUrl,
      // Falls back to the dashboard when there is no registration to link to,
      // so the button in the template never points at /warranty/undefined.
      warrantyUrl: registrationId ? `${appUrl()}/warranty/${registrationId}` : dashboardUrl,
    })),
  })
}

// ─────────────────────────────────────────────
// Password reset (wired to Better Auth's forgot-password flow)
// ─────────────────────────────────────────────
export async function sendPasswordReset({
  to,
  name,
  url,
}: {
  to: string
  name: string
  url: string
}) {
  await deliverEmail({
    to,
    notification: 'password_reset',
    devLabel: 'password reset',
    devSummary: { name, url },
    ...(await buildEmail('password_reset', { name, url })),
  })
}

// ─────────────────────────────────────────────
// Contact form acknowledgement, to the person who wrote in
// ─────────────────────────────────────────────
export async function sendContactAcknowledgement(data: ContactData) {
  const fullName = `${data.lastName} ${data.firstName}`.trim()

  await deliverEmail({
    to: data.email,
    notification: 'contact_reply',
    devLabel: 'contact acknowledgement',
    devSummary: { category: data.category, to: data.email },
    ...(await buildEmail('contact_reply', {
      name: fullName,
      categoryLabel: categoryLabel(data.category),
      message: data.message,
    })),
  })
}
