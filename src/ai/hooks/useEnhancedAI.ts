'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useAccount, useBalance } from 'wagmi'
import { 
  getAIEngine, 
  AIContext, 
  AIRecommendation, 
  AIInsight, 
  ChatMessage,
  AIPersonalization
} from '@/src/ai/core/EnhancedAIEngine'
import { useGameStore } from '@/src/lib/state/GameStateManager'
import { useGeckoNFT } from '@/src/blockchain/hooks/useGeckoNFT'

// =============================================================================
// Enhanced AI Hooks
// =============================================================================

export function useEnhancedAI() {
  const aiEngine = useRef(getAIEngine())
  
  // Blockchain data
  const { address, isConnected } = useAccount()
  const { data: balance } = useBalance({ address })
  const { userNFTs } = useGeckoNFT()
  
  // Game state
  const gameState = useGameStore()
  
  // AI state
  const [context, setContext] = useState<AIContext | null>(null)
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([])
  const [insights, setInsights] = useState<AIInsight[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<number>(0)

  // =============================================================================
  // Context Building
  // =============================================================================

  const buildAIContext = useCallback((): AIContext | null => {
    if (!isConnected || !address) return null

    // Calculate user metrics
    const gamesPlayed = gameState.playerStats.totalGamesPlayed
    const winRate = gamesPlayed > 0 
      ? gameState.playerStats.totalWins / gamesPlayed 
      : 0

    // Portfolio value calculation
    const portfolioValue = userNFTs.reduce((sum, nft) => 
      sum + parseFloat(nft.price || '0'), 0
    )

    // Mock market data (in real app, fetch from API)
    const mockMarketData = {
      floorPrice: 0.1,
      volume24h: 50.5,
      trending: ['Fire Geckos', 'Ice Warriors'],
      priceChange: Math.random() * 20 - 10 // -10% to +10%
    }

    // Determine user preferences based on behavior
    const preferences = {
      gameStyle: gameState.playerStats.totalWins > gameState.playerStats.totalLosses 
        ? 'aggressive' as const 
        : 'defensive' as const,
      riskTolerance: portfolioValue > 1 ? 'high' as const : 'medium' as const,
      spendingPattern: 'moderate' as const
    }

    return {
      user: {
        address,
        level: gameState.playerStats.currentLevel,
        experience: gameState.playerStats.currentExperience,
        gamesPlayed,
        winRate,
        preferredStrategy: preferences.gameStyle
      },
      wallet: {
        balance: balance ? parseFloat(balance.formatted) : 0,
        nftCount: userNFTs.length,
        portfolioValue
      },
      game: {
        currentLevel: gameState.currentSession?.levelId,
        currentWave: gameState.currentSession?.wave,
        placedTowers: gameState.currentSession?.towersPlaced || [],
        activeEnemies: gameState.currentSession?.enemies || [],
        score: gameState.currentSession?.score || 0,
        lives: gameState.currentSession?.lives || 0,
        difficulty: gameState.currentSession?.levelId ? 
          (gameState.currentSession.levelId <= 5 ? 'easy' : 
           gameState.currentSession.levelId <= 10 ? 'medium' : 'hard') : 'easy'
      },
      market: mockMarketData,
      nfts: userNFTs,
      preferences
    }
  }, [isConnected, address, balance, userNFTs, gameState])

  // =============================================================================
  // Context Updates
  // =============================================================================

  useEffect(() => {
    const newContext = buildAIContext()
    if (newContext) {
      setContext(newContext)
      aiEngine.current.updateContext(newContext)
      
      // Update recommendations and insights
      setRecommendations(aiEngine.current.getRecommendations())
      setInsights(aiEngine.current.getInsights())
      setLastUpdated(Date.now())
    }
  }, [buildAIContext])

  // Auto-update context when game state changes significantly
  useEffect(() => {
    if (gameState.currentSession && context) {
      const gameUpdate = {
        game: {
          ...context.game,
          currentWave: gameState.currentSession.wave,
          score: gameState.currentSession.score,
          lives: gameState.currentSession.lives,
          placedTowers: gameState.currentSession.towersPlaced,
          activeEnemies: gameState.currentSession.enemies
        }
      }
      
      aiEngine.current.updateContext(gameUpdate)
      setRecommendations(aiEngine.current.getRecommendations())
      setLastUpdated(Date.now())
    }
  }, [
    gameState.currentSession?.wave,
    gameState.currentSession?.score,
    gameState.currentSession?.lives,
    gameState.currentSession?.towersPlaced.length,
    gameState.currentSession?.enemies.length
  ])

  // =============================================================================
  // AI Actions
  // =============================================================================

  const refreshRecommendations = useCallback(async () => {
    if (context) {
      setIsProcessing(true)
      try {
        aiEngine.current.updateContext(context)
        setRecommendations(aiEngine.current.getRecommendations())
        setInsights(aiEngine.current.getInsights())
        setLastUpdated(Date.now())
      } finally {
        setIsProcessing(false)
      }
    }
  }, [context])

  const dismissRecommendation = useCallback((id: string) => {
    aiEngine.current.dismissRecommendation(id)
    setRecommendations(aiEngine.current.getRecommendations())
  }, [])

  const getPersonalizedInsights = useCallback((): AIInsight[] => {
    return insights.filter(insight => {
      // Filter based on user's interests and current context
      if (!context) return true
      
      const isGameRelated = insight.category === 'performance' || insight.category === 'strategy'
      const isMarketRelated = insight.category === 'market' || insight.category === 'portfolio'
      
      // Show game insights if user is actively playing
      if (gameState.isPlaying && isGameRelated) return true
      
      // Show market insights if user has NFTs
      if (userNFTs.length > 0 && isMarketRelated) return true
      
      // Always show high impact insights
      if (insight.impact === 'high') return true
      
      return insight.category === 'behavior'
    })
  }, [insights, context, gameState.isPlaying, userNFTs.length])

  return {
    // Core data
    context,
    recommendations,
    insights: getPersonalizedInsights(),
    isProcessing,
    lastUpdated,
    
    // Computed values
    hasActiveRecommendations: recommendations.length > 0,
    urgentRecommendations: recommendations.filter(r => r.priority === 'urgent'),
    gameRecommendations: recommendations.filter(r => r.type === 'tower_placement' || r.type === 'strategy'),
    marketRecommendations: recommendations.filter(r => r.type === 'market'),
    
    // Actions
    refreshRecommendations,
    dismissRecommendation,
    
    // Status
    isAvailable: isConnected && context !== null
  }
}

// =============================================================================
// Chat AI Hook
// =============================================================================

export function useAIChatAssistant() {
  const aiEngine = useRef(getAIEngine())
  const { context } = useEnhancedAI()
  
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [isAvailable, setIsAvailable] = useState(true)

  // Load chat history on mount
  useEffect(() => {
    setChatHistory(aiEngine.current.getChatHistory())
  }, [])

  const sendMessage = useCallback(async (
    message: string, 
    options?: { 
      type?: ChatMessage['type']
      userContext?: Partial<AIContext>
    }
  ) => {
    if (!message.trim()) return

    // Add user message to history
    const userMessage: ChatMessage = {
      id: `user_${Date.now()}`,
      sender: 'user',
      message: message.trim(),
      timestamp: Date.now(),
      context,
      type: options?.type || 'query'
    }

    setChatHistory(prev => [...prev, userMessage])
    setIsTyping(true)

    try {
      // Simulate typing delay for better UX
      await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000))
      
      // Process message with AI
      const aiResponse = await aiEngine.current.processMessage(
        message, 
        options?.userContext || context || undefined
      )
      
      setChatHistory(prev => [...prev, aiResponse])
      
    } catch (error) {
      console.error('AI processing error:', error)
      
      // Add error message
      const errorMessage: ChatMessage = {
        id: `error_${Date.now()}`,
        sender: 'ai',
        message: 'I apologize, but I encountered an error processing your request. Please try again.',
        timestamp: Date.now(),
        type: 'query'
      }
      
      setChatHistory(prev => [...prev, errorMessage])
      
    } finally {
      setIsTyping(false)
    }
  }, [context])

  const clearChat = useCallback(() => {
    aiEngine.current.clearChatHistory()
    setChatHistory([])
  }, [])

  const generateGameHelp = useCallback(async (topic: string) => {
    const helpMessages: Record<string, string> = {
      tower_placement: "For optimal tower placement, consider enemy paths, tower range overlap, and upgrade potential. Place high-damage towers at chokepoints and support towers for coverage.",
      nft_breeding: "NFT breeding combines parent traits to create unique offspring. Consider complementary abilities, rarity levels, and cooldown periods. Higher rarity parents increase chances of rare traits.",
      market_trading: "Monitor floor prices, trading volume, and trait rarity. Buy during dips, sell during peaks. Focus on functional NFTs that perform well in-game for long-term value.",
      game_strategy: "Balance offensive and defensive approaches. Invest in tower upgrades, manage resources efficiently, and adapt to enemy wave compositions. Study successful patterns."
    }

    const helpMessage = helpMessages[topic] || "I can help with various aspects of Omniverse Geckos. What specific area would you like assistance with?"
    
    await sendMessage(helpMessage, { type: 'suggestion' })
  }, [sendMessage])

  return {
    chatHistory,
    isTyping,
    isAvailable,
    sendMessage,
    clearChat,
    generateGameHelp,
    
    // Computed values
    messageCount: chatHistory.length,
    lastMessage: chatHistory[chatHistory.length - 1] || null,
    hasRecommendations: chatHistory.some(msg => msg.recommendations && msg.recommendations.length > 0)
  }
}

