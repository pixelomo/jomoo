/**
 * Writes the 保証のご案内 sections of /after-sales (afterSalesPage.guideSections)
 * from the client's 261007日本保修页面.docx.
 *
 *   node scripts/seed-warranty-guide.mjs            # dry run: prints what it would write
 *   node scripts/seed-warranty-guide.mjs --apply    # writes, only if the field is empty
 *   node scripts/seed-warranty-guide.mjs --apply --replace   # overwrites Studio edits
 *
 * The doc's 【（ボタン名）】 placeholder became 【会員登録】 plus a 会員登録 button
 * (→ /sign-up); its 【ここをクリック】 ("…よりログインしてください") links to /sign-in.
 */
import { readFileSync } from 'node:fs'
import { randomUUID } from 'node:crypto'
import { createClient } from '@sanity/client'

const env = Object.fromEntries(
  readFileSync('.env.local', 'utf8')
    .split('\n')
    .filter((l) => /^[A-Z_]+=/.test(l))
    .map((l) => {
      const i = l.indexOf('=')
      return [l.slice(0, i), l.slice(i + 1).trim().replace(/^"|"$/g, '')]
    })
)
const client = createClient({
  projectId: env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: env.NEXT_PUBLIC_SANITY_DATASET,
  token: env.SANITY_API_TOKEN,
  apiVersion: '2024-01-01',
  useCdn: false,
})

const key = () => randomUUID().replace(/-/g, '').slice(0, 12)

/** A paragraph. Each part is a string, or [text, href] for a linked run. */
function para(...parts) {
  const markDefs = []
  const children = parts.map((part) => {
    if (typeof part === 'string') return { _type: 'span', _key: key(), text: part, marks: [] }
    const [text, href] = part
    const mark = key()
    markDefs.push({ _type: 'link', _key: mark, href })
    return { _type: 'span', _key: key(), text, marks: [mark] }
  })
  return { _type: 'block', _key: key(), style: 'normal', markDefs, children }
}

const button = (label, href) => ({ _type: 'linkButton', _key: key(), label, href })

const section = (title, body) => ({ _type: 'guideSection', _key: key(), title, body })

const guideSections = [
  section('製品保証期間', [
    para('九牧製品の保証期間は下記の通りです。本保証は日本国内に限り有効となります。'),
    para('保証起算日とは、「お取付日」または「お引き渡し日」を示します。'),
    para('説明：'),
    para(
      'お引き渡し日とは、新築工事および改装工事のケースにおいて、お客様が保証対象製品の引渡しを受けた日のことを指します。長期保証書、ならびに保証対象製品のお引き渡し日またはご購入日を証明する書類（納品書、売買契約書など）を大切に保管してください。'
    ),
    para('購入日とは、お客さまが取付けた場合において保証商品を購入した日をいいます。'),
  ]),
  section('延長保証規定', [
    para(
      'JOMOO スマートトイレを安全・安心にご使用いただくため、JOMOO クラブ会員にご登録の上、保証起算日から 3 ヶ月以内に製品登録を完了していただくと、下表の通り製品に該当する延長保証期間が自動的に付与されます。'
    ),
    para('保証起算日とは「購入日」または「お引き渡し日」を指します。'),
    para('ご注意：保証起算日から 3 ヶ月を超えて製品登録を行った場合、延長保証の特典は受けられません。'),
    para(
      '※登録手続きは簡単です。登録はウェブのみ受け付けております。会員登録後、ログインし【マイページ＞製品登録】をクリックし、ご購入製品を追加することで延長保証の特典をご利用いただけます。'
    ),
    para('住宅使用の場合：基本保証期間 2 年に 3 年を追加し、合計 5 年間の保証となります。'),
    para('非住宅使用の場合：基本保証期間 2 年に 1 年を追加し、合計 3年間の保証となります。'),
    para('保証範囲：製品本体および付属部品。フィルター、発泡剤、電池などの消耗品は保証対象外となります。'),
  ]),
  section('JOMOO クラブ会員登録', [
    para(
      ['【会員登録】', '/sign-up'],
      'をクリックし JOMOO クラブ会員にご登録ください。JOMOO クラブ会員は個人、企業、パートナーの皆様のご登録を受け付けております。'
    ),
    button('会員登録', '/sign-up'),
    para('既に JOMOO クラブ会員登録済みの方は、', ['【ここをクリック】', '/sign-in'], 'よりログインしてください。'),
  ]),
  section('JOMOO お客様相談センター', [
    para('JOMOOお客様相談センター：', ['0120580999', 'tel:0120580999']),
    para('受付時間：午前 8:00～午後 18:00、365 日対応'),
    para('受付内容：販売に関するお問い合わせ、アフターサービスに関するお問い合わせ、製品修理のご予約'),
  ]),
]

const apply = process.argv.includes('--apply')
const replace = process.argv.includes('--replace')

const doc = await client.getDocument('afterSalesPage')
if (!doc) throw new Error('afterSalesPage does not exist — run seed-cms-pages.mjs first')

if (doc.guideSections?.length && !replace) {
  console.log(`afterSalesPage already has ${doc.guideSections.length} guide sections — pass --replace to overwrite.`)
  process.exit(0)
}

for (const s of guideSections) {
  console.log(`\n■ ${s.title}`)
  for (const b of s.body) {
    console.log(b._type === 'linkButton' ? `  [${b.label} → ${b.href}]` : `  ${b.children.map((c) => c.text).join('')}`)
  }
}

if (!apply) {
  console.log('\nDry run — pass --apply to write.')
  process.exit(0)
}

for (const id of ['afterSalesPage', 'drafts.afterSalesPage']) {
  const current = id === 'afterSalesPage' ? doc : await client.getDocument(id)
  if (!current) continue
  await client.patch(id).ifRevisionId(current._rev).set({ guideSections }).commit()
  console.log(`\nwrote ${id}`)
}
