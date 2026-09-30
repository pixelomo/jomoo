import { defineField } from 'sanity'

/** Copy the design sets on fixed lines is one string, split on its line breaks
 *  where it is drawn. */
export const LINES = '改行した位置がそのままページ上の改行になります。'

export const seoGroup = { name: 'seo', title: '検索 / SEO' }

export const metaDescription = defineField({
  name: 'description',
  title: '検索結果の説明文 / Meta Description',
  type: 'text',
  rows: 3,
  group: 'seo',
  description: '検索エンジンやSNSに表示される説明文です。ページには表示されません。',
})

/** The photograph-with-title opening most pages share. */
export const heroFields = (group = 'hero') => [
  defineField({ name: 'heroImage', title: '背景画像 / Image', type: 'image', group, options: { hotspot: true } }),
  defineField({ name: 'heroEyebrow', title: '英字見出し / Eyebrow', type: 'string', group }),
  defineField({ name: 'heroTitle', title: 'タイトル / Title', type: 'text', rows: 2, group, description: LINES }),
]
