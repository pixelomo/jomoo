import { defineField, defineType } from 'sanity'

const LINES_HINT = '1行につき1つ改行してください。改行した位置で表示も折り返します。'

export const productSeries = defineType({
  name: 'productSeries',
  title: '製品シリーズ / Product Series',
  type: 'document',
  groups: [
    { name: 'identity', title: '基本情報 / Identity', default: true },
    { name: 'lineup',   title: '一覧ページ / Lineup Page'           },
    { name: 'hero',     title: '製品ページの初期値 / Product Defaults' },
  ],
  fields: [
    defineField({
      name: 'seriesId',
      title: 'シリーズ / Series',
      type: 'string',
      group: 'identity',
      description: '製品ドキュメントおよび URL のシリーズ名と一致させてください',
      options: {
        list: [
          { title: 'スマートトイレ / Smart Toilet', value: 'smart-toilet' },
          { title: '洗面化粧台 / Washstand',        value: 'washstand'    },
          { title: '水栓金具 / Faucets',            value: 'faucets'      },
          { title: 'シャワーセット / Shower Set',   value: 'shower-set'   },
        ],
        layout: 'radio',
      },
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'name',
      title: 'シリーズ名 / Series Name',
      type: 'string',
      group: 'identity',
      description: 'ナビゲーションやパンくずに表示されます',
    }),

    defineField({
      name: 'tagline',
      title: 'キャッチコピー / Tagline',
      type: 'string',
      group: 'identity',
    }),

    defineField({
      name: 'description',
      title: 'シリーズ説明 / Series Description',
      type: 'text',
      rows: 3,
      group: 'identity',
    }),

    // ── LINEUP PAGE ───────────────────────────────────────────
    defineField({
      name: 'lineup',
      title: '一覧ページの見出し',
      type: 'object',
      group: 'lineup',
      description: '/products/<シリーズ> ページ上部の見出し',
      options: { collapsible: true, collapsed: false },
      fields: [
        defineField({
          name: 'eyebrow',
          title: '英字ラベル / Eyebrow',
          type: 'string',
          description: '例：SMART TOILET LINEUP',
        }),
        defineField({
          name: 'title',
          title: '見出し / Heading',
          type: 'string',
          description: '空欄の場合はシリーズ名を使用します。',
        }),
        defineField({
          name: 'subtitle',
          title: 'リード文 / Subtitle',
          type: 'text',
          rows: 3,
          description: `${LINES_HINT} 空欄の場合はシリーズ説明を使用します。`,
        }),
      ],
    }),

    defineField({
      name: 'heroImage',
      title: 'シリーズのヒーロー画像（任意）',
      type: 'image',
      group: 'lineup',
      options: { hotspot: true },
    }),

    // ── PRODUCT PAGE DEFAULTS ─────────────────────────────────
    defineField({
      name: 'productDefaults',
      title: '製品ページの初期値',
      type: 'object',
      group: 'hero',
      description:
        'このシリーズの製品でヒーローが未設定のとき使われます。個々の製品側で設定した内容が優先されます。',
      options: { collapsible: true, collapsed: false },
      fields: [
        defineField({
          name: 'heroEyebrow',
          title: '英字ラベル / Hero Eyebrow',
          type: 'string',
          description: '例：SMART TOILET',
        }),
        defineField({
          name: 'heroCatchphrase',
          title: 'キャッチフレーズ / Hero Catchphrase',
          type: 'text',
          rows: 3,
          description: LINES_HINT,
        }),
        defineField({
          name: 'heroImage',
          title: '背景画像 / Hero Background',
          type: 'image',
          options: { hotspot: true },
        }),
        defineField({
          name: 'nameSuffix',
          title: '表示名から取り除く語 / Name Suffix',
          type: 'string',
          description:
            '製品名の末尾がこの語で終わる場合、ヒーローの表示名から取り除きます（例：「スマートトイレ」→ X40-B）',
        }),
      ],
    }),
  ],

  preview: {
    select: { title: 'name', subtitle: 'seriesId' },
    prepare: ({ title, subtitle }) => ({ title: title ?? '名称未設定', subtitle }),
  },
})
