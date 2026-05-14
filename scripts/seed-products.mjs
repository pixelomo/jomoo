/**
 * Seed script — creates product documents in Sanity if they don't already exist.
 * Run with: node scripts/seed-products.mjs
 *
 * Requires NEXT_PUBLIC_SANITY_PROJECT_ID and SANITY_API_TOKEN in .env.local
 */
import { createClient } from '@sanity/client'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Load .env.local manually (no dotenv dependency needed)
function loadEnv() {
  try {
    const envPath = resolve(__dirname, '../.env.local')
    const raw = readFileSync(envPath, 'utf8')
    for (const line of raw.split('\n')) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const eq = trimmed.indexOf('=')
      if (eq === -1) continue
      const key = trimmed.slice(0, eq).trim()
      const val = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, '')
      process.env[key] ??= val
    }
  } catch {
    // .env.local not found – rely on process.env being set externally
  }
}
loadEnv()

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset:   process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production',
  apiVersion: '2024-01-01',
  token:     process.env.SANITY_API_TOKEN,
  useCdn:    false,
})

const products = [
  // ── XP40 Pro ──────────────────────────────────────────────────────────────
  {
    _type: 'product',
    _id: 'product-xp40-pro',
    modelCode: 'XP40-PRO',
    series: 'smart-toilet',
    name: {
      zhCN: 'XP40 プロアップグレードセット',
      en:   'XP40 Pro Upgrade Set',
    },
    slug: { _type: 'slug', current: 'xp40-pro' },
    tagline: {
      zhCN: 'プロフェッショナル仕様の洗浄体験。',
      en:   'Professional-grade cleansing experience.',
    },
    longDescription: {
      zhCN: [
        {
          _type: 'block', _key: 'desc-zh-1', style: 'normal',
          children: [{ _type: 'span', _key: 's1', text: 'XP40 プロアップグレードセットは、ベーシックセットの全機能に加え、広範囲泡洗浄・ナノイー除菌・スマートフォン連携機能を搭載したハイエンドモデルです。スラブデザインのシームレスなフォルムと静音設計が、上質なバスルームを演出します。' }],
          markDefs: [],
        },
      ],
      en: [
        {
          _type: 'block', _key: 'desc-en-1', style: 'normal',
          children: [{ _type: 'span', _key: 's1', text: 'The XP40 Pro Upgrade Set builds on the full feature set of the Basic, adding wide-area foam cleansing, nanoe sterilisation, and smartphone connectivity. Its seamless slab design and whisper-quiet operation bring a premium spa feel to any bathroom.' }],
          markDefs: [],
        },
      ],
    },
    features: [
      { _key: 'f1', icon: 'foam', title: { zhCN: '広範囲泡洗浄', en: 'Wide-Area Foam Wash' }, description: { zhCN: 'マイクロバブルで隅々まで丁寧に洗浄。', en: 'Micro-bubble foam reaches every corner for a thorough cleanse.' } },
      { _key: 'f2', icon: 'nanoe', title: { zhCN: 'ナノイー除菌', en: 'Nanoe Sterilisation' }, description: { zhCN: '超微細イオンが菌・ニオイを分解。', en: 'Ultra-fine ions neutralise bacteria and odours at the molecular level.' } },
      { _key: 'f3', icon: 'phone', title: { zhCN: 'スマートフォン連携', en: 'Smartphone App Control' }, description: { zhCN: 'アプリで温度・水勢をカスタム設定。', en: 'Customise temperature, pressure, and spray via the app.' } },
      { _key: 'f4', icon: 'sensor', title: { zhCN: '人感センサー', en: 'Presence Sensor' }, description: { zhCN: 'バスルームに入ると便座が自動で温まります。', en: 'Seat preheats automatically as you enter the bathroom.' } },
      { _key: 'f5', icon: 'eco', title: { zhCN: '節水設計', en: 'Water-Saving Design' }, description: { zhCN: 'AIが使用パターンを学習し消費水量を最適化。', en: 'AI learns usage patterns and optimises water consumption.' } },
      { _key: 'f6', icon: 'night', title: { zhCN: 'ナイトライト', en: 'Night Light' }, description: { zhCN: '夜間でもまぶしくないやさしいLEDガイド。', en: 'Gentle LED guide light for comfortable nighttime use.' } },
    ],
    specTable: {
      dimensions:       '700 × 395 × 490 mm',
      material:         'Vitreous China / ABS',
      power:            'AC100–240V, 50/60Hz, 80W',
      drainageMethod:   'Siphon Jet',
      waterConsumption: '4.8 L / 3.2 L (dual flush)',
      weight:           '43 kg',
      color:            'Cotton White / Matte Black',
      certification:    'JIS A 4422 / CE',
    },
    specs: [
      { _key: 's1', label: { zhCN: '洗浄水温',    en: 'Water Temperature' }, value: '28–42°C (adjustable)' },
      { _key: 's2', label: { zhCN: '乾燥温度',    en: 'Dryer Temperature' }, value: '38–65°C (adjustable)' },
      { _key: 's3', label: { zhCN: '防水等級',    en: 'IPX Rating'        }, value: 'IPX5'                  },
      { _key: 's4', label: { zhCN: 'アプリ対応', en: 'App Compatible'      }, value: 'iOS 14+ / Android 10+' },
    ],
    featureVideos: [
      { _key: 'v1', embedUrl: '', title: { zhCN: 'XP40 Pro 製品紹介', en: 'XP40 Pro Product Overview' } },
      { _key: 'v2', embedUrl: '', title: { zhCN: '泡洗浄テクノロジー', en: 'Foam Wash Technology' } },
    ],
    isActive: true,
  },
  // ── NeoRest NX ────────────────────────────────────────────────────────────
  {
    _type: 'product',
    _id: 'product-neorest-nx',
    modelCode: 'NR-NX',
    series: 'smart-toilet',
    name: {
      zhCN: 'NeoRest NX / ウォシュレット',
      en:   'NeoRest NX / Washlet',
    },
    slug: { _type: 'slug', current: 'neorest-nx' },
    tagline: {
      zhCN: '究極のウェルネス体験、いまここに。',
      en:   'The pinnacle of bathroom wellness.',
    },
    longDescription: {
      zhCN: [
        {
          _type: 'block', _key: 'desc-zh-1', style: 'normal',
          children: [{ _type: 'span', _key: 's1', text: 'NeoRest NX は JOMOO のフラッグシップモデルです。シームレスな一体型デザイン、AIパーソナライズ洗浄、UVA自動除菌、そして音声アシスタント連携を備え、バスルームを本物のウェルネス空間へと変えます。' }],
          markDefs: [],
        },
      ],
      en: [
        {
          _type: 'block', _key: 'desc-en-1', style: 'normal',
          children: [{ _type: 'span', _key: 's1', text: 'The NeoRest NX is JOMOO\'s flagship model. Its seamless one-piece design, AI-personalised cleansing, automatic UVA sterilisation, and voice assistant integration transform the bathroom into a genuine wellness space.' }],
          markDefs: [],
        },
      ],
    },
    features: [
      { _key: 'f1', icon: 'ai', title: { zhCN: 'AI パーソナライズ洗浄', en: 'AI Personalised Cleanse' }, description: { zhCN: '使用履歴を学習し、最適な洗浄設定を自動で適用。', en: 'Learns usage history and automatically applies optimal cleansing settings.' } },
      { _key: 'f2', icon: 'uva', title: { zhCN: 'UVA 自動除菌', en: 'Auto UVA Sterilisation' }, description: { zhCN: '使用後に紫外線で便器内部を自動除菌。', en: 'UV light automatically sterilises the bowl interior after each use.' } },
      { _key: 'f3', icon: 'voice', title: { zhCN: '音声アシスタント連携', en: 'Voice Assistant Integration' }, description: { zhCN: 'Alexa・Siri・Google アシスタントに対応。', en: 'Compatible with Alexa, Siri, and Google Assistant.' } },
      { _key: 'f4', icon: 'seat', title: { zhCN: 'インスタントヒートシート', en: 'Instant Heat Seat' }, description: { zhCN: '予熱なしで瞬間的に適温になる高速ヒーター。', en: 'High-speed heater reaches target temperature instantly — no preheating.' } },
      { _key: 'f5', icon: 'mist', title: { zhCN: 'ミスト予洗い', en: 'Pre-Mist Rinse' }, description: { zhCN: '使用前に水ミストで便器内面をコーティング。', en: 'Water mist coats the bowl interior before use, preventing soiling.' } },
      { _key: 'f6', icon: 'silent', title: { zhCN: '超静音フラッシュ', en: 'Ultra-Silent Flush' }, description: { zhCN: '最大音量 38dB の静音フラッシュ機構。', en: 'Patent-pending flush mechanism operates at under 38dB.' } },
    ],
    specTable: {
      dimensions:       '730 × 410 × 510 mm',
      material:         'Vitreous China / ABS / Aluminium accent',
      power:            'AC100–240V, 50/60Hz, 120W',
      drainageMethod:   'Tornado Flush',
      waterConsumption: '3.8 L / 2.6 L (dual flush)',
      weight:           '52 kg',
      color:            'Cotton White',
      certification:    'JIS A 4422 / CE / CB',
    },
    specs: [
      { _key: 's1', label: { zhCN: '洗浄水温',      en: 'Water Temperature'  }, value: '25–45°C (adjustable)' },
      { _key: 's2', label: { zhCN: '乾燥温度',      en: 'Dryer Temperature'  }, value: '35–70°C (adjustable)' },
      { _key: 's3', label: { zhCN: '防水等級',      en: 'IPX Rating'         }, value: 'IPX5'                  },
      { _key: 's4', label: { zhCN: 'UVA 除菌波長', en: 'UVA Wavelength'       }, value: '395 nm'                },
      { _key: 's5', label: { zhCN: '音声アシスタント', en: 'Voice Assistants'  }, value: 'Alexa, Siri, Google'  },
    ],
    featureVideos: [
      { _key: 'v1', embedUrl: '', title: { zhCN: 'NeoRest NX 製品紹介', en: 'NeoRest NX Overview' } },
      { _key: 'v2', embedUrl: '', title: { zhCN: 'AI パーソナライズ機能', en: 'AI Personalisation Feature' } },
    ],
    isActive: true,
  },
  // ── XP40 Basic ────────────────────────────────────────────────────────────
  {
    _type: 'product',
    _id: 'product-xp40-basic',
    modelCode: 'XP40-BASIC',
    series: 'smart-toilet',
    name: {
      zhCN: 'XP40 ベーシックセット',
      en:   'XP40 Basic Set',
    },
    slug: { _type: 'slug', current: 'xp40-basic' },
    tagline: {
      zhCN: '上質な清潔を、毎日の暮らしへ。',
      en:   'Premium hygiene, built for everyday life.',
    },
    longDescription: {
      zhCN: [
        {
          _type: 'block',
          _key: 'desc-zh-1',
          style: 'normal',
          children: [
            {
              _type: 'span',
              _key: 'span-zh-1',
              text: 'XP40 ベーシックセットは、JOMOO のスマートトイレ入門モデルです。瞬間温水洗浄・自動開閉フタ・脱臭機能を標準搭載し、初めてのスマートトイレに最適な一台です。シンプルで洗練されたフォルムはどんなバスルームにも自然に馴染みます。',
            },
          ],
          markDefs: [],
        },
      ],
      en: [
        {
          _type: 'block',
          _key: 'desc-en-1',
          style: 'normal',
          children: [
            {
              _type: 'span',
              _key: 'span-en-1',
              text: 'The XP40 Basic Set is JOMOO\'s entry-level smart toilet, delivering instant warm-water cleansing, an auto-open/close lid, and integrated deodorisation as standard. Its clean, refined silhouette integrates naturally into any bathroom.',
            },
          ],
          markDefs: [],
        },
      ],
    },
    features: [
      {
        _key: 'feat-1',
        icon: 'water',
        title:       { zhCN: '瞬間温水洗浄',       en: 'Instant Warm Rinse'          },
        description: { zhCN: 'タンクレスで瞬時にお湯を供給。', en: 'Tankless system delivers warm water instantly.' },
      },
      {
        _key: 'feat-2',
        icon: 'lid',
        title:       { zhCN: '自動開閉フタ',        en: 'Auto Open / Close Lid'       },
        description: { zhCN: '近づくと自動でフタが開きます。', en: 'Lid opens and closes automatically as you approach.' },
      },
      {
        _key: 'feat-3',
        icon: 'clean',
        title:       { zhCN: '除菌・脱臭',          en: 'Sterilisation & Deodoriser'  },
        description: { zhCN: '光触媒除菌と活性炭脱臭を内蔵。', en: 'Photocatalytic sterilisation and activated-carbon deodoriser.' },
      },
      {
        _key: 'feat-4',
        icon: 'temp',
        title:       { zhCN: '温水洗浄・温風乾燥',   en: 'Warm Wash & Warm Air Dry'    },
        description: { zhCN: '水温・風温・水勢を個別調節可能。', en: 'Individually adjustable water temp, air temp, and pressure.' },
      },
      {
        _key: 'feat-5',
        icon: 'eco',
        title:       { zhCN: '節水設計',             en: 'Water-Saving Design'         },
        description: { zhCN: 'デュアルフラッシュで最大 30% 節水。', en: 'Dual-flush system saves up to 30% water.' },
      },
      {
        _key: 'feat-6',
        icon: 'remote',
        title:       { zhCN: 'リモコン操作',          en: 'Remote Control'              },
        description: { zhCN: 'サイドパネルまたはワイヤレスリモコンで操作。', en: 'Side panel or wireless remote control operation.' },
      },
    ],
    specTable: {
      dimensions:       '670 × 390 × 475 mm',
      material:         'Vitreous China / ABS',
      power:            'AC100–240V, 50/60Hz, 60W',
      drainageMethod:   'Siphon Jet',
      waterConsumption: '5.0 L / 3.5 L (dual flush)',
      weight:           '40 kg',
      color:            'Cotton White',
      certification:    'JIS A 4422',
    },
    specs: [
      { _key: 'spec-1', label: { zhCN: '洗浄水温',    en: 'Water Temperature' }, value: '30–40°C (adjustable)' },
      { _key: 'spec-2', label: { zhCN: '乾燥温度',    en: 'Dryer Temperature' }, value: '40–60°C (adjustable)' },
      { _key: 'spec-3', label: { zhCN: '防水等級',    en: 'IPX Rating'        }, value: 'IPX4'                  },
      { _key: 'spec-4', label: { zhCN: '付属リモコン', en: 'Remote Included'   }, value: 'Wireless (AAA × 2)'  },
    ],
    featureVideos: [
      {
        _key: 'vid-1',
        embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        title: {
          zhCN: 'XP40 製品紹介ビデオ',
          en:   'XP40 Product Introduction',
        },
      },
    ],
    isActive: true,
  },
]

async function seed() {
  console.log(`Connecting to Sanity project: ${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}`)

  for (const product of products) {
    await client.createOrReplace(product)
    console.log(`✅ Upserted: ${product._id} (${product.name.en})`)
  }

  console.log('\nDone. You can now edit this product at https://jomoo.sanity.studio')
}

seed().catch(err => {
  console.error(err)
  process.exit(1)
})
