'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react'

// =============================================================================
// Error Types and Interfaces
// =============================================================================

export interface ErrorDetails {
  message: string
  stack?: string
  componentStack?: string
  errorBoundary?: string
  errorInfo?: ErrorInfo
  url?: string
  timestamp: number
  userId?: string
  sessionId?: string
  buildVersion?: string
  userAgent?: string
  errorId: string
}

export interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
  errorId: string | null
  retryCount: number
  isRetrying: boolean
}

export interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: (error: ErrorDetails) => ReactNode
  onError?: (error: ErrorDetails) => void
  enableRetry?: boolean
  maxRetries?: number
  isolate?: boolean
  name?: string
}

// =============================================================================
// Error Reporter
// =============================================================================

class ErrorReporter {
  private static instance: ErrorReporter | null = null
  private errorQueue: ErrorDetails[] = []
  private isOnline = true
  
  constructor() {
    this.setupOnlineListener()
    this.processQueuePeriodically()
  }
  
  static getInstance(): ErrorReporter {
    if (!ErrorReporter.instance) {
      ErrorReporter.instance = new ErrorReporter()
    }
    return ErrorReporter.instance
  }
  
  private setupOnlineListener() {
    if (typeof window !== 'undefined') {
      this.isOnline = navigator.onLine
      window.addEventListener('online', () => {
        this.isOnline = true
        this.processQueue()
      })
      window.addEventListener('offline', () => {
        this.isOnline = false
      })
    }
  }
  
  private processQueuePeriodically() {
    if (typeof window !== 'undefined') {
      setInterval(() => {
        if (this.isOnline && this.errorQueue.length > 0) {
          this.processQueue()
        }
      }, 30000) // Process every 30 seconds
    }
  }
  
  report(errorDetails: ErrorDetails) {
    // Add to local storage for persistence
    this.storeError(errorDetails)
    
    // Add to queue for reporting
    this.errorQueue.push(errorDetails)
    
    // Try to send immediately if online
    if (this.isOnline) {
      this.processQueue()
    }
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('🔥 Error Boundary Caught:', errorDetails)
    }
  }
  
  private storeError(errorDetails: ErrorDetails) {
    try {
      const stored = localStorage.getItem('gecko-error-log') || '[]'
      const errorLog = JSON.parse(stored)
      
      errorLog.push(errorDetails)
      
      // Keep only last 50 errors
      if (errorLog.length > 50) {
        errorLog.splice(0, errorLog.length - 50)
      }
      
      localStorage.setItem('gecko-error-log', JSON.stringify(errorLog))
    } catch (error) {
      console.error('Failed to store error:', error)
    }
  }
  
  private async processQueue() {
    if (this.errorQueue.length === 0) return
    
    const errors = [...this.errorQueue]
    this.errorQueue = []
    
    try {
      // In a real app, send to error tracking service (Sentry, LogRocket, etc.)
      await this.sendToErrorService(errors)
    } catch (error) {
      // If sending fails, add back to queue
      this.errorQueue.unshift(...errors)
      console.error('Failed to send error reports:', error)
    }
  }
  
  private async sendToErrorService(errors: ErrorDetails[]): Promise<void> {
    // Mock implementation - replace with actual error service
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Sending error reports:', errors.length)
      return Promise.resolve()
    }
    
    // Example: Sentry integration
    // for (const error of errors) {
    //   Sentry.captureException(new Error(error.message), {
    //     tags: {
    //       component: error.errorBoundary,
    //       errorId: error.errorId
    //     },
    //     extra: error
    //   })
    // }
    
    return Promise.resolve()
  }
  
  getStoredErrors(): ErrorDetails[] {
    try {
      const stored = localStorage.getItem('gecko-error-log') || '[]'
      return JSON.parse(stored)
    } catch {
      return []
    }
  }
  
  clearStoredErrors() {
    localStorage.removeItem('gecko-error-log')
  }
}

