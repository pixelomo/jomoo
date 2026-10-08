import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import JomooHomepage, { type HomeContent } from '@/components/home/JomooHomepage'
import FooterCtaSection from '@/components/home/FooterCtaSection'
import { X40_TURNTABLE, type SpotlightSlide } from '@/components/home/SpotlightCarousel'
import { COMING_SOON_LABEL, getHomePage, imgUrl, lines, type AssetRef } from '@/lib/sanity'
import { SITE_NAME, SITE_URL, pageMetadata } from '@/lib/seo'

export async function generateMetadata(): Promise<Metadata> {
  const data = await getHomePage()
  return pageMetadata({ description: data?.description, path: '/' })
}

// Tells Google the brand behind the site, for its name and logo in results.
const ORGANIZATION = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'JOMOO',
  alternateName: SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/icons/icon-512.png`,
}

/** An image field's URL at a width, or nothing when the field is empty. */
const url = (image: { asset?: AssetRef } | undefined, width: number) =>
  image?.asset ? imgUrl(image, width) : undefined

export default async function HomePage() {
  const data = await getHomePage()
  if (!data) notFound()

  const content: HomeContent = {
    heroProduct: {
      image: url(data.heroProduct?.image, 2400),
      eyebrow: data.heroProduct?.eyebrow ?? '',
      logo: url(data.heroProduct?.logo, 800),
      logoAlt: data.heroProduct?.logoAlt ?? '',
      subtitle: data.heroProduct?.subtitle ?? '',
      tagline: lines(data.heroProduct?.tagline),
      awards: (data.heroProduct?.awards ?? []).flatMap((award) =>
        award.image?.asset ? [{ src: imgUrl(award.image, 400), alt: award.alt ?? '' }] : []
      ),
      footnotes: lines(data.heroProduct?.footnotes),
    },
    heroVideo: {
      src: data.heroVideo?.videoUrl,
      eyebrow: data.heroVideo?.eyebrow ?? '',
      title: lines(data.heroVideo?.title),
      tagline: lines(data.heroVideo?.tagline),
    },
    heroBrand: {
      background: url(data.heroBrand?.background, 2400),
      foreground: url(data.heroBrand?.foreground, 2400),
      note: data.heroBrand?.note ?? '',
    },
    world: {
      eyebrow: data.worldEyebrow ?? '',
      title: lines(data.worldTitle),
      body: (data.worldBody ?? []).map(lines),
      closing: lines(data.worldClosing),
      main: url(data.worldMain, 1600),
      forest: url(data.worldForest, 1000),
      shower: url(data.worldShower, 1000),
      bathroom: url(data.worldBathroom, 1600),
    },
    expand: {
      image: url(data.expandImage, 2400),
      alt: data.expandAlt ?? '',
      label: data.expandLabel ?? '',
    },
    spotlight: (data.spotlightSlides ?? []).flatMap((slide): SpotlightSlide[] => {
      const base = {
        index: slide.label ?? '',
        title: lines(slide.title),
        body: lines(slide.body),
      }
      if (slide.media === 'turntable') {
        return [{ ...base, media: { type: 'loop' as const, srcs: X40_TURNTABLE } }]
      }
      if (slide.media === 'video') {
        if (!slide.videoUrl) return []
        return [{
          ...base,
          media: { type: 'video' as const, src: slide.videoUrl },
          playLabel: slide.playLabel,
          playTheme: 'dark' as const,
        }]
      }
      const src = url(slide.image, 1400)
      return src ? [{ ...base, media: { type: 'image' as const, src } }] : []
    }),
    lineup: {
      eyebrow: data.lineupEyebrow ?? '',
      title: data.lineupTitle ?? '',
      subtitle: lines(data.lineupSubtitle),
      cards: (data.lineupProducts ?? []).flatMap((p) => {
        const image = url(p.card?.image, 900) ?? (p.thumbnail ? imgUrl(p.thumbnail, 900) : undefined)
        if (!image || !p.slug || !p.series) return []
        return [{
          key: p._id,
          href: p.comingSoon ? undefined : `/products/${p.series}/${p.slug}`,
          pill: p.heroEyebrow || 'SMART TOILET',
          name: p.heroTitle || p.name || '',
          image,
          hover: url(p.card?.hoverImage, 900),
          tagline: p.comingSoon ? [] : lines(p.card?.tagline),
          desc: p.comingSoon ? COMING_SOON_LABEL : p.card?.description ?? p.tagline ?? '',
        }]
      }),
    },
    projects: {
      eyebrow: data.projectsEyebrow ?? '',
      title: data.projectsTitle ?? '',
      subtitle: lines(data.projectsSubtitle),
      cta: data.projectsCta ?? '',
      slides: (data.projectSlides ?? []).flatMap((slide) => {
        const image = url(slide.image, 1400)
        return image ? [{ image, title: slide.title, meta: slide.meta ?? '' }] : []
      }),
    },
    stats: (data.stats ?? []).map((stat) => ({
      key: stat._key,
      label: lines(stat.label),
      softBreak: stat.softBreak ?? false,
      value: stat.value ?? 0,
      suffix: stat.suffix ?? '',
      icon: url(stat.icon, 200),
    })),
    awardLogos: (data.awardLogos ?? []).flatMap((award) =>
      award.logo?.asset ? [imgUrl(award.logo, 600)] : []
    ),
    design: {
      eyebrow: data.designEyebrow ?? '',
      title: lines(data.designTitle),
      subtitle: lines(data.designSubtitle),
      button: data.designButton ?? '',
      lane1: (data.designLane1 ?? []).flatMap((item) =>
        item.image?.asset ? [{ src: imgUrl(item.image, 800), onBackdrop: item.onBackdrop }] : []
      ),
      lane2: (data.designLane2 ?? []).flatMap((item) =>
        item.image?.asset ? [{ src: imgUrl(item.image, 800), onBackdrop: item.onBackdrop }] : []
      ),
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ORGANIZATION) }}
      />
      <JomooHomepage content={content} closing={<FooterCtaSection />} />
    </>
  )
}
