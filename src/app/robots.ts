import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://omniversegeckos.com'

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/api/',
          '/_next/',
          '/static/',
          '/*.json$',
          '/*.xml$',
          '/temp/',
          '/tmp/',
          '/logs/',
          '/analytics/private/',
          '/user-dashboard/', // Private user data
          '/investor-relations/private/' // Private investor data
        ]
      },
      // Special rules for search engines
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/admin/',
          '/api/',
          '/_next/',
          '/analytics/private/',
          '/user-dashboard/'
        ],
        crawlDelay: 1
      },
      {
        userAgent: 'Bingbot',
        allow: '/',
        disallow: [
          '/admin/',
          '/api/',
          '/_next/',
          '/analytics/private/',
          '/user-dashboard/'
        ],
        crawlDelay: 2
      },
      // Block AI training bots (optional - for content protection)
      {
        userAgent: [
          'GPTBot',
          'Google-Extended',
          'CCBot',
          'anthropic-ai',  
          'Claude-Web'
        ],
        disallow: '/'
      }
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl
  }
}