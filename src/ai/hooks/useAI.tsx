'use client'

import React, { useState, useEffect, useContext, createContext, ReactNode } from 'react'
import { useAccount } from 'wagmi'
import { AIEngine, AIConfig } from '../core/AIEngine'
import { GameAI } from '../services/GameAI'
import { NFTAI } from '../services/NFTAI'
import { PersonalizationAI } from '../services/PersonalizationAI'

// =============================================================================
// Types
// =============================================================================

interface AIContextType {
  aiEngine: AIEngine | null
  gameAI: GameAI | null
  nftAI: NFTAI | null
  personalizationAI: PersonalizationAI | null
  isInitialized: boolean
  isLoading: boolean
  error: string | null
  capabilities: {
    textGeneration: boolean
    gameAnalysis: boolean
    nftGeneration: boolean
    personalization: boolean
    marketAnalysis: boolean
  }
}

// =============================================================================
// AI Context
// =============================================================================

const AIContext = createContext<AIContextType | undefined>(undefined)

// =============================================================================
// AI Provider
// =============================================================================

export function AIProvider({ children }: { children: ReactNode }) {
  const [aiEngine, setAIEngine] = useState<AIEngine | null>(null)
  const [gameAI, setGameAI] = useState<GameAI | null>(null)
  const [nftAI, setNFTAI] = useState<NFTAI | null>(null)
  const [personalizationAI, setPersonalizationAI] = useState<PersonalizationAI | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    initializeAI()
  }, [])

  const initializeAI = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // AI Configuration
      const config: AIConfig = {
        openai: {
          apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || '',
          model: 'gpt-4',
          maxTokens: 2000,
          temperature: 0.7
        },
        anthropic: {
          apiKey: process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY || '',
          model: 'claude-3-sonnet-20240229',
          maxTokens: 2000
        },
        huggingface: {
          apiKey: process.env.NEXT_PUBLIC_HUGGINGFACE_API_KEY || '',
          models: {
            textGeneration: 'microsoft/DialoGPT-medium',
            imageGeneration: 'runwayml/stable-diffusion-v1-5',
            embedding: 'sentence-transformers/all-MiniLM-L6-v2'
          }
        }
      }

      // Initialize AI Engine
      const engine = new AIEngine(config)
      await engine.initialize()
      setAIEngine(engine)

      // Initialize AI Services
      const gameAIService = new GameAI(engine)
      const nftAIService = new NFTAI(engine)
      const personalizationAIService = new PersonalizationAI(engine)

      setGameAI(gameAIService)
      setNFTAI(nftAIService)
      setPersonalizationAI(personalizationAIService)

      setIsInitialized(true)
      console.log('🤖 AI System initialized successfully')
    } catch (err) {
      console.error('❌ Failed to initialize AI:', err)
      setError(err instanceof Error ? err.message : 'Failed to initialize AI')
    } finally {
      setIsLoading(false)
    }
  }

  const capabilities = {
    textGeneration: !!aiEngine,
    gameAnalysis: !!gameAI,
    nftGeneration: !!nftAI,
    personalization: !!personalizationAI,
    marketAnalysis: !!nftAI && !!aiEngine
  }

  const contextValue: AIContextType = {
    aiEngine,
    gameAI,
    nftAI,
    personalizationAI,
    isInitialized,
    isLoading,
    error,
    capabilities
  }

  return (
    <AIContext.Provider value={contextValue}>
      {children}
    </AIContext.Provider>
  )
}

// =============================================================================
// Main AI Hook
// =============================================================================

export function useAI() {
  const context = useContext(AIContext)
  if (!context) {
    throw new Error('useAI must be used within an AIProvider')
  }
  return context
}

// =============================================================================
// Specialized AI Hooks
// =============================================================================

export function useGameAI() {
  const { gameAI, isInitialized } = useAI()
  const { address } = useAccount()

  const analyzeGameplay = async (gameState: any) => {
    if (!gameAI || !isInitialized || !address) return null
    
    try {
      return await gameAI.analyzeGameplay(address, gameState)
    } catch (error) {
      console.error('Game analysis failed:', error)
      return null
    }
  }

  const predictWaveOutcome = async (gameState: any) => {
    if (!gameAI || !isInitialized) return null
    
    try {
      return await gameAI.predictWaveOutcome(gameState)
    } catch (error) {
      console.error('Wave prediction failed:', error)
      return null
    }
  }

  const generatePersonalizedStrategy = async (playerProfile: any, currentLevel: number) => {
    if (!gameAI || !isInitialized || !address) return null
    
    try {
      return await gameAI.generatePersonalizedQuests(address)
    } catch (error) {
      console.error('Strategy generation failed:', error)
      return null
    }
  }

  return {
    analyzeGameplay,
    predictWaveOutcome,
    generatePersonalizedStrategy,
    isAvailable: !!gameAI && isInitialized
  }
}

