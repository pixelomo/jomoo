import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

// Applied to every response. Vercel also sets HSTS on their edge, but setting
// it here ensures it's enforced in preview deployments and self-hosted setups.
const globalSecurityHeaders = [
  // Force HTTPS for 2 years, include subdomains, allow preload registration
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  // Block MIME-type sniffing (XSS vector in older browsers)
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // Deny all framing by default (overridden for /studio below)
  { key: 'X-Frame-Options', value: 'DENY' },
  // Only send origin in Referer; suppress full URL to third parties
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // Disable unused browser APIs that could be abused
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()' },
  // Belt-and-suspenders XSS protection for legacy browsers
  { key: 'X-XSS-Protection', value: '1; mode=block' },
]

const nextConfig: NextConfig = {
  // Better Auth's internal Kysely adapter bundles SQLite native modules that
  // cannot be processed by webpack. Mark better-auth as external on the server.
  serverExternalPackages: ['better-auth', '@better-auth/kysely-adapter', 'kysely'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'cdn.sanity.io' },
    ],
  },
  async headers() {
    return [
      // Global: every route
      {
        source: '/(.*)',
        headers: globalSecurityHeaders,
      },
      // Studio: allow Sanity.io to embed the studio in their hosted dashboard.
      // Overrides the global DENY on X-Frame-Options for /studio paths only.
      {
        source: '/studio/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors 'self' https://sanity.io https://*.sanity.io",
          },
        ],
      },
    ]
  },
}

export default withNextIntl(nextConfig)
