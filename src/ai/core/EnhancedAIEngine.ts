'use client'

import { AIEngine } from './AIEngine'
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
  private aiEngine: AIEngine
  private context: AIContext | null = null
  private personalization: AIPersonalization | null = null
  private chatHistory: ChatMessage[] = []
  private activeRecommendations: AIRecommendation[] = []
  private insights: AIInsight[] = []
  
  constructor(aiEngine: AIEngine) {
    this.aiEngine = aiEngine
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

  // =============================================================================
  // Market Analysis AI
  // =============================================================================

  // =============================================================================
  // Personalized AI Chat
  // =============================================================================

  async processMessage(message: string, context?: Partial<AIContext>): Promise<ChatMessage> {
    // Update context if provided
    if (context) {
      this.updateContext(context)
    }

    const prompt = `
You are GeckoBot, an advanced AI assistant for the Web3 game Omniverse Geckos. Your goal is to provide helpful, context-aware, and personalized assistance to players.

Here is the current context:
${JSON.stringify(this.context, null, 2)}

Here is the recent chat history:
${this.chatHistory.slice(-5).map(h => `${h.sender}: ${h.message}`).join('\n')}

The user's message is: "${message}"

Based on this information, please provide a response in the following JSON format:
{
  "response": "Your response to the user's message.",
  "recommendations": [
    {
      "id": "recommendation_id",
      "type": "tower_placement" | "strategy" | "market" | "upgrade" | "general",
      "priority": "low" | "medium" | "high" | "urgent",
      "title": "Recommendation Title",
      "description": "Recommendation Description",
      "actionable": true | false,
      "confidence": 0.0 - 1.0,
      "reasoning": "Why you are making this recommendation."
    }
  ]
}

If you don't have any recommendations, please provide an empty array.
`;

    try {
      const aiResponse = await this.aiEngine.generateText(prompt);
      const parsedResponse = JSON.parse(aiResponse.content);

      const chatMessage: ChatMessage = {
        id: `msg_${Date.now()}`,
        sender: 'ai',
        message: parsedResponse.response,
        timestamp: Date.now(),
        context: this.context || undefined,
        recommendations: parsedResponse.recommendations,
      };

      this.chatHistory.push(chatMessage);
      return chatMessage;
    } catch (error) {
      console.error("Error processing AI message:", error);
      const errorMessage: ChatMessage = {
        id: `msg_${Date.now()}`,
        sender: 'ai',
        message: "I'm sorry, I encountered an error. Please try again.",
        timestamp: Date.now(),
      };
      this.chatHistory.push(errorMessage);
      return errorMessage;
    }
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

  private async generateContextualRecommendations(): Promise<void> {
    if (!this.context) return;

    const prompt = `
You are GeckoBot, an advanced AI assistant for the Web3 game Omniverse Geckos. Your goal is to proactively provide helpful, context-aware, and personalized recommendations to players based on their current situation.

Here is the current context:
${JSON.stringify(this.context, null, 2)}

Based on this information, please provide a list of recommendations in the following JSON format:
[
    {
      "id": "recommendation_id",
      "type": "tower_placement" | "strategy" | "market" | "upgrade" | "general",
      "priority": "low" | "medium" | "high" | "urgent",
      "title": "Recommendation Title",
      "description": "Recommendation Description",
      "actionable": true | false,
      "confidence": 0.0 - 1.0,
      "reasoning": "Why you are making this recommendation."
    }
]

If you don't have any recommendations, please provide an empty array.
`;

    try {
      const aiResponse = await this.aiEngine.generateText(prompt);
      const recommendations = JSON.parse(aiResponse.content);
      this.activeRecommendations = recommendations.slice(0, 10); // Limit to 10 active recommendations
    } catch (error) {
      console.error("Error generating contextual recommendations:", error);
      this.activeRecommendations = [];
    }
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

export function getAIEngine(aiEngine?: AIEngine): EnhancedAIEngine {
  if (!aiEngineInstance) {
    if (!aiEngine) {
      throw new Error("AIEngine instance is required to initialize EnhancedAIEngine");
    }
    aiEngineInstance = new EnhancedAIEngine(aiEngine)
  }
  return aiEngineInstance
}

export default EnhancedAIEngine