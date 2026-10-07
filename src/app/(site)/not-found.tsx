import { getTranslations } from 'next-intl/server'
import '@/components/home/jomoo-homepage.css'

/**
 * Drawn inside the site layout, so a visitor who mistypes a URL still has the
 * menu and footer to find their way. It wears the section heading and the pill
 * every other page uses, rather than a look of its own.
 */
export default async function NotFound() {
  const t = await getTranslations('notFound')

  return (
    <main>
      <section className="feature" data-nav="light" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center' }}>
        <div className="feature__inner" style={{ width: '100%' }}>
          <div className="feature__head" style={{ marginBottom: 0 }}>
            <div className="feature__eyebrow">{t('code')} · PAGE NOT FOUND</div>
            <h1 className="feature__title">{t('heading')}</h1>
            <div className="feature__rule" aria-hidden="true" />
            <p className="feature__subtitle">{t('body')}</p>
            <a className="global-projects__cta" href="/">
              {t('cta')}
              <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path d="M4 12h15M13 6l6 6-6 6" />
              </svg>
            </a>
          </div>
        </div>
      </section>
    </main>
  )
}
