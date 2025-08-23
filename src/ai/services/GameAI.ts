import { AIEngine, GameAnalysisData } from '../core/AIEngine'

// =============================================================================
// Types
// =============================================================================

export interface AIGeckoTraits {
  type: 'Fire' | 'Ice' | 'Electric' | 'Poison' | 'Cosmic' | 'Shadow' | 'Light' | 'Nature'
  rarity: 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary' | 'Mythical'
  level: number
  experience: number
  power: number
  speed: number
  intelligence: number
  luck: number
  specialAbilities: string[]
  birthGeneration: number
  parentIds?: string[]
}

export interface AIPlayerProfile {
  id: string
  skillLevel: 'Novice' | 'Intermediate' | 'Advanced' | 'Expert' | 'Master'
  playStyle: 'Aggressive' | 'Defensive' | 'Balanced' | 'Economic' | 'Experimental'
  favoriteStrategies: string[]
  weaknesses: string[]
  gameHistory: {
    totalGames: number
    wins: number
    losses: number
    averageScore: number
    highestScore: number
    preferredDifficulty: string
  }
  learningData: {
    commonMistakes: string[]
    improvementAreas: string[]
    masteredConcepts: string[]
  }
}

export interface AIGameState {
  currentWave: number
  totalWaves: number
  playerLives: number
  playerGold: number
  score: number
  towers: Array<{
    id: string
    type: string
    position: { x: number; y: number }
    level: number
    kills: number
    damage: number
  }>
  enemies: Array<{
    type: string
    health: number
    speed: number
    reward: number
    position: { x: number; y: number }
  }>
  gameMode: string
  difficulty: string
  elapsedTime: number
}

// =============================================================================
// Game AI Service
// =============================================================================

export class GameAI {
  private aiEngine: AIEngine
  private playerProfiles: Map<string, AIPlayerProfile> = new Map()
  private gameAnalytics: Map<string, GameAnalysisData[]> = new Map()

  constructor(aiEngine: AIEngine) {
    this.aiEngine = aiEngine
  }

  // =============================================================================
  // Real-time Game Analysis
  // =============================================================================

  async analyzeGameplay(playerId: string, gameState: AIGameState): Promise<{
    realTimeAdvice: string[]
    strategyAdjustments: string[]
    warningAlerts: string[]
    optimizations: string[]
  }> {
    const playerProfile = this.getPlayerProfile(playerId)
    
    const analysisPrompt = `
As an expert Omniverse Geckos strategist, analyze this real-time game state and provide immediate tactical advice:

Player Profile: ${JSON.stringify(playerProfile, null, 2)}
Current Game State: ${JSON.stringify(gameState, null, 2)}

Consider:
- Tower placement efficiency
- Resource management
- Wave preparation
- Player's known strengths/weaknesses
- Current threat assessment

Provide actionable advice in JSON format:
{
  "realTimeAdvice": ["Immediate actions to take"],
  "strategyAdjustments": ["Strategic pivots to consider"],
  "warningAlerts": ["Urgent threats or problems"],
  "optimizations": ["Efficiency improvements"]
}
`

    const response = await this.aiEngine.generateText(analysisPrompt)
    try {
      return JSON.parse(response.content)
    } catch {
      return this.getFallbackGameAdvice(gameState)
    }
  }

  async predictWaveOutcome(gameState: AIGameState): Promise<{
    survivalProbability: number
    expectedLosses: number
    criticalWeaknesses: string[]
    recommendedActions: string[]
  }> {
    const predictionPrompt = `
Analyze this tower defense setup and predict the outcome of the upcoming wave:

${JSON.stringify(gameState, null, 2)}

Provide detailed predictions in JSON format:
{
  "survivalProbability": 0.85,
  "expectedLosses": 2,
  "criticalWeaknesses": ["Area where defenses are thin"],
  "recommendedActions": ["Specific actions to improve outcome"]
}
`

    const response = await this.aiEngine.generateText(predictionPrompt)
    try {
      const prediction = JSON.parse(response.content)
      
      // Store prediction for learning
      this.storePrediction(gameState, prediction)
      
      return prediction
    } catch {
      return {
        survivalProbability: 0.7,
        expectedLosses: Math.max(1, Math.floor(gameState.enemies.length * 0.1)),
        criticalWeaknesses: ["Insufficient coverage on eastern path"],
        recommendedActions: ["Add more towers to weak areas", "Upgrade existing towers"]
      }
    }
  }

