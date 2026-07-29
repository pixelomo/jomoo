import { defineArrayMember, defineField, defineType } from 'sanity'

const LINES_HINT = '1行につき1つ改行してください。改行した位置で表示も折り返します。'

export const product = defineType({
  name: 'product',
  title: '製品 / Product',
  type: 'document',
  groups: [
    { name: 'identity', title: '基本情報 / Identity', default: true },
    { name: 'hero',     title: 'ヒーロー / Hero'                     },
    { name: 'content',  title: '機能 / Features'                     },
    { name: 'specs',    title: '仕様 / Specifications'               },
    { name: 'media',    title: 'メディア / Media'                    },
    { name: 'settings',  title: '設定 / Settings'                    },
  ],
  fields: [
    // ── IDENTITY ──────────────────────────────────────────────
    defineField({
      name: 'modelCode',
      title: '型番 / Model Code',
      type: 'string',
      group: 'identity',
      description: '製品登録フォームのプルダウンにも使われます（例：JPD6351-SA-EPC000）',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'series',
      title: 'シリーズ / Product Series',
      type: 'string',
      group: 'identity',
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
      title: '製品名 / Product Name',
      type: 'string',
      group: 'identity',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'URL スラッグ / URL Slug',
      type: 'slug',
      group: 'identity',
      description: '製品ページの URL に使われます（例：x40-b → /products/smart-toilet/x40-b）',
      options: { source: 'name', maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'tagline',
      title: 'キャッチコピー（一覧用） / Tagline',
      type: 'string',
      group: 'identity',
      description: 'シリーズ一覧・関連商品カードに表示される短い説明',
    }),

    // ── HERO ──────────────────────────────────────────────────
    defineField({
      name: 'hero',
      title: 'ページ上部のヒーロー',
      type: 'object',
      group: 'hero',
      options: { collapsible: true, collapsed: false },
      fields: [
        defineField({
          name: 'eyebrow',
          title: '英字ラベル / Eyebrow',
          type: 'string',
          description: '製品名の上に表示される小さな英字（例：SMART TOILET）',
        }),
        defineField({
          name: 'title',
          title: '表示名 / Display Name',
          type: 'string',
          description: 'ヒーローとパンくずに表示される短い名前（例：X40-B）。空欄なら製品名を使用します。',
        }),
        defineField({
          name: 'catchphrase',
          title: 'キャッチフレーズ / Catchphrase',
          type: 'text',
          rows: 3,
          description: LINES_HINT,
        }),
        defineField({
          name: 'image',
          title: '背景画像 / Background Image',
          type: 'image',
          options: { hotspot: true },
        }),
      ],
    }),

    // ── FEATURES ──────────────────────────────────────────────
    defineField({
      name: 'featureCards',
      title: 'おすすめ機能',
      type: 'array',
      group: 'content',
      description: '「おすすめ機能」タブに大きなカードで並びます。',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({
              name: 'title',
              title: '見出し / Title',
              type: 'text',
              rows: 2,
              description: LINES_HINT,
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'body',
              title: '本文 / Body',
              type: 'text',
              rows: 4,
              description: LINES_HINT,
            }),
            defineField({
              name: 'image',
              title: '画像 / Image',
              type: 'image',
              options: { hotspot: true },
            }),
          ],
          preview: {
            select: { title: 'title', media: 'image' },
            prepare: ({ title, media }) => ({
              title: (title ?? '').split('\n').join(' ') || '見出しなし',
              media,
            }),
          },
        }),
      ],
    }),

    defineField({
      name: 'standardGroups',
      title: '標準機能',
      type: 'array',
      group: 'content',
      description: '「おすすめ機能」タブの下に、カテゴリごとのリストとして表示されます。',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({
              name: 'title',
              title: 'カテゴリ名 / Category',
              type: 'string',
              description: '例：洗浄機能、抗菌衛生機能',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'items',
              title: '機能一覧 / Items',
              type: 'array',
              of: [defineArrayMember({ type: 'string' })],
              options: { layout: 'tags' },
            }),
          ],
          preview: {
            select: { title: 'title', items: 'items' },
            prepare: ({ title, items }) => ({
              title: title ?? 'カテゴリ名なし',
              subtitle: `${items?.length ?? 0} 項目`,
            }),
          },
        }),
      ],
    }),

    defineField({
      name: 'longDescription',
      title: '製品について / Product Description',
      type: 'array',
      group: 'content',
      description: '「製品について」セクションの本文。空欄の場合セクションごと非表示になります。',
      of: [defineArrayMember({ type: 'block' })],
    }),

    // ── SPECIFICATIONS ────────────────────────────────────────
    defineField({
      name: 'specImage',
      title: '寸法図 / Dimension Drawing',
      type: 'image',
      group: 'specs',
      description: '仕様表の上に表示される図面',
    }),

    defineField({
      name: 'specGroups',
      title: '仕様表',
      type: 'array',
      group: 'specs',
      description:
        '仕様表のセクション。見出しなしのセクションを先頭に置くと、表の冒頭に見出しなしで並びます。',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({
              name: 'title',
              title: 'セクション見出し / Section Heading',
              type: 'string',
              description: '例：便器部、機能部、リモコン。空欄可。',
            }),
            defineField({
              name: 'rows',
              title: '行 / Rows',
              type: 'array',
              of: [
                defineArrayMember({
                  type: 'object',
                  fields: [
                    defineField({
                      name: 'subgroup',
                      title: '小見出し / Sub-heading',
                      type: 'string',
                      description: '同じ小見出しが続く行はまとめて表示されます。空欄可。',
                    }),
                    defineField({
                      name: 'label',
                      title: '項目名 / Label',
                      type: 'string',
                      validation: (Rule) => Rule.required(),
                    }),
                    defineField({
                      name: 'value',
                      title: '内容 / Value',
                      type: 'text',
                      rows: 2,
                      description: LINES_HINT,
                      validation: (Rule) => Rule.required(),
                    }),
                  ],
                  preview: {
                    select: { label: 'label', value: 'value', subgroup: 'subgroup' },
                    prepare: ({ label, value, subgroup }) => ({
                      title: subgroup ? `${subgroup} › ${label}` : label,
                      subtitle: (value ?? '').split('\n').join(' '),
                    }),
                  },
                }),
              ],
            }),
          ],
          preview: {
            select: { title: 'title', rows: 'rows' },
            prepare: ({ title, rows }) => ({
              title: title || '（見出しなし）',
              subtitle: `${rows?.length ?? 0} 行`,
            }),
          },
        }),
      ],
    }),

    defineField({
      name: 'specNote',
      title: '仕様表の注記 / Spec Table Note',
      type: 'text',
      rows: 3,
      group: 'specs',
      description: '仕様表の下に小さく表示される注記（※1 など）。' + LINES_HINT,
    }),

    // ── MEDIA ─────────────────────────────────────────────────
    defineField({
      name: 'images',
      title: '製品画像 / Product Images',
      type: 'array',
      group: 'media',
      description: '1枚目が「タイプ・価格」タブの製品写真として使われます。',
      of: [
        defineArrayMember({
          type: 'image',
          options: { hotspot: true },
          fields: [
            defineField({ name: 'alt', title: '代替テキスト / Alt Text', type: 'string' }),
            defineField({ name: 'caption', title: 'キャプション / Caption', type: 'string' }),
          ],
        }),
      ],
    }),

    defineField({
      name: 'model3d',
      title: '3D モデル / 3D Model (.glb)',
      type: 'file',
      group: 'media',
      description: '「タイプ・価格」タブの 3D ビューアで読み込むファイル',
      options: { accept: '.glb,.gltf' },
    }),

    defineField({
      name: 'card',
      title: '一覧カード / Lineup Card',
      type: 'object',
      group: 'media',
      description: 'シリーズ一覧・関連商品に表示されるカードの見た目',
      options: { collapsible: true, collapsed: true },
      fields: [
        defineField({
          name: 'image',
          title: '通常画像 / Default Image',
          type: 'image',
          options: { hotspot: true },
        }),
        defineField({
          name: 'hoverImage',
          title: 'ホバー時の画像 / Hover Image',
          type: 'image',
          options: { hotspot: true },
        }),
        defineField({
          name: 'description',
          title: 'カードの説明文 / Card Description',
          type: 'text',
          rows: 2,
          description: '空欄の場合はキャッチコピーを使用します。',
        }),
      ],
    }),

    defineField({
      name: 'featureVideos',
      title: '特長動画 / Feature Videos',
      type: 'array',
      group: 'media',
      description: 'YouTube / Vimeo の埋め込み URL',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({ name: 'embedUrl', title: '埋め込み URL', type: 'url' }),
            defineField({ name: 'title', title: '動画タイトル / Video Title', type: 'string' }),
          ],
          preview: {
            select: { title: 'title', subtitle: 'embedUrl' },
            prepare: ({ title, subtitle }) => ({ title: title ?? '動画', subtitle }),
          },
        }),
      ],
    }),

    // ── SETTINGS ──────────────────────────────────────────────
    defineField({
      name: 'price',
      title: '価格 / Price',
      type: 'string',
      group: 'settings',
      description: '「タイプ・価格」タブに表示される文字列（例：000000円（税込000000円））',
    }),

    defineField({
      name: 'isActive',
      title: '製品登録のプルダウンに表示する',
      type: 'boolean',
      group: 'settings',
      initialValue: true,
    }),

    defineField({
      name: 'description',
      title: '短い説明（製品登録プルダウン用）',
      type: 'text',
      rows: 2,
      group: 'settings',
    }),
  ],

  preview: {
    select: { title: 'name', subtitle: 'modelCode', media: 'images.0' },
    prepare: ({ title, subtitle, media }) => ({
      title: title ?? '名称未設定',
      subtitle,
      media,
    }),
  },
})
