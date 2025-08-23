import Phaser from 'phaser'
import { GameConfig } from '../core/GameConfig'
import { GeckoTower, GeckoNFTData } from '../entities/GeckoTower'
import { Enemy } from '../entities/Enemy'
import { WaveManager } from '../systems/WaveManager'
import { GameState } from '../systems/GameState'
import { PathSystem } from '../systems/PathSystem'

export class MainScene extends Phaser.Scene {
  private gameState: GameState
  private waveManager: WaveManager
  private pathSystem: PathSystem
  private towers: GeckoTower[] = []
  private enemies: Enemy[] = []
  private selectedTower: GeckoTower | null = null
  private placementMode: boolean = false
  private selectedNFT: GeckoNFTData | null = null
  
  // Graphics and UI
  private mapGraphics: Phaser.GameObjects.Graphics
  private pathGraphics: Phaser.GameObjects.Graphics
  private gridGraphics: Phaser.GameObjects.Graphics
  
  constructor() {
    super({ key: 'MainScene' })
  }

  init(): void {
    console.log('🦎 MainScene initialized')
  }

  create(): void {
    // Initialize game systems
    this.gameState = new GameState()
    this.pathSystem = new PathSystem()
    this.waveManager = new WaveManager(this, this.gameState)
    
    // Create the game world
    this.createMap()
    this.createPath()
    this.setupInput()
    this.setupEventListeners()
    
    // Start the UI scene overlay
    this.scene.launch('UIScene')
    
    console.log('MainScene created successfully')
  }

  private createMap(): void {
    // Create background
    this.add.rectangle(
      GameConfig.GAME_WIDTH / 2,
      GameConfig.GAME_HEIGHT / 2,
      GameConfig.GAME_WIDTH,
      GameConfig.GAME_HEIGHT,
      0x1a1a2e
    )
    
    // Create map graphics
    this.mapGraphics = this.add.graphics()
    this.drawMapElements()
    
    // Create placement grid
    this.gridGraphics = this.add.graphics()
    this.drawGrid()
  }

  private drawMapElements(): void {
    this.mapGraphics.clear()
    
    // Draw decorative elements
    this.mapGraphics.fillStyle(0x2d2d44)
    
    // Add some rocks and obstacles
    const obstacles = [
      { x: 200, y: 150, width: 60, height: 40 },
      { x: 600, y: 300, width: 80, height: 60 },
      { x: 300, y: 500, width: 50, height: 50 },
      { x: 800, y: 200, width: 70, height: 45 },
    ]
    
    obstacles.forEach(obstacle => {
      this.mapGraphics.fillRoundedRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height, 5)
    })
    
