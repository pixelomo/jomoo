import DesignerHero from './DesignerHero'
import DesignerIntro from './DesignerIntro'
import DesignerProfile from './DesignerProfile'
import AwardsCarousel from './AwardsCarousel'
import { imgUrl, lines, type DesignerPageData } from '@/lib/sanity'
import './designer.css'

/**
 * The bands' rhythm down the page. It belongs to the position, not the person,
 * so a designer added or reordered in the Studio keeps the pattern: grey, dark,
 * white, then round again, with the portrait swapping sides each time.
 */
const TONES = ['grey', 'dark', 'white'] as const

/**
 * デザイナー. Opens on the sketch hero, states the collaboration in one
 * centred paragraph, then gives each designer a full band of their own —
 * alternating side and tone, each with their name set oversized behind the
 * portrait — and closes on the award logos.
 *
 * Content is the designerPage document in Sanity, resolved to plain URLs here
 * so the animated sections stay free of the Sanity client.
 */
export default function DesignerPage({ data }: { data: DesignerPageData }) {
  return (
    <main className="dz">
      <DesignerHero
        image={data.heroImage?.asset ? imgUrl(data.heroImage, 2400) : undefined}
        eyebrow={data.heroEyebrow ?? ''}
        title={lines(data.heroTitle)}
      />
      <DesignerIntro lines={lines(data.intro)} />

      {(data.designers ?? []).map((designer, i) => (
        <DesignerProfile
          key={designer._key}
          tone={TONES[i % TONES.length]}
          side={i % 2 === 0 ? 'left' : 'right'}
          watermark={designer.watermark ?? ''}
          name={designer.name}
          role={designer.role ?? ''}
          photo={designer.photo?.asset ? imgUrl(designer.photo, 1200) : ''}
          body={designer.body ?? ''}
        />
      ))}

      <AwardsCarousel
        eyebrow={data.awardsEyebrow ?? ''}
        title={data.awardsTitle ?? ''}
        logos={(data.awards ?? [])
          .filter((award) => award.logo?.asset)
          .map((award) => ({ name: award.name ?? '', src: imgUrl(award.logo, 600) }))}
      />
    </main>
  )
}
