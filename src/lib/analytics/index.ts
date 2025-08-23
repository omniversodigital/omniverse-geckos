// Analytics & Monitoring System
import { useEffect } from 'react'

// Types
export interface AnalyticsEvent {
  category: 'investment' | 'game' | 'nft' | 'token' | 'user' | 'marketplace'
  action: string
  label?: string
  value?: number
  metadata?: Record<string, any>
}

export interface UserProperties {
  userId?: string
  walletAddress?: string
  isInvestor?: boolean
  totalInvestment?: number
  nftCount?: number
  tokenBalance?: number
  gameLevel?: number
  referralSource?: string
}

// Analytics Core
class Analytics {
  private isInitialized = false
  private userProperties: UserProperties = {}
  private providers: string[] = []

  async initialize() {
    if (this.isInitialized) return
    
    try {
      // Initialize Google Analytics 4
      if (process.env.NEXT_PUBLIC_GA4_ID) {
        await this.initializeGA4()
        this.providers.push('GA4')
      }

      // Initialize Mixpanel
      if (process.env.NEXT_PUBLIC_MIXPANEL_TOKEN) {
        await this.initializeMixpanel()
        this.providers.push('Mixpanel')
      }

      // Initialize PostHog
      if (process.env.NEXT_PUBLIC_POSTHOG_KEY) {
        await this.initializePostHog()
        this.providers.push('PostHog')
      }

      // Initialize Vercel Analytics
      if (process.env.NEXT_PUBLIC_VERCEL_ANALYTICS_ID) {
        await this.initializeVercelAnalytics()
        this.providers.push('Vercel')
      }

      this.isInitialized = true
      console.log('📊 Analytics initialized with providers:', this.providers)
    } catch (error) {
      console.error('Failed to initialize analytics:', error)
    }
  }

  private async initializeGA4() {
    if (typeof window === 'undefined') return
    
    // Load GA4 script
    const script = document.createElement('script')
    script.src = `https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA4_ID}`
    script.async = true
    document.head.appendChild(script)

    // Initialize dataLayer
    window.dataLayer = window.dataLayer || []
    function gtag(...args: any[]) {
      window.dataLayer.push(arguments)
    }
    gtag('js', new Date())
    gtag('config', process.env.NEXT_PUBLIC_GA4_ID)
    
    // Store gtag function
    ;(window as any).gtag = gtag
  }

  private async initializeMixpanel() {
    if (typeof window === 'undefined') return
    
    const mixpanel = (await import('mixpanel-browser')).default
    mixpanel.init(process.env.NEXT_PUBLIC_MIXPANEL_TOKEN!, {
      debug: process.env.NODE_ENV === 'development',
      track_pageview: true,
      persistence: 'localStorage'
    })
    ;(window as any).mixpanel = mixpanel
  }

  private async initializePostHog() {
    if (typeof window === 'undefined') return
    
    const posthog = (await import('posthog-js')).default
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
      loaded: (posthog) => {
        if (process.env.NODE_ENV === 'development') posthog.opt_out_capturing()
      }
    })
    ;(window as any).posthog = posthog
  }

  private async initializeVercelAnalytics() {
    // Vercel Analytics auto-initializes with the component
    console.log('Vercel Analytics ready')
  }

  // Track Events
  track(event: AnalyticsEvent) {
    if (!this.isInitialized) {
      console.warn('Analytics not initialized')
      return
    }

    const { category, action, label, value, metadata } = event
    const eventName = `${category}_${action}`

    // Google Analytics 4
    if ((window as any).gtag) {
      ;(window as any).gtag('event', action, {
        event_category: category,
        event_label: label,
        value: value,
        ...metadata
      })
    }

    // Mixpanel
    if ((window as any).mixpanel) {
      ;(window as any).mixpanel.track(eventName, {
        category,
        label,
        value,
        ...metadata
      })
    }

    // PostHog
    if ((window as any).posthog) {
      ;(window as any).posthog.capture(eventName, {
        category,
        label,
        value,
        ...metadata
      })
    }

    console.log('📊 Event tracked:', eventName, { label, value, metadata })
  }

  // Identify User
  identify(properties: UserProperties) {
    this.userProperties = { ...this.userProperties, ...properties }
    
    const { userId, walletAddress, ...traits } = this.userProperties

    // Mixpanel
    if ((window as any).mixpanel) {
      if (userId) {
        ;(window as any).mixpanel.identify(userId)
      }
      ;(window as any).mixpanel.people.set(traits)
    }

    // PostHog
    if ((window as any).posthog) {
      if (userId) {
        ;(window as any).posthog.identify(userId, traits)
      }
    }

    // GA4 User Properties
    if ((window as any).gtag) {
      ;(window as any).gtag('set', 'user_properties', traits)
    }

    console.log('👤 User identified:', userId || walletAddress)
  }

  // Track Page View
  pageView(path: string, title?: string) {
    // GA4
    if ((window as any).gtag) {
      ;(window as any).gtag('event', 'page_view', {
        page_path: path,
        page_title: title
      })
    }

    // Mixpanel
    if ((window as any).mixpanel) {
      ;(window as any).mixpanel.track_pageview({ page: path })
    }

    // PostHog
    if ((window as any).posthog) {
      ;(window as any).posthog.capture('$pageview')
    }
  }

  // Investment Tracking
  trackInvestment(amount: number, type: 'token' | 'nft', metadata?: any) {
    this.track({
      category: 'investment',
      action: 'purchase',
      label: type,
      value: amount,
      metadata: {
        currency: 'USD',
        paymentMethod: metadata?.paymentMethod,
        ...metadata
      }
    })

    // Update user investment total
    const currentTotal = this.userProperties.totalInvestment || 0
    this.identify({ totalInvestment: currentTotal + amount })
  }

  // Game Events
  trackGameEvent(action: string, metadata?: any) {
    this.track({
      category: 'game',
      action,
      metadata
    })
  }

  // NFT Events
  trackNFTEvent(action: 'mint' | 'buy' | 'sell' | 'breed', nftId?: string, price?: number) {
    this.track({
      category: 'nft',
      action,
      label: nftId,
      value: price,
      metadata: { nftId, price }
    })
  }

  // Conversion Tracking
  trackConversion(type: 'signup' | 'investment' | 'nft_purchase' | 'token_purchase', value?: number) {
    this.track({
      category: 'investment',
      action: 'conversion',
      label: type,
      value,
      metadata: { conversionType: type }
    })

    // Google Ads Conversion
    if ((window as any).gtag) {
      ;(window as any).gtag('event', 'conversion', {
        send_to: process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_ID,
        value: value,
        currency: 'USD'
      })
    }
  }

  // Performance Tracking
  trackPerformance(metric: string, value: number, unit: string = 'ms') {
    this.track({
      category: 'user',
      action: 'performance',
      label: metric,
      value,
      metadata: { metric, unit }
    })
  }

  // Error Tracking
  trackError(error: Error, context?: any) {
    this.track({
      category: 'user',
      action: 'error',
      label: error.message,
      metadata: {
        stack: error.stack,
        context
      }
    })
  }
}

