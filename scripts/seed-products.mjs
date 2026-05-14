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
  // ── Washstand: AYZM24005 Custom ───────────────────────────────────────────
  {
    _type: 'product',
    _id: 'product-washstand-ayzm24005',
    modelCode: 'AYZM24005',
    series: 'washstand',
    name: {
      zhCN: 'AYZM24005 カスタムセット',
      en:   'AYZM24005 Custom',
    },
    slug: { _type: 'slug', current: 'ayzm24005-custom' },
    tagline: {
      zhCN: '洗練されたデザインと機能美の融合。',
      en:   'Where refined design meets functional beauty.',
    },
    longDescription: {
      zhCN: [{ _type: 'block', _key: 'b1', style: 'normal', children: [{ _type: 'span', _key: 's1', text: 'AYZM24005 カスタムセットは、上質な陶器ボウルとスリムな収納キャビネットを組み合わせたウォッシュスタンドです。カウンタートップとアンダーマウントの両スタイルに対応し、どんなバスルームにも溶け込む柔軟な設計です。' }], markDefs: [] }],
      en:   [{ _type: 'block', _key: 'b1', style: 'normal', children: [{ _type: 'span', _key: 's1', text: 'The AYZM24005 Custom combines a premium ceramic bowl with a slim storage cabinet, supporting both countertop and undermount configurations to suit any bathroom layout.' }], markDefs: [] }],
    },
    features: [
      { _key: 'f1', icon: 'basin', title: { zhCN: '高品質陶器ボウル', en: 'Premium Ceramic Basin' }, description: { zhCN: '耐久性と美しさを兼ね備えた高密度陶器。', en: 'High-density ceramic for lasting durability and elegance.' } },
      { _key: 'f2', icon: 'storage', title: { zhCN: 'スリム収納キャビネット', en: 'Slim Storage Cabinet' }, description: { zhCN: '奥行き350mmのコンパクトキャビネットで省スペース設計。', en: '350 mm-depth cabinet maximises storage without crowding the room.' } },
      { _key: 'f3', icon: 'anti', title: { zhCN: '防汚コーティング', en: 'Anti-Stain Coating' }, description: { zhCN: '特殊釉薬が汚れの付着を防ぎ、お手入れが簡単。', en: 'Specialist glaze repels stains for effortless cleaning.' } },
      { _key: 'f4', icon: 'soft', title: { zhCN: 'ソフトクローズ蝶番', en: 'Soft-Close Hinges' }, description: { zhCN: 'キャビネット扉はソフトクローズで静かに閉まります。', en: 'Cabinet doors close silently with integrated soft-close dampers.' } },
    ],
    specTable: {
      dimensions:       '800 × 480 × 860 mm (cabinet)',
      material:         'Vitreous China bowl / MDF cabinet',
      drainageMethod:   'Pop-up drain included',
      waterConsumption: '36 L basin capacity',
      weight:           '28 kg',
      color:            'Matte White / Walnut',
      certification:    'CE / ISO 3696',
    },
    specs: [
      { _key: 's1', label: { zhCN: 'ボウルタイプ', en: 'Bowl Type'      }, value: 'Countertop / Undermount' },
      { _key: 's2', label: { zhCN: 'キャビネット扉', en: 'Cabinet Doors' }, value: '2 doors, adjustable shelf' },
    ],
    isActive: true,
  },
  // ── Washstand: New Economic Set ───────────────────────────────────────────
  {
    _type: 'product',
    _id: 'product-washstand-new-economic',
    modelCode: 'WS-ECO',
    series: 'washstand',
    name: {
      zhCN: 'ニューエコノミックセット',
      en:   'New Economic Set',
    },
    slug: { _type: 'slug', current: 'new-economic' },
    tagline: {
      zhCN: 'シンプルで清潔感ある、暮らしに寄り添うデザイン。',
      en:   'Clean, simple, and built for everyday living.',
    },
    longDescription: {
      zhCN: [{ _type: 'block', _key: 'b1', style: 'normal', children: [{ _type: 'span', _key: 's1', text: 'ニューエコノミックセットは、コストパフォーマンスと品質のバランスを追求した洗面台セットです。シンプルなデザインながら、必要な機能をすべて備えており、リフォームや新築のどちらにも対応します。' }], markDefs: [] }],
      en:   [{ _type: 'block', _key: 'b1', style: 'normal', children: [{ _type: 'span', _key: 's1', text: 'The New Economic Set delivers outstanding value without compromise. Its clean lines and practical design make it ideal for both renovations and new builds.' }], markDefs: [] }],
    },
    features: [
      { _key: 'f1', icon: 'value', title: { zhCN: 'コストパフォーマンス', en: 'Exceptional Value'      }, description: { zhCN: '高品質をリーズナブルな価格で提供。', en: 'Premium quality at an accessible price point.' } },
      { _key: 'f2', icon: 'easy', title: { zhCN: '簡単取り付け',          en: 'Easy Installation'     }, description: { zhCN: 'すべてのパーツが揃ったフルセット。', en: 'All components included for straightforward installation.' } },
      { _key: 'f3', icon: 'durable', title: { zhCN: '耐久性',             en: 'Built to Last'         }, description: { zhCN: '厳しい品質テストをパスした信頼の素材。', en: 'Materials tested to meet strict quality standards.' } },
    ],
    specTable: {
      dimensions:       '600 × 460 × 820 mm (cabinet)',
      material:         'Vitreous China bowl / PVC cabinet',
      drainageMethod:   'Pop-up drain included',
      waterConsumption: '28 L basin capacity',
      weight:           '18 kg',
      color:            'Gloss White',
      certification:    'CE',
    },
    specs: [
      { _key: 's1', label: { zhCN: 'ボウルタイプ', en: 'Bowl Type'   }, value: 'Countertop' },
      { _key: 's2', label: { zhCN: '保証期間',     en: 'Warranty'    }, value: '2 years'    },
    ],
    isActive: true,
  },
  // ── Faucets: Basin Faucet P32758 ──────────────────────────────────────────
  {
    _type: 'product',
    _id: 'product-faucet-basin-p32758',
    modelCode: 'P32758',
    series: 'faucets',
    name: {
      zhCN: '洗面用水栓 P32758',
      en:   'Basin Faucet P32758',
    },
    slug: { _type: 'slug', current: 'basin-p32758' },
    tagline: {
      zhCN: '精密な流量制御と洗練されたフォルム。',
      en:   'Precision flow control in a refined silhouette.',
    },
    longDescription: {
      zhCN: [{ _type: 'block', _key: 'b1', style: 'normal', children: [{ _type: 'span', _key: 's1', text: 'P32758 は、シングルレバー操作で水温と水量を直感的に調整できる洗面用混合水栓です。セラミックカートリッジが長期にわたる滑らかな操作を保証し、エアレーターが節水と水はねを防ぎます。' }], markDefs: [] }],
      en:   [{ _type: 'block', _key: 'b1', style: 'normal', children: [{ _type: 'span', _key: 's1', text: 'The P32758 basin mixer allows intuitive single-lever control of temperature and flow. A ceramic cartridge ensures long-lasting smooth operation, while the aerator saves water and prevents splashing.' }], markDefs: [] }],
    },
    features: [
      { _key: 'f1', icon: 'ceramic', title: { zhCN: 'セラミックカートリッジ', en: 'Ceramic Cartridge'    }, description: { zhCN: '50万回以上の耐久試験をパス。', en: 'Tested to over 500,000 operating cycles.' } },
      { _key: 'f2', icon: 'aerate',  title: { zhCN: 'エアレーター内蔵',       en: 'Built-in Aerator'    }, description: { zhCN: '空気を混ぜることで節水と水はね防止。', en: 'Mixes air to reduce water use and prevent splashing.' } },
      { _key: 'f3', icon: 'brass',   title: { zhCN: '真鍮製ボディ',           en: 'Solid Brass Body'    }, description: { zhCN: '耐食性の高い鍛造真鍮を使用。', en: 'Forged brass body for superior corrosion resistance.' } },
      { _key: 'f4', icon: 'finish',  title: { zhCN: '多彩なカラー展開',       en: 'Multiple Finishes'   }, description: { zhCN: 'クロム・マットブラック・ブラッシュドゴールドから選択。', en: 'Available in Chrome, Matte Black, and Brushed Gold.' } },
    ],
    specTable: {
      dimensions:       'Spout reach: 125 mm / Height: 185 mm',
      material:         'Solid Brass',
      power:            '8 L/min at 3 bar',
      drainageMethod:   'Ceramic disc, 35 mm',
      waterConsumption: 'G½" (cold & hot)',
      weight:           '0.8 kg',
      color:            'Chrome / Matte Black / Brushed Gold',
      certification:    'CE / WRAS',
    },
    specs: [
      { _key: 's1', label: { zhCN: 'レバーハンドル',  en: 'Handle'        }, value: 'Single lever'        },
      { _key: 's2', label: { zhCN: '取り付け穴径',    en: 'Mounting Hole' }, value: 'Ø 32–35 mm'          },
    ],
    isActive: true,
  },
  // ── Faucets: Kitchen Faucet 33231 ────────────────────────────────────────
  {
    _type: 'product',
    _id: 'product-faucet-kitchen-33231',
    modelCode: '33231',
    series: 'faucets',
    name: {
      zhCN: 'キッチン用水栓 33231',
      en:   'Kitchen Faucet 33231',
    },
    slug: { _type: 'slug', current: 'kitchen-33231' },
    tagline: {
      zhCN: 'プルアウトシャワーで、キッチンをもっと快適に。',
      en:   'Pull-out spray for a more comfortable kitchen.',
    },
    longDescription: {
      zhCN: [{ _type: 'block', _key: 'b1', style: 'normal', children: [{ _type: 'span', _key: 's1', text: '33231 は、引き出し式シャワーヘッドを備えたキッチン混合水栓です。通常の流水とシャワー散水の切り替えが手元ボタンでワンタッチ操作。高さ調整機能付きで、さまざまなシンクの深さに対応します。' }], markDefs: [] }],
      en:   [{ _type: 'block', _key: 'b1', style: 'normal', children: [{ _type: 'span', _key: 's1', text: 'The 33231 kitchen mixer features a pull-out spray head with one-touch toggle between stream and spray. Height-adjustable spout accommodates a wide range of sink depths.' }], markDefs: [] }],
    },
    features: [
      { _key: 'f1', icon: 'pullout', title: { zhCN: 'プルアウトシャワー',    en: 'Pull-Out Spray Head' }, description: { zhCN: '1.2m のホースで広範囲に洗えます。', en: '1.2 m hose reaches every corner of the sink.' } },
      { _key: 'f2', icon: 'toggle',  title: { zhCN: 'ワンタッチ切り替え',   en: 'One-Touch Toggle'    }, description: { zhCN: '流水とシャワーをボタン一つで切り替え。', en: 'Switch between stream and spray at the touch of a button.' } },
      { _key: 'f3', icon: 'height',  title: { zhCN: '高さ調整機能',          en: 'Height Adjustment'   }, description: { zhCN: '5段階で高さを調整できます（200〜320mm）。', en: 'Five-position height adjustment from 200 to 320 mm.' } },
      { _key: 'f4', icon: 'pause',   title: { zhCN: '一時停止機能',          en: 'Pause Function'      }, description: { zhCN: 'シャワー中に手元で水を一時停止。', en: 'Pause the flow at the head without touching the lever.' } },
    ],
    specTable: {
      dimensions:       'Spout height: 200–320 mm / Reach: 220 mm',
      material:         'Solid Brass / Stainless Steel spout',
      power:            '12 L/min at 3 bar',
      drainageMethod:   'Ceramic disc, 40 mm',
      waterConsumption: 'G½" (cold & hot)',
      weight:           '1.4 kg',
      color:            'Chrome / Brushed Nickel',
      certification:    'CE / WRAS',
    },
    specs: [
      { _key: 's1', label: { zhCN: 'ホース長さ', en: 'Hose Length'     }, value: '1.2 m'              },
      { _key: 's2', label: { zhCN: 'スプレーモード', en: 'Spray Modes' }, value: 'Stream + Spray'     },
    ],
    isActive: true,
  },
  // ── Faucets: Pendant Set Square ──────────────────────────────────────────
  {
    _type: 'product',
    _id: 'product-faucet-pendant-square',
    modelCode: 'PD-SQ',
    series: 'faucets',
    name: {
      zhCN: 'ペンダントセット スクエアシリーズ',
      en:   'Pendant Set — Square Series',
    },
    slug: { _type: 'slug', current: 'pendant-square' },
    tagline: {
      zhCN: '直線美と機能性が織りなす、モダンな水回り。',
      en:   'Clean geometry for the modern bathroom.',
    },
    longDescription: {
      zhCN: [{ _type: 'block', _key: 'b1', style: 'normal', children: [{ _type: 'span', _key: 's1', text: 'スクエアシリーズは、直線と直角を基調としたシャープなデザインの水栓セットです。シャワーシステム・洗面水栓・タオルバーを統一したスクエアフォルムでコーディネートできます。' }], markDefs: [] }],
      en:   [{ _type: 'block', _key: 'b1', style: 'normal', children: [{ _type: 'span', _key: 's1', text: 'The Square Series coordinates shower system, basin mixer, and towel rail in a unified geometric language. Sharp lines and right angles deliver a crisp, architectural aesthetic.' }], markDefs: [] }],
    },
    features: [
      { _key: 'f1', icon: 'coord',   title: { zhCN: 'コーディネートデザイン', en: 'Coordinated Design'   }, description: { zhCN: '水栓・シャワー・タオルバーを統一デザインで揃えられます。', en: 'Faucet, shower, and towel rail share the same design language.' } },
      { _key: 'f2', icon: 'thermo',  title: { zhCN: 'サーモスタット対応',      en: 'Thermostatic Option' }, description: { zhCN: 'サーモスタット混合栓との組み合わせで設定温度をキープ。', en: 'Pair with our thermostatic valve to maintain set temperatures.' } },
      { _key: 'f3', icon: 'finish2', title: { zhCN: '3カラー展開',              en: '3 Finish Options'    }, description: { zhCN: 'クロム・マットブラック・ガンメタルから選択。', en: 'Chrome, Matte Black, and Gunmetal finishes available.' } },
    ],
    specTable: {
      dimensions:       'Spout reach: 150 mm / Height: 210 mm',
      material:         'Solid Brass',
      power:            '8 L/min at 3 bar',
      drainageMethod:   'Ceramic disc, 35 mm',
      waterConsumption: 'G½" (cold & hot)',
      weight:           '0.9 kg',
      color:            'Chrome / Matte Black / Gunmetal',
      certification:    'CE / WRAS',
    },
    specs: [
      { _key: 's1', label: { zhCN: 'シリーズ',        en: 'Series'      }, value: 'Square Geometric'    },
      { _key: 's2', label: { zhCN: '取り付け穴径',    en: 'Mounting'    }, value: 'Ø 32–35 mm'          },
    ],
    isActive: true,
  },
  // ── Faucets: Pendant Set Round ────────────────────────────────────────────
  {
    _type: 'product',
    _id: 'product-faucet-pendant-round',
    modelCode: 'PD-RD',
    series: 'faucets',
    name: {
      zhCN: 'ペンダントセット ラウンドシリーズ',
      en:   'Pendant Set — Round Series',
    },
    slug: { _type: 'slug', current: 'pendant-round' },
    tagline: {
      zhCN: '曲線が宿す、やわらかなラグジュアリー。',
      en:   'Soft luxury expressed through refined curves.',
    },
    longDescription: {
      zhCN: [{ _type: 'block', _key: 'b1', style: 'normal', children: [{ _type: 'span', _key: 's1', text: 'ラウンドシリーズは、なめらかな曲線美を基調とした水栓セットです。クラシックとモダンの中間を行くデザインで、ナチュラルテイストのバスルームに最適です。' }], markDefs: [] }],
      en:   [{ _type: 'block', _key: 'b1', style: 'normal', children: [{ _type: 'span', _key: 's1', text: 'The Round Series blends classic and contemporary aesthetics through smooth, flowing curves. A natural fit for softer, warmer bathroom interiors.' }], markDefs: [] }],
    },
    features: [
      { _key: 'f1', icon: 'curve',   title: { zhCN: '曲線デザイン',            en: 'Curved Design'       }, description: { zhCN: '全シリーズで統一された丸みのあるフォルム。', en: 'Consistent rounded forms across the full product range.' } },
      { _key: 'f2', icon: 'thermo',  title: { zhCN: 'サーモスタット対応',      en: 'Thermostatic Option' }, description: { zhCN: 'サーモスタット混合栓との組み合わせで設定温度をキープ。', en: 'Pair with our thermostatic valve for precise temperature control.' } },
      { _key: 'f3', icon: 'warm',    title: { zhCN: '温かみのある仕上げ',       en: 'Warm Finish Options' }, description: { zhCN: 'ブラッシュドゴールド・マットホワイト展開。', en: 'Brushed Gold and Matte White finishes for a warm aesthetic.' } },
    ],
    specTable: {
      dimensions:       'Spout reach: 140 mm / Height: 205 mm',
      material:         'Solid Brass',
      power:            '8 L/min at 3 bar',
      drainageMethod:   'Ceramic disc, 35 mm',
      waterConsumption: 'G½" (cold & hot)',
      weight:           '0.85 kg',
      color:            'Chrome / Brushed Gold / Matte White',
      certification:    'CE / WRAS',
    },
    specs: [
      { _key: 's1', label: { zhCN: 'シリーズ',     en: 'Series'   }, value: 'Round Curve'       },
      { _key: 's2', label: { zhCN: '取り付け穴径', en: 'Mounting' }, value: 'Ø 32–35 mm'        },
    ],
    isActive: true,
  },
  // ── Shower Set ────────────────────────────────────────────────────────────
  {
    _type: 'product',
    _id: 'product-shower-set',
    modelCode: 'SH-SET-01',
    series: 'shower-set',
    name: {
      zhCN: 'シャワーセット',
      en:   'Shower Set',
    },
    slug: { _type: 'slug', current: 'shower-set' },
    tagline: {
      zhCN: '毎日のシャワーを、上質な時間に変える。',
      en:   'Transform every shower into a luxury ritual.',
    },
    longDescription: {
      zhCN: [{ _type: 'block', _key: 'b1', style: 'normal', children: [{ _type: 'span', _key: 's1', text: 'JOMOO シャワーセットは、サーモスタット混合栓・マルチスプレーシャワーヘッド・1.5mステンレスホースをセットにした完結型シャワーシステムです。節水モードを内蔵し、快適なシャワー体験と環境への配慮を両立します。' }], markDefs: [] }],
      en:   [{ _type: 'block', _key: 'b1', style: 'normal', children: [{ _type: 'span', _key: 's1', text: "JOMOO's Shower Set is a complete system pairing a thermostatic mixer, multi-spray shower head, and 1.5 m stainless steel hose. The integrated water-saving mode delivers a luxurious shower experience without excess consumption." }], markDefs: [] }],
    },
    features: [
      { _key: 'f1', icon: 'thermo',  title: { zhCN: 'サーモスタット混合栓',    en: 'Thermostatic Mixer'    }, description: { zhCN: '設定温度を±1℃以内に維持。',      en: 'Maintains set temperature within ±1°C.'              } },
      { _key: 'f2', icon: 'multi',   title: { zhCN: '5段階スプレーモード',      en: '5-Mode Spray Head'     }, description: { zhCN: 'レイン・マッサージ・ミストなど5種類。', en: 'Rain, massage, mist, and two combination modes.'    } },
      { _key: 'f3', icon: 'eco2',    title: { zhCN: '節水モード',               en: 'Eco Water-Saving Mode' }, description: { zhCN: '通常比最大40%の節水を実現。',       en: 'Saves up to 40% water versus standard flow.'         } },
      { _key: 'f4', icon: 'hose',    title: { zhCN: 'ステンレスホース 1.5m',    en: '1.5 m Stainless Hose' }, description: { zhCN: '柔軟で耐久性の高いステンレス製。', en: 'Flexible, kink-resistant stainless steel hose.'      } },
      { _key: 'f5', icon: 'antical', title: { zhCN: '防カルキノズル',           en: 'Anti-Calc Nozzles'    }, description: { zhCN: 'シリコンノズルが水垢の付着を防ぎます。', en: 'Silicone nozzles prevent limescale build-up.'        } },
    ],
    specTable: {
      dimensions:       'Head Ø 220 mm / Arm: 300 mm',
      material:         'ABS / Stainless Steel hose / Brass valve',
      power:            '12 L/min at 3 bar (eco: 7 L/min)',
      drainageMethod:   '20–42°C (thermostatic)',
      waterConsumption: 'Ø 220 mm',
      weight:           '1.8 kg (full set)',
      color:            'Chrome / Matte Black',
      certification:    'CE / WRAS',
    },
    specs: [
      { _key: 's1', label: { zhCN: 'ホース長さ',      en: 'Hose Length'      }, value: '1.5 m'                   },
      { _key: 's2', label: { zhCN: 'スプレーモード数', en: 'Spray Modes'      }, value: '5 modes'                 },
      { _key: 's3', label: { zhCN: '温度調節範囲',    en: 'Temp Range'       }, value: '20–42°C'                 },
      { _key: 's4', label: { zhCN: '壁付けアーム',    en: 'Wall Arm Included'}, value: 'Yes, 300 mm'             },
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
