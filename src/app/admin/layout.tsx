import type { ReactNode } from 'react'
import { Geist } from 'next/font/google'
import '../globals.css'

const geist = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })

export const metadata = {
  title: 'JOMOO Admin',
  robots: { index: false, follow: false },
}

export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={geist.variable}>
      <body style={{ margin: 0 }}>
        {children}
      </body>
    </html>
  )
}
