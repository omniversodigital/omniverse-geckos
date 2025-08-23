import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// Validation schema
const earlyAccessSchema = z.object({
  email: z.string().email(),
  fullName: z.string().min(2),
  userType: z.enum(['investor', 'gamer', 'developer', 'influencer', 'other']),
  interests: z.array(z.string()).min(1),
  walletAddress: z.string().optional(),
  socialHandle: z.string().optional(),
  message: z.string().optional(),
  agreeToTerms: z.boolean().refine(val => val === true),
  subscribeNewsletter: z.boolean().default(true)
})

type EarlyAccessData = z.infer<typeof earlyAccessSchema>

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate the request data
    const validatedData = earlyAccessSchema.parse(body)
    
    // Get request metadata
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown'
    const userAgent = request.headers.get('user-agent') || ''
    const referer = request.headers.get('referer') || ''
    
    // Create submission record
    const submissionData = {
      ...validatedData,
      submittedAt: new Date().toISOString(),
      metadata: {
        ip: ip.split(',')[0].trim(),
        userAgent,
        referer,
        timestamp: new Date().toISOString()
      }
    }

    // Log submission (in production, this would go to database)
    if (process.env.NODE_ENV === 'development') {
      console.log('🎉 Early Access Submission:', JSON.stringify(submissionData, null, 2))
    }

    // Here you would typically:
    // 1. Save to database
    // 2. Add to email list (Mailchimp, ConvertKit, etc.)
    // 3. Send welcome email
    // 4. Notify team via Slack/Discord

    // For MVP, we'll simulate these actions
    await Promise.allSettled([
      saveToDatabase(submissionData),
      addToEmailList(submissionData),
      sendWelcomeEmail(submissionData),
      notifyTeam(submissionData)
    ])

    // Track successful signup
    await fetch('/api/analytics/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        events: [{
          category: 'investment',
          action: 'early_access_signup',
          label: validatedData.userType,
          metadata: {
            interests: validatedData.interests,
            has_wallet: !!validatedData.walletAddress,
            has_social: !!validatedData.socialHandle,
            newsletter_opt_in: validatedData.subscribeNewsletter
          }
        }]
      })
    }).catch(error => {
      console.warn('Failed to track analytics:', error)
    })

    return NextResponse.json({
      success: true,
      message: 'Successfully joined early access!',
      data: {
        email: validatedData.email,
        userType: validatedData.userType,
        interests: validatedData.interests
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Early access signup error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        message: 'Invalid form data',
        errors: error.errors
      }, { status: 400 })
    }

    return NextResponse.json({
      success: false,
      message: 'Failed to process early access signup',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    }, { status: 500 })
  }
}

// Database operations (placeholder for now)
async function saveToDatabase(data: EarlyAccessData & { submittedAt: string; metadata: any }) {
  try {
    // TODO: Implement actual database save
    // const result = await prisma.earlyAccessSignup.create({ data })
    
    console.log('💾 Saved to database:', data.email)
    return { success: true }
  } catch (error) {
    console.error('Database save failed:', error)
    throw error
  }
}

// Email list integration (placeholder)
async function addToEmailList(data: EarlyAccessData & { submittedAt: string; metadata: any }) {
  try {
    // Example with Resend/ConvertKit/Mailchimp
    if (!process.env.RESEND_API_KEY) {
      console.warn('No email service configured')
      return { success: false, reason: 'No email service' }
    }

    // TODO: Add to email list
    // Example with ConvertKit:
    // const response = await fetch('https://api.convertkit.com/v3/forms/{form_id}/subscribe', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     api_key: process.env.CONVERTKIT_API_KEY,
    //     email: data.email,
    //     first_name: data.fullName.split(' ')[0],
    //     tags: data.interests,
    //     fields: {
    //       user_type: data.userType,
    //       wallet_address: data.walletAddress,
    //       social_handle: data.socialHandle
    //     }
    //   })
    // })

    console.log('📧 Added to email list:', data.email)
    return { success: true }
  } catch (error) {
    console.error('Email list add failed:', error)
    return { success: false, error }
  }
}

