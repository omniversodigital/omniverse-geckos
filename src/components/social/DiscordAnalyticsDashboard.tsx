'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { 
  BarChart3, 
  Users, 
  MessageCircle, 
  TrendingUp, 
  Activity,
  Clock,
  Bell,
  Settings,
  Download,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Calendar,
  Hash,
  Crown,
  Zap
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { DiscordAPI, DiscordGuild, DiscordUser } from '@/lib/discord/DiscordAPI'
import { GuildManager, GuildStats } from '@/lib/discord/GuildManager'
import { NotificationManager, NotificationStats, NotificationTypes } from '@/lib/discord/NotificationManager'
import { toast } from 'sonner'

interface AnalyticsData {
  overview: {
    totalGuilds: number
    totalMembers: number
    activeUsers: number
    messagesSent: number
    notificationsSent: number
    uptimePercentage: number
  }
  guilds: Array<{
    id: string
    name: string
    memberCount: number
    onlineCount: number
    messageCount: number
    joinDate: string
    isActive: boolean
  }>
  notifications: NotificationStats
  engagement: {
    dailyActiveUsers: number[]
    messageActivity: number[]
    commandUsage: Record<string, number>
    popularChannels: Array<{ name: string; count: number }>
  }
  performance: {
    responseTime: number
    errorRate: number
    queueSize: number
    lastUpdate: string
  }
}

interface DiscordAnalyticsDashboardProps {
  discordAPI: DiscordAPI
  guildManager: GuildManager
  notificationManager: NotificationManager
}

