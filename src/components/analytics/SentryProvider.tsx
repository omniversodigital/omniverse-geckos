'use client'

import { useEffect } from 'react'
import * as Sentry from '@sentry/nextjs'

interface SentryProviderProps {
  children: React.ReactNode
}

// Initialize Sentry if DSN is provided
if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    environment: process.env.NODE_ENV,
    
    // Set sample rates for performance monitoring
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    
    // Session replay for debugging (privacy-conscious)
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    
    // Enhanced error tracking for Web3 dApp
    beforeSend: (event) => {
      // Filter out non-critical errors
      if (event.exception) {
        const error = event.exception.values?.[0]
        if (error?.type === 'ChunkLoadError' || 
            error?.value?.includes('Non-Error promise rejection')) {
          return null
        }
      }
      
      // Add custom context for Web3 errors
      if (event.contexts) {
        event.contexts.app = {
          name: 'Omniverse Geckos',
          type: 'web3-gaming-dapp',
          version: process.env.npm_package_version || '1.0.0'
        }
      }
      
      return event
    },
    
    // Enhanced context tracking
    beforeBreadcrumb: (breadcrumb) => {
      // Filter out noisy breadcrumbs
      if (breadcrumb.category === 'console') {
        return null
      }
      
      // Enhance Web3 and game-related breadcrumbs
      if (breadcrumb.category === 'fetch' || breadcrumb.category === 'xhr') {
        if (breadcrumb.data?.url?.includes('rpc') || 
            breadcrumb.data?.url?.includes('eth_')) {
          breadcrumb.category = 'web3-rpc'
        }
      }
      
      return breadcrumb
    },
    
    // Custom tags for filtering
    initialScope: (scope) => {
      scope.setTag('app.type', 'web3-dapp')
      scope.setTag('app.name', 'omniverse-geckos')
      scope.setContext('app', {
        name: 'Omniverse Geckos',
        version: process.env.npm_package_version || '1.0.0',
        environment: process.env.NODE_ENV
      })
      return scope
    },
    
    // Integration configuration
    integrations: [
      new Sentry.BrowserTracing({
        // Performance monitoring for SPA routing
        routingInstrumentation: Sentry.reactRouterV6Instrumentation(
          // Will be used with React Router if needed
        )
      }),
      new Sentry.Replay({
        maskAllText: true,
        maskAllInputs: true,
        blockAllMedia: true
      })
    ]
  })
}

export function SentryProvider({ children }: SentryProviderProps) {
  useEffect(() => {
    // Set user context on mount
    if (typeof window !== 'undefined' && Sentry.getCurrentHub) {
      Sentry.setContext('device', {
        screen_resolution: `${window.screen.width}x${window.screen.height}`,
        viewport: `${window.innerWidth}x${window.innerHeight}`,
        user_agent: navigator.userAgent,
        language: navigator.language
      })
      
      // Detect if user is on mobile
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      Sentry.setTag('device.type', isMobile ? 'mobile' : 'desktop')
      
      // Add Web3 detection
      if ('ethereum' in window) {
        Sentry.setTag('web3.wallet', 'detected')
        Sentry.setContext('web3', {
          wallet_detected: true,
          provider: (window as any).ethereum?.isMetaMask ? 'MetaMask' : 'other'
        })
      } else {
        Sentry.setTag('web3.wallet', 'none')
        Sentry.setContext('web3', {
          wallet_detected: false
        })
      }
    }
  }, [])

  return <>{children}</>
}

// Enhanced error tracking utilities
export const captureWeb3Error = (error: Error, context?: Record<string, any>) => {
  Sentry.withScope(scope => {
    scope.setTag('error.type', 'web3')
    scope.setContext('web3_error', context)
    Sentry.captureException(error)
  })
}

export const captureGameError = (error: Error, gameState?: Record<string, any>) => {
  Sentry.withScope(scope => {
    scope.setTag('error.type', 'game')
    scope.setContext('game_state', gameState)
    Sentry.captureException(error)
  })
}

export const captureAPIError = (error: Error, endpoint: string, statusCode?: number) => {
  Sentry.withScope(scope => {
    scope.setTag('error.type', 'api')
    scope.setTag('api.endpoint', endpoint)
    if (statusCode) scope.setTag('api.status_code', statusCode)
    Sentry.captureException(error)
  })
}

export const captureUserAction = (action: string, data?: Record<string, any>) => {
  Sentry.addBreadcrumb({
    message: action,
    category: 'user-action',
    data: data,
    level: 'info'
  })
}

export const setUserContext = (userId: string, properties?: Record<string, any>) => {
  Sentry.setUser({
    id: userId,
    ...properties
  })
}

export const clearUserContext = () => {
  Sentry.setUser(null)
}

// Performance monitoring utilities
export const startTransaction = (name: string, operation: string) => {
  return Sentry.startTransaction({
    name,
    op: operation,
    tags: {
      'app.component': name
    }
  })
}

export const measureFunction = async <T,>(
  name: string,
  fn: () => Promise<T>,
  context?: Record<string, any>
): Promise<T> => {
  const transaction = startTransaction(name, 'function')
  
  try {
    if (context) {
      transaction.setContext('function_context', context)
    }
    
    const result = await fn()
    transaction.setStatus('ok')
    return result
  } catch (error) {
    transaction.setStatus('internal_error')
    throw error
  } finally {
    transaction.finish()
  }
}

// Feature flag integration with Sentry
export const setSentryFeatureFlag = (flagName: string, value: boolean | string) => {
  Sentry.setTag(`feature.${flagName}`, value)
}