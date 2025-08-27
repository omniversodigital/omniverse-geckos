'use client'

import { DiscordAPI, BotCommand, CommandOption, DiscordEmbed } from './DiscordAPI'

export interface GameStats {
  level: number
  score: number
  geckosOwned: number
  totalValue: string
  rank: number
  achievements: string[]
}

export interface PlayerProfile {
  address: string
  username: string
  level: number
  xp: number
  geckosOwned: number
  totalEarnings: string
  joinedDate: string
  lastActive: string
}

export interface TournamentInfo {
  id: string
  name: string
  description: string
  startTime: string
  endTime: string
  prizePool: string
  maxPlayers: number
  currentPlayers: number
  entryFee: string
  status: 'upcoming' | 'active' | 'completed'
}

export interface NFTInfo {
  tokenId: string
  name: string
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary' | 'Mythic'
  level: number
  power: number
  defense: number
  speed: number
  imageUrl: string
  marketValue: string
  owner: string
}

export class DiscordBotCommands {
  private discordAPI: DiscordAPI

  constructor(discordAPI: DiscordAPI) {
    this.discordAPI = discordAPI
  }

  createCommands(): BotCommand[] {
    return [
      {
        name: 'stats',
        description: 'View your Omniverse Geckos game statistics',
        options: [
          {
            type: 6, // USER type
            name: 'user',
            description: 'User to view stats for (optional)',
            required: false
          }
        ]
      },
      {
        name: 'leaderboard',
        description: 'View the top players leaderboard',
        options: [
          {
            type: 4, // INTEGER type
            name: 'limit',
            description: 'Number of players to show (1-25)',
            required: false,
            choices: [
              { name: 'Top 5', value: 5 },
              { name: 'Top 10', value: 10 },
              { name: 'Top 25', value: 25 }
            ]
          }
        ]
      },
      {
        name: 'gecko',
        description: 'View information about your Geckos',
        options: [
          {
            type: 1, // SUB_COMMAND type
            name: 'list',
            description: 'List all your Geckos'
          },
          {
            type: 1, // SUB_COMMAND type
            name: 'info',
            description: 'Get detailed info about a specific Gecko',
            options: [
              {
                type: 4, // INTEGER type
                name: 'token_id',
                description: 'Token ID of the Gecko',
                required: true
              }
            ]
          },
          {
            type: 1, // SUB_COMMAND type
            name: 'compare',
            description: 'Compare two Geckos',
            options: [
              {
                type: 4, // INTEGER type
                name: 'gecko1',
                description: 'First Gecko token ID',
                required: true
              },
              {
                type: 4, // INTEGER type
                name: 'gecko2',
                description: 'Second Gecko token ID',
                required: true
              }
            ]
          }
        ]
      },
      {
        name: 'tournament',
        description: 'Tournament information and management',
        options: [
          {
            type: 1, // SUB_COMMAND type
            name: 'list',
            description: 'List active tournaments'
          },
          {
            type: 1, // SUB_COMMAND type
            name: 'join',
            description: 'Join a tournament',
            options: [
              {
                type: 3, // STRING type
                name: 'tournament_id',
                description: 'Tournament ID to join',
                required: true
              }
            ]
          },
          {
            type: 1, // SUB_COMMAND type
            name: 'info',
            description: 'Get detailed tournament information',
            options: [
              {
                type: 3, // STRING type
                name: 'tournament_id',
                description: 'Tournament ID to view',
                required: true
              }
            ]
          }
        ]
      },
      {
        name: 'market',
        description: 'NFT marketplace commands',
        options: [
          {
            type: 1, // SUB_COMMAND type
            name: 'list',
            description: 'View your NFTs listed for sale'
          },
          {
            type: 1, // SUB_COMMAND type
            name: 'price',
            description: 'Check floor price for Gecko NFTs',
            options: [
              {
                type: 3, // STRING type
                name: 'rarity',
                description: 'Rarity to check price for',
                required: false,
                choices: [
                  { name: 'Common', value: 'common' },
                  { name: 'Rare', value: 'rare' },
                  { name: 'Epic', value: 'epic' },
                  { name: 'Legendary', value: 'legendary' },
                  { name: 'Mythic', value: 'mythic' }
                ]
              }
            ]
          },
          {
            type: 1, // SUB_COMMAND type
            name: 'recent',
            description: 'View recent marketplace sales'
          }
        ]
      },
      {
        name: 'help',
        description: 'Get help with bot commands and game features',
        options: [
          {
            type: 3, // STRING type
            name: 'topic',
            description: 'Specific topic to get help with',
            required: false,
            choices: [
              { name: 'Getting Started', value: 'getting_started' },
              { name: 'Gameplay', value: 'gameplay' },
              { name: 'NFTs', value: 'nfts' },
              { name: 'Tournaments', value: 'tournaments' },
              { name: 'Marketplace', value: 'marketplace' }
            ]
          }
        ]
      },
      {
        name: 'rewards',
        description: 'View and claim your rewards',
        options: [
          {
            type: 1, // SUB_COMMAND type
            name: 'balance',
            description: 'Check your GECKO token balance'
          },
          {
            type: 1, // SUB_COMMAND type
            name: 'claim',
            description: 'Claim pending rewards'
          },
          {
            type: 1, // SUB_COMMAND type
            name: 'history',
            description: 'View your reward history'
          }
        ]
      }
    ]
  }

