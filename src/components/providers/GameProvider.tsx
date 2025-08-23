'use client'

import { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react'
import { useAccount } from 'wagmi'
import { GameEngine } from '@/game/core/GameEngine'
import { GameState, GameSettings } from '@/game/types/GameTypes'

// =============================================================================
// Types
// =============================================================================

interface GameContextType {
  gameEngine: GameEngine | null
  gameState: GameState | null
  isGameLoaded: boolean
  isGameRunning: boolean
  settings: GameSettings
  startGame: () => Promise<void>
  pauseGame: () => void
  resumeGame: () => void
  restartGame: () => Promise<void>
  updateSettings: (newSettings: Partial<GameSettings>) => void
  getGameStats: () => any
}

interface GameProviderProps {
  children: ReactNode
}

// =============================================================================
// Default Values
// =============================================================================

const defaultSettings: GameSettings = {
  soundEnabled: true,
  musicEnabled: true,
  soundVolume: 0.8,
  musicVolume: 0.6,
  graphics: 'high',
  autoSave: true,
  showFPS: false,
  showDebug: false,
  language: 'en',
  controls: {
    pauseKey: 'Space',
    speedUpKey: 'Shift',
    zoomInKey: 'Equal',
    zoomOutKey: 'Minus'
  }
}

const defaultContextValue: GameContextType = {
  gameEngine: null,
  gameState: null,
  isGameLoaded: false,
  isGameRunning: false,
  settings: defaultSettings,
  startGame: async () => {},
  pauseGame: () => {},
  resumeGame: () => {},
  restartGame: async () => {},
  updateSettings: () => {},
  getGameStats: () => ({})
}

// =============================================================================
// Context
// =============================================================================

const GameContext = createContext<GameContextType>(defaultContextValue)

// =============================================================================
// Game Provider Component
// =============================================================================

export function GameProvider({ children }: GameProviderProps) {
  const { address, isConnected } = useAccount()
  const gameEngineRef = useRef<GameEngine | null>(null)
  
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [isGameLoaded, setIsGameLoaded] = useState(false)
  const [isGameRunning, setIsGameRunning] = useState(false)
  const [settings, setSettings] = useState<GameSettings>(defaultSettings)

  // Initialize game engine
  useEffect(() => {
    const initGameEngine = async () => {
      if (typeof window !== 'undefined' && !gameEngineRef.current) {
        try {
          const gameEngine = new GameEngine()
          await gameEngine.init()
          gameEngineRef.current = gameEngine
          setIsGameLoaded(true)

          // Set up game state listener
          gameEngine.onStateChange((newState: GameState) => {
            setGameState(newState)
            setIsGameRunning(newState.isRunning)
          })

          // Load user settings
          const savedSettings = localStorage.getItem('omniverse-geckos-settings')
          if (savedSettings) {
            const parsedSettings = JSON.parse(savedSettings)
            setSettings({ ...defaultSettings, ...parsedSettings })
          }

        } catch (error) {
          console.error('Failed to initialize game engine:', error)
        }
      }
    }

    initGameEngine()

    return () => {
      if (gameEngineRef.current) {
        gameEngineRef.current.destroy()
        gameEngineRef.current = null
        setIsGameLoaded(false)
        setIsGameRunning(false)
      }
    }
  }, [])

  // Save settings when they change
  useEffect(() => {
    localStorage.setItem('omniverse-geckos-settings', JSON.stringify(settings))
  }, [settings])

  // Game control functions
  const startGame = async () => {
    if (!gameEngineRef.current || !isConnected) return

    try {
      await gameEngineRef.current.startGame()
      setIsGameRunning(true)
    } catch (error) {
      console.error('Failed to start game:', error)
    }
  }

  const pauseGame = () => {
    if (!gameEngineRef.current) return
    
    gameEngineRef.current.pauseGame()
    setIsGameRunning(false)
  }

  const resumeGame = () => {
    if (!gameEngineRef.current) return
    
    gameEngineRef.current.resumeGame()
    setIsGameRunning(true)
  }

  const restartGame = async () => {
    if (!gameEngineRef.current) return

    try {
      await gameEngineRef.current.restartGame()
    } catch (error) {
      console.error('Failed to restart game:', error)
    }
  }

  const updateSettings = (newSettings: Partial<GameSettings>) => {
    const updatedSettings = { ...settings, ...newSettings }
    setSettings(updatedSettings)
    
    // Apply settings to game engine
    if (gameEngineRef.current) {
      gameEngineRef.current.updateSettings(updatedSettings)
    }
  }

  const getGameStats = () => {
    if (!gameEngineRef.current) return {}
    return gameEngineRef.current.getStats()
  }

  const contextValue: GameContextType = {
    gameEngine: gameEngineRef.current,
    gameState,
    isGameLoaded,
    isGameRunning,
    settings,
    startGame,
    pauseGame,
    resumeGame,
    restartGame,
    updateSettings,
    getGameStats
  }

  return (
    <GameContext.Provider value={contextValue}>
      {children}
    </GameContext.Provider>
  )
}

// =============================================================================
// Hook
// =============================================================================

export function useGame(): GameContextType {
  const context = useContext(GameContext)
  if (!context) {
    throw new Error('useGame must be used within a GameProvider')
  }
  return context
}

// =============================================================================
// Game State Hook
// =============================================================================

export function useGameState() {
  const { gameState } = useGame()
  return gameState
}

// =============================================================================
// Game Controls Hook
// =============================================================================

export function useGameControls() {
  const { startGame, pauseGame, resumeGame, restartGame, isGameRunning } = useGame()
  return {
    startGame,
    pauseGame,
    resumeGame,
    restartGame,
    isGameRunning
  }
}

// =============================================================================
// Game Settings Hook
// =============================================================================

export function useGameSettings() {
  const { settings, updateSettings } = useGame()
  return {
    settings,
    updateSettings
  }
}