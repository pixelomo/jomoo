import { Fragment } from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import RepairTerms from '@/components/warranty/RepairTerms'
import { getAfterSalesPage, lines } from '@/lib/sanity'
import { pageMetadata } from '@/lib/seo'
import '@/components/warranty/after-sales.css'

export async function generateMetadata(): Promise<Metadata> {
  const data = await getAfterSalesPage()
  return pageMetadata({ title: data?.title || 'アフターサービス', description: data?.description, path: '/after-sales' })
}

export default async function AfterSalesPage() {
  const data = await getAfterSalesPage()
  if (!data) notFound()

  return (
    <main className="flex-1 after-sales">
      <div className="after-sales__intro">
        <h1 className="after-sales__title">{data.title}</h1>
        <p className="after-sales__lead">
          {lines(data.lead).map((line, i) => (
            <Fragment key={i}>
              {i > 0 && <br />}
              {line}
            </Fragment>
          ))}
        </p>
      </div>

      <RepairTerms />
    </main>
  )
}
