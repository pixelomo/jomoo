import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import CompanyProfilePage from '@/components/company/CompanyProfilePage'
import { getCompanyPage } from '@/lib/sanity'

export async function generateMetadata(): Promise<Metadata> {
  const data = await getCompanyPage()
  return { title: '会社情報', description: data?.description }
}

export default async function CompanyInformationPage() {
  const data = await getCompanyPage()
  if (!data) notFound()

  return <CompanyProfilePage data={data} />
}