  // =============================================================================
  // Dynamic Difficulty Adjustment
  // =============================================================================

  async calculateDynamicDifficulty(playerId: string, recentPerformance: any[]): Promise<{
    suggestedDifficulty: number
    reasoning: string
    adjustments: {
      enemyHealth: number
      enemySpeed: number
      waveSize: number
      goldRewards: number
    }
  }> {
    const playerProfile = this.getPlayerProfile(playerId)
    
    const difficultyPrompt = `
Calculate optimal dynamic difficulty for this player based on their profile and recent performance:

Player Profile: ${JSON.stringify(playerProfile)}
Recent Performance: ${JSON.stringify(recentPerformance)}

The goal is to maintain the perfect challenge level - not too easy, not too hard.
Consider:
- Win/loss ratio
- Score trends
- Time spent on levels
- Player improvement curve
- Engagement metrics

Provide difficulty calculation in JSON format:
{
  "suggestedDifficulty": 1.2,
  "reasoning": "Explanation of the difficulty choice",
  "adjustments": {
    "enemyHealth": 1.1,
    "enemySpeed": 1.0,
    "waveSize": 1.15,
    "goldRewards": 0.95
  }
}
`

    const response = await this.aiEngine.generateText(difficultyPrompt)
    try {
      return JSON.parse(response.content)
    } catch {
      return {
        suggestedDifficulty: 1.0,
        reasoning: "Maintaining baseline difficulty due to insufficient data",
        adjustments: {
          enemyHealth: 1.0,
          enemySpeed: 1.0,
          waveSize: 1.0,
          goldRewards: 1.0
        }
      }
    }
  }

  // =============================================================================
  // AI-Generated NFT Breeding
  // =============================================================================

  async generateBreedingOutcome(parent1: AIGeckoTraits, parent2: AIGeckoTraits): Promise<{
    offspring: AIGeckoTraits
    explanation: string
    rarity: string
    specialEvents: string[]
  }> {
    const breedingPrompt = `
Generate a unique offspring from breeding these two Gecko NFTs in the Omniverse:

Parent 1: ${JSON.stringify(parent1, null, 2)}
Parent 2: ${JSON.stringify(parent2, null, 2)}

Create a scientifically plausible but fantastical breeding outcome considering:
- Genetic inheritance from both parents
- Possible mutations
- Rarity calculations
- Special ability combinations
- Omniverse lore and genetics

Provide breeding result in JSON format:
{
  "offspring": {
    "type": "new_type_based_on_parents",
    "rarity": "calculated_rarity",
    "level": 1,
    "experience": 0,
    "power": "inherited_and_mutated_value",
    "speed": "inherited_value",
    "intelligence": "inherited_value",
    "luck": "inherited_value",
    "specialAbilities": ["unique_abilities"],
    "birthGeneration": "parent_generation + 1",
    "parentIds": ["parent1_id", "parent2_id"]
  },
  "explanation": "How the genetics worked",
  "rarity": "Common/Uncommon/Rare/Epic/Legendary/Mythical",
  "specialEvents": ["Any special breeding events"]
}
`

    const response = await this.aiEngine.generateText(breedingPrompt)
    try {
      return JSON.parse(response.content)
    } catch {
      return this.generateFallbackBreeding(parent1, parent2)
    }
  }

  async generateEvolutionPath(gecko: AIGeckoTraits): Promise<{
    evolutionOptions: Array<{
      name: string
      requirements: string[]
      newAbilities: string[]
      statChanges: Record<string, number>
      description: string
    }>
    recommendedPath: string
    timelineEstimate: string
  }> {
    const evolutionPrompt = `
Design evolution paths for this Gecko NFT in the Omniverse:

Current Gecko: ${JSON.stringify(gecko, null, 2)}

Create multiple compelling evolution options that:
- Build on current abilities
- Offer meaningful choices
- Have clear requirements
- Enhance gameplay value
- Fit the Omniverse lore

Provide evolution design in JSON format with multiple paths.
`

    const response = await this.aiEngine.generateText(evolutionPrompt)
    try {
      return JSON.parse(response.content)
    } catch {
      return this.generateFallbackEvolution(gecko)
    }
  }

  // =============================================================================
  // AI-Powered Economy Balancing
  // =============================================================================

