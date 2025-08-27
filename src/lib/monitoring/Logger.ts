'use client'

// =============================================================================
// Advanced Logging System for Omniverse Geckos
// =============================================================================

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

export interface LogEntry {
  timestamp: number
  level: LogLevel
  message: string
  category: string
  data?: any
  userId?: string
  sessionId?: string
  url?: string
  userAgent?: string
  buildVersion?: string
  tags?: string[]
}

export interface LoggerConfig {
  level: LogLevel
  enableConsole: boolean
  enableStorage: boolean
  enableRemote: boolean
  maxStorageEntries: number
  batchSize: number
  flushInterval: number
  remoteEndpoint?: string
  enablePerformanceMetrics: boolean
}

// =============================================================================
// Performance Monitor
// =============================================================================

export class PerformanceMonitor {
  private metrics = new Map<string, number>()
  private timers = new Map<string, number>()
  
  startTimer(name: string): void {
    this.timers.set(name, performance.now())
  }
  
  endTimer(name: string): number {
    const startTime = this.timers.get(name)
    if (!startTime) return 0
    
    const duration = performance.now() - startTime
    this.timers.delete(name)
    this.metrics.set(name, duration)
    
    return duration
  }
  
  recordMetric(name: string, value: number): void {
    this.metrics.set(name, value)
  }
  
  getMetrics(): Record<string, number> {
    return Object.fromEntries(this.metrics)
  }
  
  clearMetrics(): void {
    this.metrics.clear()
    this.timers.clear()
  }
  
  getWebVitals(): Promise<any> {
    return new Promise((resolve) => {
      // Web Vitals measurement
      const vitals = {
        cls: 0,
        fcp: 0,
        fid: 0,
        lcp: 0,
        ttfb: 0
      }
      
      // Get navigation timing
      if (typeof window !== 'undefined' && window.performance) {
        const navigation = window.performance.getEntriesByType('navigation')[0] as any
        
        if (navigation) {
          vitals.ttfb = navigation.responseStart - navigation.requestStart
        }
        
        // Get paint timing
        const paintEntries = window.performance.getEntriesByType('paint')
        paintEntries.forEach((entry: any) => {
          if (entry.name === 'first-contentful-paint') {
            vitals.fcp = entry.startTime
          }
        })
        
        // Get layout shift entries
        const observer = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry: any) => {
            if (entry.entryType === 'layout-shift' && !entry.hadRecentInput) {
              vitals.cls += entry.value
            }
          })
        })
        
        observer.observe({ entryTypes: ['layout-shift'] })
        
        // Cleanup and resolve after a short delay
        setTimeout(() => {
          observer.disconnect()
          resolve(vitals)
        }, 1000)
      } else {
        resolve(vitals)
      }
    })
  }
}

// =============================================================================
// Logger Class
// =============================================================================

export class Logger {
  private config: LoggerConfig
  private logBuffer: LogEntry[] = []
  private perfMonitor = new PerformanceMonitor()
  private flushTimer: NodeJS.Timeout | null = null
  
  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = {
      level: LogLevel.INFO,
      enableConsole: true,
      enableStorage: true,
      enableRemote: false,
      maxStorageEntries: 1000,
      batchSize: 10,
      flushInterval: 30000, // 30 seconds
      enablePerformanceMetrics: true,
      ...config
    }
    
