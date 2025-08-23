import { AIEngine } from '../core/AIEngine'

// =============================================================================
// Types
// =============================================================================

export interface NFTGenerationParams {
  rarity: 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary' | 'Mythical'
  element: 'Fire' | 'Ice' | 'Electric' | 'Poison' | 'Cosmic' | 'Shadow' | 'Light' | 'Nature'
  generation: number
  parentTraits?: Array<{ trait: string; value: any }>
  specialRequirements?: string[]
  userPreferences?: Record<string, any>
}

export interface GeneratedNFTData {
  metadata: {
    name: string
    description: string
    image: string
    attributes: Array<{
      trait_type: string
      value: string | number
      display_type?: string
      max_value?: number
    }>
  }
  gameplayData: {
    stats: {
      power: number
      speed: number
      range: number
      special: number
      rarity_multiplier: number
    }
    abilities: Array<{
      name: string
      description: string
      cooldown: number
      effect: Record<string, any>
    }>
    evolution_paths: string[]
    breeding_value: number
  }
  visualData: {
    base_color: string
    accent_color: string
    pattern: string
    accessories: string[]
    background: string
    rarity_effects: string[]
  }
  loreData: {
    origin_story: string
    personality_traits: string[]
    legendary_status?: string
    historical_significance?: string
  }
}

export interface NFTMarketAnalysis {
  priceRange: { min: number; max: number; suggested: number }
  demandLevel: 'Low' | 'Medium' | 'High' | 'Very High'
  trends: string[]
  comparables: Array<{
    nftId: string
    price: number
    similarityScore: number
    reason: string
  }>
  marketPrediction: {
    short_term: string
    long_term: string
    factors: string[]
  }
}

// =============================================================================
// NFT AI Service
// =============================================================================

export class NFTAI {
  private aiEngine: AIEngine
  private generationHistory: Map<string, GeneratedNFTData> = new Map()
  private marketData: Map<string, NFTMarketAnalysis> = new Map()

  constructor(aiEngine: AIEngine) {
    this.aiEngine = aiEngine
  }

  // =============================================================================
  // AI-Powered NFT Generation
  // =============================================================================

  async generateNFT(params: NFTGenerationParams): Promise<GeneratedNFTData> {
    const generationPrompt = `
Generate a unique Omniverse Gecko NFT with the following parameters:

Parameters: ${JSON.stringify(params, null, 2)}

Create a comprehensive NFT that includes:

1. METADATA (OpenSea standard):
- Compelling name that fits the Omniverse lore
- Rich description (100-200 words) with backstory
- Complete attributes list with trait types and values

2. GAMEPLAY DATA:
- Balanced stats for tower defense gameplay
- Unique abilities that match the element/rarity
- Evolution potential and breeding value

3. VISUAL DATA:
- Color schemes and visual patterns
- Rarity-appropriate visual effects
- Distinctive accessories and backgrounds

4. LORE DATA:
- Origin story within the Omniverse
- Personality traits and characteristics
- Special significance if legendary/mythical

Consider:
- Rarity should affect all aspects (stats, abilities, visuals, lore)
- Element should drive abilities and visual theme
- Generation affects breeding potential and legacy traits
- Parent traits should influence offspring characteristics

Provide complete NFT data in this JSON format:
{
  "metadata": {
    "name": "Epic Gecko Name",
    "description": "Detailed lore-rich description",
    "image": "ipfs://generated_image_hash",
    "attributes": [
      {"trait_type": "Element", "value": "Fire"},
      {"trait_type": "Rarity", "value": "Epic"},
      {"trait_type": "Power", "value": 85, "display_type": "number", "max_value": 100},
      {"trait_type": "Generation", "value": 1}
    ]
  },
  "gameplayData": {
    "stats": {"power": 85, "speed": 70, "range": 80, "special": 90, "rarity_multiplier": 2.5},
    "abilities": [{"name": "Ability Name", "description": "What it does", "cooldown": 30, "effect": {"damage": 1.5, "duration": 10}}],
    "evolution_paths": ["Enhanced Fire Gecko", "Plasma Gecko"],
    "breeding_value": 750
  },
  "visualData": {
    "base_color": "#FF4500",
    "accent_color": "#FFD700",
    "pattern": "Flame Stripes",
    "accessories": ["Crystal Crown", "Fire Aura"],
    "background": "Volcanic Landscape",
    "rarity_effects": ["Flame Particles", "Heat Shimmer"]
  },
  "loreData": {
    "origin_story": "Born in the fires of...",
    "personality_traits": ["Fierce", "Loyal", "Determined"],
    "legendary_status": "Guardian of the Flame Temples",
    "historical_significance": "Participated in the Great Fire Wars"
  }
}
`

    const response = await this.aiEngine.generateText(generationPrompt)
    try {
      const nftData = JSON.parse(response.content)
      
      // Enhance with additional AI processing
      await this.enhanceNFTData(nftData, params)
      
      // Store generation history
      this.generationHistory.set(nftData.metadata.name, nftData)
      
      return nftData
    } catch (error) {
      console.error('NFT generation failed:', error)
      return this.generateFallbackNFT(params)
    }
  }

