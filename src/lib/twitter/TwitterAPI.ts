'use client'

// =============================================================================
// Twitter API v2 Integration for Omniverse Geckos
// =============================================================================

export interface TwitterAPIConfig {
  apiKey: string
  apiKeySecret: string
  accessToken: string
  accessTokenSecret: string
  bearerToken: string
  clientId?: string
  clientSecret?: string
}

export interface TwitterUser {
  id: string
  username: string
  name: string
  profile_image_url: string
  verified: boolean
  public_metrics: {
    followers_count: number
    following_count: number
    tweet_count: number
    listed_count: number
  }
  description?: string
  location?: string
  url?: string
  created_at: string
}

export interface TwitterTweet {
  id: string
  text: string
  author_id: string
  created_at: string
  public_metrics: {
    retweet_count: number
    like_count: number
    reply_count: number
    quote_count: number
  }
  attachments?: {
    media_keys: string[]
  }
  referenced_tweets?: Array<{
    type: 'retweeted' | 'quoted' | 'replied_to'
    id: string
  }>
  context_annotations?: Array<{
    domain: {
      id: string
      name: string
      description: string
    }
    entity: {
      id: string
      name: string
      description?: string
    }
  }>
  entities?: {
    hashtags?: Array<{
      start: number
      end: number
      tag: string
    }>
    mentions?: Array<{
      start: number
      end: number
      username: string
      id: string
    }>
    urls?: Array<{
      start: number
      end: number
      url: string
      expanded_url: string
      display_url: string
      status: number
      title?: string
      description?: string
      unwound_url?: string
    }>
  }
}

export interface TwitterMedia {
  media_key: string
  type: 'photo' | 'video' | 'animated_gif'
  url?: string
  preview_image_url?: string
  width?: number
  height?: number
  duration_ms?: number
  public_metrics?: {
    view_count: number
  }
}

export interface TweetComposer {
  text: string
  media_ids?: string[]
  poll?: {
    options: string[]
    duration_minutes: number
  }
  reply_settings?: 'everyone' | 'mentionedUsers' | 'following'
  geo?: {
    place_id: string
  }
}

export interface TwitterAnalytics {
  period: 'day' | 'week' | 'month'
  metrics: {
    impressions: number
    engagements: number
    engagement_rate: number
    retweets: number
    likes: number
    replies: number
    clicks: number
    profile_clicks: number
    followers_gained: number
  }
  top_tweets: TwitterTweet[]
  hashtag_performance: Array<{
    hashtag: string
    usage_count: number
    engagement: number
  }>
}

// =============================================================================
// Enhanced Twitter API Client
// =============================================================================

export class EnhancedTwitterAPI {
  private config: TwitterAPIConfig
  private baseUrl = 'https://api.twitter.com/2'
  private uploadUrl = 'https://upload.twitter.com/1.1/media'

  constructor(config: TwitterAPIConfig) {
    this.config = config
  }

  // =============================================================================
  // Authentication Methods
  // =============================================================================

