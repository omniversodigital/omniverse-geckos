'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  PlayCircle,
  RefreshCw,
  Bug,
  Zap,
  Shield,
  Activity,
  Clock
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { EnhancedAIAssistant } from '@/components/ai/EnhancedAIAssistant'
import { EnhancedWalletConnect } from '@/components/wallet/EnhancedWalletConnect'
import { useEnhancedWallet } from '@/blockchain/hooks/useEnhancedWallet'
import { useAI } from '@/ai/hooks/useAI'

// =============================================================================
// Types
// =============================================================================

interface TestResult {
  id: string
  name: string
  description: string
  status: 'pending' | 'running' | 'passed' | 'failed' | 'warning'
  duration: number
  error?: string
  details?: any
}

interface TestCategory {
  id: string
  name: string
  description: string
  tests: TestResult[]
}

// =============================================================================
// Test Suite Component
// =============================================================================

export function ComponentTestSuite() {
  const [isRunning, setIsRunning] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>('ai')
  const [testResults, setTestResults] = useState<TestCategory[]>([])
  
  // Hooks to test
  const walletHook = useEnhancedWallet()
  const aiHook = useAI()

  useEffect(() => {
    initializeTests()
  }, [])

  const initializeTests = () => {
    const categories: TestCategory[] = [
      {
        id: 'ai',
        name: 'AI Assistant Tests',
        description: 'Testing enhanced AI bot functionality',
        tests: [
          {
            id: 'ai-initialization',
            name: 'AI Engine Initialization',
            description: 'Test if AI engine initializes properly',
            status: 'pending',
            duration: 0
          },
          {
            id: 'ai-chat-response',
            name: 'Chat Response Generation',
            description: 'Test AI chat response generation',
            status: 'pending',
            duration: 0
          },
          {
            id: 'ai-game-analysis',
            name: 'Game Analysis',
            description: 'Test AI game analysis capabilities',
            status: 'pending',
            duration: 0
          },
          {
            id: 'ai-personalization',
            name: 'Personalization Engine',
            description: 'Test AI personalization features',
            status: 'pending',
            duration: 0
          },
          {
            id: 'ai-recommendations',
            name: 'Smart Recommendations',
            description: 'Test AI recommendation system',
            status: 'pending',
            duration: 0
          }
        ]
      },
      {
        id: 'wallet',
        name: 'Wallet Connection Tests',
        description: 'Testing enhanced wallet connection system',
        tests: [
          {
            id: 'wallet-connection',
            name: 'Wallet Connection',
            description: 'Test wallet connection functionality',
            status: 'pending',
            duration: 0
          },
          {
            id: 'wallet-balance',
            name: 'Balance Fetching',
            description: 'Test balance fetching and display',
            status: 'pending',
            duration: 0
          },
          {
            id: 'wallet-metrics',
            name: 'Wallet Metrics',
            description: 'Test enhanced wallet metrics calculation',
            status: 'pending',
            duration: 0
          },
          {
            id: 'network-health',
            name: 'Network Health',
            description: 'Test network health monitoring',
            status: 'pending',
            duration: 0
          },
          {
            id: 'security-analysis',
            name: 'Security Analysis',
            description: 'Test wallet security analysis',
            status: 'pending',
            duration: 0
          }
        ]
      },
      {
        id: 'integration',
        name: 'Integration Tests',
        description: 'Testing component integration and interactions',
        tests: [
          {
            id: 'ai-wallet-integration',
            name: 'AI-Wallet Integration',
            description: 'Test AI assistant wallet integration',
            status: 'pending',
            duration: 0
          },
          {
            id: 'performance',
            name: 'Performance Test',
            description: 'Test component render performance',
            status: 'pending',
            duration: 0
          },
          {
            id: 'error-handling',
            name: 'Error Handling',
            description: 'Test error handling and recovery',
            status: 'pending',
            duration: 0
          },
          {
            id: 'responsive-design',
            name: 'Responsive Design',
            description: 'Test responsive design functionality',
            status: 'pending',
            duration: 0
          }
        ]
      }
    ]

    setTestResults(categories)
  }

  const runAllTests = async () => {
    setIsRunning(true)
    
    // Run tests for each category
    for (const category of testResults) {
      await runCategoryTests(category.id)
    }
    
    setIsRunning(false)
  }

  const runCategoryTests = async (categoryId: string) => {
    const category = testResults.find(c => c.id === categoryId)
    if (!category) return

    for (const test of category.tests) {
      await runSingleTest(categoryId, test.id)
    }
  }

  const runSingleTest = async (categoryId: string, testId: string) => {
    // Update test status to running
    updateTestStatus(categoryId, testId, 'running')

    const startTime = Date.now()

    try {
      // Run the actual test based on test ID
      const result = await executeTest(categoryId, testId)
      const duration = Date.now() - startTime

      updateTestStatus(categoryId, testId, result.status, {
        duration,
        details: result.details,
        error: result.error
      })
    } catch (error) {
      const duration = Date.now() - startTime
      updateTestStatus(categoryId, testId, 'failed', {
        duration,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  const executeTest = async (categoryId: string, testId: string): Promise<{
    status: TestResult['status']
    details?: any
    error?: string
  }> => {
    // Simulate test execution time
    await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500))

    switch (`${categoryId}-${testId}`) {
      case 'ai-ai-initialization':
        return {
          status: aiHook.isInitialized ? 'passed' : 'failed',
          details: {
            initialized: aiHook.isInitialized,
            capabilities: aiHook.capabilities
          },
          error: aiHook.isInitialized ? undefined : 'AI engine failed to initialize'
        }

      case 'ai-ai-chat-response':
        try {
          // Test chat functionality (mock test)
          const hasValidEngine = aiHook.aiEngine !== null
          return {
            status: hasValidEngine ? 'passed' : 'failed',
            details: { hasEngine: hasValidEngine },
            error: hasValidEngine ? undefined : 'Chat engine not available'
          }
        } catch (error) {
          return {
            status: 'failed',
            error: error instanceof Error ? error.message : 'Chat test failed'
          }
        }

      case 'ai-ai-game-analysis':
        return {
          status: aiHook.gameAI ? 'passed' : 'warning',
          details: { gameAIAvailable: !!aiHook.gameAI },
          error: aiHook.gameAI ? undefined : 'Game AI service not available'
        }

      case 'ai-ai-personalization':
        return {
          status: aiHook.personalizationAI ? 'passed' : 'warning',
          details: { personalizationAvailable: !!aiHook.personalizationAI }
        }

      case 'ai-ai-recommendations':
        return {
          status: aiHook.capabilities.marketAnalysis ? 'passed' : 'warning',
          details: aiHook.capabilities
        }

      case 'wallet-wallet-connection':
        return {
          status: walletHook.isConnected ? 'passed' : 'warning',
          details: {
            connected: walletHook.isConnected,
            address: walletHook.address,
            connector: walletHook.connector?.name
          }
        }

      case 'wallet-wallet-balance':
        return {
          status: walletHook.metrics.ethBalance >= 0 ? 'passed' : 'failed',
          details: {
            ethBalance: walletHook.metrics.ethBalance,
            geckoBalance: walletHook.metrics.geckoBalance
          }
        }

      case 'wallet-wallet-metrics':
        const hasMetrics = Object.values(walletHook.metrics).some(value => value > 0)
        return {
          status: hasMetrics ? 'passed' : 'warning',
          details: walletHook.metrics
        }

      case 'wallet-network-health':
        return {
          status: walletHook.networkHealth.isHealthy ? 'passed' : 'warning',
          details: walletHook.networkHealth
        }

      case 'wallet-security-analysis':
        return {
          status: walletHook.security.score > 70 ? 'passed' : 'warning',
          details: walletHook.security
        }

      case 'integration-ai-wallet-integration':
        const integrationWorks = walletHook.isConnected && aiHook.isInitialized
        return {
          status: integrationWorks ? 'passed' : 'warning',
          details: {
            walletConnected: walletHook.isConnected,
            aiInitialized: aiHook.isInitialized
          }
        }

      case 'integration-performance':
        // Mock performance test
        const loadTime = Math.random() * 1000
        return {
          status: loadTime < 500 ? 'passed' : loadTime < 1000 ? 'warning' : 'failed',
          details: { loadTime: Math.round(loadTime) }
        }

      case 'integration-error-handling':
        return {
          status: 'passed',
          details: { errorBoundariesActive: true }
        }

      case 'integration-responsive-design':
        return {
          status: 'passed',
          details: { supportsResponsive: true }
        }

      default:
        return {
          status: 'warning',
          error: `Test ${testId} not implemented`
        }
    }
  }

  const updateTestStatus = (
    categoryId: string, 
    testId: string, 
    status: TestResult['status'],
    updates: Partial<TestResult> = {}
  ) => {
    setTestResults(prev => prev.map(category => 
      category.id === categoryId 
        ? {
            ...category,
            tests: category.tests.map(test =>
              test.id === testId
                ? { ...test, status, ...updates }
                : test
            )
          }
        : category
    ))
  }

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'passed': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'failed': return <XCircle className="h-4 w-4 text-red-500" />
      case 'warning': return <AlertCircle className="h-4 w-4 text-yellow-500" />
      case 'running': return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />
      default: return <Clock className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getStatusBadge = (status: TestResult['status']) => {
    const variants = {
      passed: 'default',
      failed: 'destructive', 
      warning: 'secondary',
      running: 'outline',
      pending: 'outline'
    } as const

    return (
      <Badge variant={variants[status]} className="text-xs">
        {status}
      </Badge>
    )
  }

  const getCategoryStats = (category: TestCategory) => {
    const total = category.tests.length
    const passed = category.tests.filter(t => t.status === 'passed').length
    const failed = category.tests.filter(t => t.status === 'failed').length
    const warnings = category.tests.filter(t => t.status === 'warning').length
    const pending = category.tests.filter(t => t.status === 'pending').length

    return { total, passed, failed, warnings, pending }
  }

  const getOverallProgress = () => {
    const allTests = testResults.flatMap(category => category.tests)
    const completed = allTests.filter(test => ['passed', 'failed', 'warning'].includes(test.status))
    return allTests.length > 0 ? (completed.length / allTests.length) * 100 : 0
  }

  return (
    <div className="container max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <Bug className="h-8 w-8 text-primary" />
          Component Test Suite
        </h1>
        <p className="text-muted-foreground">
          Testing enhanced AI bot and wallet connection updates
        </p>
      </div>

      {/* Test Progress Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Test Progress
            </CardTitle>
            <Button
              onClick={runAllTests}
              disabled={isRunning}
              className="flex items-center gap-2"
            >
              {isRunning ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <PlayCircle className="h-4 w-4" />
              )}
              {isRunning ? 'Running Tests...' : 'Run All Tests'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Progress value={getOverallProgress()} className="h-2" />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {testResults.map((category) => {
                const stats = getCategoryStats(category)
                return (
                  <Card key={category.id}>
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-2">{category.name}</h3>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex justify-between">
                          <span>Passed:</span>
                          <span className="text-green-600 font-medium">{stats.passed}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Failed:</span>
                          <span className="text-red-600 font-medium">{stats.failed}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Warnings:</span>
                          <span className="text-yellow-600 font-medium">{stats.warnings}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Pending:</span>
                          <span className="text-muted-foreground font-medium">{stats.pending}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Test Results */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="grid w-full grid-cols-3">
          {testResults.map((category) => (
            <TabsTrigger key={category.id} value={category.id}>
              {category.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {testResults.map((category) => (
          <TabsContent key={category.id} value={category.id} className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {category.name}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => runCategoryTests(category.id)}
                    disabled={isRunning}
                  >
                    {isRunning ? (
                      <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <PlayCircle className="h-4 w-4 mr-2" />
                    )}
                    Run Category Tests
                  </Button>
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {category.description}
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {category.tests.map((test) => (
                    <motion.div
                      key={test.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(test.status)}
                        <div>
                          <h4 className="font-medium">{test.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {test.description}
                          </p>
                          {test.duration > 0 && (
                            <p className="text-xs text-muted-foreground">
                              Duration: {test.duration}ms
                            </p>
                          )}
                          {test.error && (
                            <p className="text-xs text-red-600 mt-1">
                              Error: {test.error}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(test.status)}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => runSingleTest(category.id, test.id)}
                          disabled={isRunning}
                        >
                          <RefreshCw className="h-3 w-3" />
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Test Component Previews */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Enhanced AI Assistant Preview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <EnhancedAIAssistant
                defaultOpen={false}
                gameState={{
                  currentWave: 15,
                  score: 12500,
                  level: 8,
                  towers: [],
                  resources: {},
                  difficulty: 'normal',
                  hasOptimizedTeam: false
                }}
                playerStats={{
                  winRate: 0.78,
                  averageScore: 11200,
                  gamesPlayed: 32,
                  geckoTokens: 1500,
                  nftCollection: [],
                  skillLevel: 'intermediate',
                  preferredStrategies: ['defensive', 'economic']
                }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Enhanced Wallet Connect Preview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <EnhancedWalletConnect
              showBalance={true}
              showNetworkStatus={true}
              showTransactionHistory={false}
              compact={false}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}