import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { schemaTypes, SINGLETONS } from './src/sanity/schemaTypes'

const SINGLETON_TYPES = new Set<string>(SINGLETONS.map((s) => s.type))

/** A singleton can be edited and published, never created again, duplicated
 *  or deleted — the page reads it by id and would go blank without it. */
const SINGLETON_ACTIONS = new Set(['publish', 'discardChanges', 'restore'])

export default defineConfig({
  name: 'default',
  title: 'JOMOO CMS',
  basePath: '/studio',
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production',
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .id('root')
          .title('コンテンツ')
          .items([
            S.listItem()
              .id('pages')
              .title('ページ / Pages')
              .child(
                S.list()
                  .id('pages')
                  .title('ページ / Pages')
                  .items(
                    SINGLETONS.map(({ type, title }) =>
                      S.listItem()
                        .title(title)
                        .id(type)
                        .child(S.document().schemaType(type).documentId(type).title(title))
                    )
                  )
              ),
            S.divider(),
            ...S.documentTypeListItems().filter(
              (item) => !SINGLETON_TYPES.has(item.getId() ?? '')
            ),
          ]),
    }),
    visionTool(),
  ],
  schema: {
    types: schemaTypes,
    templates: (templates) => templates.filter(({ schemaType }) => !SINGLETON_TYPES.has(schemaType)),
  },
  document: {
    actions: (actions, { schemaType }) =>
      SINGLETON_TYPES.has(schemaType)
        ? actions.filter(({ action }) => action && SINGLETON_ACTIONS.has(action))
        : actions,
  },
})
