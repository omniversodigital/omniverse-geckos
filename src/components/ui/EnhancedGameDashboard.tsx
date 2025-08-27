'use client'

import React, { Suspense, memo, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '@/lib/state/GameStateManager'
import { useEnhancedWallet } from '@/blockchain/hooks/useEnhancedWallet'
import { useEnhancedAI } from '@/ai/hooks/useEnhancedAI'
import { useLogger } from '@/lib/monitoring/Logger'
import { ErrorBoundary } from '@/lib/monitoring/ErrorBoundary'
import { LazyLoader } from '@/lib/performance/LazyLoader'

interface GameDashboardProps {
  className?: string
  showAIRecommendations?: boolean
  showWalletMetrics?: boolean
}

const GameStatsCard = memo(({ title, value, change, icon }: {
  title: string
  value: string | number
  change?: number
  icon: React.ReactNode
}) => (
  <motion.div
    className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700 hover:border-green-500 transition-colors"
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
  >
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3">
        {icon}
        <div>
          <p className="text-gray-400 text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
        </div>
      </div>
      {change !== undefined && (
        <div className={`text-sm font-medium ${change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
          {change >= 0 ? '+' : ''}{change}%
        </div>
      )}
    </div>
  </motion.div>
))

const AIRecommendationPanel = memo(() => {
  const { recommendations, requestRecommendation, isAnalyzing } = useEnhancedAI()
  const logger = useLogger('AIRecommendationPanel')
  
  const handleRequestRecommendation = useCallback(async () => {
    try {
      logger.info('Requesting AI recommendation')
      await requestRecommendation()
    } catch (error) {
      logger.error('Failed to request AI recommendation', { error })
    }
  }, [requestRecommendation, logger])

  return (
    <div className="bg-gradient-to-br from-blue-900/50 to-purple-900/50 rounded-xl p-6 border border-blue-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          AI Recommendations
        </h3>
        <button
          onClick={handleRequestRecommendation}
          disabled={isAnalyzing}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg text-white text-sm font-medium transition-colors"
        >
          {isAnalyzing ? 'Analyzing...' : 'Get Advice'}
        </button>
      </div>
      
      <AnimatePresence>
        {recommendations.length > 0 ? (
          <div className="space-y-3">
            {recommendations.slice(0, 3).map((rec, index) => (
              <motion.div
                key={`${rec.type}-${index}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-black/30 rounded-lg p-4 border border-gray-600"
              >
                <div className="flex items-start space-x-3">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    rec.priority === 'high' ? 'bg-red-400' :
                    rec.priority === 'medium' ? 'bg-yellow-400' : 'bg-green-400'
                  }`} />
                  <div>
                    <p className="text-white font-medium">{rec.title}</p>
                    <p className="text-gray-300 text-sm mt-1">{rec.description}</p>
                    <div className="flex items-center mt-2 space-x-4">
                      <span className="text-xs text-blue-400 font-medium">
                        Confidence: {Math.round(rec.confidence * 100)}%
                      </span>
                      <span className="text-xs text-gray-500">
                        {rec.category}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <svg className="w-12 h-12 mx-auto text-gray-600 mb-3" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
            </svg>
            <p className="text-gray-400">No recommendations available</p>
            <p className="text-gray-500 text-sm">Play the game to get AI insights</p>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
})

const WalletMetricsPanel = memo(() => {
  const { metrics, isConnected, networkHealth } = useEnhancedWallet()
  const logger = useLogger('WalletMetricsPanel')

  const metricsData = useMemo(() => [
    {
      title: 'Portfolio Value',
      value: `$${metrics.totalValue.toFixed(2)}`,
      change: 12.5,
      icon: (
        <svg className="w-6 h-6 text-green-400" fill="currentColor" viewBox="0 0 20 20">
          <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"/>
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd"/>
        </svg>
      )
    },
    {
      title: 'GECKO Balance',
      value: metrics.geckoBalance.toFixed(0),
      change: 8.3,
      icon: (
        <svg className="w-6 h-6 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
        </svg>
      )
    },
    {
      title: 'NFT Collection',
      value: metrics.nftCount,
      change: 25.0,
      icon: (
        <svg className="w-6 h-6 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd"/>
        </svg>
      )
    },
    {
      title: 'Gas Saved',
      value: `${(metrics.gasSaved / 1e18).toFixed(4)} ETH`,
      change: -5.2,
      icon: (
        <svg className="w-6 h-6 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"/>
        </svg>
      )
    }
  ], [metrics])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Wallet Metrics</h3>
        <div className={`flex items-center space-x-2 ${
          isConnected ? 'text-green-400' : 'text-red-400'
        }`}>
          <div className={`w-2 h-2 rounded-full ${
            isConnected ? 'bg-green-400' : 'bg-red-400'
          }`} />
          <span className="text-sm font-medium">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {metricsData.map((metric) => (
          <GameStatsCard key={metric.title} {...metric} />
        ))}
      </div>

      {networkHealth && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-gray-800/50 rounded-lg p-4 border border-gray-700"
        >
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-sm">Network Health</span>
            <div className={`text-sm font-medium ${
              networkHealth.isHealthy ? 'text-green-400' : 'text-yellow-400'
            }`}>
              {networkHealth.isHealthy ? 'Healthy' : 'Degraded'}
            </div>
          </div>
          <div className="mt-2 grid grid-cols-3 gap-4 text-xs">
            <div>
              <span className="text-gray-500">Latency</span>
              <p className="text-white font-medium">{networkHealth.latency}ms</p>
            </div>
            <div>
              <span className="text-gray-500">Block Number</span>
              <p className="text-white font-medium">{networkHealth.blockNumber}</p>
            </div>
            <div>
              <span className="text-gray-500">Gas Price</span>
              <p className="text-white font-medium">{networkHealth.gasPrice} gwei</p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
})

export const EnhancedGameDashboard: React.FC<GameDashboardProps> = memo(({
  className = '',
  showAIRecommendations = true,
  showWalletMetrics = true
}) => {
  const gameState = useGameStore(state => ({
    currentLevel: state.currentLevel,
    currentSession: state.currentSession,
    playerStats: state.playerStats
  }))
  
  const logger = useLogger('EnhancedGameDashboard')

  const gameStats = useMemo(() => [
    {
      title: 'Current Level',
      value: gameState.currentLevel || 'None',
      icon: (
        <svg className="w-6 h-6 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 01-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 012 0v1.586l2.293-2.293a1 1 0 111.414 1.414L6.414 15H8a1 1 0 010 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 010-2h1.586l-2.293-2.293a1 1 0 111.414-1.414L15 13.586V12a1 1 0 011-1z" clipRule="evenodd"/>
        </svg>
      )
    },
    {
      title: 'Total Score',
      value: gameState.playerStats?.totalScore || 0,
      change: gameState.playerStats?.scoreGrowth || 0,
      icon: (
        <svg className="w-6 h-6 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
        </svg>
      )
    },
    {
      title: 'Games Played',
      value: gameState.playerStats?.gamesPlayed || 0,
      icon: (
        <svg className="w-6 h-6 text-green-400" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.736 6.979C9.208 6.193 9.696 6 10 6c.304 0 .792.193 1.264.979.457.764.736 1.794.736 3.021 0 1.227-.279 2.257-.736 3.021C10.792 13.807 10.304 14 10 14c-.304 0-.792-.193-1.264-.979C8.279 12.257 8 11.227 8 10c0-1.227.279-2.257.736-3.021z" clipRule="evenodd"/>
        </svg>
      )
    },
    {
      title: 'Win Rate',
      value: `${Math.round((gameState.playerStats?.winRate || 0) * 100)}%`,
      change: gameState.playerStats?.winRateChange || 0,
      icon: (
        <svg className="w-6 h-6 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
        </svg>
      )
    }
  ], [gameState])

  React.useEffect(() => {
    logger.info('Dashboard rendered', {
      currentLevel: gameState.currentLevel,
      hasSession: !!gameState.currentSession,
      showAI: showAIRecommendations,
      showWallet: showWalletMetrics
    })
  }, [gameState, showAIRecommendations, showWalletMetrics, logger])

  return (
    <ErrorBoundary type="game" fallback={<div className="text-red-400">Dashboard unavailable</div>}>
      <div className={`space-y-6 ${className}`}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4"
        >
          {gameStats.map((stat) => (
            <GameStatsCard key={stat.title} {...stat} />
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {showAIRecommendations && (
            <LazyLoader delay={100}>
              <Suspense fallback={<div className="animate-pulse bg-gray-800 rounded-xl h-64" />}>
                <AIRecommendationPanel />
              </Suspense>
            </LazyLoader>
          )}
          
          {showWalletMetrics && (
            <LazyLoader delay={200}>
              <Suspense fallback={<div className="animate-pulse bg-gray-800 rounded-xl h-64" />}>
                <WalletMetricsPanel />
              </Suspense>
            </LazyLoader>
          )}
        </div>

        {gameState.currentSession && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-r from-green-900/50 to-blue-900/50 rounded-xl p-6 border border-green-700"
          >
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
              </svg>
              Current Game Session
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-gray-400 text-sm">Level</p>
                <p className="text-white font-bold">{gameState.currentSession.levelId}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Duration</p>
                <p className="text-white font-bold">
                  {Math.round((Date.now() - gameState.currentSession.startTime) / 60000)}m
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Score</p>
                <p className="text-white font-bold">{gameState.currentSession.score}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Wave</p>
                <p className="text-white font-bold">{gameState.currentSession.currentWave}</p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </ErrorBoundary>
  )
})

EnhancedGameDashboard.displayName = 'EnhancedGameDashboard'