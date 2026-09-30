import { blogPost } from './blogPost'
import { companyPage } from './companyPage'
import { designerPage } from './designerPage'
import { globalProjectsPage } from './globalProjectsPage'
import { legalDocumentTypes } from './legalDocument'
import { product } from './product'
import { productSeries } from './productSeries'

/** Page types that exist exactly once. Each is stored under its own type name
 *  as the document id, and the Studio opens it directly instead of listing it. */
export const SINGLETONS = [
  { type: companyPage.name, title: '会社情報' },
  { type: designerPage.name, title: 'デザイナー' },
  { type: globalProjectsPage.name, title: 'グローバルプロジェクト' },
]

export const schemaTypes = [
  productSeries,
  product,
  blogPost,
  companyPage,
  designerPage,
  globalProjectsPage,
  ...legalDocumentTypes,
]
