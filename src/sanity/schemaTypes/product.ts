import { defineField, defineType } from 'sanity'

export const product = defineType({
  name: 'product',
  title: '产品 / Product',
  type: 'document',
  fields: [
    defineField({
      name: 'modelCode',
      title: 'Model Code',
      type: 'string',
      description: 'Unique model identifier (used in registration form dropdown)',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'name',
      title: 'Product Name',
      type: 'object',
      fields: [
        defineField({ name: 'zhCN', title: '中文名称', type: 'string', validation: (Rule) => Rule.required() }),
        defineField({ name: 'en', title: 'English Name', type: 'string', validation: (Rule) => Rule.required() }),
      ],
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'modelCode', maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'object',
      fields: [
        defineField({ name: 'zhCN', title: '中文描述', type: 'text', rows: 4 }),
        defineField({ name: 'en', title: 'English Description', type: 'text', rows: 4 }),
      ],
    }),
    defineField({
      name: 'images',
      title: 'Product Images',
      type: 'array',
      of: [
        {
          type: 'image',
          options: { hotspot: true },
          fields: [
            defineField({
              name: 'alt',
              title: 'Alt Text',
              type: 'string',
            }),
          ],
        },
      ],
    }),
    defineField({
      name: 'specs',
      title: 'Specifications',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'label', title: 'Label', type: 'object', fields: [
              defineField({ name: 'zhCN', title: '中文', type: 'string' }),
              defineField({ name: 'en', title: 'English', type: 'string' }),
            ]}),
            defineField({ name: 'value', title: 'Value', type: 'string' }),
          ],
        },
      ],
    }),
    defineField({
      name: 'isActive',
      title: 'Active (show in registration dropdown)',
      type: 'boolean',
      initialValue: true,
    }),
  ],
  preview: {
    select: {
      title: 'name.zhCN',
      subtitle: 'modelCode',
      media: 'images.0',
    },
  },
})
