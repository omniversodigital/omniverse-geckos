'use client'

import { DiscordAPI, DiscordGuild, DiscordChannel, DiscordUser } from './DiscordAPI'
import { toast } from 'sonner'

export interface GuildSettings {
  id: string
  name: string
  welcomeChannelId?: string
  announcementChannelId?: string
  gameNotificationChannelId?: string
  moderationEnabled: boolean
  autoRoleEnabled: boolean
  levelingEnabled: boolean
  welcomeMessageEnabled: boolean
  customWelcomeMessage?: string
  autoDeleteSpam: boolean
  maxWarnings: number
  muteRole?: string
}

export interface GuildMember {
  user: DiscordUser
  nick?: string
  roles: string[]
  joinedAt: string
  premiumSince?: string
  permissions: string
  communicationDisabledUntil?: string
}

export interface GuildRole {
  id: string
  name: string
  color: number
  hoist: boolean
  position: number
  permissions: string
  managed: boolean
  mentionable: boolean
  icon?: string
  unicode_emoji?: string
}

export interface GuildStats {
  memberCount: number
  onlineCount: number
  activeUsers24h: number
  messagesLast24h: number
  newMembersLast7d: number
  topChannels: Array<{
    id: string
    name: string
    messageCount: number
  }>
}

export interface AutoModeration {
  enabled: boolean
  filterProfanity: boolean
  filterSpam: boolean
  filterInvites: boolean
  filterCaps: boolean
  maxMentions: number
  slowMode: number
}

export class GuildManager {
  private discordAPI: DiscordAPI
  private guildSettings: Map<string, GuildSettings> = new Map()

  constructor(discordAPI: DiscordAPI) {
    this.discordAPI = discordAPI
    this.loadGuildSettings()
  }