// Welcome email (placeholder)
async function sendWelcomeEmail(data: EarlyAccessData & { submittedAt: string; metadata: any }) {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.warn('No email service configured')
      return { success: false, reason: 'No email service' }
    }

    // TODO: Send welcome email using Resend
    // const { Resend } = require('resend')
    // const resend = new Resend(process.env.RESEND_API_KEY)
    
    // await resend.emails.send({
    //   from: 'Omniverse Geckos <hello@omniversegeckos.com>',
    //   to: [data.email],
    //   subject: '🦎 Welcome to Omniverse Geckos Early Access!',
    //   html: generateWelcomeEmail(data)
    // })

    console.log('✉️ Welcome email sent to:', data.email)
    return { success: true }
  } catch (error) {
    console.error('Welcome email failed:', error)
    return { success: false, error }
  }
}

// Team notification (placeholder)
async function notifyTeam(data: EarlyAccessData & { submittedAt: string; metadata: any }) {
  try {
    // Example Slack notification
    if (process.env.SLACK_WEBHOOK_URL) {
      await fetch(process.env.SLACK_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: '🎉 New Early Access Signup!',
          attachments: [{
            color: 'good',
            fields: [
              { title: 'Name', value: data.fullName, short: true },
              { title: 'Email', value: data.email, short: true },
              { title: 'User Type', value: data.userType, short: true },
              { title: 'Interests', value: data.interests.join(', '), short: true }
            ]
          }]
        })
      })
    }

    // Example Discord notification
    if (process.env.DISCORD_WEBHOOK_URL) {
      await fetch(process.env.DISCORD_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: null,
          embeds: [{
            title: "🦎 New Early Access Signup!",
            color: 3066993,
            fields: [
              { name: "👤 Name", value: data.fullName, inline: true },
              { name: "📧 Email", value: data.email, inline: true },
              { name: "🎯 Type", value: data.userType, inline: true },
              { name: "🎮 Interests", value: data.interests.join(', '), inline: false }
            ],
            timestamp: new Date().toISOString()
          }]
        })
      })
    }

    console.log('🔔 Team notified about:', data.email)
    return { success: true }
  } catch (error) {
    console.error('Team notification failed:', error)
    return { success: false, error }
  }
}

// Welcome email template
function generateWelcomeEmail(data: EarlyAccessData) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>Welcome to Omniverse Geckos!</title>
    </head>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #1f2937; margin-bottom: 10px;">🦎 Welcome to Omniverse Geckos!</h1>
        <p style="color: #6b7280; font-size: 18px;">You're now part of our exclusive early access community</p>
      </div>
      
      <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h2 style="color: #1f2937; margin-top: 0;">What's Next?</h2>
        <ul style="color: #4b5563; line-height: 1.6;">
          <li>🎮 <strong>Game Demo:</strong> Get exclusive access to our gameplay preview</li>
          <li>🖼️ <strong>NFT Drops:</strong> Early access to limited-edition Gecko NFTs</li>
          <li>💰 <strong>Token Presale:</strong> Priority access to $GECKO token sale</li>
          <li>🤝 <strong>Community:</strong> Join our private Discord for early adopters</li>
        </ul>
      </div>
      
      <div style="text-center; margin: 30px 0;">
        <a href="https://discord.gg/omniversegeckos" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Join Discord Community</a>
      </div>
      
      <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; text-align: center; color: #6b7280; font-size: 14px;">
        <p>Questions? Reply to this email or reach out on our social channels.</p>
        <p>🐦 <a href="https://twitter.com/omniversegeckos">Twitter</a> | 💬 <a href="https://discord.gg/omniversegeckos">Discord</a> | 📱 <a href="https://t.me/omniversegeckos">Telegram</a></p>
      </div>
    </body>
    </html>
  `
}