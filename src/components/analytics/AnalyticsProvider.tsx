'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { analytics, usePageTracking, usePerformanceMonitoring } from '@/lib/analytics'
import { useAccount } from 'wagmi'

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { address, isConnected } = useAccount()

  // Initialize analytics
  useEffect(() => {
    analytics.initialize()
  }, [])

  // Track page views
  usePageTracking()

  // Track performance metrics
  usePerformanceMonitoring()

  // Track user identification when wallet connects
  useEffect(() => {
    if (isConnected && address) {
      analytics.identify({
        walletAddress: address,
        userId: address,
        isInvestor: true // Mark as potential investor when wallet connects
      })

      // Track wallet connection
      analytics.track({
        category: 'user',
        action: 'wallet_connected',
        label: address,
        metadata: { 
          source: pathname,
          referrer: document.referrer 
        }
      })
    }
  }, [isConnected, address, pathname])

  // Track UTM parameters for investment campaigns
  useEffect(() => {
    const utm_source = searchParams.get('utm_source')
    const utm_medium = searchParams.get('utm_medium')
    const utm_campaign = searchParams.get('utm_campaign')
    
    if (utm_source || utm_medium || utm_campaign) {
      analytics.track({
        category: 'investment',
        action: 'campaign_visit',
        metadata: {
          utm_source,
          utm_medium,
          utm_campaign,
          landing_page: pathname
        }
      })

      // Store campaign data for later conversion attribution
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('utm_data', JSON.stringify({
          utm_source,
          utm_medium,
          utm_campaign,
          timestamp: Date.now()
        }))
      }
    }
  }, [searchParams, pathname])

  // Track referral sources
  useEffect(() => {
    if (typeof window !== 'undefined' && document.referrer) {
      const referrerUrl = new URL(document.referrer)
      const currentUrl = new URL(window.location.href)
      
      // Only track external referrers
      if (referrerUrl.hostname !== currentUrl.hostname) {
        analytics.track({
          category: 'user',
          action: 'referral_visit',
          label: referrerUrl.hostname,
          metadata: {
            full_referrer: document.referrer,
            landing_page: pathname
          }
        })
      }
    }
  }, [pathname])

  return <>{children}</>
}