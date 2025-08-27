'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  MessageCircle, 
  X, 
  Send, 
  Bot, 
  Zap, 
  Lightbulb,
  TrendingUp,
  Shield,
  Sparkles,
  User,
  Minimize2,
  Maximize2,
  Settings,
  History,
  Brain,
  Target,
  Gamepad2,
  Coins,
  Trophy,
  Users,
  Activity,
  BookOpen,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  RefreshCw,
  Star
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { useAIChatAssistant, usePersonalizationAI, useSmartRecommendations, useGameAI } from '@/ai/hooks/useAI'
import { cn } from '@/lib/utils'

// =============================================================================
// Enhanced Types
// =============================================================================

interface EnhancedAIAssistantProps {
  className?: string
  defaultOpen?: boolean
  context?: any
  gameState?: {
    currentWave: number
    score: number
    level: number
    towers: any[]
    resources: any
    difficulty: string
    hasOptimizedTeam: boolean
  }
  playerStats?: {
    winRate: number
    averageScore: number
    gamesPlayed: number
    geckoTokens: number
    nftCollection: any[]
    skillLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert'
    preferredStrategies: string[]
  }
  onRecommendationApply?: (recommendation: any) => void
}

interface AIMode {
  id: 'chat' | 'analysis' | 'recommendations' | 'strategy'
  label: string
  icon: React.ComponentType<{ className?: string }>
  description: string
}

interface SmartSuggestion {
  id: string
  text: string
  priority: 'low' | 'medium' | 'high'
  category: string
  confidence: number
}

// =============================================================================
// Enhanced AI Modes
// =============================================================================

const aiModes: AIMode[] = [
  {
    id: 'chat',
    label: 'Chat',
    icon: MessageCircle,
    description: 'General conversation and questions'
  },
  {
    id: 'analysis',
    label: 'Analysis',
    icon: Activity,
    description: 'Deep gameplay and performance analysis'
  },
  {
    id: 'recommendations',
    label: 'Recommendations',
    icon: Target,
    description: 'Personalized suggestions and advice'
  },
  {
    id: 'strategy',
    label: 'Strategy',
    icon: Brain,
    description: 'Advanced strategy planning and optimization'
  }
]

const quickActions = [
  {
    id: 'tower_optimization',
    label: 'Tower Strategy',
    icon: Shield,
    topic: 'tower_optimization',
    description: 'AI-powered tower placement and synergy analysis',
    category: 'gameplay'
  },
  {
    id: 'breeding_analysis',
    label: 'Breeding Intel',
    icon: Sparkles,
    topic: 'breeding_analysis', 
    description: 'Genetic analysis and breeding outcome predictions',
    category: 'nft'
  },
  {
    id: 'market_intelligence',
    label: 'Market Intel',
    icon: TrendingUp,
    topic: 'market_intelligence',
    description: 'Real-time market trends and investment opportunities',
    category: 'trading'
  },
  {
    id: 'performance_coaching',
    label: 'Performance Coach',
    icon: Target,
    topic: 'performance_coaching',
    description: 'Personalized coaching based on your gameplay data',
    category: 'improvement'
  },
  {
    id: 'guild_matching',
    label: 'Guild Matcher',
    icon: Users,
    topic: 'guild_matching',
    description: 'Find compatible guilds and teammates',
    category: 'social'
  },
  {
    id: 'resource_optimization',
    label: 'Resource Manager',
    icon: Coins,
    topic: 'resource_optimization',
    description: 'Optimize your token and NFT resource allocation',
    category: 'economy'
  }
]

// =============================================================================
// Enhanced AI Assistant Component
// =============================================================================

