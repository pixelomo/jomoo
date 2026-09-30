import ShowroomHero from './ShowroomHero'
import ShowroomInfo from './ShowroomInfo'
import { imgUrl, lines, type ShowroomPageData } from '@/lib/sanity'
import './showroom.css'

/**
 * ショールーム. Opens on the render of the showroom itself, then gives the
 * details in one table on white — who runs it, where it is, when it is open —
 * with the map and the way through to a booking under it.
 *
 * Content is the showroomPage document in Sanity, resolved here so the
 * animated sections stay free of the Sanity client.
 */
export default function ShowroomPage({ data }: { data: ShowroomPageData }) {
  return (
    <main className="sh">
      <ShowroomHero
        image={data.heroImage?.asset ? imgUrl(data.heroImage, 2400) : undefined}
        eyebrow={data.heroEyebrow ?? ''}
        title={lines(data.heroTitle)}
      />
      <ShowroomInfo
        title={data.infoTitle ?? ''}
        rows={(data.rows ?? []).map((row) => ({ key: row._key, label: row.label, lines: lines(row.value) }))}
        mapQuery={data.mapQuery}
        ctaLabel={data.ctaLabel || 'ショールーム予約へ'}
      />
    </main>
  )
}