  async authenticateUser(): Promise<{ auth_url: string; oauth_token: string }> {
    try {
      const response = await fetch('/api/twitter/auth/request-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          callback_url: `${window.location.origin}/api/twitter/auth/callback`
        })
      })

      if (!response.ok) {
        throw new Error('Failed to get request token')
      }

      const data = await response.json()
      return {
        auth_url: `https://api.twitter.com/oauth/authorize?oauth_token=${data.oauth_token}`,
        oauth_token: data.oauth_token
      }
    } catch (error) {
      console.error('Twitter authentication failed:', error)
      throw error
    }
  }

  async verifyCredentials(): Promise<TwitterUser> {
    const response = await this.makeAuthenticatedRequest('/users/me', {
      'user.fields': 'id,username,name,profile_image_url,verified,public_metrics,description,location,url,created_at'
    })

    return response.data
  }

  // =============================================================================
  // Tweet Management
  // =============================================================================

  async postTweet(tweetData: TweetComposer): Promise<TwitterTweet> {
    try {
      const response = await fetch('/api/twitter/tweets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.bearerToken}`
        },
        body: JSON.stringify(tweetData)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to post tweet')
      }

      const data = await response.json()
      return data.data
    } catch (error) {
      console.error('Failed to post tweet:', error)
      throw error
    }
  }

  async deleteTweet(tweetId: string): Promise<{ deleted: boolean }> {
    try {
      const response = await fetch(`/api/twitter/tweets/${tweetId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.config.bearerToken}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to delete tweet')
      }

      const data = await response.json()
      return data.data
    } catch (error) {
      console.error('Failed to delete tweet:', error)
      throw error
    }
  }

  async getTweet(tweetId: string): Promise<TwitterTweet> {
    const response = await this.makeAuthenticatedRequest(`/tweets/${tweetId}`, {
      'tweet.fields': 'id,text,author_id,created_at,public_metrics,attachments,referenced_tweets,context_annotations,entities',
      'user.fields': 'id,username,name,profile_image_url,verified',
      'media.fields': 'media_key,type,url,preview_image_url,width,height',
      'expansions': 'author_id,attachments.media_keys,referenced_tweets.id'
    })

    return response.data
  }

  async getUserTweets(userId: string, maxResults: number = 10): Promise<TwitterTweet[]> {
    const response = await this.makeAuthenticatedRequest(`/users/${userId}/tweets`, {
      'max_results': maxResults.toString(),
      'tweet.fields': 'id,text,author_id,created_at,public_metrics,attachments,entities',
      'expansions': 'attachments.media_keys'
    })

    return response.data || []
  }

  // =============================================================================
  // Media Upload
  // =============================================================================

  async uploadMedia(file: File, mediaType: 'image' | 'video' | 'gif'): Promise<string> {
    try {
      const formData = new FormData()
      formData.append('media', file)
      formData.append('media_category', this.getMediaCategory(mediaType))

      const response = await fetch('/api/twitter/media/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.bearerToken}`
        },
        body: formData
      })

      if (!response.ok) {
        throw new Error('Failed to upload media')
      }

      const data = await response.json()
      return data.media_id_string
    } catch (error) {
      console.error('Media upload failed:', error)
      throw error
    }
  }

  async uploadMultipleMedia(files: File[]): Promise<string[]> {
    const uploadPromises = files.map(file => {
      const mediaType = this.getFileMediaType(file)
      return this.uploadMedia(file, mediaType)
    })

    return Promise.all(uploadPromises)
  }

  private getMediaCategory(type: 'image' | 'video' | 'gif'): string {
    switch (type) {
      case 'image': return 'tweet_image'
      case 'video': return 'tweet_video'
      case 'gif': return 'tweet_gif'
      default: return 'tweet_image'
    }
  }

  private getFileMediaType(file: File): 'image' | 'video' | 'gif' {
    if (file.type.startsWith('image/gif')) return 'gif'
    if (file.type.startsWith('image/')) return 'image'
    if (file.type.startsWith('video/')) return 'video'
    return 'image'
  }

  // =============================================================================
  // Search & Discovery
  // =============================================================================

  async searchTweets(query: string, maxResults: number = 10): Promise<TwitterTweet[]> {
    const response = await this.makeAuthenticatedRequest('/tweets/search/recent', {
      'query': query,
      'max_results': maxResults.toString(),
      'tweet.fields': 'id,text,author_id,created_at,public_metrics,context_annotations,entities',
      'user.fields': 'id,username,name,profile_image_url,verified',
      'expansions': 'author_id'
    })

    return response.data || []
  }

  async getTrendingHashtags(location: string = 'worldwide'): Promise<Array<{
    name: string
    volume: number
    tweet_volume?: number
  }>> {
    try {
      const response = await fetch('/api/twitter/trends', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.config.bearerToken}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to get trending hashtags')
      }

      const data = await response.json()
      return data.trends || []
    } catch (error) {
      console.error('Failed to get trending hashtags:', error)
      return []
    }
  }

  // =============================================================================
  // Analytics & Insights
  // =============================================================================

  async getAnalytics(period: 'day' | 'week' | 'month' = 'week'): Promise<TwitterAnalytics> {
    try {
      const response = await fetch(`/api/twitter/analytics?period=${period}`, {
        headers: {
          'Authorization': `Bearer ${this.config.bearerToken}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to get analytics')
      }

      return await response.json()
    } catch (error) {
      console.error('Failed to get analytics:', error)
      throw error
    }
  }

  async getTweetAnalytics(tweetId: string): Promise<{
    impressions: number
    engagements: number
    likes: number
    retweets: number
    replies: number
    clicks: number
  }> {
    try {
      const response = await fetch(`/api/twitter/tweets/${tweetId}/analytics`, {
        headers: {
          'Authorization': `Bearer ${this.config.bearerToken}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to get tweet analytics')
      }

      return await response.json()
    } catch (error) {
      console.error('Failed to get tweet analytics:', error)
      throw error
    }
  }

  // =============================================================================
  // Game Integration Methods
  // =============================================================================

  async postGameAchievement(achievement: {
    title: string
    description: string
    image?: string
    playerName: string
    score?: number
    nftId?: string
  }): Promise<TwitterTweet> {
    const hashtags = ['#OmniverseGeckos', '#Web3Gaming', '#NFTGaming', '#PlayToEarn']
    
    let tweetText = `🎉 ${achievement.playerName} just unlocked: "${achievement.title}"!\n\n${achievement.description}`
    
    if (achievement.score) {
      tweetText += `\n🏆 Score: ${achievement.score.toLocaleString()}`
    }
    
    if (achievement.nftId) {
      tweetText += `\n🦎 NFT ID: #${achievement.nftId}`
    }
    
    tweetText += `\n\n${hashtags.join(' ')}`
    tweetText += '\n\nPlay now: https://omniversegeckos.com/game'

    const tweetData: TweetComposer = {
      text: tweetText
    }

    if (achievement.image) {
      // Convert image URL to File and upload
      const imageFile = await this.urlToFile(achievement.image, 'achievement.png')
      const mediaId = await this.uploadMedia(imageFile, 'image')
      tweetData.media_ids = [mediaId]
    }

    return this.postTweet(tweetData)
  }

  async postNFTMint(nftData: {
    tokenId: string
    name: string
    rarity: string
    traits: Record<string, string>
    image: string
    owner: string
  }): Promise<TwitterTweet> {
    const rarityEmojis = {
      'Common': '⚪',
      'Uncommon': '🟢',
      'Rare': '🔵',
      'Epic': '🟣',
      'Legendary': '🟡'
    }

    const emoji = rarityEmojis[nftData.rarity as keyof typeof rarityEmojis] || '⚪'
    
    let tweetText = `🦎 NEW GECKO MINTED! ${emoji}\n\n`
    tweetText += `Name: ${nftData.name}\n`
    tweetText += `Rarity: ${nftData.rarity}\n`
    tweetText += `Token ID: #${nftData.tokenId}\n`
    tweetText += `Owner: ${nftData.owner}\n\n`

    // Add top traits
    const topTraits = Object.entries(nftData.traits).slice(0, 3)
    if (topTraits.length > 0) {
      tweetText += `✨ Traits:\n`
      topTraits.forEach(([trait, value]) => {
        tweetText += `• ${trait}: ${value}\n`
      })
      tweetText += '\n'
    }

    tweetText += '#OmniverseGeckos #NFT #Web3Gaming #Blockchain\n\n'
    tweetText += `View on marketplace: https://omniversegeckos.com/nft/${nftData.tokenId}`

    const imageFile = await this.urlToFile(nftData.image, `gecko-${nftData.tokenId}.png`)
    const mediaId = await this.uploadMedia(imageFile, 'image')

    return this.postTweet({
      text: tweetText,
      media_ids: [mediaId]
    })
  }

  async postTournamentUpdate(tournament: {
    name: string
    status: 'starting' | 'ongoing' | 'finished'
    participants?: number
    winner?: string
    prizePool: string
    startTime?: Date
    endTime?: Date
  }): Promise<TwitterTweet> {
    let tweetText = ''
    
    switch (tournament.status) {
      case 'starting':
        tweetText = `🚨 TOURNAMENT STARTING! 🚨\n\n`
        tweetText += `⚔️ ${tournament.name}\n`
        tweetText += `💰 Prize Pool: ${tournament.prizePool}\n`
        tweetText += `👥 Players: ${tournament.participants || 'Open'}\n`
        if (tournament.startTime) {
          tweetText += `⏰ Starts: ${tournament.startTime.toLocaleString()}\n`
        }
        tweetText += `\nJoin now and compete for glory! 🏆`
        break
      
      case 'ongoing':
        tweetText = `⚔️ TOURNAMENT IN PROGRESS ⚔️\n\n`
        tweetText += `🎮 ${tournament.name}\n`
        tweetText += `💰 Prize Pool: ${tournament.prizePool}\n`
        tweetText += `👥 Active Players: ${tournament.participants}\n`
        tweetText += `\nThe battle is heating up! Who will claim victory? 🔥`
        break
      
      case 'finished':
        tweetText = `🏆 TOURNAMENT COMPLETE! 🏆\n\n`
        tweetText += `🎮 ${tournament.name}\n`
        tweetText += `👑 Winner: ${tournament.winner}\n`
        tweetText += `💰 Prize Won: ${tournament.prizePool}\n`
        tweetText += `\nCongratulations to our champion! 🎉`
        break
    }

    tweetText += '\n\n#OmniverseGeckos #Tournament #Web3Gaming #Esports'
    tweetText += '\n\nPlay now: https://omniversegeckos.com/tournaments'

    return this.postTweet({
      text: tweetText
    })
  }

  // =============================================================================
  // Utility Methods
  // =============================================================================

  private async makeAuthenticatedRequest(endpoint: string, params: Record<string, string> = {}): Promise<any> {
    const url = new URL(this.baseUrl + endpoint)
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value)
    })

    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${this.config.bearerToken}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Unknown error' }))
      throw new Error(error.message || `Request failed: ${response.status}`)
    }

    return await response.json()
  }

  private async urlToFile(url: string, filename: string): Promise<File> {
    const response = await fetch(url)
    const blob = await response.blob()
    return new File([blob], filename, { type: blob.type })
  }

  // =============================================================================
  // Webhook Handlers
  // =============================================================================

  async handleMention(tweet: TwitterTweet): Promise<void> {
    // Auto-respond to mentions with game info
    if (tweet.entities?.mentions?.some(mention => mention.username === 'omniversegeckos')) {
      const replyText = `Hey ${tweet.author_id}! 🦎 Thanks for mentioning us!\n\n` +
                       `Check out Omniverse Geckos - the ultimate Web3 tower defense game with NFTs!\n\n` +
                       `🎮 Play: https://omniversegeckos.com/game\n` +
                       `🛒 Marketplace: https://omniversegeckos.com/marketplace\n\n` +
                       `#Web3Gaming #NFTGaming`

      await this.postTweet({
        text: replyText,
        // reply_settings: 'mentionedUsers'
      })
    }
  }

  async processGameEvents(events: Array<{
    type: 'achievement' | 'nft_mint' | 'tournament' | 'high_score'
    data: any
  }>): Promise<TwitterTweet[]> {
    const tweets = []

    for (const event of events) {
      try {
        let tweet: TwitterTweet

        switch (event.type) {
          case 'achievement':
            tweet = await this.postGameAchievement(event.data)
            break
          case 'nft_mint':
            tweet = await this.postNFTMint(event.data)
            break
          case 'tournament':
            tweet = await this.postTournamentUpdate(event.data)
            break
          default:
            continue
        }

        tweets.push(tweet)
      } catch (error) {
        console.error(`Failed to post ${event.type} event:`, error)
      }
    }

    return tweets
  }
}

// =============================================================================
// Singleton Instance
// =============================================================================

let twitterAPIInstance: EnhancedTwitterAPI | null = null

export function getTwitterAPI(config?: TwitterAPIConfig): EnhancedTwitterAPI {
  if (!twitterAPIInstance && config) {
    twitterAPIInstance = new EnhancedTwitterAPI(config)
  }
  
  if (!twitterAPIInstance) {
    throw new Error('Twitter API not initialized. Please provide configuration.')
  }
  
  return twitterAPIInstance
}

// =============================================================================
// React Hook
// =============================================================================

export function useTwitterAPI() {
  try {
    const api = getTwitterAPI()
    return {
      api,
      isAvailable: true,
      error: null
    }
  } catch (error) {
    return {
      api: null,
      isAvailable: false,
      error: error instanceof Error ? error.message : 'Twitter API not available'
    }
  }
}