import { defineField, defineType } from 'sanity'

export const productSeries = defineType({
  name: 'productSeries',
  title: '製品シリーズ / Product Series',
  type: 'document',
  fields: [
    defineField({
      name: 'seriesId',
      title: 'Series',
      type: 'string',
      description: 'Must match the series slug used in product documents and URLs',
      options: {
        list: [
          { title: 'Smart Toilet', value: 'smart-toilet' },
          { title: 'Washstand (Vanity)', value: 'washstand' },
          { title: 'Faucets & Fixtures', value: 'faucets' },
          { title: 'Shower Set', value: 'shower-set' },
        ],
        layout: 'radio',
      },
      validation: Rule => Rule.required(),
    }),

    defineField({
      name: 'name',
      title: 'シリーズ名 / Series Name',
      type: 'string',
    }),

    defineField({
      name: 'tagline',
      title: 'キャッチコピー / Tagline (short, 1 line)',
      type: 'string',
    }),

    defineField({
      name: 'description',
      title: 'シリーズ説明 / Series Description',
      type: 'text',
      rows: 3,
      description: 'Displayed below the series heading on the listing page',
    }),

    defineField({
      name: 'heroImage',
      title: 'Series Hero Image (optional)',
      type: 'image',
      options: { hotspot: true },
    }),
  ],

  preview: {
    select: { title: 'name', subtitle: 'seriesId' },
    prepare: ({ title, subtitle }) => ({ title: title ?? 'Untitled series', subtitle }),
  },
})
