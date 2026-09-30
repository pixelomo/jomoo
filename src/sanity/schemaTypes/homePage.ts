import { defineArrayMember, defineField, defineType } from 'sanity'
import { LINES, metaDescription, seoGroup } from './shared'

const text = (name: string, title: string, group: string, rows = 3, description: string = LINES) =>
  defineField({ name, title, type: 'text', rows, group, description })

const string = (name: string, title: string, group: string, description?: string) =>
  defineField({ name, title, type: 'string', group, description })

const image = (name: string, title: string, group?: string, description?: string) =>
  defineField({ name, title, type: 'image', group, description, options: { hotspot: true } })

/** A column of the design section's scrolling images. */
const laneField = (name: string, title: string) =>
  defineField({
    name,
    title,
    type: 'array',
    group: 'design',
    of: [
      defineArrayMember({
        type: 'object',
        name: 'laneImage',
        fields: [
          image('image', '画像 / Image'),
          defineField({
            name: 'onBackdrop',
            title: '背景を敷く / Backdrop',
            type: 'boolean',
            description: '背景が透明な切り抜き画像の場合はオンにしてください。',
            initialValue: false,
          }),
        ],
        preview: { select: { media: 'image', onBackdrop: 'onBackdrop' }, prepare: ({ media, onBackdrop }) => ({ title: onBackdrop ? '切り抜き（背景あり）' : '写真', media }) },
      }),
    ],
  })

/**
 * トップページ — the words and pictures of each section. The sections
 * themselves, their order and their motion are the design and stay in code;
 * this is what the client edits inside them.
 */
