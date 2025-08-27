'use client'

// =============================================================================
// Cache Manager for Performance Optimization
// =============================================================================

export interface CacheEntry<T = any> {
  data: T
  timestamp: number
  ttl: number
  key: string
  version: number
}

export interface CacheConfig {
  maxSize: number
  defaultTTL: number
  version: number
  persistent: boolean
}

class CacheManager {
  private cache = new Map<string, CacheEntry>()
  private config: CacheConfig
  private persistentKeys = new Set<string>()
  
  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      maxSize: 100,
      defaultTTL: 5 * 60 * 1000, // 5 minutes
      version: 1,
      persistent: true,
      ...config
    }
    
    // Load persistent cache from localStorage
    if (this.config.persistent && typeof window !== 'undefined') {
      this.loadPersistentCache()
    }
    
    // Cleanup expired entries every minute
    setInterval(() => this.cleanup(), 60000)
  }
  
  // =============================================================================
  // Core Cache Operations
  // =============================================================================
  
  set<T>(
    key: string, 
    data: T, 
    ttl: number = this.config.defaultTTL,
    persistent: boolean = false
  ): void {
    // Remove oldest entry if cache is full
    if (this.cache.size >= this.config.maxSize) {
      this.evictOldest()
    }
    
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl,
      key,
      version: this.config.version
    }
    
    this.cache.set(key, entry)
    
    if (persistent) {
      this.persistentKeys.add(key)
      this.savePersistentEntry(key, entry)
    }
  }
  
  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    
    if (!entry) return null
    
    // Check if expired
    if (this.isExpired(entry)) {
      this.delete(key)
      return null
    }
    
    return entry.data as T
  }
  
  has(key: string): boolean {
    const entry = this.cache.get(key)
    return entry !== undefined && !this.isExpired(entry)
  }
  
  delete(key: string): boolean {
    const deleted = this.cache.delete(key)
    
    if (this.persistentKeys.has(key)) {
      this.persistentKeys.delete(key)
      this.removePersistentEntry(key)
    }
    
    return deleted
  }
  
  clear(): void {
    this.cache.clear()
    this.persistentKeys.clear()
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem('gecko-cache')
    }
  }
  
  // =============================================================================
  // Advanced Cache Operations
  // =============================================================================
  
  getOrSet<T>(
    key: string,
    factory: () => T | Promise<T>,
    ttl: number = this.config.defaultTTL,
    persistent: boolean = false
  ): T | Promise<T> {
    const cached = this.get<T>(key)
    
    if (cached !== null) {
      return cached
    }
    
    const value = factory()
    
    // Handle async factory
    if (value instanceof Promise) {
      return value.then(result => {
        this.set(key, result, ttl, persistent)
        return result
      })
    }
    
    this.set(key, value, ttl, persistent)
    return value
  }
  
  invalidatePattern(pattern: RegExp): number {
    let count = 0
    
    for (const key of this.cache.keys()) {
      if (pattern.test(key)) {
        this.delete(key)
        count++
      }
    }
    
    return count
  }
  
  refresh<T>(key: string, factory: () => T | Promise<T>): T | Promise<T> {
    this.delete(key)
    const entry = this.cache.get(key)
    const ttl = entry?.ttl || this.config.defaultTTL
    const persistent = this.persistentKeys.has(key)
    
    return this.getOrSet(key, factory, ttl, persistent)
  }
  
  // =============================================================================
  // Utility Methods
  // =============================================================================
  
  size(): number {
    return this.cache.size
  }
  
  keys(): string[] {
    return Array.from(this.cache.keys())
  }
  
  stats(): {
    size: number
    maxSize: number
    persistent: number
    expired: number
    memoryUsage: number
  } {
    const expired = Array.from(this.cache.values()).filter(entry => 
      this.isExpired(entry)
    ).length
    
    const memoryUsage = this.estimateMemoryUsage()
    
    return {
      size: this.cache.size,
      maxSize: this.config.maxSize,
      persistent: this.persistentKeys.size,
      expired,
      memoryUsage
    }
  }
  
  // =============================================================================
  // Private Methods
  // =============================================================================
  
  private isExpired(entry: CacheEntry): boolean {
    return Date.now() - entry.timestamp > entry.ttl
  }
  
  private evictOldest(): void {
    let oldest: string | null = null
    let oldestTime = Date.now()
    
    for (const [key, entry] of this.cache.entries()) {
      if (entry.timestamp < oldestTime && !this.persistentKeys.has(key)) {
        oldest = key
        oldestTime = entry.timestamp
      }
    }
    
    if (oldest) {
      this.delete(oldest)
    }
  }
  
  private cleanup(): void {
    for (const [key, entry] of this.cache.entries()) {
      if (this.isExpired(entry)) {
        this.delete(key)
      }
    }
  }
  
  private loadPersistentCache(): void {
    try {
      const stored = localStorage.getItem('gecko-cache')
      if (!stored) return
      
      const data = JSON.parse(stored)
      
      // Version check
      if (data.version !== this.config.version) {
        localStorage.removeItem('gecko-cache')
        return
      }
      
      for (const [key, entry] of Object.entries(data.cache)) {
        this.cache.set(key, entry as CacheEntry)
        this.persistentKeys.add(key)
      }
    } catch (error) {
      console.error('Failed to load persistent cache:', error)
    }
  }
  
  private savePersistentEntry(key: string, entry: CacheEntry): void {
    if (typeof window === 'undefined') return
    
    try {
      const stored = localStorage.getItem('gecko-cache')
      const data = stored ? JSON.parse(stored) : { version: this.config.version, cache: {} }
      
      data.cache[key] = entry
      localStorage.setItem('gecko-cache', JSON.stringify(data))
    } catch (error) {
      console.error('Failed to save persistent cache entry:', error)
    }
  }
  
  private removePersistentEntry(key: string): void {
    if (typeof window === 'undefined') return
    
    try {
      const stored = localStorage.getItem('gecko-cache')
      if (!stored) return
      
      const data = JSON.parse(stored)
      delete data.cache[key]
      
      localStorage.setItem('gecko-cache', JSON.stringify(data))
    } catch (error) {
      console.error('Failed to remove persistent cache entry:', error)
    }
  }
  
  private estimateMemoryUsage(): number {
    let size = 0
    
    for (const entry of this.cache.values()) {
      size += JSON.stringify(entry).length * 2 // Rough estimate (2 bytes per char)
    }
    
    return size
  }
}