  async generateNFTCollection(theme: string, count: number, rarity_distribution: Record<string, number>): Promise<GeneratedNFTData[]> {
    const collectionPrompt = `
Generate a cohesive collection of ${count} Omniverse Gecko NFTs with the theme: "${theme}"

Rarity Distribution: ${JSON.stringify(rarity_distribution)}

Requirements:
- All NFTs should share the thematic elements
- Maintain rarity distribution as specified
- Create interconnected lore and stories
- Ensure gameplay balance across the collection
- Each NFT should be unique but thematically consistent

Provide a JSON array of complete NFT data objects.
`

    const response = await this.aiEngine.generateText(collectionPrompt)
    try {
      return JSON.parse(response.content)
    } catch {
      // Generate collection using individual generation
      const collection: GeneratedNFTData[] = []
      const elements = ['Fire', 'Ice', 'Electric', 'Poison', 'Cosmic', 'Shadow', 'Light', 'Nature']
      
      for (let i = 0; i < count; i++) {
        const rarity = this.selectRarityFromDistribution(rarity_distribution)
        const element = elements[i % elements.length] as any
        
        const nft = await this.generateNFT({
          rarity,
          element,
          generation: 1,
          specialRequirements: [`Theme: ${theme}`]
        })
        
        collection.push(nft)
      }
      
      return collection
    }
  }

  // =============================================================================
  // NFT Evolution and Breeding
  // =============================================================================

  async generateEvolutionOutcome(baseNFT: GeneratedNFTData, evolutionPath: string, requirements: any[]): Promise<GeneratedNFTData> {
    const evolutionPrompt = `
Evolve this Omniverse Gecko NFT along the specified path:

Base NFT: ${JSON.stringify(baseNFT, null, 2)}
Evolution Path: ${evolutionPath}
Requirements Met: ${JSON.stringify(requirements)}

Create the evolved form that:
- Maintains the core identity while showing growth
- Significantly improves stats and abilities
- Adds new visual elements showing evolution
- Updates lore to reflect the transformation
- Balances power increases appropriately

Provide the complete evolved NFT data in the same JSON format.
`

    const response = await this.aiEngine.generateText(evolutionPrompt)
    try {
      const evolvedNFT = JSON.parse(response.content)
      
      // Ensure evolution consistency
      evolvedNFT.metadata.attributes.push({
        trait_type: "Evolution",
        value: evolutionPath
      })
      
      return evolvedNFT
    } catch {
      return this.generateEvolutionFallback(baseNFT, evolutionPath)
    }
  }

