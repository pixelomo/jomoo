/**
 * Editorial copy for the product detail template.
 *
 * Sanity holds the catalogue data (model code, name, tagline, specs) but not the
 * Japanese hero catchphrase, the lifestyle shot behind it, or the long-form
 * feature write-ups, so those live here. A series entry covers every product in
 * that series; the per-slug maps override it.
 */

export interface HeroContent {
  /** Small uppercase line above the model name. */
  eyebrow: string
  /** Large model name, e.g. "X40-B". */
  title: string
  /** Japanese catchphrase — one entry per rendered line. */
  catch: string[]
  /** Full-bleed background image. */
  image: string
}

interface SeriesHero {
  eyebrow: string
  /** Trailing words stripped off name.en to get the bare model name. */
  nameSuffix: string
  catch: string[]
  image?: string
}

const SERIES_HERO: Record<string, SeriesHero> = {
  'smart-toilet': {
    eyebrow: 'SMART TOILET',
    nameSuffix: 'Smart Toilet',
    catch: ['静けさが、', '暮らしを変える。'],
    image: '/images/smart.jpg',
  },
  faucets: {
    eyebrow: 'FAUCET',
    nameSuffix: 'Faucet',
    catch: ['水を、', '思いのままに。'],
  },
  'shower-set': {
    eyebrow: 'SHOWER SET',
    nameSuffix: 'Shower Set',
    catch: ['浴びる時間を、', '極上のひとときに。'],
  },
  washstand: {
    eyebrow: 'WASHSTAND',
    nameSuffix: 'Washstand',
    catch: ['毎日の身支度を、', '心地よく。'],
  },
}

/** Per-product overrides — only needed when a product departs from its series. */
const PRODUCT_HERO: Record<string, Partial<HeroContent>> = {}

const FALLBACK_IMAGE = '/images/placeholder-hero-scene.jpg'

function stripSuffix(nameEn: string, suffix: string): string {
  if (!suffix) return nameEn.trim()
  const escaped = suffix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return nameEn.replace(new RegExp(`\\s*${escaped}\\s*$`, 'i'), '').trim() || nameEn.trim()
}

/**
 * @param productImage first Sanity image, used when the series has no hero art.
 */
export function getHeroContent(
  series: string,
  slug: string,
  nameEn: string,
  productImage?: string
): HeroContent {
  const seriesHero = SERIES_HERO[series]
  const base: HeroContent = {
    eyebrow: seriesHero?.eyebrow ?? series.replace(/-/g, ' ').toUpperCase(),
    title: stripSuffix(nameEn, seriesHero?.nameSuffix ?? ''),
    catch: seriesHero?.catch ?? [],
    image: seriesHero?.image ?? productImage ?? FALLBACK_IMAGE,
  }
  return { ...base, ...PRODUCT_HERO[slug] }
}

/* ------------------------------------------------------------------
   おすすめ機能 — feature write-ups for the first product tab
   ------------------------------------------------------------------ */

export interface FeatureCopy {
  /** One entry per rendered line. */
  title: string[]
  /** One entry per rendered line. */
  body: string[]
  /** Public path; falls back to the Sanity feature image at the same index. */
  image?: string
}

/** Shared across the X40 family — split into per-slug lists if they diverge. */
const X40_FEATURES: FeatureCopy[] = [
  {
    title: ['自動洗浄ロボット'],
    image: '/images/slide3.jpeg',
    body: [
      '使用前にロボットアームが作動して、',
      '360°全方位からきめ細やかな泡を噴射し、',
      'ボウル面を包み込みます。除菌・防菌・防臭・飛散を',
      '防止し、トイレがいつでも清潔に保たれます。',
    ],
  },
  {
    title: ['フットセンサーによる', '便蓋・便座自動開閉'],
    image: '/images/feature-2.jpeg',
    body: [
      'フットセンサーにより、便蓋・便座が自動開閉します。',
      'ご高齢の方、身体が不自由な方など、',
      'すべてのユーザーに対して快適な使い心地を提供します。',
      '接触操作を少なくし、より衛生的な使用方法が可能です。',
    ],
  },
  {
    title: ['UVノズルによる除菌'],
    image: '/images/feature-3.jpg',
    body: [
      'UVノズルが伸び出す前に細菌を殺菌します。',
      '紫外線を直接見る必要がないため、',
      '除菌率 99%の長期的な効果で交差感染を防ぎ、',
      '家族全員が安全・安心に使用できます。',
    ],
  },
  {
    title: ['季節に応じた温度調節'],
    image: '/images/feature-4.jpg',
    body: [
      '便座に内蔵されたスマート温度センサーにより、',
      '季節ごとに室温をリアルタイムで感知。',
      'AIが座面温度を自動調節し、冷たさを感じることなく',
      '着座した瞬間から、心地の良い温かさを感じられます。',
    ],
  },
  {
    title: ['リモコン式', '便蓋・便座自動開閉'],
    image: '/images/feature-5.jpg',
  body: [
    'フットセンサーに加えて、リモコンでも、',
    '便蓋・便座自動開閉の操作が可能です。',
    'ユーザーが求める快適な暮らしを選択できるように、',
    'リモコン式の機能も備えています。',
  ],
  },
]