export function useNFTAI() {
  const { nftAI, isInitialized } = useAI()

  const generateNFT = async (params: any) => {
    if (!nftAI || !isInitialized) return null
    
    try {
      return await nftAI.generateNFT(params)
    } catch (error) {
      console.error('NFT generation failed:', error)
      return null
    }
  }

  const generateBreeding = async (parent1: any, parent2: any) => {
    if (!nftAI || !isInitialized) return null
    
    try {
      return await nftAI.generateBreedingOutcome(parent1, parent2)
    } catch (error) {
      console.error('Breeding generation failed:', error)
      return null
    }
  }

  const analyzeMarketValue = async (nft: any, marketData: any) => {
    if (!nftAI || !isInitialized) return null
    
    try {
      return await nftAI.analyzeNFTMarketValue(nft, marketData)
    } catch (error) {
      console.error('Market analysis failed:', error)
      return null
    }
  }

  const generateCollection = async (theme: string, count: number, distribution: any) => {
    if (!nftAI || !isInitialized) return null
    
    try {
      return await nftAI.generateNFTCollection(theme, count, distribution)
    } catch (error) {
      console.error('Collection generation failed:', error)
      return null
    }
  }

  return {
    generateNFT,
    generateBreeding,
    analyzeMarketValue,
    generateCollection,
    isAvailable: !!nftAI && isInitialized
  }
}

export function usePersonalizationAI() {
  const { personalizationAI, isInitialized } = useAI()
  const { address } = useAccount()

  const [personalizedExperience, setPersonalizedExperience] = useState<any>(null)
  const [userProfile, setUserProfile] = useState<any>(null)

  const generatePersonalizedExperience = async (context: any) => {
    if (!personalizationAI || !isInitialized || !address) return null
    
    try {
      const experience = await personalizationAI.generatePersonalizedExperience(address, context)
      setPersonalizedExperience(experience)
      return experience
    } catch (error) {
      console.error('Personalization failed:', error)
      return null
    }
  }

  const analyzeUserBehavior = async (behaviorData: any[]) => {
    if (!personalizationAI || !isInitialized || !address) return null
    
    try {
      return await personalizationAI.analyzeUserBehavior(address, behaviorData)
    } catch (error) {
      console.error('Behavior analysis failed:', error)
      return null
    }
  }

  const personalizeMarketplace = async (availableNFTs: any[]) => {
    if (!personalizationAI || !isInitialized || !address) return null
    
    try {
      return await personalizationAI.personalizeMarketplaceContent(address, availableNFTs)
    } catch (error) {
      console.error('Marketplace personalization failed:', error)
      return null
    }
  }

  const adaptToMood = async (moodIndicators: string[]) => {
    if (!personalizationAI || !isInitialized || !address) return null
    
    try {
      return await personalizationAI.adaptToUserMood(address, moodIndicators)
    } catch (error) {
      console.error('Mood adaptation failed:', error)
      return null
    }
  }

  return {
    personalizedExperience,
    userProfile,
    generatePersonalizedExperience,
    analyzeUserBehavior,
    personalizeMarketplace,
    adaptToMood,
    isAvailable: !!personalizationAI && isInitialized
  }
}

// =============================================================================
// Smart Recommendations Hook
// =============================================================================

export function useSmartRecommendations() {
  const { gameAI, nftAI, personalizationAI, isInitialized } = useAI()
  const { address } = useAccount()

  const [recommendations, setRecommendations] = useState<{
    gameplay: any[]
    nfts: any[]
    social: any[]
    learning: any[]
  }>({
    gameplay: [],
    nfts: [],
    social: [],
    learning: []
  })

  const generateRecommendations = async (context: {
    currentActivity: string
    recentHistory: any[]
    preferences: any
    performance: any
  }) => {
    if (!isInitialized || !address) return

    try {
      const promises = []

      // Gameplay recommendations
      if (gameAI) {
        promises.push(
          gameAI.generatePersonalizedQuests(address).then(quests => ({
            type: 'gameplay',
            data: quests
          }))
        )
      }

      // NFT recommendations
      if (nftAI && context.currentActivity === 'marketplace') {
        promises.push(
          nftAI.identifyInvestmentOpportunities(context.recentHistory, 1.0).then(opportunities => ({
            type: 'nfts',
            data: opportunities.recommendations
          }))
        )
      }

      // Personalization recommendations
      if (personalizationAI) {
        promises.push(
          personalizationAI.recommendSocialConnections(address, []).then(social => ({
            type: 'social',
            data: social.recommended_guilds
          }))
        )
      }

      const results = await Promise.allSettled(promises)
      const newRecommendations = { ...recommendations }

      results.forEach((result) => {
        if (result.status === 'fulfilled') {
          const { type, data } = result.value
          newRecommendations[type as keyof typeof newRecommendations] = data || []
        }
      })

      setRecommendations(newRecommendations)
    } catch (error) {
      console.error('Recommendation generation failed:', error)
    }
  }

  return {
    recommendations,
    generateRecommendations,
    isAvailable: isInitialized
  }
}

