import { getAdminSession } from '@/lib/admin-auth'
import { csvResponse } from '@/lib/csv'
import { serialImportTemplateCsv } from '@/lib/serialImportTemplate'

/**
 * The bulk-import template.
 *
 * Carries no data, so it is not gated on the export permission — anyone who
 * can import needs to be able to hand this to the factory.
 */
export async function GET() {
  const session = await getAdminSession()
  if (!session) return new Response('Unauthorized', { status: 401 })

  return csvResponse('jomoo-serial-import-template', serialImportTemplateCsv())
}
