import { defineField, defineType } from 'sanity'
import { LINES } from './shared'

const card = (name: string, title: string, extra: ReturnType<typeof defineField>[] = []) =>
  defineField({
    name,
    title,
    type: 'object',
    fields: [
      defineField({ name: 'image', title: '背景画像 / Image', type: 'image', options: { hotspot: true } }),
      defineField({ name: 'eyebrow', title: '英字見出し / Eyebrow', type: 'string' }),
      defineField({ name: 'title', title: '見出し / Title', type: 'text', rows: 2, description: LINES }),
      defineField({ name: 'button', title: 'ボタンの文言 / Button', type: 'string' }),
      ...extra,
    ],
  })

/**
 * カタログ・お問い合わせ — the two cards that close the top page, 会社情報,
 * and the product pages. One document, so they read the same everywhere.
 */
export const siteCta = defineType({
  name: 'siteCta',
  title: 'カタログ・お問い合わせ / Closing Cards',
  type: 'document',
  description: 'トップページ・会社情報・製品ページの末尾に表示されます。',
  fields: [
    card('catalog', 'カタログ / Catalog', [
      defineField({ name: 'pdf', title: 'カタログPDF / PDF', type: 'file', options: { accept: 'application/pdf' } }),
    ]),
    card('contact', 'お問い合わせ / Contact'),
  ],
  preview: { prepare: () => ({ title: 'カタログ・お問い合わせ' }) },
})