/**
 * When a slug has an entry here it is the complete list for the おすすめ機能 tab.
 * Products with no entry fall back to Sanity's `features[]` + `featureImages[]`.
 */
const PRODUCT_FEATURES: Record<string, FeatureCopy[]> = {
  'x40-b': X40_FEATURES,
  'x40-c': X40_FEATURES,
}

export function getFeatureCopy(slug: string): FeatureCopy[] {
  return PRODUCT_FEATURES[slug] ?? []
}

/* ------------------------------------------------------------------
   標準機能 — grouped capability lists below the feature cards
   ------------------------------------------------------------------ */

export interface StandardGroup {
  title: string
  /** One entry per rendered line. */
  items: string[]
}

/** Shared across the X40 family. */
const X40_STANDARD: StandardGroup[] = [
  {
    title: '洗浄機能',
    items: [
      '超静音回転式洗浄',
      'フットセンサーによる洗浄',
      '離座自動洗浄',
      '停電時洗浄',
      'プレミスト',
    ],
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
  {
  title: '快適機能',
  items: ['暖房便座', '照度センサーナイトライト'],
  },
]

const PRODUCT_STANDARD: Record<string, StandardGroup[]> = {
  'x40-b': X40_STANDARD,
  'x40-c': X40_STANDARD,
}

export function getStandardGroups(slug: string): StandardGroup[] {
  return PRODUCT_STANDARD[slug] ?? []
}

/** Dimension drawing shown above the 仕様 table. */
const PRODUCT_SPEC_IMAGE: Record<string, string> = {
  'x40-b': '/images/x40-diagram.jpg',
  'x40-c': '/images/x40-diagram.jpg',
}

export function getSpecImage(slug: string): string | undefined {
  return PRODUCT_SPEC_IMAGE[slug]
}

/* ------------------------------------------------------------------
   タイプ・価格 — 3D model + pricing
   ------------------------------------------------------------------ */

/** glTF model driving the tab's 3D viewer. */
const PRODUCT_MODEL: Record<string, string> = {
  'x40-b': '/glb/x40.glb',
  'x40-c': '/glb/x40.glb',
}

export function getModelSrc(slug: string): string | undefined {
  return PRODUCT_MODEL[slug]
}

/**
 * Products that borrow a sibling's product still for the 3D card, rather than
 * using their own Sanity image. Value is the slug to borrow from.
 */
const STILL_ALIAS: Record<string, string> = {
  'x40-c': 'x40-b',
}

export function getStillAlias(slug: string): string | undefined {
  return STILL_ALIAS[slug]
}

/** Stands in until real pricing lands. */
export const PRICE_PLACEHOLDER = '000000円（税込000000円）'

const PRODUCT_PRICE: Record<string, string> = {}

export function getPrice(slug: string): string {
  return PRODUCT_PRICE[slug] ?? PRICE_PLACEHOLDER
}

/* ------------------------------------------------------------------
   関連商品 — lineup card art, shared with the homepage feature grid
   ------------------------------------------------------------------ */

export interface CardArt {
  image: string
  /** Swapped in on hover. */
  hover?: string
  /** Blurb under the model name; falls back to the Sanity tagline. */
  desc?: string
}

const PRODUCT_CARD: Record<string, CardArt> = {
  'x40-b': {
    image: '/images/X-40-B.jpeg',
    hover: '/images/X40-hover.jpeg',
    desc: '設置しているセンサーに反応して、自動で蓋が開閉したり、洗浄します。',
  },
  'x40-c': {
    image: '/images/X-40-C.jpeg',
    hover: '/images/X40-hover.jpeg',
    desc: '世界で多くの賞を獲得したデザインチームによる革新的なデザインです。',
  },
}

/** @param fallback Sanity thumbnail, used when a product has no lineup art. */
export function getCardArt(slug: string, fallback?: string): CardArt | undefined {
  const art = PRODUCT_CARD[slug]
  if (art) return art
  return fallback ? { image: fallback } : undefined
}


/* ------------------------------------------------------------------
   Series lineup — heading copy for the /products/<series> page
   ------------------------------------------------------------------ */

export interface SeriesLineup {
  eyebrow: string
  title: string
  /** One entry per rendered line. */
  subtitle: string[]
}

const SERIES_LINEUP: Record<string, SeriesLineup> = {
  'smart-toilet': {
    eyebrow: 'SMART TOILET LINEUP',
    title: 'あなたの空間に、最適な一台を。',
    subtitle: [
      'ライフスタイルや空間に合わせて選べる、',
      'JOMOOのスマートトイレラインナップ。',
    ],
  },
}

/**
 * @param fallbackTitle    series name from Sanity
 * @param fallbackSubtitle series description from Sanity
 */
export function getSeriesLineup(
  series: string,
  fallbackTitle: string,
  fallbackSubtitle?: string
): SeriesLineup {
  const written = SERIES_LINEUP[series]
  if (written) return written
  const eyebrow = SERIES_HERO[series]?.eyebrow ?? series.replace(/-/g, ' ').toUpperCase()
  return {
    eyebrow: `${eyebrow} LINEUP`,
    title: fallbackTitle,
    subtitle: fallbackSubtitle ? [fallbackSubtitle] : [],
  }
}
