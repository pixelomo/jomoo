import { Resend } from 'resend'
import { categoryLabel, type ContactCategory } from '@/types/contact'

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

/** Inquiry category → env var holding that department's address. */
const CATEGORY_ENV: Record<ContactCategory, string> = {
  product:      'CONTACT_TO_PRODUCT',
  purchase:     'CONTACT_TO_PURCHASE',
  support:      'CONTACT_TO_SUPPORT',
  installation: 'CONTACT_TO_INSTALLATION',
  partnership:  'CONTACT_TO_PARTNERSHIP',
  other:        'CONTACT_TO_OTHER',
}

/**
 * Routes to the department that owns the selected category, falling back to
 * CONTACT_TO_EMAIL whenever a department address is not configured — an
 * unrouted inquiry still lands somewhere a human reads.
 */
function contactTo(category: ContactCategory) {
  if (process.env.NODE_ENV === 'development' && process.env.CONTACT_DEV_TO_EMAIL?.trim()) {
    return process.env.CONTACT_DEV_TO_EMAIL.trim()
  }
  const departmentAddress = process.env[CATEGORY_ENV[category]]?.trim()
  return departmentAddress || process.env.CONTACT_TO_EMAIL?.trim() || 'alan.s@uralaverse.com'
}

async function deliverEmail({
  to,
  subject,
  html,
  replyTo,
  devLabel,
  devSummary,
}: {
  to: string | string[]
  subject: string
  html: string
  replyTo?: string
  devLabel: string
  devSummary: Record<string, unknown>
}) {
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
          <td style="padding:10px 12px;border-bottom:1px solid #f4f4f5;font-size:13px;color:#71717a;vertical-align:top;width:140px">${label}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #f4f4f5;font-size:14px;color:#18181b;white-space:pre-wrap">${value}</td>
        </tr>`
    )
    .join('')

  await deliverEmail({
    to: contactTo(category),
    replyTo: email,
    subject: `【JOMOO】${label}: ${fullName}`,
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
  // Must be one of routing.locales — 'ja' would 404
  locale = 'en',
}: {
  to: string
  name: string
  locale?: string
}) {
  const signInUrl = `${appUrl()}/${locale}/sign-in`
  const dashboardUrl = `${appUrl()}/${locale}/dashboard`

  await deliverEmail({
    to,
    subject: '【JOMOO】会員登録が完了しました',
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
  locale = 'zh-CN',
}: {
  to: string
  name: string
  modelName: string
  registrationId: string
  locale?: string
}) {
  const isZh = locale === 'zh-CN'
  const dashboardUrl = `${appUrl()}/${locale}/dashboard`

  await getResend().emails.send({
    from: from(),
    to,
    subject: isZh
      ? `产品登记确认 - ${modelName}`
      : `Product Registration Confirmed — ${modelName}`,
    html: buildHtml(
      isZh ? `您好 ${name}，` : `Hello ${name},`,
      isZh
        ? [
            `您的产品 <strong>${modelName}</strong> 登记申请（编号：<code>${registrationId}</code>）已成功提交。`,
            '我们将在 3–5 个工作日内完成审核，审核结果将通过邮件通知您。',
            `<a href="${dashboardUrl}" style="color:#18181b">前往会员中心查看进度 →</a>`,
          ]
        : [
            `Your registration for <strong>${modelName}</strong> (ID: <code>${registrationId}</code>) has been received and is under review.`,
            'We will notify you by email once the review is complete (typically 3–5 business days).',
            `<a href="${dashboardUrl}" style="color:#18181b">Go to Member Portal →</a>`,
          ]
    ),
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
  locale = 'zh-CN',
}: {
  to: string
  name: string
  modelName: string
  registrationId: string
  expiryDate: string
  locale?: string
}) {
  const isZh = locale === 'zh-CN'
  const warrantyUrl = `${appUrl()}/${locale}/warranty/${registrationId}`
  const formattedExpiry = new Date(expiryDate).toLocaleDateString(
    isZh ? 'zh-CN' : 'en-GB',
    { year: 'numeric', month: 'long', day: 'numeric' }
  )

  await getResend().emails.send({
    from: from(),
    to,
    subject: isZh
      ? `电子保修卡已生成 - ${modelName}`
      : `Warranty Card Generated — ${modelName}`,
    html: buildHtml(
      isZh ? `您好 ${name}，恭喜！` : `Congratulations ${name}!`,
      isZh
        ? [
            `您的产品 <strong>${modelName}</strong> 序列号验证通过，电子保修卡已自动生成。`,
            `保修有效期至：<strong>${formattedExpiry}</strong>`,
            `<a href="${warrantyUrl}" style="display:inline-block;margin-top:8px;padding:10px 20px;background:#18181b;color:#fff;border-radius:6px;text-decoration:none;font-weight:600">查看电子保修卡</a>`,
          ]
        : [
            `Your serial number for <strong>${modelName}</strong> has been verified and your electronic warranty card is ready.`,
            `Warranty valid until: <strong>${formattedExpiry}</strong>`,
            `<a href="${warrantyUrl}" style="display:inline-block;margin-top:8px;padding:10px 20px;background:#18181b;color:#fff;border-radius:6px;text-decoration:none;font-weight:600">View Warranty Card</a>`,
          ]
    ),
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
  locale = 'zh-CN',
}: {
  to: string
  name: string
  status: 'RETURNED' | 'REGISTERED_NO_WARRANTY' | 'REGISTERED_WITH_WARRANTY'
  registrationId?: string
  locale?: string
}) {
  const isZh = locale === 'zh-CN'
  const dashboardUrl = `${appUrl()}/${locale}/dashboard`

  type MsgMap = Record<typeof status, { subject: string; lines: string[] }>

  const messages: MsgMap = {
    RETURNED: {
      subject: isZh ? '产品登记需要修正' : 'Product Registration Needs Correction',
      lines: isZh
        ? [
            '您的产品登记信息需要修正，请登录会员中心查看具体原因，更新后重新提交。',
            `<a href="${dashboardUrl}" style="color:#18181b">前往会员中心 →</a>`,
          ]
        : [
            'Your product registration requires correction. Please log in to your member portal, review the feedback, and resubmit.',
            `<a href="${dashboardUrl}" style="color:#18181b">Go to Member Portal →</a>`,
          ],
    },
    REGISTERED_NO_WARRANTY: {
      subject: isZh ? '产品登记已审核通过' : 'Product Registration Approved',
      lines: isZh
        ? [
            '您的产品登记已审核通过。',
            '注：由于安装日期超出180天，本次登记不包含延长保修资格。',
            `<a href="${dashboardUrl}" style="color:#18181b">前往会员中心 →</a>`,
          ]
        : [
            'Your product registration has been approved.',
            'Note: Extended warranty is not applicable as the installation date exceeds 180 days.',
            `<a href="${dashboardUrl}" style="color:#18181b">Go to Member Portal →</a>`,
          ],
    },
    REGISTERED_WITH_WARRANTY: {
      subject: isZh ? '电子保修卡已生成' : 'Warranty Card Ready',
      lines: (() => {
        const warrantyUrl = registrationId
          ? `${appUrl()}/${locale}/warranty/${registrationId}`
          : dashboardUrl
        return isZh
          ? [
              '您的产品登记已审核通过，电子保修卡已生成。',
              `<a href="${warrantyUrl}" style="display:inline-block;margin-top:8px;padding:10px 20px;background:#18181b;color:#fff;border-radius:6px;text-decoration:none;font-weight:600">查看电子保修卡</a>`,
            ]
          : [
              'Your product registration has been approved and your warranty card is ready.',
              `<a href="${warrantyUrl}" style="display:inline-block;margin-top:8px;padding:10px 20px;background:#18181b;color:#fff;border-radius:6px;text-decoration:none;font-weight:600">View Warranty Card</a>`,
            ]
      })(),
    },
  }

  const { subject, lines } = messages[status]

  await getResend().emails.send({
    from: from(),
    to,
    subject,
    html: buildHtml(isZh ? `您好 ${name}，` : `Hello ${name},`, lines),
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
