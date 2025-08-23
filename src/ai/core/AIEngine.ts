import OpenAI from 'openai'
import { Anthropic } from '@anthropic-ai/sdk'

// =============================================================================
// Types
// =============================================================================

export interface AIConfig {
  openai: {
    apiKey: string
    model: string
    maxTokens: number
    temperature: number
  }
  anthropic: {
    apiKey: string
    model: string
    maxTokens: number
  }
  huggingface: {
    apiKey: string
    models: {
      textGeneration: string
      imageGeneration: string
      embedding: string
    }
  }
}

export interface AIResponse {
  content: string
  model: string
  usage: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
  metadata?: Record<string, any>
}

export interface GameAnalysisData {
  playerActions: Array<{
    action: string
    timestamp: number
    effectiveness: number
    context: Record<string, any>
  }>
  gameState: {
    level: number
    score: number
    towers: Array<any>
    enemies: Array<any>
    resources: Record<string, number>
  }
  playerStats: {
    winRate: number
    averageScore: number
    preferredStrategies: string[]
    skillLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  }
}

// =============================================================================
// AI Engine Core
// =============================================================================

export class AIEngine {
  private openai: OpenAI | null = null
  private anthropic: Anthropic | null = null
  private config: AIConfig
  private initialized = false

  constructor(config: AIConfig) {
    this.config = config
  }

  async initialize(): Promise<void> {
    try {
      // Initialize OpenAI
      if (this.config.openai.apiKey) {
        this.openai = new OpenAI({
          apiKey: this.config.openai.apiKey,
          dangerouslyAllowBrowser: true // Only for demo - use API routes in production
        })
      }

      // Initialize Anthropic
      if (this.config.anthropic.apiKey) {
        this.anthropic = new Anthropic({
          apiKey: this.config.anthropic.apiKey
        })
      }

      this.initialized = true
      console.log('🤖 AI Engine initialized successfully')
    } catch (error) {
      console.error('❌ Failed to initialize AI Engine:', error)
      throw error
    }
  }

  // =============================================================================
  // Core AI Methods
  // =============================================================================

  async generateText(prompt: string, provider: 'openai' | 'anthropic' = 'openai'): Promise<AIResponse> {
    if (!this.initialized) {
      throw new Error('AI Engine not initialized')
    }

    try {
      if (provider === 'openai' && this.openai) {
        const response = await this.openai.chat.completions.create({
          model: this.config.openai.model,
          messages: [{ role: 'user', content: prompt }],
          max_tokens: this.config.openai.maxTokens,
          temperature: this.config.openai.temperature
        })

        return {
          content: response.choices[0]?.message?.content || '',
          model: this.config.openai.model,
          usage: {
            promptTokens: response.usage?.prompt_tokens || 0,
            completionTokens: response.usage?.completion_tokens || 0,
            totalTokens: response.usage?.total_tokens || 0
          }
        }
      }

      if (provider === 'anthropic' && this.anthropic) {
        const response = await this.anthropic.messages.create({
          model: this.config.anthropic.model,
          max_tokens: this.config.anthropic.maxTokens,
          messages: [{ role: 'user', content: prompt }]
        })

        const content = response.content[0]
        const textContent = content.type === 'text' ? content.text : ''

        return {
          content: textContent,
          model: this.config.anthropic.model,
          usage: {
            promptTokens: response.usage.input_tokens,
            completionTokens: response.usage.output_tokens,
            totalTokens: response.usage.input_tokens + response.usage.output_tokens
          }
        }
      }

      throw new Error(`Provider ${provider} not available or configured`)
    } catch (error) {
      console.error(`❌ AI ${provider} generation failed:`, error)
      throw error
    }
  }

  // =============================================================================
  // Game-Specific AI Methods
  // =============================================================================

