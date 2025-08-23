import type { Metadata } from 'next'

// Base SEO configuration
export const baseSEO = {
  title: {
    default: 'Omniverse Geckos - Revolutionary Web3 Gaming Platform',
    template: '%s | Omniverse Geckos'
  },
  description: 'Play, earn, and collect in the ultimate Web3 gaming ecosystem. Tower defense meets NFT collecting with AI-powered gameplay and play-to-earn mechanics.',
  applicationName: 'Omniverse Geckos',
  authors: [
    { name: 'Omniverse Geckos Team', url: 'https://omniversegeckos.com' }
  ],
  generator: 'Next.js',
  keywords: [
    // Web3 Gaming Keywords
    'Web3 Gaming',
    'Play-to-Earn Games',
    'Blockchain Gaming',
    'NFT Games',
    'GameFi Platform',
    'Cryptocurrency Gaming',
    'DeFi Gaming',
    'Metaverse Gaming',
    
    // Game-specific Keywords
    'Tower Defense Game',
    'Strategy Games',
    'Gecko NFTs',
    'Gaming NFTs',
    'AI Gaming',
    'Multiplayer Strategy',
    
    // Investment Keywords
    'Gaming Investment',
    'Web3 Investment',
    'Token Investment',
    'NFT Investment',
    'Blockchain Investment',
    'Gaming Startup',
    
    // Technology Keywords
    'Ethereum Gaming',
    'Smart Contract Games',
    'Polygon Gaming',
    'IPFS Gaming',
    'Decentralized Gaming'
  ],
  referrer: 'origin-when-cross-origin',
  creator: 'Omniverse Geckos',
  publisher: 'Omniverse Geckos',
  formatDetection: {
    email: false,
    address: false,
    telephone: false
  }
}

// Generate metadata for different page types
export function generateSEO({
  title,
  description,
  path = '',
  image,
  type = 'website',
  publishedTime,
  modifiedTime,
  authors,
  tags,
  noIndex = false
}: {
  title?: string
  description?: string
  path?: string
  image?: string
  type?: 'website' | 'article' | 'product' | 'game'
  publishedTime?: string
  modifiedTime?: string
  authors?: string[]
  tags?: string[]
  noIndex?: boolean
}): Metadata {
  const url = `https://omniversegeckos.com${path}`
  const images = image ? [
    {
      url: image,
      width: 1200,
      height: 630,
      alt: title || baseSEO.title.default
    }
  ] : [
    {
      url: '/images/og-default.png',
      width: 1200,
      height: 630,
      alt: 'Omniverse Geckos - Web3 Gaming Platform'
    }
  ]

  return {
    title,
    description,
    
    // Basic Meta Tags
    metadataBase: new URL('https://omniversegeckos.com'),
    alternates: {
      canonical: url
    },
    
    // Robots
    robots: {
      index: !noIndex,
      follow: !noIndex,
      nocache: false,
      googleBot: {
        index: !noIndex,
        follow: !noIndex,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1
      }
    },
    
    // Open Graph
    openGraph: {
      type: type === 'article' ? 'article' : 'website',
      locale: 'en_US',
      url,
      title: title || baseSEO.title.default,
      description: description || baseSEO.description,
      siteName: 'Omniverse Geckos',
      images,
      ...(type === 'article' && publishedTime && {
        publishedTime,
        modifiedTime,
        authors: authors?.map(author => `/authors/${author}`)
      })
    },
    
    // Twitter
    twitter: {
      card: 'summary_large_image',
      title: title || baseSEO.title.default,
      description: description || baseSEO.description,
      images: images.map(img => img.url),
      creator: '@omniversegeckos',
      site: '@omniversegeckos'
    },
    
    // Additional
    category: 'Gaming',
    ...(tags && { keywords: tags.join(', ') })
  }
}

