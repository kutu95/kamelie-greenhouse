const withNextIntl = require('next-intl/plugin')(
  './src/lib/i18n.ts'
)

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  serverExternalPackages: ['@supabase/ssr'],
  outputFileTracingRoot: undefined
}

module.exports = withNextIntl(nextConfig)