// =============================================================================
// AI Chat Assistant Hook
// =============================================================================

export function useAIChatAssistant() {
  const { aiEngine, isInitialized } = useAI()
  const [chatHistory, setChatHistory] = useState<Array<{
    id: string
    message: string
    sender: 'user' | 'ai'
    timestamp: number
    context?: any
  }>>([])
  const [isTyping, setIsTyping] = useState(false)

  const sendMessage = async (message: string, context?: any) => {
    if (!aiEngine || !isInitialized) return

    const userMessage = {
      id: `user_${Date.now()}`,
      message,
      sender: 'user' as const,
      timestamp: Date.now(),
      context
    }

    setChatHistory(prev => [...prev, userMessage])
    setIsTyping(true)

    try {
      const prompt = `
You are an expert AI assistant for Omniverse Geckos, a Web3 tower defense game with NFTs. 
Help the user with their question: "${message}"

Context: ${context ? JSON.stringify(context) : 'General inquiry'}

Previous conversation: ${chatHistory.slice(-5).map(h => `${h.sender}: ${h.message}`).join('\n')}

Provide helpful, accurate, and engaging assistance. Keep responses concise but informative.
Focus on game mechanics, strategy, NFT advice, or technical support as appropriate.
`

      const response = await aiEngine.generateText(prompt)

      const aiMessage = {
        id: `ai_${Date.now()}`,
        message: response.content,
        sender: 'ai' as const,
        timestamp: Date.now()
      }

      setChatHistory(prev => [...prev, aiMessage])
    } catch (error) {
      console.error('Chat assistant error:', error)
      
      const errorMessage = {
        id: `ai_${Date.now()}`,
        message: "I'm sorry, I'm having trouble processing that right now. Please try again later!",
        sender: 'ai' as const,
        timestamp: Date.now()
      }

      setChatHistory(prev => [...prev, errorMessage])
    } finally {
      setIsTyping(false)
    }
  }

  const clearChat = () => {
    setChatHistory([])
  }

  const generateGameHelp = async (topic: string) => {
    const helpPrompts = {
      'tower_placement': 'How should I place towers for maximum effectiveness?',
      'nft_breeding': 'What are the best strategies for breeding powerful NFTs?',
      'market_trading': 'How can I make smart trades in the NFT marketplace?',
      'game_strategy': 'What are advanced strategies for high-level gameplay?'
    }

    const prompt = helpPrompts[topic as keyof typeof helpPrompts] || `Help me with ${topic}`
    await sendMessage(prompt, { helpTopic: topic })
  }

  return {
    chatHistory,
    isTyping,
    sendMessage,
    clearChat,
    generateGameHelp,
    isAvailable: !!aiEngine && isInitialized
  }
}

// =============================================================================
// AI Performance Monitor Hook
// =============================================================================

export function useAIPerformanceMonitor() {
  const { aiEngine, isInitialized } = useAI()
  const [metrics, setMetrics] = useState({
    responseTime: 0,
    successRate: 0,
    totalRequests: 0,
    healthStatus: 'unknown' as 'healthy' | 'degraded' | 'unhealthy' | 'unknown'
  })

  const checkAIHealth = async () => {
    if (!aiEngine || !isInitialized) return

    try {
      const startTime = Date.now()
      const isHealthy = await aiEngine.isHealthy()
      const responseTime = Date.now() - startTime

      setMetrics(prev => ({
        ...prev,
        responseTime,
        healthStatus: isHealthy ? 'healthy' : 'unhealthy',
        totalRequests: prev.totalRequests + 1
      }))
    } catch (error) {
      setMetrics(prev => ({
        ...prev,
        healthStatus: 'unhealthy',
        totalRequests: prev.totalRequests + 1
      }))
    }
  }

  const getUsageStats = () => {
    if (!aiEngine) return {}
    return aiEngine.getUsageStats()
  }

  useEffect(() => {
    if (isInitialized) {
      checkAIHealth()
      
      // Check health every 5 minutes
      const interval = setInterval(checkAIHealth, 5 * 60 * 1000)
      return () => clearInterval(interval)
    }
  }, [isInitialized])

  return {
    metrics,
    checkAIHealth,
    getUsageStats,
    isMonitoring: isInitialized
  }
}