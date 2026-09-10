/**
 * Copy, imagery and taxonomy for /global-projects, transcribed from the
 * client's design screenshots (public/images/screens/projects1-6.png).
 */

export interface GlobalProject {
  slug: string
  title: string
  image: string
  description: string
  /** Matches one entry of PROJECT_COUNTRIES. */
  country: string
  /** Matches one entry of PROJECT_CATEGORIES. */
  category: string
}

/** Filter row 1 in the design: where the project is. */
export const PROJECT_COUNTRIES = [
  '中国',
  'オーストラリア',
  'ミャンマー',
  'インドネシア',
  'マダガスカル',
] as const

/**
 * Filter row 2 in the design: what the project is.
 *
 * 交通拠点 is not in the design's second row, which stops at スポーツ施設 —
 * but the railway project carries that tag on its own card, so without a chip
 * it was the one project the filter could never reach. Added on request.
 */
export const PROJECT_CATEGORIES = [
  '古代遺産と古代建築',
  'ホテル&レジデンス',
  '教育機関',
  '市営建物',
  'スポーツ施設',
  '交通拠点',
] as const

export const GLOBAL_PROJECTS: GlobalProject[] = [
  {
    slug: 'china-national-museum',
    title: '中国国博物館',
    image: '/images/projects/china-national-museum.jpg',
    description:
      '北京・天安門広場の東側に位置する中国国家博物館は、5,000年以上にわたる中国の歴史と文化を伝える世界有数の博物館です。',
    country: '中国',
    category: '古代遺産と古代建築',
  },
  {
    slug: 'novotel-melbourne-central',
    title: 'ノボテル メルボルン セントラル',
    image: '/images/projects/novotel-melbourne-central.jpg',
    description:
      'オーストラリアのホテルで、快適性と利便性を兼ね備えたホテルです。JOMOOのバスルーム設備を採用し、上質な滞在環境を実現。',
    country: 'オーストラリア',
    category: 'ホテル&レジデンス',
  },
  {
    slug: 'huashi-xiping-bilingual-school',
    title: '華市西平バイリンガルスクール',
    image: '/images/projects/huashi-xiping-bilingual-school.jpg',
    description:
      '厦門華石西平バイリンガル学校は、幼稚園から高校までを擁する教育機関です。JOMOOの浴室設備を導入し、より快適で質の高い学習環境づくりに貢献しています。',
    country: '中国',
    category: '教育機関',
  },
  {
    slug: 'yangon-national-theatre',
    title: '国立劇場',
    image: '/images/projects/yangon-national-theatre.jpg',
    description:
      'ヤンゴン国立劇場は、ミャンマーを代表する文化施設の一つです。JOMOOの洗練された水まわり設備を採用し、来場者の快適性向上に貢献しています。',
    country: 'ミャンマー',
    category: '市営建物',
  },
  {
    slug: 'jakarta-bandung-railway',
    title: 'ジャカルタ・バンドン高速鉄道',
    image: '/images/projects/jakarta-bandung-railway.jpg',
    description:
      'ジャカルタとバンドンを結ぶインドネシア初の高速鉄道は、地域の発展を支える交通インフラです。JOMOOの水まわり設備により、快適な利用環境を実現しています。',
    country: 'インドネシア',
    category: '交通拠点',
  },
  {
    slug: 'mahamasina-stadium',
    title: 'マハマシナ市立競技場',
    image: '/images/projects/mahamasina-stadium.jpg',
    description:
      'マハマシナ市立競技場は、マダガスカルを代表するスポーツ施設です。JOMOOの水まわり設備を採用し、来場者の快適性向上に貢献しています。',
    country: 'マダガスカル',
    category: 'スポーツ施設',
  },
]
