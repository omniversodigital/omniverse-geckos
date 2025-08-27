'use client'

import { DiscordAPI, DiscordEmbed } from './DiscordAPI'
import { GuildManager } from './GuildManager'
import { toast } from 'sonner'

export interface NotificationConfig {
  enabled: boolean
  channelId: string
  guildId: string
  types: NotificationTypes
  cooldown: number // minutes
  template?: string
}

export interface NotificationTypes {
  gameEvents: boolean
  nftMints: boolean
  tournaments: boolean
  achievements: boolean
  marketActivity: boolean
  playerMilestones: boolean
  systemUpdates: boolean
}

export interface GameNotification {
  id: string
  type: keyof NotificationTypes
  title: string
  description: string
  data: any
  timestamp: string
  userId?: string
  guildId?: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
}

export interface NotificationQueue {
  notifications: GameNotification[]
  processing: boolean
  lastProcessed: string
}

export interface NotificationStats {
  totalSent: number
  sentToday: number
  byType: Record<keyof NotificationTypes, number>
  failureRate: number
  averageDeliveryTime: number
}

const defaultNotificationTypes: NotificationTypes = {
  gameEvents: true,
  nftMints: true,
  tournaments: true,
  achievements: true,
  marketActivity: false,
  playerMilestones: true,
  systemUpdates: true
}

export class NotificationManager {
  private discordAPI: DiscordAPI
  private guildManager: GuildManager
  private notificationConfigs: Map<string, NotificationConfig> = new Map()
  private notificationQueue: NotificationQueue = {
    notifications: [],
    processing: false,
    lastProcessed: new Date().toISOString()
  }
  private stats: NotificationStats = {
    totalSent: 0,
    sentToday: 0,
    byType: {
      gameEvents: 0,
      nftMints: 0,
      tournaments: 0,
      achievements: 0,
      marketActivity: 0,
      playerMilestones: 0,
      systemUpdates: 0
    },
    failureRate: 0,
    averageDeliveryTime: 0
  }
  private processingInterval: NodeJS.Timeout | null = null
  private cooldownMap: Map<string, number> = new Map()

  constructor(discordAPI: DiscordAPI, guildManager: GuildManager) {
    this.discordAPI = discordAPI
    this.guildManager = guildManager
    this.loadNotificationConfigs()
    this.loadStats()
    this.startQueueProcessor()
  }

