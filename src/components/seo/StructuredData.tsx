'use client'

import Script from 'next/script'

interface StructuredDataProps {
  type?: 'website' | 'organization' | 'game' | 'product' | 'event'
  data?: Record<string, any>
}

export function StructuredData({ type = 'website', data = {} }: StructuredDataProps) {
  const getStructuredData = () => {
    const baseData = {
      '@context': 'https://schema.org',
      '@type': type === 'website' ? 'WebSite' : 'Organization',
      name: 'Omniverse Geckos',
      description: 'Revolutionary Web3 gaming platform where you can play, earn, and collect unique NFTs while building your digital empire.',
      url: 'https://omniversegeckos.com',
      ...data
    }

    switch (type) {
      case 'website':
        return {
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: 'Omniverse Geckos',
          description: 'Revolutionary Web3 gaming platform combining tower defense gameplay with NFT collecting and play-to-earn mechanics.',
          url: 'https://omniversegeckos.com',
          potentialAction: {
            '@type': 'SearchAction',
            target: {
              '@type': 'EntryPoint',
              urlTemplate: 'https://omniversegeckos.com/search?q={search_term_string}'
            },
            'query-input': 'required name=search_term_string'
          },
          publisher: {
            '@type': 'Organization',
            name: 'Omniverse Geckos',
            logo: {
              '@type': 'ImageObject',
              url: 'https://omniversegeckos.com/logo.png',
              width: 512,
              height: 512
            }
          },
          ...data
        }

      case 'organization':
        return {
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: 'Omniverse Geckos',
          description: 'Web3 gaming company developing next-generation blockchain games with play-to-earn mechanics.',
          url: 'https://omniversegeckos.com',
          logo: {
            '@type': 'ImageObject',
            url: 'https://omniversegeckos.com/logo.png',
            width: 512,
            height: 512
          },
          foundingDate: '2024',
          industry: 'Gaming, Blockchain, NFT',
          employees: {
            '@type': 'QuantitativeValue',
            value: '10-50'
          },
          sameAs: [
            'https://twitter.com/omniversegeckos',
            'https://discord.gg/omniversegeckos',
            'https://t.me/omniversegeckos',
            'https://github.com/omniversegeckos'
          ],
          contactPoint: {
            '@type': 'ContactPoint',
            contactType: 'investor relations',
            email: 'investors@omniversegeckos.com'
          },
          ...data
        }

      case 'game':
        return {
          '@context': 'https://schema.org',
          '@type': 'VideoGame',
          name: 'Omniverse Geckos',
          description: 'Revolutionary tower defense game with Web3 integration, NFT collecting, and play-to-earn mechanics.',
          url: 'https://omniversegeckos.com/game',
          image: 'https://omniversegeckos.com/game-screenshot.png',
          genre: ['Strategy', 'Tower Defense', 'Web3', 'Play-to-Earn'],
          gamePlatform: ['Web Browser', 'Mobile'],
          applicationCategory: 'Game',
          operatingSystem: 'Web',
          author: {
            '@type': 'Organization',
            name: 'Omniverse Geckos'
          },
          offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
            availability: 'https://schema.org/InStock'
          },
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: '4.8',
            reviewCount: '1250',
            bestRating: '5'
          },
          ...data
        }

      case 'product':
        return {
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: 'Omniverse Geckos Platform',
          description: 'Complete Web3 gaming ecosystem with NFT marketplace, token economy, and AI-powered gameplay.',
          image: ['https://omniversegeckos.com/product-image.png'],
          brand: {
            '@type': 'Brand',
            name: 'Omniverse Geckos'
          },
          category: 'Gaming Platform',
          offers: {
            '@type': 'Offer',
            url: 'https://omniversegeckos.com',
            priceCurrency: 'USD',
            price: '0',
            availability: 'https://schema.org/InStock',
            validFrom: '2024-01-01'
          },
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: '4.9',
            reviewCount: '892'
          },
          ...data
        }

      case 'event':
        return {
          '@context': 'https://schema.org',
          '@type': 'Event',
          name: 'Omniverse Geckos Token Launch',
          description: 'Official launch of the $GECKO token with exclusive early access for community members.',
          startDate: '2024-03-01T00:00:00Z',
          endDate: '2024-03-31T23:59:59Z',
          location: {
            '@type': 'VirtualLocation',
            url: 'https://omniversegeckos.com/token-launch'
          },
          image: 'https://omniversegeckos.com/token-launch-banner.png',
          organizer: {
            '@type': 'Organization',
            name: 'Omniverse Geckos',
            url: 'https://omniversegeckos.com'
          },
          eventAttendanceMode: 'https://schema.org/OnlineEventAttendanceMode',
          eventStatus: 'https://schema.org/EventScheduled',
          ...data
        }

      default:
        return baseData
    }
  }

  return (
    <Script
      id={`structured-data-${type}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(getStructuredData())
      }}
    />
  )
}

// Specialized components for common use cases
export function WebsiteStructuredData() {
  return (
    <>
      <StructuredData type="website" />
      <StructuredData type="organization" />
    </>
  )
}

export function GameStructuredData() {
  return <StructuredData type="game" />
}

export function ProductStructuredData() {
  return <StructuredData type="product" />
}

// FAQ Structured Data
export function FAQStructuredData({ faqs }: { faqs: Array<{ question: string; answer: string }> }) {
  const faqStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  }

  return (
    <Script
      id="faq-structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(faqStructuredData)
      }}
    />
  )
}

// Breadcrumb Structured Data
export function BreadcrumbStructuredData({ items }: { 
  items: Array<{ name: string; url: string }> 
}) {
  const breadcrumbStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url
    }))
  }

  return (
    <Script
      id="breadcrumb-structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(breadcrumbStructuredData)
      }}
    />
  )
}

// Article Structured Data (for blog posts)
export function ArticleStructuredData({
  title,
  description,
  author,
  datePublished,
  dateModified,
  image,
  url
}: {
  title: string
  description: string
  author: string
  datePublished: string
  dateModified?: string
  image: string
  url: string
}) {
  const articleStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description: description,
    author: {
      '@type': 'Person',
      name: author
    },
    publisher: {
      '@type': 'Organization',
      name: 'Omniverse Geckos',
      logo: {
        '@type': 'ImageObject',
        url: 'https://omniversegeckos.com/logo.png'
      }
    },
    datePublished: datePublished,
    dateModified: dateModified || datePublished,
    image: image,
    url: url,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url
    }
  }

  return (
    <Script
      id="article-structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(articleStructuredData)
      }}
    />
  )
}