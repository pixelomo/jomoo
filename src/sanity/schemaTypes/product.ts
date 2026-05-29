import { defineField, defineType } from 'sanity'

const localizedText = (name: string, title: string, type: 'string' | 'text' = 'string') =>
  defineField({
    name,
    title,
    type: 'object',
    fields: [
      defineField({ name: 'zhCN', title: '日本語 / 中文', type, rows: type === 'text' ? 4 : undefined }),
      defineField({ name: 'en',   title: 'English',        type, rows: type === 'text' ? 4 : undefined }),
    ],
  })

export const product = defineType({
  name: 'product',
  title: '产品 / Product',
  type: 'document',
  groups: [
    { name: 'identity',  title: 'Identity',         default: true },
    { name: 'content',   title: 'Page Content'                    },
    { name: 'specs',     title: 'Specifications'                  },
    { name: 'media',     title: 'Media'                           },
    { name: 'settings',  title: 'Settings'                        },
  ],
  fields: [
    // ── IDENTITY ──────────────────────────────────────────────
    defineField({
      name: 'modelCode',
      title: 'Model Code',
      type: 'string',
      group: 'identity',
      description: 'Unique identifier used in the registration form dropdown (e.g. XP40-BASIC)',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'series',
      title: 'Product Series',
      type: 'string',
      group: 'identity',
      options: {
        list: [
          { title: 'Smart Toilet',       value: 'smart-toilet' },
          { title: 'Washstand (Vanity)', value: 'washstand'    },
          { title: 'Faucets & Fixtures', value: 'faucets'      },
          { title: 'Shower Set',         value: 'shower-set'   },
        ],
        layout: 'radio',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'name',
      title: 'Product Name',
      type: 'object',
      group: 'identity',
      fields: [
        defineField({ name: 'zhCN', title: '日本語 / 中文', type: 'string', validation: (Rule) => Rule.required() }),
        defineField({ name: 'en',   title: 'English Name',  type: 'string', validation: (Rule) => Rule.required() }),
      ],
    }),
    defineField({
      name: 'slug',
      title: 'URL Slug',
      type: 'slug',
      group: 'identity',
      options: { source: 'modelCode', maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),

    // ── CONTENT ───────────────────────────────────────────────
    localizedText('tagline', 'Tagline (short)', 'string'),

    defineField({
      name: 'longDescription',
      title: 'Product Description',
      type: 'object',
      group: 'content',
      fields: [
        defineField({
          name: 'zhCN',
          title: '日本語 / 中文',
          type: 'array',
          of: [{ type: 'block' }],
        }),
        defineField({
          name: 'en',
          title: 'English',
          type: 'array',
          of: [{ type: 'block' }],
        }),
      ],
    }),

    defineField({
      name: 'features',
      title: 'Feature Highlights',
      type: 'array',
      group: 'content',
      description: 'Short bullet points shown in the features strip (3–6 items recommended)',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'icon', title: 'Icon (SVG name or short label, no emoji)', type: 'string' }),
            defineField({
              name: 'title',
              title: 'Feature Title',
              type: 'object',
              fields: [
                defineField({ name: 'zhCN', title: '日本語 / 中文', type: 'string' }),
                defineField({ name: 'en',   title: 'English',        type: 'string' }),
              ],
            }),
            defineField({
              name: 'description',
              title: 'Feature Description',
              type: 'object',
              fields: [
                defineField({ name: 'zhCN', title: '日本語 / 中文', type: 'text', rows: 2 }),
                defineField({ name: 'en',   title: 'English',        type: 'text', rows: 2 }),
              ],
            }),
          ],
          preview: {
            select: { title: 'title.en', subtitle: 'icon' },
            prepare: ({ title, subtitle }) => ({ title: title ?? 'Untitled feature', subtitle }),
          },
        },
      ],
    }),

    // ── SPECIFICATIONS ────────────────────────────────────────
    defineField({
      name: 'specTable',
      title: 'Specification Table',
      type: 'object',
      group: 'specs',
      description: 'Key technical parameters shown in the structured spec table',
      fields: [
        defineField({ name: 'dimensions',      title: 'Dimensions (W×D×H)',  type: 'string', placeholder: '670×390×475 mm'         }),
        defineField({ name: 'material',        title: 'Material',            type: 'string', placeholder: 'Vitreous China'         }),
        defineField({ name: 'power',           title: 'Power Supply',        type: 'string', placeholder: 'AC100–240V, 50/60Hz, 60W' }),
        defineField({ name: 'drainageMethod',  title: 'Drainage Method',     type: 'string', placeholder: 'Siphon Jet'             }),
        defineField({ name: 'waterConsumption',title: 'Water Consumption',   type: 'string', placeholder: '5.0 L / 3.5 L'         }),
        defineField({ name: 'weight',          title: 'Weight',              type: 'string', placeholder: '40 kg'                  }),
        defineField({ name: 'color',           title: 'Available Colors',    type: 'string', placeholder: 'Cotton White'           }),
        defineField({ name: 'certification',   title: 'Certifications',      type: 'string', placeholder: 'JIS A 4422'            }),
      ],
    }),

    defineField({
      name: 'specs',
      title: 'Additional Specifications',
      type: 'array',
      group: 'specs',
      description: 'Extra rows appended after the structured table',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'label',
              title: 'Label',
              type: 'object',
              fields: [
                defineField({ name: 'zhCN', title: '日本語 / 中文', type: 'string' }),
                defineField({ name: 'en',   title: 'English',        type: 'string' }),
              ],
            }),
            defineField({ name: 'value', title: 'Value', type: 'string' }),
          ],
          preview: {
            select: { title: 'label.en', subtitle: 'value' },
          },
        },
      ],
    }),

    // ── MEDIA ─────────────────────────────────────────────────
    defineField({
      name: 'images',
      title: 'Product Images (carousel)',
      type: 'array',
      group: 'media',
      description: 'High-resolution images. First image is the hero/thumbnail.',
      of: [
        {
          type: 'image',
          options: { hotspot: true },
          fields: [
            defineField({ name: 'alt', title: 'Alt Text', type: 'string' }),
            defineField({ name: 'caption', title: 'Caption', type: 'string' }),
          ],
        },
      ],
    }),

    defineField({
      name: 'featureImages',
      title: 'Feature Images (grid)',
      type: 'array',
      group: 'media',
      description: 'Feature illustration images shown in a grid below the product description.',
      of: [
        {
          type: 'image',
          options: { hotspot: true },
          fields: [
            defineField({
              name: 'caption',
              title: 'Caption',
              type: 'object',
              fields: [
                defineField({ name: 'zhCN', title: '中文', type: 'string' }),
                defineField({ name: 'en',   title: 'English', type: 'string' }),
              ],
            }),
          ],
          preview: {
            select: { title: 'caption.en', media: 'asset' },
            prepare: ({ title, media }) => ({ title: title ?? 'Feature image', media }),
          },
        },
      ],
    }),

    defineField({
      name: 'featureVideos',
      title: 'Feature Videos',
      type: 'array',
      group: 'media',
      description: 'YouTube or Vimeo embed URLs for product explainer videos',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'embedUrl', title: 'Embed URL (YouTube/Vimeo)', type: 'url' }),
            defineField({
              name: 'title',
              title: 'Video Title',
              type: 'object',
              fields: [
                defineField({ name: 'zhCN', title: '日本語 / 中文', type: 'string' }),
                defineField({ name: 'en',   title: 'English',        type: 'string' }),
              ],
            }),
          ],
          preview: {
            select: { title: 'title.en', subtitle: 'embedUrl' },
            prepare: ({ title, subtitle }) => ({ title: title ?? 'Video', subtitle }),
          },
        },
      ],
    }),

    // ── SETTINGS ──────────────────────────────────────────────
    defineField({
      name: 'isActive',
      title: 'Active (show in registration dropdown)',
      type: 'boolean',
      group: 'settings',
      initialValue: true,
    }),

    defineField({
      name: 'description',
      title: 'Short Description (registration dropdown tooltip)',
      type: 'object',
      group: 'settings',
      fields: [
        defineField({ name: 'zhCN', title: '日本語 / 中文', type: 'text', rows: 2 }),
        defineField({ name: 'en',   title: 'English',        type: 'text', rows: 2 }),
      ],
    }),
  ],

  preview: {
    select: {
      title:    'name.en',
      subtitle: 'modelCode',
      media:    'images.0',
    },
    prepare: ({ title, subtitle, media }) => ({
      title:    title ?? 'Unnamed product',
      subtitle: subtitle,
      media,
    }),
  },
})