  private loadNotificationConfigs() {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('discord_notification_configs')
      if (saved) {
        try {
          const configs = JSON.parse(saved)
          Object.entries(configs).forEach(([guildId, config]) => {
            this.notificationConfigs.set(guildId, config as NotificationConfig)
          })
        } catch (error) {
          console.error('Failed to load notification configs:', error)
        }
      }
    }
  }

  private saveNotificationConfigs() {
    if (typeof window !== 'undefined') {
      const configs = Object.fromEntries(this.notificationConfigs)
      localStorage.setItem('discord_notification_configs', JSON.stringify(configs))
    }
  }

  private loadStats() {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('discord_notification_stats')
      if (saved) {
        try {
          this.stats = { ...this.stats, ...JSON.parse(saved) }
        } catch (error) {
          console.error('Failed to load notification stats:', error)
        }
      }
    }
  }

  private saveStats() {
    if (typeof window !== 'undefined') {
      localStorage.setItem('discord_notification_stats', JSON.stringify(this.stats))
    }
  }

  private startQueueProcessor() {
    if (this.processingInterval) {
      clearInterval(this.processingInterval)
    }

    this.processingInterval = setInterval(() => {
      this.processNotificationQueue()
    }, 5000) // Process every 5 seconds
  }

  private async processNotificationQueue() {
    if (this.notificationQueue.processing || this.notificationQueue.notifications.length === 0) {
      return
    }

    this.notificationQueue.processing = true

    try {
      const notification = this.notificationQueue.notifications.shift()
      if (!notification) return

      const startTime = Date.now()
      const success = await this.sendNotificationToDiscord(notification)
      const deliveryTime = Date.now() - startTime

      this.updateStats(notification.type, success, deliveryTime)
      
      if (success) {
        console.log(`Notification sent: ${notification.title}`)
      } else {
        console.warn(`Failed to send notification: ${notification.title}`)
      }
    } catch (error) {
      console.error('Error processing notification queue:', error)
    } finally {
      this.notificationQueue.processing = false
      this.notificationQueue.lastProcessed = new Date().toISOString()
    }
  }

  private updateStats(type: keyof NotificationTypes, success: boolean, deliveryTime: number) {
    this.stats.totalSent++
    this.stats.byType[type]++
    
    const today = new Date().toDateString()
    const lastUpdate = new Date(this.stats.sentToday || 0).toDateString()
    if (today !== lastUpdate) {
      this.stats.sentToday = 1
    } else {
      this.stats.sentToday++
    }

    if (!success) {
      const totalAttempts = this.stats.totalSent
      const failures = Math.round(this.stats.failureRate * totalAttempts / 100) + 1
      this.stats.failureRate = (failures / totalAttempts) * 100
    }

    const currentAvg = this.stats.averageDeliveryTime
    const totalNotifications = this.stats.totalSent
    this.stats.averageDeliveryTime = ((currentAvg * (totalNotifications - 1)) + deliveryTime) / totalNotifications

    this.saveStats()
  }

  configureNotifications(guildId: string, config: Partial<NotificationConfig>) {
    const current = this.getNotificationConfig(guildId)
    const updated = { ...current, ...config }
    this.notificationConfigs.set(guildId, updated)
    this.saveNotificationConfigs()
  }

  getNotificationConfig(guildId: string): NotificationConfig {
    return this.notificationConfigs.get(guildId) || {
      enabled: true,
      channelId: '',
      guildId,
      types: defaultNotificationTypes,
      cooldown: 0
    }
  }

  async queueNotification(notification: Omit<GameNotification, 'id' | 'timestamp'>) {
    const fullNotification: GameNotification = {
      ...notification,
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString()
    }

    // Check cooldown
    if (notification.guildId && this.isInCooldown(notification.guildId, notification.type)) {
      console.log(`Notification ${notification.type} skipped due to cooldown for guild ${notification.guildId}`)
      return false
    }

    this.notificationQueue.notifications.push(fullNotification)
    
    // Set cooldown
    if (notification.guildId) {
      this.setCooldown(notification.guildId, notification.type)
    }

    return true
  }

  private isInCooldown(guildId: string, type: keyof NotificationTypes): boolean {
    const config = this.getNotificationConfig(guildId)
    if (config.cooldown === 0) return false

    const cooldownKey = `${guildId}_${type}`
    const lastSent = this.cooldownMap.get(cooldownKey)
    
    if (!lastSent) return false

    const cooldownMs = config.cooldown * 60 * 1000
    return Date.now() - lastSent < cooldownMs
  }

  private setCooldown(guildId: string, type: keyof NotificationTypes) {
    const cooldownKey = `${guildId}_${type}`
    this.cooldownMap.set(cooldownKey, Date.now())
  }

  private async sendNotificationToDiscord(notification: GameNotification): Promise<boolean> {
    try {
      const config = notification.guildId ? 
        this.getNotificationConfig(notification.guildId) : null

      if (!config || !config.enabled || !config.types[notification.type]) {
        return false
      }

      const channelId = config.channelId || 
        this.guildManager.getGuildSettings(notification.guildId!).gameNotificationChannelId

      if (!channelId) {
        console.warn(`No notification channel configured for guild ${notification.guildId}`)
        return false
      }

      const embed = await this.createNotificationEmbed(notification)
      const message = await this.discordAPI.sendMessage(channelId, '', [embed])

      return !!message
    } catch (error) {
      console.error('Failed to send Discord notification:', error)
      return false
    }
  }

  private async createNotificationEmbed(notification: GameNotification): Promise<DiscordEmbed> {
    const colors = {
      low: 0x95a5a6,
      medium: 0x3498db,
      high: 0xf39c12,
      urgent: 0xe74c3c
    }

    const typeEmojis = {
      gameEvents: '🎮',
      nftMints: '🎨',
      tournaments: '⚔️',
      achievements: '🏆',
      marketActivity: '💰',
      playerMilestones: '🌟',
      systemUpdates: '🔧'
    }

    return this.discordAPI.createEmbed({
      title: `${typeEmojis[notification.type]} ${notification.title}`,
      description: notification.description,
      color: colors[notification.priority],
      fields: this.createNotificationFields(notification),
      footer: {
        text: `Omniverse Geckos • ${notification.type}`,
        icon_url: 'https://omniverse-geckos.com/favicon.ico'
      },
      timestamp: true
    })
  }

  private createNotificationFields(notification: GameNotification): Array<{name: string, value: string, inline?: boolean}> {
    const fields: Array<{name: string, value: string, inline?: boolean}> = []

    switch (notification.type) {
      case 'gameEvents':
        if (notification.data.playerName) {
          fields.push({
            name: '👤 Player',
            value: notification.data.playerName,
            inline: true
          })
        }
        if (notification.data.level) {
          fields.push({
            name: '🎯 Level',
            value: notification.data.level.toString(),
            inline: true
          })
        }
        if (notification.data.reward) {
          fields.push({
            name: '💎 Reward',
            value: `${notification.data.reward} GECKO`,
            inline: true
          })
        }
        break

      case 'nftMints':
        if (notification.data.tokenId) {
          fields.push({
            name: '🎨 Token ID',
            value: `#${notification.data.tokenId}`,
            inline: true
          })
        }
        if (notification.data.rarity) {
          fields.push({
            name: '✨ Rarity',
            value: notification.data.rarity,
            inline: true
          })
        }
        if (notification.data.price) {
          fields.push({
            name: '💰 Price',
            value: `${notification.data.price} ETH`,
            inline: true
          })
        }
        break

      case 'tournaments':
        if (notification.data.prizePool) {
          fields.push({
            name: '🏆 Prize Pool',
            value: notification.data.prizePool,
            inline: true
          })
        }
        if (notification.data.participants) {
          fields.push({
            name: '👥 Participants',
            value: notification.data.participants.toString(),
            inline: true
          })
        }
        if (notification.data.startTime) {
          fields.push({
            name: '⏰ Start Time',
            value: notification.data.startTime,
            inline: true
          })
        }
        break

      case 'achievements':
        if (notification.data.achievementName) {
          fields.push({
            name: '🏅 Achievement',
            value: notification.data.achievementName,
            inline: false
          })
        }
        if (notification.data.reward) {
          fields.push({
            name: '💎 Reward',
            value: `${notification.data.reward} GECKO`,
            inline: true
          })
        }
        break

      case 'marketActivity':
        if (notification.data.volume24h) {
          fields.push({
            name: '📊 24h Volume',
            value: `${notification.data.volume24h} ETH`,
            inline: true
          })
        }
        if (notification.data.sales) {
          fields.push({
            name: '🏪 Sales',
            value: notification.data.sales.toString(),
            inline: true
          })
        }
        break
    }

    return fields
  }

  // Convenience methods for different notification types
  async notifyGameEvent(data: {
    guildId: string
    playerName: string
    eventType: string
    level?: number
    score?: number
    reward?: number
    description: string
  }) {
    return this.queueNotification({
      type: 'gameEvents',
      title: `Game Event: ${data.eventType}`,
      description: data.description,
      data,
      guildId: data.guildId,
      priority: 'medium'
    })
  }

  async notifyNFTMint(data: {
    guildId: string
    playerName: string
    tokenId: string
    rarity: string
    imageUrl: string
    price?: string
  }) {
    return this.queueNotification({
      type: 'nftMints',
      title: `New NFT Minted!`,
      description: `${data.playerName} minted a ${data.rarity} Gecko!`,
      data,
      guildId: data.guildId,
      priority: 'high'
    })
  }

  async notifyTournament(data: {
    guildId: string
    tournamentName: string
    eventType: 'start' | 'end' | 'registration'
    prizePool: string
    participants?: number
    startTime?: string
  }) {
    return this.queueNotification({
      type: 'tournaments',
      title: `Tournament ${data.eventType === 'start' ? 'Started' : data.eventType === 'end' ? 'Ended' : 'Registration Open'}`,
      description: `${data.tournamentName} - ${data.prizePool} prize pool`,
      data,
      guildId: data.guildId,
      priority: 'high'
    })
  }

  async notifyAchievement(data: {
    guildId: string
    playerName: string
    achievementName: string
    description: string
    reward?: number
    userId?: string
  }) {
    return this.queueNotification({
      type: 'achievements',
      title: `Achievement Unlocked!`,
      description: `${data.playerName} earned: ${data.achievementName}`,
      data,
      guildId: data.guildId,
      userId: data.userId,
      priority: 'medium'
    })
  }

  async notifyPlayerMilestone(data: {
    guildId: string
    playerName: string
    milestoneType: string
    value: string
    description: string
  }) {
    return this.queueNotification({
      type: 'playerMilestones',
      title: `Player Milestone Reached!`,
      description: data.description,
      data,
      guildId: data.guildId,
      priority: 'medium'
    })
  }

  async notifySystemUpdate(data: {
    guildId: string
    updateType: string
    version?: string
    description: string
    features?: string[]
  }) {
    return this.queueNotification({
      type: 'systemUpdates',
      title: `System Update: ${data.updateType}`,
      description: data.description,
      data,
      guildId: data.guildId,
      priority: 'low'
    })
  }

  getStats(): NotificationStats {
    return { ...this.stats }
  }

  getQueueStatus(): { pending: number; processing: boolean; lastProcessed: string } {
    return {
      pending: this.notificationQueue.notifications.length,
      processing: this.notificationQueue.processing,
      lastProcessed: this.notificationQueue.lastProcessed
    }
  }

  clearQueue() {
    this.notificationQueue.notifications = []
    toast.success('Notification queue cleared')
  }

  testNotification(guildId: string, type: keyof NotificationTypes) {
    const testData = this.getTestNotificationData(type)
    return this.queueNotification({
      type,
      title: `Test ${type} Notification`,
      description: 'This is a test notification to verify your Discord integration is working correctly.',
      data: testData,
      guildId,
      priority: 'low'
    })
  }

  private getTestNotificationData(type: keyof NotificationTypes): any {
    switch (type) {
      case 'gameEvents':
        return { playerName: 'TestPlayer', level: 5, score: 1000, reward: 50 }
      case 'nftMints':
        return { playerName: 'TestPlayer', tokenId: '12345', rarity: 'Rare', price: '0.1' }
      case 'tournaments':
        return { tournamentName: 'Test Tournament', prizePool: '10 ETH', participants: 25 }
      case 'achievements':
        return { playerName: 'TestPlayer', achievementName: 'Test Achievement', reward: 100 }
      case 'marketActivity':
        return { volume24h: '50', sales: 15 }
      case 'playerMilestones':
        return { playerName: 'TestPlayer', milestoneType: 'Level Up', value: '10' }
      case 'systemUpdates':
        return { updateType: 'Feature Update', version: '1.2.0', features: ['New UI', 'Bug fixes'] }
      default:
        return {}
    }
  }

  destroy() {
    if (this.processingInterval) {
      clearInterval(this.processingInterval)
      this.processingInterval = null
    }
  }
}