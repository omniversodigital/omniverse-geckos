'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

// =============================================================================
// Game State Types
// =============================================================================

export interface GeckoTowerStats {
  damage: number
  range: number
  fireRate: number
  level: number
  experience: number
  upgrades: string[]
}

export interface PlacedTower {
  id: string
  tokenId: string
  position: { x: number; y: number }
  stats: GeckoTowerStats
  isActive: boolean
  cooldownRemaining: number
}

export interface Enemy {
  id: string
  type: string
  health: number
  maxHealth: number
  position: { x: number; y: number }
  speed: number
  reward: number
  effects: Array<{
    type: string
    duration: number
    strength: number
  }>
}

export interface GameLevel {
  id: number
  name: string
  difficulty: 'easy' | 'medium' | 'hard' | 'expert'
  waves: number
  completed: boolean
  stars: number
  bestScore: number
  rewards: {
    experience: number
    tokens: number
    items?: string[]
  }
}

export interface PlayerStats {
  totalGamesPlayed: number
  totalWins: number
  totalLosses: number
  bestScore: number
  totalTokensEarned: number
  totalExperienceGained: number
  currentLevel: number
  currentExperience: number
  experienceToNext: number
  achievements: string[]
  streaks: {
    current: number
    best: number
  }
}

export interface GameSession {
  id: string
  levelId: number
  startTime: number
  endTime?: number
  score: number
  wave: number
  lives: number
  maxLives: number
  tokensEarned: number
  experienceEarned: number
  towersPlaced: PlacedTower[]
  enemies: Enemy[]
  isPaused: boolean
  isGameOver: boolean
  victory: boolean
  statistics: {
    enemiesKilled: number
    damageDealt: number
    towersUsed: number
    wavesSurvived: number
  }
}

export interface GamePreferences {
  soundEnabled: boolean
  musicEnabled: boolean
  soundVolume: number
  musicVolume: number
  graphicsQuality: 'low' | 'medium' | 'high'
  showDamageNumbers: boolean
  showRangeIndicators: boolean
  autoSave: boolean
  pauseOnBlur: boolean
  showTooltips: boolean
}

export interface GameState {
  // Session Management
  currentSession: GameSession | null
  isPlaying: boolean
  isLoading: boolean
  
  // Player Data
  playerStats: PlayerStats
  unlockedLevels: GameLevel[]
  preferences: GamePreferences
  
  // Game Data
  availableTowers: string[] // NFT token IDs
  inventory: Array<{
    id: string
    type: string
    quantity: number
  }>
  
  // UI State
  selectedTower: string | null
  hoveredPosition: { x: number; y: number } | null
  showUpgradeMenu: boolean
  activeMenus: string[]
  
  // Performance
  lastSaved: number
  autoSaveEnabled: boolean
}

// =============================================================================
// Game Actions
// =============================================================================

export interface GameActions {
  // Session Management
  startGame: (levelId: number, towers: string[]) => void
  pauseGame: () => void
  resumeGame: () => void
  endGame: (victory: boolean) => void
  restartGame: () => void
  
  // Tower Management
  placeTower: (tokenId: string, position: { x: number; y: number }) => boolean
  removeTower: (towerId: string) => void
  upgradeTower: (towerId: string, upgradeType: string) => boolean
  selectTower: (towerId: string | null) => void
  
  // Game Updates
  updateWave: (wave: number, enemies: Enemy[]) => void
  updateScore: (score: number) => void
  updateLives: (lives: number) => void
  addExperience: (amount: number) => void
  addTokens: (amount: number) => void
  
  // Enemy Management
  spawnEnemy: (enemy: Omit<Enemy, 'id'>) => void
  updateEnemy: (enemyId: string, updates: Partial<Enemy>) => void
  removeEnemy: (enemyId: string) => void
  applyEffectToEnemy: (enemyId: string, effect: Enemy['effects'][0]) => void
  
  // Level Management
  unlockLevel: (levelId: number) => void
  updateLevelProgress: (levelId: number, stats: Partial<GameLevel>) => void
  
  // Achievements and Progress
  unlockAchievement: (achievementId: string) => void
  updatePlayerStats: (stats: Partial<PlayerStats>) => void
  
  // Preferences
  updatePreferences: (prefs: Partial<GamePreferences>) => void
  
  // Persistence
  saveGame: () => Promise<void>
  loadGame: () => Promise<void>
  resetProgress: () => void
  
  // UI State
  setHoveredPosition: (pos: { x: number; y: number } | null) => void
  toggleMenu: (menuId: string) => void
  closeAllMenus: () => void
}

// =============================================================================
// Initial State
// =============================================================================

