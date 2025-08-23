import type { Metadata } from 'next'
import { Inter, JetBrains_Mono, Orbitron } from 'next/font/google'
import { Providers } from '@/components/providers/Providers'
import { Navigation } from '@/components/layout/Navigation'
import { Footer } from '@/components/layout/Footer'
import { AIAssistant } from '@/components/ai/AIAssistant'
import { AnalyticsProvider } from '@/components/analytics/AnalyticsProvider'
import { GoogleAnalytics } from '@/components/analytics/GoogleAnalytics'
import { PostHogAnalytics } from '@/components/analytics/PostHogAnalytics'
import { SentryProvider } from '@/components/analytics/SentryProvider'
import { WebsiteStructuredData } from '@/components/seo/StructuredData'
import { baseSEO } from '@/lib/seo'
import { Toaster } from 'sonner'
import { cn } from '@/lib/utils'
import './globals.css'

// =============================================================================
// Fonts
// =============================================================================

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
})

const orbitron = Orbitron({
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
})

// =============================================================================
// Metadata
// =============================================================================

export const metadata: Metadata = {
  ...baseSEO,
  title: {
    default: 'Omniverse Geckos - Next-Gen Web3 Gaming Platform',
    template: '%s | Omniverse Geckos',
  },
  description: 'Play, earn, and collect in the ultimate Web3 gaming ecosystem. Tower defense meets NFT collecting with play-to-earn mechanics.',
  keywords: [
    'Web3 Gaming',
    'NFT Games',
    'Play-to-Earn',
    'Tower Defense',
    'Blockchain Gaming',
    'Cryptocurrency Gaming',
    'NFT Marketplace',
    'GameFi',
    'Ethereum Gaming',
    'DeFi Gaming'
  ],
  authors: [
    {
      name: 'Omniverse Geckos Team',
      url: 'https://omniversegeckos.com',
    },
  ],
  creator: 'Omniverse Geckos',
  publisher: 'Omniverse Geckos',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://omniversegeckos.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://omniversegeckos.com',
    title: 'Omniverse Geckos - Next-Gen Web3 Gaming Platform',
    description: 'Play, earn, and collect in the ultimate Web3 gaming ecosystem. Tower defense meets NFT collecting with play-to-earn mechanics.',
    siteName: 'Omniverse Geckos',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Omniverse Geckos - Web3 Gaming Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Omniverse Geckos - Next-Gen Web3 Gaming Platform',
    description: 'Play, earn, and collect in the ultimate Web3 gaming ecosystem.',
    images: ['/og-image.png'],
    creator: '@omniversegeckos',
    site: '@omniversegeckos',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'google-site-verification-token',
  },
  manifest: '/manifest.json',
  other: {
    'msapplication-TileColor': '#0f172a',
    'theme-color': '#0f172a',
  },
}

// =============================================================================
// Viewport
// =============================================================================

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
}

// =============================================================================
// Root Layout
// =============================================================================

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preload critical fonts */}
        <link
          rel="preload"
          href="/fonts/inter-var.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        
        {/* Security Headers */}
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta httpEquiv="Referrer-Policy" content="strict-origin-when-cross-origin" />
        
        {/* PWA Meta Tags */}
        <meta name="application-name" content="Omniverse Geckos" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Omniverse Geckos" />
        <meta name="mobile-web-app-capable" content="yes" />
        
        {/* Apple Touch Icons */}
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        
        {/* Preconnect to external domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://cdn.jsdelivr.net" />
        
        {/* DNS Prefetch */}
        <link rel="dns-prefetch" href="//gateway.pinata.cloud" />
        <link rel="dns-prefetch" href="//api.coingecko.com" />
        <link rel="dns-prefetch" href="//mainnet.infura.io" />
      </head>
      
      <body
        className={cn(
          'min-h-screen bg-background font-sans antialiased',
          'selection:bg-primary/20 selection:text-primary',
          inter.variable,
          jetbrainsMono.variable,
          orbitron.variable
        )}
      >
        <SentryProvider>
          <PostHogAnalytics>
            <Providers>
              <AnalyticsProvider>
                <div className="relative flex min-h-screen flex-col">
              {/* Skip to main content link for accessibility */}
              <a
                className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 bg-primary text-primary-foreground px-4 py-2 rounded-md"
                href="#main-content"
              >
                Skip to main content
              </a>
              
              {/* Navigation */}
              <Navigation />
              
              {/* Main Content */}
              <main id="main-content" className="flex-1">
                {children}
              </main>
              
              {/* Footer */}
              <Footer />
              
                  {/* AI Assistant - Available globally */}
                  <AIAssistant />
                </div>
              </AnalyticsProvider>
            </Providers>
          </PostHogAnalytics>
        </SentryProvider>
          
        {/* Toast Notifications */}
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'hsl(var(--background))',
              color: 'hsl(var(--foreground))',
              border: '1px solid hsl(var(--border))',
            },
          }}
        />
        
        {/* Google Analytics */}
        <GoogleAnalytics />
        
        {/* Structured Data */}
        <WebsiteStructuredData />
        
        {/* Development tools (only in development) */}
        {process.env.NODE_ENV === 'development' && (
          <>
            <div id="react-query-devtools"></div>
            <div id="vercel-toolbar"></div>
          </>
        )}
        
        {/* Analytics Scripts */}
        {process.env.NODE_ENV === 'production' && (
          <>
            {/* Vercel Analytics */}
            <script
              defer
              src="/_vercel/insights/script.js"
              data-api="/_vercel/insights/api"
            />
            
            {/* PostHog Analytics */}
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]);var n=t;if("undefined"!=typeof e){n=t[e]=function(){n.q.push(arguments)}}else console.warn("Could not initialize PostHog! Invalid method:",e);n.q=[]}(p=t.createElement("script")).type="text/javascript",p.async=!0,p.src=s.api_host+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="capture identify alias people.set people.set_once set_config register register_once unregister opt_out_capturing has_opted_out_capturing opt_in_capturing reset isFeatureEnabled onFeatureFlags getFeatureFlag getFeatureFlagPayload reloadFeatureFlags group updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures getActiveMatchingSurveys getSurveys".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
                  posthog.init('${process.env.NEXT_PUBLIC_POSTHOG_KEY}',{api_host:'${process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com'}'})
                `,
              }}
            />
          </>
        )}
        
        {/* Service Worker Registration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('SW registered: ', registration);
                    })
                    .catch(function(registrationError) {
                      console.log('SW registration failed: ', registrationError);
                    });
                });
              }
            `,
          }}
        />
        
        {/* Performance Observer for Core Web Vitals */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                function vitalsReporter(metric) {
                  if (typeof gtag !== 'undefined') {
                    gtag('event', metric.name, {
                      value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
                      event_category: 'Web Vitals',
                      event_label: metric.id,
                      non_interaction: true,
                    });
                  }
                  
                  if (typeof posthog !== 'undefined') {
                    posthog.capture('web_vital', {
                      metric_name: metric.name,
                      value: metric.value,
                      rating: metric.rating,
                    });
                  }
                }
                
                // Import Web Vitals if available
                import('https://cdn.skypack.dev/web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
                  getCLS(vitalsReporter);
                  getFID(vitalsReporter);
                  getFCP(vitalsReporter);
                  getLCP(vitalsReporter);
                  getTTFB(vitalsReporter);
                }).catch(() => {
                  // Web Vitals not available
                });
              } catch (error) {
                // Silently handle errors
              }
            `,
          }}
        />
      </body>
    </html>
  )
}