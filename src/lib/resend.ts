import { Resend } from 'resend'

function getResend() {
  const key = process.env.RESEND_API_KEY
  if (!key) throw new Error('RESEND_API_KEY is not set')
  return new Resend(key)
}

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

  await getResend().emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to,
    subject: isZh
      ? `产品登记确认 - ${modelName}`
      : `Product Registration Confirmed - ${modelName}`,
    html: isZh
      ? `<p>您好 ${name}，</p><p>您的产品 <strong>${modelName}</strong> 登记申请（编号：${registrationId}）已收到，正在审核中。</p><p>审核完成后我们将发送通知邮件。</p>`
      : `<p>Hello ${name},</p><p>Your registration for <strong>${modelName}</strong> (ID: ${registrationId}) has been received and is under review.</p><p>We will notify you once the review is complete.</p>`,
  })
}

export async function sendReviewStatusUpdate({
  to,
  name,
  status,
  locale = 'zh-CN',
}: {
  to: string
  name: string
  status: 'RETURNED' | 'REGISTERED_NO_WARRANTY' | 'REGISTERED_WITH_WARRANTY'
  locale?: string
}) {
  const isZh = locale === 'zh-CN'

  const statusMessages: Record<typeof status, { subject: string; body: string }> = {
    RETURNED: {
      subject: isZh ? '产品登记需要修正' : 'Product Registration Needs Correction',
      body: isZh
        ? '您的产品登记信息需要修正，请登录会员中心查看详情。'
        : 'Your product registration requires correction. Please log in to your member portal for details.',
    },
    REGISTERED_NO_WARRANTY: {
      subject: isZh ? '产品登记已审核' : 'Product Registration Approved',
      body: isZh
        ? '您的产品登记已审核通过。由于安装日期超出180天，本次登记不含延保。'
        : 'Your product registration has been approved. Extended warranty is not applicable as the installation date exceeds 180 days.',
    },
    REGISTERED_WITH_WARRANTY: {
      subject: isZh ? '产品登记已审核（含延保）' : 'Product Registration Approved (With Warranty)',
      body: isZh
        ? '恭喜！您的产品登记已审核通过，并附有延长保修资格。请登录会员中心查看您的电子保修卡。'
        : 'Congratulations! Your product registration has been approved with extended warranty eligibility. Log in to your member portal to view your warranty card.',
    },
  }

  const { subject, body } = statusMessages[status]

  await getResend().emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to,
    subject,
    html: `<p>${isZh ? '您好' : 'Hello'} ${name},</p><p>${body}</p>`,
  })
}
