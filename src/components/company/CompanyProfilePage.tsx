import BrandStage from './BrandStage'
import HistorySection from './HistorySection'
import './company-profile.css'

/**
 * 会社情報. Opens on one continuous video — it sits still under the nav while
 * the title panel and then the brand introduction scroll across it — and lands
 * on the white timeline.
 *
 * Eras beyond 1990–1999 are still to come.
 */
export default function CompanyProfilePage() {
  return (
    <main className="cp">
      <BrandStage />
      <HistorySection />
    </main>
  )
}