    this.setupAutoFlush()
    this.loadStoredLogs()
  }
  
  // =============================================================================
  // Core Logging Methods
  // =============================================================================
  
  debug(message: string, data?: any, category: string = 'general'): void {
    this.log(LogLevel.DEBUG, message, data, category)
  }
  
  info(message: string, data?: any, category: string = 'general'): void {
    this.log(LogLevel.INFO, message, data, category)
  }
  
  warn(message: string, data?: any, category: string = 'general'): void {
    this.log(LogLevel.WARN, message, data, category)
  }
  
  error(message: string, error?: Error | any, category: string = 'general'): void {
    const errorData = error instanceof Error 
      ? { 
          name: error.name, 
          message: error.message, 
          stack: error.stack 
        }
      : error
    
    this.log(LogLevel.ERROR, message, errorData, category)
  }
  
  private log(level: LogLevel, message: string, data?: any, category: string = 'general', tags?: string[]): void {
    if (level < this.config.level) return
    
    const entry: LogEntry = {
      timestamp: Date.now(),
      level,
      message,
      category,
      data,
      userId: this.getUserId(),
      sessionId: this.getSessionId(),
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      userAgent: typeof window !== 'undefined' ? navigator.userAgent : undefined,
      buildVersion: process.env.NEXT_PUBLIC_BUILD_VERSION || 'unknown',
      tags: tags || []
    }
    
    // Console output
    if (this.config.enableConsole) {
      this.outputToConsole(entry)
    }
    
    // Add to buffer
    this.logBuffer.push(entry)
    
    // Storage
    if (this.config.enableStorage) {
      this.storeLog(entry)
    }
    
    // Auto-flush if buffer is full
    if (this.logBuffer.length >= this.config.batchSize) {
      this.flush()
    }
  }
  
  // =============================================================================
  // Specialized Logging Methods
  // =============================================================================
  
  game(message: string, data?: any): void {
    this.info(message, data, 'game')
  }
  
  blockchain(message: string, data?: any): void {
    this.info(message, data, 'blockchain')
  }
  
  ai(message: string, data?: any): void {
    this.info(message, data, 'ai')
  }
  
  performance(message: string, data?: any): void {
    this.info(message, data, 'performance')
  }
  
  security(message: string, data?: any): void {
    this.warn(message, data, 'security')
  }
  
  userAction(action: string, data?: any): void {
    this.info(`User Action: ${action}`, data, 'user_action')
  }
  
  apiCall(method: string, endpoint: string, duration: number, status?: number): void {
    this.info(`API Call: ${method} ${endpoint}`, {
      method,
      endpoint,
      duration,
      status
    }, 'api')
  }
  
  // =============================================================================
  // Performance Logging
  // =============================================================================
  
  startTimer(name: string): void {
    if (this.config.enablePerformanceMetrics) {
      this.perfMonitor.startTimer(name)
    }
  }
  
  endTimer(name: string): number {
    if (!this.config.enablePerformanceMetrics) return 0
    
    const duration = this.perfMonitor.endTimer(name)
    
    if (duration > 0) {
      this.performance(`Timer ${name} completed`, { duration })
    }
    
    return duration
  }
  
  recordMetric(name: string, value: number): void {
    if (this.config.enablePerformanceMetrics) {
      this.perfMonitor.recordMetric(name, value)
      this.performance(`Metric recorded: ${name}`, { value })
    }
  }
  
  async recordWebVitals(): Promise<void> {
    if (!this.config.enablePerformanceMetrics) return
    
    try {
      const vitals = await this.perfMonitor.getWebVitals()
      this.performance('Web Vitals recorded', vitals)
    } catch (error) {
      this.error('Failed to record web vitals', error)
    }
  }
  
  // =============================================================================
  // Transaction and Blockchain Logging
  // =============================================================================
  
  transactionStarted(txHash: string, type: string, data?: any): void {
    this.blockchain(`Transaction started: ${type}`, {
      txHash,
      type,
      timestamp: Date.now(),
      ...data
    })
  }
  
  transactionCompleted(txHash: string, success: boolean, data?: any): void {
    this.blockchain(`Transaction ${success ? 'completed' : 'failed'}`, {
      txHash,
      success,
      timestamp: Date.now(),
      ...data
    })
  }
  
  contractInteraction(contract: string, method: string, data?: any): void {
    this.blockchain(`Contract interaction: ${contract}.${method}`, {
      contract,
      method,
      timestamp: Date.now(),
      ...data
    })
  }
  
  walletConnected(address: string, connector: string): void {
    this.blockchain('Wallet connected', {
      address: address.slice(0, 6) + '...' + address.slice(-4),
      connector,
      timestamp: Date.now()
    })
  }
  
  // =============================================================================
  // Game-Specific Logging
  // =============================================================================
  
  gameStarted(levelId: number, towers: string[]): void {
    this.game('Game started', {
      levelId,
      towerCount: towers.length,
      towers: towers.slice(0, 5), // Limit to first 5 for privacy
      timestamp: Date.now()
    })
  }
  
  gameEnded(victory: boolean, score: number, duration: number): void {
    this.game('Game ended', {
      victory,
      score,
      duration,
      timestamp: Date.now()
    })
  }
  
  towerPlaced(towerId: string, position: { x: number; y: number }): void {
    this.game('Tower placed', {
      towerId: towerId.slice(0, 8) + '...',
      position,
      timestamp: Date.now()
    })
  }
  
  nftMinted(tokenId: string, type: string, rarity: string): void {
    this.blockchain('NFT minted', {
      tokenId,
      type,
      rarity,
      timestamp: Date.now()
    })
  }
  
  // =============================================================================
  // AI Logging
  // =============================================================================
  
  aiRecommendation(recommendation: any): void {
    this.ai('AI recommendation generated', {
      type: recommendation.type,
      priority: recommendation.priority,
      confidence: recommendation.confidence,
      timestamp: Date.now()
    })
  }
  
  aiChatMessage(message: string, isUser: boolean): void {
    this.ai(`AI chat ${isUser ? 'user' : 'assistant'} message`, {
      messageLength: message.length,
      isUser,
      timestamp: Date.now()
    })
  }
  
  // =============================================================================
  // Storage and Persistence
  // =============================================================================
  
  private storeLog(entry: LogEntry): void {
    try {
      const stored = localStorage.getItem('gecko-logs') || '[]'
      const logs = JSON.parse(stored)
      
      logs.push(entry)
      
      // Maintain max entries limit
      if (logs.length > this.config.maxStorageEntries) {
        logs.splice(0, logs.length - this.config.maxStorageEntries)
      }
      
      localStorage.setItem('gecko-logs', JSON.stringify(logs))
    } catch (error) {
      console.error('Failed to store log:', error)
    }
  }
  
  private loadStoredLogs(): void {
    try {
      const stored = localStorage.getItem('gecko-logs') || '[]'
      const logs = JSON.parse(stored)
      
      // Add recent logs to buffer for potential remote sending
      const recentLogs = logs.filter((log: LogEntry) => 
        Date.now() - log.timestamp < 60000 // Last minute
      )
      
      this.logBuffer.push(...recentLogs)
    } catch (error) {
      console.error('Failed to load stored logs:', error)
    }
  }
  
  getStoredLogs(): LogEntry[] {
    try {
      const stored = localStorage.getItem('gecko-logs') || '[]'
      return JSON.parse(stored)
    } catch {
      return []
    }
  }
  
  clearStoredLogs(): void {
    localStorage.removeItem('gecko-logs')
    this.logBuffer = []
  }
  
  // =============================================================================
  // Remote Logging and Analytics
  // =============================================================================
  
  private setupAutoFlush(): void {
    if (this.config.enableRemote && this.config.flushInterval > 0) {
      this.flushTimer = setInterval(() => {
        this.flush()
      }, this.config.flushInterval)
    }
  }
  
  private async flush(): Promise<void> {
    if (!this.config.enableRemote || this.logBuffer.length === 0) return
    
    const logsToSend = [...this.logBuffer]
    this.logBuffer = []
    
    try {
      await this.sendLogsToRemote(logsToSend)
    } catch (error) {
      console.error('Failed to send logs to remote:', error)
      // Add failed logs back to buffer for retry
      this.logBuffer.unshift(...logsToSend)
    }
  }
  
  private async sendLogsToRemote(logs: LogEntry[]): Promise<void> {
    if (!this.config.remoteEndpoint) return
    
    const payload = {
      logs,
      meta: {
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        buildVersion: process.env.NEXT_PUBLIC_BUILD_VERSION,
        sessionId: this.getSessionId()
      }
    }
    
    // In production, send to actual logging service
    if (process.env.NODE_ENV === 'development') {
      console.log('📤 Sending logs to remote:', payload)
      return
    }
    
    // Example implementation
    // await fetch(this.config.remoteEndpoint, {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json'
    //   },
    //   body: JSON.stringify(payload)
    // })
  }
  
  // =============================================================================
  // Filtering and Querying
  // =============================================================================
  
  getLogsByCategory(category: string, limit: number = 100): LogEntry[] {
    return this.getStoredLogs()
      .filter(log => log.category === category)
      .slice(-limit)
      .reverse()
  }
  
  getLogsByLevel(level: LogLevel, limit: number = 100): LogEntry[] {
    return this.getStoredLogs()
      .filter(log => log.level >= level)
      .slice(-limit)
      .reverse()
  }
  
  getRecentLogs(minutes: number = 5): LogEntry[] {
    const cutoff = Date.now() - (minutes * 60 * 1000)
    return this.getStoredLogs()
      .filter(log => log.timestamp > cutoff)
      .reverse()
  }
  
  searchLogs(query: string): LogEntry[] {
    const lowerQuery = query.toLowerCase()
    return this.getStoredLogs()
      .filter(log => 
        log.message.toLowerCase().includes(lowerQuery) ||
        log.category.toLowerCase().includes(lowerQuery) ||
        (log.tags && log.tags.some(tag => tag.toLowerCase().includes(lowerQuery)))
      )
      .reverse()
  }
  
  // =============================================================================
  // Utilities
  // =============================================================================
  
  private outputToConsole(entry: LogEntry): void {
    const timestamp = new Date(entry.timestamp).toISOString()
    const prefix = `[${timestamp}] [${entry.category.toUpperCase()}]`
    
    const style = this.getConsoleStyle(entry.level)
    
    if (entry.data) {
      console.log(`%c${prefix} ${entry.message}`, style, entry.data)
    } else {
      console.log(`%c${prefix} ${entry.message}`, style)
    }
  }
  
  private getConsoleStyle(level: LogLevel): string {
    switch (level) {
      case LogLevel.DEBUG:
        return 'color: #6B7280'
      case LogLevel.INFO:
        return 'color: #3B82F6'
      case LogLevel.WARN:
        return 'color: #F59E0B'
      case LogLevel.ERROR:
        return 'color: #EF4444; font-weight: bold'
      default:
        return ''
    }
  }
  
  private getUserId(): string | undefined {
    try {
      return localStorage.getItem('user-address') || undefined
    } catch {
      return undefined
    }
  }
  
  private getSessionId(): string {
    try {
      let sessionId = sessionStorage.getItem('session-id')
      if (!sessionId) {
        sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        sessionStorage.setItem('session-id', sessionId)
      }
      return sessionId
    } catch {
      return 'unknown'
    }
  }
  
  // =============================================================================
  // Analytics and Insights
  // =============================================================================
  
  generateAnalytics(): any {
    const logs = this.getStoredLogs()
    
    const analytics = {
      totalLogs: logs.length,
      logsByLevel: this.groupBy(logs, 'level'),
      logsByCategory: this.groupBy(logs, 'category'),
      recentErrors: logs
        .filter(log => log.level === LogLevel.ERROR)
        .slice(-10),
      performanceMetrics: this.perfMonitor.getMetrics(),
      topErrors: this.getTopErrors(logs),
      activityTimeline: this.getActivityTimeline(logs)
    }
    
    return analytics
  }
  
  private groupBy(array: any[], key: string): Record<string, number> {
    return array.reduce((result, item) => {
      const groupKey = item[key]
      result[groupKey] = (result[groupKey] || 0) + 1
      return result
    }, {})
  }
  
  private getTopErrors(logs: LogEntry[]): Array<{error: string, count: number}> {
    const errors = logs.filter(log => log.level === LogLevel.ERROR)
    const errorCounts = this.groupBy(errors, 'message')
    
    return Object.entries(errorCounts)
      .map(([error, count]) => ({ error, count: count as number }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
  }
  
  private getActivityTimeline(logs: LogEntry[]): Array<{hour: number, count: number}> {
    const hourCounts: Record<number, number> = {}
    
    logs.forEach(log => {
      const hour = new Date(log.timestamp).getHours()
      hourCounts[hour] = (hourCounts[hour] || 0) + 1
    })
    
    return Array.from({ length: 24 }, (_, hour) => ({
      hour,
      count: hourCounts[hour] || 0
    }))
  }
  
  // =============================================================================
  // Cleanup
  // =============================================================================
  
  destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer)
      this.flushTimer = null
    }
    
    // Final flush
    this.flush()
    
    // Clear memory
    this.logBuffer = []
    this.perfMonitor.clearMetrics()
  }
}

