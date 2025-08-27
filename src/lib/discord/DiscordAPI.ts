'use client'

import { toast } from 'sonner'

export interface DiscordUser {
  id: string
  username: string
  discriminator: string
  avatar: string | null
  email?: string
  verified?: boolean
  flags?: number
  premium_type?: number
  public_flags?: number
  accent_color?: number | null
}

export interface DiscordGuild {
  id: string
  name: string
  icon: string | null
  owner: boolean
  permissions: string
  features: string[]
  approximate_member_count?: number
  approximate_presence_count?: number
}

export interface DiscordChannel {
  id: string
  type: number
  guild_id?: string
  position?: number
  permission_overwrites?: any[]
  name?: string
  topic?: string | null
  nsfw?: boolean
  last_message_id?: string | null
  bitrate?: number
  user_limit?: number
  rate_limit_per_user?: number
  recipients?: DiscordUser[]
  icon?: string | null
  owner_id?: string
  application_id?: string
  parent_id?: string | null
  last_pin_timestamp?: string | null
}

export interface DiscordMessage {
  id: string
  channel_id: string
  guild_id?: string
  author: DiscordUser
  content: string
  timestamp: string
  edited_timestamp: string | null
  tts: boolean
  mention_everyone: boolean
  mentions: DiscordUser[]
  mention_roles: string[]
  attachments: any[]
  embeds: any[]
  reactions?: any[]
  nonce?: string | number
  pinned: boolean
  webhook_id?: string
  type: number
  activity?: any
  application?: any
  message_reference?: any
  flags?: number
}

export interface DiscordEmbed {
  title?: string
  type?: string
  description?: string
  url?: string
  timestamp?: string
  color?: number
  footer?: {
    text: string
    icon_url?: string
    proxy_icon_url?: string
  }
  image?: {
    url?: string
    proxy_url?: string
    height?: number
    width?: number
  }
  thumbnail?: {
    url?: string
    proxy_url?: string
    height?: number
    width?: number
  }
  video?: {
    url?: string
    height?: number
    width?: number
  }
  provider?: {
    name?: string
    url?: string
  }
  author?: {
    name?: string
    url?: string
    icon_url?: string
    proxy_icon_url?: string
  }
  fields?: {
    name: string
    value: string
    inline?: boolean
  }[]
}

export interface DiscordConfig {
  clientId: string
  clientSecret: string
  redirectUri: string
  botToken: string
  scopes: string[]
}

export interface BotCommand {
  name: string
  description: string
  options?: CommandOption[]
}

export interface CommandOption {
  type: number
  name: string
  description: string
  required?: boolean
  choices?: CommandChoice[]
}

export interface CommandChoice {
  name: string
  value: string | number
}

class DiscordAPI {
  private config: DiscordConfig
  private accessToken: string | null = null
  private refreshToken: string | null = null
  private baseUrl = 'https://discord.com/api/v10'

  constructor(config: DiscordConfig) {
    this.config = config
    this.loadTokensFromStorage()
  }

  private loadTokensFromStorage() {
    if (typeof window !== 'undefined') {
      this.accessToken = localStorage.getItem('discord_access_token')
      this.refreshToken = localStorage.getItem('discord_refresh_token')
    }
  }

