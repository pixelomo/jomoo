/**
 * Moves the editorial content that used to live in src/lib/product-content.ts
 * into Sanity, so the client can edit it without a deploy.
 *
 * Everything written here is exactly what the site rendered beforehand, plus the
 * new X40 spec table from scripts/x40-specs.json. Images and the .glb are
 * uploaded as Sanity assets (deduped on filename, so re-runs are cheap).
 *
 * Run:  node scripts/seed-product-content.mjs          (dry run)
 *       node scripts/seed-product-content.mjs --apply  (writes)
 */
import { createClient } from '@sanity/client'
import { readFileSync, writeFileSync } from 'node:fs'
import { basename } from 'node:path'

const APPLY = process.argv.includes('--apply')
const ROOT = new URL('..', import.meta.url)

const env = Object.fromEntries(
  readFileSync(new URL('.env.local', ROOT), 'utf8')
    .split('\n')
    .filter((l) => l.includes('=') && !l.trimStart().startsWith('#'))
    .map((l) => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim()])
)

const client = createClient({
  projectId: env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: env.NEXT_PUBLIC_SANITY_DATASET ?? 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: env.SANITY_API_TOKEN,
})

const specs = JSON.parse(readFileSync(new URL('scripts/x40-specs.json', ROOT), 'utf8'))

/* ── asset upload, deduped on original filename ─────────────── */
const assetCache = new Map()

async function upload(publicPath, kind = 'image') {
  // Not every series ships a hero image — an absent path is simply no asset.
  if (!publicPath) return null
  if (assetCache.has(publicPath)) return assetCache.get(publicPath)

  const filename = basename(publicPath)
  const existing = await client.fetch(
    `*[_type == $type && originalFilename == $filename][0]._id`,
    { type: kind === 'image' ? 'sanity.imageAsset' : 'sanity.fileAsset', filename }
  )

  let id = existing
  if (!id) {
    if (!APPLY) {
      assetCache.set(publicPath, null)
      console.log(`    would upload ${publicPath}`)
      return null
    }
    const buf = readFileSync(new URL(`public${publicPath}`, ROOT))
    const asset = await client.assets.upload(kind, buf, { filename })
    id = asset._id
    console.log(`    uploaded ${publicPath} → ${id}`)
  }

  assetCache.set(publicPath, id)
  return id
}

const imageRef = (id) => (id ? { _type: 'image', asset: { _type: 'reference', _ref: id } } : undefined)

/** A card's art is either a file under public/ or an asset already in Sanity. */
const cardImageRef = async (card) =>
  card.assetId ? imageRef(card.assetId) : imageRef(await upload(card.image))
const fileRef = (id) => (id ? { _type: 'file', asset: { _type: 'reference', _ref: id } } : undefined)

/* ── the content, lifted verbatim from product-content.ts ───── */

const X40_FEATURE_CARDS = [
  {
    title: '自動洗浄ロボット',
    body: [
      '使用前にロボットアームが作動して、',
      '360°全方位からきめ細やかな泡を噴射し、',
      'ボウル面を包み込みます。除菌・防菌・防臭・飛散を',
      '防止し、トイレがいつでも清潔に保たれます。',
    ].join('\n'),
    image: '/images/slide3.jpeg',
  },
  {
    title: 'フットセンサーによる\n便蓋・便座自動開閉',
    body: [
      'フットセンサーにより、便蓋・便座が自動開閉します。',
      'ご高齢の方、身体が不自由な方など、',
      'すべてのユーザーに対して快適な使い心地を提供します。',
      '接触操作を少なくし、より衛生的な使用方法が可能です。',
    ].join('\n'),
    image: '/images/feature-2.jpeg',
  },
  {
    title: 'UVノズルによる除菌',
    body: [
      'UVノズルが伸び出す前に細菌を殺菌します。',
      '紫外線を直接見る必要がないため、',
      '除菌率 99%の長期的な効果で交差感染を防ぎ、',
      '家族全員が安全・安心に使用できます。',
    ].join('\n'),
    image: '/images/feature-3.jpg',
  },
  {
    title: '季節に応じた温度調節',
    body: [
      '便座に内蔵されたスマート温度センサーにより、',
      '季節ごとに室温をリアルタイムで感知。',
      'AIが座面温度を自動調節し、冷たさを感じることなく',
      '着座した瞬間から、心地の良い温かさを感じられます。',
    ].join('\n'),
    image: '/images/feature-4.jpg',
  },
  {
    title: 'リモコン式\n便蓋・便座自動開閉',
    body: [
      'フットセンサーに加えて、リモコンでも、',
      '便蓋・便座自動開閉の操作が可能です。',
      'ユーザーが求める快適な暮らしを選択できるように、',
      'リモコン式の機能も備えています。',
    ].join('\n'),
    image: '/images/feature-5.jpg',
  },
]