  async generateBreedingOutcome(parent1: GeneratedNFTData, parent2: GeneratedNFTData): Promise<{
    offspring: GeneratedNFTData
    breedingReport: {
      inheritance_analysis: string
      mutation_events: string[]
      rarity_calculation: string
      special_traits: string[]
      breeding_success_rate: number
    }
  }> {
    const breedingPrompt = `
Generate offspring from breeding these two Omniverse Gecko NFTs:

Parent 1: ${JSON.stringify(parent1.metadata.attributes)}
Parent 2: ${JSON.stringify(parent2.metadata.attributes)}

Parent 1 Gameplay: ${JSON.stringify(parent1.gameplayData.stats)}
Parent 2 Gameplay: ${JSON.stringify(parent2.gameplayData.stats)}

Create offspring that:
- Inherits traits from both parents realistically
- Has potential for beneficial mutations (10% chance)
- Follows genetic rarity inheritance rules
- Combines visual elements creatively
- Has unique abilities that blend parent abilities
- Includes comprehensive breeding analysis

Provide offspring data and detailed breeding report.
`

    const response = await this.aiEngine.generateText(breedingPrompt)
    try {
      return JSON.parse(response.content)
    } catch {
      return this.generateBreedingFallback(parent1, parent2)
    }
  }

  // =============================================================================
  // Market Analysis and Pricing
  // =============================================================================

  async analyzeNFTMarketValue(nft: GeneratedNFTData, currentMarketData: any): Promise<NFTMarketAnalysis> {
    const analysisPrompt = `
Analyze the market value of this Omniverse Gecko NFT:

NFT Data: ${JSON.stringify(nft.metadata.attributes)}
Gameplay Stats: ${JSON.stringify(nft.gameplayData.stats)}
Current Market: ${JSON.stringify(currentMarketData)}

Consider:
- Rarity impact on pricing
- Gameplay utility value
- Visual appeal and uniqueness
- Current market trends
- Supply and demand factors
- Comparable sales data
- Future potential and evolution paths

Provide comprehensive market analysis in JSON format:
{
  "priceRange": {"min": 0.5, "max": 2.5, "suggested": 1.2},
  "demandLevel": "High",
  "trends": ["Fire element NFTs trending up 15%"],
  "comparables": [{"nftId": "similar_nft", "price": 1.1, "similarityScore": 0.85, "reason": "Similar stats and rarity"}],
  "marketPrediction": {
    "short_term": "Stable with potential 10% increase",
    "long_term": "Strong growth potential due to rarity",
    "factors": ["Limited fire element supply", "Strong gameplay utility"]
  }
}
`

    const response = await this.aiEngine.generateText(analysisPrompt)
    try {
      const analysis = JSON.parse(response.content)
      this.marketData.set(nft.metadata.name, analysis)
      return analysis
    } catch {
      return this.generateFallbackMarketAnalysis(nft)
    }
  }

  async identifyInvestmentOpportunities(marketData: any[], budget: number): Promise<{
    recommendations: Array<{
      nftId: string
      currentPrice: number
      predictedValue: number
      roi_potential: number
      risk_level: 'Low' | 'Medium' | 'High'
      reasoning: string
      timeframe: string
    }>
    portfolioSuggestion: {
      allocation: Record<string, number>
      strategy: string
      risk_assessment: string
    }
  }> {
    const investmentPrompt = `
Identify NFT investment opportunities in Omniverse Geckos:

Available NFTs: ${JSON.stringify(marketData)}
Budget: ${budget} ETH

Analyze each NFT for:
- Current vs fair value assessment
- Growth potential based on rarity/utility
- Market trend alignment
- Risk factors
- Portfolio diversification value

Provide investment recommendations with detailed analysis.
`

    const response = await this.aiEngine.generateText(investmentPrompt)
    try {
      return JSON.parse(response.content)
    } catch {
      return this.generateFallbackInvestmentAnalysis(marketData, budget)
    }
  }

  // =============================================================================
  // Visual Generation Integration
  // =============================================================================

