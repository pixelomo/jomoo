/**
 * Updates X40-B and X40-C feature cards + spec diagram in Sanity.
 * Run: node scripts/patch-x40-features.mjs
 */
import { createClient } from '@sanity/client'
import { readFileSync } from 'node:fs'
import { basename } from 'node:path'

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

const assetCache = new Map()

async function upload(publicPath) {
  if (assetCache.has(publicPath)) return assetCache.get(publicPath)

  const filename = basename(publicPath)
  const existing = await client.fetch(
    `*[_type == "sanity.imageAsset" && originalFilename == $filename][0]._id`,
    { filename }
  )

  let id = existing
  if (!id) {
    const buf = readFileSync(new URL(`public${publicPath}`, ROOT))
    const asset = await client.assets.upload('image', buf, { filename })
    id = asset._id
    console.log(`uploaded ${publicPath} → ${id}`)
  } else {
    console.log(`reuse ${publicPath} → ${id}`)
  }

  assetCache.set(publicPath, id)
  return id
}

const imageRef = (id) => ({ _type: 'image', asset: { _type: 'reference', _ref: id } })

const FEATURE_CARDS = [
  {
    title: 'クリーンボットアーム泡洗浄',
    body: [
      '使用前にロボットアームが作動して、',
      '360°全方位からきめ細やかな泡を噴射し、',
      'ボウル面を包み込みます。除菌・防菌・防臭・飛散を',
      '防止し、トイレがいつでも清潔に保たれます。',
    ].join('\n'),
    image: '/images/feature1.jpg',
  },
  {
    title: '足元センサーによる\n便ふた・便座自動開閉',
    body: '足元センサーにより、便ふた・便座が自動開閉します。',
    image: '/images/feature2.jpg',
  },
  {
    title: 'ノズルUV除菌',
    body: [
      'ノズルが伸び出す前に細菌を殺菌します。',
      '紫外線を直接見る必要がないため、',
      '除菌率 99%の長期的な効果で交差感染を防ぎ、',
      '家族全員が安全・安心に使用できます。',
    ].join('\n'),
    image: '/images/feature3.jpg',
  },
  {
    title: 'トラップ反転洗浄システム',
    body: [
      '『押し流す』から『引き込む』方式へと進化させました。',
      '低騒音設計により、わずか38dBという限界レベルの',
      '静かな動作音を実現しました。また、徹底した洗浄性能を維持します。',
    ].join('\n'),
    image: '/images/feature4.jpg',
  },
  {
    title: 'リモコン式',
    body: [
      '新開発のレアアース抗菌コート仕上げを採用。',
      '細菌に持続的に作用し、細胞壁を破壊することで、',
      '細菌の繁殖を効果的に抑制し、99.9％の抗菌率を実現。',
      '長期間にわたる抗菌作用で、安心のトイレ空間を提供します。',
    ].join('\n'),
    image: '/images/feature5.jpg',
  },
]

const keyed = (arr, prefix) =>
  arr.map((item, i) => ({ _key: `${prefix}${i}`, ...item }))

async function main() {
  const specImageId = await upload('/images/x40-diagram.png')
  const featureCards = keyed(
    await Promise.all(
      FEATURE_CARDS.map(async (card) => ({
        title: card.title,
        body: card.body,
        image: imageRef(await upload(card.image)),
      }))
    ),
    'fc'
  )

  for (const id of ['product-x40-b', 'product-x40-c']) {
    await client.patch(id).set({
      featureCards,
      specImage: imageRef(specImageId),
    }).commit()
    console.log(`patched ${id}`)
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
