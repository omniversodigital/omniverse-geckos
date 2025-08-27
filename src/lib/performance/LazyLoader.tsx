'use client'

import { lazy, Suspense, ComponentType, ReactNode } from 'react'
import { ErrorBoundary } from 'react-error-boundary'

// =============================================================================
// Loading Components
// =============================================================================

export function LoadingSpinner({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="flex items-center space-x-3">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
        <span className="text-gray-400">{message}</span>
      </div>
    </div>
  )
}

export function LoadingSkeleton({ lines = 3, height = 'h-4' }: { lines?: number; height?: string }) {
  return (
    <div className="animate-pulse p-4">
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className={`bg-gray-700 rounded ${height} mb-3`}></div>
      ))}
    </div>
  )
}

export function ErrorFallback({ 
  error, 
  resetErrorBoundary 
}: { 
  error: Error
  resetErrorBoundary: () => void 
}) {
  return (
    <div className="p-6 bg-red-900/20 border border-red-500/30 rounded-lg text-center">
      <h3 className="text-lg font-semibold text-red-400 mb-2">
        Something went wrong
      </h3>
      <p className="text-gray-400 mb-4">{error.message}</p>
      <button
        onClick={resetErrorBoundary}
        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
      >
        Try again
      </button>
    </div>
  )
}

// =============================================================================
// Lazy Loading Wrapper
// =============================================================================

interface LazyWrapperProps {
  children: ReactNode
  fallback?: ReactNode
  errorFallback?: ComponentType<{ error: Error; resetErrorBoundary: () => void }>
}

export function LazyWrapper({ 
  children, 
  fallback = <LoadingSpinner />,
  errorFallback = ErrorFallback
}: LazyWrapperProps) {
  return (
    <ErrorBoundary
      FallbackComponent={errorFallback}
      onReset={() => window.location.reload()}
    >
      <Suspense fallback={fallback}>
        {children}
      </Suspense>
    </ErrorBoundary>
  )
}

// =============================================================================
// Dynamic Imports with Loading States
// =============================================================================

// Game Components
export const GameEngine = lazy(() => 
  import('@/src/game/components/GameEngine').then(module => ({
    default: module.GameEngine
  }))
)

export const GameDashboard = lazy(() => 
  import('@/src/game/components/GameDashboard').then(module => ({
    default: module.GameDashboard
  }))
)

// Marketplace Components
export const NFTMarketplace = lazy(() => 
  import('@/src/components/marketplace/NFTMarketplace').then(module => ({
    default: module.NFTMarketplace
  }))
)

export const TradingInterface = lazy(() => 
  import('@/src/components/marketplace/TradingInterface').then(module => ({
    default: module.TradingInterface
  }))
)

// AI Components
export const AIAssistant = lazy(() => 
  import('@/src/components/ai/AIAssistant').then(module => ({
    default: module.AIAssistant
  }))
)

export const AIAnalytics = lazy(() => 
  import('@/src/components/ai/AIAnalytics').then(module => ({
    default: module.AIAnalytics
  }))
)

// Wallet Components
export const WalletConnect = lazy(() => 
  import('@/src/components/wallet/WalletConnect').then(module => ({
    default: module.WalletConnect
  }))
)

export const TransactionHistory = lazy(() => 
  import('@/src/components/wallet/TransactionHistory').then(module => ({
    default: module.TransactionHistory
  }))
)

// Analytics Components
export const AnalyticsDashboard = lazy(() => 
  import('@/src/components/analytics/AnalyticsDashboard').then(module => ({
    default: module.AnalyticsDashboard
  }))
)

// =============================================================================
// Route-based Lazy Components
// =============================================================================

export const GamePage = lazy(() => 
  import('@/src/app/game/page').then(module => ({
    default: module.default
  }))
)

export const MarketplacePage = lazy(() => 
  import('@/src/app/marketplace/page').then(module => ({
    default: module.default
  }))
)

export const EarlyAccessPage = lazy(() => 
  import('@/src/app/early-access/page').then(module => ({
    default: module.default
  }))
)

export const AnalyticsPage = lazy(() => 
  import('@/src/app/analytics/page').then(module => ({
    default: module.default
  }))
)

// =============================================================================
// Preloading Utilities
// =============================================================================

class ComponentPreloader {
  private static preloadedComponents = new Set<string>()
  
  static preload(componentName: keyof typeof preloadMap) {
    if (this.preloadedComponents.has(componentName)) return
    
    const importFunction = preloadMap[componentName]
    if (importFunction) {
      importFunction().catch(console.error)
      this.preloadedComponents.add(componentName)
    }
  }
  
