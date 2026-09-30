import { defineArrayMember, defineField, defineType } from 'sanity'

const LINES = '改行した位置がそのままページ上の改行になります。'

/**
 * デザイナー — the sketch hero, the statement under it, one band per designer
 * and the award marks.
 *
 * The bands' colour and which side the portrait sits on are not set here: they
 * alternate down the page in the order the designers are listed, so a designer
 * added, removed or moved keeps the rhythm without anyone recolouring the rest.
 */
export const designerPage = defineType({
  name: 'designerPage',
  title: 'デザイナー / Designer',
  type: 'document',
  groups: [
    { name: 'hero', title: 'オープニング / Opening', default: true },
    { name: 'designers', title: 'デザイナー / Designers' },
    { name: 'awards', title: '受賞歴 / Awards' },
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

    defineField({ name: 'heroImage', title: '背景画像 / Image', type: 'image', group: 'hero', options: { hotspot: true } }),
    defineField({ name: 'heroEyebrow', title: '英字見出し / Eyebrow', type: 'string', group: 'hero' }),
    defineField({ name: 'heroTitle', title: 'タイトル / Title', type: 'text', rows: 2, group: 'hero', description: LINES }),
    defineField({
      name: 'intro',
      title: '導入文 / Intro',
      type: 'text',
      rows: 4,
      group: 'hero',
      description: `画像の下、中央揃えで表示される文章。${LINES}スマートフォンでは改行せずに流し込みます。`,
    }),

    defineField({
      name: 'designers',
      title: 'デザイナー / Designers',
      type: 'array',
      group: 'designers',
      description: '背景色と写真の左右は、並び順に合わせて自動で交互になります。',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'designer',
          fields: [
            defineField({ name: 'name', title: '氏名 / Name', type: 'string', validation: (Rule) => Rule.required() }),
            defineField({
              name: 'watermark',
              title: 'ローマ字表記 / Romanised Name',
              type: 'string',
              description: '背景に大きく表示されます。半角大文字で入力してください（例: JOHAN DÜCK）。',
            }),
            defineField({ name: 'role', title: '役職 / Role', type: 'string' }),
            defineField({ name: 'photo', title: '写真 / Portrait', type: 'image', options: { hotspot: true } }),
            defineField({ name: 'body', title: '紹介文 / Biography', type: 'text', rows: 5 }),
          ],
          preview: { select: { title: 'name', subtitle: 'role', media: 'photo' } },
        }),
      ],
    }),

    defineField({ name: 'awardsEyebrow', title: '英字見出し / Eyebrow', type: 'string', group: 'awards' }),
    defineField({ name: 'awardsTitle', title: '見出し / Title', type: 'string', group: 'awards' }),
    defineField({
      name: 'awards',
      title: '受賞ロゴ / Award Logos',
      type: 'array',
      group: 'awards',
      description: '自動で横に流れます。トップページの受賞ロゴ一覧にも表示されます。',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'award',
          fields: [
            defineField({ name: 'logo', title: 'ロゴ / Logo', type: 'image', validation: (Rule) => Rule.required() }),
            defineField({
              name: 'name',
              title: '賞の名称 / Award',
              type: 'string',
              description: 'ロゴの代替テキストとして読み上げソフトで読まれます。',
            }),
          ],
          preview: { select: { title: 'name', media: 'logo' } },
        }),
      ],
    }),
  ],

  preview: { prepare: () => ({ title: 'デザイナー' }) },
})
