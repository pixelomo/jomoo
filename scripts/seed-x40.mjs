/**
 * Uploads X40 images to Sanity and creates product documents for X40-B and X40-C.
 * Run once: node scripts/seed-x40.mjs
 */
import { createClient } from '@sanity/client'
import { createReadStream } from 'fs'
import { join, basename } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const IMG_DIR = join(__dirname, '..', 'X40')

const client = createClient({
  projectId: '9f4e5pxd',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
})

// Bilingual captions for every feature image file
const FEATURE_CAPTIONS = {
  '38dB静音冲.jpg':             { zhCN: '38dB超净音',             en: '38 dB Ultra-quiet Flush'           },
  '640.gif':                    { zhCN: '功能展示',               en: 'Feature Showcase'                  },
  'UV紫外线.jpg':               { zhCN: 'UV喷杆除菌',             en: 'UV Rod Sterilization'              },
  '停电冲厕.jpg':               { zhCN: '停电冲厕',               en: 'Emergency Flush (Power Outage)'    },
  '光感夜灯.jpg':               { zhCN: '光感夜灯',               en: 'Motion-sensing Night Light'        },
  '助便强洗.png':               { zhCN: '助便强洗',               en: 'Bowel Movement Wash'               },
  '可拆卸抗菌喷嘴.jpg':         { zhCN: '可拆卸抗菌喷嘴',         en: 'Removable Antibacterial Nozzle'    },
  '喷嘴自洁.png':               { zhCN: '喷嘴自动自洁',           en: 'Auto Nozzle Self-cleaning'         },
  '四季温感-1.jpg':             { zhCN: '四季温感',               en: '4-Season Thermal Sensing'          },
  '妇洗.png':                   { zhCN: '轻柔妇洗',               en: 'Gentle Feminine Wash'              },
  '宽幅强洗.jpg':               { zhCN: '宽幅强洗',               en: 'Wide-area Rear Wash'               },
  '座圈抗菌 I 喷杆抗菌.jpg':   { zhCN: '座圈抗菌 · 喷杆抗菌',   en: 'Antibacterial Seat Ring & Nozzle Rod' },
  '座温加热.jpg':               { zhCN: '座圈加热（5档）',         en: 'Seat Heating (5 Levels)'           },
  '旋转魔力泡.jpg':             { zhCN: '旋转魔力泡（混气技术）', en: 'Air-mix Bubble Wash'               },
  '旋风冲.jpg':                 { zhCN: '超净音旋风冲刷',         en: 'Ultra-quiet Whirlwind Flush'       },
  '无棱内壁-2.png':             { zhCN: '无棱内壁',               en: 'Rimless Bowl Design'               },
  '离座自冲.jpg':               { zhCN: '离座自动冲（大/小）',    en: 'Auto Flush on Leave (Full / Eco)'  },
  '移动按摩.jpg':               { zhCN: '移动按摩洗',             en: 'Oscillating Massage Wash'          },
  '缓降盖板.png':               { zhCN: '缓降盖板',               en: 'Soft-close Lid'                    },
  '脚感冲水.png':               { zhCN: '脚感冲水',               en: 'Foot-sense Flush'                  },
  '脚感翻盖翻圈.png':           { zhCN: '脚感翻盖翻圈',           en: 'Foot-sense Lid & Seat Control'     },
  '臀洗.png':                   { zhCN: '洁净臀洗',               en: 'Rear Cleansing Wash'               },
  '自动开盖.jpg':               { zhCN: '自动开盖',               en: 'Auto Lid Opening'                  },
  '自动顶针除垢.jpg':           { zhCN: '喷嘴顶针自动除垢',       en: 'Auto Pin Descaling'                },
  '釉面抗菌.jpg':               { zhCN: '釉面抗菌',               en: 'Antibacterial Glaze'               },
  '铂金除臭.png':               { zhCN: '铂金除臭',               en: 'Platinum Deodorizer'               },
}

// Files exclusive to X40-B (not available on X40-C)
const X40B_ONLY = new Set([
  'UV紫外线.jpg',
  '四季温感-1.jpg',
  '自动开盖.jpg',
  '脚感翻盖翻圈.png',
])

// Hero images
const HERO = {
  'x40-b': 'JPD6351-SA.png',
  'x40-c': 'JPD6350-S0.jpg',
}

