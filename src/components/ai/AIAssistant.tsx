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
  Maximize2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAIChatAssistant, usePersonalizationAI, useSmartRecommendations } from '@/ai/hooks/useAI'
import { cn } from '@/lib/utils'

// =============================================================================
// Types
// =============================================================================

interface AIAssistantProps {
  className?: string
  defaultOpen?: boolean
  context?: any
}

interface QuickAction {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  topic: string
  description: string
}

// =============================================================================
// Quick Actions Data
// =============================================================================

const quickActions: QuickAction[] = [
  {
    id: 'tower_placement',
    label: 'Tower Strategy',
    icon: Shield,
    topic: 'tower_placement',
    description: 'Get help with tower placement and defense strategies'
  },
  {
    id: 'nft_breeding',
    label: 'NFT Breeding',
    icon: Sparkles,
    topic: 'nft_breeding',
    description: 'Learn about breeding mechanics and genetics'
  },
  {
    id: 'market_trading',
    label: 'Market Tips',
    icon: TrendingUp,
    topic: 'market_trading',
    description: 'Get trading advice and market insights'
  },
  {
    id: 'game_strategy',
    label: 'Advanced Strategy',
    icon: Lightbulb,
    topic: 'game_strategy',
    description: 'Master advanced gameplay techniques'
  }
]

// =============================================================================
// Main AI Assistant Component
// =============================================================================

