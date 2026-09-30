import { defineArrayMember, defineField, defineType } from 'sanity'

/** Copy that the design sets on fixed lines is stored as one string and split
 *  on its line breaks when it is drawn. */
const LINES = '改行した位置がそのままページ上の改行になります。'

const eyebrow = (name: string, group: string) =>
  defineField({ name, title: '英字見出し / Eyebrow', type: 'string', group })

/**
 * 会社情報 — one document for the whole page, top to bottom: the video opening,
 * JOMOOについて, the timeline, the brand family and the global figures.
 *
 * The 3D map under グローバル展開 is its own WebGL scene and is not edited here.
 */
export const companyPage = defineType({
  name: 'companyPage',
  title: '会社情報 / Company Information',
  type: 'document',
  groups: [
    { name: 'hero', title: 'オープニング / Opening', default: true },
    { name: 'history', title: '沿革 / History' },
    { name: 'brands', title: 'ブランド / Brands' },
    { name: 'global', title: 'グローバル展開 / Global' },
    { name: 'seo', title: '検索 / SEO' },
  ],
  fields: [
    defineField({
      name: 'description',
      title: '検索結果の説明文 / Meta Description',
      type: 'text',
      rows: 3,
      group: 'seo',
      description: '検索エンジンやSNSに表示される説明文です。ページには表示されません。',
    }),

    /* ── Opening ─────────────────────────────────────────────── */
    defineField({
      name: 'heroTitle',
      title: 'タイトル / Title',
      type: 'string',
      group: 'hero',
      description: '動画の上に大きく表示される一行。',
    }),
    defineField({
      name: 'heroVideo',
      title: '背景動画 / Video',
      type: 'file',
      group: 'hero',
      description: '音声なしのループ再生です。MP4 を推奨します。',
      options: { accept: 'video/mp4,video/webm' },
    }),
    defineField({
      name: 'heroPoster',
      title: '動画の静止画 / Poster',
      type: 'image',
      group: 'hero',
      description:
        '動画の読み込み中と、端末で「視差効果を減らす」が有効な場合に表示されます。動画と同じ場面の静止画にしてください。',
    }),
    defineField({
      name: 'about',
      title: 'JOMOOについて / About',
      type: 'object',
      group: 'hero',
      fields: [
        defineField({ name: 'eyebrow', title: '英字見出し / Eyebrow', type: 'string' }),
        defineField({ name: 'title', title: '見出し / Title', type: 'string' }),
        defineField({
          name: 'paragraphs',
          title: '本文 / Paragraphs',
          type: 'array',
          description: `段落ごとに1項目。${LINES}`,
          of: [defineArrayMember({ type: 'text', rows: 4 })],
        }),
      ],
    }),

    /* ── History ─────────────────────────────────────────────── */
    eyebrow('historyEyebrow', 'history'),
    defineField({ name: 'historyTitle', title: '見出し / Title', type: 'string', group: 'history' }),
    defineField({
      name: 'eras',
      title: '年代 / Eras',
      type: 'array',
      group: 'history',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'era',
          fields: [
            defineField({ name: 'from', title: '開始年 / From', type: 'string', validation: (Rule) => Rule.required() }),
            defineField({ name: 'to', title: '終了年 / To', type: 'string', description: '現在まで続く年代は「NOW」。' }),
            defineField({ name: 'eyebrow', title: '英字見出し / Eyebrow', type: 'string' }),
            defineField({ name: 'subtitle', title: '年代名 / Subtitle', type: 'string' }),
            defineField({
              name: 'tint',
              title: '背景 / Background',
              type: 'string',
              description: '背景画像のどちらの半分で色づけするか。交互に設定するとデザイン通りになります。',
              options: {
                list: [
                  { title: 'なし / None', value: 'none' },
                  { title: '上半分 / Top', value: 'top' },
                  { title: '下半分 / Bottom', value: 'bottom' },
                ],
                layout: 'radio',
                direction: 'horizontal',
              },
              initialValue: 'none',
            }),
            defineField({
              name: 'images',
              title: '写真 / Photos',
              type: 'array',
              of: [
                defineArrayMember({
                  type: 'image',
                  fields: [defineField({ name: 'alt', title: '代替テキスト / Alt Text', type: 'string' })],
                }),
              ],
            }),
            defineField({
              name: 'entries',
              title: '出来事 / Events',
              type: 'array',
              of: [
                defineArrayMember({
                  type: 'object',
                  name: 'eraEntry',
                  fields: [
                    defineField({ name: 'year', title: '年 / Year', type: 'string', validation: (Rule) => Rule.required() }),
                    defineField({ name: 'text', title: '内容 / Event', type: 'text', rows: 3, description: LINES }),
                  ],
                  preview: { select: { title: 'year', subtitle: 'text' } },
                }),
              ],
            }),
          ],
          preview: {
            select: { from: 'from', to: 'to', subtitle: 'subtitle', media: 'images.0' },
            prepare: ({ from, to, subtitle, media }) => ({
              title: `${from ?? ''}–${to ?? ''}`,
              subtitle,
              media,
            }),
          },
        }),
      ],
    }),

    /* ── Brand family ────────────────────────────────────────── */
    eyebrow('brandsEyebrow', 'brands'),
    defineField({ name: 'brandsTitle', title: '見出し / Title', type: 'string', group: 'brands' }),
    defineField({ name: 'brandsIntro', title: '導入文 / Intro', type: 'text', rows: 3, group: 'brands', description: LINES }),
    defineField({
      name: 'brands',
      title: 'ブランド / Brands',
      type: 'array',
      group: 'brands',
      description: '3件ずつ横に並びます。',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'brand',
          fields: [
            defineField({ name: 'name', title: 'ブランド名 / Name', type: 'string', validation: (Rule) => Rule.required() }),
            defineField({ name: 'photo', title: '写真 / Photo', type: 'image', options: { hotspot: true } }),
            defineField({ name: 'logo', title: 'ロゴ / Logo', type: 'image', description: '余白を切り落とした透過PNGを推奨します。' }),
            defineField({
              name: 'logoHeight',
              title: 'ロゴの高さ（px） / Logo Height',
              type: 'number',
              description: 'ロゴは形がそれぞれ違うため、見た目の大きさが揃うよう個別に高さを指定します。',
              initialValue: 40,
              validation: (Rule) => Rule.min(10).max(120),
            }),
            defineField({
              name: 'logoAlt',
              title: 'ロゴの表記 / Logo Text',
              type: 'string',
              description: 'ロゴに書かれている文字がブランド名と異なる場合のみ入力してください。',
            }),
            defineField({ name: 'copy', title: '紹介文 / Copy', type: 'text', rows: 3, description: LINES }),
          ],
          preview: { select: { title: 'name', subtitle: 'copy', media: 'logo' } },
        }),
      ],
    }),

    /* ── Global presence ─────────────────────────────────────── */
    eyebrow('globalEyebrow', 'global'),
    defineField({ name: 'globalTitle', title: '見出し / Title', type: 'string', group: 'global' }),
    defineField({ name: 'globalIntro', title: '導入文 / Intro', type: 'text', rows: 4, group: 'global', description: LINES }),
    defineField({
      name: 'stats',
      title: '数値 / Figures',
      type: 'array',
      group: 'global',
      description: 'ページに表示されると0から数え上がります。',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'stat',
          fields: [
            defineField({ name: 'label', title: '項目名 / Label', type: 'string', validation: (Rule) => Rule.required() }),
            defineField({ name: 'value', title: '数値 / Value', type: 'number', validation: (Rule) => Rule.required().min(0) }),
            defineField({ name: 'suffix', title: '末尾の記号 / Suffix', type: 'string', description: '例: +' }),
            defineField({
              name: 'icon',
              title: 'アイコン / Icon',
              type: 'image',
              description: '空欄の場合はショールームの線画アイコンを表示します。',
            }),
          ],
          preview: {
            select: { label: 'label', value: 'value', suffix: 'suffix', media: 'icon' },
            prepare: ({ label, value, suffix, media }) => ({
              title: label,
              subtitle: `${value?.toLocaleString('ja-JP') ?? ''}${suffix ?? ''}`,
              media,
            }),
          },
        }),
      ],
    }),
  ],

  preview: { prepare: () => ({ title: '会社情報' }) },
})
