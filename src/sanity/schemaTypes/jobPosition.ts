import { defineField, defineType } from 'sanity'

/** The fixed choices. Free text would split one filter option into several
 *  ("中途" / "中途採用"), so these two are picked from a list. */
export const JOB_EXPERIENCE = ['新卒', '中途', '経験不問']
export const JOB_EMPLOYMENT = ['正社員', '契約社員', 'パート・アルバイト', 'インターン']

/**
 * 求人 — one open position on 採用情報 (/careers). The page's search filters
 * offer the values the published positions use, so a new 勤務地 or 分野 needs
 * nothing more than the position that names it. Unpublishing (or deleting) a
 * position takes it off the page.
 */
export const jobPosition = defineType({
  name: 'jobPosition',
  title: '求人 / Job Openings',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: '募集職種 / Position', type: 'string', validation: (Rule) => Rule.required() }),
    defineField({
      name: 'experience',
      title: '経験 / Experience Level',
      type: 'string',
      options: { list: JOB_EXPERIENCE, layout: 'radio', direction: 'horizontal' },
    }),
    defineField({
      name: 'field',
      title: '分野 / Field',
      type: 'string',
      description: '例: 営業、マーケティング、アフターサービス。同じ分野は同じ表記にしてください（検索の選択肢になります）。',
    }),
    defineField({
      name: 'location',
      title: '勤務地 / Location',
      type: 'string',
      description: '例: 東京都。同じ勤務地は同じ表記にしてください（検索の選択肢になります）。',
    }),
    defineField({
      name: 'employmentType',
      title: '雇用形態 / Employment Type',
      type: 'string',
      options: { list: JOB_EMPLOYMENT, layout: 'radio', direction: 'horizontal' },
    }),
    defineField({
      name: 'description',
      title: '仕事内容・応募資格 / Description',
      type: 'text',
      rows: 10,
      description: '行を開いたときに表示されます。改行した位置がそのままページ上の改行になります。',
    }),
    defineField({
      name: 'applyUrl',
      title: '応募先URL / Apply Link',
      type: 'url',
      description: '空欄の場合は「採用に関するお問い合わせ」フォームへ移動します。',
      validation: (Rule) => Rule.uri({ allowRelative: true, scheme: ['http', 'https', 'mailto'] }),
    }),
    defineField({
      name: 'order',
      title: '表示順 / Order',
      type: 'number',
      description: '小さい数字ほど上に表示されます。空欄は新しい順で後ろに並びます。',
    }),
  ],
  orderings: [{ title: '表示順', name: 'order', by: [{ field: 'order', direction: 'asc' }] }],
  preview: {
    select: { title: 'title', location: 'location', field: 'field', type: 'employmentType' },
    prepare: ({ title, location, field, type }) => ({
      title,
      subtitle: [field, location, type].filter(Boolean).join(' ・ '),
    }),
  },
})
