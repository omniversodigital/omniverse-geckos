'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Heart, 
  MessageCircle, 
  Repeat2,
  ExternalLink,
  Calendar,
  Hash,
  Zap,
  Eye,
  Share2,
  Award,
  Clock,
  Target,
  Activity,
  Globe,
  Bookmark
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useTwitterAPI, type TwitterAnalytics, type TwitterTweet } from '@/lib/twitter/TwitterAPI'
import { cn } from '@/lib/utils'

// =============================================================================
// Types
// =============================================================================

interface AnalyticsMetric {
  label: string
  value: number
  change: number
  icon: React.ComponentType<{ className?: string }>
  format: 'number' | 'percentage' | 'currency'
  color: string
}

interface TopTweet {
  tweet: TwitterTweet
  metrics: {
    impressions: number
    engagements: number
    engagement_rate: number
  }
}

interface HashtagPerformance {
  hashtag: string
  usage_count: number
  reach: number
  engagement: number
  trending_rank?: number
}

interface AudienceInsight {
  demographic: string
  percentage: number
  growth: number
  engagement_rate: number
}

// =============================================================================
// Twitter Analytics Dashboard
// =============================================================================

export function TwitterAnalyticsDashboard({
  className,
  timeframe = 'week'
}: {
  className?: string
  timeframe?: 'day' | 'week' | 'month'
}) {
  const [selectedTimeframe, setSelectedTimeframe] = useState<'day' | 'week' | 'month'>(timeframe)
  const [analytics, setAnalytics] = useState<TwitterAnalytics | null>(null)
  const [topTweets, setTopTweets] = useState<TopTweet[]>([])
  const [hashtagPerformance, setHashtagPerformance] = useState<HashtagPerformance[]>([])
  const [audienceInsights, setAudienceInsights] = useState<AudienceInsight[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const { api: twitterAPI, isAvailable } = useTwitterAPI()

  useEffect(() => {
    if (isAvailable && twitterAPI) {
      loadAnalytics()
    } else {
      // Load mock data for demonstration
      loadMockData()
    }
  }, [selectedTimeframe, isAvailable])

  const loadAnalytics = async () => {
    if (!twitterAPI) return

    setIsLoading(true)
    try {
      const data = await twitterAPI.getAnalytics(selectedTimeframe)
      setAnalytics(data)
      
      // Load additional data
      await Promise.all([
        loadTopTweets(),
        loadHashtagPerformance(),
        loadAudienceInsights()
      ])
    } catch (error) {
      console.error('Failed to load analytics:', error)
      loadMockData()
    } finally {
      setIsLoading(false)
    }
  }

  const loadTopTweets = async () => {
    if (!twitterAPI) return

    try {
      // This would fetch actual top performing tweets
      const mockTopTweets: TopTweet[] = [
        {
          tweet: {
            id: '1',
            text: '🦎 Just unlocked the legendary "Dragon Slayer" achievement! Epic battle with 156,400 points! #OmniverseGeckos #Achievement #Web3Gaming #PlayToEarn',
            author_id: 'user1',
            created_at: '2024-01-15T10:30:00Z',
            public_metrics: {
              retweet_count: 45,
              like_count: 128,
              reply_count: 23,
              quote_count: 8
            }
          },
          metrics: {
            impressions: 15600,
            engagements: 204,
            engagement_rate: 1.31
          }
        },
        {
          tweet: {
            id: '2',
            text: '🔥 NEW GECKO MINT! Just got "Mystic Fire Gecko" - Legendary rarity! Token #4567 with incredible traits! #GeckoNFT #NFT #Web3Art',
            author_id: 'user1',
            created_at: '2024-01-14T15:45:00Z',
            public_metrics: {
              retweet_count: 67,
              like_count: 189,
              reply_count: 34,
              quote_count: 12
            }
          },
          metrics: {
            impressions: 22400,
            engagements: 302,
            engagement_rate: 1.35
          }
        }
      ]
      
      setTopTweets(mockTopTweets)
    } catch (error) {
      console.error('Failed to load top tweets:', error)
    }
  }

  const loadHashtagPerformance = async () => {
    const mockHashtagData: HashtagPerformance[] = [
      { hashtag: '#OmniverseGeckos', usage_count: 145, reach: 45600, engagement: 2.8, trending_rank: 1 },
      { hashtag: '#Web3Gaming', usage_count: 89, reach: 28900, engagement: 3.2 },
      { hashtag: '#GeckoNFT', usage_count: 67, reach: 19800, engagement: 2.5 },
      { hashtag: '#PlayToEarn', usage_count: 123, reach: 38700, engagement: 2.1 },
      { hashtag: '#Achievement', usage_count: 78, reach: 22100, engagement: 2.9 },
      { hashtag: '#Tournament', usage_count: 34, reach: 12400, engagement: 4.1 }
    ]

    setHashtagPerformance(mockHashtagData)
  }

  const loadAudienceInsights = async () => {
    const mockAudienceData: AudienceInsight[] = [
      { demographic: 'Web3 Gaming', percentage: 45, growth: 12, engagement_rate: 3.8 },
      { demographic: 'NFT Collectors', percentage: 28, growth: 8, engagement_rate: 4.2 },
      { demographic: 'Crypto Investors', percentage: 18, growth: -3, engagement_rate: 2.9 },
      { demographic: 'Traditional Gamers', percentage: 9, growth: 23, engagement_rate: 3.1 }
    ]

    setAudienceInsights(mockAudienceData)
  }

  const loadMockData = () => {
    const mockAnalytics: TwitterAnalytics = {
      period: selectedTimeframe,
      metrics: {
        impressions: 125600,
        engagements: 4230,
        engagement_rate: 3.37,
        retweets: 234,
        likes: 1890,
        replies: 456,
        clicks: 1650,
        profile_clicks: 189,
        followers_gained: 147
      },
      top_tweets: [],
      hashtag_performance: []
    }

    setAnalytics(mockAnalytics)
    setIsLoading(false)
  }

  const getMetrics = (): AnalyticsMetric[] => {
    if (!analytics) return []

    return [
      {
        label: 'Total Impressions',
        value: analytics.metrics.impressions,
        change: 15.3,
        icon: Eye,
        format: 'number',
        color: 'text-blue-500'
      },
      {
        label: 'Engagements',
        value: analytics.metrics.engagements,
        change: 8.7,
        icon: Activity,
        format: 'number',
        color: 'text-green-500'
      },
      {
        label: 'Engagement Rate',
        value: analytics.metrics.engagement_rate,
        change: -2.1,
        icon: TrendingUp,
        format: 'percentage',
        color: 'text-purple-500'
      },
      {
        label: 'New Followers',
        value: analytics.metrics.followers_gained,
        change: 23.4,
        icon: Users,
        format: 'number',
        color: 'text-pink-500'
      },
      {
        label: 'Profile Clicks',
        value: analytics.metrics.profile_clicks,
        change: 12.8,
        icon: ExternalLink,
        format: 'number',
        color: 'text-yellow-500'
      },
      {
        label: 'Link Clicks',
        value: analytics.metrics.clicks,
        change: 5.9,
        icon: Globe,
        format: 'number',
        color: 'text-indigo-500'
      }
    ]
  }

  const formatValue = (value: number, format: AnalyticsMetric['format']): string => {
    switch (format) {
      case 'number':
        return value.toLocaleString()
      case 'percentage':
        return `${value.toFixed(1)}%`
      case 'currency':
        return `$${value.toLocaleString()}`
      default:
        return value.toString()
    }
  }

  const getEngagementBreakdown = () => {
    if (!analytics) return []

    const total = analytics.metrics.engagements
    return [
      { label: 'Likes', value: analytics.metrics.likes, percentage: (analytics.metrics.likes / total) * 100, color: 'bg-red-500' },
      { label: 'Retweets', value: analytics.metrics.retweets, percentage: (analytics.metrics.retweets / total) * 100, color: 'bg-green-500' },
      { label: 'Replies', value: analytics.metrics.replies, percentage: (analytics.metrics.replies / total) * 100, color: 'bg-blue-500' },
      { label: 'Clicks', value: analytics.metrics.clicks, percentage: (analytics.metrics.clicks / total) * 100, color: 'bg-purple-500' }
    ]
  }

  const getTimeframePeriods = () => {
    const periods = {
      day: '24 Hours',
      week: '7 Days',
      month: '30 Days'
    }
    return periods[selectedTimeframe]
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-blue-500" />
            Twitter/X Analytics
          </h2>
          <p className="text-muted-foreground">
            Track your social media performance and engagement
          </p>
        </div>
        
        <Select value={selectedTimeframe} onValueChange={(value: any) => setSelectedTimeframe(value)}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="day">Last 24h</SelectItem>
            <SelectItem value="week">Last 7 days</SelectItem>
            <SelectItem value="month">Last 30 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {getMetrics().map((metric, index) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">{metric.label}</p>
                    <p className="text-2xl font-bold">{formatValue(metric.value, metric.format)}</p>
                    <div className="flex items-center space-x-1">
                      <TrendingUp className={cn("h-3 w-3", 
                        metric.change > 0 ? "text-green-500" : "text-red-500"
                      )} />
                      <span className={cn("text-xs font-medium",
                        metric.change > 0 ? "text-green-500" : "text-red-500"
                      )}>
                        {metric.change > 0 ? '+' : ''}{metric.change}%
                      </span>
                      <span className="text-xs text-muted-foreground">vs last {getTimeframePeriods()}</span>
                    </div>
                  </div>
                  <div className={cn("w-12 h-12 rounded-full flex items-center justify-center bg-muted", metric.color)}>
                    <metric.icon className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="engagement" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="content">Top Content</TabsTrigger>
          <TabsTrigger value="hashtags">Hashtags</TabsTrigger>
          <TabsTrigger value="audience">Audience</TabsTrigger>
        </TabsList>

        <TabsContent value="engagement" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Engagement Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Engagement Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {getEngagementBreakdown().map((item, index) => (
                    <div key={item.label} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={cn("w-3 h-3 rounded-full", item.color)} />
                          <span className="text-sm font-medium">{item.label}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-bold">{item.value.toLocaleString()}</span>
                          <span className="text-xs text-muted-foreground ml-2">
                            {item.percentage.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                      <Progress value={item.percentage} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Engagement Rate Trends */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Performance Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium">Best Performing Day</span>
                    </div>
                    <Badge variant="secondary">Tuesday</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-blue-500" />
                      <span className="text-sm font-medium">Optimal Post Time</span>
                    </div>
                    <Badge variant="secondary">2:00 PM UTC</Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Award className="h-4 w-4 text-purple-500" />
                      <span className="text-sm font-medium">Top Content Type</span>
                    </div>
                    <Badge variant="secondary">Achievement Posts</Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm font-medium">Avg. Engagement Rate</span>
                    </div>
                    <Badge variant="secondary">{analytics?.metrics.engagement_rate.toFixed(1)}%</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="content" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Top Performing Tweets
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topTweets.map((item, index) => (
                  <div key={item.tweet.id} className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <Badge variant="secondary">#{index + 1}</Badge>
                        <div className="flex-1">
                          <p className="text-sm line-clamp-3">{item.tweet.text}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(item.tweet.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Eye className="h-4 w-4 text-blue-500" />
                        <span>{item.metrics.impressions.toLocaleString()} views</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Heart className="h-4 w-4 text-red-500" />
                        <span>{item.tweet.public_metrics.like_count} likes</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Repeat2 className="h-4 w-4 text-green-500" />
                        <span>{item.tweet.public_metrics.retweet_count} retweets</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MessageCircle className="h-4 w-4 text-blue-500" />
                        <span>{item.tweet.public_metrics.reply_count} replies</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-xs">
                        {item.metrics.engagement_rate.toFixed(1)}% engagement
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {item.metrics.engagements} total engagements
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hashtags" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Hash className="h-5 w-5" />
                Hashtag Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {hashtagPerformance.map((hashtag, index) => (
                  <div key={hashtag.hashtag} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary">#{index + 1}</Badge>
                      <div>
                        <p className="font-medium text-blue-500">{hashtag.hashtag}</p>
                        <p className="text-xs text-muted-foreground">
                          {hashtag.usage_count} uses • {hashtag.reach.toLocaleString()} reach
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      {hashtag.trending_rank && (
                        <Badge variant="default" className="text-xs">
                          Trending #{hashtag.trending_rank}
                        </Badge>
                      )}
                      <div className="text-right">
                        <p className="text-sm font-medium">{hashtag.engagement.toFixed(1)}%</p>
                        <p className="text-xs text-muted-foreground">engagement</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audience" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Audience Composition
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {audienceInsights.map((insight, index) => (
                    <div key={insight.demographic} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{insight.demographic}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold">{insight.percentage}%</span>
                          <span className={cn("text-xs flex items-center gap-1",
                            insight.growth > 0 ? "text-green-500" : "text-red-500"
                          )}>
                            <TrendingUp className="h-3 w-3" />
                            {insight.growth > 0 ? '+' : ''}{insight.growth}%
                          </span>
                        </div>
                      </div>
                      <Progress value={insight.percentage} className="h-2" />
                      <p className="text-xs text-muted-foreground">
                        {insight.engagement_rate.toFixed(1)}% engagement rate
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Growth Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center p-4 bg-primary/10 rounded-lg">
                    <div className="text-2xl font-bold text-primary">
                      +{analytics?.metrics.followers_gained || 147}
                    </div>
                    <p className="text-sm text-muted-foreground">New followers this {selectedTimeframe}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <div className="text-lg font-bold">87%</div>
                      <p className="text-xs text-muted-foreground">Retention Rate</p>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <div className="text-lg font-bold">2.3x</div>
                      <p className="text-xs text-muted-foreground">Viral Reach</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium">Top Growth Sources</p>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Gaming Communities</span>
                        <span className="text-muted-foreground">42%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>NFT Collectors</span>
                        <span className="text-muted-foreground">28%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Organic Discovery</span>
                        <span className="text-muted-foreground">20%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Partnerships</span>
                        <span className="text-muted-foreground">10%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}