// =============================================================================
// Specialized Cache Instances
// =============================================================================

// General application cache
export const appCache = new CacheManager({
  maxSize: 200,
  defaultTTL: 10 * 60 * 1000, // 10 minutes
  version: 1,
  persistent: true
})

// NFT metadata cache with longer TTL
export const nftCache = new CacheManager({
  maxSize: 500,
  defaultTTL: 60 * 60 * 1000, // 1 hour
  version: 1,
  persistent: true
})

// API response cache
export const apiCache = new CacheManager({
  maxSize: 100,
  defaultTTL: 5 * 60 * 1000, // 5 minutes
  version: 1,
  persistent: false
})

// Game state cache
export const gameCache = new CacheManager({
  maxSize: 50,
  defaultTTL: 30 * 60 * 1000, // 30 minutes
  version: 1,
  persistent: true
})

// =============================================================================
// Cache Keys
// =============================================================================

export const CacheKeys = {
  // User data
  USER_PROFILE: (address: string) => `user:profile:${address}`,
  USER_NFTS: (address: string) => `user:nfts:${address}`,
  USER_BALANCE: (address: string) => `user:balance:${address}`,
  
  // NFT data
  NFT_METADATA: (tokenId: string) => `nft:metadata:${tokenId}`,
  NFT_TRAITS: (tokenId: string) => `nft:traits:${tokenId}`,
  NFT_IMAGE: (tokenId: string) => `nft:image:${tokenId}`,
  
  // Market data
  MARKET_LISTINGS: 'market:listings',
  MARKET_STATS: 'market:stats',
  MARKET_PRICES: 'market:prices',
  
  // Game data
  GAME_CONFIG: 'game:config',
  GAME_LEADERBOARD: 'game:leaderboard',
  GAME_ACHIEVEMENTS: (address: string) => `game:achievements:${address}`,
  
  // AI data
  AI_RECOMMENDATIONS: (address: string) => `ai:recommendations:${address}`,
  AI_INSIGHTS: (address: string) => `ai:insights:${address}`,
  
  // Network data
  NETWORK_GAS_PRICES: 'network:gas',
  NETWORK_STATUS: 'network:status',
  
  // Analytics
  ANALYTICS_METRICS: 'analytics:metrics',
  ANALYTICS_TRENDS: 'analytics:trends'
} as const

