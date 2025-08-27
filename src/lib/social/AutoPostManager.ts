'use client'

import { EnhancedTwitterAPI, type TwitterTweet } from '../twitter/TwitterAPI'
import { toast } from 'sonner'

// =============================================================================
// Types
// =============================================================================

export interface GameEvent {
  id: string
  type: 'achievement' | 'nft_mint' | 'tournament' | 'high_score' | 'level_up' | 'rare_drop' | 'guild_join'
  timestamp: Date
  playerId: string
  playerName: string
  data: any
  processed: boolean
}

export interface AchievementEvent extends GameEvent {
  type: 'achievement'
  data: {
    achievementId: string
    title: string
    description: string
    rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
    points: number
    image?: string
    unlockCondition?: string
  }
}

export interface NFTMintEvent extends GameEvent {
  type: 'nft_mint'
  data: {
    tokenId: string
    name: string
    rarity: string
    traits: Record<string, string>
    image: string
    contractAddress: string
    transactionHash: string
    marketValue?: number
  }
}

export interface TournamentEvent extends GameEvent {
  type: 'tournament'
  data: {
    tournamentId: string
    tournamentName: string
    status: 'starting' | 'ongoing' | 'finished'
    participants: number
    prizePool: string
    playerRank?: number
    isWinner?: boolean
    startTime?: Date
    endTime?: Date
  }
}

export interface HighScoreEvent extends GameEvent {
  type: 'high_score'
  data: {
    gameMode: string
    score: number
    previousRecord?: number
    rank: number
    difficulty: string
    duration: number
    specialModifiers?: string[]
  }
}

export interface LevelUpEvent extends GameEvent {
  type: 'level_up'
  data: {
    oldLevel: number
    newLevel: number
    experience: number
    unlockedFeatures?: string[]
    rewards?: {
      tokens: number
      items: string[]
    }
  }
}

export interface AutoPostSettings {
  enabled: boolean
  achievements: boolean
  nftMints: boolean
  tournaments: boolean
  highScores: boolean
  levelUps: boolean
  rareDrops: boolean
  guildEvents: boolean
  minimumRarity?: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
  minimumScore?: number
  cooldownMinutes: number
  hashtags: string[]
  includeImages: boolean
  includeStats: boolean
  personalizedMessages: boolean
}

export interface PostTemplate {
  type: GameEvent['type']
  templates: {
    title: string[]
    description: string[]
    hashtags: string[]
  }
  conditions?: {
    minRarity?: string
    minScore?: number
    specialTriggers?: string[]
  }
}

// =============================================================================
// Auto Post Manager Class
// =============================================================================

export class AutoPostManager {
  private twitterAPI: EnhancedTwitterAPI
  private settings: AutoPostSettings
  private eventQueue: GameEvent[] = []
  private isProcessing = false
  private lastPostTime = 0
  private templates: PostTemplate[]

  constructor(twitterAPI: EnhancedTwitterAPI, settings: AutoPostSettings) {
    this.twitterAPI = twitterAPI
    this.settings = settings
    this.templates = this.initializeTemplates()
    this.loadEventQueue()
  }

  // =============================================================================
  // Event Processing
  // =============================================================================

  async addEvent(event: GameEvent): Promise<void> {
    // Add event to queue
    this.eventQueue.push({
      ...event,
      id: event.id || this.generateEventId(),
      timestamp: event.timestamp || new Date(),
      processed: false
    })

    // Save queue to localStorage
    this.saveEventQueue()

    // Process queue if auto-posting is enabled
    if (this.settings.enabled) {
      await this.processQueue()
    }
  }

