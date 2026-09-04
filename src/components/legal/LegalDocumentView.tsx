import { Children, type ReactNode } from 'react'
import Link from 'next/link'
import { PortableText, type PortableTextComponents } from '@portabletext/react'
import type { DefinitionRow, LegalDocument } from '@/lib/sanity'
import './legal.css'

/** The client's documents still carry 【…】 blanks for the details they have to
 *  supply — the operating company, the contact window, the effective date.
 *  Picking them out rather than letting them read as body copy keeps it plain
 *  which parts of the page are finished and which are waiting on them. The
 *  markers disappear on their own once the brackets are filled in in Sanity. */
function markBlanks(node: ReactNode): ReactNode {
  return Children.map(node, (child) => {
    // Anything the editor marked up arrives as an element; only plain runs of
    // text can hold a bracket, so only those are split.
    if (typeof child !== 'string') return child
    return child
      .split(/(【[^】]*】)/)
      .map((part, index) =>
        part.startsWith('【') ? (
          <span className="legal__blank" key={index}>
            {part}
          </span>
        ) : (
          part
        )
      )
  })
}

const components: PortableTextComponents = {
  block: {
    h2: ({ children }) => <h2 className="legal__heading">{children}</h2>,
    normal: ({ children }) => <p className="legal__text">{markBlanks(children)}</p>,
  },
  list: {
    number: ({ children }) => <ol className="legal__list">{children}</ol>,
  },
  listItem: {
    number: ({ children }) => <li>{markBlanks(children)}</li>,
  },
  types: {
    definitionList: ({ value }: { value: { rows?: DefinitionRow[] } }) => (
      <dl className="legal__fields">
        {(value.rows ?? []).map((row) => (
          <div className="legal__field" key={row.label}>
            <dt>{row.label}</dt>
            <dd>{markBlanks(row.value)}</dd>
          </div>
        ))}
      </dl>
    ),
  },
}

export default function LegalDocumentView({ doc }: { doc: LegalDocument }) {
  const colophon = [
    { label: '制定日', value: doc.established },
    { label: '運営会社', value: doc.operator },
  ].filter((field) => field.value)

  return (
    <main className="flex-1 legal">
      <div className="legal__container">
        <nav className="legal__crumbs" aria-label="パンくずリスト">
          <Link href="/">ホーム</Link>
          <span className="legal__crumbs-sep" aria-hidden="true">
            /
          </span>
          <span className="legal__crumbs-current">{doc.title}</span>
        </nav>

        <h1 className="legal__title">{doc.title}</h1>
        <div className="legal__rule" />

        <article className="legal__body">
          <PortableText
            value={(doc.body ?? []) as Parameters<typeof PortableText>[0]['value']}
            components={components}
          />
        </article>

        {(colophon.length > 0 || doc.copyright) && (
          <footer className="legal__colophon">
            {colophon.map((field) => (
              <p key={field.label}>
                {field.label}：{markBlanks(field.value)}
              </p>
            ))}
            {doc.copyright && <p className="legal__copyright">{doc.copyright}</p>}
          </footer>
        )}
      </div>
    </main>
  )
}