export function DiscordAnalyticsDashboard({
  discordAPI,
  guildManager,
  notificationManager
}: DiscordAnalyticsDashboardProps) {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [selectedGuild, setSelectedGuild] = useState<string>('all')
  const [dateRange, setDateRange] = useState<string>('7d')
  const [isLoading, setIsLoading] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(false)
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null)

  const loadAnalyticsData = useCallback(async () => {
    try {
      setIsLoading(true)

      const user = await discordAPI.getCurrentUser()
      if (!user) {
        throw new Error('Not authenticated with Discord')
      }

      const guilds = await discordAPI.getUserGuilds()
      const notificationStats = notificationManager.getStats()
      const queueStatus = notificationManager.getQueueStatus()

      const guildAnalytics = await Promise.all(
        guilds.map(async (guild) => {
          const stats = await guildManager.getGuildStats(guild.id)
          return {
            id: guild.id,
            name: guild.name,
            memberCount: stats.memberCount,
            onlineCount: stats.onlineCount,
            messageCount: stats.messagesLast24h,
            joinDate: '2024-01-01',
            isActive: stats.messagesLast24h > 0
          }
        })
      )

      const totalMembers = guildAnalytics.reduce((sum, guild) => sum + guild.memberCount, 0)
      const totalOnline = guildAnalytics.reduce((sum, guild) => sum + guild.onlineCount, 0)
      const totalMessages = guildAnalytics.reduce((sum, guild) => sum + guild.messageCount, 0)

      const mockEngagement = {
        dailyActiveUsers: Array.from({ length: 7 }, () => Math.floor(Math.random() * 1000) + 500),
        messageActivity: Array.from({ length: 24 }, () => Math.floor(Math.random() * 100) + 20),
        commandUsage: {
          '/stats': Math.floor(Math.random() * 100) + 50,
          '/gecko': Math.floor(Math.random() * 80) + 30,
          '/leaderboard': Math.floor(Math.random() * 60) + 20,
          '/tournament': Math.floor(Math.random() * 40) + 10,
          '/help': Math.floor(Math.random() * 70) + 35
        },
        popularChannels: [
          { name: 'general', count: Math.floor(Math.random() * 200) + 100 },
          { name: 'game-chat', count: Math.floor(Math.random() * 150) + 75 },
          { name: 'announcements', count: Math.floor(Math.random() * 100) + 50 }
        ]
      }

      setAnalyticsData({
        overview: {
          totalGuilds: guilds.length,
          totalMembers,
          activeUsers: totalOnline,
          messagesSent: totalMessages,
          notificationsSent: notificationStats.totalSent,
          uptimePercentage: 99.2
        },
        guilds: guildAnalytics,
        notifications: notificationStats,
        engagement: mockEngagement,
        performance: {
          responseTime: notificationStats.averageDeliveryTime || 150,
          errorRate: notificationStats.failureRate || 2.1,
          queueSize: queueStatus.pending,
          lastUpdate: new Date().toISOString()
        }
      })
    } catch (error) {
      console.error('Failed to load analytics data:', error)
      toast.error('Failed to load analytics data')
    } finally {
      setIsLoading(false)
    }
  }, [discordAPI, guildManager, notificationManager])

  useEffect(() => {
    loadAnalyticsData()
  }, [loadAnalyticsData])

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(loadAnalyticsData, 30000) // Refresh every 30 seconds
      setRefreshInterval(interval)
    } else if (refreshInterval) {
      clearInterval(refreshInterval)
      setRefreshInterval(null)
    }

    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval)
      }
    }
  }, [autoRefresh, loadAnalyticsData])

  const handleRefresh = () => {
    loadAnalyticsData()
    toast.success('Analytics data refreshed')
  }

  const handleExportData = () => {
    if (!analyticsData) return

    const dataStr = JSON.stringify(analyticsData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `discord-analytics-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    
    toast.success('Analytics data exported')
  }

  const testNotification = async (type: keyof NotificationTypes) => {
    if (!selectedGuild || selectedGuild === 'all') {
      toast.error('Please select a specific guild to test notifications')
      return
    }

    const success = await notificationManager.testNotification(selectedGuild, type)
    if (success) {
      toast.success(`Test ${type} notification queued`)
    } else {
      toast.error(`Failed to queue test ${type} notification`)
    }
  }

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-2">
            <RefreshCw className="h-5 w-5 animate-spin" />
            <span>Loading Discord analytics...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!analyticsData) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <AlertTriangle className="h-12 w-12 mx-auto text-yellow-500" />
            <h3 className="text-lg font-semibold">Failed to Load Analytics</h3>
            <p className="text-muted-foreground">
              Unable to load Discord analytics data. Please check your connection and try again.
            </p>
            <Button onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Discord Analytics</h2>
          <p className="text-muted-foreground">
            Monitor your Discord integration performance and engagement
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedGuild} onValueChange={setSelectedGuild}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select Guild" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Guilds</SelectItem>
              {analyticsData.guilds.map((guild) => (
                <SelectItem key={guild.id} value={guild.id}>
                  {guild.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">24 Hours</SelectItem>
              <SelectItem value="7d">7 Days</SelectItem>
              <SelectItem value="30d">30 Days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportData}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Auto-refresh toggle */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Switch
                id="auto-refresh"
                checked={autoRefresh}
                onCheckedChange={setAutoRefresh}
              />
              <Label htmlFor="auto-refresh" className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Auto-refresh every 30 seconds
              </Label>
            </div>
            <Badge variant={autoRefresh ? 'default' : 'secondary'}>
              {autoRefresh ? 'Live' : 'Static'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Total Guilds</p>
                <p className="text-2xl font-bold">{analyticsData.overview.totalGuilds}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Crown className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm font-medium">Total Members</p>
                <p className="text-2xl font-bold">{analyticsData.overview.totalMembers.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium">Active Users</p>
                <p className="text-2xl font-bold">{analyticsData.overview.activeUsers.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <MessageCircle className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm font-medium">Messages 24h</p>
                <p className="text-2xl font-bold">{analyticsData.overview.messagesSent.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Bell className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm font-medium">Notifications</p>
                <p className="text-2xl font-bold">{analyticsData.overview.notificationsSent.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Zap className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm font-medium">Uptime</p>
                <p className="text-2xl font-bold">{analyticsData.overview.uptimePercentage}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="guilds">Guilds</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Guild Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Guild Activity
                </CardTitle>
                <CardDescription>Message activity across your Discord servers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.guilds.slice(0, 5).map((guild) => (
                    <div key={guild.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${guild.isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
                        <span className="font-medium truncate">{guild.name}</span>
                        <Badge variant="outline">{guild.memberCount}</Badge>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{guild.messageCount}</p>
                        <p className="text-xs text-muted-foreground">messages</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Notification Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notification Analytics
                </CardTitle>
                <CardDescription>Breakdown of notification types sent</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(analyticsData.notifications.byType).map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between">
                      <span className="capitalize">{type.replace(/([A-Z])/g, ' $1').trim()}</span>
                      <div className="flex items-center space-x-2">
                        <Progress value={count / Math.max(...Object.values(analyticsData.notifications.byType)) * 100} className="w-20" />
                        <span className="font-medium w-8 text-right">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="guilds" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Guild Management</CardTitle>
              <CardDescription>Monitor and manage your Discord server connections</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.guilds.map((guild) => (
                  <div key={guild.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${guild.isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
                        <h3 className="font-semibold">{guild.name}</h3>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={guild.isActive ? 'default' : 'secondary'}>
                          {guild.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Members</p>
                        <p className="font-medium">{guild.memberCount.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Online</p>
                        <p className="font-medium">{guild.onlineCount.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Messages 24h</p>
                        <p className="font-medium">{guild.messageCount.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Joined</p>
                        <p className="font-medium">{new Date(guild.joinDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Statistics</CardTitle>
                <CardDescription>Overview of notification delivery performance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold">{analyticsData.notifications.totalSent}</p>
                    <p className="text-sm text-muted-foreground">Total Sent</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">{analyticsData.notifications.sentToday}</p>
                    <p className="text-sm text-muted-foreground">Sent Today</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Success Rate</span>
                    <span>{(100 - analyticsData.notifications.failureRate).toFixed(1)}%</span>
                  </div>
                  <Progress value={100 - analyticsData.notifications.failureRate} className="w-full" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Avg. Delivery Time</span>
                    <span>{Math.round(analyticsData.notifications.averageDeliveryTime)}ms</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Test Notifications</CardTitle>
                <CardDescription>Send test notifications to verify functionality</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => testNotification('gameEvents')}
                    disabled={selectedGuild === 'all'}
                  >
                    Game Event
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => testNotification('nftMints')}
                    disabled={selectedGuild === 'all'}
                  >
                    NFT Mint
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => testNotification('tournaments')}
                    disabled={selectedGuild === 'all'}
                  >
                    Tournament
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => testNotification('achievements')}
                    disabled={selectedGuild === 'all'}
                  >
                    Achievement
                  </Button>
                </div>
                {selectedGuild === 'all' && (
                  <p className="text-sm text-muted-foreground">
                    Select a specific guild to send test notifications
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Command Usage</CardTitle>
              <CardDescription>Most popular bot commands</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(analyticsData.engagement.commandUsage)
                  .sort(([,a], [,b]) => b - a)
                  .map(([command, usage]) => (
                  <div key={command} className="flex items-center justify-between">
                    <span className="font-mono text-sm">{command}</span>
                    <div className="flex items-center space-x-2">
                      <Progress 
                        value={usage / Math.max(...Object.values(analyticsData.engagement.commandUsage)) * 100} 
                        className="w-32" 
                      />
                      <span className="font-medium w-8 text-right">{usage}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium">Response Time</p>
                    <p className="text-2xl font-bold">{Math.round(analyticsData.performance.responseTime)}ms</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  <div>
                    <p className="text-sm font-medium">Error Rate</p>
                    <p className="text-2xl font-bold">{analyticsData.performance.errorRate.toFixed(1)}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Activity className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="text-sm font-medium">Queue Size</p>
                    <p className="text-2xl font-bold">{analyticsData.performance.queueSize}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
              <CardDescription>Current system health and status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Discord API Connection</span>
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Connected
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Notification Queue</span>
                  <Badge variant="outline">
                    <Activity className="h-3 w-3 mr-1" />
                    {analyticsData.performance.queueSize} pending
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Last Updated</span>
                  <span className="text-sm text-muted-foreground">
                    {new Date(analyticsData.performance.lastUpdate).toLocaleString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}