  private saveTokensToStorage(accessToken: string, refreshToken: string) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('discord_access_token', accessToken)
      localStorage.setItem('discord_refresh_token', refreshToken)
      this.accessToken = accessToken
      this.refreshToken = refreshToken
    }
  }

  private clearTokensFromStorage() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('discord_access_token')
      localStorage.removeItem('discord_refresh_token')
      this.accessToken = null
      this.refreshToken = null
    }
  }

  private async makeRequest(
    endpoint: string,
    options: RequestInit = {},
    useBot = false
  ): Promise<any> {
    const url = `${this.baseUrl}${endpoint}`
    
    const headers = new Headers(options.headers)
    
    if (useBot) {
      headers.set('Authorization', `Bot ${this.config.botToken}`)
    } else if (this.accessToken) {
      headers.set('Authorization', `Bearer ${this.accessToken}`)
    }
    
    headers.set('Content-Type', 'application/json')
    headers.set('User-Agent', 'OmniverseGeckos/1.0')

    try {
      const response = await fetch(url, {
        ...options,
        headers
      })

      if (response.status === 401 && !useBot) {
        const refreshed = await this.refreshAccessToken()
        if (refreshed) {
          headers.set('Authorization', `Bearer ${this.accessToken}`)
          const retryResponse = await fetch(url, {
            ...options,
            headers
          })
          
          if (!retryResponse.ok) {
            throw new Error(`Discord API error: ${retryResponse.status} ${retryResponse.statusText}`)
          }
          
          return retryResponse.json()
        } else {
          throw new Error('Failed to refresh Discord token')
        }
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(
          `Discord API error: ${response.status} ${response.statusText} - ${
            errorData.message || 'Unknown error'
          }`
        )
      }

      const contentType = response.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        return response.json()
      }
      
      return response.text()
    } catch (error) {
      console.error('Discord API request failed:', error)
      throw error
    }
  }

  getAuthUrl(): string {
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      response_type: 'code',
      scope: this.config.scopes.join(' ')
    })

    return `https://discord.com/api/oauth2/authorize?${params.toString()}`
  }

  async exchangeCodeForToken(code: string): Promise<boolean> {
    try {
      const response = await fetch('https://discord.com/api/oauth2/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret,
          grant_type: 'authorization_code',
          code: code,
          redirect_uri: this.config.redirectUri
        })
      })

      if (!response.ok) {
        throw new Error(`Token exchange failed: ${response.statusText}`)
      }

      const data = await response.json()
      this.saveTokensToStorage(data.access_token, data.refresh_token)
      
      toast.success('Discord authentication successful!')
      return true
    } catch (error) {
      console.error('Discord token exchange error:', error)
      toast.error('Discord authentication failed')
      return false
    }
  }

  private async refreshAccessToken(): Promise<boolean> {
    if (!this.refreshToken) return false

    try {
      const response = await fetch('https://discord.com/api/oauth2/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret,
          grant_type: 'refresh_token',
          refresh_token: this.refreshToken
        })
      })

      if (!response.ok) {
        this.clearTokensFromStorage()
        return false
      }

      const data = await response.json()
      this.saveTokensToStorage(data.access_token, data.refresh_token)
      
      return true
    } catch (error) {
      console.error('Discord token refresh error:', error)
      this.clearTokensFromStorage()
      return false
    }
  }

  async getCurrentUser(): Promise<DiscordUser | null> {
    try {
      return await this.makeRequest('/users/@me')
    } catch (error) {
      console.error('Failed to get current user:', error)
      return null
    }
  }

  async getUserGuilds(): Promise<DiscordGuild[]> {
    try {
      return await this.makeRequest('/users/@me/guilds')
    } catch (error) {
      console.error('Failed to get user guilds:', error)
      return []
    }
  }

  async getGuildChannels(guildId: string): Promise<DiscordChannel[]> {
    try {
      return await this.makeRequest(`/guilds/${guildId}/channels`, {}, true)
    } catch (error) {
      console.error('Failed to get guild channels:', error)
      return []
    }
  }

  async getGuildMembers(guildId: string, limit = 100): Promise<any[]> {
    try {
      return await this.makeRequest(
        `/guilds/${guildId}/members?limit=${limit}`,
        {},
        true
      )
    } catch (error) {
      console.error('Failed to get guild members:', error)
      return []
    }
  }

  async sendMessage(
    channelId: string,
    content: string,
    embeds?: DiscordEmbed[]
  ): Promise<DiscordMessage | null> {
    try {
      const payload: any = { content }
      if (embeds && embeds.length > 0) {
        payload.embeds = embeds
      }

      return await this.makeRequest(
        `/channels/${channelId}/messages`,
        {
          method: 'POST',
          body: JSON.stringify(payload)
        },
        true
      )
    } catch (error) {
      console.error('Failed to send message:', error)
      toast.error('Failed to send Discord message')
      return null
    }
  }

  async createGuildCommand(guildId: string, command: BotCommand): Promise<any> {
    try {
      return await this.makeRequest(
        `/applications/${this.config.clientId}/guilds/${guildId}/commands`,
        {
          method: 'POST',
          body: JSON.stringify(command)
        },
        true
      )
    } catch (error) {
      console.error('Failed to create guild command:', error)
      return null
    }
  }

  async createGlobalCommand(command: BotCommand): Promise<any> {
    try {
      return await this.makeRequest(
        `/applications/${this.config.clientId}/commands`,
        {
          method: 'POST',
          body: JSON.stringify(command)
        },
        true
      )
    } catch (error) {
      console.error('Failed to create global command:', error)
      return null
    }
  }

  async deleteGuildCommand(guildId: string, commandId: string): Promise<boolean> {
    try {
      await this.makeRequest(
        `/applications/${this.config.clientId}/guilds/${guildId}/commands/${commandId}`,
        { method: 'DELETE' },
        true
      )
      return true
    } catch (error) {
      console.error('Failed to delete guild command:', error)
      return false
    }
  }

  async getChannelMessages(
    channelId: string,
    limit = 50,
    before?: string,
    after?: string
  ): Promise<DiscordMessage[]> {
    try {
      let endpoint = `/channels/${channelId}/messages?limit=${limit}`
      if (before) endpoint += `&before=${before}`
      if (after) endpoint += `&after=${after}`

      return await this.makeRequest(endpoint, {}, true)
    } catch (error) {
      console.error('Failed to get channel messages:', error)
      return []
    }
  }

  async createEmbed(options: {
    title?: string
    description?: string
    color?: number
    fields?: Array<{ name: string; value: string; inline?: boolean }>
    footer?: { text: string; icon_url?: string }
    thumbnail?: { url: string }
    image?: { url: string }
    author?: { name: string; icon_url?: string; url?: string }
    timestamp?: boolean
  }): DiscordEmbed {
    const embed: DiscordEmbed = {}
    
    if (options.title) embed.title = options.title
    if (options.description) embed.description = options.description
    if (options.color) embed.color = options.color
    if (options.fields) embed.fields = options.fields
    if (options.footer) embed.footer = options.footer
    if (options.thumbnail) embed.thumbnail = options.thumbnail
    if (options.image) embed.image = options.image
    if (options.author) embed.author = options.author
    if (options.timestamp) embed.timestamp = new Date().toISOString()

    return embed
  }

  async createGameEmbed(gameData: {
    title: string
    description: string
    playerCount?: number
    nftsMinted?: number
    totalVolume?: string
    imageUrl?: string
  }): Promise<DiscordEmbed> {
    return this.createEmbed({
      title: `🦎 ${gameData.title}`,
      description: gameData.description,
      color: 0x00ff88,
      fields: [
        ...(gameData.playerCount ? [{
          name: '👥 Active Players',
          value: gameData.playerCount.toLocaleString(),
          inline: true
        }] : []),
        ...(gameData.nftsMinted ? [{
          name: '🎨 NFTs Minted',
          value: gameData.nftsMinted.toLocaleString(),
          inline: true
        }] : []),
        ...(gameData.totalVolume ? [{
          name: '💰 Total Volume',
          value: gameData.totalVolume,
          inline: true
        }] : [])
      ],
      thumbnail: { url: gameData.imageUrl || 'https://omniverse-geckos.com/logo.png' },
      footer: {
        text: 'Omniverse Geckos',
        icon_url: 'https://omniverse-geckos.com/favicon.ico'
      },
      timestamp: true
    })
  }

  isAuthenticated(): boolean {
    return !!this.accessToken
  }

  logout() {
    this.clearTokensFromStorage()
    toast.success('Logged out from Discord')
  }

  async sendGameNotification(
    channelId: string,
    type: 'level_complete' | 'nft_minted' | 'tournament_start' | 'player_achievement',
    data: any
  ): Promise<boolean> {
    let embed: DiscordEmbed

    switch (type) {
      case 'level_complete':
        embed = await this.createEmbed({
          title: '🏆 Level Completed!',
          description: `${data.playerName} completed ${data.levelName}!`,
          color: 0xffd700,
          fields: [
            { name: 'Score', value: data.score.toLocaleString(), inline: true },
            { name: 'Time', value: data.time, inline: true },
            { name: 'Reward', value: `${data.reward} GECKO`, inline: true }
          ],
          timestamp: true
        })
        break

      case 'nft_minted':
        embed = await this.createEmbed({
          title: '🎨 New NFT Minted!',
          description: `${data.playerName} minted a new ${data.rarity} Gecko!`,
          color: 0xff6b6b,
          fields: [
            { name: 'NFT ID', value: data.tokenId, inline: true },
            { name: 'Rarity', value: data.rarity, inline: true },
            { name: 'Value', value: `${data.value} ETH`, inline: true }
          ],
          image: { url: data.imageUrl },
          timestamp: true
        })
        break

      case 'tournament_start':
        embed = await this.createEmbed({
          title: '⚔️ Tournament Starting!',
          description: data.tournamentName,
          color: 0xff4757,
          fields: [
            { name: 'Start Time', value: data.startTime, inline: true },
            { name: 'Prize Pool', value: `${data.prizePool} ETH`, inline: true },
            { name: 'Max Players', value: data.maxPlayers.toString(), inline: true }
          ],
          timestamp: true
        })
        break

      case 'player_achievement':
        embed = await this.createEmbed({
          title: '🏅 Achievement Unlocked!',
          description: `${data.playerName} earned: ${data.achievementName}`,
          color: 0x9c88ff,
          fields: [
            { name: 'Description', value: data.description, inline: false },
            { name: 'Reward', value: `${data.reward} GECKO`, inline: true }
          ],
          timestamp: true
        })
        break

      default:
        return false
    }

    const message = await this.sendMessage(channelId, '', [embed])
    return !!message
  }
}

export { DiscordAPI }
export default DiscordAPI