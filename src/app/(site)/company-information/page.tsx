import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import CompanyProfilePage from '@/components/company/CompanyProfilePage'
import { getCompanyPage } from '@/lib/sanity'
import { pageMetadata } from '@/lib/seo'

export async function generateMetadata(): Promise<Metadata> {
  const data = await getCompanyPage()
  return pageMetadata({ title: '会社情報', description: data?.description, path: '/company-information' })
}

export default async function CompanyInformationPage() {
  const data = await getCompanyPage()
  if (!data) notFound()

  return <CompanyProfilePage data={data} />
}