export function EnhancedAIAssistant({ 
  className, 
  defaultOpen = false, 
  context, 
  gameState,
  playerStats,
  onRecommendationApply
}: EnhancedAIAssistantProps) {
  // State Management
  const [isOpen, setIsOpen] = useState(defaultOpen)
  const [isMinimized, setIsMinimized] = useState(false)
  const [currentInput, setCurrentInput] = useState('')
  const [activeMode, setActiveMode] = useState<AIMode['id']>('chat')
  const [smartSuggestions, setSmartSuggestions] = useState<SmartSuggestion[]>([])
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [contextualInsights, setContextualInsights] = useState<any[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // AI Hooks
  const {
    chatHistory,
    isTyping,
    sendMessage,
    clearChat,
    generateGameHelp,
    isAvailable
  } = useAIChatAssistant()

  const { personalizedExperience, generatePersonalizedExperience } = usePersonalizationAI()
  const { recommendations, generateRecommendations } = useSmartRecommendations()
  const { analyzeGameplay, generatePersonalizedStrategy } = useGameAI()

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatHistory, isTyping])

  // Generate contextual insights when game state changes
  useEffect(() => {
    if (gameState && playerStats && isOpen) {
      generateContextualInsights()
      generateSmartSuggestions()
    }
  }, [gameState, playerStats, isOpen])

  // Initialize AI personalization
  useEffect(() => {
    if (isOpen && playerStats && !personalizedExperience) {
      generatePersonalizedExperience({
        playerStats,
        gameState,
        timestamp: Date.now()
      })
    }
  }, [isOpen, playerStats])

  // Generate contextual insights
  const generateContextualInsights = async () => {
    if (!gameState || !playerStats) return

    try {
      const analysis = await analyzeGameplay({
        gameState,
        playerStats,
        recentActions: []
      })
      
      if (analysis) {
        setContextualInsights([
          {
            type: 'performance',
            title: 'Performance Insight',
            content: analysis.summary || 'Analysis complete',
            confidence: 0.85
          },
          {
            type: 'strategy',
            title: 'Strategy Recommendation',
            content: 'Based on your play style, consider focusing on early economy.',
            confidence: 0.92
          }
        ])
      }
    } catch (error) {
      console.error('Failed to generate insights:', error)
    }
  }

  // Generate smart suggestions
  const generateSmartSuggestions = () => {
    const suggestions: SmartSuggestion[] = []

    if (gameState && playerStats) {
      // Performance-based suggestions
      if (playerStats.winRate < 0.6) {
        suggestions.push({
          id: 'improve_defense',
          text: 'How can I improve my tower defense strategy?',
          priority: 'high',
          category: 'performance',
          confidence: 0.9
        })
      }

      // Resource optimization
      if (playerStats.geckoTokens > 1000) {
        suggestions.push({
          id: 'token_investment',
          text: 'What's the best way to invest my GECKO tokens?',
          priority: 'medium',
          category: 'economy',
          confidence: 0.8
        })
      }

      // NFT optimization
      if (playerStats.nftCollection?.length > 3) {
        suggestions.push({
          id: 'nft_optimization',
          text: 'Which NFTs work best together in my collection?',
          priority: 'medium', 
          category: 'strategy',
          confidence: 0.85
        })
      }

      // Social recommendations
      if (playerStats.gamesPlayed > 10 && !gameState?.inGuild) {
        suggestions.push({
          id: 'guild_recommendation',
          text: 'Find me a guild that matches my play style',
          priority: 'low',
          category: 'social',
          confidence: 0.75
        })
      }
    }

    setSmartSuggestions(suggestions.slice(0, 3))
  }

  // Enhanced message sending with context
  const handleSendMessage = async (message: string) => {
    if (!message.trim() || !isAvailable) return
    
    const enhancedContext = {
      ...context,
      gameState,
      playerStats,
      personalizedExperience,
      activeMode,
      timestamp: Date.now()
    }

    await sendMessage(message, enhancedContext)
    setCurrentInput('')
    
    // Update recommendations after chat
    if (gameState && playerStats) {
      await generateRecommendations({
        currentActivity: activeMode,
        recentHistory: chatHistory.slice(-5),
        preferences: playerStats.preferredStrategies,
        performance: {
          winRate: playerStats.winRate,
          averageScore: playerStats.averageScore
        }
      })
    }
  }

  // Handle smart suggestion clicks
  const handleSuggestionClick = (suggestion: SmartSuggestion) => {
    setCurrentInput(suggestion.text)
    handleSendMessage(suggestion.text)
  }

  // Handle quick actions with enhanced context
  const handleQuickAction = async (action: any) => {
    setActiveMode('analysis')
    
    let prompt = ''
    switch (action.id) {
      case 'tower_optimization':
        prompt = gameState 
          ? `Analyze my current tower setup and suggest optimizations. Current towers: ${JSON.stringify(gameState.towers?.slice(0, 3))}`
          : 'What are the best tower placement strategies?'
        break
      case 'breeding_analysis':
        prompt = playerStats?.nftCollection?.length > 0
          ? `Analyze my NFT collection for breeding opportunities: ${playerStats.nftCollection.length} NFTs owned`
          : 'Explain the breeding mechanics and best practices'
        break
      case 'performance_coaching':
        prompt = playerStats
          ? `Coach me to improve my performance. Current stats: ${playerStats.winRate * 100}% win rate, ${playerStats.gamesPlayed} games played`
          : 'How can I improve my overall gameplay?'
        break
      default:
        prompt = action.description
    }

    await handleSendMessage(prompt)
  }

  // Voice recognition (placeholder for future implementation)
  const toggleVoiceRecognition = () => {
    setIsListening(!isListening)
    // TODO: Implement actual voice recognition
  }

  // Handle recommendation application
  const applyRecommendation = (recommendation: any) => {
    onRecommendationApply?.(recommendation)
    // Show success message
    const message = `Applied recommendation: ${recommendation.title}`
    sendMessage(message, { type: 'system', applied: true })
  }

  if (!isAvailable) {
    return (
      <div className={cn("fixed bottom-4 right-4 z-50", className)}>
        <Button
          variant="outline"
          className="rounded-full p-3 opacity-50 cursor-not-allowed"
          disabled
        >
          <Bot className="h-5 w-5" />
          <RefreshCw className="h-3 w-3 ml-1 animate-spin" />
        </Button>
      </div>
    )
  }

  return (
    <div className={cn("fixed bottom-4 right-4 z-50", className)}>
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              onClick={() => setIsOpen(true)}
              className="rounded-full p-4 btn-game shadow-lg relative"
              size="lg"
            >
              <Bot className="h-6 w-6" />
              
              {/* Enhanced notification indicators */}
              {smartSuggestions.length > 0 && (
                <motion.div
                  className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center text-xs font-bold text-black"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {smartSuggestions.length}
                </motion.div>
              )}
              
              {/* AI status indicator */}
              <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-green-400 rounded-full border-2 border-background" />
            </Button>
          </motion.div>
        )}

        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1,
              width: isMinimized ? 320 : 500,
              height: isMinimized ? 60 : 700
            }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="bg-background border border-border rounded-xl shadow-2xl overflow-hidden"
          >
            {/* Enhanced Header */}
            <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-primary/10 to-secondary/10">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Bot className="h-6 w-6 text-primary" />
                  <motion.div
                    className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full"
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </div>
                <div>
                  <h3 className="font-bold text-base">Gecko AI Assistant 2.0</h3>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    {isTyping ? (
                      <>
                        <Brain className="h-3 w-3 animate-pulse" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Zap className="h-3 w-3" />
                        AI-Powered & Ready
                      </>
                    )}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-1">
                {/* Voice toggle */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleVoiceRecognition}
                  className="h-8 w-8 p-0"
                  disabled // TODO: Enable when voice is implemented
                >
                  {isListening ? (
                    <MicOff className="h-4 w-4 text-red-500" />
                  ) : (
                    <Mic className="h-4 w-4" />
                  )}
                </Button>

                {/* Settings */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                >
                  <Settings className="h-4 w-4" />
                </Button>

                {/* Minimize/Maximize */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="h-8 w-8 p-0"
                >
                  {isMinimized ? (
                    <Maximize2 className="h-4 w-4" />
                  ) : (
                    <Minimize2 className="h-4 w-4" />
                  )}
                </Button>

                {/* Close */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Main Content */}
            {!isMinimized && (
              <div className="flex flex-col h-[600px]">
                {/* AI Mode Tabs */}
                <Tabs value={activeMode} onValueChange={(value) => setActiveMode(value as AIMode['id'])} className="flex-none">
                  <TabsList className="grid w-full grid-cols-4 m-2">
                    {aiModes.map((mode) => (
                      <TabsTrigger key={mode.id} value={mode.id} className="text-xs">
                        <mode.icon className="h-3 w-3 mr-1" />
                        {mode.label}
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  {/* Chat Tab */}
                  <TabsContent value="chat" className="flex-1 flex flex-col m-0 p-0">
                    {/* Smart Suggestions */}
                    {smartSuggestions.length > 0 && chatHistory.length === 0 && (
                      <div className="p-3 border-b bg-muted/20">
                        <p className="text-sm font-medium mb-2 flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-yellow-500" />
                          Smart Suggestions
                        </p>
                        <div className="space-y-2">
                          {smartSuggestions.map((suggestion) => (
                            <motion.button
                              key={suggestion.id}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              onClick={() => handleSuggestionClick(suggestion)}
                              className="w-full p-2 text-left border rounded-lg hover:bg-muted/50 transition-colors text-sm"
                            >
                              <div className="flex items-center justify-between">
                                <span>{suggestion.text}</span>
                                <div className="flex items-center gap-1">
                                  <Badge 
                                    variant={suggestion.priority === 'high' ? 'destructive' : suggestion.priority === 'medium' ? 'default' : 'secondary'}
                                    className="text-xs"
                                  >
                                    {suggestion.priority}
                                  </Badge>
                                  <Progress value={suggestion.confidence * 100} className="w-8 h-2" />
                                </div>
                              </div>
                            </motion.button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Quick Actions */}
                    {chatHistory.length === 0 && (
                      <div className="p-3 border-b">
                        <p className="text-sm font-medium mb-3 flex items-center gap-2">
                          <Target className="h-4 w-4 text-blue-500" />
                          Quick Actions
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                          {quickActions.slice(0, 6).map((action) => (
                            <motion.button
                              key={action.id}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => handleQuickAction(action)}
                              className="p-2 text-left border rounded-lg hover:bg-muted/50 transition-colors"
                            >
                              <div className="flex items-center space-x-2 mb-1">
                                <action.icon className="h-3 w-3 text-primary" />
                                <span className="text-xs font-medium">{action.label}</span>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {action.description}
                              </p>
                            </motion.button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Chat Messages */}
                    <div className="flex-1 overflow-y-auto p-3 space-y-3">
                      <AnimatePresence>
                        {chatHistory.map((message) => (
                          <motion.div
                            key={message.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={cn(
                              "flex space-x-2",
                              message.sender === 'user' ? 'justify-end' : 'justify-start'
                            )}
                          >
                            {message.sender === 'ai' && (
                              <div className="flex-shrink-0">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary/20 to-secondary/20 flex items-center justify-center">
                                  <Bot className="h-4 w-4 text-primary" />
                                </div>
                              </div>
                            )}
                            
                            <div
                              className={cn(
                                "max-w-[80%] p-3 rounded-lg text-sm",
                                message.sender === 'user'
                                  ? "bg-primary text-primary-foreground ml-auto"
                                  : "bg-muted"
                              )}
                            >
                              <p className="whitespace-pre-wrap">{message.message}</p>
                              <p className="text-xs opacity-60 mt-1 flex items-center justify-between">
                                <span>{new Date(message.timestamp).toLocaleTimeString()}</span>
                                {message.sender === 'ai' && (
                                  <Badge variant="outline" className="text-xs">
                                    AI
                                  </Badge>
                                )}
                              </p>
                            </div>

                            {message.sender === 'user' && (
                              <div className="flex-shrink-0">
                                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                                  <User className="h-4 w-4" />
                                </div>
                              </div>
                            )}
                          </motion.div>
                        ))}
                      </AnimatePresence>

                      {/* Enhanced Typing Indicator */}
                      {isTyping && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex items-center space-x-2"
                        >
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary/20 to-secondary/20 flex items-center justify-center">
                            <Brain className="h-4 w-4 text-primary animate-pulse" />
                          </div>
                          <div className="bg-muted p-3 rounded-lg">
                            <div className="flex space-x-1 items-center">
                              <span className="text-sm text-muted-foreground">AI thinking</span>
                              {[0, 1, 2].map((i) => (
                                <motion.div
                                  key={i}
                                  className="w-2 h-2 bg-primary rounded-full"
                                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                                  transition={{
                                    duration: 1.5,
                                    repeat: Infinity,
                                    delay: i * 0.2
                                  }}
                                />
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      )}

                      <div ref={messagesEndRef} />
                    </div>
                  </TabsContent>

                  {/* Analysis Tab */}
                  <TabsContent value="analysis" className="flex-1 p-3">
                    <div className="space-y-4">
                      <h4 className="font-semibold flex items-center gap-2">
                        <Activity className="h-4 w-4" />
                        Performance Analysis
                      </h4>
                      
                      {contextualInsights.length > 0 ? (
                        <div className="space-y-3">
                          {contextualInsights.map((insight, index) => (
                            <Card key={index}>
                              <CardContent className="p-3">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <h5 className="font-medium text-sm">{insight.title}</h5>
                                    <p className="text-xs text-muted-foreground mt-1">{insight.content}</p>
                                  </div>
                                  <Badge variant="secondary" className="ml-2">
                                    {Math.round(insight.confidence * 100)}%
                                  </Badge>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">Play a game to generate analysis</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  {/* Recommendations Tab */}
                  <TabsContent value="recommendations" className="flex-1 p-3">
                    <div className="space-y-4">
                      <h4 className="font-semibold flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        AI Recommendations
                      </h4>
                      
                      {recommendations && Object.values(recommendations).some(arr => arr.length > 0) ? (
                        <div className="space-y-3">
                          {Object.entries(recommendations).map(([category, items]) => 
                            items.length > 0 && (
                              <div key={category}>
                                <h5 className="font-medium text-sm capitalize mb-2">{category}</h5>
                                {items.slice(0, 3).map((item: any, index: number) => (
                                  <Card key={index} className="mb-2">
                                    <CardContent className="p-3">
                                      <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                          <p className="text-sm font-medium">{item.title || item.name || 'Recommendation'}</p>
                                          <p className="text-xs text-muted-foreground">{item.description || item.reason}</p>
                                        </div>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => applyRecommendation(item)}
                                          className="ml-2"
                                        >
                                          Apply
                                        </Button>
                                      </div>
                                    </CardContent>
                                  </Card>
                                ))}
                              </div>
                            )
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">No recommendations available</p>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="mt-2"
                            onClick={() => generateRecommendations({
                              currentActivity: 'general',
                              recentHistory: [],
                              preferences: playerStats?.preferredStrategies || [],
                              performance: playerStats || {}
                            })}
                          >
                            Generate Recommendations
                          </Button>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  {/* Strategy Tab */}
                  <TabsContent value="strategy" className="flex-1 p-3">
                    <div className="space-y-4">
                      <h4 className="font-semibold flex items-center gap-2">
                        <Brain className="h-4 w-4" />
                        Strategy Planning
                      </h4>
                      
                      <div className="text-center py-8 text-muted-foreground">
                        <Brain className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Advanced strategy features</p>
                        <p className="text-xs">Coming soon...</p>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>

                {/* Enhanced Input Area */}
                <div className="flex-none p-3 border-t bg-muted/20">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="flex-1 relative">
                      <Input
                        value={currentInput}
                        onChange={(e) => setCurrentInput(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault()
                            handleSendMessage(currentInput)
                          }
                        }}
                        placeholder="Ask me anything about Omniverse Geckos..."
                        disabled={isTyping}
                        className="pr-12"
                      />
                      <Button
                        size="sm"
                        onClick={() => handleSendMessage(currentInput)}
                        disabled={!currentInput.trim() || isTyping}
                        className="absolute right-1 top-1 h-8 w-8 p-0"
                      >
                        <Send className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  {/* Enhanced Status Bar */}
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-3">
                      <Badge variant="secondary" className="text-xs">
                        <Zap className="h-3 w-3 mr-1" />
                        AI Enhanced
                      </Badge>
                      {personalizedExperience && (
                        <Badge variant="outline" className="text-xs">
                          <Star className="h-3 w-3 mr-1" />
                          Personalized
                        </Badge>
                      )}
                      {contextualInsights.length > 0 && (
                        <Badge variant="outline" className="text-xs">
                          <Brain className="h-3 w-3 mr-1" />
                          {contextualInsights.length} Insights
                        </Badge>
                      )}
                    </div>
                    
                    {chatHistory.length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearChat}
                        className="text-xs h-6 px-2"
                      >
                        <History className="h-3 w-3 mr-1" />
                        Clear
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}