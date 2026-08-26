import { getAdminSession } from '@/lib/admin-auth'
import { csvResponse } from '@/lib/csv'
import { serialImportSampleCsv } from '@/lib/serialImportTemplate'

/**
 * Test data for the import, covering several products in one file.
 *
 * Real rows once imported, so the file names itself SAMPLE twice over — in
 * every serial and in the batch — and the guidance at the top says how to clear
 * them out again.
 */
export async function GET() {
  const session = await getAdminSession()
  if (!session) return new Response('Unauthorized', { status: 401 })

  return csvResponse('jomoo-serial-import-SAMPLE', serialImportSampleCsv())
}
