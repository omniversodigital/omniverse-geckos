/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    ppr: true,
    reactCompiler: true,
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
  
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ipfs.io',
        port: '',
        pathname: '/ipfs/**',
      },
      {
        protocol: 'https',
        hostname: 'gateway.pinata.cloud',
        port: '',
        pathname: '/ipfs/**',
      },
      {
        protocol: 'https',
        hostname: 'cloudflare-ipfs.com',
        port: '',
        pathname: '/ipfs/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.omniversegeckos.com',
        port: '',
        pathname: '/**',
      },
    ],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Phaser.js configuration
    config.plugins.push(
      new webpack.DefinePlugin({
        CANVAS_RENDERER: JSON.stringify(true),
        WEBGL_RENDERER: JSON.stringify(true),
      })
    )

    // Handle WebAssembly
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
    }

    // Blockchain/Web3 configuration
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      crypto: require.resolve('crypto-browserify'),
      stream: require.resolve('stream-browserify'),
      url: require.resolve('url'),
      zlib: require.resolve('browserify-zlib'),
      http: require.resolve('stream-http'),
      https: require.resolve('https-browserify'),
      assert: require.resolve('assert'),
      os: require.resolve('os-browserify/browser'),
      path: require.resolve('path-browserify'),
    }

    config.plugins.push(
      new webpack.ProvidePlugin({
        process: 'process/browser',
        Buffer: ['buffer', 'Buffer'],
      })
    )

    // Optimize for production
    if (!dev) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: {
              minChunks: 2,
              priority: -20,
              reuseExistingChunk: true,
            },
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              priority: -10,
              chunks: 'all',
            },
            web3: {
              test: /[\\/]node_modules[\\/](ethers|wagmi|viem|@rainbow-me)[\\/]/,
              name: 'web3',
              priority: 10,
              chunks: 'all',
            },
            game: {
              test: /[\\/]node_modules[\\/](phaser|three|matter-js)[\\/]/,
              name: 'game-engine',
              priority: 10,
              chunks: 'all',
            },
            ui: {
              test: /[\\/]node_modules[\\/](@radix-ui|framer-motion)[\\/]/,
              name: 'ui-components',
              priority: 10,
              chunks: 'all',
            },
          },
        },
      }
    }

    return config
  },

  // Environment variables for client
  env: {
    NEXT_PUBLIC_APP_NAME: 'Omniverse Geckos',
    NEXT_PUBLIC_APP_VERSION: process.env.npm_package_version,
    NEXT_PUBLIC_BUILD_ID: process.env.VERCEL_GIT_COMMIT_SHA || 'development',
  },

  // Headers for security and performance
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, max-age=0',
          },
        ],
      },
      {
        source: '/game/(.*)',
        headers: [
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'require-corp',
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
        ],
      },
    ]
  },

  // Redirects for backward compatibility
  async redirects() {
    return [
      {
        source: '/play',
        destination: '/game',
        permanent: true,
      },
      {
        source: '/nfts',
        destination: '/marketplace',
        permanent: true,
      },
    ]
  },

  // PWA and service worker
  async rewrites() {
    return [
      {
        source: '/sw.js',
        destination: '/_next/static/sw.js',
      },
      {
        source: '/manifest.json',
        destination: '/_next/static/manifest.json',
      },
    ]
  },

  // Performance optimizations
  compress: true,
  poweredByHeader: false,
  generateEtags: false,

  // Bundle analyzer
  ...(process.env.ANALYZE === 'true' && {
    webpack: (config, options) => {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          openAnalyzer: false,
          reportFilename: 'bundle-analysis.html',
        })
      )
      return config
    },
  }),

  // Logging
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
}

module.exports = nextConfig