import { defineArrayMember, defineField, defineType } from 'sanity'
import { LINES, metaDescription, seoGroup } from './shared'

/** よくあるご質問 — the intro, then questions grouped by category. */
export const faqPage = defineType({
  name: 'faqPage',
  title: 'よくあるご質問 / FAQ',
  type: 'document',
  groups: [
    { name: 'intro', title: '導入 / Intro', default: true },
    { name: 'questions', title: '質問 / Questions' },
    seoGroup,
  ],
  fields: [
    metaDescription,
    defineField({ name: 'eyebrow', title: '英字見出し / Eyebrow', type: 'string', group: 'intro' }),
    defineField({ name: 'title', title: 'タイトル / Title', type: 'string', group: 'intro' }),
    defineField({ name: 'lead', title: '導入文 / Lead', type: 'text', rows: 3, group: 'intro', description: LINES }),
    defineField({
      name: 'categories',
      title: 'カテゴリー / Categories',
      type: 'array',
      group: 'questions',
      description: 'ページ上部の目次もこの順に並びます。',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'faqCategory',
          fields: [
            defineField({ name: 'label', title: 'カテゴリー名 / Label', type: 'string', validation: (Rule) => Rule.required() }),
            defineField({
              name: 'anchor',
              title: 'リンク用ID / Anchor',
              type: 'string',
              description: '目次からのリンク先（/faq#◯◯）。半角英小文字とハイフンで入力してください。',
              validation: (Rule) =>
                Rule.required().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, { name: '半角英小文字とハイフン' }),
            }),
            defineField({
              name: 'items',
              title: '質問 / Questions',
              type: 'array',
              of: [
                defineArrayMember({
                  type: 'object',
                  name: 'faqItem',
                  fields: [
                    defineField({ name: 'q', title: '質問 / Question', type: 'text', rows: 2, validation: (Rule) => Rule.required() }),
                    defineField({
                      name: 'a',
                      title: '回答 / Answer',
                      type: 'text',
                      rows: 6,
                      description: '改行ごとに段落が分かれます。',
                      validation: (Rule) => Rule.required(),
                    }),
                  ],
                  preview: { select: { title: 'q', subtitle: 'a' } },
                }),
              ],
            }),
          ],
          preview: {
            select: { title: 'label', items: 'items' },
            prepare: ({ title, items }) => ({ title, subtitle: `${items?.length ?? 0}件` }),
          },
        }),
      ],
    }),
  ],
  preview: { prepare: () => ({ title: 'よくあるご質問' }) },
})