  async processQueue(): Promise<void> {
    if (this.isProcessing || this.eventQueue.length === 0) return

    this.isProcessing = true

    try {
      // Filter unprocessed events
      const unprocessedEvents = this.eventQueue.filter(event => !event.processed)
      
      for (const event of unprocessedEvents) {
        // Check if enough time has passed since last post (cooldown)
        const timeSinceLastPost = Date.now() - this.lastPostTime
        const cooldownMs = this.settings.cooldownMinutes * 60 * 1000

        if (timeSinceLastPost < cooldownMs) {
          console.log(`Skipping event due to cooldown: ${event.type}`)
          continue
        }

        // Check if this event type should be posted
        if (!this.shouldPostEvent(event)) {
          event.processed = true
          continue
        }

        try {
          const tweet = await this.createPostFromEvent(event)
          
          if (tweet) {
            console.log(`Successfully posted ${event.type} event:`, tweet.id)
            event.processed = true
            this.lastPostTime = Date.now()
            
            toast.success(`Posted ${event.type} to Twitter/X!`)
          }
        } catch (error) {
          console.error(`Failed to post ${event.type} event:`, error)
          // Don't mark as processed so it can be retried later
        }

        // Small delay between posts
        await new Promise(resolve => setTimeout(resolve, 2000))
      }

      // Save updated queue
      this.saveEventQueue()

    } finally {
      this.isProcessing = false
    }
  }

  private shouldPostEvent(event: GameEvent): boolean {
    if (!this.settings.enabled) return false

    switch (event.type) {
      case 'achievement':
        if (!this.settings.achievements) return false
        
        const achievement = event as AchievementEvent
        if (this.settings.minimumRarity) {
          const rarityOrder = ['common', 'uncommon', 'rare', 'epic', 'legendary']
          const minIndex = rarityOrder.indexOf(this.settings.minimumRarity)
          const eventIndex = rarityOrder.indexOf(achievement.data.rarity)
          if (eventIndex < minIndex) return false
        }
        return true

      case 'nft_mint':
        return this.settings.nftMints

      case 'tournament':
        return this.settings.tournaments

      case 'high_score':
        if (!this.settings.highScores) return false
        
        const highScore = event as HighScoreEvent
        if (this.settings.minimumScore && highScore.data.score < this.settings.minimumScore) {
          return false
        }
        return true

      case 'level_up':
        return this.settings.levelUps

      case 'rare_drop':
        return this.settings.rareDrops

      case 'guild_join':
        return this.settings.guildEvents

      default:
        return false
    }
  }

  // =============================================================================
  // Post Creation
  // =============================================================================

  private async createPostFromEvent(event: GameEvent): Promise<TwitterTweet | null> {
    const template = this.getTemplateForEvent(event)
    if (!template) return null

    let tweetText = ''
    let mediaIds: string[] = []

    switch (event.type) {
      case 'achievement':
        const achievement = event as AchievementEvent
        tweetText = this.generateAchievementPost(achievement, template)
        
        if (this.settings.includeImages && achievement.data.image) {
          try {
            const mediaId = await this.uploadImageFromUrl(achievement.data.image)
            if (mediaId) mediaIds.push(mediaId)
          } catch (error) {
            console.error('Failed to upload achievement image:', error)
          }
        }
        break

      case 'nft_mint':
        const nftMint = event as NFTMintEvent
        tweetText = this.generateNFTMintPost(nftMint, template)
        
        if (this.settings.includeImages && nftMint.data.image) {
          try {
            const mediaId = await this.uploadImageFromUrl(nftMint.data.image)
            if (mediaId) mediaIds.push(mediaId)
          } catch (error) {
            console.error('Failed to upload NFT image:', error)
          }
        }
        break

      case 'tournament':
        const tournament = event as TournamentEvent
        tweetText = this.generateTournamentPost(tournament, template)
        break

      case 'high_score':
        const highScore = event as HighScoreEvent
        tweetText = this.generateHighScorePost(highScore, template)
        break

      case 'level_up':
        const levelUp = event as LevelUpEvent
        tweetText = this.generateLevelUpPost(levelUp, template)
        break

      default:
        return null
    }

    // Add global hashtags
    if (this.settings.hashtags.length > 0) {
      tweetText += `\n\n${this.settings.hashtags.join(' ')}`
    }

    // Ensure tweet doesn't exceed character limit
    if (tweetText.length > 280) {
      tweetText = tweetText.substring(0, 270) + '...'
    }

    return this.twitterAPI.postTweet({
      text: tweetText,
      media_ids: mediaIds.length > 0 ? mediaIds : undefined
    })
  }