export const homePage = defineType({
  name: 'homePage',
  title: 'トップページ / Home',
  type: 'document',
  groups: [
    { name: 'hero', title: 'スライド / Hero', default: true },
    { name: 'world', title: 'THE WORLD OF JOMOO' },
    { name: 'spotlight', title: '機能紹介 / Features' },
    { name: 'lineup', title: 'ラインナップ / Lineup' },
    { name: 'projects', title: 'プロジェクト / Projects' },
    { name: 'stats', title: '数値 / Figures' },
    { name: 'design', title: 'デザイン / Design' },
    seoGroup,
  ],
  fields: [
    metaDescription,

    /* ── Hero: three slides, each built differently ─────────── */
    defineField({
      name: 'heroProduct',
      title: 'スライド1 — 製品 / Slide 1: Product',
      type: 'object',
      group: 'hero',
      options: { collapsible: true },
      fields: [
        image('image', '背景画像 / Image'),
        defineField({ name: 'eyebrow', title: '英字見出し / Eyebrow', type: 'string' }),
        defineField({ name: 'logo', title: '製品ロゴ / Logo', type: 'image', description: 'SVGを推奨します。' }),
        defineField({ name: 'logoAlt', title: 'ロゴの表記 / Logo Text', type: 'string' }),
        defineField({ name: 'subtitle', title: 'サブタイトル / Subtitle', type: 'string' }),
        defineField({ name: 'tagline', title: 'キャッチコピー / Tagline', type: 'text', rows: 2, description: LINES }),
        defineField({
          name: 'awards',
          title: '受賞バッジ / Badges',
          type: 'array',
          of: [
            defineArrayMember({
              type: 'object',
              name: 'heroBadge',
              fields: [
                defineField({ name: 'image', title: '画像 / Image', type: 'image' }),
                defineField({ name: 'alt', title: 'バッジの内容 / Alt Text', type: 'string', description: '読み上げソフトで読まれます。' }),
              ],
              preview: { select: { title: 'alt', media: 'image' } },
            }),
          ],
        }),
        defineField({ name: 'footnotes', title: '注記 / Footnotes', type: 'text', rows: 3, description: LINES }),
      ],
    }),
    defineField({
      name: 'heroVideo',
      title: 'スライド2 — 動画 / Slide 2: Video',
      type: 'object',
      group: 'hero',
      options: { collapsible: true },
      fields: [
        defineField({ name: 'video', title: '動画 / Video', type: 'file', options: { accept: 'video/mp4,video/webm' }, description: '音声なしでループ再生されます。' }),
        defineField({ name: 'eyebrow', title: '英字見出し / Eyebrow', type: 'string' }),
        defineField({ name: 'title', title: 'タイトル / Title', type: 'text', rows: 2, description: LINES }),
        defineField({ name: 'tagline', title: 'キャッチコピー / Tagline', type: 'text', rows: 3, description: LINES }),
      ],
    }),
    defineField({
      name: 'heroBrand',
      title: 'スライド3 — ブランド / Slide 3: Brand',
      type: 'object',
      group: 'hero',
      options: { collapsible: true },
      fields: [
        defineField({ name: 'background', title: '背景画像 / Background', type: 'image' }),
        defineField({
          name: 'foreground',
          title: 'ロゴ画像 / Lockup',
          type: 'image',
          description: '背景の上に画面幅いっぱいに重ねる透過PNG。スマートフォンでも切れずに表示されます。',
        }),
        defineField({ name: 'note', title: '注記 / Footnote', type: 'string' }),
      ],
    }),

    /* ── The world of JOMOO ─────────────────────────────────── */
    string('worldEyebrow', '英字見出し / Eyebrow', 'world'),
    text('worldTitle', '見出し / Title', 'world', 2),
    defineField({
      name: 'worldBody',
      title: '本文 / Paragraphs',
      type: 'array',
      group: 'world',
      description: `段落ごとに1項目。${LINES}`,
      of: [defineArrayMember({ type: 'text', rows: 3 })],
    }),
    text('worldClosing', '結びの文 / Closing', 'world', 4, `${LINES}画面幅により、写真の横または下に表示されます。`),
    image('worldMain', '写真1（大） / Photo 1', 'world'),
    image('worldForest', '写真2 / Photo 2', 'world'),
    image('worldShower', '写真3 / Photo 3', 'world'),
    image('worldBathroom', '写真4（下段） / Photo 4', 'world'),
    image('expandImage', '拡大する写真 / Scroll Photo', 'world', 'スクロールに合わせて画面いっぱいに広がる写真。'),
    string('expandAlt', '拡大する写真の説明 / Scroll Photo Alt', 'world'),
    string('expandLabel', '拡大する写真の文字 / Scroll Photo Label', 'world'),

    /* ── Spotlight carousel ─────────────────────────────────── */
    defineField({
      name: 'spotlightSlides',
      title: '機能スライド / Feature Slides',
      type: 'array',
      group: 'spotlight',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'spotlightSlide',
          fields: [
            defineField({ name: 'label', title: '番号・ラベル / Label', type: 'string', description: '「01」などの番号、または英字のラベル。' }),
            defineField({ name: 'title', title: '見出し / Title', type: 'text', rows: 2, description: LINES }),
            defineField({ name: 'body', title: '本文 / Body', type: 'text', rows: 5, description: LINES }),
            defineField({
              name: 'media',
              title: '表示するもの / Media',
              type: 'string',
              options: {
                list: [
                  { title: '画像 / Image', value: 'image' },
                  { title: '動画 / Video', value: 'video' },
                  { title: 'X40 回転表示 / X40 Turntable', value: 'turntable' },
                ],
                layout: 'radio',
              },
              initialValue: 'image',
              validation: (Rule) => Rule.required(),
            }),
            defineField({ name: 'image', title: '画像 / Image', type: 'image', options: { hotspot: true }, hidden: ({ parent }) => parent?.media !== 'image' }),
            defineField({ name: 'video', title: '動画 / Video', type: 'file', options: { accept: 'video/*' }, hidden: ({ parent }) => parent?.media !== 'video' }),
            defineField({ name: 'playLabel', title: '再生ボタンの文字 / Play Label', type: 'string', hidden: ({ parent }) => parent?.media !== 'video' }),
          ],
          preview: {
            select: { label: 'label', title: 'title', media: 'image' },
            prepare: ({ label, title, media }) => ({ title: `${label ?? ''} ${(title ?? '').split('\n').join('')}`, media }),
          },
        }),
      ],
    }),

    /* ── Lineup ─────────────────────────────────────────────── */
    string('lineupEyebrow', '英字見出し / Eyebrow', 'lineup'),
    string('lineupTitle', '見出し / Title', 'lineup'),
    text('lineupSubtitle', '導入文 / Subtitle', 'lineup', 2),
    defineField({
      name: 'lineupProducts',
      title: '表示する製品 / Products',
      type: 'array',
      group: 'lineup',
      description: 'カードの画像と文章は、各製品の「一覧カード」から表示されます（製品一覧ページと共通）。',
      of: [defineArrayMember({ type: 'reference', to: [{ type: 'product' }] })],
      validation: (Rule) => Rule.unique(),
    }),

    /* ── Global projects carousel ───────────────────────────── */
    string('projectsEyebrow', '英字見出し / Eyebrow', 'projects'),
    string('projectsTitle', '見出し / Title', 'projects'),
    text('projectsSubtitle', '導入文 / Subtitle', 'projects', 3),
    string('projectsCta', 'ボタンの文言 / Button', 'projects', 'グローバルプロジェクトページへのリンクです。'),
    defineField({
      name: 'projectSlides',
      title: 'スライド / Slides',
      type: 'array',
      group: 'projects',
      description: '2件以上登録してください。',
      validation: (Rule) => Rule.min(2),
      of: [
        defineArrayMember({
          type: 'object',
          name: 'projectSlide',
          fields: [
            image('image', '写真 / Photo'),
            defineField({ name: 'title', title: '名称 / Title', type: 'string', validation: (Rule) => Rule.required() }),
            defineField({ name: 'meta', title: '所在地・種別 / Details', type: 'string', description: '例: 中国・北京 | 世界遺産' }),
          ],
          preview: { select: { title: 'title', subtitle: 'meta', media: 'image' } },
        }),
      ],
    }),

    /* ── Stats ──────────────────────────────────────────────── */
    defineField({
      name: 'stats',
      title: '数値 / Figures',
      type: 'array',
      group: 'stats',
      description: 'ページに表示されると0から数え上がります。受賞ロゴの一覧は「デザイナー」ページの受賞ロゴから表示されます。',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'homeStat',
          fields: [
            defineField({ name: 'label', title: '項目名 / Label', type: 'text', rows: 2, description: LINES, validation: (Rule) => Rule.required() }),
            defineField({
              name: 'softBreak',
              title: '改行は入りきらない場合のみ / Break Only When Needed',
              type: 'boolean',
              description: 'オンにすると、1行に収まる幅では改行せず、収まらない場合に上の改行位置で折り返します。',
              initialValue: false,
            }),
            defineField({ name: 'value', title: '数値 / Value', type: 'number', validation: (Rule) => Rule.required().min(0) }),
            defineField({ name: 'suffix', title: '末尾の記号 / Suffix', type: 'string', description: '例: +' }),
            defineField({ name: 'icon', title: 'アイコン / Icon', type: 'image' }),
          ],
          preview: {
            select: { label: 'label', value: 'value', suffix: 'suffix', media: 'icon' },
            prepare: ({ label, value, suffix, media }) => ({
              title: (label ?? '').split('\n').join(''),
              subtitle: `${value?.toLocaleString('ja-JP') ?? ''}${suffix ?? ''}`,
              media,
            }),
          },
        }),
      ],
    }),

    /* ── Design excellence ──────────────────────────────────── */
    string('designEyebrow', '英字見出し / Eyebrow', 'design'),
    text('designTitle', '見出し / Title', 'design', 3),
    text('designSubtitle', '本文 / Body', 'design', 6),
    string('designButton', 'ボタンの文言 / Button', 'design', 'デザイナーページへのリンクです。'),
    laneField('designLane1', '画像（左列・下へ流れる） / Left Column'),
    laneField('designLane2', '画像（右列・上へ流れる） / Right Column'),
  ],
  preview: { prepare: () => ({ title: 'トップページ' }) },
})
