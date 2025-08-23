import { NextResponse } from 'next/server'

// Prometheus-style metrics endpoint for monitoring
export async function GET() {
  try {
    const metrics = generatePrometheusMetrics()
    
    return new Response(metrics, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; version=0.0.4; charset=utf-8',
        'Cache-Control': 'no-store, no-cache, must-revalidate'
      }
    })
  } catch (error) {
    console.error('Metrics generation failed:', error)
    
    return NextResponse.json(
      {
        error: 'Metrics generation failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

function generatePrometheusMetrics(): string {
  const timestamp = Date.now()
  const uptime = process.uptime()
  const memoryUsage = process.memoryUsage()
  const cpuUsage = process.cpuUsage()

  let metrics = `# HELP omniverse_geckos_info Application information
# TYPE omniverse_geckos_info gauge
omniverse_geckos_info{version="${process.env.npm_package_version || '1.0.0'}",node_version="${process.version}",environment="${process.env.NODE_ENV || 'unknown'}"} 1

# HELP omniverse_geckos_uptime_seconds Process uptime in seconds
# TYPE omniverse_geckos_uptime_seconds counter
omniverse_geckos_uptime_seconds ${uptime}

# HELP omniverse_geckos_memory_usage_bytes Memory usage by type
# TYPE omniverse_geckos_memory_usage_bytes gauge
omniverse_geckos_memory_usage_bytes{type="rss"} ${memoryUsage.rss}
omniverse_geckos_memory_usage_bytes{type="heap_used"} ${memoryUsage.heapUsed}
omniverse_geckos_memory_usage_bytes{type="heap_total"} ${memoryUsage.heapTotal}
omniverse_geckos_memory_usage_bytes{type="external"} ${memoryUsage.external}

# HELP omniverse_geckos_cpu_usage_microseconds CPU usage in microseconds
# TYPE omniverse_geckos_cpu_usage_microseconds counter
omniverse_geckos_cpu_usage_microseconds{type="user"} ${cpuUsage.user}
omniverse_geckos_cpu_usage_microseconds{type="system"} ${cpuUsage.system}

# HELP omniverse_geckos_service_status Service health status (1=healthy, 0=unhealthy, -1=unknown)
# TYPE omniverse_geckos_service_status gauge
omniverse_geckos_service_status{service="database"} ${getDatabaseStatus()}
omniverse_geckos_service_status{service="redis"} ${getRedisStatus()}
omniverse_geckos_service_status{service="ai_openai"} ${getOpenAIStatus()}
omniverse_geckos_service_status{service="ai_anthropic"} ${getAnthropicStatus()}
omniverse_geckos_service_status{service="ai_huggingface"} ${getHuggingFaceStatus()}
omniverse_geckos_service_status{service="blockchain_infura"} ${getInfuraStatus()}
omniverse_geckos_service_status{service="blockchain_alchemy"} ${getAlchemyStatus()}

# HELP omniverse_geckos_feature_enabled Feature enable status
# TYPE omniverse_geckos_feature_enabled gauge
omniverse_geckos_feature_enabled{feature="ai_assistant"} ${getFeatureStatus('ENABLE_AI_ASSISTANT')}
omniverse_geckos_feature_enabled{feature="ai_nft_generation"} ${getFeatureStatus('ENABLE_AI_NFT_GENERATION')}
omniverse_geckos_feature_enabled{feature="ai_personalization"} ${getFeatureStatus('ENABLE_AI_PERSONALIZATION')}
omniverse_geckos_feature_enabled{feature="ai_game_analysis"} ${getFeatureStatus('ENABLE_AI_GAME_ANALYSIS')}

# HELP omniverse_geckos_contract_deployed Contract deployment status
# TYPE omniverse_geckos_contract_deployed gauge
omniverse_geckos_contract_deployed{contract="token"} ${getContractStatus('NEXT_PUBLIC_CONTRACT_ADDRESS')}
omniverse_geckos_contract_deployed{contract="nft"} ${getContractStatus('NEXT_PUBLIC_NFT_CONTRACT_ADDRESS')}
omniverse_geckos_contract_deployed{contract="marketplace"} ${getContractStatus('NEXT_PUBLIC_MARKETPLACE_CONTRACT_ADDRESS')}

# HELP omniverse_geckos_analytics_configured Analytics service configuration
# TYPE omniverse_geckos_analytics_configured gauge
omniverse_geckos_analytics_configured{service="google_analytics"} ${getAnalyticsStatus('NEXT_PUBLIC_GA4_ID')}
omniverse_geckos_analytics_configured{service="posthog"} ${getAnalyticsStatus('NEXT_PUBLIC_POSTHOG_KEY')}
omniverse_geckos_analytics_configured{service="sentry"} ${getAnalyticsStatus('NEXT_PUBLIC_SENTRY_DSN')}
omniverse_geckos_analytics_configured{service="vercel"} ${getAnalyticsStatus('NEXT_PUBLIC_VERCEL_ANALYTICS_ID')}

# HELP omniverse_geckos_build_info Build information
# TYPE omniverse_geckos_build_info gauge
omniverse_geckos_build_info{commit="${process.env.VERCEL_GIT_COMMIT_SHA || 'unknown'}",build_time="${process.env.BUILD_TIME || 'unknown'}"} 1

# HELP omniverse_geckos_last_updated_timestamp Last metrics update timestamp
# TYPE omniverse_geckos_last_updated_timestamp gauge
omniverse_geckos_last_updated_timestamp ${timestamp}

`

  return metrics
}

// Helper functions to get service status
function getDatabaseStatus(): number {
  return process.env.DATABASE_URL ? 1 : 0
}

function getRedisStatus(): number {
  return process.env.REDIS_URL ? 1 : -1 // Optional service
}

function getOpenAIStatus(): number {
  return process.env.OPENAI_API_KEY ? 1 : 0
}

function getAnthropicStatus(): number {
  return process.env.ANTHROPIC_API_KEY ? 1 : 0
}

function getHuggingFaceStatus(): number {
  return process.env.HUGGINGFACE_API_KEY ? 1 : 0
}

function getInfuraStatus(): number {
  return process.env.NEXT_PUBLIC_INFURA_PROJECT_ID ? 1 : 0
}

function getAlchemyStatus(): number {
  return process.env.NEXT_PUBLIC_ALCHEMY_API_KEY ? 1 : -1 // Alternative to Infura
}

function getFeatureStatus(envVar: string): number {
  return process.env[envVar] === 'true' ? 1 : 0
}

function getContractStatus(envVar: string): number {
  return process.env[envVar] ? 1 : 0
}

function getAnalyticsStatus(envVar: string): number {
  return process.env[envVar] ? 1 : 0
}