  async handleStatsCommand(userId: string, targetUserId?: string): Promise<DiscordEmbed> {
    try {
      const stats = await this.getUserStats(targetUserId || userId)
      const isOwnStats = !targetUserId || targetUserId === userId

      return this.discordAPI.createEmbed({
        title: `🦎 ${isOwnStats ? 'Your' : 'Player'} Game Statistics`,
        description: isOwnStats ? 
          'Here are your current game statistics:' : 
          `Statistics for <@${targetUserId}>:`,
        color: 0x00ff88,
        fields: [
          {
            name: '📊 Level & Experience',
            value: `Level: **${stats.level}**\nRank: **#${stats.rank}**\nScore: **${stats.score.toLocaleString()}**`,
            inline: true
          },
          {
            name: '🦎 Gecko Collection',
            value: `Geckos Owned: **${stats.geckosOwned}**\nTotal Value: **${stats.totalValue}**`,
            inline: true
          },
          {
            name: '🏆 Achievements',
            value: stats.achievements.length > 0 ? 
              stats.achievements.slice(0, 3).join('\n') + 
              (stats.achievements.length > 3 ? `\n+${stats.achievements.length - 3} more` : '') :
              'No achievements yet',
            inline: true
          }
        ],
        footer: {
          text: 'Use /gecko list to see your Gecko collection'
        },
        timestamp: true
      })
    } catch (error) {
      return this.createErrorEmbed('Failed to fetch user statistics')
    }
  }

  async handleLeaderboardCommand(limit = 10): Promise<DiscordEmbed> {
    try {
      const leaderboard = await this.getLeaderboard(limit)

      const leaderboardText = leaderboard.map((player, index) => 
        `**${index + 1}.** <@${player.address}> - Level ${player.level} (${player.totalEarnings})`
      ).join('\n')

      return this.discordAPI.createEmbed({
        title: '🏆 Omniverse Geckos Leaderboard',
        description: `Top ${limit} players by level and earnings:`,
        color: 0xffd700,
        fields: [
          {
            name: 'Rankings',
            value: leaderboardText || 'No players found',
            inline: false
          }
        ],
        footer: {
          text: 'Rankings updated in real-time'
        },
        timestamp: true
      })
    } catch (error) {
      return this.createErrorEmbed('Failed to fetch leaderboard data')
    }
  }

  async handleGeckoListCommand(userId: string): Promise<DiscordEmbed> {
    try {
      const geckos = await this.getUserGeckos(userId)

      if (geckos.length === 0) {
        return this.discordAPI.createEmbed({
          title: '🦎 Your Gecko Collection',
          description: 'You don\'t own any Geckos yet! Visit the marketplace to get your first Gecko.',
          color: 0xff6b6b,
          fields: [
            {
              name: '🎮 How to Get Started',
              value: '• Play games to earn GECKO tokens\n• Visit the marketplace to buy Geckos\n• Mint new Geckos with earned tokens',
              inline: false
            }
          ]
        })
      }

      const geckoList = geckos.slice(0, 10).map(gecko => 
        `**#${gecko.tokenId}** ${gecko.name} (${gecko.rarity})\nPower: ${gecko.power} | Defense: ${gecko.defense} | Speed: ${gecko.speed}`
      ).join('\n\n')

      return this.discordAPI.createEmbed({
        title: '🦎 Your Gecko Collection',
        description: `You own **${geckos.length}** Gecko${geckos.length !== 1 ? 's' : ''}:`,
        color: 0x00ff88,
        fields: [
          {
            name: 'Your Geckos',
            value: geckoList + (geckos.length > 10 ? `\n\n*...and ${geckos.length - 10} more*` : ''),
            inline: false
          }
        ],
        footer: {
          text: 'Use /gecko info <token_id> to see detailed stats'
        },
        timestamp: true
      })
    } catch (error) {
      return this.createErrorEmbed('Failed to fetch your Gecko collection')
    }
  }

