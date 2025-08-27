'use client'

import { GeckoNFT } from '@/src/blockchain/hooks/useGeckoNFT'
import { GameState, PlacedTower, Enemy } from '@/src/lib/state/GameStateManager'

// =============================================================================
// AI Engine Types
// =============================================================================

export interface AIContext {
  user: {
    address: string
    level: number
    experience: number
    gamesPlayed: number
    winRate: number
    preferredStrategy: string
  }
  wallet: {
    balance: number
    nftCount: number
    portfolioValue: number
  }
  game: {
    currentLevel?: number
    currentWave?: number
    placedTowers: PlacedTower[]
    activeEnemies: Enemy[]
    score: number
    lives: number
    difficulty: string
  }
  market: {
    floorPrice: number
    volume24h: number
    trending: string[]
    priceChange: number
  }
  nfts: GeckoNFT[]
  preferences: {
    gameStyle: 'aggressive' | 'defensive' | 'balanced'
    riskTolerance: 'low' | 'medium' | 'high'
    spendingPattern: 'conservative' | 'moderate' | 'liberal'
  }
}

export interface AIRecommendation {
  id: string
  type: 'tower_placement' | 'strategy' | 'market' | 'upgrade' | 'general'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  title: string
  description: string
  actionable: boolean
  confidence: number
  reasoning: string
  expectedOutcome?: string
  cost?: number
  timeframe?: string
  tags: string[]
  context: Partial<AIContext>
  createdAt: number
  expiresAt?: number
}

export interface AIInsight {
  id: string
  category: 'performance' | 'strategy' | 'market' | 'portfolio' | 'behavior'
  title: string
  description: string
  data: any
  confidence: number
  impact: 'low' | 'medium' | 'high'
  trend: 'up' | 'down' | 'stable' | 'volatile'
  createdAt: number
}

export interface AIPersonalization {
  userId: string
  profile: {
    playStyle: string
    skillLevel: number
    preferredGameModes: string[]
    averageSessionLength: number
    mostUsedTowers: string[]
    strongestStrategies: string[]
    improvementAreas: string[]
  }
  preferences: {
    notifications: boolean
    difficultyAutoAdjust: boolean
    personalizedRecommendations: boolean
    adaptiveTutorials: boolean
  }
  adaptations: {
    tutorialSkips: string[]
    customDifficulty?: number
    personalizedPricing?: boolean
    contentPreferences: string[]
  }
  lastUpdated: number
}

export interface ChatMessage {
  id: string
  sender: 'user' | 'ai'
  message: string
  timestamp: number
  context?: Partial<AIContext>
  recommendations?: AIRecommendation[]
  type?: 'welcome' | 'query' | 'suggestion' | 'alert'
}

// =============================================================================
// Enhanced AI Engine
// =============================================================================

export class EnhancedAIEngine {
  private context: AIContext | null = null
  private personalization: AIPersonalization | null = null
  private chatHistory: ChatMessage[] = []
  private activeRecommendations: AIRecommendation[] = []
  private insights: AIInsight[] = []
  
  constructor() {
    this.initializePersonalization()
  }

  // =============================================================================
  // Context Management
  // =============================================================================

  updateContext(context: Partial<AIContext>): void {
    this.context = {
      ...this.context,
      ...context
    } as AIContext
    
    // Update personalization based on new context
    this.updatePersonalization()
    
    // Generate new recommendations if context changed significantly
    this.generateContextualRecommendations()
  }

  getContext(): AIContext | null {
    return this.context
  }

  // =============================================================================
  // Game Strategy AI
  // =============================================================================