// =============================================================================
// Personalization AI Hook
// =============================================================================

export function usePersonalizationAI() {
  const aiEngine = useRef(getAIEngine())
  const [personalization, setPersonalization] = useState<AIPersonalization | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadPersonalization = () => {
      const data = aiEngine.current.getPersonalization()
      setPersonalization(data)
      setIsLoading(false)
    }

    loadPersonalization()
    
    // Update periodically
    const interval = setInterval(loadPersonalization, 30000) // Every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const updatePreferences = useCallback((preferences: Partial<AIPersonalization['preferences']>) => {
    if (personalization) {
      const updated = {
        ...personalization,
        preferences: { ...personalization.preferences, ...preferences },
        lastUpdated: Date.now()
      }
      setPersonalization(updated)
      
      // Save to localStorage (simplified - in real app, save to backend)
      localStorage.setItem('gecko-ai-personalization', JSON.stringify(updated))
    }
  }, [personalization])

  const getAdaptiveContent = useCallback((contentType: string): any => {
    if (!personalization) return null

    const { profile, adaptations } = personalization
    
    switch (contentType) {
      case 'difficulty':
        return profile.skillLevel > 2 ? 'hard' : profile.skillLevel > 1 ? 'medium' : 'easy'
        
      case 'tutorial_skips':
        return adaptations.tutorialSkips
        
      case 'recommended_towers':
        return profile.mostUsedTowers
        
      case 'content_preferences':
        return adaptations.contentPreferences
        
      default:
        return null
    }
  }, [personalization])

  return {
    personalization,
    isLoading,
    updatePreferences,
    getAdaptiveContent,
    
    // Computed values
    isPersonalized: personalization !== null && personalization.userId !== 'anonymous',
    skillLevel: personalization?.profile.skillLevel || 1,
    playStyle: personalization?.profile.playStyle || 'balanced',
    personalizedExperience: personalization?.preferences.personalizedRecommendations || false
  }
}

