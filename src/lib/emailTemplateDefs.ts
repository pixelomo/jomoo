/**
 * The wording of every automatic email, as shipped.
 *
 * These are defaults, not the last word: an admin can rewrite any of them from
 * the Emails page and the edit is stored in email_templates. Nothing here is
 * read at send time unless no edit exists — see emailTemplates.ts.
 *
 * Client-safe on purpose (no database, no `server-only`): the edit modal needs
 * the defaults to offer "reset", and the variable lists to explain what can go
 * in the text.
 *
 * `body` is one paragraph per line. Placeholders are Mustache-shaped:
 *   {{name}}    — the value, escaped, safe for anything a customer typed
 *   {{{table}}} — inserted as raw HTML; only for values this app builds itself
 */

export interface TemplateVariable {
  name: string
  description: string
  sample: string
  /** Substituted without escaping. Only ever HTML this codebase generated. */
  raw?: boolean
}

export interface EmailTemplateDef {
  id: string
  /** notification_settings key this email is switched on and off by, if any. */
  notification: string | null
  label: string
  description: string
  /** 'standard' is the JOMOO member wrapper; 'contact' is the wider staff one. */
  wrapper: 'standard' | 'contact'
  subject: string
  /** Line above the body. Unused by the 'contact' wrapper. */
  greeting: string
  body: string
  variables: TemplateVariable[]
}

const BUTTON =
  'display:inline-block;margin-top:8px;padding:10px 20px;background:#18181b;color:#fff;border-radius:6px;text-decoration:none;font-weight:600'
const MUTED = 'font-size:13px;color:#71717a'

const NAME: TemplateVariable = {
  name: 'name',
  description: "The member's name",
  sample: '山田 太郎',
}

const DASHBOARD_URL: TemplateVariable = {
  name: 'dashboardUrl',
  description: 'Link to the member dashboard',
  sample: 'https://example.com/dashboard',
}