  analyzeGameSituation(): AIRecommendation[] {
    if (!this.context?.game) return []

    const recommendations: AIRecommendation[] = []
    const { game, nfts } = this.context

    // Analyze tower placement
    if (game.placedTowers.length < 3) {
      recommendations.push({
        id: `tower_${Date.now()}`,
        type: 'tower_placement',
        priority: 'high',
        title: 'Place More Towers',
        description: 'You need more towers to defend against incoming enemies',
        actionable: true,
        confidence: 0.9,
        reasoning: 'Current tower count is below optimal for this wave',
        expectedOutcome: 'Better defense against enemy waves',
        tags: ['defense', 'placement'],
        context: { game },
        createdAt: Date.now()
      })
    }

    // Analyze enemy threats
    if (game.activeEnemies.length > 10) {
      const strongestTowers = this.findBestTowersForSituation(game.activeEnemies, nfts)
      
      recommendations.push({
        id: `threat_${Date.now()}`,
        type: 'strategy',
        priority: 'urgent',
        title: 'High Enemy Count Detected',
        description: `Deploy ${strongestTowers[0]?.name || 'strong towers'} to handle the wave`,
        actionable: true,
        confidence: 0.85,
        reasoning: 'Large enemy wave requires immediate action',
        expectedOutcome: 'Reduced risk of losing lives',
        tags: ['urgent', 'defense', 'enemy-wave'],
        context: { game },
        createdAt: Date.now(),
        expiresAt: Date.now() + 30000 // Expires in 30 seconds
      })
    }

    // Economy optimization
    if (game.score > 0) {
      const efficiency = this.calculateTowerEfficiency(game.placedTowers, game.score)
      
      if (efficiency < 0.7) {
        recommendations.push({
          id: `economy_${Date.now()}`,
          type: 'upgrade',
          priority: 'medium',
          title: 'Optimize Tower Efficiency',
          description: 'Some towers are underperforming. Consider upgrades or repositioning.',
          actionable: true,
          confidence: 0.75,
          reasoning: `Current efficiency: ${Math.round(efficiency * 100)}%`,
          expectedOutcome: 'Improved score per resource invested',
          tags: ['optimization', 'efficiency'],
          context: { game },
          createdAt: Date.now()
        })
      }
    }

    return recommendations
  }