  async analyzeEconomyBalance(economyData: {
    tokenSupply: number
    tokenDistribution: Record<string, number>
    nftPrices: Record<string, number>
    tradingVolume: number
    playerEarnings: number[]
    inflationRate: number
  }): Promise<{
    healthScore: number
    issues: string[]
    recommendations: string[]
    adjustments: {
      rewardRates: number
      costs: Record<string, number>
      tokenSinks: string[]
    }
  }> {
    const economyPrompt = `
Analyze the game economy health for Omniverse Geckos:

Economy Data: ${JSON.stringify(economyData, null, 2)}

Evaluate:
- Token inflation/deflation
- Earning vs spending balance
- NFT price stability
- Player economic satisfaction
- Long-term sustainability

Provide comprehensive economy analysis in JSON format.
`

    const response = await this.aiEngine.generateText(economyPrompt)
    try {
      return JSON.parse(response.content)
    } catch {
      return {
        healthScore: 75,
        issues: ["Slight token inflation", "High-tier NFT prices volatile"],
        recommendations: ["Increase token sinks", "Add more reward variety"],
        adjustments: {
          rewardRates: 0.95,
          costs: { "upgrades": 1.1, "breeding": 1.05 },
          tokenSinks: ["Cosmetic items", "Premium features"]
        }
      }
    }
  }

  // =============================================================================
  // Personalized Content Generation
  // =============================================================================

  async generatePersonalizedQuests(playerId: string): Promise<Array<{
    id: string
    title: string
    description: string
    objectives: string[]
    rewards: Record<string, number>
    difficulty: string
    estimatedTime: string
    personalizedReason: string
  }>> {
    const playerProfile = this.getPlayerProfile(playerId)
    
    const questPrompt = `
Generate personalized quests for this player in Omniverse Geckos:

Player Profile: ${JSON.stringify(playerProfile)}

Create 3-5 quests that:
- Match the player's skill level
- Address their weaknesses
- Build on their strengths
- Offer appropriate rewards
- Feel engaging and achievable

Provide quests in JSON array format.
`

    const response = await this.aiEngine.generateText(questPrompt)
    try {
      return JSON.parse(response.content)
    } catch {
      return this.generateFallbackQuests(playerId)
    }
  }

  async generatePersonalizedTutorial(playerId: string): Promise<{
    steps: Array<{
      title: string
      instruction: string
      visualAid: string
      checkCondition: string
    }>
    adaptiveHints: string[]
    skillFocus: string[]
  }> {
    const playerProfile = this.getPlayerProfile(playerId)
    
    const tutorialPrompt = `
Create a personalized tutorial for this player:

Player Profile: ${JSON.stringify(playerProfile)}

Design a tutorial that:
- Adapts to their current skill level
- Focuses on their weak areas
- Uses their preferred learning style
- Is engaging and interactive
- Provides clear progress markers

Provide tutorial in structured JSON format.
`

    const response = await this.aiEngine.generateText(tutorialPrompt)
    try {
      return JSON.parse(response.content)
    } catch {
      return this.generateFallbackTutorial()
    }
  }

  // =============================================================================
  // Player Profile Management
  // =============================================================================

  getPlayerProfile(playerId: string): AIPlayerProfile {
    return this.playerProfiles.get(playerId) || this.createDefaultProfile(playerId)
  }

  updatePlayerProfile(playerId: string, gameData: Partial<AIPlayerProfile>): void {
    const existing = this.getPlayerProfile(playerId)
    const updated = { ...existing, ...gameData }
    this.playerProfiles.set(playerId, updated)
  }

  async analyzePlayerBehavior(playerId: string, recentActions: any[]): Promise<Partial<AIPlayerProfile>> {
    const behaviorPrompt = `
Analyze player behavior and update their profile:

Recent Actions: ${JSON.stringify(recentActions, null, 2)}

Extract insights about:
- Skill level changes
- Play style preferences
- Learning progress
- Common patterns
- Areas for improvement

Provide profile updates in JSON format.
`

    const response = await this.aiEngine.generateText(behaviorPrompt)
    try {
      const updates = JSON.parse(response.content)
      this.updatePlayerProfile(playerId, updates)
      return updates
    } catch {
      return {}
    }
  }

  // =============================================================================
  // Fallback Methods
  // =============================================================================

  private getFallbackGameAdvice(gameState: AIGameState) {
    const advice = []
    const warnings = []
    
    if (gameState.playerGold > 200) {
      advice.push("You have excess gold - consider upgrading towers or building new ones")
    }
    
    if (gameState.towers.length < gameState.currentWave * 2) {
      warnings.push("Consider building more towers for the upcoming waves")
    }
    
    return {
      realTimeAdvice: advice,
      strategyAdjustments: ["Focus on tower synergies"],
      warningAlerts: warnings,
      optimizations: ["Optimize tower placement for maximum coverage"]
    }
  }

