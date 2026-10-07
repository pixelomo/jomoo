import type { MetadataRoute } from 'next'

/**
 * What Android (and desktop Chrome) uses when the site is added to the home
 * screen. The icons come from scripts/build-share-images.mjs.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'JOMOO JAPAN',
    short_name: 'JOMOO',
    description: 'スマートトイレX40シリーズ — スマートバスルームブランドJOMOOの日本公式サイト',
    start_url: '/',
    display: 'browser',
    background_color: '#ffffff',
    theme_color: '#ffffff',
    lang: 'ja',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  }
}