// =============================================================================
// Cache Hooks for React Components
// =============================================================================

import { useState, useEffect, useCallback } from 'react'

export function useCache<T>(
  key: string,
  factory: () => T | Promise<T>,
  options: {
    cache?: CacheManager
    ttl?: number
    persistent?: boolean
    refreshInterval?: number
  } = {}
) {
  const {
    cache = appCache,
    ttl = 5 * 60 * 1000,
    persistent = false,
    refreshInterval
  } = options
  
  const [data, setData] = useState<T | null>(() => cache.get<T>(key))
  const [loading, setLoading] = useState(data === null)
  const [error, setError] = useState<Error | null>(null)
  
  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const result = await cache.getOrSet(key, factory, ttl, persistent)
      setData(result)
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }, [key, factory, cache, ttl, persistent])
  
  const refresh = useCallback(() => {
    return cache.refresh(key, factory).then(result => {
      setData(result)
      return result
    })
  }, [key, factory, cache])
  
  // Initial load
  useEffect(() => {
    if (data === null) {
      fetchData()
    }
  }, [fetchData, data])
  
  // Auto refresh interval
  useEffect(() => {
    if (refreshInterval) {
      const interval = setInterval(refresh, refreshInterval)
      return () => clearInterval(interval)
    }
  }, [refresh, refreshInterval])
  
  return {
    data,
    loading,
    error,
    refresh,
    invalidate: () => cache.delete(key)
  }
}

// =============================================================================
// Cache Invalidation Utilities
// =============================================================================

export const CacheInvalidator = {
  // Invalidate user data when wallet changes
  onWalletChange: (oldAddress?: string, newAddress?: string) => {
    if (oldAddress) {
      appCache.invalidatePattern(new RegExp(`user:.*:${oldAddress}`))
      nftCache.invalidatePattern(new RegExp(`user:.*:${oldAddress}`))
      gameCache.invalidatePattern(new RegExp(`game:.*:${oldAddress}`))
    }
  },
  
  // Invalidate market data after transactions
  onMarketTransaction: () => {
    apiCache.invalidatePattern(/^market:/)
    nftCache.invalidatePattern(/^nft:/)
  },
  
  // Invalidate game data after game actions
  onGameAction: (address: string) => {
    gameCache.delete(CacheKeys.GAME_ACHIEVEMENTS(address))
    gameCache.delete(CacheKeys.GAME_LEADERBOARD)
  },
  
  // Clear all caches (nuclear option)
  clearAll: () => {
    appCache.clear()
    nftCache.clear()
    apiCache.clear()
    gameCache.clear()
  }
}

// =============================================================================
// Performance Monitoring
// =============================================================================

export const CacheMonitor = {
  getAllStats: () => ({
    app: appCache.stats(),
    nft: nftCache.stats(),
    api: apiCache.stats(),
    game: gameCache.stats()
  }),
  
  getHitRate: (cache: CacheManager, sampleSize: number = 100) => {
    // This would require tracking hits/misses - simplified for demo
    return {
      hits: 0,
      misses: 0,
      rate: 0
    }
  },
  
  optimize: () => {
    // Run cleanup on all caches
    [appCache, nftCache, apiCache, gameCache].forEach(cache => {
      // Force cleanup by calling private method via any cast
      (cache as any).cleanup()
    })
  }
}

export default CacheManager