  private generateFallbackBreeding(parent1: AIGeckoTraits, parent2: AIGeckoTraits): any {
    const avgPower = Math.floor((parent1.power + parent2.power) / 2)
    const mutation = Math.random() > 0.8 ? Math.floor(Math.random() * 20 - 10) : 0
    
    return {
      offspring: {
        type: Math.random() > 0.5 ? parent1.type : parent2.type,
        rarity: this.calculateBreedingRarity(parent1.rarity, parent2.rarity),
        level: 1,
        experience: 0,
        power: Math.max(1, avgPower + mutation),
        speed: Math.floor((parent1.speed + parent2.speed) / 2),
        intelligence: Math.floor((parent1.intelligence + parent2.intelligence) / 2),
        luck: Math.floor((parent1.luck + parent2.luck) / 2),
        specialAbilities: this.inheritAbilities(parent1, parent2),
        birthGeneration: Math.max(parent1.birthGeneration, parent2.birthGeneration) + 1,
        parentIds: ['parent1', 'parent2']
      },
      explanation: "Standard genetic inheritance with minor mutations",
      rarity: this.calculateBreedingRarity(parent1.rarity, parent2.rarity),
      specialEvents: mutation !== 0 ? ["Power mutation occurred!"] : []
    }
  }

  private generateFallbackEvolution(gecko: AIGeckoTraits): any {
    return {
      evolutionOptions: [
        {
          name: `Enhanced ${gecko.type}`,
          requirements: [`Reach level ${gecko.level + 10}`, "Win 5 consecutive battles"],
          newAbilities: [`Superior ${gecko.type.toLowerCase()} mastery`],
          statChanges: { power: 25, speed: 10 },
          description: `Evolved form with enhanced ${gecko.type.toLowerCase()} capabilities`
        }
      ],
      recommendedPath: `Enhanced ${gecko.type}`,
      timelineEstimate: "2-3 weeks of active gameplay"
    }
  }

  private generateFallbackQuests(playerId: string): any[] {
    return [
      {
        id: `quest_${playerId}_1`,
        title: "Tower Defense Mastery",
        description: "Complete 3 levels without losing any lives",
        objectives: ["Win Level 5", "Win Level 6", "Win Level 7"],
        rewards: { tokens: 100, experience: 50 },
        difficulty: "Intermediate",
        estimatedTime: "30 minutes",
        personalizedReason: "Helps improve defensive strategies"
      }
    ]
  }

  private generateFallbackTutorial(): any {
    return {
      steps: [
        {
          title: "Basic Tower Placement",
          instruction: "Click and drag a tower from the sidebar to the battlefield",
          visualAid: "Highlight tower selection area",
          checkCondition: "Player places first tower"
        }
      ],
      adaptiveHints: ["Try different tower types to see their effects"],
      skillFocus: ["Tower placement", "Resource management"]
    }
  }

  private createDefaultProfile(playerId: string): AIPlayerProfile {
    return {
      id: playerId,
      skillLevel: 'Novice',
      playStyle: 'Balanced',
      favoriteStrategies: [],
      weaknesses: [],
      gameHistory: {
        totalGames: 0,
        wins: 0,
        losses: 0,
        averageScore: 0,
        highestScore: 0,
        preferredDifficulty: 'Normal'
      },
      learningData: {
        commonMistakes: [],
        improvementAreas: [],
        masteredConcepts: []
      }
    }
  }

  private calculateBreedingRarity(rarity1: string, rarity2: string): string {
    const rarities = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Mythical']
    const index1 = rarities.indexOf(rarity1)
    const index2 = rarities.indexOf(rarity2)
    const avgIndex = Math.floor((index1 + index2) / 2)
    return rarities[Math.min(avgIndex, rarities.length - 1)]
  }

  private inheritAbilities(parent1: AIGeckoTraits, parent2: AIGeckoTraits): string[] {
    const combined = [...parent1.specialAbilities, ...parent2.specialAbilities]
    const unique = [...new Set(combined)]
    return unique.slice(0, 3) // Max 3 abilities
  }

  private storePrediction(gameState: AIGameState, prediction: any): void {
    // Store for machine learning improvement
    // In production, this would go to a database
  }
}