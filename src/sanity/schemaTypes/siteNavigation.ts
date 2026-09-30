import { defineArrayMember, defineField, defineType, type StringRule } from 'sanity'

/** A path on this site (/showroom) or a full URL to somewhere else. */
const hrefField = (required = true) =>
  defineField({
    name: 'href',
    title: 'リンク先 / Link',
    type: 'string',
    description: 'サイト内は「/showroom」のように / から、外部サイトは https:// から入力してください。',
    validation: (rule: StringRule) => {
      const r = rule.custom((value?: string) =>
        !value || /^\/(?!\/)/.test(value) || /^https?:\/\//.test(value)
          ? true
          : '「/」または「https://」で始めてください。'
      )
      return required ? r.required() : r
    },
  })

const link = (name: string, extra: ReturnType<typeof defineField>[] = []) =>
  defineArrayMember({
    type: 'object',
    name,
    fields: [
      defineField({ name: 'label', title: '表示名 / Label', type: 'string', validation: (Rule) => Rule.required() }),
      hrefField(),
      ...extra,
    ],
    preview: { select: { title: 'label', subtitle: 'href' } },
  })

export const SOCIAL_PLATFORMS = [
  { title: 'Facebook', value: 'facebook' },
  { title: 'Instagram', value: 'instagram' },
  { title: 'YouTube', value: 'youtube' },
  { title: 'LinkedIn', value: 'linkedin' },
  { title: 'X', value: 'x' },
]

/**
 * ヘッダー・フッター — the site's own links. Account links (ログイン, マイページ)
 * and the legal row are not here: the first follow the visitor's session, the
 * second are named by the 規約・ポリシー documents themselves.
 */
export const siteNavigation = defineType({
  name: 'siteNavigation',
  title: 'ヘッダー・フッター / Navigation',
  type: 'document',
  groups: [
    { name: 'header', title: 'ヘッダー / Header', default: true },
    { name: 'footer', title: 'フッター / Footer' },
  ],
  fields: [
    defineField({
      name: 'menu',
      title: 'メニュー / Menu',
      type: 'array',
      group: 'header',
      description: 'ヘッダーとスマートフォンのメニューに表示されます。サブメニューを追加すると、その項目はドロップダウンになります。',
      of: [
        link('navItem', [
          defineField({
            name: 'children',
            title: 'サブメニュー / Submenu',
            type: 'array',
            of: [link('navChild')],
          }),
        ]),
      ],
    }),
    defineField({ name: 'contactLabel', title: 'お問い合わせボタン / Contact Button', type: 'string', group: 'header' }),
    defineField({
      name: 'globalSite',
      title: 'グローバルサイト / Global Site',
      type: 'url',
      group: 'header',
      description: 'ヘッダーの地球アイコンのリンク先。',
    }),

    defineField({
      name: 'footerColumns',
      title: 'フッターの列 / Footer Columns',
      type: 'array',
      group: 'footer',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'footerColumn',
          fields: [
            defineField({ name: 'heading', title: '見出し / Heading', type: 'string', validation: (Rule) => Rule.required() }),
            {
              ...hrefField(false),
              name: 'headingHref',
              title: '見出しのリンク先 / Heading Link',
              description: '入力すると見出し自体がリンクになります。同じページへのリンクを下の一覧に重ねて置く必要はありません。',
            },
            defineField({
              name: 'links',
              title: 'リンク / Links',
              type: 'array',
              of: [
                link('footerLink', [
                  defineField({
                    name: 'emphasis',
                    title: '強調（太字・上に余白） / Emphasis',
                    type: 'boolean',
                    initialValue: false,
                  }),
                ]),
              ],
            }),
          ],
          preview: {
            select: { title: 'heading', links: 'links' },
            prepare: ({ title, links }) => ({ title, subtitle: `${links?.length ?? 0} リンク` }),
          },
        }),
      ],
    }),
    defineField({
      name: 'social',
      title: 'SNS / Social',
      type: 'array',
      group: 'footer',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'socialLink',
          fields: [
            defineField({
              name: 'platform',
              title: 'サービス / Platform',
              type: 'string',
              options: { list: SOCIAL_PLATFORMS },
              validation: (Rule) => Rule.required(),
            }),
            defineField({ name: 'url', title: 'URL', type: 'url', validation: (Rule) => Rule.required() }),
          ],
          preview: { select: { title: 'platform', subtitle: 'url' } },
        }),
      ],
    }),
    defineField({ name: 'copyright', title: '著作権表示 / Copyright', type: 'string', group: 'footer', description: '先頭に「© 西暦」が自動で付きます。' }),
  ],
  preview: { prepare: () => ({ title: 'ヘッダー・フッター' }) },
})
