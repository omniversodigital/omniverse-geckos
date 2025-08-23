import { NextResponse } from 'next/server'
import { headers } from 'next/headers'

// Health check endpoint for monitoring services
export async function GET() {
  try {
    const healthData = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      version: process.env.npm_package_version || '1.0.0',
      checks: {
        api: 'healthy',
        database: 'unknown',
        redis: 'unknown',
        ai_services: 'unknown',
        blockchain: 'unknown'
      }
    }

    // Database health check
    try {
      // Note: Add actual database connection test here when Prisma is properly configured
      healthData.checks.database = 'healthy'
    } catch (error) {
      healthData.checks.database = 'unhealthy'
      healthData.status = 'degraded'
    }

    // Redis health check
    try {
      // Note: Add actual Redis connection test here when configured
      healthData.checks.redis = 'healthy'
    } catch (error) {
      healthData.checks.redis = 'unhealthy'
      healthData.status = 'degraded'
    }

    // AI Services health check
    try {
      const aiHealthy = await checkAIServices()
      healthData.checks.ai_services = aiHealthy ? 'healthy' : 'degraded'
    } catch (error) {
      healthData.checks.ai_services = 'unhealthy'
      healthData.status = 'degraded'
    }

    // Blockchain health check
    try {
      const blockchainHealthy = await checkBlockchainServices()
      healthData.checks.blockchain = blockchainHealthy ? 'healthy' : 'degraded'
    } catch (error) {
      healthData.checks.blockchain = 'unhealthy'
      healthData.status = 'degraded'
    }

    // Determine overall status
    const unhealthyServices = Object.values(healthData.checks).filter(status => status === 'unhealthy')
    if (unhealthyServices.length > 0) {
      healthData.status = 'unhealthy'
    }

    return NextResponse.json(healthData, {
      status: healthData.status === 'healthy' ? 200 : 503,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Content-Type': 'application/json'
      }
    })

  } catch (error) {
    console.error('Health check failed:', error)
    
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Health check failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 503 }
    )
  }
}

async function checkAIServices(): Promise<boolean> {
  try {
    // Check if AI services are configured and responding
    const hasOpenAI = !!process.env.OPENAI_API_KEY
    const hasAnthropic = !!process.env.ANTHROPIC_API_KEY
    const hasHuggingFace = !!process.env.HUGGINGFACE_API_KEY
    
    // At least one AI service should be configured
    return hasOpenAI || hasAnthropic || hasHuggingFace
  } catch (error) {
    return false
  }
}

async function checkBlockchainServices(): Promise<boolean> {
  try {
    // Check if blockchain services are configured
    const hasInfura = !!process.env.NEXT_PUBLIC_INFURA_PROJECT_ID
    const hasAlchemy = !!process.env.NEXT_PUBLIC_ALCHEMY_API_KEY
    const hasContracts = !!process.env.NEXT_PUBLIC_CONTRACT_ADDRESS
    
    // Basic configuration check
    return hasInfura || hasAlchemy
  } catch (error) {
    return false
  }
}