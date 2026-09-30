import CareersHero from './CareersHero'
import CareersIntro from './CareersIntro'
import CareersBand from './CareersBand'
import { imgUrl, lines, type CareersPageData } from '@/lib/sanity'
import './careers.css'

/**
 * 採用情報. Opens on the composed hero, states the invitation in centred
 * lines, then gives each theme a band of its own — the photograph alternating
 * edge, starting on the right, and the wash under every other band.
 *
 * Content is the careersPage document in Sanity; the rhythm is positional, so
 * a theme added or reordered in the Studio keeps it.
 */
export default function CareersPage({ data }: { data: CareersPageData }) {
  return (
    <main className="cr">
      <CareersHero
        image={data.heroImage?.asset ? imgUrl(data.heroImage, 2400) : undefined}
        eyebrow={data.heroEyebrow ?? ''}
        title={lines(data.heroTitle)}
      />
      <CareersIntro lines={lines(data.intro)} />

      {(data.bands ?? []).map((band, i) => (
        <CareersBand
          key={band._key}
          side={i % 2 === 0 ? 'right' : 'left'}
          wash={i % 2 === 0}
          title={band.title}
          body={band.body ?? ''}
          photo={band.photo?.asset ? imgUrl(band.photo, 1400) : ''}
          alt={band.alt ?? ''}
        />
      ))}
    </main>
  )
}