/**
 * X40-C's own features. The client's comparison sheet marks every one of the
 * X40-B 独自の機能 (self-cleaning arm, UV nozzle, foot-sensor lid, seasonal
 * temperature, remote lid) as not applicable to the C model, so it must not
 * advertise them. These six are the ones the sheet marks ● for X40-C, and match
 * the copy that was already on the product in Sanity before the migration.
 * Images reuse the assets uploaded with the original product photography.
 */
const X40C_FEATURE_CARDS = [
  {
    title: '白金脱臭',
    body: '白金触媒脱臭剤が使用中の空気を継続的に浄化します。',
    assetId: 'image-2ebb1155bf469ac6ead1965b8cbd6581876620af-1920x1080-png',
  },
  {
    title: '気泡ミックス洗浄',
    body: '水と空気が混合して細かい泡を形成し、やさしくしっかりと洗浄します。',
    assetId: 'image-bb9e82bfca33216edb96254fdcc9dd274d391d71-2480x3508-jpg',
  },
  {
    title: '抗菌釉薬',
    body: '陶磁器釉薬に抗菌成分を配合し、細菌の繁殖を抑えてお手入れを簡単にします。',
    assetId: 'image-b39ad39b0c8f50a0aa25a6bc3d00f22d50206223-5430x4032-jpg',
  },
  {
    title: '超静音旋風フラッシュ',
    body: '38dBの超低騒音フラッシュ—いつでも周りへの配慮を忘れません。',
    assetId: 'image-7476421009f254a3ce43259c3918f3eec2c1cff3-739x868-jpg',
  },
  {
    title: '離席自動フラッシュ',
    body: '離席時に大・小フラッシュを自動選択—楽に節水できます。',
    assetId: 'image-6371b6e8ec4259d8ba52742d6e60f409d23bdd7d-738x893-jpg',
  },
  {
    title: 'フットセンサーフラッシュ',
    body: '本体底部のセンサーに足で触れるだけでフラッシュ—完全ハンズフリーです。',
    assetId: 'image-35f8045432b2b62c46e7f16ed153463314ee9574-737x563-png',
  },
]

const X40_STANDARD_GROUPS = [
  {
    title: '洗浄機能',
    items: ['超静音回転式洗浄', 'フットセンサーによる洗浄', '離座自動洗浄', '停電時洗浄', 'プレミスト'],
  },
  {
    title: '抗菌衛生機能',
    items: [
      'プラチナ脱臭',
      'ノズル先端のニードルでスケールを除去',
      'ノズル自動洗浄',
      '抗菌ノズル',
      '着脱式ノズル',
      '抗菌便座',
      'フチなし形状',
      '抗菌釉薬',
      'スケール除去フィルター内蔵',
    ],
  },
  {
    title: '清潔機能',
    items: [
      'おしり清潔洗浄',
      'ワイド強力洗浄',
      'ソフトビデ洗浄',
      'ムーブマッサージ',
      'お通じサポート強力洗浄',
      'ソフトミストビデ洗浄',
      '温水リラックス洗浄',
    ],
  },
  { title: '快適機能', items: ['暖房便座', '照度センサーナイトライト'] },
]

const PRICE_PLACEHOLDER = '000000円（税込000000円）'

const PRODUCTS = {
  'product-x40-b': {
    slug: 'x40-b',
    seriesDoc: 'series-smart-toilet',
    heroTitle: 'X40-B',
    featureCards: X40_FEATURE_CARDS,
    standardGroups: X40_STANDARD_GROUPS,
    specImage: '/images/x40-diagram.jpg',
    model3d: '/glb/x40.glb',
    card: {
      image: '/images/X-40-B.jpeg',
      hoverImage: '/images/X40-hover.jpeg',
      description: '設置しているセンサーに反応して、自動で蓋が開閉したり、洗浄します。',
    },
    price: PRICE_PLACEHOLDER,
  },
  'product-x40-c': {
    slug: 'x40-c',
    seriesDoc: 'series-smart-toilet',
    heroTitle: 'X40-C',
    featureCards: X40C_FEATURE_CARDS,
    standardGroups: X40_STANDARD_GROUPS,
    specImage: '/images/x40-diagram.jpg',
    model3d: '/glb/x40.glb',
    card: {
      image: '/images/X-40-C.jpeg',
      hoverImage: '/images/X40-hover.jpeg',
      description: '世界で多くの賞を獲得したデザインチームによる革新的なデザインです。',
    },
    price: PRICE_PLACEHOLDER,
  },
}

