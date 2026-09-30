import { afterSalesPage } from './afterSalesPage'
import { blogPost } from './blogPost'
import { careersPage } from './careersPage'
import { companyPage } from './companyPage'
import { designerPage } from './designerPage'
import { faqPage } from './faqPage'
import { globalProjectsPage } from './globalProjectsPage'
import { legalDocumentTypes } from './legalDocument'
import { product } from './product'
import { productSeries } from './productSeries'
import { showroomPage } from './showroomPage'

/** Page types that exist exactly once. Each is stored under its own type name
 *  as the document id, and the Studio opens it directly instead of listing it. */
export const SINGLETONS = [
  { type: companyPage.name, title: '会社情報' },
  { type: designerPage.name, title: 'デザイナー' },
  { type: globalProjectsPage.name, title: 'グローバルプロジェクト' },
  { type: showroomPage.name, title: 'ショールーム' },
  { type: careersPage.name, title: '採用情報' },
  { type: faqPage.name, title: 'よくあるご質問' },
  { type: afterSalesPage.name, title: 'アフターサービス' },
]

export const schemaTypes = [
  productSeries,
  product,
  blogPost,
  companyPage,
  designerPage,
  globalProjectsPage,
  showroomPage,
  careersPage,
  faqPage,
  afterSalesPage,
  ...legalDocumentTypes,
]
