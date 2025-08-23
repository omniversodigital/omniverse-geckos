import Phaser from 'phaser'
import { GameConfig } from './GameConfig'
import { MainScene } from '../scenes/MainScene'
import { PreloadScene } from '../scenes/PreloadScene'
import { UIScene } from '../scenes/UIScene'
import { MenuScene } from '../scenes/MenuScene'
import { GameOverScene } from '../scenes/GameOverScene'

export class GameEngine {
  private game: Phaser.Game | null = null
  private config: Phaser.Types.Core.GameConfig

  constructor(containerId: string) {
    this.config = {
      type: Phaser.AUTO,
      width: GameConfig.GAME_WIDTH,
      height: GameConfig.GAME_HEIGHT,
      parent: containerId,
      backgroundColor: '#1a1a2e',
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { x: 0, y: 0 },
          debug: process.env.NODE_ENV === 'development',
        },
      },
      scene: [
        PreloadScene,
        MenuScene,
        MainScene,
        UIScene,
        GameOverScene,
      ],
      render: {
        pixelArt: false,
        antialias: true,
      },
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        min: {
          width: 320,
          height: 240,
        },
        max: {
          width: 1920,
          height: 1080,
        },
      },
      audio: {
        disableWebAudio: false,
      },
    }
  }

  init(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.game = new Phaser.Game(this.config)
        this.game.events.once('ready', () => {
          console.log('🦎 Omniverse Geckos Game Engine initialized')
          resolve()
        })
      } catch (error) {
        console.error('Failed to initialize Game Engine:', error)
        reject(error)
      }
    })
  }

  destroy(): void {
    if (this.game) {
      this.game.destroy(true)
      this.game = null
      console.log('Game Engine destroyed')
    }
  }

  getGame(): Phaser.Game | null {
    return this.game
  }

  pause(): void {
    if (this.game) {
      this.game.scene.pause('MainScene')
    }
  }

  resume(): void {
    if (this.game) {
      this.game.scene.resume('MainScene')
    }
  }

  restart(): void {
    if (this.game) {
      this.game.scene.restart('MainScene')
    }
  }
}

// Singleton instance
let gameEngineInstance: GameEngine | null = null

export function getGameEngine(): GameEngine | null {
  return gameEngineInstance
}

export function initGameEngine(containerId: string): Promise<void> {
  if (gameEngineInstance) {
    gameEngineInstance.destroy()
  }
  gameEngineInstance = new GameEngine(containerId)
  return gameEngineInstance.init()
}

export function destroyGameEngine(): void {
  if (gameEngineInstance) {
    gameEngineInstance.destroy()
    gameEngineInstance = null
  }
}