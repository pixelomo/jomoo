import { defineArrayMember, defineField, defineType, type StringRule } from 'sanity'

const LINES = '改行した位置がそのままページ上の改行になります。'

/** A project's カテゴリー has to be one of the page's own chips, or the filter
 *  could never reach it. The chips are in this same document, so the check
 *  reads them directly. */
function oneOfChips(rule: StringRule, list: 'categories', label: string) {
  return rule.required().custom((value, context) => {
    const chips = (context.document?.[list] as string[] | undefined) ?? []
    if (!value || chips.includes(value)) return true
    return `「${value}」は${label}の一覧にありません。先に「絞り込み」タブで${label}を追加してください。`
  })
}

/**
 * グローバルプロジェクト — the hero, the intro, the category filter chips and
 * the projects themselves. The projects live in this document rather than as
 * documents of their own: they have no page each, they are ordered by hand,
 * and each one's category is checked against the chips beside it.
 *
 * 国・地域 is hidden — the page no longer filters or tags by country. The
 * fields stay so the values already entered survive; drop `hidden` to bring
 * them back (and restore the filter row in ProjectExplorer).
 */
export const globalProjectsPage = defineType({
  name: 'globalProjectsPage',
  title: 'グローバルプロジェクト / Global Projects',
  type: 'document',
  groups: [
    { name: 'hero', title: 'オープニング / Opening', default: true },
    { name: 'filters', title: '絞り込み / Filters' },
    { name: 'projects', title: 'プロジェクト / Projects' },
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
    defineField({ name: 'intro', title: '導入文 / Intro', type: 'text', rows: 3, group: 'hero', description: LINES }),

    defineField({
      name: 'countries',
      title: '国・地域 / Countries',
      type: 'array',
      group: 'filters',
      hidden: true,
      description: '絞り込みの1段目。この順に並びます。',
      of: [defineArrayMember({ type: 'string' })],
      validation: (Rule) => Rule.unique(),
    }),
    defineField({
      name: 'categories',
      title: 'カテゴリー / Categories',
      type: 'array',
      group: 'filters',
      description: '絞り込みの項目。この順に並びます。',
      of: [defineArrayMember({ type: 'string' })],
      validation: (Rule) => Rule.unique(),
    }),

    defineField({
      name: 'projects',
      title: 'プロジェクト / Projects',
      type: 'array',
      group: 'projects',
      description: 'この順に表示されます。',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'globalProject',
          fields: [
            defineField({ name: 'title', title: '名称 / Title', type: 'string', validation: (Rule) => Rule.required() }),
            defineField({ name: 'image', title: '写真 / Photo', type: 'image', options: { hotspot: true } }),
            defineField({ name: 'description', title: '説明 / Description', type: 'text', rows: 4 }),
            defineField({
              name: 'country',
              title: '国・地域 / Country',
              type: 'string',
              hidden: true,
            }),
            defineField({
              name: 'category',
              title: 'カテゴリー / Category',
              type: 'string',
              description: '「絞り込み」タブのカテゴリーと同じ表記で入力してください。',
              validation: (Rule) => oneOfChips(Rule, 'categories', 'カテゴリー'),
            }),
          ],
          preview: {
            select: { title: 'title', subtitle: 'category', media: 'image' },
          },
        }),
      ],
    }),
  ],

  preview: { prepare: () => ({ title: 'グローバルプロジェクト' }) },
})
