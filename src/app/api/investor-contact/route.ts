import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// Validation schema
const investorContactSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  company: z.string().min(2),
  position: z.string().min(2),
  investmentRange: z.enum([
    '10k-50k',
    '50k-100k', 
    '100k-500k',
    '500k-1m',
    '1m-5m',
    '5m+'
  ]),
  investmentType: z.array(z.string()).min(1),
  timeline: z.enum(['immediate', '1-3months', '3-6months', '6-12months', 'exploring']),
  experience: z.enum(['first-time', 'some-experience', 'experienced', 'expert']),
  interests: z.array(z.string()).min(1),
  linkedinUrl: z.string().url().optional().or(z.literal('')),
  website: z.string().url().optional().or(z.literal('')),
  message: z.string().min(10),
  requestMeeting: z.boolean().default(false),
  subscribeUpdates: z.boolean().default(true),
  agreeToTerms: z.boolean().refine(val => val === true)
})

type InvestorContactData = z.infer<typeof investorContactSchema>

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate the request data
    const validatedData = investorContactSchema.parse(body)
    
    // Get request metadata
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown'
    const userAgent = request.headers.get('user-agent') || ''
    const referer = request.headers.get('referer') || ''
    
    // Create submission record with enhanced metadata for investors
    const submissionData = {
      ...validatedData,
      submittedAt: new Date().toISOString(),
      leadScore: calculateLeadScore(validatedData),
      priority: getPriority(validatedData),
      metadata: {
        ip: ip.split(',')[0].trim(),
        userAgent,
        referer,
        timestamp: new Date().toISOString(),
        utm_source: extractUTMParam(referer, 'utm_source'),
        utm_medium: extractUTMParam(referer, 'utm_medium'),
        utm_campaign: extractUTMParam(referer, 'utm_campaign')
      }
    }

    // Log submission (in production, this would go to CRM/database)
    if (process.env.NODE_ENV === 'development') {
      console.log('💰 Investor Inquiry:', JSON.stringify({
        ...submissionData,
        // Hide sensitive data in logs
        message: '[REDACTED]',
        email: '[REDACTED]'
      }, null, 2))
    }

    // Process the investor inquiry
    await Promise.allSettled([
      saveToCRM(submissionData),
      sendToInvestorTeam(submissionData),
      sendAutoReply(submissionData),
      updateInvestorAnalytics(submissionData)
    ])

    // Track successful investor inquiry
    await fetch('/api/analytics/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        events: [{
          category: 'investment',
          action: 'investor_inquiry',
          label: validatedData.investmentRange,
          value: getInvestmentRangeValue(validatedData.investmentRange),
          metadata: {
            company: validatedData.company,
            position: validatedData.position,
            investment_type: validatedData.investmentType,
            timeline: validatedData.timeline,
            experience: validatedData.experience,
            interests: validatedData.interests,
            request_meeting: validatedData.requestMeeting,
            lead_score: submissionData.leadScore,
            priority: submissionData.priority
          }
        }]
      })
    }).catch(error => {
      console.warn('Failed to track investor analytics:', error)
    })

    return NextResponse.json({
      success: true,
      message: 'Investment inquiry submitted successfully!',
      data: {
        email: validatedData.email,
        company: validatedData.company,
        investmentRange: validatedData.investmentRange,
        priority: submissionData.priority,
        nextSteps: getNextSteps(validatedData)
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Investor contact error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        message: 'Invalid form data',
        errors: error.errors
      }, { status: 400 })
    }

    return NextResponse.json({
      success: false,
      message: 'Failed to process investor inquiry',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    }, { status: 500 })
  }
}

// Calculate lead score based on investment criteria
function calculateLeadScore(data: InvestorContactData): number {
  let score = 0
  
  // Investment range scoring
  const rangeScores = {
    '10k-50k': 20,
    '50k-100k': 40,
    '100k-500k': 60,
    '500k-1m': 80,
    '1m-5m': 90,
    '5m+': 100
  }
  score += rangeScores[data.investmentRange] || 0
  
  // Timeline urgency
  const timelineScores = {
    'immediate': 40,
    '1-3months': 30,
    '3-6months': 20,
    '6-12months': 10,
    'exploring': 5
  }
  score += timelineScores[data.timeline] || 0
  
  // Experience level
  const experienceScores = {
    'expert': 30,
    'experienced': 25,
    'some-experience': 15,
    'first-time': 10
  }
  score += experienceScores[data.experience] || 0
  
  // Investment type diversity
  score += Math.min(data.investmentType.length * 5, 20)
  
  // Interest alignment
  score += Math.min(data.interests.length * 3, 15)
  
  // Meeting request bonus
  if (data.requestMeeting) score += 15
  
  // LinkedIn/website presence
  if (data.linkedinUrl) score += 5
  if (data.website) score += 5
  
  return Math.min(score, 100)
}

