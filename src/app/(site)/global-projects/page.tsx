/* eslint-disable @next/next/no-img-element */
import { Fragment } from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import ProjectExplorer, { type Project } from '@/components/projects/ProjectExplorer'
import { getGlobalProjectsPage, imgUrl, lines } from '@/lib/sanity'
import '@/components/projects/global-projects.css'

export async function generateMetadata(): Promise<Metadata> {
  const data = await getGlobalProjectsPage()
  return { title: 'グローバルプロジェクト', description: data?.description }
}

/** Breaks between the lines the editor wrote, and nowhere else. */
function Lines({ text }: { text?: string }) {
  return lines(text).map((line, i) => (
    <Fragment key={i}>
      {i > 0 && <br />}
      {line}
    </Fragment>
  ))
}

export default async function GlobalProjectsPage() {
  const data = await getGlobalProjectsPage()
  if (!data) notFound()

  const projects: Project[] = (data.projects ?? []).map((project) => ({
    key: project._key,
    title: project.title,
    image: project.image?.asset ? imgUrl(project.image, 1000) : '',
    description: project.description ?? '',
    country: project.country ?? '',
    category: project.category ?? '',
  }))

  return (
    <main className="gp">
      <section className="gp-hero" aria-label={lines(data.heroTitle).join('')}>
        {data.heroImage?.asset && (
          <img className="gp-hero__image" src={imgUrl(data.heroImage, 2400)} alt="" />
        )}
        <div className="gp-hero__scrim" aria-hidden="true" />
        <div className="gp-hero__inner gp__container">
          <p className="gp-hero__eyebrow">{data.heroEyebrow}</p>
          <h1 className="gp-hero__title">
            <Lines text={data.heroTitle} />
          </h1>
        </div>
      </section>

      <section className="gp-intro" data-nav="light">
        <div className="gp__container">
          <p className="gp-intro__text">
            <Lines text={data.intro} />
          </p>
          <div className="gp-intro__rule" aria-hidden="true" />
        </div>
      </section>

      <ProjectExplorer
        projects={projects}
        countries={data.countries ?? []}
        categories={data.categories ?? []}
      />
    </main>
  )
}