// =============================================================================
// Enhanced Error Boundary Component
// =============================================================================

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private errorReporter = ErrorReporter.getInstance()
  
  constructor(props: ErrorBoundaryProps) {
    super(props)
    
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
      retryCount: 0,
      isRetrying: false
    }
  }
  
  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }
  }
  
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const errorDetails: ErrorDetails = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      errorBoundary: this.props.name || 'Unknown',
      errorInfo,
      url: typeof window !== 'undefined' ? window.location.href : '',
      timestamp: Date.now(),
      userId: this.getUserId(),
      sessionId: this.getSessionId(),
      buildVersion: process.env.NEXT_PUBLIC_BUILD_VERSION || 'unknown',
      userAgent: typeof window !== 'undefined' ? navigator.userAgent : '',
      errorId: this.state.errorId || `error_${Date.now()}`
    }
    
    this.setState({
      errorInfo,
      errorId: errorDetails.errorId
    })
    
    // Report error
    this.errorReporter.report(errorDetails)
    
    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(errorDetails)
    }
  }
  
  private getUserId(): string | undefined {
    // Get user ID from context, localStorage, etc.
    try {
      return localStorage.getItem('user-address') || undefined
    } catch {
      return undefined
    }
  }
  
  private getSessionId(): string {
    // Get or create session ID
    try {
      let sessionId = sessionStorage.getItem('session-id')
      if (!sessionId) {
        sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        sessionStorage.setItem('session-id', sessionId)
      }
      return sessionId
    } catch {
      return `session_${Date.now()}`
    }
  }
  
  private retry = async () => {
    const { maxRetries = 3 } = this.props
    
    if (this.state.retryCount >= maxRetries) {
      return
    }
    
    this.setState({ isRetrying: true })
    
    // Wait a bit before retry
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
      retryCount: prevState.retryCount + 1,
      isRetrying: false
    }))
  }
  
  private goHome = () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/'
    }
  }
  
  private reloadPage = () => {
    if (typeof window !== 'undefined') {
      window.location.reload()
    }
  }
  
  render() {
    if (this.state.hasError) {
      const { error, errorInfo, errorId, retryCount, isRetrying } = this.state
      const { fallback, enableRetry = true, maxRetries = 3, isolate = false } = this.props
      
      const errorDetails: ErrorDetails = {
        message: error?.message || 'Unknown error',
        stack: error?.stack,
        componentStack: errorInfo?.componentStack,
        errorBoundary: this.props.name || 'Unknown',
        errorInfo,
        url: typeof window !== 'undefined' ? window.location.href : '',
        timestamp: Date.now(),
        errorId: errorId || 'unknown',
        userId: this.getUserId(),
        sessionId: this.getSessionId(),
        buildVersion: process.env.NEXT_PUBLIC_BUILD_VERSION || 'unknown',
        userAgent: typeof window !== 'undefined' ? navigator.userAgent : ''
      }
      
      if (fallback) {
        return fallback(errorDetails)
      }
      
      return (
        <div className={`error-boundary ${isolate ? 'isolated' : 'full-screen'}`}>
          <div className="error-boundary-container">
            <div className="error-boundary-content">
              <div className="error-icon">
                <AlertTriangle size={64} className="text-red-500" />
              </div>
              
              <div className="error-info">
                <h2 className="error-title">
                  Oops! Something went wrong
                </h2>
                
                <p className="error-description">
                  We encountered an unexpected error. Our team has been notified and is working on a fix.
                </p>
                
                {process.env.NODE_ENV === 'development' && (
                  <details className="error-details">
                    <summary>Technical Details (Development Mode)</summary>
                    <div className="error-technical">
                      <p><strong>Error:</strong> {error?.message}</p>
                      <p><strong>Error ID:</strong> {errorId}</p>
                      <p><strong>Component:</strong> {this.props.name || 'Unknown'}</p>
                      {error?.stack && (
                        <pre className="error-stack">{error.stack}</pre>
                      )}
                    </div>
                  </details>
                )}
                
                <div className="error-actions">
                  {enableRetry && retryCount < maxRetries && (
                    <button
                      onClick={this.retry}
                      disabled={isRetrying}
                      className="error-button primary"
                    >
                      <RefreshCw size={16} className={isRetrying ? 'animate-spin' : ''} />
                      {isRetrying ? 'Retrying...' : 'Try Again'}
                    </button>
                  )}
                  
                  <button
                    onClick={this.goHome}
                    className="error-button secondary"
                  >
                    <Home size={16} />
                    Go Home
                  </button>
                  
                  <button
                    onClick={this.reloadPage}
                    className="error-button secondary"
                  >
                    <RefreshCw size={16} />
                    Reload Page
                  </button>
                  
                  <button
                    onClick={() => {
                      const errorText = `Error ID: ${errorId}\nMessage: ${error?.message}\nURL: ${window.location.href}`
                      navigator.clipboard.writeText(errorText)
                      alert('Error details copied to clipboard')
                    }}
                    className="error-button tertiary"
                  >
                    <Bug size={16} />
                    Copy Error Details
                  </button>
                </div>
                
                {retryCount > 0 && (
                  <p className="retry-count">
                    Retry attempts: {retryCount}/{maxRetries}
                  </p>
                )}
              </div>
            </div>
          </div>
          
          <style jsx>{`
            .error-boundary {
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: ${isolate ? '300px' : '100vh'};
              background: ${isolate ? 'transparent' : 'linear-gradient(135deg, #1e293b 0%, #334155 100%)'};
              color: white;
              font-family: system-ui, -apple-system, sans-serif;
              padding: 2rem;
            }
            
            .error-boundary.full-screen {
              position: fixed;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              z-index: 9999;
            }
            
            .error-boundary-container {
              max-width: 600px;
              width: 100%;
            }
            
            .error-boundary-content {
              text-align: center;
              background: rgba(255, 255, 255, 0.05);
              border: 1px solid rgba(255, 255, 255, 0.1);
              border-radius: 12px;
              padding: 3rem 2rem;
              backdrop-filter: blur(10px);
            }
            
            .error-icon {
              margin-bottom: 1.5rem;
            }
            
            .error-title {
              font-size: 1.75rem;
              font-weight: bold;
              margin-bottom: 1rem;
              color: #f87171;
            }
            
            .error-description {
              font-size: 1rem;
              margin-bottom: 2rem;
              color: rgba(255, 255, 255, 0.8);
              line-height: 1.6;
            }
            
            .error-details {
              text-align: left;
              margin-bottom: 2rem;
              background: rgba(0, 0, 0, 0.2);
              border-radius: 8px;
              padding: 1rem;
            }
            
            .error-details summary {
              cursor: pointer;
              font-weight: 500;
              margin-bottom: 0.5rem;
              color: #fbbf24;
            }
            
            .error-technical {
              font-size: 0.875rem;
              color: rgba(255, 255, 255, 0.7);
            }
            
            .error-stack {
              background: rgba(0, 0, 0, 0.3);
              padding: 1rem;
              border-radius: 4px;
              overflow-x: auto;
              font-size: 0.75rem;
              margin-top: 0.5rem;
            }
            
            .error-actions {
              display: flex;
              flex-wrap: wrap;
              gap: 0.75rem;
              justify-content: center;
              margin-bottom: 1rem;
            }
            
            .error-button {
              display: flex;
              align-items: center;
              gap: 0.5rem;
              padding: 0.75rem 1.5rem;
              border: none;
              border-radius: 6px;
              font-weight: 500;
              cursor: pointer;
              transition: all 0.2s;
              font-size: 0.875rem;
            }
            
            .error-button:disabled {
              opacity: 0.6;
              cursor: not-allowed;
            }
            
            .error-button.primary {
              background: linear-gradient(45deg, #059669, #10b981);
              color: white;
            }
            
            .error-button.primary:hover:not(:disabled) {
              background: linear-gradient(45deg, #047857, #059669);
              transform: translateY(-1px);
            }
            
            .error-button.secondary {
              background: rgba(255, 255, 255, 0.1);
              color: white;
              border: 1px solid rgba(255, 255, 255, 0.2);
            }
            
            .error-button.secondary:hover {
              background: rgba(255, 255, 255, 0.2);
            }
            
            .error-button.tertiary {
              background: transparent;
              color: rgba(255, 255, 255, 0.7);
              border: 1px solid rgba(255, 255, 255, 0.1);
            }
            
            .error-button.tertiary:hover {
              color: white;
              border-color: rgba(255, 255, 255, 0.3);
            }
            
            .retry-count {
              font-size: 0.875rem;
              color: rgba(255, 255, 255, 0.6);
              margin-top: 1rem;
            }
          `}</style>
        </div>
      )
    }
    
    return this.props.children
  }
}