// Pre-configured SEO for common pages
export const pageSEO = {
  home: generateSEO({
    title: 'Omniverse Geckos - Revolutionary Web3 Gaming Platform',
    description: 'Join the future of gaming with Omniverse Geckos. Play tower defense games, collect unique NFTs, earn $GECKO tokens, and build your digital empire in our AI-powered Web3 ecosystem.',
    path: '/',
    image: '/images/og-home.png'
  }),

  game: generateSEO({
    title: 'Play Omniverse Geckos - Web3 Tower Defense Game',
    description: 'Experience revolutionary tower defense gameplay with Web3 integration. Defend your territory, collect rare Gecko NFTs, and earn real rewards while playing.',
    path: '/game',
    type: 'game',
    image: '/images/og-game.png'
  }),

  marketplace: generateSEO({
    title: 'NFT Marketplace - Buy, Sell & Trade Gecko NFTs',
    description: 'Discover rare Gecko NFTs in our marketplace. Buy, sell, and trade unique digital collectibles with special abilities and exclusive artwork.',
    path: '/marketplace',
    type: 'product',
    image: '/images/og-marketplace.png'
  }),

  casino: generateSEO({
    title: 'Gecko Casino - Web3 Mini-Games & Rewards',
    description: 'Try your luck in our Web3 casino featuring exciting mini-games, token rewards, and exclusive NFT prizes. Play responsibly and earn real value.',
    path: '/casino',
    image: '/images/og-casino.png'
  }),

  analytics: generateSEO({
    title: 'Analytics Dashboard - Track Your Gaming Performance',
    description: 'Monitor your gaming performance, token earnings, NFT collection value, and investment returns with our comprehensive analytics dashboard.',
    path: '/analytics',
    image: '/images/og-analytics.png',
    noIndex: true // Private dashboard
  }),

  earlyAccess: generateSEO({
    title: 'Join Early Access - Omniverse Geckos Beta',
    description: 'Get exclusive early access to Omniverse Geckos. Be among the first to play, earn rewards, collect rare NFTs, and join our growing community of Web3 gamers.',
    path: '/early-access',
    image: '/images/og-early-access.png'
  }),

  investors: generateSEO({
    title: 'Investment Opportunities - Partner with Omniverse Geckos',
    description: 'Join leading investors in the Web3 gaming revolution. Discover investment opportunities in our innovative platform with proven growth metrics and strong community.',
    path: '/investors',
    image: '/images/og-investors.png'
  })
}

// SEO utilities
export const seoUtils = {
  // Generate keywords for specific content
  generateKeywords: (baseKeywords: string[], additional: string[] = []) => {
    return [...baseKeywords, ...additional].join(', ')
  },

  // Create URL-friendly slugs
  createSlug: (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '')
  },

  // Generate meta description from content
  generateDescription: (content: string, maxLength = 160) => {
    const cleaned = content.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()
    return cleaned.length > maxLength 
      ? cleaned.substring(0, maxLength).replace(/\s+\S*$/, '') + '...'
      : cleaned
  },

  // Validate SEO requirements
  validateSEO: (data: { title?: string; description?: string }) => {
    const issues = []
    
    if (!data.title) {
      issues.push('Missing title')
    } else if (data.title.length > 60) {
      issues.push('Title too long (>60 characters)')
    } else if (data.title.length < 30) {
      issues.push('Title too short (<30 characters)')
    }

    if (!data.description) {
      issues.push('Missing description')
    } else if (data.description.length > 160) {
      issues.push('Description too long (>160 characters)')
    } else if (data.description.length < 120) {
      issues.push('Description too short (<120 characters)')
    }

    return {
      isValid: issues.length === 0,
      issues
    }
  }
}

// Rich snippets data
export const richSnippets = {
  faq: [
    {
      question: 'What is Omniverse Geckos?',
      answer: 'Omniverse Geckos is a revolutionary Web3 gaming platform that combines tower defense gameplay with NFT collecting, play-to-earn mechanics, and AI-powered features. Players can earn real value while having fun in our immersive gaming ecosystem.'
    },
    {
      question: 'How do I earn money playing Omniverse Geckos?',
      answer: 'Players can earn $GECKO tokens by winning games, completing challenges, trading NFTs, participating in tournaments, and staking their assets. All earnings are real cryptocurrency that can be traded or withdrawn.'
    },
    {
      question: 'What makes Gecko NFTs special?',
      answer: 'Gecko NFTs are unique digital collectibles with special abilities in the game. Each NFT has different rarities, attributes, and powers that affect gameplay. They can be traded, upgraded, and used across multiple game modes.'
    },
    {
      question: 'Is Omniverse Geckos free to play?',
      answer: 'Yes! Omniverse Geckos is free to play with optional premium features. Players can start earning immediately without any initial investment, though owning NFTs and tokens can enhance the gaming experience.'
    },
    {
      question: 'How do I get started with Omniverse Geckos?',
      answer: 'Simply create an account on our platform, connect your Web3 wallet (optional for beginners), and start playing. We provide easy onboarding for both Web3 newcomers and experienced users.'
    }
  ],

  breadcrumbs: {
    home: [
      { name: 'Home', url: '/' }
    ],
    game: [
      { name: 'Home', url: '/' },
      { name: 'Game', url: '/game' }
    ],
    marketplace: [
      { name: 'Home', url: '/' },
      { name: 'Marketplace', url: '/marketplace' }
    ],
    earlyAccess: [
      { name: 'Home', url: '/' },
      { name: 'Early Access', url: '/early-access' }
    ]
  }
}