const SERIES = {
  'series-smart-toilet': {
    lineup: {
      eyebrow: 'SMART TOILET LINEUP',
      title: 'あなたの空間に、最適な一台を。',
      subtitle: 'ライフスタイルや空間に合わせて選べる、\nJOMOOのスマートトイレラインナップ。',
    },
    productDefaults: {
      heroEyebrow: 'SMART TOILET',
      heroCatchphrase: '静けさが、\n暮らしを変える。',
      heroImage: '/images/smart.jpg',
      nameSuffix: 'スマートトイレ',
    },
  },
  'series-faucets': {
    lineup: {
      eyebrow: 'FAUCET LINEUP',
      title: '水栓金具',
      subtitle: '手仕上げの質感と精密な水流制御。キッチンと洗面のための一品。',
    },
    productDefaults: {
      heroEyebrow: 'FAUCET',
      heroCatchphrase: '水を、\n思いのままに。',
      nameSuffix: '水栓金具',
    },
  },
  'series-shower-set': {
    lineup: {
      eyebrow: 'SHOWER SET LINEUP',
      title: 'シャワーセット',
      subtitle: '恒温・節水・多段スプレー。毎日のための贅沢な静けさ。',
    },
    productDefaults: {
      heroEyebrow: 'SHOWER SET',
      heroCatchphrase: '浴びる時間を、\n極上のひとときに。',
      nameSuffix: 'シャワーセット',
    },
  },
  'series-washstand': {
    lineup: {
      eyebrow: 'WASHSTAND LINEUP',
      title: '洗面化粧台',
      subtitle: '2026 年秋、新シリーズの上陸を予定。続報をお待ちください。',
    },
    productDefaults: {
      heroEyebrow: 'WASHSTAND',
      heroCatchphrase: '毎日の身支度を、\n心地よく。',
      nameSuffix: '洗面化粧台',
    },
  },
}

/** Replaced by the new grouped spec fields. */
const RETIRED_FIELDS = ['features', 'featureImages', 'specTable', 'specs']

const keyed = (arr, prefix) =>
  arr.map((item, i) => ({ _key: `${prefix}${i}`, ...item }))

async function main() {
  const docs = await client.fetch('*[_type in ["product", "productSeries"]]')
  writeFileSync(
    new URL('.sanity-pre-seed-backup.json', ROOT),
    JSON.stringify(docs, null, 2)
  )
  console.log(`backed up ${docs.length} documents to .sanity-pre-seed-backup.json\n`)

  for (const [id, cfg] of Object.entries(PRODUCTS)) {
    console.log(`${id}`)
    const spec = specs[cfg.slug]
    if (!spec) throw new Error(`no spec data for ${cfg.slug} in scripts/x40-specs.json`)

    const defaults = SERIES[cfg.seriesDoc].productDefaults
    const set = {
      hero: {
        eyebrow: defaults.heroEyebrow,
        title: cfg.heroTitle,
        catchphrase: defaults.heroCatchphrase,
        image: imageRef(await upload(defaults.heroImage)),
      },
      featureCards: keyed(
        await Promise.all(
          cfg.featureCards.map(async (c) => ({
            title: c.title,
            body: c.body,
            image: await cardImageRef(c),
          }))
        ),
        'fc'
      ),
      standardGroups: keyed(cfg.standardGroups, 'sg'),
      specGroups: keyed(
        spec.specGroups.map((g) => ({ title: g.title, rows: keyed(g.rows, 'r') })),
        'spg'
      ),
      specNote: spec.specNote,
      specImage: imageRef(await upload(cfg.specImage)),
      model3d: fileRef(await upload(cfg.model3d, 'file')),
      card: {
        image: imageRef(await upload(cfg.card.image)),
        hoverImage: imageRef(await upload(cfg.card.hoverImage)),
        description: cfg.card.description,
      },
      price: cfg.price,
    }

    const rows = spec.specGroups.reduce((n, g) => n + g.rows.length, 0)
    console.log(
      `    hero, ${set.featureCards.length} feature cards, ` +
        `${set.standardGroups.length} standard groups, ` +
        `${set.specGroups.length} spec groups (${rows} rows), spec image, 3D model, card, price`
    )

    if (APPLY) {
      await client.patch(id).set(set).unset(RETIRED_FIELDS).commit()
      console.log('    ✓ written')
    }
  }

  for (const [id, cfg] of Object.entries(SERIES)) {
    console.log(id)
    const set = {
      lineup: cfg.lineup,
      productDefaults: {
        ...cfg.productDefaults,
        heroImage: imageRef(await upload(cfg.productDefaults.heroImage)),
      },
    }
    if (!cfg.productDefaults.heroImage) delete set.productDefaults.heroImage
    console.log(`    lineup: ${cfg.lineup.eyebrow} / ${cfg.lineup.title}`)

    if (APPLY) {
      await client.patch(id).set(set).commit()
      console.log('    ✓ written')
    }
  }

  console.log(APPLY ? '\nSeed applied.' : '\nDry run — re-run with --apply to write.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
