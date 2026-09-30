/* eslint-disable @next/next/no-img-element */
'use client'

import { useMemo, useRef, useState } from 'react'

export interface Project {
  key: string
  title: string
  image: string
  description: string
  /** One of the page's country chips — the Studio checks this on publish. */
  country: string
  /** One of the page's category chips, likewise. */
  category: string
}

function toggle(list: string[], value: string) {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value]
}

/**
 * Within a row the chips are an OR — pick two countries and you get both. The
 * two rows are an AND, so 中国 + 教育機関 means "schools in China" rather than
 * "anything Chinese plus every school".
 */
function matches(project: Project, countries: string[], categories: string[]) {
  const countryOk = countries.length === 0 || countries.includes(project.country)
  const categoryOk = categories.length === 0 || categories.includes(project.category)
  return countryOk && categoryOk
}

function SearchGlyph() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="8.5" cy="8.5" r="6" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M13 13l5 5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  )
}

/**
 * The chips in the order the editor set, plus any value a project carries that
 * is missing from them. The Studio refuses to publish such a project, but a
 * chip removed after the fact would otherwise leave its projects unreachable
 * by the filter — the problem that once kept 交通拠点 off the page.
 */
function chipsFor(listed: string[], used: string[]) {
  return [...listed, ...used.filter((value, i) => value && !listed.includes(value) && used.indexOf(value) === i)]
}

interface Props {
  projects: Project[]
  countries: string[]
  categories: string[]
}

export default function ProjectExplorer({ projects, countries: countryChips, categories: categoryChips }: Props) {
  const [countries, setCountries] = useState<string[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [panelOpen, setPanelOpen] = useState(true)
  const resultsRef = useRef<HTMLDivElement>(null)

  const countryList = useMemo(
    () => chipsFor(countryChips, projects.map((p) => p.country)),
    [countryChips, projects]
  )
  const categoryList = useMemo(
    () => chipsFor(categoryChips, projects.map((p) => p.category)),
    [categoryChips, projects]
  )

  const results = useMemo(
    () => projects.filter((project) => matches(project, countries, categories)),
    [projects, countries, categories]
  )

  // Every chip filters on click, so 検索する has nothing left to submit; it
  // carries the reader down to what changed instead.
  function scrollToResults() {
    resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <section className="gp-explorer" data-nav="light" aria-label="プロジェクト検索">
      <div className="gp__container">
        <div className="gp-filter">
          <button
            type="button"
            className="gp-filter__head"
            aria-expanded={panelOpen}
            onClick={() => setPanelOpen((open) => !open)}
          >
            カテゴリーから探す
            <span className="gp-filter__toggle" aria-hidden="true" />
          </button>

          {panelOpen && (
            <div className="gp-filter__body">
              <div className="gp-filter__chips" role="group" aria-label="国から絞り込む">
                {countryList.map((country) => (
                  <button
                    key={country}
                    type="button"
                    className="gp-chip"
                    aria-pressed={countries.includes(country)}
                    onClick={() => setCountries((list) => toggle(list, country))}
                  >
                    {country}
                  </button>
                ))}
              </div>

              <div
                className="gp-filter__chips"
                role="group"
                aria-label="カテゴリーから絞り込む"
              >
                {categoryList.map((category) => (
                  <button
                    key={category}
                    type="button"
                    className="gp-chip"
                    aria-pressed={categories.includes(category)}
                    onClick={() => setCategories((list) => toggle(list, category))}
                  >
                    {category}
                  </button>
                ))}
              </div>

              <div className="gp-filter__actions">
                <button type="button" className="gp-filter__search" onClick={scrollToResults}>
                  <SearchGlyph />
                  検索する
                </button>
                <button
                  type="button"
                  className="gp-filter__reset"
                  onClick={() => {
                    setCountries([])
                    setCategories([])
                  }}
                >
                  リセット
                </button>
              </div>
            </div>
          )}
        </div>

        <p className="gp-visually-hidden" role="status">
          {results.length}件のプロジェクトを表示しています。
        </p>

        <div ref={resultsRef}>
          {results.length > 0 ? (
            <div className="gp-grid">
              {results.map((project) => (
                <article key={project.key} className="gp-card">
                  <h2 className="gp-card__title">{project.title}</h2>
                  {project.image && (
                    <img
                      className="gp-card__image"
                      src={project.image}
                      alt={project.title}
                      loading="lazy"
                    />
                  )}
                  <p className="gp-card__body">{project.description}</p>
                  <div className="gp-card__tags">
                    <span className="gp-tag">{project.country}</span>
                    <span className="gp-tag">{project.category}</span>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="gp-empty">
              選択された条件に一致するプロジェクトはありません。
              <br />
              条件を変更するか、リセットしてください。
            </p>
          )}
        </div>
      </div>
    </section>
  )
}
