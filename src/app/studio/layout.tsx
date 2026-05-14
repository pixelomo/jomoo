import { NextStudioLayout, metadata as studioMetadata, viewport as studioViewport } from 'next-sanity/studio'
import type { Metadata, Viewport } from 'next'

export const metadata: Metadata = {
  ...studioMetadata,
  title: 'JoMoo CMS',
}

export const viewport: Viewport = {
  width: studioViewport.width,
  initialScale: studioViewport.initialScale,
  viewportFit: studioViewport.viewportFit as Viewport['viewportFit'],
}

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <NextStudioLayout>{children}</NextStudioLayout>
      </body>
    </html>
  )
}