  async handleGeckoInfoCommand(userId: string, tokenId: number): Promise<DiscordEmbed> {
    try {
      const gecko = await this.getGeckoInfo(tokenId)
      
      if (!gecko) {
        return this.createErrorEmbed(`Gecko with token ID ${tokenId} not found`)
      }

      const isOwner = gecko.owner.toLowerCase() === userId.toLowerCase()

      return this.discordAPI.createEmbed({
        title: `🦎 ${gecko.name} #${gecko.tokenId}`,
        description: `${gecko.rarity} Gecko ${isOwner ? '(You own this!)' : `(Owned by <@${gecko.owner}>)`}`,
        color: this.getRarityColor(gecko.rarity),
        fields: [
          {
            name: '⚔️ Combat Stats',
            value: `Power: **${gecko.power}**\nDefense: **${gecko.defense}**\nSpeed: **${gecko.speed}**`,
            inline: true
          },
          {
            name: '📈 Progression',
            value: `Level: **${gecko.level}**\nRarity: **${gecko.rarity}**`,
            inline: true
          },
          {
            name: '💰 Market Value',
            value: `Current Value: **${gecko.marketValue}**`,
            inline: true
          }
        ],
        image: { url: gecko.imageUrl },
        footer: {
          text: `Token ID: ${gecko.tokenId}`
        },
        timestamp: true
      })
    } catch (error) {
      return this.createErrorEmbed(`Failed to fetch information for Gecko #${tokenId}`)
    }
  }

  async handleTournamentListCommand(): Promise<DiscordEmbed> {
    try {
      const tournaments = await this.getActiveTournaments()

      if (tournaments.length === 0) {
        return this.discordAPI.createEmbed({
          title: '⚔️ Active Tournaments',
          description: 'No active tournaments at the moment. Check back soon!',
          color: 0x666666,
          footer: {
            text: 'New tournaments are announced regularly'
          }
        })
      }

      const tournamentList = tournaments.map(tournament => 
        `**${tournament.name}**\nPrize Pool: ${tournament.prizePool}\nPlayers: ${tournament.currentPlayers}/${tournament.maxPlayers}\nStatus: ${tournament.status.toUpperCase()}`
      ).join('\n\n')

      return this.discordAPI.createEmbed({
        title: '⚔️ Active Tournaments',
        description: `${tournaments.length} tournament${tournaments.length !== 1 ? 's' : ''} available:`,
        color: 0xff4757,
        fields: [
          {
            name: 'Tournaments',
            value: tournamentList,
            inline: false
          }
        ],
        footer: {
          text: 'Use /tournament join <id> to participate'
        },
        timestamp: true
      })
    } catch (error) {
      return this.createErrorEmbed('Failed to fetch tournament information')
    }
  }