// Export singleton instance
export const analytics = new Analytics()

// React Hooks
export function useAnalytics() {
  useEffect(() => {
    analytics.initialize()
  }, [])

  return analytics
}

export function usePageTracking() {
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    const handleRouteChange = () => {
      analytics.pageView(window.location.pathname, document.title)
    }

    // Track initial page view
    handleRouteChange()

    // Listen for route changes
    window.addEventListener('popstate', handleRouteChange)
    
    return () => {
      window.removeEventListener('popstate', handleRouteChange)
    }
  }, [])
}

// Investment Analytics
export function useInvestmentTracking() {
  const trackPresaleView = () => {
    analytics.track({
      category: 'investment',
      action: 'view_presale',
      metadata: { source: window.location.pathname }
    })
  }

  const trackWhitepaperDownload = () => {
    analytics.track({
      category: 'investment',
      action: 'download_whitepaper'
    })
    analytics.trackConversion('signup')
  }

  const trackInvestorDeckView = () => {
    analytics.track({
      category: 'investment',
      action: 'view_investor_deck'
    })
  }

  const trackTokenPurchaseIntent = (amount: number) => {
    analytics.track({
      category: 'investment',
      action: 'token_purchase_intent',
      value: amount
    })
  }

  const trackNFTPurchaseIntent = (nftId: string, price: number) => {
    analytics.track({
      category: 'investment',
      action: 'nft_purchase_intent',
      label: nftId,
      value: price
    })
  }

  return {
    trackPresaleView,
    trackWhitepaperDownload,
    trackInvestorDeckView,
    trackTokenPurchaseIntent,
    trackNFTPurchaseIntent
  }
}

// Performance Monitoring
export function usePerformanceMonitoring() {
  useEffect(() => {
    if (typeof window === 'undefined') return

    // Web Vitals
    const reportWebVital = ({ name, value }: { name: string; value: number }) => {
      analytics.trackPerformance(name, Math.round(value))
    }

    // Observe performance metrics
    if ('PerformanceObserver' in window) {
      try {
        // LCP
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          const lastEntry = entries[entries.length - 1] as any
          reportWebVital({ name: 'LCP', value: lastEntry.startTime })
        })
        lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true })

        // FID
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          entries.forEach((entry: any) => {
            reportWebVital({ name: 'FID', value: entry.processingStart - entry.startTime })
          })
        })
        fidObserver.observe({ type: 'first-input', buffered: true })

        // CLS
        let clsValue = 0
        let clsEntries: any[] = []
        const clsObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries() as any[]) {
            if (!entry.hadRecentInput) {
              const firstSessionEntry = clsEntries[0]
              const lastSessionEntry = clsEntries[clsEntries.length - 1]
              
              if (firstSessionEntry && entry.startTime - lastSessionEntry.startTime < 1000 && 
                  entry.startTime - firstSessionEntry.startTime < 5000) {
                clsValue += entry.value
                clsEntries.push(entry)
              } else {
                clsValue = entry.value
                clsEntries = [entry]
              }
              
              reportWebVital({ name: 'CLS', value: clsValue * 1000 })
            }
          }
        })
        clsObserver.observe({ type: 'layout-shift', buffered: true })
      } catch (error) {
        console.error('Failed to observe performance metrics:', error)
      }
    }
  }, [])
}

// Declare global types
declare global {
  interface Window {
    dataLayer: any[]
    gtag: (...args: any[]) => void
    mixpanel: any
    posthog: any
  }
}