import { defineField, defineType } from 'sanity'

const localizedString = (name: string, title: string) =>
  defineField({
    name,
    title,
    type: 'object',
    fields: [
      defineField({ name: 'zhCN', title: '日本語 / 中文', type: 'string' }),
      defineField({ name: 'en', title: 'English', type: 'string' }),
    ],
  })

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

    localizedString('name', 'Series Name'),

    localizedString('tagline', 'Tagline (short, 1 line)'),

    defineField({
      name: 'description',
      title: 'Series Description',
      type: 'object',
      description: 'Displayed below the series heading on the listing page',
      fields: [
        defineField({ name: 'zhCN', title: '日本語 / 中文', type: 'text', rows: 3 }),
        defineField({ name: 'en', title: 'English', type: 'text', rows: 3 }),
      ],
    }),

    defineField({
      name: 'heroImage',
      title: 'Series Hero Image (optional)',
      type: 'image',
      options: { hotspot: true },
    }),
  ],

  preview: {
    select: { title: 'name.en', subtitle: 'seriesId' },
    prepare: ({ title, subtitle }) => ({ title: title ?? 'Untitled series', subtitle }),
  },
})
