import BrandStage from './BrandStage'
import HistorySection, { type Era } from './HistorySection'
import BrandFamilySection, { type Brand } from './BrandFamilySection'
import GlobalPresenceSection, { type Stat } from './GlobalPresenceSection'
import FooterCtaSection from '@/components/home/FooterCtaSection'
import { imgUrl, lines, type CompanyPageData } from '@/lib/sanity'
import './company-profile.css'

/**
 * 会社情報. Opens on one continuous video — it sits still under the nav while
 * the title panel and then the brand introduction scroll across it — and lands
 * on the white timeline, the brand family and the global map.
 *
 * Everything but the map and the closing cards comes from the companyPage
 * document in Sanity. It is resolved to plain strings and URLs here, on the
 * server, so the animated sections below stay free of the Sanity client.
 *
 * It closes on the homepage's own catalog and contact cards — the same
 * component, which is why those styles now live beside it rather than inside
 * the homepage's stylesheet.
 */
export default function CompanyProfilePage({ data }: { data: CompanyPageData }) {
  const eras: Era[] = (data.eras ?? []).map((era) => ({
    key: era._key,
    from: era.from,
    to: era.to ?? '',
    tint: era.tint === 'top' || era.tint === 'bottom' ? era.tint : undefined,
    eyebrow: era.eyebrow ?? '',
    subtitle: era.subtitle ?? '',
    images: (era.images ?? [])
      .filter((image) => image.asset)
      .map((image) => ({
        src: imgUrl(image, 1400),
        alt: image.alt ?? '',
        width: image.width ?? 4,
        height: image.height ?? 3,
      })),
    entries: (era.entries ?? []).map((entry) => ({
      key: entry._key,
      year: entry.year,
      lines: lines(entry.text),
    })),
  }))

  const brands: Brand[] = (data.brands ?? []).map((brand) => ({
    key: brand._key,
    name: brand.name,
    photo: brand.photo?.asset ? imgUrl(brand.photo, 900) : '',
    logo: brand.logo?.asset ? imgUrl(brand.logo, 600) : '',
    logoHeight: brand.logoHeight ?? 40,
    logoAlt: brand.logoAlt,
    lines: lines(brand.copy),
  }))

  const stats: Stat[] = (data.stats ?? []).map((stat) => ({
    key: stat._key,
    label: stat.label,
    value: stat.value ?? 0,
    suffix: stat.suffix ?? '',
    icon: stat.icon?.asset ? imgUrl(stat.icon, 200) : undefined,
  }))

  return (
    <main className="cp">
      <BrandStage
        title={data.heroTitle ?? ''}
        videoUrl={data.heroVideoUrl}
        poster={data.heroPoster?.asset ? imgUrl(data.heroPoster, 2000) : undefined}
        about={{
          eyebrow: data.about?.eyebrow ?? '',
          title: data.about?.title ?? '',
          paragraphs: (data.about?.paragraphs ?? []).map(lines),
        }}
      />
      <HistorySection eyebrow={data.historyEyebrow ?? ''} title={data.historyTitle ?? ''} eras={eras} />
      <BrandFamilySection
        eyebrow={data.brandsEyebrow ?? ''}
        title={data.brandsTitle ?? ''}
        intro={lines(data.brandsIntro)}
        brands={brands}
      />
      <GlobalPresenceSection
        eyebrow={data.globalEyebrow ?? ''}
        title={data.globalTitle ?? ''}
        intro={lines(data.globalIntro)}
        stats={stats}
      />
      <FooterCtaSection />
    </main>
  )
}