export function AIAssistant({ className, defaultOpen = false, context }: AIAssistantProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  const [isMinimized, setIsMinimized] = useState(false)
  const [currentInput, setCurrentInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  const {
    chatHistory,
    isTyping,
    sendMessage,
    clearChat,
    generateGameHelp,
    isAvailable
  } = useAIChatAssistant()

  const { personalizedExperience } = usePersonalizationAI()
  const { recommendations, generateRecommendations } = useSmartRecommendations()

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatHistory, isTyping])

  // Send welcome message and generate recommendations when first opened
  useEffect(() => {
    if (isOpen && isAvailable) {
      if (chatHistory.length === 0) {
        setTimeout(() => {
          sendMessage("Hello! I'm your AI assistant for Omniverse Geckos. How can I help you today?", {
            type: 'welcome',
            userContext: context
          })
        }, 1000)
      }
      generateRecommendations({
        currentActivity: 'general',
        recentHistory: [],
        preferences: {},
        performance: {}
      });
    }
  }, [isOpen, isAvailable])

  const handleSendMessage = async (message: string) => {
    if (!message.trim() || !isAvailable) return
    
    await sendMessage(message, {
      currentContext: context,
      timestamp: Date.now(),
      personalization: personalizedExperience
    })
    setCurrentInput('')
  }

  const handleQuickAction = async (action: QuickAction) => {
    await generateGameHelp(action.topic)
  }

  const handleRecommendationClick = (recommendation: any) => {
    sendMessage(`Tell me more about "${recommendation.title}"`, {
      recommendationContext: recommendation
    });
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage(currentInput)
    }
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
          <span className="sr-only">AI Assistant (Loading)</span>
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
              className="rounded-full p-4 btn-game shadow-lg"
              size="lg"
            >
              <MessageCircle className="h-6 w-6" />
              <span className="sr-only">Open AI Assistant</span>
              
              {/* Notification dot for suggestions */}
              <motion.div
                className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
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
              width: isMinimized ? 320 : 400,
              height: isMinimized ? 60 : 600
            }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="bg-background border border-border rounded-lg shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b bg-muted/20">
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Bot className="h-5 w-5 text-primary" />
                  <motion.div
                    className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full"
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Gecko AI Assistant</h3>
                  <p className="text-xs text-muted-foreground">
                    {isTyping ? 'Thinking...' : 'Ready to help'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-1">
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

            {/* Content (hidden when minimized) */}
            {!isMinimized && (
              <>
                {/* Quick Actions */}
                {chatHistory.length === 0 && (
                  <div className="p-3 border-b">
                    <p className="text-sm text-muted-foreground mb-3">Quick Help:</p>
                    <div className="grid grid-cols-2 gap-2">
                      {quickActions.map((action) => (
                        <motion.button
                          key={action.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleQuickAction(action)}
                          className="p-2 text-left border rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center space-x-2">
                            <action.icon className="h-4 w-4 text-primary" />
                            <span className="text-sm font-medium">{action.label}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {action.description}
                          </p>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommendations Panel */}
                <AIRecommendationsPanel
                  recommendations={recommendations.gameplay}
                  onRecommendationClick={handleRecommendationClick}
                  className="p-3 border-b"
                />

                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto p-3 space-y-3 h-80">
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
                            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
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
                          <p className="text-xs opacity-60 mt-1">
                            {new Date(message.timestamp).toLocaleTimeString()}
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

                  {/* Typing Indicator */}
                  {isTyping && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center space-x-2"
                    >
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                        <Bot className="h-4 w-4 text-primary" />
                      </div>
                      <div className="bg-muted p-3 rounded-lg">
                        <div className="flex space-x-1">
                          {[0, 1, 2].map((i) => (
                            <motion.div
                              key={i}
                              className="w-2 h-2 bg-muted-foreground/50 rounded-full"
                              animate={{ scale: [1, 1.2, 1] }}
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

                {/* Input Area */}
                <div className="p-3 border-t">
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 relative">
                      <Input
                        value={currentInput}
                        onChange={(e) => setCurrentInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Ask me anything about Omniverse Geckos..."
                        disabled={isTyping}
                        className="pr-12"
                      />
                      <motion.div
                        className="absolute right-2 top-1/2 transform -translate-y-1/2"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Button
                          size="sm"
                          onClick={() => handleSendMessage(currentInput)}
                          disabled={!currentInput.trim() || isTyping}
                          className="h-8 w-8 p-0"
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </motion.div>
                    </div>
                  </div>

                  {/* Additional Actions */}
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary" className="text-xs">
                        <Zap className="h-3 w-3 mr-1" />
                        AI Powered
                      </Badge>
                      {personalizedExperience && (
                        <Badge variant="outline" className="text-xs">
                          <Sparkles className="h-3 w-3 mr-1" />
                          Personalized
                        </Badge>
                      )}
                    </div>
                    
                    {chatHistory.length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearChat}
                        className="text-xs"
                      >
                        Clear Chat
                      </Button>
                    )}
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// =============================================================================
// AI Insights Widget
// =============================================================================

export function AIInsightsWidget({ 
  insights, 
  className 
}: { 
  insights?: any
  className?: string 
}) {
  if (!insights || insights.length === 0) return null

  return (
    <Card className={cn("", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Lightbulb className="h-4 w-4 text-yellow-500" />
          AI Insights
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {insights.slice(0, 3).map((insight: any, index: number) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-3 bg-muted/50 rounded-lg"
            >
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Bot className="h-3 w-3 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">{insight.title}</p>
                  <p className="text-xs text-muted-foreground">{insight.description}</p>
                  {insight.confidence && (
                    <div className="mt-2">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1 bg-muted rounded-full">
                          <div 
                            className="h-1 bg-primary rounded-full transition-all duration-300"
                            style={{ width: `${insight.confidence * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {Math.round(insight.confidence * 100)}%
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// =============================================================================
// AI Recommendations Panel
// =============================================================================

export function AIRecommendationsPanel({ 
  recommendations, 
  onRecommendationClick,
  className 
}: { 
  recommendations?: any[]
  onRecommendationClick?: (recommendation: any) => void
  className?: string 
}) {
  if (!recommendations || recommendations.length === 0) return null

  return (
    <Card className={cn("", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="h-4 w-4 text-purple-500" />
          AI Recommendations
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {recommendations.slice(0, 5).map((rec: any, index: number) => (
            <motion.button
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => onRecommendationClick?.(rec)}
              className="w-full p-3 text-left border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{rec.title}</p>
                  <p className="text-xs text-muted-foreground">{rec.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  {rec.priority && (
                    <Badge variant="secondary" className="text-xs">
                      {rec.priority}
                    </Badge>
                  )}
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}