    // Add some grass patches
    this.mapGraphics.fillStyle(0x2d4a2d, 0.5)
    for (let i = 0; i < 15; i++) {
      const x = Phaser.Math.Between(50, GameConfig.GAME_WIDTH - 50)
      const y = Phaser.Math.Between(50, GameConfig.GAME_HEIGHT - 50)
      const size = Phaser.Math.Between(20, 40)
      this.mapGraphics.fillCircle(x, y, size)
    }
  }

  private createPath(): void {
    // Create the path that enemies will follow
    this.pathSystem.createPath([
      { x: 0, y: 300 },
      { x: 200, y: 300 },
      { x: 250, y: 250 },
      { x: 400, y: 250 },
      { x: 450, y: 350 },
      { x: 600, y: 350 },
      { x: 650, y: 400 },
      { x: 800, y: 400 },
      { x: 850, y: 300 },
      { x: GameConfig.GAME_WIDTH, y: 300 },
    ])
    
    // Draw the path
    this.pathGraphics = this.add.graphics()
    this.drawPath()
  }

  private drawPath(): void {
    const path = this.pathSystem.getPath()
    if (!path) return
    
    this.pathGraphics.clear()
    
    // Draw path background
    this.pathGraphics.lineStyle(40, 0x3a3a5c, 0.8)
    path.draw(this.pathGraphics)
    
    // Draw path surface
    this.pathGraphics.lineStyle(30, 0x4a4a6c, 1)
    path.draw(this.pathGraphics)
    
    // Draw path centerline
    this.pathGraphics.lineStyle(2, 0x6a6a8c, 0.5)
    path.draw(this.pathGraphics)
  }

  private drawGrid(): void {
    this.gridGraphics.clear()
    this.gridGraphics.lineStyle(1, 0x333333, 0.3)
    
    // Draw vertical lines
    for (let x = 0; x <= GameConfig.GAME_WIDTH; x += GameConfig.TILE_SIZE) {
      this.gridGraphics.lineBetween(x, 0, x, GameConfig.GAME_HEIGHT)
    }
    
    // Draw horizontal lines
    for (let y = 0; y <= GameConfig.GAME_HEIGHT; y += GameConfig.TILE_SIZE) {
      this.gridGraphics.lineBetween(0, y, GameConfig.GAME_WIDTH, y)
    }
    
    this.gridGraphics.setVisible(false)
  }

  private setupInput(): void {
    // Handle mouse/touch input
    this.input.on('pointerdown', this.onPointerDown, this)
    this.input.on('pointermove', this.onPointerMove, this)
    this.input.on('pointerup', this.onPointerUp, this)
    
    // Handle keyboard input
    this.input.keyboard?.on('keydown-ESC', this.onEscapePressed, this)
    this.input.keyboard?.on('keydown-SPACE', this.onSpacePressed, this)
    this.input.keyboard?.on('keydown-G', this.toggleGrid, this)
  }

  private setupEventListeners(): void {
    // Game state events
    this.events.on('start-wave', this.startWave, this)
    this.events.on('place-tower', this.enterPlacementMode, this)
    this.events.on('enemy-killed', this.onEnemyKilled, this)
    this.events.on('enemy-reached-goal', this.onEnemyReachedGoal, this)
    this.events.on('game-over', this.onGameOver, this)
    this.events.on('victory', this.onVictory, this)
    
    // Tower events
    this.events.on('tower-selected', this.onTowerSelected, this)
    this.events.on('tower-deselected', this.onTowerDeselected, this)
  }

  private onPointerDown(pointer: Phaser.Input.Pointer): void {
    const worldX = pointer.worldX
    const worldY = pointer.worldY
    
    if (this.placementMode && this.selectedNFT) {
      this.attemptTowerPlacement(worldX, worldY)
    } else {
      this.selectTowerAt(worldX, worldY)
    }
  }

  private onPointerMove(pointer: Phaser.Input.Pointer): void {
    if (this.placementMode && this.selectedNFT) {
      // Show placement preview
      this.updatePlacementPreview(pointer.worldX, pointer.worldY)
    }
  }

  private onPointerUp(pointer: Phaser.Input.Pointer): void {
    // Handle pointer up events if needed
  }

  private onEscapePressed(): void {
    if (this.placementMode) {
      this.exitPlacementMode()
    } else if (this.selectedTower) {
      this.deselectTower()
    }
  }

  private onSpacePressed(): void {
    // Pause/unpause game
    if (this.scene.isPaused()) {
      this.scene.resume()
    } else {
      this.scene.pause()
    }
  }

  private toggleGrid(): void {
    this.gridGraphics.setVisible(!this.gridGraphics.visible)
  }

  // Tower placement system
  private enterPlacementMode(nftData: GeckoNFTData): void {
    this.placementMode = true
    this.selectedNFT = nftData
    this.gridGraphics.setVisible(true)
    
    // Change cursor to indicate placement mode
    this.input.setDefaultCursor('crosshair')
  }

  private exitPlacementMode(): void {
    this.placementMode = false
    this.selectedNFT = null
    this.gridGraphics.setVisible(false)
    this.input.setDefaultCursor('default')
    
    // Hide placement preview
    this.hideePlacementPreview()
  }

  private attemptTowerPlacement(x: number, y: number): boolean {
    if (!this.selectedNFT || !this.canPlaceTowerAt(x, y)) {
      return false
    }
    
    // Snap to grid
    const gridX = Math.round(x / GameConfig.TILE_SIZE) * GameConfig.TILE_SIZE
    const gridY = Math.round(y / GameConfig.TILE_SIZE) * GameConfig.TILE_SIZE
    
    // Create and place the tower
    const tower = new GeckoTower(this, gridX, gridY, this.selectedNFT)
    this.towers.push(tower)
    
    // Deduct cost from player resources
    this.gameState.spendCoins(tower.getNFTData().type === 'LEGENDARY_GECKO' ? 200 : 50)
    
    // Exit placement mode
    this.exitPlacementMode()
    
    // Emit event for UI updates
    this.events.emit('tower-placed', tower)
    
    return true
  }

  private canPlaceTowerAt(x: number, y: number): boolean {
    // Check if position is on the path
    if (this.pathSystem.isOnPath(x, y, 40)) {
      return false
    }
    
    // Check if there's already a tower nearby
    const minDistance = GameConfig.TILE_SIZE
    for (const tower of this.towers) {
      const distance = Phaser.Math.Distance.Between(x, y, tower.x, tower.y)
      if (distance < minDistance) {
        return false
      }
    }
    
    // Check if position is within map bounds
    if (x < 32 || x > GameConfig.GAME_WIDTH - 32 ||
        y < 32 || y > GameConfig.GAME_HEIGHT - 32) {
      return false
    }
    
    return true
  }

  private updatePlacementPreview(x: number, y: number): void {
    // Implementation for showing placement preview
  }

  private hideePlacementPreview(): void {
    // Implementation for hiding placement preview
  }

  // Tower selection system
  private selectTowerAt(x: number, y: number): void {
    let selectedTower: GeckoTower | null = null
    let minDistance = Infinity
    
    // Find closest tower to click position
    for (const tower of this.towers) {
      const distance = Phaser.Math.Distance.Between(x, y, tower.x, tower.y)
      if (distance < 30 && distance < minDistance) {
        minDistance = distance
        selectedTower = tower
      }
    }
    
    if (selectedTower) {
      this.selectTower(selectedTower)
    } else {
      this.deselectTower()
    }
  }

  private selectTower(tower: GeckoTower): void {
    if (this.selectedTower) {
      this.deselectTower()
    }
    
    this.selectedTower = tower
    this.events.emit('tower-selected', tower)
  }

  private deselectTower(): void {
    if (this.selectedTower) {
      this.selectedTower = null
      this.events.emit('tower-deselected')
    }
  }

  private onTowerSelected(tower: GeckoTower): void {
    // Show tower range and UI
    tower.showRange()
  }

  private onTowerDeselected(): void {
    // Hide tower UI
  }

  // Wave and enemy management
  private startWave(): void {
    this.waveManager.startNextWave()
  }

  update(time: number, delta: number): void {
    // Update all game entities
    this.updateTowers(time, delta)
    this.updateEnemies(time, delta)
    this.waveManager.update(time, delta)
    this.gameState.update(time, delta)
    
    // Clean up destroyed entities
    this.cleanupEntities()
  }

  private updateTowers(time: number, delta: number): void {
    for (const tower of this.towers) {
      tower.update(time, this.enemies)
    }
  }

  private updateEnemies(time: number, delta: number): void {
    for (const enemy of this.enemies) {
      if (enemy.active) {
        enemy.update(time, delta)
      }
    }
  }

  private cleanupEntities(): void {
    // Remove destroyed enemies
    this.enemies = this.enemies.filter(enemy => enemy.active)
  }

  // Event handlers
  private onEnemyKilled(data: { enemy: Enemy; reward: number }): void {
    this.gameState.addCoins(data.reward)
    this.gameState.addScore(data.reward * 10)
    
    // Remove from enemies array
    const index = this.enemies.indexOf(data.enemy)
    if (index > -1) {
      this.enemies.splice(index, 1)
    }
  }

  private onEnemyReachedGoal(enemy: Enemy): void {
    this.gameState.loseLife()
    
    // Remove from enemies array
    const index = this.enemies.indexOf(enemy)
    if (index > -1) {
      this.enemies.splice(index, 1)
    }
    
    // Check for game over
    if (this.gameState.getLives() <= 0) {
      this.events.emit('game-over')
    }
  }

  private onGameOver(): void {
    this.scene.pause()
    this.scene.launch('GameOverScene', {
      score: this.gameState.getScore(),
      wave: this.gameState.getCurrentWave(),
      reason: 'lives-depleted',
    })
  }

  private onVictory(): void {
    this.scene.pause()
    this.scene.launch('GameOverScene', {
      score: this.gameState.getScore(),
      wave: this.gameState.getCurrentWave(),
      reason: 'victory',
    })
  }

  // Public methods for external access
  addEnemy(enemy: Enemy): void {
    this.enemies.push(enemy)
  }

  getGameState(): GameState {
    return this.gameState
  }

  getTowers(): GeckoTower[] {
    return this.towers
  }

  getEnemies(): Enemy[] {
    return this.enemies
  }

  getPath(): Phaser.Curves.Path | null {
    return this.pathSystem.getPath()
  }

  // Cleanup
  shutdown(): void {
    // Clean up resources
    this.towers = []
    this.enemies = []
    this.selectedTower = null
    this.placementMode = false
    this.selectedNFT = null
    
    super.shutdown()
  }
}