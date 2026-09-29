/**
 * Sends a batch of realistic enquiries through the live contact form, for
 * showing the client each desk's inbox and portal view.
 *
 * Unlike seed-mock-enquiries.mts, these go through /api/contact exactly as a
 * visitor's would: the row is recorded, the department address is mailed, and
 * the acknowledgement goes to DEMO_EMAIL. Three per category, so each desk has
 * a short list to open rather than a single row.
 *
 * It will not send while the sending domain is unverified in Resend — every
 * submission would fail and leave a row marked Failed in the portal. --seed
 * writes the same enquiries straight into contact_submissions instead, for a
 * portal demo while mail is down: nothing is emailed, and like
 * seed-mock-enquiries they are marked delivered so the list is not a column of
 * Failed badges.
 *
 * --remove deletes rows from DEMO_EMAIL whose message is one of these, so a
 * real enquiry from the same address is never caught. Remove them before launch.
 *
 * Usage: npx tsx scripts/send-demo-enquiries.mts [--base https://jomoo.jp]
 *        npx tsx scripts/send-demo-enquiries.mts --seed
 *        npx tsx scripts/send-demo-enquiries.mts --remove
 */
import { readFileSync } from 'node:fs'

for (const line of readFileSync(new URL('../.env.local', import.meta.url), 'utf8').split('\n')) {
  const match = line.match(/^([A-Z0-9_]+)=(.*)$/)
  if (match && process.env[match[1]] === undefined) {
    process.env[match[1]] = match[2].trim().replace(/^"(.*)"$/, '$1')
  }
}

const DEMO_EMAIL = 'sutherland_a@me.com'

const baseArg = process.argv.indexOf('--base')
const BASE = baseArg > -1 ? process.argv[baseArg + 1] : 'https://jomoo.jp'

// ── The enquiries ──────────────────────────────────────────────────────────
type Demo = {
  category: string
  lastName: string
  firstName: string
  companyName?: string
  phoneNumber?: string
  message: string
  preferredDateTime?: string
}

const DEMOS: Demo[] = [
  { category: 'partnership', lastName: '佐藤', firstName: '健一', companyName: '株式会社サンライズ住設', phoneNumber: '03-1234-5678',
    message: '関東エリアで水まわり設備の販売・施工を行っております。JOMOO製品の取り扱いについて、代理店契約の条件をお伺いしたく存じます。' },
  { category: 'partnership', lastName: '高橋', firstName: '美咲', companyName: 'ミサキ建築設計事務所',
    message: '設計事務所として、ホテル案件でのスペックイン提携を検討しております。BIMデータのご提供可否もあわせてご教示ください。' },
  { category: 'partnership', lastName: '伊藤', firstName: '大輔', companyName: '株式会社リノベーションワークス', phoneNumber: '06-6789-1234',
    message: 'マンションリノベーション事業での共同プロモーションについてご相談させてください。',
    preferredDateTime: '2026-10-08T14:00' },

  { category: 'product', lastName: '田中', firstName: '陽子',
    message: 'X40の設置に必要な排水芯の寸法と、既存トイレからの交換が可能か教えてください。' },
  { category: 'product', lastName: '渡辺', firstName: '翔', companyName: '渡辺工務店', phoneNumber: '052-123-4567',
    message: 'X40の電源仕様（100V/15A）と、アース付きコンセントの要否について確認させてください。' },
  { category: 'product', lastName: '山本', firstName: '由美',
    message: 'ショールームで実物を見てから購入を決めたいです。X40を展示している店舗はありますか。',
    preferredDateTime: '2026-10-11T11:00' },

  { category: 'materials', lastName: '中村', firstName: '拓也', companyName: '株式会社ナカムラホーム', phoneNumber: '045-234-5678',
    message: '新築分譲住宅10棟分のお見積りをお願いいたします。カタログ一式もお送りいただけますと幸いです。' },
  { category: 'materials', lastName: '小林', firstName: '恵', companyName: 'ホテル小林',
    message: '客室48室の改装を予定しています。スマートトイレの導入費用の概算をいただけますでしょうか。' },
  { category: 'materials', lastName: '加藤', firstName: '誠', companyName: '加藤設備', phoneNumber: '092-345-6789',
    message: '製品カタログ（紙）を5部ご送付ください。送付先は会社住所でお願いします。' },

  { category: 'support', lastName: '吉田', firstName: '真由美', phoneNumber: '090-1234-5678',
    message: 'リモコンの電池を交換したところ、便座が反応しなくなりました。再ペアリングの方法を教えてください。' },
  { category: 'support', lastName: '山田', firstName: '太郎',
    message: '製品登録をしたのですが、電子保証カードが表示されません。確認をお願いできますでしょうか。' },
  { category: 'support', lastName: '松本', firstName: '彩', phoneNumber: '080-2345-6789',
    message: 'ノズルのお手入れ方法と、交換部品の購入方法について教えてください。' },

  { category: 'fault', lastName: '井上', firstName: '浩二', phoneNumber: '090-3456-7890',
    message: '昨日から温水が出なくなりました。エラーランプが点滅しています。訪問修理をお願いできますか。' },
  { category: 'fault', lastName: '木村', firstName: '直子',
    message: '便器と床の接合部から水漏れがあります。設置から3か月です。至急ご対応をお願いします。' },
  { category: 'fault', lastName: '林', firstName: '悠斗', companyName: '株式会社ハヤシ管理', phoneNumber: '03-3456-7890',
    message: '管理物件のX40で自動洗浄が作動しない不具合が2台発生しています。点検の手配をお願いいたします。' },

  { category: 'recruitment', lastName: '清水', firstName: '結衣',
    message: '営業職の中途採用に応募を希望しております。募集状況と応募方法を教えてください。' },
  { category: 'recruitment', lastName: '森', firstName: '大樹', phoneNumber: '080-4567-8901',
    message: '2027年度新卒採用の会社説明会の日程を知りたいです。' },
  { category: 'recruitment', lastName: '池田', firstName: '沙織',
    message: 'カスタマーサポート職のパートタイム募集はありますか。勤務地は東京を希望しています。' },
]

