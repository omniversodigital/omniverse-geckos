'use client'

import { createContext, useContext, useEffect, ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { useAccount } from 'wagmi'

// =============================================================================
// Types
// =============================================================================

interface AnalyticsContextType {
  trackEvent: (eventName: string, properties?: Record<string, any>) => void
  trackPage: (pageName: string, properties?: Record<string, any>) => void
  trackUser: (userId: string, properties?: Record<string, any>) => void
  trackError: (error: Error, context?: Record<string, any>) => void
  trackGameEvent: (eventName: string, gameData?: Record<string, any>) => void
  trackWeb3Event: (eventName: string, web3Data?: Record<string, any>) => void
}

interface AnalyticsProviderProps {
  children: ReactNode
}

// =============================================================================
// Context
// =============================================================================

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined)

// =============================================================================
// Analytics Provider Component
// =============================================================================

export function AnalyticsProvider({ children }: AnalyticsProviderProps) {
  const pathname = usePathname()
  const { address, isConnected } = useAccount()

  // Track page views
  useEffect(() => {
    trackPage(pathname)
  }, [pathname])

  // Track wallet connection
  useEffect(() => {
    if (isConnected && address) {
      trackWeb3Event('wallet_connected', {
        address: address.slice(0, 6) + '...' + address.slice(-4), // Anonymized
        timestamp: new Date().toISOString()
      })
      
      trackUser(address, {
        wallet_address: address.slice(0, 6) + '...' + address.slice(-4),
        connected_at: new Date().toISOString()
      })
    } else if (!isConnected) {
      trackWeb3Event('wallet_disconnected', {
        timestamp: new Date().toISOString()
      })
    }
  }, [isConnected, address])

  // =============================================================================
  // Analytics Functions
  // =============================================================================

  const trackEvent = (eventName: string, properties: Record<string, any> = {}) => {
    const eventData = {
      event: eventName,
      properties: {
        ...properties,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        user_agent: navigator.userAgent,
        screen_resolution: `${window.screen.width}x${window.screen.height}`,
        wallet_connected: isConnected,
        ...(address && { wallet_address: address.slice(0, 6) + '...' + address.slice(-4) })
      }
    }

    // Send to PostHog
    if (typeof window !== 'undefined' && 'posthog' in window) {
      ;(window as any).posthog?.capture(eventName, eventData.properties)
    }

    // Send to Google Analytics
    if (typeof window !== 'undefined' && 'gtag' in window) {
      ;(window as any).gtag('event', eventName, eventData.properties)
    }

    // Console log in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[Analytics] Event:', eventData)
    }
  }

  const trackPage = (pageName: string, properties: Record<string, any> = {}) => {
    const pageData = {
      page: pageName,
      properties: {
        ...properties,
        timestamp: new Date().toISOString(),
        referrer: document.referrer,
        wallet_connected: isConnected,
        ...(address && { wallet_address: address.slice(0, 6) + '...' + address.slice(-4) })
      }
    }

    // Send to PostHog
    if (typeof window !== 'undefined' && 'posthog' in window) {
      ;(window as any).posthog?.capture('$pageview', {
        $current_url: window.location.href,
        ...pageData.properties
      })
    }

    // Send to Google Analytics
    if (typeof window !== 'undefined' && 'gtag' in window) {
      ;(window as any).gtag('config', process.env.NEXT_PUBLIC_GA_TRACKING_ID, {
        page_path: pageName,
        custom_map: pageData.properties
      })
    }

    // Console log in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[Analytics] Page View:', pageData)
    }
  }

  const trackUser = (userId: string, properties: Record<string, any> = {}) => {
    const userData = {
      user_id: userId,
      properties: {
        ...properties,
        timestamp: new Date().toISOString(),
        first_seen: new Date().toISOString()
      }
    }

    // Send to PostHog
    if (typeof window !== 'undefined' && 'posthog' in window) {
      ;(window as any).posthog?.identify(userId, userData.properties)
    }

    // Send to Google Analytics
    if (typeof window !== 'undefined' && 'gtag' in window) {
      ;(window as any).gtag('config', process.env.NEXT_PUBLIC_GA_TRACKING_ID, {
        user_id: userId,
        custom_map: userData.properties
      })
    }

    // Console log in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[Analytics] User Identified:', userData)
    }
  }

  const trackError = (error: Error, context: Record<string, any> = {}) => {
    const errorData = {
      error_name: error.name,
      error_message: error.message,
      error_stack: error.stack,
      context: {
        ...context,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        wallet_connected: isConnected,
        ...(address && { wallet_address: address.slice(0, 6) + '...' + address.slice(-4) })
      }
    }

    // Send to PostHog
    if (typeof window !== 'undefined' && 'posthog' in window) {
      ;(window as any).posthog?.capture('error_occurred', errorData)
    }

    // Send to Sentry if available
    if (typeof window !== 'undefined' && 'Sentry' in window) {
      ;(window as any).Sentry?.captureException(error, {
        contexts: { additional_context: errorData.context }
      })
    }

    // Console log in development
    if (process.env.NODE_ENV === 'development') {
      console.error('[Analytics] Error:', errorData)
    }
  }

  const trackGameEvent = (eventName: string, gameData: Record<string, any> = {}) => {
    trackEvent(`game_${eventName}`, {
      category: 'game',
      ...gameData
    })
  }

  const trackWeb3Event = (eventName: string, web3Data: Record<string, any> = {}) => {
    trackEvent(`web3_${eventName}`, {
      category: 'web3',
      ...web3Data
    })
  }

  const contextValue: AnalyticsContextType = {
    trackEvent,
    trackPage,
    trackUser,
    trackError,
    trackGameEvent,
    trackWeb3Event
  }

  return (
    <AnalyticsContext.Provider value={contextValue}>
      {children}
    </AnalyticsContext.Provider>
  )
}

