import BrandStage from './BrandStage'
import HistorySection from './HistorySection'
import BrandFamilySection from './BrandFamilySection'
import GlobalPresenceSection from './GlobalPresenceSection'
import FooterCtaSection from '@/components/home/FooterCtaSection'
import './company-profile.css'

/**
 * 会社情報. Opens on one continuous video — it sits still under the nav while
 * the title panel and then the brand introduction scroll across it — and lands
 * on the white timeline, the brand family and the global map.
 *
 * It closes on the homepage's own catalog and contact cards — the same
 * component, which is why those styles now live beside it rather than inside
 * the homepage's stylesheet.
 */
export default function CompanyProfilePage() {
  return (
    <main className="cp">
      <BrandStage />
      <HistorySection />
      <BrandFamilySection />
      <GlobalPresenceSection />
      <FooterCtaSection />
    </main>
  )
}
