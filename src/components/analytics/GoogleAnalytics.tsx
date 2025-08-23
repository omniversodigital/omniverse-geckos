'use client'

import Script from 'next/script'
import { useEffect } from 'react'

interface GoogleAnalyticsProps {
  trackingId?: string
}

declare global {
  interface Window {
    gtag: (...args: any[]) => void
    dataLayer: any[]
  }
}

export function GoogleAnalytics({ trackingId }: GoogleAnalyticsProps) {
  const GA_TRACKING_ID = trackingId || process.env.NEXT_PUBLIC_GA4_ID

  useEffect(() => {
    if (GA_TRACKING_ID && typeof window !== 'undefined') {
      // Initialize dataLayer
      window.dataLayer = window.dataLayer || []
      
      // Define gtag function
      window.gtag = function gtag() {
        window.dataLayer.push(arguments)
      }
      
      // Configure Google Analytics
      window.gtag('js', new Date())
      window.gtag('config', GA_TRACKING_ID, {
        page_title: document.title,
        page_location: window.location.href,
        send_page_view: true,
        // Enhanced ecommerce tracking
        enhanced_conversions: true,
        // Privacy settings
        anonymize_ip: true,
        // Custom dimensions for Web3 tracking
        custom_map: {
          'dimension1': 'wallet_connected',
          'dimension2': 'wallet_address',
          'dimension3': 'user_type'
        }
      })

      // Track initial page view
      window.gtag('event', 'page_view', {
        page_title: document.title,
        page_location: window.location.href,
        page_path: window.location.pathname
      })

      // Enhanced tracking for Web3 dApp
      window.gtag('event', 'dapp_loaded', {
        event_category: 'engagement',
        event_label: 'omniverse_geckos_loaded'
      })

      // Track viewport and device info
      window.gtag('event', 'device_info', {
        event_category: 'technical',
        viewport_width: window.innerWidth,
        viewport_height: window.innerHeight,
        screen_width: window.screen.width,
        screen_height: window.screen.height,
        user_agent: navigator.userAgent,
        language: navigator.language
      })
    }
  }, [GA_TRACKING_ID])

  // Don't render if no tracking ID
  if (!GA_TRACKING_ID) {
    return null
  }

  return (
    <>
      {/* Global Site Tag (gtag.js) - Google Analytics */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
        strategy="afterInteractive"
        id="google-analytics-script"
      />
      <Script
        id="google-analytics-config"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            
            gtag('config', '${GA_TRACKING_ID}', {
              page_title: document.title,
              page_location: window.location.href,
              send_page_view: true,
              enhanced_conversions: true,
              anonymize_ip: true,
              custom_map: {
                'dimension1': 'wallet_connected',
                'dimension2': 'wallet_address', 
                'dimension3': 'user_type'
              }
            });

            // Enhanced Web3 tracking
            gtag('event', 'dapp_initialized', {
              event_category: 'engagement',
              event_label: 'omniverse_geckos',
              value: 1
            });
          `
        }}
      />
    </>
  )
}

// Utility functions for GA4 tracking
export const trackGAEvent = (eventName: string, parameters?: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, parameters)
  }
}

export const trackGAConversion = (conversionId: string, value?: number, currency = 'USD') => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'conversion', {
      send_to: conversionId,
      value: value,
      currency: currency
    })
  }
}

export const trackGACustomEvent = (action: string, category: string, label?: string, value?: number) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value
    })
  }
}

// Web3-specific GA tracking
export const trackWeb3GAEvent = (eventName: string, web3Data?: Record<string, any>) => {
  trackGAEvent(`web3_${eventName}`, {
    event_category: 'web3',
    ...web3Data
  })
}

// Game-specific GA tracking  
export const trackGameGAEvent = (eventName: string, gameData?: Record<string, any>) => {
  trackGAEvent(`game_${eventName}`, {
    event_category: 'game',
    ...gameData
  })
}

// Investment tracking
export const trackInvestmentGAEvent = (action: string, amount?: number, currency = 'USD') => {
  trackGAEvent('investment_action', {
    event_category: 'investment',
    action: action,
    value: amount,
    currency: currency
  })
}