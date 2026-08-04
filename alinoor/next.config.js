/** @type {import('next').NextConfig} */
// Static export so the app can be served from GitHub Pages. All data access
// happens client-side via Supabase, so no server runtime is needed.
// NEXT_PUBLIC_BASE_PATH is "/AliNoor" on Pages and empty for local dev.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''

const nextConfig = {
  output: 'export',
  basePath,
  trailingSlash: true,
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
}

module.exports = nextConfig
