import { defineArrayMember, defineField, defineType } from 'sanity'

/**
 * A ブログ post. The list page orders by date, newest first, and each post is
 * served at /blog/<slug>.
 *
 * The body is limited to what the article template draws: paragraphs, 見出し,
 * 引用, bulleted lists and pictures. A picture's shape is read off the uploaded
 * file, so a portrait one is laid out taller rather than cropped to the
 * landscape band — nothing to set by hand.
 */
export const blogPost = defineType({
  name: 'blogPost',
  title: 'ブログ記事 / Blog Post',
  type: 'document',
  groups: [
    { name: 'identity', title: '基本情報 / Identity', default: true },
    { name: 'body', title: '本文 / Body' },
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'タイトル / Title',
      type: 'string',
      group: 'identity',
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'slug',
      title: 'URL / Slug',
      type: 'slug',
      group: 'identity',
      description:
        '記事のURL（/blog/◯◯）。半角英数字とハイフンで入力してください。公開後に変更すると、以前のURLは表示されなくなります。',
      validation: (Rule) =>
        Rule.required().custom((slug) =>
          !slug?.current || /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug.current)
            ? true
            : '半角の小文字英数字とハイフンのみ使用できます。'
        ),
    }),

    defineField({
      name: 'date',
      title: '公開日 / Date',
      type: 'date',
      group: 'identity',
      description: '一覧はこの日付の新しい順に並びます。',
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'author',
      title: '執筆者 / Author',
      type: 'string',
      group: 'identity',
      description: '現在ページには表示されていませんが、サイト内検索の対象になります。',
    }),

    defineField({
      name: 'cover',
      title: 'カバー画像 / Cover',
      type: 'image',
      group: 'identity',
      description: '一覧のカードとSNSでの共有時に表示されます。',
      options: { hotspot: true },
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'excerpt',
      title: 'リード文 / Excerpt',
      type: 'text',
      rows: 4,
      group: 'identity',
      description: '一覧のカードと、記事本文の冒頭に表示されます。検索結果の説明文にも使われます。',
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'body',
      title: '本文 / Body',
      type: 'array',
      group: 'body',
      of: [
        defineArrayMember({
          type: 'block',
          styles: [
            { title: '本文 / Body', value: 'normal' },
            { title: '見出し / Heading', value: 'h2' },
            { title: '引用 / Quote', value: 'blockquote' },
          ],
          lists: [{ title: '箇条書き / Bullets', value: 'bullet' }],
          marks: { decorators: [{ title: '強調 / Strong', value: 'strong' }], annotations: [] },
        }),
        defineArrayMember({
          type: 'image',
          title: '画像 / Image',
          fields: [
            defineField({
              name: 'alt',
              title: '代替テキスト / Alt Text',
              type: 'string',
              description: '画像の内容を短く説明してください。読み上げソフトで読まれます。',
            }),
            defineField({
              name: 'caption',
              title: 'キャプション / Caption',
              type: 'string',
              description: '画像の下に表示されます。空欄の場合は表示されません。',
            }),
          ],
        }),
      ],
    }),
  ],

  orderings: [
    { title: '公開日（新しい順）', name: 'dateDesc', by: [{ field: 'date', direction: 'desc' }] },
  ],

  preview: {
    select: { title: 'title', subtitle: 'date', media: 'cover' },
  },
})