  static preloadMultiple(components: (keyof typeof preloadMap)[]) {
    components.forEach(component => this.preload(component))
  }
  
  static preloadOnIdle(components: (keyof typeof preloadMap)[]) {
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(() => {
        this.preloadMultiple(components)
      })
    } else {
      // Fallback for browsers without requestIdleCallback
      setTimeout(() => {
        this.preloadMultiple(components)
      }, 1000)
    }
  }
}

const preloadMap = {
  game: () => import('@/src/app/game/page'),
  marketplace: () => import('@/src/app/marketplace/page'),
  analytics: () => import('@/src/app/analytics/page'),
  earlyAccess: () => import('@/src/app/early-access/page'),
  gameEngine: () => import('@/src/game/components/GameEngine'),
  nftMarketplace: () => import('@/src/components/marketplace/NFTMarketplace'),
  aiAssistant: () => import('@/src/components/ai/AIAssistant'),
  walletConnect: () => import('@/src/components/wallet/WalletConnect')
}

// =============================================================================
// Hook for Preloading
// =============================================================================

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export function usePreloadComponents() {
  const router = useRouter()
  
  useEffect(() => {
    // Preload critical components on idle
    ComponentPreloader.preloadOnIdle([
      'gameEngine',
      'nftMarketplace',
      'aiAssistant'
    ])
    
    // Preload likely next pages based on current route
    const currentPath = window.location.pathname
    
    if (currentPath === '/') {
      ComponentPreloader.preloadOnIdle(['game', 'marketplace'])
    } else if (currentPath.startsWith('/game')) {
      ComponentPreloader.preloadOnIdle(['marketplace', 'analytics'])
    } else if (currentPath.startsWith('/marketplace')) {
      ComponentPreloader.preloadOnIdle(['game'])
    }
  }, [])
  
  return {
    preloadComponent: ComponentPreloader.preload,
    preloadMultiple: ComponentPreloader.preloadMultiple
  }
}

// =============================================================================
// Image Optimization Wrapper
// =============================================================================

import Image from 'next/image'
import { useState } from 'react'

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
  placeholder?: 'blur' | 'empty'
  blurDataURL?: string
  onLoad?: () => void
  onError?: () => void
}

export function OptimizedImage({
  src,
  alt,
  width = 400,
  height = 400,
  className = '',
  priority = false,
  placeholder = 'blur',
  blurDataURL,
  onLoad,
  onError
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  
  // Generate blur data URL if not provided
  const defaultBlurDataURL = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k='
  
  return (
    <div className={`relative ${className}`}>
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        placeholder={placeholder}
        blurDataURL={blurDataURL || defaultBlurDataURL}
        className={`transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}
        onLoad={() => {
          setIsLoading(false)
          onLoad?.()
        }}
        onError={() => {
          setHasError(true)
          setIsLoading(false)
          onError?.()
        }}
        style={{
          maxWidth: '100%',
          height: 'auto'
        }}
      />
      
      {isLoading && (
        <div className="absolute inset-0 bg-gray-800 animate-pulse rounded" />
      )}
      
      {hasError && (
        <div className="absolute inset-0 bg-gray-800 rounded flex items-center justify-center">
          <span className="text-gray-400 text-sm">Image unavailable</span>
        </div>
      )}
    </div>
  )
}

// =============================================================================
// Virtual List Component for Large NFT Collections
// =============================================================================

import { useMemo, useState, useEffect, useRef } from 'react'

interface VirtualListProps<T> {
  items: T[]
  itemHeight: number
  containerHeight: number
  renderItem: (item: T, index: number) => ReactNode
  overscan?: number
}

export function VirtualList<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  overscan = 5
}: VirtualListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0)
  const scrollElementRef = useRef<HTMLDivElement>(null)
  
  const visibleItems = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
    const endIndex = Math.min(
      items.length - 1,
      Math.floor((scrollTop + containerHeight) / itemHeight) + overscan
    )
    
    return {
      startIndex,
      endIndex,
      items: items.slice(startIndex, endIndex + 1)
    }
  }, [items, itemHeight, containerHeight, scrollTop, overscan])
  
  const totalHeight = items.length * itemHeight
  
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop)
  }
  
  return (
    <div
      ref={scrollElementRef}
      style={{ height: containerHeight }}
      className="overflow-auto"
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div
          style={{
            transform: `translateY(${visibleItems.startIndex * itemHeight}px)`
          }}
        >
          {visibleItems.items.map((item, index) =>
            renderItem(item, visibleItems.startIndex + index)
          )}
        </div>
      </div>
    </div>
  )
}

// =============================================================================
// Export preloader for external use
// =============================================================================

export { ComponentPreloader }