// =============================================================================
// Game AI Integration Hook
// =============================================================================

export function useGameAI() {
  const { recommendations, context } = useEnhancedAI()
  const gameState = useGameStore()

  const getPlacementSuggestions = useCallback((position: { x: number; y: number }) => {
    if (!context?.game || !context?.nfts) return []

    // Analyze position viability
    const nearbyTowers = context.game.placedTowers.filter(tower => {
      const distance = Math.sqrt(
        Math.pow(tower.position.x - position.x, 2) +
        Math.pow(tower.position.y - position.y, 2)
      )
      return distance < 150 // Within range
    })

    // Get recommendations for this position
    const suggestions = context.nfts
      .filter(nft => gameState.availableTowers.includes(nft.tokenId))
      .map(nft => ({
        nft,
        score: calculatePlacementScore(nft, position, nearbyTowers, context.game.activeEnemies),
        reasoning: generatePlacementReasoning(nft, position, nearbyTowers)
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)

    return suggestions
  }, [context, gameState.availableTowers])

  const getUpgradeSuggestions = useCallback((towerId: string) => {
    if (!context?.game) return []

    const tower = context.game.placedTowers.find(t => t.id === towerId)
    if (!tower) return []

    const upgrades = [
      {
        type: 'damage',
        priority: calculateUpgradePriority(tower, 'damage', context.game.activeEnemies),
        cost: 100,
        benefit: 'Increases damage output by 50%'
      },
      {
        type: 'range',
        priority: calculateUpgradePriority(tower, 'range', context.game.activeEnemies),
        cost: 80,
        benefit: 'Increases attack range by 30%'
      },
      {
        type: 'speed',
        priority: calculateUpgradePriority(tower, 'speed', context.game.activeEnemies),
        cost: 60,
        benefit: 'Increases attack speed by 25%'
      }
    ].sort((a, b) => b.priority - a.priority)

    return upgrades
  }, [context])

  return {
    // Position analysis
    getPlacementSuggestions,
    getUpgradeSuggestions,
    
    // Game-specific recommendations
    towerRecommendations: recommendations.filter(r => 
      r.type === 'tower_placement' || r.type === 'upgrade'
    ),
    strategyRecommendations: recommendations.filter(r => r.type === 'strategy'),
    
    // Real-time analysis
    shouldPause: recommendations.some(r => r.priority === 'urgent'),
    difficultyTooHigh: context?.user.winRate ? context.user.winRate < 0.3 : false,
    performanceGood: context?.user.winRate ? context.user.winRate > 0.7 : false
  }
}

// =============================================================================
// Helper Functions
// =============================================================================

function calculatePlacementScore(
  nft: any,
  position: { x: number; y: number },
  nearbyTowers: any[],
  enemies: any[]
): number {
  let score = nft.stats.damage + nft.stats.range * 0.5

  // Bonus for type effectiveness against current enemies
  const enemyTypes = enemies.map(e => e.type)
  const typeBonus = getTypeEffectiveness(nft.geckoType, enemyTypes)
  score *= typeBonus

  // Penalty for tower crowding
  if (nearbyTowers.length > 2) score *= 0.8

  // Bonus for strategic positions (simplified)
  const isStrategicPosition = position.x > 100 && position.x < 500 && position.y > 100 && position.y < 400
  if (isStrategicPosition) score *= 1.2

  return score
}

function generatePlacementReasoning(
  nft: any,
  position: { x: number; y: number },
  nearbyTowers: any[]
): string {
  const reasons = []
  
  if (nft.stats.damage > 60) reasons.push('High damage output')
  if (nft.stats.range > 120) reasons.push('Long range coverage')
  if (nearbyTowers.length === 0) reasons.push('Good coverage area')
  if (nearbyTowers.length > 0) reasons.push('Synergy with nearby towers')
  
  return reasons.join(', ') || 'Balanced placement option'
}

function calculateUpgradePriority(
  tower: any,
  upgradeType: string,
  enemies: any[]
): number {
  let priority = 50 // Base priority

  switch (upgradeType) {
    case 'damage':
      priority += enemies.length * 5 // More enemies = higher damage priority
      if (tower.stats.damage < 50) priority += 20 // Low damage towers need it more
      break
      
    case 'range':
      if (tower.stats.range < 100) priority += 25 // Short range towers need it more
      priority += Math.min(enemies.length * 3, 20)
      break
      
    case 'speed':
      priority += enemies.filter(e => e.speed > 5).length * 8 // Fast enemies = speed priority
      if (tower.stats.fireRate > 1000) priority += 15 // Slow towers need speed
      break
  }

  return Math.min(100, priority)
}

function getTypeEffectiveness(towerType: string, enemyTypes: string[]): number {
  // Mock type effectiveness system
  const effectiveness: Record<string, Record<string, number>> = {
    'Fire': { 'ice': 1.5, 'plant': 1.3, 'normal': 1.0 },
    'Ice': { 'fire': 0.7, 'flying': 1.3, 'normal': 1.0 },
    'Electric': { 'flying': 1.8, 'water': 1.4, 'normal': 1.0 },
    'Poison': { 'plant': 1.6, 'normal': 1.0 }
  }

  const avgEffectiveness = enemyTypes.reduce((sum, enemyType) => {
    return sum + (effectiveness[towerType]?.[enemyType] || 1.0)
  }, 0) / Math.max(enemyTypes.length, 1)

  return avgEffectiveness
}