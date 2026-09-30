import { defineArrayMember, defineField, defineType } from 'sanity'
import { heroFields, LINES, metaDescription, seoGroup } from './shared'

/**
 * 採用情報 — the hero, the invitation, and a band per theme. The photograph's
 * side and the soft background alternate by position, so bands can be added or
 * reordered without anyone restyling the rest.
 */
export const careersPage = defineType({
  name: 'careersPage',
  title: '採用情報 / Careers',
  type: 'document',
  groups: [
    { name: 'hero', title: 'オープニング / Opening', default: true },
    { name: 'bands', title: 'テーマ / Themes' },
    seoGroup,
  ],
  fields: [
    metaDescription,
    ...heroFields(),
    defineField({
      name: 'intro',
      title: '導入文 / Intro',
      type: 'text',
      rows: 4,
      group: 'hero',
      description: `${LINES}スマートフォンでは改行せずに流し込みます。`,
    }),
    defineField({
      name: 'bands',
      title: 'テーマ / Themes',
      type: 'array',
      group: 'bands',
      description: '写真の左右と背景は、並び順に合わせて自動で交互になります。',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'careersBand',
          fields: [
            defineField({ name: 'title', title: '見出し / Title', type: 'string', validation: (Rule) => Rule.required() }),
            defineField({ name: 'body', title: '本文 / Body', type: 'text', rows: 5 }),
            defineField({ name: 'photo', title: '写真 / Photo', type: 'image', options: { hotspot: true } }),
            defineField({
              name: 'alt',
              title: '写真の説明 / Alt Text',
              type: 'string',
              description: '写真の内容を短く説明してください。読み上げソフトで読まれます。',
            }),
          ],
          preview: { select: { title: 'title', subtitle: 'body', media: 'photo' } },
        }),
      ],
    }),
  ],
  preview: { prepare: () => ({ title: '採用情報' }) },
})