// Determine priority level
function getPriority(data: InvestorContactData): 'high' | 'medium' | 'low' {
  const score = calculateLeadScore(data)
  
  if (score >= 80) return 'high'
  if (score >= 50) return 'medium'
  return 'low'
}

// Get investment range numeric value for analytics
function getInvestmentRangeValue(range: string): number {
  const values = {
    '10k-50k': 30000,
    '50k-100k': 75000,
    '100k-500k': 300000,
    '500k-1m': 750000,
    '1m-5m': 3000000,
    '5m+': 10000000
  }
  return values[range as keyof typeof values] || 0
}

// Extract UTM parameters from referrer
function extractUTMParam(url: string, param: string): string | undefined {
  try {
    const urlObj = new URL(url)
    return urlObj.searchParams.get(param) || undefined
  } catch {
    return undefined
  }
}

// Get next steps based on investor profile
function getNextSteps(data: InvestorContactData): string[] {
  const steps = ['We\'ll review your inquiry within 24 hours']
  
  if (data.requestMeeting) {
    steps.push('You\'ll receive a calendar link to schedule a meeting')
  }
  
  steps.push('You\'ll receive our investor deck and financial projections')
  
  if (data.timeline === 'immediate') {
    steps.push('Priority review due to immediate timeline')
  }
  
  return steps
}

// CRM integration (placeholder)
async function saveToCRM(data: InvestorContactData & { submittedAt: string; leadScore: number; priority: string; metadata: any }) {
  try {
    // TODO: Integrate with CRM (HubSpot, Salesforce, Pipedrive, etc.)
    // Example with HubSpot:
    // await fetch('https://api.hubapi.com/crm/v3/objects/contacts', {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${process.env.HUBSPOT_ACCESS_TOKEN}`,
    //     'Content-Type': 'application/json'
    //   },
    //   body: JSON.stringify({
    //     properties: {
    //       email: data.email,
    //       firstname: data.fullName.split(' ')[0],
    //       lastname: data.fullName.split(' ').slice(1).join(' '),
    //       company: data.company,
    //       jobtitle: data.position,
    //       investment_range: data.investmentRange,
    //       lead_score: data.leadScore,
    //       priority: data.priority,
    //       website: data.website,
    //       linkedin_url: data.linkedinUrl
    //     }
    //   })
    // })

    console.log('💾 Saved to CRM:', data.email, `(Score: ${data.leadScore}, Priority: ${data.priority})`)
    return { success: true }
  } catch (error) {
    console.error('CRM save failed:', error)
    return { success: false, error }
  }
}

// Send notification to investor team
async function sendToInvestorTeam(data: InvestorContactData & { submittedAt: string; leadScore: number; priority: string; metadata: any }) {
  try {
    // High priority notifications (Slack)
    if (data.priority === 'high' && process.env.SLACK_INVESTOR_WEBHOOK) {
      await fetch(process.env.SLACK_INVESTOR_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: '🚨 HIGH PRIORITY Investor Inquiry!',
          attachments: [{
            color: data.priority === 'high' ? 'danger' : 'warning',
            fields: [
              { title: 'Investor', value: `${data.fullName} (${data.company})`, short: true },
              { title: 'Investment Range', value: data.investmentRange, short: true },
              { title: 'Timeline', value: data.timeline, short: true },
              { title: 'Experience', value: data.experience, short: true },
              { title: 'Lead Score', value: `${data.leadScore}/100`, short: true },
              { title: 'Meeting Requested', value: data.requestMeeting ? 'Yes' : 'No', short: true },
              { title: 'Investment Types', value: data.investmentType.join(', '), short: false },
              { title: 'Message Preview', value: data.message.substring(0, 200) + '...', short: false }
            ],
            actions: [{
              type: 'button',
              text: 'View Full Inquiry',
              url: `${process.env.NEXT_PUBLIC_APP_URL}/admin/investors/${data.email}`
            }]
          }]
        })
      })
    }

    // Email notification to investor team
    if (process.env.INVESTOR_TEAM_EMAIL) {
      // TODO: Send detailed email to investor team
      console.log('📧 Investor team notified:', data.email)
    }

    // Discord notification for all investor inquiries
    if (process.env.DISCORD_INVESTOR_WEBHOOK) {
      const priorityEmojis = { high: '🔥', medium: '⚡', low: '💡' }
      
      await fetch(process.env.DISCORD_INVESTOR_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          embeds: [{
            title: `${priorityEmojis[data.priority as keyof typeof priorityEmojis]} New Investor Inquiry`,
            color: data.priority === 'high' ? 15548997 : data.priority === 'medium' ? 16776960 : 5793266,
            fields: [
              { name: '👤 Investor', value: `**${data.fullName}**\n${data.position} at ${data.company}`, inline: true },
              { name: '💰 Investment', value: `**${data.investmentRange}**\n${data.timeline}`, inline: true },
              { name: '📊 Lead Score', value: `**${data.leadScore}/100**\n${data.priority.toUpperCase()} priority`, inline: true },
              { name: '🎯 Investment Types', value: data.investmentType.join(', '), inline: false },
              { name: '🏢 Company Info', value: [data.website, data.linkedinUrl].filter(Boolean).join('\n') || 'Not provided', inline: false }
            ],
            timestamp: new Date().toISOString(),
            footer: {
              text: `Meeting requested: ${data.requestMeeting ? 'Yes' : 'No'}`
            }
          }]
        })
      })
    }

    return { success: true }
  } catch (error) {
    console.error('Team notification failed:', error)
    return { success: false, error }
  }
}