  async handleHelpCommand(topic?: string): Promise<DiscordEmbed> {
    const baseEmbed = {
      title: '🦎 Omniverse Geckos Help',
      color: 0x00ff88,
      footer: {
        text: 'Need more help? Join our support channel!'
      },
      timestamp: true
    }

    switch (topic) {
      case 'getting_started':
        return this.discordAPI.createEmbed({
          ...baseEmbed,
          title: '🚀 Getting Started Guide',
          description: 'Welcome to Omniverse Geckos! Here\'s how to get started:',
          fields: [
            {
              name: '1. Connect Your Wallet',
              value: 'Connect your Web3 wallet to start playing and earning',
              inline: false
            },
            {
              name: '2. Play Games',
              value: 'Complete levels to earn GECKO tokens and experience',
              inline: false
            },
            {
              name: '3. Collect Geckos',
              value: 'Use earned tokens to mint or buy unique Gecko NFTs',
              inline: false
            },
            {
              name: '4. Join Tournaments',
              value: 'Compete with other players for bigger rewards',
              inline: false
            }
          ]
        })

      case 'gameplay':
        return this.discordAPI.createEmbed({
          ...baseEmbed,
          title: '🎮 Gameplay Guide',
          description: 'Master the art of tower defense with your Gecko army!',
          fields: [
            {
              name: 'Tower Defense',
              value: 'Place your Geckos strategically to defend against waves of enemies',
              inline: false
            },
            {
              name: 'Gecko Types',
              value: 'Each Gecko has unique abilities: Damage, Defense, Speed, and Special Skills',
              inline: false
            },
            {
              name: 'Leveling Up',
              value: 'Win battles to gain XP and level up your Geckos for better stats',
              inline: false
            }
          ]
        })

      default:
        return this.discordAPI.createEmbed({
          ...baseEmbed,
          description: 'Available bot commands and features:',
          fields: [
            {
              name: '📊 Player Commands',
              value: '`/stats` - View your game statistics\n`/leaderboard` - See top players\n`/rewards` - Check and claim rewards',
              inline: false
            },
            {
              name: '🦎 Gecko Commands',
              value: '`/gecko list` - View your collection\n`/gecko info` - Detailed Gecko stats\n`/gecko compare` - Compare two Geckos',
              inline: false
            },
            {
              name: '⚔️ Tournament Commands',
              value: '`/tournament list` - Active tournaments\n`/tournament join` - Join a tournament\n`/tournament info` - Tournament details',
              inline: false
            },
            {
              name: '💰 Market Commands',
              value: '`/market list` - Your listings\n`/market price` - Check floor prices\n`/market recent` - Recent sales',
              inline: false
            }
          ]
        })
    }
  }

  private createErrorEmbed(message: string): DiscordEmbed {
    return {
      title: '❌ Error',
      description: message,
      color: 0xff0000,
      footer: {
        text: 'If this error persists, please contact support'
      },
      timestamp: new Date().toISOString()
    }
  }

  private getRarityColor(rarity: string): number {
    switch (rarity.toLowerCase()) {
      case 'common': return 0x808080
      case 'rare': return 0x0070dd
      case 'epic': return 0xa335ee
      case 'legendary': return 0xff8000
      case 'mythic': return 0xe6cc80
      default: return 0x00ff88
    }
  }

  private async getUserStats(userId: string): Promise<GameStats> {
    return {
      level: 15,
      score: 125000,
      geckosOwned: 8,
      totalValue: '2.5 ETH',
      rank: 127,
      achievements: [
        '🏆 First Victory',
        '🦎 Gecko Collector',
        '⚔️ Tournament Fighter'
      ]
    }
  }

  private async getLeaderboard(limit: number): Promise<PlayerProfile[]> {
    return Array.from({ length: Math.min(limit, 25) }, (_, i) => ({
      address: `user${i + 1}`,
      username: `Player${i + 1}`,
      level: 50 - i,
      xp: (50 - i) * 1000,
      geckosOwned: 10 - Math.floor(i / 3),
      totalEarnings: `${(10 - i * 0.5).toFixed(1)} ETH`,
      joinedDate: '2024-01-01',
      lastActive: '2024-08-27'
    }))
  }

  private async getUserGeckos(userId: string): Promise<NFTInfo[]> {
    return [
      {
        tokenId: '1001',
        name: 'Fire Gecko',
        rarity: 'Rare',
        level: 15,
        power: 85,
        defense: 70,
        speed: 90,
        imageUrl: 'https://example.com/gecko1.png',
        marketValue: '0.5 ETH',
        owner: userId
      }
    ]
  }

  private async getGeckoInfo(tokenId: number): Promise<NFTInfo | null> {
    return {
      tokenId: tokenId.toString(),
      name: 'Lightning Gecko',
      rarity: 'Epic',
      level: 20,
      power: 95,
      defense: 80,
      speed: 100,
      imageUrl: 'https://example.com/gecko2.png',
      marketValue: '1.2 ETH',
      owner: 'user123'
    }
  }

  private async getActiveTournaments(): Promise<TournamentInfo[]> {
    return [
      {
        id: 'tournament_001',
        name: 'Gecko Wars Championship',
        description: 'Battle for the ultimate prize pool!',
        startTime: '2024-08-30T18:00:00Z',
        endTime: '2024-08-30T22:00:00Z',
        prizePool: '50 ETH',
        maxPlayers: 100,
        currentPlayers: 67,
        entryFee: '0.1 ETH',
        status: 'upcoming'
      }
    ]
  }
}