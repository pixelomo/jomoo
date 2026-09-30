import { defineArrayMember, defineField, defineType } from 'sanity'
import { heroFields, LINES, metaDescription, seoGroup } from './shared'

/** ショールーム — the render, the details table, the map and the booking link. */
export const showroomPage = defineType({
  name: 'showroomPage',
  title: 'ショールーム / Showroom',
  type: 'document',
  groups: [
    { name: 'hero', title: 'オープニング / Opening', default: true },
    { name: 'info', title: '店舗情報 / Details' },
    seoGroup,
  ],
  fields: [
    metaDescription,
    ...heroFields(),

    defineField({ name: 'infoTitle', title: '見出し / Title', type: 'string', group: 'info' }),
    defineField({
      name: 'rows',
      title: '店舗情報 / Details',
      type: 'array',
      group: 'info',
      description: '運営・住所・電話番号・営業時間など。この順に表示されます。',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'showroomRow',
          fields: [
            defineField({ name: 'label', title: '項目名 / Label', type: 'string', validation: (Rule) => Rule.required() }),
            defineField({ name: 'value', title: '内容 / Value', type: 'text', rows: 3, description: LINES }),
          ],
          preview: { select: { title: 'label', subtitle: 'value' } },
        }),
      ],
    }),
    defineField({
      name: 'mapQuery',
      title: '地図の検索住所 / Map Address',
      type: 'string',
      group: 'info',
      description:
        'Googleマップで検索する住所。建物名を含めると位置がずれることがあるため、番地までの入力をおすすめします。',
    }),
    defineField({
      name: 'ctaLabel',
      title: '予約ボタンの文言 / Booking Button',
      type: 'string',
      group: 'info',
      description: 'お問い合わせフォームのショールーム予約へ移動します。',
    }),
  ],
  preview: { prepare: () => ({ title: 'ショールーム' }) },
})
