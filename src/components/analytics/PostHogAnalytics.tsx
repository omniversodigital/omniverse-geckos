'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import posthog from 'posthog-js'
import { PostHogProvider } from 'posthog-js/react'

interface PostHogAnalyticsProps {
  children: React.ReactNode
}

// Initialize PostHog
if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
    loaded: (posthog) => {
      if (process.env.NODE_ENV === 'development') {
        console.log('[PostHog] Analytics initialized')
      }
    },
    // Enhanced Web3 and gaming tracking
    autocapture: {
      dom_event_allowlist: [
        'click', 
        'submit', 
        'change', 
        'input'
      ],
      url_allowlist: [
        'omniversegeckos.com',
        'localhost:3000'
      ]
    },
    // Capture additional properties
    property_blacklist: [], // We want all properties for now
    // Session recording (be mindful of privacy)
    session_recording: {
      enabled: true,
      maskAllInputs: true,
      maskInputOptions: {
        password: true,
        email: true
      }
    },
    // Feature flags
    bootstrap: {
      featureFlags: {}
    },
    // Privacy settings
    opt_out_capturing_by_default: false,
    respect_dnt: true,
    // Advanced settings for dApp
    xhr_headers: {
      'X-App-Type': 'web3-dapp'
    }
  })
}

export function PostHogAnalytics({ children }: PostHogAnalyticsProps) {
  const pathname = usePathname()

  useEffect(() => {
    if (typeof window !== 'undefined' && posthog) {
      // Track page views
      posthog.capture('$pageview', {
        $current_url: window.location.href,
        page_path: pathname,
        app_type: 'web3_gaming_dapp',
        app_name: 'omniverse_geckos'
      })
    }
  }, [pathname])

  // Don't render PostHogProvider if no key
  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    return <>{children}</>
  }

  return <PostHogProvider client={posthog}>{children}</PostHogProvider>
}

// PostHog tracking utilities
export const trackPostHogEvent = (eventName: string, properties?: Record<string, any>) => {
  if (typeof window !== 'undefined' && posthog) {
    posthog.capture(eventName, {
      ...properties,
      timestamp: new Date().toISOString(),
      app_type: 'web3_gaming_dapp'
    })
  }
}

export const identifyPostHogUser = (userId: string, properties?: Record<string, any>) => {
  if (typeof window !== 'undefined' && posthog) {
    posthog.identify(userId, {
      ...properties,
      app_type: 'web3_gaming_dapp',
      platform: 'web',
      identified_at: new Date().toISOString()
    })
  }
}

export const setPostHogUserProperties = (properties: Record<string, any>) => {
  if (typeof window !== 'undefined' && posthog) {
    posthog.people.set(properties)
  }
}

// Web3-specific PostHog tracking
export const trackWeb3PostHogEvent = (eventName: string, web3Data?: Record<string, any>) => {
  trackPostHogEvent(`web3_${eventName}`, {
    event_category: 'web3',
    ...web3Data
  })
}

// Game-specific PostHog tracking
export const trackGamePostHogEvent = (eventName: string, gameData?: Record<string, any>) => {
  trackPostHogEvent(`game_${eventName}`, {
    event_category: 'game',
    ...gameData
  })
}

// Investment tracking
export const trackInvestmentPostHogEvent = (action: string, data?: Record<string, any>) => {
  trackPostHogEvent('investment_action', {
    event_category: 'investment',
    action: action,
    ...data
  })
}

// Feature flag utilities
export const usePostHogFeatureFlag = (flagKey: string) => {
  if (typeof window !== 'undefined' && posthog) {
    return posthog.isFeatureEnabled(flagKey)
  }
  return false
}

export const getPostHogFeatureFlags = () => {
  if (typeof window !== 'undefined' && posthog) {
    return posthog.getFeatureFlags()
  }
  return []
}

// A/B Testing utilities
export const getPostHogVariant = (flagKey: string) => {
  if (typeof window !== 'undefined' && posthog) {
    return posthog.getFeatureFlagPayload(flagKey)
  }
  return null
}

// Cohort utilities
export const addUserToCohort = (cohortName: string) => {
  if (typeof window !== 'undefined' && posthog) {
    posthog.people.set({
      cohort: cohortName,
      added_to_cohort_at: new Date().toISOString()
    })
  }
}

// Session replay control
export const startPostHogSessionRecording = () => {
  if (typeof window !== 'undefined' && posthog) {
    posthog.startSessionRecording()
  }
}

export const stopPostHogSessionRecording = () => {
  if (typeof window !== 'undefined' && posthog) {
    posthog.stopSessionRecording()
  }
}

// Revenue tracking
export const trackPostHogRevenue = (amount: number, currency = 'USD', properties?: Record<string, any>) => {
  trackPostHogEvent('revenue', {
    revenue: amount,
    currency: currency,
    ...properties
  })
}

// Funnel tracking
export const trackPostHogFunnelStep = (funnelName: string, step: number, stepName: string, properties?: Record<string, any>) => {
  trackPostHogEvent('funnel_step', {
    funnel_name: funnelName,
    funnel_step: step,
    step_name: stepName,
    ...properties
  })
}