  async analyzePlayerStrategy(gameData: GameAnalysisData): Promise<{
    strengths: string[]
    weaknesses: string[]
    recommendations: string[]
    skillAssessment: string
    nextLevelSuggestions: string[]
  }> {
    const prompt = `
Analyze this Omniverse Geckos player's gaming data and provide strategic insights:

Player Stats:
- Win Rate: ${gameData.playerStats.winRate}%
- Average Score: ${gameData.playerStats.averageScore}
- Skill Level: ${gameData.playerStats.skillLevel}
- Preferred Strategies: ${gameData.playerStats.preferredStrategies.join(', ')}

Current Game State:
- Level: ${gameData.gameState.level}
- Score: ${gameData.gameState.score}
- Towers: ${gameData.gameState.towers.length}
- Resources: ${JSON.stringify(gameData.gameState.resources)}

Recent Actions: ${JSON.stringify(gameData.playerActions.slice(-10))}

Provide analysis in this JSON format:
{
  "strengths": ["strength1", "strength2"],
  "weaknesses": ["weakness1", "weakness2"],
  "recommendations": ["recommendation1", "recommendation2"],
  "skillAssessment": "detailed assessment",
  "nextLevelSuggestions": ["suggestion1", "suggestion2"]
}
`

    const response = await this.generateText(prompt)
    try {
      return JSON.parse(response.content)
    } catch {
      // Fallback if JSON parsing fails
      return {
        strengths: ["Consistent gameplay", "Good resource management"],
        weaknesses: ["Tower placement could be optimized", "Late-game strategy needs work"],
        recommendations: ["Try different tower combinations", "Focus on early economy building"],
        skillAssessment: "Shows solid fundamentals with room for strategic improvement",
        nextLevelSuggestions: ["Experiment with advanced tower synergies", "Practice speed-building techniques"]
      }
    }
  }

  async generateNFTDescription(traits: Record<string, any>): Promise<string> {
    const prompt = `
Generate an epic, lore-rich description for this Gecko NFT in the Omniverse Geckos universe:

Traits:
${Object.entries(traits).map(([key, value]) => `- ${key}: ${value}`).join('\n')}

The description should be:
- 2-3 sentences long
- Fantasy/sci-fi themed
- Emphasize the gecko's unique abilities and power
- Make it sound legendary and desirable
- Include references to the "Omniverse" setting

Example format: "Born in the cosmic storms of the Omega Nebula, this [Type] Gecko channels the raw power of [Element]. Its legendary [Attribute] makes it a formidable guardian capable of [Ability Description]."
`

    const response = await this.generateText(prompt)
    return response.content.trim()
  }

  async generatePersonalizedStrategy(playerProfile: any, currentLevel: number): Promise<{
    strategy: string
    towerRecommendations: Array<{
      type: string
      placement: string
      reasoning: string
    }>
    economyTips: string[]
    warningAreas: string[]
  }> {
    const prompt = `
Create a personalized strategy guide for level ${currentLevel} in Omniverse Geckos:

Player Profile:
${JSON.stringify(playerProfile, null, 2)}

Provide detailed strategy in JSON format:
{
  "strategy": "Overall strategy description",
  "towerRecommendations": [
    {
      "type": "tower_type",
      "placement": "where to place",
      "reasoning": "why this works for this player"
    }
  ],
  "economyTips": ["tip1", "tip2"],
  "warningAreas": ["potential pitfall1", "potential pitfall2"]
}
`

    const response = await this.generateText(prompt)
    try {
      return JSON.parse(response.content)
    } catch {
      return {
        strategy: "Focus on balanced early game development with emphasis on economy building",
        towerRecommendations: [
          {
            type: "Fire Gecko",
            placement: "Early chokepoints",
            reasoning: "Good damage-to-cost ratio for your playstyle"
          }
        ],
        economyTips: ["Prioritize gold generation in first 5 waves", "Don't over-invest in early upgrades"],
        warningAreas: ["Watch for air units in later waves", "Manage resource allocation carefully"]
      }
    }
  }