export const EMAIL_TEMPLATES: EmailTemplateDef[] = [
  {
    id: 'welcome',
    notification: 'welcome',
    label: '会員登録完了メール',
    description: 'Sent once, immediately after an account is created.',
    wrapper: 'standard',
    subject: '【JOMOO】会員登録が完了しました',
    greeting: '{{name}} 様',
    body: [
      'この度は JOMOO の会員登録をいただき、誠にありがとうございます。',
      '会員登録が完了しました。マイページより製品登録や保証書の確認、各種お手続きがご利用いただけます。',
      `<a href="{{dashboardUrl}}" style="${BUTTON}">マイページへ</a>`,
      `<span style="${MUTED}">ログインは <a href="{{signInUrl}}" style="color:#18181b">こちら</a> から行えます。</span>`,
      `<span style="${MUTED}">お心当たりのない場合は、お手数ですがこのメールを破棄してください。</span>`,
    ].join('\n'),
    variables: [
      NAME,
      DASHBOARD_URL,
      { name: 'signInUrl', description: 'Link to the sign-in page', sample: 'https://example.com/sign-in' },
    ],
  },
  {
    id: 'password_reset',
    notification: 'password_reset',
    label: 'パスワード再設定メール',
    description: 'The reset link sent from the forgot-password form.',
    wrapper: 'standard',
    subject: '【JOMOO】パスワード再設定のご案内',
    greeting: '{{name}} 様',
    body: [
      'パスワード再設定のご依頼を承りました。',
      '下記のボタンから新しいパスワードをご設定ください。',
      `<a href="{{url}}" style="${BUTTON}">パスワードを再設定する</a>`,
      `<span style="${MUTED}">ボタンが開かない場合は、次のURLをブラウザに貼り付けてください:<br /><span style="word-break:break-all">{{url}}</span></span>`,
      `<span style="${MUTED}">このリンクの有効期限は1時間です。お心当たりのない場合は、お手数ですがこのメールを破棄してください。</span>`,
    ].join('\n'),
    variables: [
      NAME,
      { name: 'url', description: 'The one-time reset link', sample: 'https://example.com/reset?token=…' },
    ],
  },
  {
    id: 'email_verification',
    notification: null,
    label: 'メールアドレス確認メール',
    description:
      'Click-to-verify, sent at sign-up. Only in use while email verification is switched on.',
    wrapper: 'standard',
    subject: '【JOMOO】メールアドレスのご確認',
    greeting: '{{name}} 様',
    body: [
      'JOMOO の会員登録ありがとうございます。',
      '下記のボタンからメールアドレスのご確認をお願いいたします。確認完了後、マイページをご利用いただけます。',
      `<a href="{{url}}" style="${BUTTON}">メールアドレスを確認する</a>`,
      `<span style="${MUTED}">ボタンが開かない場合は、次のURLをブラウザに貼り付けてください:<br /><span style="word-break:break-all">{{url}}</span></span>`,
      `<span style="${MUTED}">お心当たりのない場合は、お手数ですがこのメールを破棄してください。</span>`,
    ].join('\n'),
    variables: [
      NAME,
      { name: 'url', description: 'The verification link', sample: 'https://example.com/verify?token=…' },
    ],
  },
  {
    id: 'registration_received',
    notification: 'registration',
    label: '製品登録受付メール',
    description: 'Acknowledges a product registration that still needs review.',
    wrapper: 'standard',
    subject: '【JOMOO】製品登録を受け付けました - {{modelName}}',
    greeting: '{{name}} 様',
    body: [
      '<strong>{{modelName}}</strong> の製品登録（登録番号：<code>{{registrationId}}</code>）を受け付けました。',
      '3〜5営業日以内に審査を行い、結果をメールにてお知らせいたします。',
      '<a href="{{dashboardUrl}}" style="color:#18181b">マイページで進捗を確認する →</a>',
    ].join('\n'),
    variables: [
      NAME,
      { name: 'modelName', description: 'The product registered', sample: 'X40 スマートトイレ' },
      { name: 'registrationId', description: 'Registration number', sample: 'a1b2c3d4' },
      DASHBOARD_URL,
    ],
  },
  {
    id: 'warranty_issued',
    notification: 'warranty',
    label: '電子保証カード発行メール',
    description: 'Sent when a serial checks out and the warranty is issued automatically.',
    wrapper: 'standard',
    subject: '【JOMOO】電子保証カードを発行しました - {{modelName}}',
    greeting: '{{name}} 様',
    body: [
      '<strong>{{modelName}}</strong> の製造番号を確認し、電子保証カードを発行いたしました。',
      '保証期限：<strong>{{expiryDate}}</strong>',
      `<a href="{{warrantyUrl}}" style="${BUTTON}">電子保証カードを見る</a>`,
    ].join('\n'),
    variables: [
      NAME,
      { name: 'modelName', description: 'The product registered', sample: 'X40 スマートトイレ' },
      { name: 'expiryDate', description: 'Warranty expiry, already formatted', sample: '2027年8月5日' },
      { name: 'warrantyUrl', description: 'Link to the warranty card', sample: 'https://example.com/warranty/…' },
    ],
  },
  {
    id: 'review_returned',
    notification: 'registration',
    label: '製品登録 修正のお願い',
    description: 'Sent when a reviewer returns a registration for correction.',
    wrapper: 'standard',
    subject: '【JOMOO】製品登録の修正のお願い',
    greeting: '{{name}} 様',
    body: [
      'ご登録いただいた内容に修正が必要です。マイページより理由をご確認の上、修正して再度ご提出ください。',
      '<a href="{{dashboardUrl}}" style="color:#18181b">マイページへ →</a>',
    ].join('\n'),
    variables: [NAME, DASHBOARD_URL],
  },
  {
    id: 'review_no_warranty',
    notification: 'registration',
    label: '審査完了（延長保証の対象外）',
    description: 'Review passed, but the installation date puts it outside the warranty window.',
    wrapper: 'standard',
    subject: '【JOMOO】製品登録の審査が完了しました',
    greeting: '{{name}} 様',
    body: [
      'ご登録いただいた製品の審査が完了しました。',
      '※ 設置日から180日を超えているため、今回のご登録は延長保証の対象外となります。',
      '<a href="{{dashboardUrl}}" style="color:#18181b">マイページへ →</a>',
    ].join('\n'),
    variables: [NAME, DASHBOARD_URL],
  },
  {
    id: 'review_with_warranty',
    notification: 'registration',
    label: '審査完了・電子保証カード発行',
    description: 'Review passed and the warranty card was issued.',
    wrapper: 'standard',
    subject: '【JOMOO】電子保証カードを発行しました',
    greeting: '{{name}} 様',
    body: [
      'ご登録いただいた製品の審査が完了し、電子保証カードを発行いたしました。',
      `<a href="{{warrantyUrl}}" style="${BUTTON}">電子保証カードを見る</a>`,
    ].join('\n'),
    variables: [
      NAME,
      {
        name: 'warrantyUrl',
        description: 'Link to the warranty card, or the dashboard if there is none',
        sample: 'https://example.com/warranty/…',
      },
    ],
  },
  {
    id: 'contact_reply',
    notification: 'contact_reply',
    label: 'お問い合わせ自動返信',
    description: 'The acknowledgement sent to whoever used the contact form.',
    wrapper: 'standard',
    subject: '【JOMOO】お問い合わせありがとうございます',
    greeting: '{{name}} 様',
    body: [
      'このたびはJOMOOへお問い合わせいただき、誠にありがとうございます。',
      '以下の内容で承りました。担当部署より順次ご連絡いたしますので、今しばらくお待ちください。',
      `<span style="${MUTED}">お問い合わせ種別：{{categoryLabel}}</span>`,
      '<span style="display:block;padding:12px 16px;background:#f4f4f5;border-radius:6px;white-space:pre-wrap">{{message}}</span>',
      `<span style="${MUTED}">本メールは送信専用です。ご返信いただいてもお答えできませんのでご了承ください。</span>`,
    ].join('\n'),
    variables: [
      { ...NAME, description: "The enquirer's full name" },
      { name: 'categoryLabel', description: 'Enquiry category', sample: '製品について' },
      { name: 'message', description: 'What they wrote', sample: '設置について相談したいです。' },
    ],
  },
  {
    id: 'contact_staff',
    notification: 'contact_staff',
    label: 'お問い合わせ通知（担当部署）',
    description: 'The internal copy routed to the department that owns the category.',
    wrapper: 'contact',
    subject: '【JOMOO】{{categoryLabel}}: {{name}}',
    greeting: '',
    body: '{{{detailsTable}}}',
    variables: [
      { ...NAME, description: "The enquirer's full name" },
      { name: 'categoryLabel', description: 'Enquiry category', sample: '製品について' },
      {
        name: 'detailsTable',
        description: 'The full enquiry as a table, built by the site',
        sample: '<tr><td>お名前</td><td>山田 太郎</td></tr>',
        raw: true,
      },
    ],
  },
]

/**
 * A template as the admin page sees it: the wording currently in force, plus
 * the shipped default so "reset" has something to go back to.
 */
export interface AdminTemplate extends Omit<EmailTemplateDef, 'subject' | 'greeting' | 'body'> {
  subject: string
  greeting: string
  body: string
  defaultSubject: string
  defaultGreeting: string
  defaultBody: string
  edited: boolean
  updatedAt: string | null
  updatedBy: string | null
}

export const EMAIL_TEMPLATES_BY_ID = Object.fromEntries(
  EMAIL_TEMPLATES.map((t) => [t.id, t])
) as Record<string, EmailTemplateDef>

export type EmailTemplateId = string

/** Templates belonging to one notification row on the admin page. */
export function templatesForNotification(key: string): EmailTemplateDef[] {
  return EMAIL_TEMPLATES.filter((t) => t.notification === key)
}