  private generateAchievementPost(event: AchievementEvent, template: PostTemplate): string {
    const rarityEmojis = {
      'common': '⚪',
      'uncommon': '🟢',
      'rare': '🔵',
      'epic': '🟣',
      'legendary': '🟡'
    }

    const emoji = rarityEmojis[event.data.rarity] || '🏆'
    const titleTemplate = this.getRandomTemplate(template.templates.title)
    const descTemplate = this.getRandomTemplate(template.templates.description)

    let post = titleTemplate
      .replace('{emoji}', emoji)
      .replace('{player}', event.playerName)
      .replace('{achievement}', event.data.title)
      .replace('{rarity}', event.data.rarity)

    post += `\n\n${descTemplate
      .replace('{description}', event.data.description)
      .replace('{points}', event.data.points.toString())}`

    if (this.settings.includeStats && event.data.unlockCondition) {
      post += `\n📋 Condition: ${event.data.unlockCondition}`
    }

    return post
  }

  private generateNFTMintPost(event: NFTMintEvent, template: PostTemplate): string {
    const titleTemplate = this.getRandomTemplate(template.templates.title)
    const descTemplate = this.getRandomTemplate(template.templates.description)

    let post = titleTemplate
      .replace('{player}', event.playerName)
      .replace('{nft}', event.data.name)
      .replace('{rarity}', event.data.rarity)
      .replace('{tokenId}', event.data.tokenId)

    post += `\n\n${descTemplate
      .replace('{description}', `A ${event.data.rarity} Gecko NFT`)
      .replace('{tokenId}', event.data.tokenId)}`

    if (this.settings.includeStats) {
      const topTraits = Object.entries(event.data.traits).slice(0, 3)
      if (topTraits.length > 0) {
        post += `\n\n✨ Top Traits:`
        topTraits.forEach(([trait, value]) => {
          post += `\n• ${trait}: ${value}`
        })
      }

      if (event.data.marketValue) {
        post += `\n💰 Est. Value: ${event.data.marketValue} ETH`
      }
    }

    return post
  }

  private generateTournamentPost(event: TournamentEvent, template: PostTemplate): string {
    const titleTemplate = this.getRandomTemplate(template.templates.title)
    const descTemplate = this.getRandomTemplate(template.templates.description)

    let statusEmoji = '⚔️'
    if (event.data.status === 'starting') statusEmoji = '🚨'
    else if (event.data.status === 'finished') statusEmoji = '🏆'

    let post = titleTemplate
      .replace('{emoji}', statusEmoji)
      .replace('{player}', event.playerName)
      .replace('{tournament}', event.data.tournamentName)
      .replace('{status}', event.data.status.toUpperCase())

    post += `\n\n${descTemplate
      .replace('{tournament}', event.data.tournamentName)
      .replace('{prizePool}', event.data.prizePool)
      .replace('{participants}', event.data.participants.toString())}`

    if (this.settings.includeStats) {
      if (event.data.playerRank) {
        post += `\n🏅 Rank: #${event.data.playerRank}`
      }
      
      if (event.data.isWinner) {
        post += `\n👑 WINNER! 🎉`
      }
    }

    return post
  }

  private generateHighScorePost(event: HighScoreEvent, template: PostTemplate): string {
    const titleTemplate = this.getRandomTemplate(template.templates.title)
    const descTemplate = this.getRandomTemplate(template.templates.description)

    let post = titleTemplate
      .replace('{player}', event.playerName)
      .replace('{score}', event.data.score.toLocaleString())
      .replace('{gameMode}', event.data.gameMode)
      .replace('{rank}', event.data.rank.toString())

    post += `\n\n${descTemplate
      .replace('{gameMode}', event.data.gameMode)
      .replace('{score}', event.data.score.toLocaleString())
      .replace('{difficulty}', event.data.difficulty)}`

    if (this.settings.includeStats) {
      post += `\n🎯 Rank: #${event.data.rank}`
      post += `\n⏱️ Duration: ${Math.round(event.data.duration / 60)}m`
      
      if (event.data.previousRecord) {
        const improvement = event.data.score - event.data.previousRecord
        post += `\n📈 +${improvement.toLocaleString()} from previous best`
      }
    }

    return post
  }

