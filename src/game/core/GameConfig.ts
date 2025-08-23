export const GameConfig = {
  // Game dimensions
  GAME_WIDTH: 1200,
  GAME_HEIGHT: 800,
  TILE_SIZE: 32,

  // Performance settings
  MAX_PARTICLES: 1000,
  MAX_ENTITIES: 200,
  TARGET_FPS: 60,
  
  // Gameplay constants
  INITIAL_LIVES: 20,
  INITIAL_COINS: 100,
  
  // Wave configuration
  WAVES: {
    TOTAL: 50,
    DIFFICULTY_SCALING: 1.2,
    BOSS_WAVES: [10, 20, 30, 40, 50],
  },

  // Enemy types and their properties
  ENEMIES: {
    BASIC: {
      health: 100,
      speed: 50,
      reward: 10,
      color: 0x00ff00,
    },
    FAST: {
      health: 50,
      speed: 100,
      reward: 15,
      color: 0xffff00,
    },
    HEAVY: {
      health: 300,
      speed: 25,
      reward: 30,
      color: 0xff0000,
    },
    FLYING: {
      health: 80,
      speed: 75,
      reward: 20,
      color: 0x00ffff,
      canFly: true,
    },
    BOSS: {
      health: 1000,
      speed: 30,
      reward: 100,
      color: 0xff00ff,
      isBoss: true,
    },
  },

  // Gecko tower types (NFT-based)
  GECKO_TOWERS: {
    FIRE_GECKO: {
      damage: 50,
      range: 100,
      fireRate: 1000, // milliseconds
      cost: 50,
      element: 'fire',
      color: 0xff4500,
      special: 'burn_damage',
    },
    ICE_GECKO: {
      damage: 30,
      range: 80,
      fireRate: 800,
      cost: 40,
      element: 'ice',
      color: 0x87ceeb,
      special: 'slow_effect',
    },
    ELECTRIC_GECKO: {
      damage: 40,
      range: 90,
      fireRate: 600,
      cost: 60,
      element: 'electric',
      color: 0xffff00,
      special: 'chain_lightning',
    },
    POISON_GECKO: {
      damage: 25,
      range: 70,
      fireRate: 1200,
      cost: 45,
      element: 'poison',
      color: 0x9acd32,
      special: 'poison_dot',
    },
    LEGENDARY_GECKO: {
      damage: 100,
      range: 150,
      fireRate: 500,
      cost: 200,
      element: 'cosmic',
      color: 0xff69b4,
      special: 'area_damage',
      rarity: 'legendary',
    },
  },

  // Rarity system
  RARITY: {
    COMMON: {
      color: 0x808080,
      multiplier: 1.0,
      dropChance: 0.6,
    },
    UNCOMMON: {
      color: 0x00ff00,
      multiplier: 1.2,
      dropChance: 0.25,
    },
    RARE: {
      color: 0x0080ff,
      multiplier: 1.5,
      dropChance: 0.1,
    },
    EPIC: {
      color: 0x8000ff,
      multiplier: 2.0,
      dropChance: 0.04,
    },
    LEGENDARY: {
      color: 0xff8000,
      multiplier: 3.0,
      dropChance: 0.01,
    },
  },

  // Power-ups and abilities
  POWERUPS: {
    DAMAGE_BOOST: {
      duration: 10000,
      multiplier: 2.0,
      cost: 100,
    },
    SPEED_BOOST: {
      duration: 15000,
      multiplier: 1.5,
      cost: 80,
    },
    COIN_MULTIPLIER: {
      duration: 30000,
      multiplier: 2.0,
      cost: 150,
    },
    FREEZE_TIME: {
      duration: 5000,
      cost: 200,
    },
  },

  // Audio settings
  AUDIO: {
    MASTER_VOLUME: 0.8,
    SFX_VOLUME: 0.6,
    MUSIC_VOLUME: 0.4,
  },

  // Visual effects
  VFX: {
    PARTICLE_COUNT: 50,
    EXPLOSION_SCALE: 1.5,
    SCREEN_SHAKE_INTENSITY: 5,
    DAMAGE_TEXT_DURATION: 1000,
  },

  // Multiplayer settings
  MULTIPLAYER: {
    MAX_PLAYERS: 4,
    LOBBY_SIZE: 8,
    MATCH_DURATION: 900000, // 15 minutes
  },

  // Blockchain integration
  WEB3: {
    MINT_COST: 0.1, // ETH
    BREEDING_COST: 50, // $GECKO tokens
    MARKETPLACE_FEE: 0.025, // 2.5%
  },

  // AI and difficulty scaling
  AI: {
    DIFFICULTY_CURVE: 'exponential',
    ADAPTIVE_SCALING: true,
    PLAYER_SKILL_TRACKING: true,
  },

  // Performance optimization
  OPTIMIZATION: {
    OBJECT_POOLING: true,
    CULLING_ENABLED: true,
    LOD_SYSTEM: true,
    TEXTURE_COMPRESSION: true,
  },
} as const

// Type definitions for better TypeScript support
export type EnemyType = keyof typeof GameConfig.ENEMIES
export type GeckoType = keyof typeof GameConfig.GECKO_TOWERS
export type RarityType = keyof typeof GameConfig.RARITY
export type PowerupType = keyof typeof GameConfig.POWERUPS

// Helper functions
export const GameUtils = {
  getEnemyConfig: (type: EnemyType) => GameConfig.ENEMIES[type],
  getGeckoConfig: (type: GeckoType) => GameConfig.GECKO_TOWERS[type],
  getRarityConfig: (rarity: RarityType) => GameConfig.RARITY[rarity],
  
  calculateWaveReward: (wave: number): number => {
    return Math.floor(10 * Math.pow(GameConfig.WAVES.DIFFICULTY_SCALING, wave / 5))
  },
  
  calculateEnemyHealth: (baseHealth: number, wave: number): number => {
    return Math.floor(baseHealth * Math.pow(GameConfig.WAVES.DIFFICULTY_SCALING, wave / 3))
  },
  
  isBossWave: (wave: number): boolean => {
    return GameConfig.WAVES.BOSS_WAVES.includes(wave)
  },
  
  getRandomRarity: (): RarityType => {
    const random = Math.random()
    const rarities = Object.entries(GameConfig.RARITY) as [RarityType, any][]
    
    for (const [rarity, config] of rarities.reverse()) {
      if (random <= config.dropChance) {
        return rarity
      }
    }
    
    return 'COMMON'
  },
}