// =============================================================================
// Hook
// =============================================================================

export function useAnalytics(): AnalyticsContextType {
  const context = useContext(AnalyticsContext)
  if (!context) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider')
  }
  return context
}

// =============================================================================
// Game Analytics Hook
// =============================================================================

export function useGameAnalytics() {
  const { trackGameEvent, trackEvent } = useAnalytics()

  const trackGameStart = (gameMode?: string) => {
    trackGameEvent('start', { game_mode: gameMode })
  }

  const trackGameEnd = (result: 'win' | 'lose', score?: number, duration?: number) => {
    trackGameEvent('end', { result, score, duration })
  }

  const trackLevelComplete = (level: number, score: number, stars?: number) => {
    trackGameEvent('level_complete', { level, score, stars })
  }

  const trackItemPurchase = (itemType: string, itemId: string, price: number, currency: string) => {
    trackGameEvent('item_purchase', { item_type: itemType, item_id: itemId, price, currency })
  }

  const trackNFTMint = (nftType: string, rarity: string, cost: number) => {
    trackGameEvent('nft_mint', { nft_type: nftType, rarity, cost })
  }

  return {
    trackGameStart,
    trackGameEnd,
    trackLevelComplete,
    trackItemPurchase,
    trackNFTMint,
    trackGameEvent
  }
}

// =============================================================================
// Web3 Analytics Hook
// =============================================================================

export function useWeb3Analytics() {
  const { trackWeb3Event } = useAnalytics()

  const trackTransaction = (type: 'send' | 'receive', amount: string, token: string, txHash?: string) => {
    trackWeb3Event('transaction', { type, amount, token, tx_hash: txHash })
  }

  const trackContractInteraction = (contractName: string, method: string, success: boolean) => {
    trackWeb3Event('contract_interaction', { contract_name: contractName, method, success })
  }

  const trackMarketplaceActivity = (action: 'list' | 'buy' | 'sell' | 'bid', nftId?: string, price?: string) => {
    trackWeb3Event('marketplace_activity', { action, nft_id: nftId, price })
  }

  return {
    trackTransaction,
    trackContractInteraction,
    trackMarketplaceActivity,
    trackWeb3Event
  }
}

// =============================================================================
// Error Tracking Hook
// =============================================================================

export function useErrorTracking() {
  const { trackError } = useAnalytics()

  const trackFormError = (formName: string, error: Error, fieldName?: string) => {
    trackError(error, { form_name: formName, field_name: fieldName })
  }

  const trackAPIError = (endpoint: string, error: Error, statusCode?: number) => {
    trackError(error, { endpoint, status_code: statusCode })
  }

  const trackWeb3Error = (operation: string, error: Error, contractAddress?: string) => {
    trackError(error, { operation, contract_address: contractAddress })
  }

  return {
    trackError,
    trackFormError,
    trackAPIError,
    trackWeb3Error
  }
}