  findBestTowersForSituation(enemies: Enemy[], availableNFTs: GeckoNFT[]): GeckoNFT[] {
    // Analyze enemy types and recommend counter towers
    const enemyTypes = enemies.map(e => e.type)
    const typeFrequency = enemyTypes.reduce((acc, type) => {
      acc[type] = (acc[type] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Sort NFTs by effectiveness against current enemy composition
    return availableNFTs
      .map(nft => ({
        nft,
        effectiveness: this.calculateTowerEffectivenessAgainstEnemies(nft, typeFrequency)
      }))
      .sort((a, b) => b.effectiveness - a.effectiveness)
      .map(item => item.nft)
      .slice(0, 3)
  }

  private calculateTowerEffectivenessAgainstEnemies(
    tower: GeckoNFT, 
    enemyTypes: Record<string, number>
  ): number {
    // Mock effectiveness calculation based on tower type vs enemy types
    const typeMatchups: Record<string, Record<string, number>> = {
      'Fire': { 'ice': 1.5, 'plant': 1.3, 'normal': 1.0, 'fire': 0.7 },
      'Ice': { 'fire': 1.5, 'flying': 1.3, 'normal': 1.0, 'ice': 0.7 },
      'Electric': { 'flying': 1.8, 'water': 1.4, 'normal': 1.0, 'ground': 0.5 },
      'Poison': { 'plant': 1.6, 'normal': 1.2, 'poison': 0.6, 'steel': 0.3 }
    }

    const towerType = tower.geckoType
    let totalEffectiveness = 0
    let totalEnemies = 0

    for (const [enemyType, count] of Object.entries(enemyTypes)) {
      const multiplier = typeMatchups[towerType]?.[enemyType] || 1.0
      totalEffectiveness += multiplier * count * tower.stats.damage
      totalEnemies += count
    }

    return totalEnemies > 0 ? totalEffectiveness / totalEnemies : 0
  }

  private calculateTowerEfficiency(towers: PlacedTower[], totalScore: number): number {
    if (towers.length === 0 || totalScore === 0) return 0
    
    // Calculate efficiency based on damage output vs score gained
    const totalDamage = towers.reduce((sum, tower) => sum + tower.stats.damage, 0)
    const efficiency = Math.min(1.0, totalScore / (totalDamage * 100))
    
    return efficiency
  }

  // =============================================================================
  // Market Analysis AI
  // =============================================================================

  analyzeMarketTrends(): AIInsight[] {
    if (!this.context?.market) return []

    const insights: AIInsight[] = []
    const { market } = this.context

    // Price trend analysis
    insights.push({
      id: `market_trend_${Date.now()}`,
      category: 'market',
      title: 'Market Price Analysis',
      description: `Floor price ${market.priceChange >= 0 ? 'increased' : 'decreased'} by ${Math.abs(market.priceChange)}%`,
      data: {
        floorPrice: market.floorPrice,
        priceChange: market.priceChange,
        volume: market.volume24h
      },
      confidence: 0.8,
      impact: Math.abs(market.priceChange) > 10 ? 'high' : 'medium',
      trend: market.priceChange > 5 ? 'up' : market.priceChange < -5 ? 'down' : 'stable',
      createdAt: Date.now()
    })

    // Volume analysis
    if (market.volume24h > 1000) {
      insights.push({
        id: `volume_${Date.now()}`,
        category: 'market',
        title: 'High Trading Volume',
        description: 'Increased market activity detected - good time for trading',
        data: { volume: market.volume24h },
        confidence: 0.9,
        impact: 'high',
        trend: 'up',
        createdAt: Date.now()
      })
    }

    return insights
  }

  generateTradingRecommendations(): AIRecommendation[] {
    if (!this.context?.market || !this.context?.nfts) return []

    const recommendations: AIRecommendation[] = []
    const { market, nfts, user } = this.context

    // Analyze user's NFT portfolio
    const portfolioValue = nfts.reduce((sum, nft) => 
      sum + parseFloat(nft.price || '0'), 0
    )

    const undervaluedNFTs = nfts.filter(nft => {
      const nftPrice = parseFloat(nft.price || '0')
      return nftPrice < market.floorPrice * 0.8
    })

    if (undervaluedNFTs.length > 0 && user.preferredStrategy !== 'conservative') {
      recommendations.push({
        id: `undervalued_${Date.now()}`,
        type: 'market',
        priority: 'medium',
        title: 'Undervalued NFTs Detected',
        description: `You have ${undervaluedNFTs.length} NFTs priced below market average`,
        actionable: true,
        confidence: 0.75,
        reasoning: 'These NFTs could be repriced for better market positioning',
        expectedOutcome: 'Potential increased revenue from sales',
        tags: ['trading', 'pricing', 'opportunity'],
        context: { market, nfts: undervaluedNFTs },
        createdAt: Date.now()
      })
    }

    return recommendations
  }

  // =============================================================================
  // Personalized AI Chat
  // =============================================================================

  async processMessage(message: string, context?: Partial<AIContext>): Promise<ChatMessage> {
    // Update context if provided
    if (context) {
      this.updateContext(context)
    }

    // Analyze message intent
    const intent = this.analyzeMessageIntent(message)
    
    let response: string
    let recommendations: AIRecommendation[] = []

    switch (intent.category) {
      case 'game_strategy':
        response = this.generateGameStrategyResponse(intent.details)
        recommendations = this.analyzeGameSituation()
        break
        
      case 'nft_advice':
        response = this.generateNFTAdviceResponse(intent.details)
        recommendations = this.generateTradingRecommendations()
        break
        
      case 'market_inquiry':
        response = this.generateMarketResponse(intent.details)
        break
        
      case 'general_help':
        response = this.generateHelpResponse(intent.details)
        break
        
      default:
        response = this.generateContextualResponse(message)
    }

    const chatMessage: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      sender: 'ai',
      message: response,
      timestamp: Date.now(),
      context: this.context || undefined,
      recommendations: recommendations.length > 0 ? recommendations : undefined,
      type: intent.category === 'general_help' ? 'welcome' : 'query'
    }

    this.chatHistory.push(chatMessage)
    return chatMessage
  }

  private analyzeMessageIntent(message: string): {
    category: string
    details: string
    confidence: number
  } {
    const lowerMessage = message.toLowerCase()
    
    // Game strategy keywords
    if (lowerMessage.includes('tower') || lowerMessage.includes('defense') || 
        lowerMessage.includes('strategy') || lowerMessage.includes('enemy')) {
      return {
        category: 'game_strategy',
        details: message,
        confidence: 0.9
      }
    }
    
    // NFT and trading keywords
    if (lowerMessage.includes('nft') || lowerMessage.includes('trading') ||
        lowerMessage.includes('buy') || lowerMessage.includes('sell') ||
        lowerMessage.includes('price')) {
      return {
        category: 'nft_advice',
        details: message,
        confidence: 0.85
      }
    }
    
    // Market keywords
    if (lowerMessage.includes('market') || lowerMessage.includes('trend') ||
        lowerMessage.includes('volume') || lowerMessage.includes('floor')) {
      return {
        category: 'market_inquiry',
        details: message,
        confidence: 0.8
      }
    }
    
    // Help keywords
    if (lowerMessage.includes('help') || lowerMessage.includes('how') ||
        lowerMessage.includes('what') || lowerMessage.includes('guide')) {
      return {
        category: 'general_help',
        details: message,
        confidence: 0.7
      }
    }
    
    return {
      category: 'general',
      details: message,
      confidence: 0.5
    }
  }

  private generateGameStrategyResponse(query: string): string {
    if (!this.context?.game) {
      return "I'd love to help with game strategy! Start playing a level so I can analyze your situation and provide specific recommendations."
    }

    const { game, user } = this.context
    const responses = [
      `Based on your current situation (Wave ${game.currentWave}, ${game.lives} lives remaining), I recommend focusing on ${game.placedTowers.length < 5 ? 'placing more towers' : 'upgrading existing towers'}.`,
      
      `Your win rate is ${Math.round(user.winRate * 100)}%. ${user.winRate > 0.7 ? 'Great job! Consider trying higher difficulty levels.' : 'Try focusing on tower positioning and timing your upgrades better.'}`,
      
      `With ${game.activeEnemies.length} enemies active, ${game.activeEnemies.length > 8 ? 'prioritize area damage towers' : 'single-target towers should work well'}.`
    ]

    return responses[Math.floor(Math.random() * responses.length)]
  }

  private generateNFTAdviceResponse(query: string): string {
    if (!this.context?.nfts || this.context.nfts.length === 0) {
      return "You don't have any NFTs yet! Visit the marketplace to mint or buy your first Gecko NFT and start your collection."
    }

    const { nfts, market } = this.context
    const totalValue = nfts.reduce((sum, nft) => sum + parseFloat(nft.price || '0'), 0)
    
    const responses = [
      `Your collection of ${nfts.length} NFTs is worth approximately ${totalValue.toFixed(2)} ETH. ${totalValue > market.floorPrice * nfts.length ? 'Your collection is performing above floor price!' : 'Consider optimizing your collection strategy.'}`,
      
      `I notice you have ${nfts.filter(nft => nft.rarity === 'Legendary').length} legendary NFTs. These are great for both gameplay and long-term value.`,
      
      `Based on current market trends, ${market.priceChange > 0 ? "it's a good time to consider selling" : "it might be worth holding or buying more"}. Floor price is ${market.floorPrice} ETH.`
    ]

    return responses[Math.floor(Math.random() * responses.length)]
  }

  private generateMarketResponse(query: string): string {
    if (!this.context?.market) {
      return "Let me check the current market conditions... The market data is currently being updated. Please try again in a moment."
    }

    const { market } = this.context
    
    return `Current market overview:
• Floor price: ${market.floorPrice} ETH (${market.priceChange > 0 ? '+' : ''}${market.priceChange.toFixed(1)}%)
• 24h volume: ${market.volume24h} ETH
• Market sentiment: ${market.priceChange > 5 ? 'Bullish' : market.priceChange < -5 ? 'Bearish' : 'Neutral'}
• Trending collections: ${market.trending.join(', ')}`
  }

  private generateHelpResponse(query: string): string {
    const helpTopics = [
      "🎮 **Game Strategy**: I can help you optimize tower placement, suggest upgrades, and analyze enemy waves.",
      "🖼️ **NFT Management**: Get advice on your collection, pricing strategies, and market opportunities.",
      "📊 **Market Analysis**: Stay updated on trends, floor prices, and trading opportunities.",
      "⚙️ **Personalization**: I learn your preferences to provide better recommendations over time."
    ]

    return `I'm your AI assistant for Omniverse Geckos! Here's how I can help:\n\n${helpTopics.join('\n\n')}\n\nJust ask me anything about the game, your NFTs, or the market!`
  }

  private generateContextualResponse(message: string): string {
    if (!this.context) {
      return "Hello! I'm your Omniverse Geckos AI assistant. Connect your wallet and start playing to get personalized recommendations!"
    }

    const contextualResponses = [
      `Hi ${this.context.user.address.slice(0, 6)}...! I see you're level ${this.context.user.level}. What would you like to know?`,
      "I'm here to help optimize your gameplay and NFT strategy. What's on your mind?",
      "Based on your activity, I can provide insights about gaming, trading, or market trends. What interests you most?"
    ]

    return contextualResponses[Math.floor(Math.random() * contextualResponses.length)]
  }

  // =============================================================================
  // Personalization Engine
  // =============================================================================

  private initializePersonalization(): void {
    const stored = localStorage.getItem('gecko-ai-personalization')
    if (stored) {
      try {
        this.personalization = JSON.parse(stored)
      } catch (error) {
        console.error('Failed to load AI personalization:', error)
        this.createDefaultPersonalization()
      }
    } else {
      this.createDefaultPersonalization()
    }
  }

  private createDefaultPersonalization(): void {
    this.personalization = {
      userId: 'anonymous',
      profile: {
        playStyle: 'balanced',
        skillLevel: 1,
        preferredGameModes: [],
        averageSessionLength: 0,
        mostUsedTowers: [],
        strongestStrategies: [],
        improvementAreas: []
      },
      preferences: {
        notifications: true,
        difficultyAutoAdjust: false,
        personalizedRecommendations: true,
        adaptiveTutorials: true
      },
      adaptations: {
        tutorialSkips: [],
        contentPreferences: []
      },
      lastUpdated: Date.now()
    }
  }

  private updatePersonalization(): void {
    if (!this.personalization || !this.context) return

    const { user, game } = this.context

    // Update user ID if connected
    if (user.address && this.personalization.userId === 'anonymous') {
      this.personalization.userId = user.address
    }

    // Update skill level based on performance
    if (user.winRate > 0.8) {
      this.personalization.profile.skillLevel = Math.max(
        this.personalization.profile.skillLevel,
        3
      )
    } else if (user.winRate > 0.6) {
      this.personalization.profile.skillLevel = Math.max(
        this.personalization.profile.skillLevel,
        2
      )
    }

    // Update play style based on game behavior
    if (game?.placedTowers) {
      const towerCount = game.placedTowers.length
      if (towerCount > 10) {
        this.personalization.profile.playStyle = 'aggressive'
      } else if (towerCount < 5) {
        this.personalization.profile.playStyle = 'defensive'
      } else {
        this.personalization.profile.playStyle = 'balanced'
      }
    }

    this.personalization.lastUpdated = Date.now()
    this.savePersonalization()
  }

  private savePersonalization(): void {
    if (this.personalization) {
      localStorage.setItem('gecko-ai-personalization', JSON.stringify(this.personalization))
    }
  }

  private generateContextualRecommendations(): void {
    if (!this.context) return

    // Generate recommendations based on current context
    const gameRecommendations = this.analyzeGameSituation()
    const marketRecommendations = this.generateTradingRecommendations()

    this.activeRecommendations = [
      ...gameRecommendations,
      ...marketRecommendations
    ].slice(0, 10) // Limit to 10 active recommendations
  }

  // =============================================================================
  // Public API
  // =============================================================================

  getRecommendations(): AIRecommendation[] {
    return this.activeRecommendations
  }

  getInsights(): AIInsight[] {
    return this.insights
  }

  getChatHistory(): ChatMessage[] {
    return this.chatHistory
  }

  getPersonalization(): AIPersonalization | null {
    return this.personalization
  }

  clearChatHistory(): void {
    this.chatHistory = []
  }

  dismissRecommendation(id: string): void {
    this.activeRecommendations = this.activeRecommendations.filter(r => r.id !== id)
  }
}

// Singleton instance
let aiEngineInstance: EnhancedAIEngine | null = null

export function getAIEngine(): EnhancedAIEngine {
  if (!aiEngineInstance) {
    aiEngineInstance = new EnhancedAIEngine()
  }
  return aiEngineInstance
}

export default EnhancedAIEngine