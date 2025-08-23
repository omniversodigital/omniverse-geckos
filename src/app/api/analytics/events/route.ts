import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'

// Analytics events API for tracking custom events
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { events } = body

    if (!events || !Array.isArray(events)) {
      return NextResponse.json(
        { error: 'Invalid events format. Expected array of events.' },
        { status: 400 }
      )
    }

    // Validate and process events
    const processedEvents = []
    const errors = []

    for (let i = 0; i < events.length; i++) {
      const event = events[i]
      
      try {
        const validatedEvent = validateEvent(event)
        if (validatedEvent) {
          processedEvents.push(validatedEvent)
        }
      } catch (error) {
        errors.push({
          index: i,
          error: error instanceof Error ? error.message : 'Unknown error',
          event
        })
      }
    }

    // Log events for analytics processing
    if (processedEvents.length > 0) {
      await logAnalyticsEvents(processedEvents, request)
    }

    return NextResponse.json({
      success: true,
      processed: processedEvents.length,
      errors: errors.length,
      timestamp: new Date().toISOString(),
      ...(errors.length > 0 && { errors })
    })

  } catch (error) {
    console.error('Analytics events API error:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process analytics events',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

function validateEvent(event: any) {
  // Required fields
  if (!event.category || !event.action) {
    throw new Error('Event must have category and action fields')
  }

  // Valid categories
  const validCategories = [
    'investment', 'game', 'nft', 'token', 'user', 'marketplace', 
    'ai', 'performance', 'error', 'navigation'
  ]
  
  if (!validCategories.includes(event.category)) {
    throw new Error(`Invalid category. Must be one of: ${validCategories.join(', ')}`)
  }

  // Sanitize and structure event
  const validatedEvent = {
    category: event.category,
    action: event.action,
    label: event.label || null,
    value: typeof event.value === 'number' ? event.value : null,
    metadata: event.metadata && typeof event.metadata === 'object' ? event.metadata : {},
    timestamp: new Date().toISOString(),
    session_id: event.session_id || null,
    user_id: event.user_id || null,
    wallet_address: event.wallet_address || null
  }

  return validatedEvent
}

async function logAnalyticsEvents(events: any[], request: NextRequest) {
  try {
    // Get request metadata
    const headersList = headers()
    const userAgent = headersList.get('user-agent') || ''
    const referer = headersList.get('referer') || ''
    const ip = headersList.get('x-forwarded-for') || 
               headersList.get('x-real-ip') || 
               'unknown'

    // Enrich events with request context
    const enrichedEvents = events.map(event => ({
      ...event,
      request_context: {
        ip: ip.split(',')[0].trim(), // Get first IP if multiple
        user_agent: userAgent,
        referer,
        timestamp: new Date().toISOString(),
        url: request.url
      }
    }))

    // Log to console for development
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Analytics Events:', JSON.stringify(enrichedEvents, null, 2))
    }

    // Here you would typically send to your analytics service
    // Examples:

    // Send to external analytics services
    await Promise.allSettled([
      sendToGoogleAnalytics(enrichedEvents),
      sendToPostHog(enrichedEvents),
      sendToMixpanel(enrichedEvents),
      storeInDatabase(enrichedEvents)
    ])

  } catch (error) {
    console.error('Failed to log analytics events:', error)
  }
}

async function sendToGoogleAnalytics(events: any[]) {
  if (!process.env.NEXT_PUBLIC_GA4_ID) return

  try {
    // Convert to GA4 format and send
    const gaEvents = events.map(event => ({
      name: `${event.category}_${event.action}`,
      parameters: {
        event_category: event.category,
        event_label: event.label,
        value: event.value,
        custom_parameters: event.metadata
      }
    }))

    // TODO: Implement actual GA4 Measurement Protocol
    console.log('Would send to GA4:', gaEvents)
  } catch (error) {
    console.error('GA4 send failed:', error)
  }
}

async function sendToPostHog(events: any[]) {
  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return

  try {
    const posthogEvents = events.map(event => ({
      event: `${event.category}_${event.action}`,
      properties: {
        ...event.metadata,
        category: event.category,
        action: event.action,
        label: event.label,
        value: event.value,
        ip: event.request_context.ip
      },
      timestamp: event.timestamp
    }))

    // TODO: Implement actual PostHog API call
    console.log('Would send to PostHog:', posthogEvents)
  } catch (error) {
    console.error('PostHog send failed:', error)
  }
}

async function sendToMixpanel(events: any[]) {
  if (!process.env.NEXT_PUBLIC_MIXPANEL_TOKEN) return

  try {
    const mixpanelEvents = events.map(event => ({
      event: `${event.category}_${event.action}`,
      properties: {
        ...event.metadata,
        category: event.category,
        action: event.action,
        label: event.label,
        value: event.value,
        time: new Date(event.timestamp).getTime(),
        ip: event.request_context.ip
      }
    }))

    // TODO: Implement actual Mixpanel API call
    console.log('Would send to Mixpanel:', mixpanelEvents)
  } catch (error) {
    console.error('Mixpanel send failed:', error)
  }
}

async function storeInDatabase(events: any[]) {
  try {
    // TODO: Store events in database for internal analytics
    // This would use Prisma to store in your analytics table
    
    console.log(`Would store ${events.length} events in database`)
  } catch (error) {
    console.error('Database storage failed:', error)
  }
}