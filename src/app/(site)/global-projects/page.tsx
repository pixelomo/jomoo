/* eslint-disable @next/next/no-img-element */
import type { Metadata } from 'next'
import ProjectExplorer from '@/components/projects/ProjectExplorer'
import '@/components/projects/global-projects.css'

export const metadata: Metadata = {
  title: 'グローバルプロジェクト',
  description:
    '世界で活躍するデザイナーたちが手がけた、魅力あふれるプロジェクトをご紹介します。洗練された製品が生み出す美しさと、空間にもたらす新たな価値をご覧ください。',
}

export default function GlobalProjectsPage() {
  return (
    <main className="gp">
      <section className="gp-hero" aria-label="グローバルプロジェクト">
        <img className="gp-hero__image" src="/images/global1.jpeg" alt="" />
        <div className="gp-hero__scrim" aria-hidden="true" />
        <div className="gp-hero__inner gp__container">
          <p className="gp-hero__eyebrow">GLOBAL PROJECTS</p>
          <h1 className="gp-hero__title">
            グローバル
            <br />
            プロジェクト
          </h1>
        </div>
      </section>

      <section className="gp-intro" data-nav="light">
        <div className="gp__container">
          <p className="gp-intro__text">
            世界で活躍するデザイナーたちが手がけた、魅力あふれるプロジェクトをご紹介します。
            <br />
            洗練された製品が生み出す美しさと、空間にもたらす新たな価値をご覧ください。
          </p>
          <div className="gp-intro__rule" aria-hidden="true" />
        </div>
      </section>

      <ProjectExplorer />
    </main>
  )
}
