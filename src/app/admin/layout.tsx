import type { ReactNode } from 'react'
import { Poppins } from 'next/font/google'
import '../globals.css'

const poppins = Poppins({
  variable: '--font-poppins',
  subsets: ['latin', 'latin-ext'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
})

export const metadata = {
  title: 'JOMOO Admin',
  robots: { index: false, follow: false },
}

export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={poppins.variable}>
      <body className={poppins.className} style={{ margin: 0 }}>
        {children}
      </body>
    </html>
  )
}