// ── --remove / --seed ──────────────────────────────────────────────────────
if (process.argv.includes('--remove') || process.argv.includes('--seed')) {
  const { db } = await import('../src/lib/db')
  const { contactSubmission } = await import('../src/lib/db/schema')
  const { contactAddressFor } = await import('../src/lib/contactRouting')
  const { and, eq, inArray } = await import('drizzle-orm')

  const ours = and(
    eq(contactSubmission.email, DEMO_EMAIL),
    inArray(contactSubmission.message, DEMOS.map((d) => d.message)),
  )
  const removed = await db.delete(contactSubmission).where(ours).returning({ id: contactSubmission.id })
  console.log(`- removed ${removed.length} demo enquiries`)

  if (process.argv.includes('--seed')) {
    const now = Date.now()
    for (const [i, d] of DEMOS.entries()) {
      await db.insert(contactSubmission).values({
        category: d.category,
        lastName: d.lastName,
        firstName: d.firstName,
        companyName: d.companyName ?? null,
        email: DEMO_EMAIL,
        countryCode: null,
        phoneNumber: d.phoneNumber ?? null,
        message: d.message,
        showroomReservation: Boolean(d.preferredDateTime),
        preferredDateTime: d.preferredDateTime ?? null,
        routedTo: contactAddressFor(d.category as never),
        delivered: true,
        // Spread over the last two days, newest first, so the list reads as
        // a real inbox rather than eighteen rows sharing one timestamp.
        submittedAt: new Date(now - (i * 2 + 1) * 97 * 60 * 1000),
      })
      console.log(`+ ${d.category.padEnd(12)} ${d.lastName} ${d.firstName}`)
    }
    console.log(`\n${DEMOS.length} demo enquiries written — nothing was emailed. Remove them with --remove.`)
  }
  process.exit(0)
}

// ── Refuse to send through an unverified domain ─────────────────────────────
const from = process.env.RESEND_FROM_EMAIL ?? ''
const domain = from.match(/@([^>\s]+)/)?.[1]
const res = await fetch('https://api.resend.com/domains', {
  headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}` },
})
if (res.ok) {
  const { data } = (await res.json()) as { data: { name: string; status: string }[] }
  const status = data.find((d) => d.name === domain)?.status ?? 'not in this Resend account'
  if (status !== 'verified') {
    console.error(`Sending domain ${domain} is ${status} — nothing sent.`)
    process.exit(1)
  }
} else {
  console.warn(`Could not check the sending domain (${res.status}); sending anyway.`)
}

let ok = 0
for (const d of DEMOS) {
  const r = await fetch(`${BASE}/api/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...d,
      email: DEMO_EMAIL,
      showroomReservation: Boolean(d.preferredDateTime),
    }),
  })
  const status = r.ok ? 'sent' : `FAILED ${r.status} ${await r.text()}`
  if (r.ok) ok++
  console.log(`${d.category.padEnd(12)} ${d.lastName} ${d.firstName}  ${status}`)
}

console.log(`\n${ok}/${DEMOS.length} sent to ${BASE}. Remove them with --remove.`)
process.exit(ok === DEMOS.length ? 0 : 1)
