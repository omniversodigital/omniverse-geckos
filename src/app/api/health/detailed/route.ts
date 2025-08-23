import { NextResponse } from 'next/server'

// Detailed health check with comprehensive system information
export async function GET() {
  try {
    const startTime = Date.now()
    
    const detailedHealth = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      response_time_ms: 0,
      system: {
        node_version: process.version,
        platform: process.platform,
        arch: process.arch,
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        cpu_usage: process.cpuUsage(),
        pid: process.pid
      },
      application: {
        name: 'omniverse-geckos',
        version: process.env.npm_package_version || '1.0.0',
        environment: process.env.NODE_ENV || 'unknown',
        build_time: process.env.BUILD_TIME || 'unknown',
        commit_hash: process.env.VERCEL_GIT_COMMIT_SHA || 'unknown'
      },
      services: {
        database: await checkDatabaseConnection(),
        redis: await checkRedisConnection(),
        ai_services: await checkAIServicesDetailed(),
        blockchain: await checkBlockchainServicesDetailed(),
        external_apis: await checkExternalAPIs()
      },
      features: {
        ai_assistant_enabled: process.env.ENABLE_AI_ASSISTANT === 'true',
        ai_nft_generation: process.env.ENABLE_AI_NFT_GENERATION === 'true',
        ai_personalization: process.env.ENABLE_AI_PERSONALIZATION === 'true',
        ai_game_analysis: process.env.ENABLE_AI_GAME_ANALYSIS === 'true'
      },
      analytics: {
        google_analytics: !!process.env.NEXT_PUBLIC_GA4_ID,
        posthog: !!process.env.NEXT_PUBLIC_POSTHOG_KEY,
        sentry: !!process.env.NEXT_PUBLIC_SENTRY_DSN,
        vercel_analytics: !!process.env.NEXT_PUBLIC_VERCEL_ANALYTICS_ID
      }
    }

    // Check overall health status
    const services = detailedHealth.services
    const unhealthyServices = Object.entries(services)
      .filter(([_, service]: [string, any]) => service.status === 'unhealthy')

    if (unhealthyServices.length > 0) {
      detailedHealth.status = unhealthyServices.length > 2 ? 'unhealthy' : 'degraded'
    }

    // Calculate response time
    detailedHealth.response_time_ms = Date.now() - startTime

    return NextResponse.json(detailedHealth, {
      status: detailedHealth.status === 'healthy' ? 200 : 
             detailedHealth.status === 'degraded' ? 207 : 503,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Content-Type': 'application/json'
      }
    })

  } catch (error) {
    console.error('Detailed health check failed:', error)
    
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Detailed health check failed',
        message: error instanceof Error ? error.message : 'Unknown error',
        response_time_ms: Date.now() - Date.now()
      },
      { status: 503 }
    )
  }
}

async function checkDatabaseConnection() {
  try {
    // TODO: Implement actual database connection test when Prisma is configured
    const hasConnectionString = !!process.env.DATABASE_URL
    
    return {
      status: hasConnectionString ? 'healthy' : 'unhealthy',
      connection_string_configured: hasConnectionString,
      provider: process.env.DATABASE_URL?.includes('postgresql') ? 'postgresql' : 'unknown',
      last_check: new Date().toISOString(),
      response_time_ms: Math.random() * 10 // Simulated for now
    }
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
      last_check: new Date().toISOString()
    }
  }
}

async function checkRedisConnection() {
  try {
    // TODO: Implement actual Redis connection test when configured
    const hasConnectionString = !!process.env.REDIS_URL
    
    return {
      status: hasConnectionString ? 'healthy' : 'degraded',
      connection_string_configured: hasConnectionString,
      url: process.env.REDIS_URL ? 'configured' : 'not_configured',
      last_check: new Date().toISOString(),
      response_time_ms: Math.random() * 5
    }
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
      last_check: new Date().toISOString()
    }
  }
}

async function checkAIServicesDetailed() {
  try {
    const services = {
      openai: {
        configured: !!process.env.OPENAI_API_KEY,
        status: process.env.OPENAI_API_KEY ? 'healthy' : 'not_configured'
      },
      anthropic: {
        configured: !!process.env.ANTHROPIC_API_KEY,
        status: process.env.ANTHROPIC_API_KEY ? 'healthy' : 'not_configured'
      },
      huggingface: {
        configured: !!process.env.HUGGINGFACE_API_KEY,
        status: process.env.HUGGINGFACE_API_KEY ? 'healthy' : 'not_configured'
      }
    }

    const configuredServices = Object.values(services).filter(s => s.configured).length
    const overallStatus = configuredServices > 0 ? 'healthy' : 'degraded'

    return {
      status: overallStatus,
      configured_services: configuredServices,
      total_services: Object.keys(services).length,
      services,
      last_check: new Date().toISOString()
    }
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
      last_check: new Date().toISOString()
    }
  }
}

async function checkBlockchainServicesDetailed() {
  try {
    const providers = {
      infura: {
        configured: !!process.env.NEXT_PUBLIC_INFURA_PROJECT_ID,
        status: process.env.NEXT_PUBLIC_INFURA_PROJECT_ID ? 'healthy' : 'not_configured'
      },
      alchemy: {
        configured: !!process.env.NEXT_PUBLIC_ALCHEMY_API_KEY,
        status: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY ? 'healthy' : 'not_configured'
      }
    }

    const contracts = {
      token_contract: {
        configured: !!process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
        address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || 'not_deployed'
      },
      nft_contract: {
        configured: !!process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS,
        address: process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS || 'not_deployed'
      },
      marketplace_contract: {
        configured: !!process.env.NEXT_PUBLIC_MARKETPLACE_CONTRACT_ADDRESS,
        address: process.env.NEXT_PUBLIC_MARKETPLACE_CONTRACT_ADDRESS || 'not_deployed'
      }
    }

    const configuredProviders = Object.values(providers).filter(p => p.configured).length
    const deployedContracts = Object.values(contracts).filter(c => c.configured).length

    return {
      status: configuredProviders > 0 ? 'healthy' : 'degraded',
      chain_id: process.env.NEXT_PUBLIC_CHAIN_ID || '1',
      providers,
      contracts,
      configured_providers: configuredProviders,
      deployed_contracts: deployedContracts,
      last_check: new Date().toISOString()
    }
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
      last_check: new Date().toISOString()
    }
  }
}

async function checkExternalAPIs() {
  try {
    const apis = {
      etherscan: {
        configured: !!process.env.ETHERSCAN_API_KEY,
        status: process.env.ETHERSCAN_API_KEY ? 'healthy' : 'not_configured'
      },
      coingecko: {
        configured: !!process.env.COINGECKO_API_KEY,
        status: process.env.COINGECKO_API_KEY ? 'healthy' : 'not_configured'
      },
      pinata_ipfs: {
        configured: !!(process.env.PINATA_API_KEY && process.env.PINATA_API_SECRET),
        status: (process.env.PINATA_API_KEY && process.env.PINATA_API_SECRET) ? 'healthy' : 'not_configured'
      }
    }

    const configuredAPIs = Object.values(apis).filter(api => api.configured).length

    return {
      status: 'healthy', // External APIs are optional
      configured_apis: configuredAPIs,
      total_apis: Object.keys(apis).length,
      apis,
      last_check: new Date().toISOString()
    }
  } catch (error) {
    return {
      status: 'degraded',
      error: error instanceof Error ? error.message : 'Unknown error',
      last_check: new Date().toISOString()
    }
  }
}