  private generateLevelUpPost(event: LevelUpEvent, template: PostTemplate): string {
    const titleTemplate = this.getRandomTemplate(template.templates.title)
    const descTemplate = this.getRandomTemplate(template.templates.description)

    let post = titleTemplate
      .replace('{player}', event.playerName)
      .replace('{level}', event.data.newLevel.toString())
      .replace('{oldLevel}', event.data.oldLevel.toString())

    post += `\n\n${descTemplate
      .replace('{level}', event.data.newLevel.toString())
      .replace('{experience}', event.data.experience.toLocaleString())}`

    if (this.settings.includeStats && event.data.unlockedFeatures && event.data.unlockedFeatures.length > 0) {
      post += `\n\n🔓 Unlocked: ${event.data.unlockedFeatures.join(', ')}`
    }

    if (event.data.rewards) {
      if (event.data.rewards.tokens > 0) {
        post += `\n🪙 Earned: ${event.data.rewards.tokens} GECKO tokens`
      }
    }

    return post
  }

  // =============================================================================
  // Template Management
  // =============================================================================

  private initializeTemplates(): PostTemplate[] {
    return [
      {
        type: 'achievement',
        templates: {
          title: [
            '🏆 {player} just unlocked the "{achievement}" achievement! {emoji}',
            '{emoji} ACHIEVEMENT UNLOCKED! {player} earned "{achievement}"!',
            '🎉 {player} achieved "{achievement}" - {rarity} tier! {emoji}',
            '{emoji} New {rarity} achievement for {player}: "{achievement}"!'
          ],
          description: [
            '{description}',
            'Worth {points} achievement points! {description}',
            '{description} - {points} points earned!',
            'Epic unlock: {description}'
          ],
          hashtags: ['#OmniverseGeckos', '#Achievement', '#Web3Gaming', '#PlayToEarn']
        }
      },
      {
        type: 'nft_mint',
        templates: {
          title: [
            '🦎 {player} just minted a {rarity} Gecko NFT!',
            '✨ NEW MINT: {player} got "{nft}" - Token #{tokenId}!',
            '🔥 {player} minted a {rarity} "{nft}" NFT!',
            '🎨 Fresh mint by {player}: "{nft}" ({rarity})'
          ],
          description: [
            'Token ID #{tokenId} - {description}',
            'Another beautiful addition to the Gecko family! #{tokenId}',
            '{description} - Token #{tokenId}',
            'Welcome to the family, #{tokenId}!'
          ],
          hashtags: ['#OmniverseGeckos', '#NFT', '#GeckoNFT', '#Web3Art']
        }
      },
      {
        type: 'tournament',
        templates: {
          title: [
            '{emoji} TOURNAMENT {status}: {tournament}!',
            '{emoji} {player} in {tournament} - {status}!',
            '⚔️ Tournament Update: {tournament} is {status}!',
            '{emoji} {tournament} competition {status}!'
          ],
          description: [
            'Prize Pool: {prizePool} | Players: {participants}',
            '{participants} warriors competing for {prizePool}!',
            'Battle for {prizePool} with {participants} competitors',
            '{prizePool} up for grabs - {participants} players fighting!'
          ],
          hashtags: ['#OmniverseGeckos', '#Tournament', '#Esports', '#Competition']
        }
      },
      {
        type: 'high_score',
        templates: {
          title: [
            '🎯 NEW HIGH SCORE! {player} scored {score} in {gameMode}!',
            '🔥 {player} crushed it with {score} points! (Rank #{rank})',
            '⚡ INCREDIBLE! {player} hit {score} in {gameMode}!',
            '🏆 {player} dominated {gameMode} with {score} points!'
          ],
          description: [
            'Playing {gameMode} on {difficulty} difficulty',
            '{difficulty} mode conquered with style!',
            'Absolutely demolished the competition in {gameMode}',
            'Pure skill on display in {difficulty} {gameMode}'
          ],
          hashtags: ['#OmniverseGeckos', '#HighScore', '#Gaming', '#SkillBased']
        }
      },
      {
        type: 'level_up',
        templates: {
          title: [
            '📈 LEVEL UP! {player} reached level {level}!',
            '🚀 {player} leveled up from {oldLevel} to {level}!',
            '⬆️ Level {level} achieved by {player}!',
            '✨ {player} advanced to level {level}!'
          ],
          description: [
            'Total experience: {experience}',
            '{experience} XP and counting!',
            'Experience gained: {experience}',
            'Journey continues at {experience} XP'
          ],
          hashtags: ['#OmniverseGeckos', '#LevelUp', '#Progress', '#Gaming']
        }
      }
    ]
  }

