import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'cdn.sanity.io'      },
    ],
  },
  async headers() {
    return [
      {
        // Allow the self-hosted studio to be embedded from sanity.io dashboard
        source: '/studio/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'ALLOW-FROM https://sanity.io' },
          { key: 'Content-Security-Policy', value: "frame-ancestors 'self' https://sanity.io https://*.sanity.io" },
        ],
      },
    ]
  },
}

export default withNextIntl(nextConfig)
