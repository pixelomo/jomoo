'use client'

import { Fragment, useId, useMemo, useState } from 'react'
import Link from 'next/link'
import type { JobPosition } from '@/lib/sanity'

const APPLY_FALLBACK = '/contact-us?category=recruitment'
const PAGE_SIZE = 10

/** The four filters, as jomoo.com's Find A Job sets them — Country gives way to
 *  雇用形態, since every position here is in Japan. */
const FILTERS = [
  { key: 'experience', label: '経験' },
  { key: 'field', label: '分野' },
  { key: 'location', label: '勤務地' },
  { key: 'employmentType', label: '雇用形態' },
] as const

type FilterKey = (typeof FILTERS)[number]['key']
type Filters = Record<FilterKey, string>

const EMPTY: Filters = { experience: '', field: '', location: '', employmentType: '' }

interface Props {
  title: string
  lead?: string
  empty: string
  jobs: JobPosition[]
}

/**
 * 募集職種 — the open positions from the Studio's 求人 documents, after
 * jomoo.com/about/career: a row of dropdowns with a 検索 button, then a table
 * of positions. Each dropdown offers only values the positions use, and the
 * filter applies on 検索 rather than on every change, as the original does.
 * A row opens to its description and 応募する button.
 */
export default function CareersJobs({ title, lead, empty, jobs }: Props) {
  const baseId = useId()
  const [draft, setDraft] = useState<Filters>(EMPTY)
  const [applied, setApplied] = useState<Filters>(EMPTY)
  const [open, setOpen] = useState<string | null>(null)
  const [shown, setShown] = useState(PAGE_SIZE)

  const options = useMemo(
    () =>
      Object.fromEntries(
        FILTERS.map(({ key }) => [
          key,
          [...new Set(jobs.map((job) => job[key]?.trim()).filter((v): v is string => !!v))].sort((a, b) =>
            a.localeCompare(b, 'ja')
          ),
        ])
      ) as Record<FilterKey, string[]>,
    [jobs]
  )

  const results = useMemo(
    () => jobs.filter((job) => FILTERS.every(({ key }) => !applied[key] || job[key]?.trim() === applied[key])),
    [jobs, applied]
  )

  const filtered = FILTERS.some(({ key }) => applied[key])

  return (
    <section className="cr-jobs" data-nav="light" aria-labelledby={`${baseId}-title`}>
      <div className="cr-jobs__inner">
        <h2 id={`${baseId}-title`} className="cr-jobs__title">
          {title}
        </h2>
        {lead && <p className="cr-jobs__lead">{lead}</p>}

        <form
          className="cr-jobs__filters"
          role="search"
          aria-label="求人検索"
          onSubmit={(e) => {
            e.preventDefault()
            setApplied(draft)
            setOpen(null)
            setShown(PAGE_SIZE)
          }}
        >
          {FILTERS.map(({ key, label }) => (
            <label key={key} className="cr-jobs__field">
              <span className="cr-jobs__sr">{label}</span>
              <select
                className="cr-jobs__select"
                value={draft[key]}
                onChange={(e) => setDraft((d) => ({ ...d, [key]: e.target.value }))}
              >
                <option value="">{label}</option>
                {options[key].map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </label>
          ))}
          <button type="submit" className="cr-jobs__search">
            検索
          </button>
        </form>

        <div className="cr-jobs__table">
          <div className="cr-jobs__head" aria-hidden="true">
            <span>募集職種</span>
            {FILTERS.map(({ key, label }) => (
              <span key={key}>
                {label}
              </span>
            ))}
          </div>

          {results.length === 0 ? (
            <p className="cr-jobs__empty">
              {jobs.length === 0 || !filtered ? empty : '条件に一致する求人はありません。条件を変えて検索してください。'}
            </p>
          ) : (
            results.slice(0, shown).map((job) => {
              const isOpen = open === job._id
              const panelId = `${baseId}-${job._id}`
              const href = job.applyUrl || APPLY_FALLBACK
              return (
                <div key={job._id} className={`cr-jobs__item${isOpen ? ' is-open' : ''}`}>
                  <button
                    type="button"
                    className="cr-jobs__row"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => setOpen(isOpen ? null : job._id)}
                  >
                    <span className="cr-jobs__position">
                      {job.title}
                    </span>
                    {FILTERS.map(({ key, label }) => (
                      <span key={key} className="cr-jobs__cell" data-label={label}>
                        {job[key] || '—'}
                      </span>
                    ))}
                  </button>
                  {isOpen && (
                    <div id={panelId} className="cr-jobs__panel">
                      {job.description && (
                        <p className="cr-jobs__description">
                          {job.description.split('\n').map((line, i) => (
                            <Fragment key={i}>
                              {i > 0 && <br />}
                              {line}
                            </Fragment>
                          ))}
                        </p>
                      )}
                      {href.startsWith('/') ? (
                        <Link href={href} className="cr-jobs__apply">
                          応募する
                        </Link>
                      ) : (
                        <a href={href} className="cr-jobs__apply" target="_blank" rel="noopener noreferrer">
                          応募する
                        </a>
                      )}
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>

        {results.length > shown && (
          <button type="button" className="cr-jobs__more" onClick={() => setShown((n) => n + PAGE_SIZE)}>
            もっと見る
          </button>
        )}
      </div>
    </section>
  )
}
