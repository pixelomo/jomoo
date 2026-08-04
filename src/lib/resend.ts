import { Resend } from 'resend'
import {
  categoryEmail,
  categoryLabel,
  type ContactCategory,
  type ContactData,
} from '@/types/contact'
import { notificationConfig, type NotificationKey } from '@/lib/notifications'

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

  const bodyHtml = rows
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
    subject: `【JOMOO】${label}: ${fullName}`,
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
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f4f4f5;margin:0;padding:32px 16px">
  <div style="max-width:640px;margin:0 auto;background:#fff;border-radius:8px;overflow:hidden;border:1px solid #e4e4e7">
    <div style="background:#18181b;padding:20px 28px">
      <p style="margin:0;color:#fff;font-size:18px;font-weight:700;letter-spacing:0.05em">JOMOO お問い合わせ</p>
    </div>
    <div style="padding:24px 28px 8px">
      <table style="width:100%;border-collapse:collapse">${bodyHtml}</table>
    </div>
  </div>
</body>
</html>`,
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
    subject: '【JOMOO】メールアドレスのご確認',
    devLabel: 'email verification',
    devSummary: { name, url },
    html: buildHtml(`${name} 様`, [
      'JOMOO の会員登録ありがとうございます。',
      '下記のボタンからメールアドレスのご確認をお願いいたします。確認完了後、マイページをご利用いただけます。',
      `<a href="${url}" style="display:inline-block;margin-top:8px;padding:10px 20px;background:#18181b;color:#fff;border-radius:6px;text-decoration:none;font-weight:600">メールアドレスを確認する</a>`,
      `<span style="font-size:13px;color:#71717a">ボタンが開かない場合は、次のURLをブラウザに貼り付けてください:<br /><span style="word-break:break-all">${url}</span></span>`,
      '<span style="font-size:13px;color:#71717a">お心当たりのない場合は、お手数ですがこのメールを破棄してください。</span>',
    ]),
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
    subject: '【JOMOO】会員登録が完了しました',
    notification: 'welcome',
    devLabel: 'member welcome',
    devSummary: { name },
    html: buildHtml(`${name} 様`, [
      'この度は JOMOO の会員登録をいただき、誠にありがとうございます。',
      '会員登録が完了しました。マイページより製品登録や保証書の確認、各種お手続きがご利用いただけます。',
      `<a href="${dashboardUrl}" style="display:inline-block;margin-top:8px;padding:10px 20px;background:#18181b;color:#fff;border-radius:6px;text-decoration:none;font-weight:600">マイページへ</a>`,
      `<span style="font-size:13px;color:#71717a">ログインは <a href="${signInUrl}" style="color:#18181b">こちら</a> から行えます。</span>`,
      '<span style="font-size:13px;color:#71717a">お心当たりのない場合は、お手数ですがこのメールを破棄してください。</span>',
    ]),
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
    subject: `【JOMOO】製品登録を受け付けました - ${modelName}`,
    html: buildHtml(`${name} 様`, [
      `<strong>${modelName}</strong> の製品登録（登録番号：<code>${registrationId}</code>）を受け付けました。`,
      '3〜5営業日以内に審査を行い、結果をメールにてお知らせいたします。',
      `<a href="${dashboardUrl}" style="color:#18181b">マイページで進捗を確認する →</a>`,
    ]),
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
    subject: `【JOMOO】電子保証カードを発行しました - ${modelName}`,
    html: buildHtml(`${name} 様`, [
      `<strong>${modelName}</strong> の製造番号を確認し、電子保証カードを発行いたしました。`,
      `保証期限：<strong>${formattedExpiry}</strong>`,
      `<a href="${warrantyUrl}" style="display:inline-block;margin-top:8px;padding:10px 20px;background:#18181b;color:#fff;border-radius:6px;text-decoration:none;font-weight:600">電子保証カードを見る</a>`,
    ]),
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

  type MsgMap = Record<typeof status, { subject: string; lines: string[] }>

  const messages: MsgMap = {
    RETURNED: {
      subject: '【JOMOO】製品登録の修正のお願い',
      lines: [
        'ご登録いただいた内容に修正が必要です。マイページより理由をご確認の上、修正して再度ご提出ください。',
        `<a href="${dashboardUrl}" style="color:#18181b">マイページへ →</a>`,
      ],
    },
    REGISTERED_NO_WARRANTY: {
      subject: '【JOMOO】製品登録の審査が完了しました',
      lines: [
        'ご登録いただいた製品の審査が完了しました。',
        '※ 設置日から180日を超えているため、今回のご登録は延長保証の対象外となります。',
        `<a href="${dashboardUrl}" style="color:#18181b">マイページへ →</a>`,
      ],
    },
    REGISTERED_WITH_WARRANTY: {
      subject: '【JOMOO】電子保証カードを発行しました',
      lines: (() => {
        const warrantyUrl = registrationId
          ? `${appUrl()}/warranty/${registrationId}`
          : dashboardUrl
        return [
          'ご登録いただいた製品の審査が完了し、電子保証カードを発行いたしました。',
          `<a href="${warrantyUrl}" style="display:inline-block;margin-top:8px;padding:10px 20px;background:#18181b;color:#fff;border-radius:6px;text-decoration:none;font-weight:600">電子保証カードを見る</a>`,
        ]
      })(),
    },
  }

  const { subject, lines } = messages[status]

  await deliverEmail({
    to,
    notification: 'registration',
    devLabel: `review outcome (${status})`,
    devSummary: { status, registrationId },
    subject,
    html: buildHtml(`${name} 様`, lines),
  })
}

// ─────────────────────────────────────────────
// Shared HTML wrapper
// ─────────────────────────────────────────────
function buildHtml(greeting: string, lines: string[]): string {
  const body = lines.map((l) => `<p style="margin:0 0 12px">${l}</p>`).join('')
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
    <div style="padding:16px 28px 24px;border-top:1px solid #f4f4f5;margin-top:8px">
      <p style="margin:0;font-size:12px;color:#a1a1aa">JOMOO Member Services — このメールに返信しないでください</p>
    </div>
  </div>
</body>
</html>`
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
    subject: '【JOMOO】パスワード再設定のご案内',
    html: buildHtml(`${name} 様`, [
      'パスワード再設定のご依頼を承りました。',
      '下記のボタンから新しいパスワードをご設定ください。',
      `<a href="${url}" style="display:inline-block;margin-top:8px;padding:10px 20px;background:#18181b;color:#fff;border-radius:6px;text-decoration:none;font-weight:600">パスワードを再設定する</a>`,
      `<span style="font-size:13px;color:#71717a">ボタンが開かない場合は、次のURLをブラウザに貼り付けてください:<br /><span style="word-break:break-all">${url}</span></span>`,
      '<span style="font-size:13px;color:#71717a">このリンクの有効期限は1時間です。お心当たりのない場合は、お手数ですがこのメールを破棄してください。</span>',
    ]),
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
    subject: '【JOMOO】お問い合わせありがとうございます',
    html: buildHtml(`${fullName} 様`, [
      'このたびはJOMOOへお問い合わせいただき、誠にありがとうございます。',
      '以下の内容で承りました。担当部署より順次ご連絡いたしますので、今しばらくお待ちください。',
      `<span style="font-size:13px;color:#71717a">お問い合わせ種別：${categoryLabel(data.category)}</span>`,
      `<span style="display:block;padding:12px 16px;background:#f4f4f5;border-radius:6px;white-space:pre-wrap">${escapeHtml(data.message)}</span>`,
      '<span style="font-size:13px;color:#71717a">本メールは送信専用です。ご返信いただいてもお答えできませんのでご了承ください。</span>',
    ]),
  })
}
