import { defineArrayMember, defineField, defineType } from 'sanity'
import { LINES, metaDescription, seoGroup } from './shared'

/**
 * アフターサービス — and the 無料修理規定 on it, which the warranty certificate
 * prints too. One copy of the terms, edited here, so the page and the
 * certificate can never disagree.
 */
export const afterSalesPage = defineType({
  name: 'afterSalesPage',
  title: 'アフターサービス / After Sales',
  type: 'document',
  groups: [
    { name: 'intro', title: '導入 / Intro', default: true },
    { name: 'terms', title: '無料修理規定 / Repair Terms' },
    seoGroup,
  ],
  fields: [
    metaDescription,
    defineField({ name: 'title', title: 'タイトル / Title', type: 'string', group: 'intro' }),
    defineField({ name: 'lead', title: '導入文 / Lead', type: 'text', rows: 3, group: 'intro', description: LINES }),

    defineField({
      name: 'termsTitle',
      title: '規定の見出し / Terms Title',
      type: 'string',
      group: 'terms',
      description: 'アフターサービスページと保証書の両方に表示されます。',
    }),
    defineField({
      name: 'termGroups',
      title: '条項 / Clauses',
      type: 'array',
      group: 'terms',
      description:
        '規定の章ごとに1項目。各章の見出しは規定の上にボタンとして並び、押すとその章へ移動します。番号は章ごとに1から振られ、条項が1つだけの章は番号なしで表示されます。',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'termGroup',
          fields: [
            defineField({
              name: 'title',
              title: '章の見出し / Section Title',
              type: 'string',
              description: '例: 無料修理について。上部のボタンにも同じ文言が表示されます。',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'clauses',
              title: '条項 / Clauses',
              type: 'array',
              of: [
                defineArrayMember({
                  type: 'object',
                  name: 'termClause',
                  fields: [
                    defineField({ name: 'text', title: '本文 / Text', type: 'text', rows: 4, validation: (Rule) => Rule.required() }),
                    defineField({
                      name: 'subClauses',
                      title: '各号 / Sub-clauses',
                      type: 'array',
                      of: [
                        defineArrayMember({
                          type: 'object',
                          name: 'termSubClause',
                          fields: [
                            defineField({
                              name: 'marker',
                              title: '番号 / Marker',
                              type: 'string',
                              description:
                                '例: 1）。入力すると太字の見出しとして表示されます。文中の番号として扱う場合は空欄にし、本文に含めてください。',
                            }),
                            defineField({ name: 'text', title: '本文 / Text', type: 'text', rows: 4, validation: (Rule) => Rule.required() }),
                          ],
                          preview: {
                            select: { marker: 'marker', text: 'text' },
                            prepare: ({ marker, text }) => ({ title: `${marker ?? ''}${text ?? ''}` }),
                          },
                        }),
                      ],
                    }),
                    defineField({
                      name: 'spaced',
                      title: '各号の前に空行を入れる / Space Before Sub-clauses',
                      type: 'boolean',
                      initialValue: false,
                    }),
                  ],
                  preview: { select: { title: 'text' } },
                }),
              ],
            }),
          ],
          preview: {
            select: { title: 'title', first: 'clauses.0.text', clauses: 'clauses' },
            prepare: ({ title, first, clauses }) => ({ title: title || first, subtitle: `${clauses?.length ?? 0} 条項` }),
          },
        }),
      ],
    }),
    defineField({ name: 'termsClosing', title: '結びの文 / Closing', type: 'text', rows: 4, group: 'terms' }),
  ],
  preview: { prepare: () => ({ title: 'アフターサービス' }) },
})
