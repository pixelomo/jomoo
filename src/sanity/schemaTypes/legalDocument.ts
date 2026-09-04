import { defineArrayMember, defineField, defineType } from 'sanity'

/** The two documents have a route each; the slug picks which one this is, so a
 *  document can never be published to a URL the site does not serve. */
const SLUGS = [
  { title: 'プライバシーポリシー / Privacy Policy', value: 'privacy-policy' },
  { title: 'ご利用条件 / Terms of Use',            value: 'terms-of-use'   },
]

/** A 事業者情報 or お問い合わせ窓口 table: a label and a value per row. */
const definitionList = defineType({
  name: 'definitionList',
  title: '項目一覧 / Definition List',
  type: 'object',
  fields: [
    defineField({
      name: 'rows',
      title: '項目 / Rows',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'definitionRow',
          fields: [
            defineField({ name: 'label', title: '項目名 / Label', type: 'string' }),
            defineField({ name: 'value', title: '内容 / Value', type: 'string' }),
          ],
          preview: {
            select: { title: 'label', subtitle: 'value' },
          },
        }),
      ],
    }),
  ],
  preview: {
    select: { rows: 'rows' },
    prepare: ({ rows }) => ({
      title: '項目一覧',
      subtitle: `${rows?.length ?? 0} 項目`,
    }),
  },
})

export const legalDocument = defineType({
  name: 'legalDocument',
  title: '規約・ポリシー / Legal Document',
  type: 'document',
  groups: [
    { name: 'identity', title: '基本情報 / Identity', default: true },
    { name: 'body',     title: '本文 / Body' },
    { name: 'footer',   title: '末尾 / Colophon' },
  ],
  fields: [
    defineField({
      name: 'slug',
      title: 'ページ / Page',
      type: 'string',
      group: 'identity',
      description: 'このドキュメントを表示するページ。1ページにつき1件のみ作成してください。',
      options: { list: SLUGS, layout: 'radio' },
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'title',
      title: 'タイトル / Title',
      type: 'string',
      group: 'identity',
      description: 'ページ見出しとパンくずに表示されます。',
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'navLabel',
      title: 'フッターの表示名 / Footer Label',
      type: 'string',
      group: 'identity',
      description: 'フッターのリンク文言。空欄の場合はタイトルをそのまま使用します。',
    }),

    defineField({
      name: 'description',
      title: '検索結果の説明文 / Meta Description',
      type: 'text',
      rows: 3,
      group: 'identity',
      description: '検索エンジンやSNSに表示される説明文です。ページには表示されません。',
    }),

    defineField({
      name: 'body',
      title: '本文 / Body',
      type: 'array',
      group: 'body',
      description:
        '「第1条」などの条見出しは 見出し2 を、「(1)」で始まる各号は 番号付きリスト を選んでください。番号は自動で振られます。',
      of: [
        defineArrayMember({
          type: 'block',
          // The documents are plain prose: headings, paragraphs and numbered
          // clauses. Anything richer has nowhere to render, so it is not offered.
          styles: [
            { title: '本文 / Body', value: 'normal' },
            { title: '条見出し / Article Heading', value: 'h2' },
          ],
          lists: [{ title: '各号 / Numbered', value: 'number' }],
          marks: { decorators: [{ title: '強調 / Strong', value: 'strong' }], annotations: [] },
        }),
        defineArrayMember({ type: 'definitionList' }),
      ],
    }),

    defineField({
      name: 'established',
      title: '制定日 / Established',
      type: 'string',
      group: 'footer',
    }),

    defineField({
      name: 'operator',
      title: '運営会社 / Operator',
      type: 'string',
      group: 'footer',
    }),

    defineField({
      name: 'copyright',
      title: '著作権表示 / Copyright',
      type: 'string',
      group: 'footer',
    }),
  ],

  preview: {
    select: { title: 'title', subtitle: 'slug' },
  },
})

export const legalDocumentTypes = [definitionList, legalDocument]