  async generateVisualPrompt(nft: GeneratedNFTData): Promise<{
    mainPrompt: string
    styleModifiers: string[]
    negativePrompt: string
    technicalSettings: {
      dimensions: string
      style: string
      quality: string
    }
  }> {
    const visualPrompt = `
Create a detailed visual generation prompt for this Omniverse Gecko NFT:

NFT Data: ${JSON.stringify(nft)}

Generate prompts for AI image generation (DALL-E, Midjourney, Stable Diffusion) that will create:
- High-quality game-ready artwork
- Consistent visual style with the Omniverse theme
- Appropriate rarity visual effects
- Element-specific characteristics
- Background and composition

Provide structured prompts and settings.
`

    const response = await this.aiEngine.generateText(visualPrompt)
    try {
      return JSON.parse(response.content)
    } catch {
      return this.generateFallbackVisualPrompt(nft)
    }
  }

  // =============================================================================
  // Utility Methods
  // =============================================================================

  private async enhanceNFTData(nftData: GeneratedNFTData, params: NFTGenerationParams): Promise<void> {
    // Add generation tracking
    nftData.metadata.attributes.push({
      trait_type: "Generation",
      value: params.generation || 1
    })

    // Add timestamp
    nftData.metadata.attributes.push({
      trait_type: "Birth Time",
      value: new Date().toISOString()
    })

    // Calculate breeding value based on stats and rarity
    const statsSum = Object.values(nftData.gameplayData.stats).reduce((a, b) => a + b, 0)
    const rarityMultiplier = this.getRarityMultiplier(params.rarity)
    nftData.gameplayData.breeding_value = Math.floor(statsSum * rarityMultiplier * 10)
  }

  private generateFallbackNFT(params: NFTGenerationParams): GeneratedNFTData {
    return {
      metadata: {
        name: `${params.element} Gecko #${Date.now()}`,
        description: `A ${params.rarity.toLowerCase()} ${params.element.toLowerCase()} gecko from the Omniverse, ready for battle!`,
        image: `ipfs://fallback_${params.element.toLowerCase()}_gecko`,
        attributes: [
          { trait_type: "Element", value: params.element },
          { trait_type: "Rarity", value: params.rarity },
          { trait_type: "Power", value: 50, display_type: "number", max_value: 100 },
          { trait_type: "Speed", value: 50, display_type: "number", max_value: 100 }
        ]
      },
      gameplayData: {
        stats: {
          power: 50,
          speed: 50,
          range: 50,
          special: 50,
          rarity_multiplier: this.getRarityMultiplier(params.rarity)
        },
        abilities: [
          {
            name: `${params.element} Strike`,
            description: `Basic ${params.element.toLowerCase()} attack`,
            cooldown: 30,
            effect: { damage: 1.2 }
          }
        ],
        evolution_paths: [`Enhanced ${params.element} Gecko`],
        breeding_value: 500
      },
      visualData: {
        base_color: this.getElementColor(params.element),
        accent_color: "#FFFFFF",
        pattern: "Basic",
        accessories: [],
        background: "Default",
        rarity_effects: []
      },
      loreData: {
        origin_story: `A gecko born with ${params.element.toLowerCase()} powers in the Omniverse`,
        personality_traits: ["Brave", "Determined"],
        legendary_status: undefined,
        historical_significance: undefined
      }
    }
  }

  private generateEvolutionFallback(baseNFT: GeneratedNFTData, evolutionPath: string): GeneratedNFTData {
    const evolved = JSON.parse(JSON.stringify(baseNFT)) // Deep clone
    
    // Enhance stats
    evolved.gameplayData.stats.power += 20
    evolved.gameplayData.stats.speed += 15
    evolved.gameplayData.stats.special += 25
    
    // Update name and description
    evolved.metadata.name = `Evolved ${baseNFT.metadata.name}`
    evolved.metadata.description += ` This gecko has undergone evolution along the ${evolutionPath} path.`
    
    return evolved
  }