// Send auto-reply to investor
async function sendAutoReply(data: InvestorContactData & { submittedAt: string; leadScore: number; priority: string; metadata: any }) {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.warn('No email service configured for auto-reply')
      return { success: false, reason: 'No email service' }
    }

    // TODO: Send personalized auto-reply email
    // const { Resend } = require('resend')
    // const resend = new Resend(process.env.RESEND_API_KEY)
    
    // await resend.emails.send({
    //   from: 'Omniverse Geckos Investor Relations <investors@omniversegeckos.com>',
    //   to: [data.email],
    //   subject: '🦎 Thank you for your investment interest in Omniverse Geckos',
    //   html: generateInvestorAutoReply(data)
    // })

    console.log('✉️ Auto-reply sent to investor:', data.email)
    return { success: true }
  } catch (error) {
    console.error('Auto-reply failed:', error)
    return { success: false, error }
  }
}

// Update investor-specific analytics
async function updateInvestorAnalytics(data: InvestorContactData & { submittedAt: string; leadScore: number; priority: string; metadata: any }) {
  try {
    // Update internal metrics about investor interest
    // This would typically go to a separate analytics database
    console.log('📈 Updated investor analytics:', {
      investmentRange: data.investmentRange,
      timeline: data.timeline,
      leadScore: data.leadScore,
      priority: data.priority
    })
    
    return { success: true }
  } catch (error) {
    console.error('Investor analytics update failed:', error)
    return { success: false, error }
  }
}

// Generate investor auto-reply email template
function generateInvestorAutoReply(data: InvestorContactData & { priority: string }): string {
  const priorityMessages = {
    high: 'Due to your significant investment capacity and immediate timeline, we\'ve marked your inquiry as high priority.',
    medium: 'We appreciate your interest and will prioritize your inquiry accordingly.',
    low: 'Thank you for your interest in exploring investment opportunities with us.'
  }

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>Investment Inquiry Received - Omniverse Geckos</title>
    </head>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #1f2937; margin-bottom: 10px;">🦎 Thank You for Your Interest!</h1>
        <p style="color: #6b7280; font-size: 18px;">We've received your investment inquiry</p>
      </div>
      
      <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h2 style="color: #1f2937; margin-top: 0;">Next Steps</h2>
        <p style="color: #4b5563; line-height: 1.6;">
          ${priorityMessages[data.priority as keyof typeof priorityMessages]}
        </p>
        <ul style="color: #4b5563; line-height: 1.6;">
          <li>📋 <strong>Review:</strong> Our team will review your inquiry within 24 hours</li>
          <li>📊 <strong>Materials:</strong> You'll receive our investor deck and financial projections</li>
          ${data.requestMeeting ? '<li>🤝 <strong>Meeting:</strong> We\'ll send you a calendar link to schedule a discussion</li>' : ''}
          <li>📞 <strong>Follow-up:</strong> A member of our investor relations team will contact you directly</li>
        </ul>
      </div>
      
      <div style="background-color: #ecfdf5; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #10b981;">
        <h3 style="color: #065f46; margin-top: 0;">Why Omniverse Geckos?</h3>
        <ul style="color: #047857; line-height: 1.6; margin: 0;">
          <li>🎮 Revolutionary Web3 gaming platform</li>
          <li>💰 Multi-revenue stream business model</li>
          <li>🚀 Experienced team with proven track record</li>
          <li>📈 Strong early traction and community growth</li>
        </ul>
      </div>
      
      ${data.priority === 'high' ? `
      <div style="background-color: #fef2f2; padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #ef4444;">
        <p style="color: #b91c1c; margin: 0; font-weight: 600;">
          🔥 High Priority Inquiry - Our team will contact you within 12 hours
        </p>
      </div>
      ` : ''}
      
      <div style="text-center; margin: 30px 0;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/docs/investor-deck" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-right: 10px;">Download Investor Deck</a>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/docs/whitepaper" style="background-color: #6b7280; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Read Whitepaper</a>
      </div>
      
      <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; text-align: center; color: #6b7280; font-size: 14px;">
        <p><strong>Omniverse Geckos Investor Relations</strong></p>
        <p>📧 investors@omniversegeckos.com | 🌐 <a href="${process.env.NEXT_PUBLIC_APP_URL}">omniversegeckos.com</a></p>
        <p>This is an automated response. A team member will follow up personally within 24 hours.</p>
      </div>
    </body>
    </html>
  `
}