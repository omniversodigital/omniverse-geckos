'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  DollarSign, 
  Activity,
  Zap,
  BarChart3,
  PieChart,
  LineChart,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'

interface MetricData {
  label: string
  value: string | number
  change?: number
  trend?: 'up' | 'down' | 'neutral'
  icon?: React.ReactNode
  description?: string
}

interface PerformanceMetric {
  name: string
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
  threshold: { good: number; poor: number }
}

export function MetricsDashboard() {
  const [metrics, setMetrics] = useState<{
    investment: MetricData[]
    performance: PerformanceMetric[]
    engagement: MetricData[]
    realtime: MetricData[]
  }>({
    investment: [],
    performance: [],
    engagement: [],
    realtime: []
  })

  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate fetching metrics data
    const fetchMetrics = async () => {
      // In production, this would fetch from your analytics API
      const investmentMetrics: MetricData[] = [
        {
          label: 'Total Investment',
          value: '$1.25M',
          change: 15.5,
          trend: 'up',
          icon: <DollarSign className="h-4 w-4" />,
          description: 'Total funds raised in pre-sale'
        },
        {
          label: 'Active Investors',
          value: '3,482',
          change: 8.2,
          trend: 'up',
          icon: <Users className="h-4 w-4" />,
          description: 'Unique wallet addresses'
        },
        {
          label: 'NFTs Minted',
          value: '7,235',
          change: -2.1,
          trend: 'down',
          icon: <Zap className="h-4 w-4" />,
          description: 'Genesis collection progress'
        },
        {
          label: 'Token Price',
          value: '$0.0012',
          change: 20,
          trend: 'up',
          icon: <TrendingUp className="h-4 w-4" />,
          description: 'Current $GECKO price'
        }
      ]

      const performanceMetrics: PerformanceMetric[] = [
        {
          name: 'Page Load Time',
          value: 1.2,
          rating: 'good',
          threshold: { good: 2, poor: 4 }
        },
        {
          name: 'First Contentful Paint',
          value: 0.8,
          rating: 'good',
          threshold: { good: 1, poor: 2.5 }
        },
        {
          name: 'Time to Interactive',
          value: 2.5,
          rating: 'needs-improvement',
          threshold: { good: 2, poor: 5 }
        },
        {
          name: 'Cumulative Layout Shift',
          value: 0.05,
          rating: 'good',
          threshold: { good: 0.1, poor: 0.25 }
        }
      ]

      const engagementMetrics: MetricData[] = [
        {
          label: 'Daily Active Users',
          value: '12.5K',
          change: 5.3,
          trend: 'up',
          icon: <Activity className="h-4 w-4" />
        },
        {
          label: 'Avg. Session Duration',
          value: '8m 34s',
          change: -10.2,
          trend: 'down',
          icon: <BarChart3 className="h-4 w-4" />
        },
        {
          label: 'Conversion Rate',
          value: '3.8%',
          change: 0.5,
          trend: 'up',
          icon: <PieChart className="h-4 w-4" />
        },
        {
          label: 'Bounce Rate',
          value: '42%',
          change: -3.1,
          trend: 'up',
          icon: <LineChart className="h-4 w-4" />
        }
      ]

      const realtimeMetrics: MetricData[] = [
        {
          label: 'Active Now',
          value: 234,
          icon: <Users className="h-4 w-4 text-green-500" />
        },
        {
          label: 'Transactions/min',
          value: 18,
          icon: <Activity className="h-4 w-4 text-blue-500" />
        },
        {
          label: 'Gas Price (Gwei)',
          value: 25,
          icon: <Zap className="h-4 w-4 text-yellow-500" />
        },
        {
          label: 'API Response',
          value: '98ms',
          icon: <Activity className="h-4 w-4 text-purple-500" />
        }
      ]

      setMetrics({
        investment: investmentMetrics,
        performance: performanceMetrics,
        engagement: engagementMetrics,
        realtime: realtimeMetrics
      })
      setIsLoading(false)
    }

    fetchMetrics()
    
    // Refresh metrics every 30 seconds
    const interval = setInterval(fetchMetrics, 30000)
    return () => clearInterval(interval)
  }, [])

  const getPerformanceColor = (rating: string) => {
    switch (rating) {
      case 'good': return 'text-green-500'
      case 'needs-improvement': return 'text-yellow-500'
      case 'poor': return 'text-red-500'
      default: return 'text-gray-500'
    }
  }

  const getPerformanceProgress = (metric: PerformanceMetric) => {
    const { value, threshold } = metric
    const range = threshold.poor - threshold.good
    const progress = Math.max(0, Math.min(100, ((threshold.poor - value) / range) * 100))
    return progress
  }

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(8)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted animate-pulse rounded w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Investment Metrics */}
      <div>
        <h3 className="text-lg font-semibold mb-4">💰 Investment Metrics</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {metrics.investment.map((metric, index) => (
            <Card key={index}>
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    {metric.icon}
                    {metric.label}
                  </span>
                  {metric.change && (
                    <Badge variant={metric.trend === 'up' ? 'default' : 'destructive'} className="text-xs">
                      {metric.trend === 'up' ? (
                        <ArrowUpRight className="h-3 w-3 mr-1" />
                      ) : (
                        <ArrowDownRight className="h-3 w-3 mr-1" />
                      )}
                      {Math.abs(metric.change)}%
                    </Badge>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metric.value}</div>
                {metric.description && (
                  <p className="text-xs text-muted-foreground mt-1">{metric.description}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Performance Metrics */}
      <div>
        <h3 className="text-lg font-semibold mb-4">⚡ Performance Metrics</h3>
        <div className="grid gap-4 md:grid-cols-2">
          {metrics.performance.map((metric, index) => (
            <Card key={index}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center justify-between">
                  <span>{metric.name}</span>
                  <span className={`text-lg font-bold ${getPerformanceColor(metric.rating)}`}>
                    {metric.value}s
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Progress value={getPerformanceProgress(metric)} className="h-2" />
                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                  <span>Good: &lt;{metric.threshold.good}s</span>
                  <span>Poor: &gt;{metric.threshold.poor}s</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Engagement Metrics */}
      <div>
        <h3 className="text-lg font-semibold mb-4">📊 Engagement Metrics</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {metrics.engagement.map((metric, index) => (
            <Card key={index}>
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-2">
                  {metric.icon}
                  {metric.label}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold">{metric.value}</span>
                  {metric.change && (
                    <span className={`text-sm ${metric.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                      {metric.trend === 'up' ? '+' : ''}{metric.change}%
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Real-time Metrics */}
      <div>
        <h3 className="text-lg font-semibold mb-4">🔴 Real-time Metrics</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {metrics.realtime.map((metric, index) => (
            <Card key={index} className="relative overflow-hidden">
              <div className="absolute top-2 right-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
              </div>
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-2">
                  {metric.icon}
                  {metric.label}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metric.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}