  async generateMarketplaceInsights(marketData: any): Promise<{
    trends: string[]
    priceAnalysis: string
    buyingOpportunities: string[]
    sellingAdvice: string[]
  }> {
    const prompt = `
Analyze the NFT marketplace data and provide trading insights for Omniverse Geckos:

Market Data:
${JSON.stringify(marketData, null, 2)}

Provide comprehensive market analysis in JSON format:
{
  "trends": ["Current market trends"],
  "priceAnalysis": "Overall price movement analysis",
  "buyingOpportunities": ["Good buying opportunities"],
  "sellingAdvice": ["When and what to sell"]
}
`

    const response = await this.generateText(prompt)
    try {
      return JSON.parse(response.content)
    } catch {
      return {
        trends: ["Fire Gecko prices trending upward", "Legendary NFTs gaining value"],
        priceAnalysis: "Market showing steady growth with increased trading volume",
        buyingOpportunities: ["Ice Gecko types currently undervalued", "Early generation NFTs worth considering"],
        sellingAdvice: ["Consider selling duplicates", "Hold rare attributes for long-term gains"]
      }
    }
  }

  // =============================================================================
  // Dynamic Content Generation
  // =============================================================================

  async generateQuestDescription(questType: string, requirements: any): Promise<string> {
    const prompt = `
Generate an engaging quest description for Omniverse Geckos:

Quest Type: ${questType}
Requirements: ${JSON.stringify(requirements)}

Create a compelling quest narrative that:
- Fits the sci-fi/fantasy Omniverse setting
- Clearly explains the objectives
- Motivates players to complete it
- Is 2-3 sentences long
`

    const response = await this.generateText(prompt)
    return response.content.trim()
  }

  async generateEventDescription(eventType: string, context: any): Promise<string> {
    const prompt = `
Generate an exciting event description for Omniverse Geckos:

Event Type: ${eventType}
Context: ${JSON.stringify(context)}

Create an immersive event description that:
- Captures the epic nature of the Omniverse
- Creates urgency and excitement
- Explains rewards and participation
- Is engaging and action-oriented
`

    const response = await this.generateText(prompt)
    return response.content.trim()
  }

  // =============================================================================
  // AI-Powered Game Balancing
  // =============================================================================

  async analyzeGameBalance(balanceData: {
    towers: Array<{ type: string; usage: number; winRate: number; cost: number }>
    levels: Array<{ id: number; completionRate: number; averageScore: number }>
    playerFeedback: Array<{ rating: number; comment: string }>
  }): Promise<{
    balanceIssues: string[]
    towerAdjustments: Array<{ tower: string; suggestion: string }>
    levelDifficulty: Array<{ level: number; status: 'too_easy' | 'balanced' | 'too_hard' }>
    playerSatisfaction: string
  }> {
    const prompt = `
Analyze game balance data for Omniverse Geckos and provide balancing recommendations:

${JSON.stringify(balanceData, null, 2)}

Provide comprehensive balance analysis in JSON format focusing on:
- Tower usage equality and win rates
- Level difficulty progression
- Player satisfaction metrics
- Specific adjustment recommendations
`

    const response = await this.generateText(prompt)
    try {
      return JSON.parse(response.content)
    } catch {
      return {
        balanceIssues: ["Some towers significantly underused", "Level 15-20 difficulty spike"],
        towerAdjustments: [
          { tower: "Ice Gecko", suggestion: "Increase slow effect duration by 20%" },
          { tower: "Fire Gecko", suggestion: "Slightly reduce cost from 50 to 45" }
        ],
        levelDifficulty: [
          { level: 5, status: 'too_easy' },
          { level: 18, status: 'too_hard' }
        ],
        playerSatisfaction: "Generally positive with room for improvement in mid-game balance"
      }
    }
  }

  // =============================================================================
  // Utility Methods
  // =============================================================================

  async isHealthy(): Promise<boolean> {
    if (!this.initialized) return false
    
    try {
      // Test with a simple prompt
      const response = await this.generateText("Hello, respond with 'OK'")
      return response.content.includes('OK')
    } catch {
      return false
    }
  }

  getUsageStats(): Record<string, number> {
    // In a real implementation, track usage stats
    return {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0
    }
  }

  destroy(): void {
    this.openai = null
    this.anthropic = null
    this.initialized = false
    console.log('🤖 AI Engine destroyed')
  }
}