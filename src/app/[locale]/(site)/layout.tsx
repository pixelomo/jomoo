import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <div className="flex flex-col flex-1">
        {children}
      </div>
      <Footer />
    </>
  )
}
