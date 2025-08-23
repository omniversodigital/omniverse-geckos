'use client'

import { ReactNode, useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { WagmiProvider } from 'wagmi'
import { RainbowKitProvider, getDefaultConfig, darkTheme, lightTheme } from '@rainbow-me/rainbowkit'
import { mainnet, sepolia, hardhat } from 'wagmi/chains'
import { ThemeProvider } from 'next-themes'
import { Toaster } from 'sonner'
import { config } from '@/blockchain/hooks/useWeb3'
import { GameProvider } from './GameProvider'
import { Web3Provider } from './Web3Provider'
import { AnalyticsProvider } from './AnalyticsProvider'
import { AIProvider } from '@/ai/hooks/useAI'
import '@rainbow-me/rainbowkit/styles.css'

// =============================================================================
// Types
// =============================================================================

interface ProvidersProps {
  children: ReactNode
}

// =============================================================================
// React Query Client
// =============================================================================

const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
        gcTime: 10 * 60 * 1000, // 10 minutes
        retry: (failureCount, error: any) => {
          // Don't retry if it's a user rejection or network switch
          if (error?.code === 4001 || error?.code === 4902) {
            return false
          }
          return failureCount < 3
        },
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      },
      mutations: {
        retry: (failureCount, error: any) => {
          // Don't retry user rejections
          if (error?.code === 4001) {
            return false
          }
          return failureCount < 1
        },
      },
    },
  })

// =============================================================================
// RainbowKit Configuration
// =============================================================================

const rainbowKitConfig = getDefaultConfig({
  appName: 'Omniverse Geckos',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
  chains: [mainnet, sepolia, hardhat],
  ssr: true,
})

// Custom theme configuration
const customLightTheme = lightTheme({
  accentColor: '#22c55e',
  accentColorForeground: 'white',
  borderRadius: 'medium',
  fontStack: 'system',
  overlayBlur: 'small',
})

const customDarkTheme = darkTheme({
  accentColor: '#22c55e',
  accentColorForeground: 'white',
  borderRadius: 'medium',
  fontStack: 'system',
  overlayBlur: 'small',
})

// =============================================================================
// Main Providers Component
// =============================================================================

export function Providers({ children }: ProvidersProps) {
  const [queryClient] = useState(() => createQueryClient())

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange={false}
      themes={['light', 'dark']}
      storageKey="omniverse-geckos-theme"
    >
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={config}>
          <RainbowKitProvider
            chains={config.chains}
            theme={{
              lightMode: customLightTheme,
              darkMode: customDarkTheme,
            }}
            modalSize="compact"
            showRecentTransactions={true}
            coolMode={true}
            avatar={() => '🦎'}
          >
            <AnalyticsProvider>
              <Web3Provider>
                <AIProvider>
                  <GameProvider>
                    {children}
                  
                  {/* Development Tools */}
                  {process.env.NODE_ENV === 'development' && (
                    <ReactQueryDevtools 
                      initialIsOpen={false} 
                      position="bottom-right"
                      buttonPosition="bottom-right"
                    />
                  )}
                  
                  {/* Global Toast Container */}
                  <Toaster
                    position="top-right"
                    expand={false}
                    richColors
                    closeButton
                    toastOptions={{
                      duration: 4000,
                      style: {
                        background: 'hsl(var(--background))',
                        color: 'hsl(var(--foreground))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '0.75rem',
                        fontSize: '0.875rem',
                        padding: '12px 16px',
                      },
                      className: 'sonner-toast',
                    }}
                  />
                  </GameProvider>
                </AIProvider>
              </Web3Provider>
            </AnalyticsProvider>
          </RainbowKitProvider>
        </WagmiProvider>
      </QueryClientProvider>
    </ThemeProvider>
  )
}

// =============================================================================
// Performance Monitoring Component
// =============================================================================

export function PerformanceMonitor() {
  if (typeof window === 'undefined') return null

  // Monitor Core Web Vitals
  if ('web-vitals' in window) {
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      const handleMetric = (metric: any) => {
        // Send to analytics
        if (typeof window !== 'undefined' && 'gtag' in window) {
          ;(window as any).gtag('event', metric.name, {
            value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
            event_category: 'Web Vitals',
            event_label: metric.id,
            non_interaction: true,
          })
        }

        // Send to PostHog
        if (typeof window !== 'undefined' && 'posthog' in window) {
          ;(window as any).posthog?.capture('web_vital', {
            metric_name: metric.name,
            value: metric.value,
            rating: metric.rating,
          })
        }

        // Log in development
        if (process.env.NODE_ENV === 'development') {
          console.log(`[Web Vitals] ${metric.name}:`, metric.value, metric.rating)
        }
      }

      getCLS(handleMetric)
      getFID(handleMetric)
      getFCP(handleMetric)
      getLCP(handleMetric)
      getTTFB(handleMetric)
    }).catch(() => {
      // Web Vitals not available
    })
  }

  // Monitor long tasks
  if ('PerformanceObserver' in window) {
    try {
      const longTaskObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration > 50) { // Tasks longer than 50ms
            console.warn('[Performance] Long task detected:', entry.duration + 'ms')
            
            // Send to analytics
            if (typeof window !== 'undefined' && 'posthog' in window) {
              ;(window as any).posthog?.capture('long_task', {
                duration: entry.duration,
                start_time: entry.startTime,
              })
            }
          }
        }
      })
      longTaskObserver.observe({ entryTypes: ['longtask'] })
    } catch (error) {
      // PerformanceObserver not supported
    }
  }

  return null
}

// =============================================================================
// Error Boundary
// =============================================================================

import React from 'react'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: React.ErrorInfo
}

export class ErrorBoundary extends React.Component<
  { children: ReactNode; fallback?: ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: ReactNode; fallback?: ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ error, errorInfo })
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('[Error Boundary] Error caught:', error)
      console.error('[Error Boundary] Error info:', errorInfo)
    }

    // Send to error tracking service
    if (typeof window !== 'undefined') {
      // Sentry
      if ('Sentry' in window) {
        ;(window as any).Sentry?.captureException(error, {
          contexts: {
            react: {
              componentStack: errorInfo.componentStack,
            },
          },
        })
      }

      // PostHog
      if ('posthog' in window) {
        ;(window as any).posthog?.capture('error_boundary_triggered', {
          error_message: error.message,
          error_stack: error.stack,
          component_stack: errorInfo.componentStack,
        })
      }
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center space-y-4 p-8 max-w-md">
            <div className="text-6xl">🦎💥</div>
            <h2 className="text-2xl font-bold">Oops! Something went wrong</h2>
            <p className="text-muted-foreground">
              Our Geckos are working to fix this issue. Please refresh the page or try again later.
            </p>
            <div className="space-x-4">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                Refresh Page
              </button>
              <button
                onClick={() => this.setState({ hasError: false })}
                className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors"
              >
                Try Again
              </button>
            </div>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-4 text-left">
                <summary className="cursor-pointer text-sm font-medium">
                  Error Details (Development)
                </summary>
                <pre className="mt-2 p-4 bg-muted rounded text-xs overflow-auto max-h-40">
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// =============================================================================
// Root Provider with Error Boundary
// =============================================================================

export function RootProvider({ children }: ProvidersProps) {
  return (
    <ErrorBoundary>
      <Providers>
        {children}
        <PerformanceMonitor />
      </Providers>
    </ErrorBoundary>
  )
}