const initialPlayerStats: PlayerStats = {
  totalGamesPlayed: 0,
  totalWins: 0,
  totalLosses: 0,
  bestScore: 0,
  totalTokensEarned: 0,
  totalExperienceGained: 0,
  currentLevel: 1,
  currentExperience: 0,
  experienceToNext: 100,
  achievements: [],
  streaks: { current: 0, best: 0 }
}

const initialPreferences: GamePreferences = {
  soundEnabled: true,
  musicEnabled: true,
  soundVolume: 0.7,
  musicVolume: 0.5,
  graphicsQuality: 'medium',
  showDamageNumbers: true,
  showRangeIndicators: true,
  autoSave: true,
  pauseOnBlur: true,
  showTooltips: true
}

const initialState: GameState = {
  currentSession: null,
  isPlaying: false,
  isLoading: false,
  playerStats: initialPlayerStats,
  unlockedLevels: [],
  preferences: initialPreferences,
  availableTowers: [],
  inventory: [],
  selectedTower: null,
  hoveredPosition: null,
  showUpgradeMenu: false,
  activeMenus: [],
  lastSaved: Date.now(),
  autoSaveEnabled: true
}

// =============================================================================
// Zustand Store with Persistence and Immer
// =============================================================================

export const useGameStore = create<GameState & GameActions>()(
  persist(
    immer((set, get) => ({
      // Initial State
      ...initialState,
      
      // Session Management
      startGame: (levelId: number, towers: string[]) => {
        set(state => {
          const level = state.unlockedLevels.find(l => l.id === levelId)
          if (!level) return
          
          const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
          
          state.currentSession = {
            id: sessionId,
            levelId,
            startTime: Date.now(),
            score: 0,
            wave: 1,
            lives: 20,
            maxLives: 20,
            tokensEarned: 0,
            experienceEarned: 0,
            towersPlaced: [],
            enemies: [],
            isPaused: false,
            isGameOver: false,
            victory: false,
            statistics: {
              enemiesKilled: 0,
              damageDealt: 0,
              towersUsed: towers.length,
              wavesSurvived: 0
            }
          }
          
          state.availableTowers = towers
          state.isPlaying = true
          state.playerStats.totalGamesPlayed++
        })
      },
      
      pauseGame: () => {
        set(state => {
          if (state.currentSession) {
            state.currentSession.isPaused = true
          }
        })
      },
      
      resumeGame: () => {
        set(state => {
          if (state.currentSession) {
            state.currentSession.isPaused = false
          }
        })
      },
      
      endGame: (victory: boolean) => {
        set(state => {
          if (!state.currentSession) return
          
          state.currentSession.endTime = Date.now()
          state.currentSession.isGameOver = true
          state.currentSession.victory = victory
          state.isPlaying = false
          
          // Update player stats
          if (victory) {
            state.playerStats.totalWins++
            state.playerStats.streaks.current++
            if (state.playerStats.streaks.current > state.playerStats.streaks.best) {
              state.playerStats.streaks.best = state.playerStats.streaks.current
            }
          } else {
            state.playerStats.totalLosses++
            state.playerStats.streaks.current = 0
          }
          
          if (state.currentSession.score > state.playerStats.bestScore) {
            state.playerStats.bestScore = state.currentSession.score
          }
          
          state.playerStats.totalTokensEarned += state.currentSession.tokensEarned
          state.playerStats.totalExperienceGained += state.currentSession.experienceEarned
          
          // Update level progress
          const level = state.unlockedLevels.find(l => l.id === state.currentSession!.levelId)
          if (level && victory) {
            level.completed = true
            if (state.currentSession.score > level.bestScore) {
              level.bestScore = state.currentSession.score
            }
            
            // Calculate stars based on performance
            const scoreThreshold = 1000 // Base score for 1 star
            let stars = 1
            if (state.currentSession.score >= scoreThreshold * 2) stars = 2
            if (state.currentSession.score >= scoreThreshold * 3) stars = 3
            
            if (stars > level.stars) {
              level.stars = stars
            }
          }
        })
      },
      
      restartGame: () => {
        const { currentSession } = get()
        if (currentSession) {
          const { levelId } = currentSession
          const { availableTowers } = get()
          get().startGame(levelId, availableTowers)
        }
      },
      
      // Tower Management
      placeTower: (tokenId: string, position: { x: number; y: number }) => {
        let success = false
        set(state => {
          if (!state.currentSession || !state.availableTowers.includes(tokenId)) {
            return
          }
          
          // Check if position is valid (not overlapping with existing towers)
          const isValidPosition = !state.currentSession.towersPlaced.some(tower => {
            const distance = Math.sqrt(
              Math.pow(tower.position.x - position.x, 2) +
              Math.pow(tower.position.y - position.y, 2)
            )
            return distance < 50 // Minimum distance between towers
          })
          
          if (!isValidPosition) return
          
          const towerId = `tower_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`
          
          // Get tower stats based on NFT (mock implementation)
          const stats: GeckoTowerStats = {
            damage: 50 + Math.random() * 50,
            range: 100 + Math.random() * 50,
            fireRate: 1000 + Math.random() * 500,
            level: 1,
            experience: 0,
            upgrades: []
          }
          
          const tower: PlacedTower = {
            id: towerId,
            tokenId,
            position,
            stats,
            isActive: true,
            cooldownRemaining: 0
          }
          
          state.currentSession.towersPlaced.push(tower)
          success = true
        })
        
        return success
      },
      
      removeTower: (towerId: string) => {
        set(state => {
          if (!state.currentSession) return
          
          state.currentSession.towersPlaced = state.currentSession.towersPlaced.filter(
            tower => tower.id !== towerId
          )
        })
      },
      
      upgradeTower: (towerId: string, upgradeType: string) => {
        let success = false
        set(state => {
          if (!state.currentSession) return
          
          const tower = state.currentSession.towersPlaced.find(t => t.id === towerId)
          if (!tower) return
          
          // Apply upgrade based on type
          switch (upgradeType) {
            case 'damage':
              tower.stats.damage *= 1.5
              break
            case 'range':
              tower.stats.range *= 1.3
              break
            case 'speed':
              tower.stats.fireRate *= 0.8 // Lower fire rate = faster shooting
              break
          }
          
          tower.stats.upgrades.push(upgradeType)
          success = true
        })
        
        return success
      },
      
      selectTower: (towerId: string | null) => {
        set(state => {
          state.selectedTower = towerId
        })
      },
      
      // Game Updates
      updateWave: (wave: number, enemies: Enemy[]) => {
        set(state => {
          if (!state.currentSession) return
          
          state.currentSession.wave = wave
          state.currentSession.enemies = enemies
          state.currentSession.statistics.wavesSurvived = Math.max(
            state.currentSession.statistics.wavesSurvived,
            wave - 1
          )
        })
      },
      
      updateScore: (score: number) => {
        set(state => {
          if (state.currentSession) {
            state.currentSession.score = score
          }
        })
      },
      
      updateLives: (lives: number) => {
        set(state => {
          if (state.currentSession) {
            state.currentSession.lives = Math.max(0, lives)
            
            // End game if no lives remaining
            if (lives <= 0) {
              get().endGame(false)
            }
          }
        })
      },
      
      addExperience: (amount: number) => {
        set(state => {
          if (state.currentSession) {
            state.currentSession.experienceEarned += amount
          }
          
          state.playerStats.currentExperience += amount
          
          // Level up if enough experience
          while (state.playerStats.currentExperience >= state.playerStats.experienceToNext) {
            state.playerStats.currentExperience -= state.playerStats.experienceToNext
            state.playerStats.currentLevel++
            state.playerStats.experienceToNext = Math.floor(
              state.playerStats.experienceToNext * 1.2
            )
          }
        })
      },
      
      addTokens: (amount: number) => {
        set(state => {
          if (state.currentSession) {
            state.currentSession.tokensEarned += amount
          }
        })
      },
      
      // Enemy Management
      spawnEnemy: (enemyData: Omit<Enemy, 'id'>) => {
        set(state => {
          if (!state.currentSession) return
          
          const enemy: Enemy = {
            ...enemyData,
            id: `enemy_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`
          }
          
          state.currentSession.enemies.push(enemy)
        })
      },
      
      updateEnemy: (enemyId: string, updates: Partial<Enemy>) => {
        set(state => {
          if (!state.currentSession) return
          
          const enemyIndex = state.currentSession.enemies.findIndex(e => e.id === enemyId)
          if (enemyIndex >= 0) {
            Object.assign(state.currentSession.enemies[enemyIndex], updates)
          }
        })
      },
      
      removeEnemy: (enemyId: string) => {
        set(state => {
          if (!state.currentSession) return
          
          const enemyIndex = state.currentSession.enemies.findIndex(e => e.id === enemyId)
          if (enemyIndex >= 0) {
            const enemy = state.currentSession.enemies[enemyIndex]
            state.currentSession.enemies.splice(enemyIndex, 1)
            state.currentSession.statistics.enemiesKilled++
            
            // Add rewards
            get().addTokens(enemy.reward)
            get().addExperience(enemy.reward * 2)
            get().updateScore(state.currentSession.score + enemy.reward * 10)
          }
        })
      },
      
      applyEffectToEnemy: (enemyId: string, effect: Enemy['effects'][0]) => {
        set(state => {
          if (!state.currentSession) return
          
          const enemy = state.currentSession.enemies.find(e => e.id === enemyId)
          if (enemy) {
            enemy.effects.push(effect)
          }
        })
      },
      
      // Level Management
      unlockLevel: (levelId: number) => {
        set(state => {
          if (!state.unlockedLevels.some(l => l.id === levelId)) {
            const level: GameLevel = {
              id: levelId,
              name: `Level ${levelId}`,
              difficulty: levelId <= 5 ? 'easy' : levelId <= 10 ? 'medium' : levelId <= 15 ? 'hard' : 'expert',
              waves: 10 + levelId * 2,
              completed: false,
              stars: 0,
              bestScore: 0,
              rewards: {
                experience: 100 * levelId,
                tokens: 50 * levelId
              }
            }
            
            state.unlockedLevels.push(level)
            state.unlockedLevels.sort((a, b) => a.id - b.id)
          }
        })
      },
      
      updateLevelProgress: (levelId: number, stats: Partial<GameLevel>) => {
        set(state => {
          const level = state.unlockedLevels.find(l => l.id === levelId)
          if (level) {
            Object.assign(level, stats)
          }
        })
      },
      
      // Achievements and Progress
      unlockAchievement: (achievementId: string) => {
        set(state => {
          if (!state.playerStats.achievements.includes(achievementId)) {
            state.playerStats.achievements.push(achievementId)
          }
        })
      },
      
      updatePlayerStats: (stats: Partial<PlayerStats>) => {
        set(state => {
          Object.assign(state.playerStats, stats)
        })
      },
      
      // Preferences
      updatePreferences: (prefs: Partial<GamePreferences>) => {
        set(state => {
          Object.assign(state.preferences, prefs)
        })
      },
      
      // Persistence
      saveGame: async () => {
        set(state => {
          state.lastSaved = Date.now()
        })
        // The persist middleware handles actual saving
      },
      
      loadGame: async () => {
        set(state => {
          state.isLoading = false
        })
      },
      
      resetProgress: () => {
        set(state => {
          state.playerStats = { ...initialPlayerStats }
          state.unlockedLevels = []
          state.currentSession = null
          state.isPlaying = false
          state.availableTowers = []
          state.inventory = []
        })
      },
      
      // UI State
      setHoveredPosition: (pos: { x: number; y: number } | null) => {
        set(state => {
          state.hoveredPosition = pos
        })
      },
      
      toggleMenu: (menuId: string) => {
        set(state => {
          const index = state.activeMenus.indexOf(menuId)
          if (index >= 0) {
            state.activeMenus.splice(index, 1)
          } else {
            state.activeMenus.push(menuId)
          }
        })
      },
      
      closeAllMenus: () => {
        set(state => {
          state.activeMenus = []
          state.showUpgradeMenu = false
          state.selectedTower = null
        })
      }
    })),
    {
      name: 'omniverse-geckos-game-state',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        playerStats: state.playerStats,
        unlockedLevels: state.unlockedLevels,
        preferences: state.preferences,
        inventory: state.inventory,
        lastSaved: state.lastSaved
      })
    }
  )
)

