/**
 * Writes one briefing enquiry per contact category, so each department login
 * has something to open.
 *
 * They are ordinary rows in contact_submissions — the same table the contact
 * form writes — because the point is to prove the portal's filter: sign in as
 * `support` and only the two after-sales briefings are there, and the CSV holds
 * the same two. A fixture that bypassed the table would prove nothing about it.
 *
 * Every row is written with a routedTo taken from the real resolver, so if the
 * routing in types/contact.ts ever disagrees with what the portal shows, these
 * rows disagree with it too and the mismatch is visible rather than theoretical.
 *
 * Nothing is emailed. `delivered` is set true because these never went through
 * Resend and a red Failed badge on every seeded row would read as a fault.
 *
 * Usage: npx tsx scripts/seed-mock-enquiries.mts
 *        npx tsx scripts/seed-mock-enquiries.mts --remove   (takes them away)
 */
import { readFileSync } from 'node:fs'

for (const line of readFileSync(new URL('../.env.local', import.meta.url), 'utf8').split('\n')) {
  const match = line.match(/^([A-Z0-9_]+)=(.*)$/)
  if (match && process.env[match[1]] === undefined) {
    process.env[match[1]] = match[2].trim().replace(/^"(.*)"$/, '$1')
  }
}

const { db } = await import('../src/lib/db')
const { contactSubmission } = await import('../src/lib/db/schema')
const { CONTACT_CATEGORIES, CONTACT_DEPARTMENTS, categoryLabel } = await import('../src/types/contact')
const { contactAddressFor } = await import('../src/lib/contactRouting')
const { like, eq } = await import('drizzle-orm')

/** Marks a row as a seeded briefing, so --remove can find them all again and
 *  no real enquiry is ever caught by the delete. */
const MARKER = '[DEMO]'

const DEPARTMENT_BRIEF: Record<string, { desk: string; duties: string[] }> = {
  business: {
    desk: '営業・アライアンス窓口（business@jomoogroup.com）',
    duties: [
      '業務提携のご相談、製品・サービスのお問い合わせ、資料請求・お見積りの3種別がこの窓口に届きます。',
      '管理画面の Enquiries には、この3種別のみが表示されます。他部署宛のお問い合わせは表示されません。',
      'Download CSV も同じ範囲です。ダウンロードされる表には、この窓口宛の件のみが含まれます。',
    ],
  },
  aftersales: {
    desk: 'カスタマーサポート窓口（aftersales@jomoogroup.com）',
    duties: [
      'ご利用中のお客様サポートと、不具合・障害報告の2種別がこの窓口に届きます。',
      'Registrations / Warranties / Serial Numbers から、製品登録と保証の状況を確認できます。',
      'Dealers には販売店の住所と連絡先が入っています。お客様が製品登録時に選んだ販売店です。',
    ],
  },
  recruitment: {
    desk: '採用窓口（yangyang01@jomoo.com）',
    duties: [
      '採用に関するお問い合わせのみがこの窓口に届きます。',
      '管理画面の Enquiries には採用のご応募・お問い合わせのみが表示されます。',
      'Download CSV も同じ範囲です。応募者の連絡先が他部署に渡ることはありません。',
    ],
  },
}

function body(categoryId: string, department: string) {
  const brief = DEPARTMENT_BRIEF[department]
  return [
    `${MARKER} 管理画面のご案内`,
    '',
    `こちらは【${brief.desk}】宛のテスト用お問い合わせです。`,
    `お問い合わせ種別：${categoryLabel(categoryId as never)}`,
    '',
    ...brief.duties.map((line, i) => `${i + 1}. ${line}`),
    '',
    'この件が表示されていれば、ご担当の窓口として正しくログインできています。',
    '他部署宛の件が混ざって見える場合はご連絡ください。',
    '',
    '— JOMOO 管理ポータル',
  ].join('\n')
}

if (process.argv.includes('--remove')) {
  const removed = await db
    .delete(contactSubmission)
    .where(like(contactSubmission.message, `${MARKER}%`))
    .returning({ id: contactSubmission.id })
  console.log(`- removed ${removed.length} demo enquir${removed.length === 1 ? 'y' : 'ies'}`)
  process.exit(0)
}

// Re-runnable: the previous set goes before the new one, so running this twice
// does not leave six briefings where three belong.
await db.delete(contactSubmission).where(like(contactSubmission.message, `${MARKER}%`))

const now = Date.now()
let offset = 0

for (const { id, department } of CONTACT_CATEGORIES) {
  const dept = CONTACT_DEPARTMENTS.find(d => d.id === department)!
  await db.insert(contactSubmission).values({
    category: id,
    lastName: 'JOMOO',
    firstName: dept.labelEn,
    companyName: `JOMOO 管理ポータル / ${dept.labelEn}`,
    email: dept.email,
    countryCode: '81',
    phoneNumber: null,
    message: body(id, department),
    showroomReservation: false,
    preferredDateTime: null,
    routedTo: contactAddressFor(id),
    delivered: true,
    // Spread over the last few hours so the list has an order to it rather than
    // six rows sharing one timestamp.
    submittedAt: new Date(now - offset * 37 * 60 * 1000),
  })
  offset++
  console.log(`+ ${department.padEnd(12)} ${categoryLabel(id)}`)
}

console.log(`\n${offset} demo enquiries written. Remove them with --remove.`)
process.exit(0)