// =============================================================================
// Singleton Instance
// =============================================================================

let loggerInstance: Logger | null = null

export function getLogger(): Logger {
  if (!loggerInstance) {
    loggerInstance = new Logger({
      level: process.env.NODE_ENV === 'development' ? LogLevel.DEBUG : LogLevel.INFO,
      enableRemote: process.env.NODE_ENV === 'production',
      remoteEndpoint: process.env.NEXT_PUBLIC_LOGGING_ENDPOINT
    })
  }
  return loggerInstance
}

// =============================================================================
// React Hook
// =============================================================================

import { useCallback, useEffect } from 'react'

export function useLogger(category: string = 'component') {
  const logger = getLogger()
  
  const log = useCallback((level: LogLevel, message: string, data?: any) => {
    logger.log(level as any, message, data, category)
  }, [logger, category])
  
  const debug = useCallback((message: string, data?: any) => {
    logger.debug(message, data, category)
  }, [logger, category])
  
  const info = useCallback((message: string, data?: any) => {
    logger.info(message, data, category)
  }, [logger, category])
  
  const warn = useCallback((message: string, data?: any) => {
    logger.warn(message, data, category)
  }, [logger, category])
  
  const error = useCallback((message: string, error?: Error | any) => {
    logger.error(message, error, category)
  }, [logger, category])
  
  const startTimer = useCallback((name: string) => {
    logger.startTimer(name)
  }, [logger])
  
  const endTimer = useCallback((name: string) => {
    return logger.endTimer(name)
  }, [logger])
  
  // Log component mount/unmount
  useEffect(() => {
    debug(`Component ${category} mounted`)
    
    return () => {
      debug(`Component ${category} unmounted`)
    }
  }, [category, debug])
  
  return {
    debug,
    info,
    warn,
    error,
    startTimer,
    endTimer,
    logger
  }
}

export { Logger, PerformanceMonitor }
export default getLogger