  private getTemplateForEvent(event: GameEvent): PostTemplate | null {
    return this.templates.find(template => template.type === event.type) || null
  }

  private getRandomTemplate(templates: string[]): string {
    return templates[Math.floor(Math.random() * templates.length)]
  }

  // =============================================================================
  // Utility Methods
  // =============================================================================

  private async uploadImageFromUrl(imageUrl: string): Promise<string | null> {
    try {
      const response = await fetch(imageUrl)
      const blob = await response.blob()
      const file = new File([blob], 'auto-post-image.png', { type: blob.type })
      
      return await this.twitterAPI.uploadMedia(file, 'image')
    } catch (error) {
      console.error('Failed to upload image from URL:', error)
      return null
    }
  }

  private generateEventId(): string {
    return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private saveEventQueue(): void {
    try {
      localStorage.setItem('autopost_event_queue', JSON.stringify(this.eventQueue))
    } catch (error) {
      console.error('Failed to save event queue:', error)
    }
  }

  private loadEventQueue(): void {
    try {
      const saved = localStorage.getItem('autopost_event_queue')
      if (saved) {
        this.eventQueue = JSON.parse(saved).map((event: any) => ({
          ...event,
          timestamp: new Date(event.timestamp)
        }))
      }
    } catch (error) {
      console.error('Failed to load event queue:', error)
      this.eventQueue = []
    }
  }

  // =============================================================================
  // Public API
  // =============================================================================

  updateSettings(newSettings: Partial<AutoPostSettings>): void {
    this.settings = { ...this.settings, ...newSettings }
    localStorage.setItem('autopost_settings', JSON.stringify(this.settings))
  }

  getSettings(): AutoPostSettings {
    return { ...this.settings }
  }

  getEventQueue(): GameEvent[] {
    return [...this.eventQueue]
  }

  clearProcessedEvents(): void {
    this.eventQueue = this.eventQueue.filter(event => !event.processed)
    this.saveEventQueue()
  }

  async retryFailedPosts(): Promise<void> {
    const failedEvents = this.eventQueue.filter(event => !event.processed)
    
    for (const event of failedEvents) {
      try {
        await this.addEvent(event)
      } catch (error) {
        console.error('Retry failed for event:', event.id, error)
      }
    }
  }

  getPostingStats(): {
    totalEvents: number
    processedEvents: number
    pendingEvents: number
    lastPostTime: Date | null
  } {
    const totalEvents = this.eventQueue.length
    const processedEvents = this.eventQueue.filter(e => e.processed).length
    const pendingEvents = totalEvents - processedEvents

    return {
      totalEvents,
      processedEvents,
      pendingEvents,
      lastPostTime: this.lastPostTime > 0 ? new Date(this.lastPostTime) : null
    }
  }
}

// =============================================================================
// React Hook
// =============================================================================

export function useAutoPostManager() {
  const [manager, setManager] = useState<AutoPostManager | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    const initManager = async () => {
      try {
        // This would be initialized with proper Twitter API instance
        // For now, we'll return a placeholder
        setIsInitialized(true)
      } catch (error) {
        console.error('Failed to initialize AutoPostManager:', error)
      }
    }

    initManager()
  }, [])

  return {
    manager,
    isInitialized,
    // Helper methods would go here
  }
}