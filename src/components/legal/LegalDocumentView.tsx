import Link from 'next/link'
import type { LegalBlock, LegalDocument } from '@/lib/legal/documents'
import './legal.css'

/** The client's documents still carry 【…】 blanks for the details they have to
 *  supply — the operating company, the contact window, the effective date.
 *  Picking them out rather than letting them read as body copy keeps it plain
 *  which parts of the page are finished and which are waiting on them. */
function Text({ text }: { text: string }) {
  const parts = text.split(/(【[^】]*】)/)
  return (
    <>
      {parts.map((part, index) =>
        part.startsWith('【') ? (
          <span className="legal__blank" key={index}>
            {part}
          </span>
        ) : (
          part
        )
      )}
    </>
  )
}

function Block({ block }: { block: LegalBlock }) {
  switch (block.type) {
    case 'list':
      return (
        <ul className="legal__list">
          {block.items.map((item) => (
            <li key={item.marker}>
              <span className="legal__marker">{item.marker}</span>
              <Text text={item.text} />
            </li>
          ))}
        </ul>
      )
    case 'fields':
      return (
        <dl className="legal__fields">
          {block.items.map((field) => (
            <div className="legal__field" key={field.label}>
              <dt>{field.label}</dt>
              <dd>
                <Text text={field.value} />
              </dd>
            </div>
          ))}
        </dl>
      )
    default:
      return (
        <p className="legal__text">
          <Text text={block.text} />
        </p>
      )
  }
}

export default function LegalDocumentView({ doc }: { doc: LegalDocument }) {
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
          {doc.sections.map((section, index) => (
            <section className="legal__section" key={section.heading ?? index}>
              {section.heading && <h2 className="legal__heading">{section.heading}</h2>}
              {section.blocks.map((block, blockIndex) => (
                <Block block={block} key={blockIndex} />
              ))}
            </section>
          ))}
        </article>

        <footer className="legal__colophon">
          {doc.colophon.map((field) => (
            <p key={field.label}>
              {field.label}：<Text text={field.value} />
            </p>
          ))}
          <p className="legal__copyright">{doc.copyright}</p>
        </footer>
      </div>
    </main>
  )
}