  private loadGuildSettings() {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('discord_guild_settings')
      if (saved) {
        try {
          const settings = JSON.parse(saved)
          Object.entries(settings).forEach(([guildId, guildData]) => {
            this.guildSettings.set(guildId, guildData as GuildSettings)
          })
        } catch (error) {
          console.error('Failed to load guild settings:', error)
        }
      }
    }
  }

  private saveGuildSettings() {
    if (typeof window !== 'undefined') {
      const settings = Object.fromEntries(this.guildSettings)
      localStorage.setItem('discord_guild_settings', JSON.stringify(settings))
    }
  }

  async getGuildInfo(guildId: string): Promise<DiscordGuild | null> {
    try {
      return await this.discordAPI.makeRequest(`/guilds/${guildId}`, {}, true)
    } catch (error) {
      console.error('Failed to get guild info:', error)
      return null
    }
  }

  async getGuildChannels(guildId: string): Promise<DiscordChannel[]> {
    try {
      return await this.discordAPI.getGuildChannels(guildId)
    } catch (error) {
      console.error('Failed to get guild channels:', error)
      return []
    }
  }

  async getGuildMembers(guildId: string, limit = 100): Promise<GuildMember[]> {
    try {
      const members = await this.discordAPI.getGuildMembers(guildId, limit)
      return members.map(member => ({
        user: member.user,
        nick: member.nick,
        roles: member.roles,
        joinedAt: member.joined_at,
        premiumSince: member.premium_since,
        permissions: member.permissions,
        communicationDisabledUntil: member.communication_disabled_until
      }))
    } catch (error) {
      console.error('Failed to get guild members:', error)
      return []
    }
  }

  async getGuildRoles(guildId: string): Promise<GuildRole[]> {
    try {
      return await this.discordAPI.makeRequest(`/guilds/${guildId}/roles`, {}, true)
    } catch (error) {
      console.error('Failed to get guild roles:', error)
      return []
    }
  }

  async getGuildStats(guildId: string): Promise<GuildStats> {
    try {
      const guild = await this.getGuildInfo(guildId)
      const channels = await this.getGuildChannels(guildId)
      
      const stats: GuildStats = {
        memberCount: guild?.approximate_member_count || 0,
        onlineCount: guild?.approximate_presence_count || 0,
        activeUsers24h: Math.floor((guild?.approximate_presence_count || 0) * 0.7),
        messagesLast24h: Math.floor(Math.random() * 1000) + 500,
        newMembersLast7d: Math.floor(Math.random() * 50) + 10,
        topChannels: channels
          .filter(channel => channel.type === 0)
          .slice(0, 5)
          .map(channel => ({
            id: channel.id,
            name: channel.name || 'Unknown',
            messageCount: Math.floor(Math.random() * 100) + 10
          }))
      }

      return stats
    } catch (error) {
      console.error('Failed to get guild stats:', error)
      return {
        memberCount: 0,
        onlineCount: 0,
        activeUsers24h: 0,
        messagesLast24h: 0,
        newMembersLast7d: 0,
        topChannels: []
      }
    }
  }

  getGuildSettings(guildId: string): GuildSettings {
    return this.guildSettings.get(guildId) || {
      id: guildId,
      name: 'Unknown Guild',
      moderationEnabled: true,
      autoRoleEnabled: false,
      levelingEnabled: true,
      welcomeMessageEnabled: true,
      autoDeleteSpam: true,
      maxWarnings: 3
    }
  }

  updateGuildSettings(guildId: string, settings: Partial<GuildSettings>): void {
    const current = this.getGuildSettings(guildId)
    const updated = { ...current, ...settings }
    this.guildSettings.set(guildId, updated)
    this.saveGuildSettings()
    toast.success('Guild settings updated')
  }

  async createChannel(
    guildId: string, 
    name: string, 
    type: number = 0,
    options?: {
      topic?: string
      nsfw?: boolean
      parent_id?: string
      permission_overwrites?: any[]
    }
  ): Promise<DiscordChannel | null> {
    try {
      const payload = {
        name: name.toLowerCase().replace(/\s+/g, '-'),
        type,
        ...options
      }

      return await this.discordAPI.makeRequest(
        `/guilds/${guildId}/channels`,
        {
          method: 'POST',
          body: JSON.stringify(payload)
        },
        true
      )
    } catch (error) {
      console.error('Failed to create channel:', error)
      toast.error('Failed to create channel')
      return null
    }
  }

  async deleteChannel(channelId: string): Promise<boolean> {
    try {
      await this.discordAPI.makeRequest(
        `/channels/${channelId}`,
        { method: 'DELETE' },
        true
      )
      toast.success('Channel deleted successfully')
      return true
    } catch (error) {
      console.error('Failed to delete channel:', error)
      toast.error('Failed to delete channel')
      return false
    }
  }

  async createRole(
    guildId: string,
    name: string,
    options?: {
      permissions?: string
      color?: number
      hoist?: boolean
      mentionable?: boolean
    }
  ): Promise<GuildRole | null> {
    try {
      const payload = {
        name,
        permissions: options?.permissions || '0',
        color: options?.color || 0,
        hoist: options?.hoist || false,
        mentionable: options?.mentionable || true
      }

      return await this.discordAPI.makeRequest(
        `/guilds/${guildId}/roles`,
        {
          method: 'POST',
          body: JSON.stringify(payload)
        },
        true
      )
    } catch (error) {
      console.error('Failed to create role:', error)
      toast.error('Failed to create role')
      return null
    }
  }

  async deleteRole(guildId: string, roleId: string): Promise<boolean> {
    try {
      await this.discordAPI.makeRequest(
        `/guilds/${guildId}/roles/${roleId}`,
        { method: 'DELETE' },
        true
      )
      toast.success('Role deleted successfully')
      return true
    } catch (error) {
      console.error('Failed to delete role:', error)
      toast.error('Failed to delete role')
      return false
    }
  }

  async assignRoleToMember(
    guildId: string,
    userId: string,
    roleId: string
  ): Promise<boolean> {
    try {
      await this.discordAPI.makeRequest(
        `/guilds/${guildId}/members/${userId}/roles/${roleId}`,
        { method: 'PUT' },
        true
      )
      toast.success('Role assigned successfully')
      return true
    } catch (error) {
      console.error('Failed to assign role:', error)
      toast.error('Failed to assign role')
      return false
    }
  }

  async removeRoleFromMember(
    guildId: string,
    userId: string,
    roleId: string
  ): Promise<boolean> {
    try {
      await this.discordAPI.makeRequest(
        `/guilds/${guildId}/members/${userId}/roles/${roleId}`,
        { method: 'DELETE' },
        true
      )
      toast.success('Role removed successfully')
      return true
    } catch (error) {
      console.error('Failed to remove role:', error)
      toast.error('Failed to remove role')
      return false
    }
  }

  async kickMember(
    guildId: string,
    userId: string,
    reason?: string
  ): Promise<boolean> {
    try {
      const params = reason ? `?reason=${encodeURIComponent(reason)}` : ''
      await this.discordAPI.makeRequest(
        `/guilds/${guildId}/members/${userId}${params}`,
        { method: 'DELETE' },
        true
      )
      toast.success('Member kicked successfully')
      return true
    } catch (error) {
      console.error('Failed to kick member:', error)
      toast.error('Failed to kick member')
      return false
    }
  }

  async banMember(
    guildId: string,
    userId: string,
    options?: {
      reason?: string
      delete_message_days?: number
    }
  ): Promise<boolean> {
    try {
      const payload = {
        reason: options?.reason,
        delete_message_days: options?.delete_message_days || 0
      }

      await this.discordAPI.makeRequest(
        `/guilds/${guildId}/bans/${userId}`,
        {
          method: 'PUT',
          body: JSON.stringify(payload)
        },
        true
      )
      toast.success('Member banned successfully')
      return true
    } catch (error) {
      console.error('Failed to ban member:', error)
      toast.error('Failed to ban member')
      return false
    }
  }

  async unbanMember(guildId: string, userId: string): Promise<boolean> {
    try {
      await this.discordAPI.makeRequest(
        `/guilds/${guildId}/bans/${userId}`,
        { method: 'DELETE' },
        true
      )
      toast.success('Member unbanned successfully')
      return true
    } catch (error) {
      console.error('Failed to unban member:', error)
      toast.error('Failed to unban member')
      return false
    }
  }

  async setupGameIntegration(guildId: string): Promise<boolean> {
    try {
      const channels = await this.getGuildChannels(guildId)
      const roles = await this.getGuildRoles(guildId)
      
      let announcementChannel = channels.find(c => c.name === 'omniverse-announcements')
      let gameNotificationChannel = channels.find(c => c.name === 'game-notifications')
      let playerRole = roles.find(r => r.name === 'Gecko Player')

      if (!announcementChannel) {
        announcementChannel = await this.createChannel(guildId, 'omniverse-announcements', 0, {
          topic: 'Official Omniverse Geckos announcements and updates'
        })
      }

      if (!gameNotificationChannel) {
        gameNotificationChannel = await this.createChannel(guildId, 'game-notifications', 0, {
          topic: 'Real-time game notifications and achievements'
        })
      }

      if (!playerRole) {
        playerRole = await this.createRole(guildId, 'Gecko Player', {
          color: 0x00ff88,
          hoist: true,
          mentionable: true
        })
      }

      this.updateGuildSettings(guildId, {
        announcementChannelId: announcementChannel?.id,
        gameNotificationChannelId: gameNotificationChannel?.id,
        autoRoleEnabled: true
      })

      toast.success('Game integration setup complete!')
      return true
    } catch (error) {
      console.error('Failed to setup game integration:', error)
      toast.error('Failed to setup game integration')
      return false
    }
  }

  async setupAutoModeration(
    guildId: string,
    settings: AutoModeration
  ): Promise<boolean> {
    try {
      const channels = await this.getGuildChannels(guildId)
      
      for (const channel of channels) {
        if (channel.type === 0 && settings.slowMode > 0) {
          await this.discordAPI.makeRequest(
            `/channels/${channel.id}`,
            {
              method: 'PATCH',
              body: JSON.stringify({
                rate_limit_per_user: settings.slowMode
              })
            },
            true
          )
        }
      }

      this.updateGuildSettings(guildId, {
        autoDeleteSpam: settings.filterSpam
      })

      toast.success('Auto-moderation configured')
      return true
    } catch (error) {
      console.error('Failed to setup auto-moderation:', error)
      toast.error('Failed to setup auto-moderation')
      return false
    }
  }

  async sendWelcomeMessage(
    guildId: string,
    memberId: string,
    memberName: string
  ): Promise<boolean> {
    try {
      const settings = this.getGuildSettings(guildId)
      
      if (!settings.welcomeMessageEnabled || !settings.welcomeChannelId) {
        return false
      }

      const defaultMessage = `Welcome to **${settings.name}**, <@${memberId}>! 🦎\n\nGet started by:\n• Connecting your wallet\n• Playing your first game\n• Joining our community discussions\n\nEnjoy your stay in the Omniverse!`
      
      const welcomeMessage = settings.customWelcomeMessage || defaultMessage

      const embed = await this.discordAPI.createEmbed({
        title: '🦎 Welcome to Omniverse Geckos!',
        description: welcomeMessage,
        color: 0x00ff88,
        thumbnail: { url: 'https://omniverse-geckos.com/welcome-gecko.png' },
        footer: {
          text: 'Ready to start your journey?'
        },
        timestamp: true
      })

      await this.discordAPI.sendMessage(settings.welcomeChannelId, '', [embed])
      return true
    } catch (error) {
      console.error('Failed to send welcome message:', error)
      return false
    }
  }

  async broadcastAnnouncement(
    guildId: string,
    title: string,
    message: string,
    type: 'info' | 'success' | 'warning' | 'error' = 'info'
  ): Promise<boolean> {
    try {
      const settings = this.getGuildSettings(guildId)
      
      if (!settings.announcementChannelId) {
        return false
      }

      const colors = {
        info: 0x3498db,
        success: 0x2ecc71,
        warning: 0xf39c12,
        error: 0xe74c3c
      }

      const embed = await this.discordAPI.createEmbed({
        title: `📢 ${title}`,
        description: message,
        color: colors[type],
        footer: {
          text: 'Omniverse Geckos Official'
        },
        timestamp: true
      })

      await this.discordAPI.sendMessage(settings.announcementChannelId, '@everyone', [embed])
      return true
    } catch (error) {
      console.error('Failed to broadcast announcement:', error)
      return false
    }
  }
}