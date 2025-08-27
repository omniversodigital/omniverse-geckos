/** @type {import('next').NextConfig} */
const nextConfig = {
  // Temporarily disabled export mode for X missions development
  // output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  assetPrefix: process.env.NODE_ENV === 'production' ? '/omniverse-geckos' : '',
  basePath: process.env.NODE_ENV === 'production' ? '/omniverse-geckos' : ''
}

module.exports = nextConfig