// =============================================================================
// Specialized Error Boundaries
// =============================================================================

export function GameErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      name="GameErrorBoundary"
      isolate={true}
      enableRetry={true}
      maxRetries={2}
      fallback={(error) => (
        <div className="game-error-fallback">
          <div className="game-error-content">
            <AlertTriangle size={48} className="text-red-500 mb-4" />
            <h3 className="text-xl font-bold mb-2">Game Error</h3>
            <p className="text-gray-400 mb-4">
              The game encountered an error and needs to restart.
            </p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Restart Game
            </button>
          </div>
          <style jsx>{`
            .game-error-fallback {
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 400px;
              background: rgba(0, 0, 0, 0.8);
              border-radius: 8px;
              color: white;
            }
            .game-error-content {
              text-align: center;
              padding: 2rem;
            }
          `}</style>
        </div>
      )}
    >
      {children}
    </ErrorBoundary>
  )
}

export function WalletErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      name="WalletErrorBoundary"
      isolate={true}
      enableRetry={true}
      maxRetries={1}
      fallback={(error) => (
        <div className="wallet-error-fallback">
          <div className="wallet-error-content">
            <AlertTriangle size={32} className="text-yellow-500 mb-2" />
            <h4 className="font-semibold mb-1">Wallet Connection Error</h4>
            <p className="text-sm text-gray-400">
              Please try reconnecting your wallet
            </p>
          </div>
        </div>
      )}
    >
      {children}
    </ErrorBoundary>
  )
}

// =============================================================================
// Error Reporting Hook
// =============================================================================

import { useCallback } from 'react'

export function useErrorReporting() {
  const errorReporter = ErrorReporter.getInstance()
  
  const reportError = useCallback((error: Error, context?: any) => {
    const errorDetails: ErrorDetails = {
      message: error.message,
      stack: error.stack,
      url: window.location.href,
      timestamp: Date.now(),
      errorId: `manual_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: localStorage.getItem('user-address') || undefined,
      sessionId: sessionStorage.getItem('session-id') || 'unknown',
      buildVersion: process.env.NEXT_PUBLIC_BUILD_VERSION || 'unknown',
      userAgent: navigator.userAgent,
      ...context
    }
    
    errorReporter.report(errorDetails)
  }, [errorReporter])
  
  const getErrorHistory = useCallback(() => {
    return errorReporter.getStoredErrors()
  }, [errorReporter])
  
  const clearErrorHistory = useCallback(() => {
    errorReporter.clearStoredErrors()
  }, [errorReporter])
  
  return {
    reportError,
    getErrorHistory,
    clearErrorHistory
  }
}

export default ErrorBoundary