import { Poppins } from 'next/font/google'
import '../globals.css'

const poppins = Poppins({
  variable: '--font-poppins',
  subsets: ['latin', 'latin-ext'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
})

export const metadata = {
  title: 'X40 Scroll Demo | JOMOO',
  robots: { index: false, follow: false },
}

// Standalone demo page: it carries its own nav and full-bleed canvas, so it sits
// outside the (site) tree and supplies its own document shell.
export default function VideoScrollDemoLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className={`${poppins.variable} h-full antialiased`}>
      <body className={`${poppins.className} min-h-full bg-white text-zinc-900`}>
        {children}
      </body>
    </html>
  )
}
