import MarketingHeader from '@/components/home/MarketingHeader'
import MarketingHeroSection from '@/components/home/MarketingHeroSection'
import WorldOfJomooSection from '@/components/home/WorldOfJomooSection'
import AmazingExperienceSection from '@/components/home/AmazingExperienceSection'
import SmartToiletExpandSection from '@/components/home/SmartToiletExpandSection'
import ProductCardsSection from '@/components/home/ProductCardsSection'
import GlobalStatsSection from '@/components/home/GlobalStatsSection'
import MarketingFooter from '@/components/home/MarketingFooter'

export default function HomePage() {
  return (
    <main style={{ background: '#0A0A0A', overflowX: 'clip' }}>
      <MarketingHeader />
      <MarketingHeroSection />
      <WorldOfJomooSection />
      <AmazingExperienceSection />
      <SmartToiletExpandSection />
      <ProductCardsSection />
      <GlobalStatsSection />
      <MarketingFooter />
    </main>
  )
}