  private generateBreedingFallback(parent1: GeneratedNFTData, parent2: GeneratedNFTData): any {
    // Simple breeding logic
    const offspring = this.generateFallbackNFT({
      rarity: this.inheritRarity(
        parent1.metadata.attributes.find(a => a.trait_type === 'Rarity')?.value as string,
        parent2.metadata.attributes.find(a => a.trait_type === 'Rarity')?.value as string
      ),
      element: Math.random() > 0.5 ? 
        parent1.metadata.attributes.find(a => a.trait_type === 'Element')?.value as any :
        parent2.metadata.attributes.find(a => a.trait_type === 'Element')?.value as any,
      generation: 2
    })

    return {
      offspring,
      breedingReport: {
        inheritance_analysis: "Standard genetic inheritance occurred",
        mutation_events: [],
        rarity_calculation: "Average of parent rarities",
        special_traits: [],
        breeding_success_rate: 0.95
      }
    }
  }

  private generateFallbackMarketAnalysis(nft: GeneratedNFTData): NFTMarketAnalysis {
    const rarityMultiplier = this.getRarityMultiplier(
      nft.metadata.attributes.find(a => a.trait_type === 'Rarity')?.value as string
    )

    return {
      priceRange: {
        min: 0.1 * rarityMultiplier,
        max: 1.0 * rarityMultiplier,
        suggested: 0.5 * rarityMultiplier
      },
      demandLevel: 'Medium',
      trends: ['Stable market conditions'],
      comparables: [],
      marketPrediction: {
        short_term: 'Stable pricing expected',
        long_term: 'Gradual appreciation likely',
        factors: ['Gameplay utility', 'Rarity scarcity']
      }
    }
  }

  private generateFallbackInvestmentAnalysis(marketData: any[], budget: number): any {
    return {
      recommendations: [
        {
          nftId: 'sample_nft_1',
          currentPrice: 0.5,
          predictedValue: 0.75,
          roi_potential: 0.5,
          risk_level: 'Medium' as const,
          reasoning: 'Undervalued based on gameplay stats',
          timeframe: '3-6 months'
        }
      ],
      portfolioSuggestion: {
        allocation: { 'rare': 0.6, 'epic': 0.3, 'legendary': 0.1 },
        strategy: 'Balanced growth with focus on utility',
        risk_assessment: 'Moderate risk with good upside potential'
      }
    }
  }

  private generateFallbackVisualPrompt(nft: GeneratedNFTData): any {
    return {
      mainPrompt: `A majestic gecko creature with ${nft.visualData.base_color} coloring, fantasy art style, detailed digital painting`,
      styleModifiers: ['high quality', 'detailed', 'fantasy art'],
      negativePrompt: 'blurry, low quality, distorted',
      technicalSettings: {
        dimensions: '512x512',
        style: 'fantasy',
        quality: 'high'
      }
    }
  }

  private selectRarityFromDistribution(distribution: Record<string, number>): any {
    const rand = Math.random()
    let cumulative = 0
    
    for (const [rarity, probability] of Object.entries(distribution)) {
      cumulative += probability
      if (rand <= cumulative) {
        return rarity
      }
    }
    
    return 'Common'
  }

  private getRarityMultiplier(rarity: string): number {
    const multipliers = {
      'Common': 1,
      'Uncommon': 1.5,
      'Rare': 2,
      'Epic': 3,
      'Legendary': 5,
      'Mythical': 10
    }
    return multipliers[rarity as keyof typeof multipliers] || 1
  }

  private getElementColor(element: string): string {
    const colors = {
      'Fire': '#FF4500',
      'Ice': '#87CEEB',
      'Electric': '#FFFF00',
      'Poison': '#9ACD32',
      'Cosmic': '#FF69B4',
      'Shadow': '#2F2F2F',
      'Light': '#FFFFE0',
      'Nature': '#228B22'
    }
    return colors[element as keyof typeof colors] || '#808080'
  }

  private inheritRarity(rarity1: string, rarity2: string): any {
    const rarities = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Mythical']
    const index1 = rarities.indexOf(rarity1)
    const index2 = rarities.indexOf(rarity2)
    const avgIndex = Math.floor((index1 + index2) / 2)
    return rarities[Math.min(avgIndex, rarities.length - 1)]
  }
}