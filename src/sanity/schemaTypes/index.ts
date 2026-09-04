import { legalDocumentTypes } from './legalDocument'
import { product } from './product'
import { productSeries } from './productSeries'

export const schemaTypes = [productSeries, product, ...legalDocumentTypes]