// Feature image order (display order on the page)
const FEATURE_ORDER = [
  '旋转魔力泡.jpg',
  '助便强洗.png',
  '臀洗.png',
  '妇洗.png',
  '移动按摩.jpg',
  '宽幅强洗.jpg',
  '铂金除臭.png',
  'UV紫外线.jpg',
  '四季温感-1.jpg',
  '座温加热.jpg',
  '光感夜灯.jpg',
  '自动开盖.jpg',
  '脚感翻盖翻圈.png',
  '脚感冲水.png',
  '离座自冲.jpg',
  '旋风冲.jpg',
  '38dB静音冲.jpg',
  '停电冲厕.jpg',
  '可拆卸抗菌喷嘴.jpg',
  '喷嘴自洁.png',
  '自动顶针除垢.jpg',
  '座圈抗菌 I 喷杆抗菌.jpg',
  '釉面抗菌.jpg',
  '无棱内壁-2.png',
  '缓降盖板.png',
  '640.gif',
]

async function uploadImage(filename) {
  const filePath = join(IMG_DIR, filename)
  console.log(`  Uploading ${filename}…`)
  const asset = await client.assets.upload('image', createReadStream(filePath), { filename })
  console.log(`  ✓ ${filename} → ${asset._id}`)
  return asset._id
}