// =============================================================================
// Selectors for Performance
// =============================================================================

export const gameSelectors = {
  currentSession: (state: GameState) => state.currentSession,
  isPlaying: (state: GameState) => state.isPlaying,
  playerLevel: (state: GameState) => state.playerStats.currentLevel,
  playerExperience: (state: GameState) => ({
    current: state.playerStats.currentExperience,
    required: state.playerStats.experienceToNext,
    percentage: (state.playerStats.currentExperience / state.playerStats.experienceToNext) * 100
  }),
  availableLevels: (state: GameState) => state.unlockedLevels,
  completedLevels: (state: GameState) => state.unlockedLevels.filter(l => l.completed),
  gameStatistics: (state: GameState) => state.currentSession?.statistics,
  activeTowers: (state: GameState) => state.currentSession?.towersPlaced || [],
  activeEnemies: (state: GameState) => state.currentSession?.enemies || []
}

// =============================================================================
// Auto-save Hook
// =============================================================================

import { useEffect } from 'react'

export function useAutoSave(interval: number = 30000) { // 30 seconds
  const saveGame = useGameStore(state => state.saveGame)
  const autoSaveEnabled = useGameStore(state => state.preferences.autoSave)
  
  useEffect(() => {
    if (!autoSaveEnabled) return
    
    const intervalId = setInterval(() => {
      saveGame()
    }, interval)
    
    return () => clearInterval(intervalId)
  }, [saveGame, autoSaveEnabled, interval])
}

export default useGameStore