async function run() {
  // 1. Upload all unique images and build a map: filename → asset _id
  const allFiles = new Set([
    ...Object.values(HERO),
    ...FEATURE_ORDER.filter(f => FEATURE_CAPTIONS[f]),
  ])

  const assetMap = {}
  for (const filename of allFiles) {
    try {
      assetMap[filename] = await uploadImage(filename)
    } catch (err) {
      console.warn(`  ! Skipped ${filename}: ${err.message}`)
    }
  }

  // 2. Build product documents
  const products = [
    {
      _id: 'product-x40-b',
      _type: 'product',
      modelCode: 'JPD6351-SA-EPC000',
      series: 'smart-toilet',
      name: { zhCN: 'X40-B 智能座便器', en: 'X40-B Smart Toilet' },
      slug: { _type: 'slug', current: 'x40-b' },
      tagline: {
        zhCN: '自清洁机器手 · UV喷杆除菌 · 四季温感 · 脚感翻盖',
        en: 'Self-cleaning Robotic Arm · UV Sterilization · 4-Season Thermal · Foot-sense Lid',
      },
      isActive: true,
      features: [
        {
          _key: 'f1',
          title: { zhCN: '自清洁机器手', en: 'Self-cleaning Robotic Arm' },
          description: { zhCN: '内置机器手自动清洁喷嘴区域，全程无需手动接触。', en: 'Built-in robotic arm automatically scrubs the nozzle area — hands-free hygiene.' },
        },
        {
          _key: 'f2',
          title: { zhCN: 'UV喷杆除菌', en: 'UV Rod Sterilization' },
          description: { zhCN: '紫外线灯对喷杆进行除菌，有效消灭细菌病毒。', en: 'UV light sterilizes the nozzle rod, eliminating bacteria and viruses effectively.' },
        },
        {
          _key: 'f3',
          title: { zhCN: '铂金除臭', en: 'Platinum Deodorizer' },
          description: { zhCN: '铂金催化除臭，持续净化如厕环境。', en: 'Platinum-catalytic deodorizer continuously purifies the air during use.' },
        },
        {
          _key: 'f4',
          title: { zhCN: '脚感翻盖翻圈', en: 'Foot-sense Lid & Seat Control' },
          description: { zhCN: '脚轻触底部感应区，无需弯腰即可翻盖翻圈，卫生便捷。', en: 'Touch the sensor with your foot to open or close the lid and seat — no hands required.' },
        },
        {
          _key: 'f5',
          title: { zhCN: '四季温感', en: '4-Season Thermal Sensing' },
          description: { zhCN: '自动感知环境温度，智能调节座圈温度，四季舒适。', en: 'Automatically adjusts seat temperature based on ambient conditions for year-round comfort.' },
        },
        {
          _key: 'f6',
          title: { zhCN: '混气技术洁净冲洗', en: 'Air-mix Wash Technology' },
          description: { zhCN: '水与空气混合形成细密泡沫，温和清洁效果卓越。', en: 'Water and air blend into fine bubbles for a gentle yet thorough cleanse.' },
        },
      ],
      specTable: {
        waterConsumption: '大冲 4.5 L / 小冲 3 L',
        power: 'AC 220–240 V, 50 Hz',
        certification: 'IPX4',
      },
      specs: [
        { _key: 's1', label: { zhCN: '坑距（标配）', en: 'Rough-in (standard)' }, value: '200–300 mm（含移位器）' },
        { _key: 's2', label: { zhCN: '坑距（选购）', en: 'Rough-in (extended)' }, value: '300–580 mm（需另购 JPP860-SA-IDO）' },
        { _key: 's3', label: { zhCN: '停电冲厕', en: 'Emergency flush' }, value: '6LR61 电池' },
        { _key: 's4', label: { zhCN: '防水等级', en: 'Waterproof rating' }, value: 'IPX4' },
      ],
    },
    {
      _id: 'product-x40-c',
      _type: 'product',
      modelCode: 'JPD6350-S0-EPC000',
      series: 'smart-toilet',
      name: { zhCN: 'X40-C 智能座便器', en: 'X40-C Smart Toilet' },
      slug: { _type: 'slug', current: 'x40-c' },
      tagline: {
        zhCN: '铂金除臭 · 混气技术 · 釉面抗菌 · 超净音冲刷',
        en: 'Platinum Deodorizer · Air-mix Technology · Antibacterial Glaze · Ultra-quiet Flush',
      },
      isActive: true,
      features: [
        {
          _key: 'f1',
          title: { zhCN: '铂金除臭', en: 'Platinum Deodorizer' },
          description: { zhCN: '铂金催化除臭，持续净化如厕环境。', en: 'Platinum-catalytic deodorizer continuously purifies the air during use.' },
        },
        {
          _key: 'f2',
          title: { zhCN: '混气技术洁净冲洗', en: 'Air-mix Wash Technology' },
          description: { zhCN: '水与空气混合形成细密泡沫，温和清洁效果卓越。', en: 'Water and air blend into fine bubbles for a gentle yet thorough cleanse.' },
        },
        {
          _key: 'f3',
          title: { zhCN: '釉面抗菌', en: 'Antibacterial Glaze' },
          description: { zhCN: '陶瓷釉面添加抗菌成分，减少细菌滋生，易于清洁。', en: 'Antibacterial agents in the ceramic glaze reduce bacterial growth and make cleaning easy.' },
        },
        {
          _key: 'f4',
          title: { zhCN: '超净音翻转冲刷', en: 'Ultra-quiet Whirl Flush' },
          description: { zhCN: '38 dB 超低噪音冲刷，安静不扰人。', en: '38 dB ultra-quiet flushing — considerate for others at any hour.' },
        },
        {
          _key: 'f5',
          title: { zhCN: '离座自动冲（大/小冲）', en: 'Auto Flush on Leave' },
          description: { zhCN: '离座自动识别大小冲，省心省水。', en: 'Automatically selects full or eco flush on departure — effortless water saving.' },
        },
        {
          _key: 'f6',
          title: { zhCN: '脚感冲水', en: 'Foot-sense Flush' },
          description: { zhCN: '脚轻触底部感应区即可冲水，卫生无接触。', en: 'Touch the base sensor with your foot to flush — completely hands-free.' },
        },
      ],
      specTable: {
        waterConsumption: '大冲 4.5 L / 小冲 3 L',
        power: 'AC 220–240 V, 50 Hz',
        certification: 'IPX4',
      },
      specs: [
        { _key: 's1', label: { zhCN: '坑距（标配）', en: 'Rough-in (standard)' }, value: '300–580 mm（需另购 JPP860-SA-IDO）' },
        { _key: 's2', label: { zhCN: '停电冲厕', en: 'Emergency flush' }, value: '6LR61 电池' },
        { _key: 's3', label: { zhCN: '防水等级', en: 'Waterproof rating' }, value: 'IPX4' },
      ],
    },
  ]

  // 3. Attach hero images and feature images, then upsert documents
  for (const product of products) {
    const heroFile = HERO[product.slug.current]
    const heroId = assetMap[heroFile]

    product.images = heroId
      ? [{ _type: 'image', _key: 'hero', asset: { _type: 'reference', _ref: heroId } }]
      : []

    const isB = product.slug.current === 'x40-b'
    product.featureImages = FEATURE_ORDER
      .filter(f => {
        if (!assetMap[f]) return false
        if (X40B_ONLY.has(f) && !isB) return false
        return true
      })
      .map((f, i) => ({
        _type: 'image',
        _key: `fi${i}`,
        asset: { _type: 'reference', _ref: assetMap[f] },
        caption: FEATURE_CAPTIONS[f] ?? { zhCN: f, en: f },
      }))

    console.log(`\nUpserting ${product._id}…`)
    await client.createOrReplace(product)
    console.log(`✓ ${product._id} saved (${product.featureImages.length} feature images)`)
  }

  console.log('\nDone.')
}

run().catch(err => { console.error(err); process.exit(1) })
